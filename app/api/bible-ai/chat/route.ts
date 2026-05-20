// ---------------------------------------------------------------
// BIBLE AI — SECURE CHAT API ROUTE
// POST /api/bible-ai/chat
// The GEMINI_API_KEY is server-only. Never exposed to the client.
// Firestore operations happen client-side in useBibleAI.ts hook.
// ---------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getBibleAIConfig } from '@/lib/bible-ai/repository';
import { searchBibleContext } from '@/lib/bible-ai/knowledge-base';
import { BibleReference } from '@/lib/bible-ai/types';

// ── System Prompt ──────────────────────────────────────────────

const BIBLE_SYSTEM_PROMPT = `Eres un Asistente Bíblico multilingüe dentro de una app de trivia bíblica cristiana. Tu misión es ayudar a los jugadores a aprender la Biblia de forma clara, respetuosa, educativa y espiritual.

REGLAS ESTRICTAS:
1. Solo puedes responder preguntas relacionadas con la Biblia, libros bíblicos, personajes bíblicos, versículos, historias, enseñanzas, contexto bíblico y temas cristianos directamente relacionados con la Biblia.
2. Si el usuario pregunta algo fuera del contexto bíblico, responde en su idioma: "Solo puedo ayudarte con temas relacionados con la Biblia."
3. NO inventes versículos. NO crees referencias falsas. Si usas un pasaje, menciona libro, capítulo y versículo.
4. NO digas "Dios me dijo", NO des profecías personales, NO reemplaces consejo pastoral, médico, legal o profesional.
5. NO afirmes certeza absoluta sobre temas donde existen múltiples interpretaciones teológicas honestas.
6. Mantén un tono amable, claro, profundo, respetuoso y fácil de entender.
7. Detecta el idioma del usuario y responde SIEMPRE en ese mismo idioma.
8. Si hay referencias bíblicas relevantes, inclúyelas en el formato: [REFS:Libro Cap:Ver, Libro Cap:Ver]
9. Al final de tu respuesta, sugiere 2-3 preguntas relacionadas en el formato: [SUGERIDAS: pregunta1 | pregunta2 | pregunta3]

IDIOMAS PRINCIPALES: español, inglés, francés, creole haitiano.`;

// ── Helper: Extract structured data from response ──────────────

function parseAIResponse(text: string): {
  answer: string;
  bibleReferences: BibleReference[];
  suggestedQuestions: string[];
} {
  let answer = text;
  const bibleReferences: BibleReference[] = [];
  const suggestedQuestions: string[] = [];

  const refsMatch = text.match(/\[REFS:(.*?)\]/s);
  if (refsMatch) {
    answer = answer.replace(refsMatch[0], '').trim();
    const refs = refsMatch[1].split(',').map(r => r.trim());
    refs.forEach(ref => {
      const parts = ref.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
      if (parts) {
        bibleReferences.push({
          book: parts[1].trim(),
          chapter: parts[2] ? parseInt(parts[2]) : undefined,
          verse: parts[3] ? parseInt(parts[3]) : undefined,
        });
      }
    });
  }

  const sugMatch = text.match(/\[SUGERIDAS:(.*?)\]/s);
  if (sugMatch) {
    answer = answer.replace(sugMatch[0], '').trim();
    const questions = sugMatch[1].split('|').map(q => q.trim()).filter(Boolean);
    suggestedQuestions.push(...questions.slice(0, 3));
  }

  return { answer: answer.trim(), bibleReferences, suggestedQuestions };
}

// ── POST Handler ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Verify API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured.');
      return NextResponse.json(
        { error: 'AI_DISABLED', message: 'El servicio de IA no está configurado.' },
        { status: 503 }
      );
    }

    // 2. Parse request
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'El mensaje no puede estar vacío.' },
        { status: 400 }
      );
    }

    // 3. Check Bible AI config (settings/bible_ai — public read allowed in Firestore rules)
    const config = await getBibleAIConfig();

    if (!config.aiBibleEnabled) {
      return NextResponse.json(
        { error: 'AI_DISABLED', message: 'El Asistente Bíblico no está disponible en este momento.' },
        { status: 403 }
      );
    }

    // 4. Search biblical context for RAG (pure in-memory — no Firestore)
    const bibleContext = searchBibleContext(message);

    // 5. Build prompt with context
    const promptWithContext = `CONTEXTO BÍBLICO RELEVANTE:\n${bibleContext}\n\n---\n\nPREGUNTA DEL USUARIO:\n${message}`;

    // 6. Call Gemini API (server-side only)
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptWithContext,
      config: {
        systemInstruction: BIBLE_SYSTEM_PROMPT,
        maxOutputTokens: 1024,
        temperature: 0.4,
      },
    });

    const rawText = response.text ?? '';

    // 7. Parse structured response
    const { answer, bibleReferences, suggestedQuestions } = parseAIResponse(rawText);

    // 8. Return
    return NextResponse.json({
      answer,
      bibleReferences,
      suggestedQuestions,
      dailyLimit: config.aiDailyLimit,
    });
  } catch (error: any) {
    // Handle rate limit error explicitly
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        { error: 'RATE_LIMIT', message: 'El servicio está ocupado en este momento. Por favor espera unos segundos e inténtalo de nuevo. 🙏' },
        { status: 429 }
      );
    }
    console.error('Bible AI chat error:', error);
    return NextResponse.json(
      { error: 'UNKNOWN', message: 'Ocurrió un error inesperado. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
