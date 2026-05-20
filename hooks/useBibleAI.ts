'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { AIMessage, VoiceState, BibleAIConfig } from '@/lib/bible-ai/types';
import {
  getBibleAIConfig,
  getUserDailyUsage,
  incrementDailyUsage,
  createConversation,
  saveMessage,
} from '@/lib/bible-ai/repository';

// ── Types ──────────────────────────────────────────────────────

interface UseBibleAIReturn {
  messages: AIMessage[];
  voiceState: VoiceState;
  isLoading: boolean;
  config: BibleAIConfig | null;
  conversationId: string | null;
  usageInfo: { questionsUsedToday: number; dailyLimit: number } | null;
  selectedLanguage: string;
  setLanguage: (lang: string) => void;
  sendMessage: (text: string, mode?: 'text' | 'voice') => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  clearMessages: () => void;
}

// ── Default messages ───────────────────────────────────────────

const WELCOME_MESSAGE: AIMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hola, soy tu Asistente Bíblico. Puedes preguntarme sobre libros, personajes, versículos, historias o enseñanzas de la Biblia. 🙏',
  mode: 'text',
  createdAt: new Date().toISOString(),
  suggestedQuestions: [
    '¿Quién fue Moisés?',
    'Explícame Juan 3:16',
    '¿Qué enseña el Salmo 23?',
  ],
};

// ── Hook ───────────────────────────────────────────────────────

export function useBibleAI(): UseBibleAIReturn {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<AIMessage[]>([WELCOME_MESSAGE]);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<BibleAIConfig | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<{ questionsUsedToday: number; dailyLimit: number } | null>(null);
  // Preferred language for voice input (auto-detected or user-selected)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    navigator?.language?.split('-')[0] || 'es'
  );

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load config on mount
  useEffect(() => {
    getBibleAIConfig().then(setConfig);
  }, []);

  // Update welcome message if config has custom greeting
  useEffect(() => {
    if (config?.aiWelcomeMessage) {
      setMessages([
        {
          ...WELCOME_MESSAGE,
          content: config.aiWelcomeMessage,
        },
      ]);
    }
  }, [config?.aiWelcomeMessage]);

  // ── Send message ─────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string, mode: 'text' | 'voice' = 'text') => {
      if (!text.trim() || isLoading) return;

      const userMsg: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        mode,
        createdAt: new Date().toISOString(),
      };

      const loadingMsg: AIMessage = {
        id: `loading-${Date.now()}`,
        role: 'assistant',
        content: '',
        mode,
        createdAt: new Date().toISOString(),
        isLoading: true,
      };

      setMessages(prev => [...prev, userMsg, loadingMsg]);
      setIsLoading(true);
      setVoiceState('thinking');

      try {
        // Check daily limit client-side first
        if (user?.uid) {
          const usage = await getUserDailyUsage(user.uid);
          const limit = config?.aiDailyLimit ?? 20;
          if (usage.questionsUsedToday >= limit) {
            const limitMsg: AIMessage = {
              id: `limit-${Date.now()}`,
              role: 'assistant',
              content: `Has alcanzado el límite de ${limit} preguntas por día. ¡Vuelve mañana para seguir aprendiendo! 🙏`,
              mode,
              createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev.slice(0, -1), limitMsg]);
            setVoiceState('idle');
            return;
          }
        }

        const res = await fetch('/api/bible-ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            language: navigator.language?.split('-')[0] || 'es',
          }),
        });

        const data: { answer: string; bibleReferences: any[]; suggestedQuestions: string[]; dailyLimit: number; error?: string; message?: string } = await res.json();

        if (!res.ok || data.error) {
          const errorMsg: AIMessage = {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: data.message || 'Ocurrió un error. Intenta de nuevo.',
            mode,
            createdAt: new Date().toISOString(),
          };
          setMessages(prev => [...prev.slice(0, -1), errorMsg]);
          setVoiceState('error');
          return;
        }

        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          bibleReferences: data.bibleReferences,
          suggestedQuestions: data.suggestedQuestions,
          mode,
          createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev.slice(0, -1), aiMsg]);

        // Client-side: save conversation + increment usage (user is authenticated here)
        if (user?.uid) {
          try {
            let convId = conversationId;
            if (!convId) {
              convId = await createConversation(user.uid, navigator.language?.split('-')[0] || 'es');
              setConversationId(convId);
            }
            await saveMessage(user.uid, convId, { role: 'user', content: text, mode });
            await saveMessage(user.uid, convId, { role: 'assistant', content: data.answer, bibleReferences: data.bibleReferences, mode });
            const newCount = await incrementDailyUsage(user.uid);
            setUsageInfo({ questionsUsedToday: newCount, dailyLimit: data.dailyLimit ?? config?.aiDailyLimit ?? 20 });
          } catch (saveErr) {
            // Non-blocking: log but don't interrupt the UX
            console.warn('Bible AI: could not save conversation to Firestore:', saveErr);
          }
        }

        // Auto-speak if voice mode
        if (mode === 'voice' && config?.aiVoiceEnabled) {
          speakText(data.answer);
        } else {
          setVoiceState('idle');
        }
      } catch (err) {
        console.error('Bible AI error:', err);
        const errMsg: AIMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
          mode,
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev.slice(0, -1), errMsg]);
        setVoiceState('error');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, user?.uid, conversationId, config]
  );


  // ── Language detection (from text content) ───────────────────

  const detectLanguage = useCallback((text: string): string => {
    const lower = text.toLowerCase();

    // Haitian Creole patterns
    const htPatterns = ['mwen', 'nou', 'yo', 'ak', 'nan', 'pou', 'ki', 'sa', 'gen', 'pa', 'te', 'ap', 'sé', 'dèyè', 'bondye', 'jezi', 'bib'];
    const htScore = htPatterns.filter(p => lower.includes(p)).length;

    // French patterns
    const frPatterns = ['je ', 'vous ', 'nous ', 'les ', 'des ', 'une ', 'que ', 'dans ', 'pour ', 'avec ', 'est ', 'sont ', 'très ', 'dieu', 'bible'];
    const frScore = frPatterns.filter(p => lower.includes(p)).length;

    // Spanish patterns
    const esPatterns = ['que ', 'los ', 'las ', 'una ', 'del ', 'con ', 'por ', 'para ', 'como ', 'este ', 'esta ', 'dios', 'biblia', 'jesús', 'moisés'];
    const esScore = esPatterns.filter(p => lower.includes(p)).length;

    // English patterns
    const enPatterns = ['the ', 'and ', 'is ', 'are ', 'was ', 'that ', 'with ', 'this ', 'god', 'bible', 'jesus', 'lord'];
    const enScore = enPatterns.filter(p => lower.includes(p)).length;

    const scores = { ht: htScore, fr: frScore, es: esScore, en: enScore };
    const detected = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0];
    return detected;
  }, []);

  // ── Smart voice selector ──────────────────────────────────────

  const getBestVoice = useCallback((lang: string): { voice: SpeechSynthesisVoice | null; bcp47: string } => {
    const voices = window.speechSynthesis.getVoices();

    // Language priority mappings: preferred lang tags in order of quality
    const langMap: Record<string, string[]> = {
      es: ['es-US', 'es-MX', 'es-419', 'es-ES', 'es'],
      fr: ['fr-FR', 'fr-CA', 'fr'],
      ht: ['fr-FR', 'fr-CA', 'fr'],  // Creole Haitian → French voice (closest match)
      en: ['en-US', 'en-GB', 'en-AU', 'en'],
    };

    // Voice quality keywords to prefer (neural/premium voices)
    const premiumKeywords = ['neural', 'enhanced', 'premium', 'natural', 'google', 'siri', 'microsoft'];

    const langCodes = langMap[lang] ?? langMap.es;

    // Try to find best voice for each code in priority order
    for (const code of langCodes) {
      const matching = voices.filter(v =>
        v.lang.toLowerCase().startsWith(code.toLowerCase())
      );

      if (matching.length === 0) continue;

      // Prefer premium/neural voices
      const premium = matching.find(v =>
        premiumKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
      if (premium) return { voice: premium, bcp47: premium.lang };

      // Prefer non-compact voices (usually higher quality)
      const nonCompact = matching.find(v => !v.name.toLowerCase().includes('compact'));
      if (nonCompact) return { voice: nonCompact, bcp47: nonCompact.lang };

      // Any matching voice
      return { voice: matching[0], bcp47: matching[0].lang };
    }

    // Fallback: no matching voice found, let browser decide
    return { voice: null, bcp47: langCodes[0] };
  }, []);

  // ── Speech parameters per language ───────────────────────────

  const getSpeechParams = (lang: string): { rate: number; pitch: number } => {
    switch (lang) {
      case 'es': return { rate: 0.88, pitch: 1.05 };   // Spanish: slightly slower, natural
      case 'fr': return { rate: 0.85, pitch: 1.0 };    // French: measured pace
      case 'ht': return { rate: 0.82, pitch: 1.0 };    // Haitian Creole via French voice: slower
      case 'en': return { rate: 0.90, pitch: 1.0 };    // English: standard
      default:   return { rate: 0.87, pitch: 1.0 };
    }
  };

  // ── Text to Speech (language-aware) ──────────────────────────

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const detectedLang = detectLanguage(text);
    const { rate, pitch } = getSpeechParams(detectedLang);

    const doSpeak = () => {
      const { voice, bcp47 } = getBestVoice(detectedLang);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;

      if (voice) utterance.voice = voice;

      utterance.onstart = () => setVoiceState('speaking');
      utterance.onend = () => setVoiceState('idle');
      utterance.onerror = (e) => {
        console.warn('TTS error:', e.error);
        setVoiceState('idle');
      };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setVoiceState('speaking');
    };

    // Voices may not be loaded yet (especially on mobile/Safari)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      // Wait for voices to load, then speak
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
      // Safety timeout: speak anyway after 1.5s even if event doesn't fire
      setTimeout(() => {
        if (voiceState !== 'speaking') doSpeak();
      }, 1500);
    }
  }, [detectLanguage, getBestVoice, voiceState]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceState('idle');
  }, []);

  // ── Speech to Text (language-aware) ─────────────────────────

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Safari.');
      return;
    }

    // Map language codes to BCP-47 with best STT locale
    const sttLangMap: Record<string, string> = {
      es: 'es-US',    // US Spanish — best STT coverage for Latin America
      fr: 'fr-FR',
      ht: 'fr-FR',    // Haitian Creole → French STT (closest available)
      en: 'en-US',
    };
    const sttLang = sttLangMap[selectedLanguage] ?? 'es-US';

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = sttLang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setVoiceState('listening');

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceState('transcribing');
      sendMessage(transcript, 'voice');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setVoiceState('error');
      setTimeout(() => setVoiceState('idle'), 2000);
    };

    recognition.onend = () => {
      if (voiceState === 'listening') setVoiceState('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [sendMessage, voiceState, selectedLanguage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState('idle');
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      config?.aiWelcomeMessage
        ? { ...WELCOME_MESSAGE, content: config.aiWelcomeMessage }
        : WELCOME_MESSAGE,
    ]);
    setConversationId(null);
  }, [config?.aiWelcomeMessage]);

  return {
    messages,
    voiceState,
    isLoading,
    config,
    conversationId,
    usageInfo,
    selectedLanguage,
    setLanguage: setSelectedLanguage,
    sendMessage,
    startListening,
    stopListening,
    stopSpeaking,
    clearMessages,
  };
}
