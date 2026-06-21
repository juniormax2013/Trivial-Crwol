import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually if not in process.env
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      // remove surrounding quotes if any
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
}

// Initialize Gemini client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY no configurado en las variables de entorno ni en .env.local.");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

const CATEGORY_NAMES: Record<string, Record<string, string>> = {
  "pentateuco": { es: "Pentateuco", fr: "Loi / Pentateuque", ht: "Pentatèk / Lalwa" },
  "historia": { es: "Historia de Israel", fr: "Histoire d'Israël", ht: "Istwa Izrayèl" },
  "sabiduria": { es: "Sabiduría y Poesía", fr: "Sagesse et Poésie", ht: "Sajès ak Pwezi" },
  "profetas-mayores": { es: "Profetas Mayores", fr: "Grands Prophètes", ht: "Gwo Pwofèt yo" },
  "profetas-menores": { es: "Profetas Menores", fr: "Petits Prophètes", ht: "Ti Pwofèt yo" },
  "cartas-pablo": { es: "Epístolas de Pablo", fr: "Épîtres de Paul", ht: "Lèt Pòl yo" },
  "cartas-generales": { es: "Epístolas Generales", fr: "Épîtres Générales", ht: "Lèt Jeneral yo" },
  "apocalipsis": { es: "Apocalipsis", fr: "Apocalypse", ht: "Apokalips" },
  "personajes": { es: "Personajes", fr: "Personnages Bibliques", ht: "Pèsonaj" },
  "lugares": { es: "Lugares Bíblicos", fr: "Lieux Bibliques", ht: "Kote (Lye)" },
  "eventos": { es: "Eventos Bíblicos", fr: "Événements Bibliques", ht: "Evènman" },
  "temas": { es: "Temas Bíblicos", fr: "Thèmes Bibliques", ht: "Tèm" },
  "genesis": { es: "Génesis", fr: "Genèse", ht: "Jenèz" },
  "exodo": { es: "Éxodo", fr: "Exode", ht: "Egzòd" },
  "reyes": { es: "Reyes y Profetas", fr: "Rois et Prophètes", ht: "Wa yo ak Pwofèt yo" },
  "salmos": { es: "Salmos", fr: "Psaumes", ht: "Sòm yo" },
  "milagros": { es: "Milagros de Jesús", fr: "Miracles de Jésus", ht: "Mirak Jezi yo" },
  "parabolas": { es: "Parábolas de Jesús", fr: "Paraboles de Jésus", ht: "Parabòl Jezi yo" },
  "mujeres": { es: "Mujeres de la Biblia", fr: "Femmes de la Bible", ht: "Fanm nan Bib la" },
  "personajes-at": { es: "Personajes del Antiguo Testamento", fr: "Ancien Testament", ht: "Pèsonaj Ansyen Testaman" },
  "doctrina": { es: "Doctrina Bíblica", fr: "Doctrine Biblique", ht: "Doktrin Biblik" },
  "evangelios": { es: "Evangelios", fr: "Évangiles", ht: "Bòn Nouvèl (Evanjil)" },
  "vida-cristiana": { es: "Vida Cristiana", fr: "Vie Chrétienne", ht: "Lavi Kretyen" },
  "iglesia": { es: "La Iglesia", fr: "Église", ht: "Legliz" },
  "espiritu-santo": { es: "El Espíritu Santo", fr: "Saint-Esprit", ht: "Sentespri" },
  "escatologia": { es: "Escatología", fr: "Eschatologie", ht: "Eskatoloji" },
  "mision": { es: "La Misión", fr: "Mission", ht: "Misyon" },
  "ley-moral": { es: "Ley Moral", fr: "Loi Morale", ht: "Lwa Moral" },
  "nuevo-testamento": { es: "Nuevo Testamento (General)", fr: "Nouveau Testament (Général)", ht: "Nouvo Testaman (Jeneral)" },
  "hechos": { es: "Hechos de los Apóstoles", fr: "Actes des Apôtres", ht: "Travay Apòt yo" },
  "tabernakulo": { es: "Tabernáculo y Templo", fr: "Tabernacle et Temple", ht: "Tabènak ak Tanp" },
  "lideres": { es: "Líderes Bíblicos", fr: "Leaders Bibliques", ht: "Lidè nan Bib la" },
  "personajes-nt": { es: "Personajes del Nuevo Testamento", fr: "Nouveau Testament", ht: "Pèsonaj Nouvo Testaman" },
  "viajes-pablo": { es: "Viajes de Pablo", fr: "Voyages de Paul", ht: "Vwayaj Pòl yo" },
  "cultura": { es: "Cultura y Sociedad", fr: "Culture et Société", ht: "Kilti ak Sosyete" },
  "oracion": { es: "La Oración", fr: "Prière", ht: "Lapriyè" },
  "at-general": { es: "Antiguo Testamento (General)", fr: "Ancien Testament (Général)", ht: "Ansyen Testaman (Jeneral)" },
  "intertestamentario": { es: "Período Intertestamentario", fr: "Période Intertestamentaire", ht: "Peryòd Entètestamantè" },
  "guerras": { es: "Guerras y Batallas", fr: "Guerres et Batallas", ht: "Lagè ak Batay" }
};

interface DuelQuestionOption {
  id: string;
  text: string;
}

interface DuelQuestion {
  id: string;
  questionText: string;
  categoryId: string;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  options: DuelQuestionOption[];
  correctOptionId: string;
  explanation: string;
  bibleReference: string;
}

// File paths
const esPath = path.resolve(__dirname, '../lib/duel/questionsES.ts');
const frPath = path.resolve(__dirname, '../lib/duel/questionsFR_standardized.ts');
const htPath = path.resolve(__dirname, '../lib/duel/questionsHT_standardized.ts');
const progressPath = path.resolve(__dirname, 'generation_progress.json');

// Read files helper
function loadExistingQuestions(filePath: string): DuelQuestion[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  // Simple extraction of objects inside array
  const matches = content.match(/\{\s*id\s*:[\s\S]*?\}/g);
  if (!matches) return [];
  
  return matches.map(m => {
    try {
      // Convert single quote keys or standard JS object structure to parseable string
      const jsObj = eval(`(${m})`);
      return jsObj as DuelQuestion;
    } catch {
      return null;
    }
  }).filter(Boolean) as DuelQuestion[];
}

async function generateBatch(
  categoryId: string,
  categoryName: string,
  lang: string,
  count: number,
  existingTexts: Set<string>
): Promise<Omit<DuelQuestion, 'id'>[]> {
  const languageNames: Record<string, string> = {
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    ht: 'Haitian Creole (Kreyòl Ayisyen)'
  };
  
  const systemPrompt = `You are a biblical scholar and trivia master. Generate exactly ${count} unique Bible trivia questions in the language: ${languageNames[lang]}.
Category: ${categoryName} (ID: ${categoryId}).
Make sure to mix difficulties: easy, medium, and hard.
Every question must contain:
1. questionText: Clear, concise trivia question.
2. difficulty: "easy" | "medium" | "hard"
3. options: Array of exactly 4 options. Option IDs must be "a", "b", "c", "d".
4. correctOptionId: Must match the ID of the correct option ("a", "b", "c", "d").
5. explanation: A helpful context explaining why the option is correct.
6. bibleReference: Exact biblical reference (e.g. Genesis 1:1).

Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "questionText": "string",
      "difficulty": "easy" | "medium" | "hard",
      "options": [{"id": "a" | "b" | "c" | "d", "text": "string"}],
      "correctOptionId": "a" | "b" | "c" | "d",
      "explanation": "string",
      "bibleReference": "string"
    }
  ]
}

Ensure the questions are accurate and do not duplicate any of these existing questions:
${Array.from(existingTexts).slice(0, 30).join('\n')}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const parsed = JSON.parse(response.text ?? '{}');
    return parsed.questions || [];
  } catch (error) {
    console.error(`Error generating batch for ${categoryId} (${lang}):`, error);
    return [];
  }
}

async function main() {
  console.log("Cargando preguntas existentes...");
  const esQuestions = loadExistingQuestions(esPath);
  const frQuestions = loadExistingQuestions(frPath);
  const htQuestions = loadExistingQuestions(htPath);

  console.log(`Preguntas cargadas: ES: ${esQuestions.length}, FR: ${frQuestions.length}, HT: ${htQuestions.length}`);

  // Load progress if exists
  let progress: Record<string, Record<string, DuelQuestion[]>> = {};
  if (fs.existsSync(progressPath)) {
    try {
      progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
      console.log("Progreso de generación anterior cargado.");
    } catch {
      progress = {};
    }
  }

  const languages = ['es', 'fr', 'ht'];
  const categories = Object.keys(CATEGORY_NAMES);

  for (const lang of languages) {
    if (!progress[lang]) progress[lang] = {};
    
    // Choose appropriate base array
    const baseList = lang === 'es' ? esQuestions : lang === 'fr' ? frQuestions : htQuestions;
    
    for (const catId of categories) {
      if (!progress[lang][catId]) progress[lang][catId] = [];
      
      const categoryName = CATEGORY_NAMES[catId][lang];
      const existingInCat = baseList.filter(q => q.categoryId === catId);
      const generatedInCat = progress[lang][catId];
      const totalInCat = existingInCat.length + generatedInCat.length;

      if (totalInCat >= 100) {
        console.log(`[${lang.toUpperCase()}] Categoría '${catId}' ya tiene ${totalInCat} preguntas. Omitiendo.`);
        continue;
      }

      const missing = 100 - totalInCat;
      console.log(`[${lang.toUpperCase()}] Generando ${missing} preguntas para la categoría '${catId}'...`);

      const existingTexts = new Set([
        ...existingInCat.map(q => q.questionText),
        ...generatedInCat.map(q => q.questionText)
      ]);

      let generatedCount = 0;
      const newQuestions: DuelQuestion[] = [];

      // Generate in batches of 15 to respect model limits
      while (generatedCount < missing) {
        const batchSize = Math.min(15, missing - generatedCount);
        console.log(`  -> Solicitando lote de ${batchSize} preguntas...`);
        
        const batch = await generateBatch(catId, categoryName, lang, batchSize, existingTexts);
        
        if (batch.length === 0) {
          console.log("  ⚠️ No se generaron preguntas en este lote, reintentando en 5 segundos...");
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        for (const item of batch) {
          if (existingTexts.has(item.questionText)) continue;
          existingTexts.add(item.questionText);
          
          const qId = `dq-${catId.substring(0, 4)}-${lang}-${baseList.length + newQuestions.length + generatedInCat.length + 1}`.replace('_', '-');
          
          newQuestions.push({
            id: qId,
            questionText: item.questionText,
            categoryId: catId,
            categoryName: CATEGORY_NAMES[catId][lang],
            difficulty: item.difficulty,
            language: lang,
            options: item.options,
            correctOptionId: item.correctOptionId,
            explanation: item.explanation,
            bibleReference: item.bibleReference
          });
          generatedCount++;
        }

        console.log(`  -> Generadas ${generatedCount}/${missing} preguntas para ${catId} (${lang})`);
        
        // Wait 1 second between batches to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      progress[lang][catId] = [...generatedInCat, ...newQuestions];
      fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
      console.log(`[${lang.toUpperCase()}] Guardado progreso para categoría '${catId}'.`);
    }
  }

  // Write finalized lists back to the files
  console.log("Escribiendo resultados finales a los archivos TS...");

  writeFinalList(esPath, 'QUESTIONS_PENTATEUCO_ES', esQuestions, progress['es']);
  writeFinalList(frPath, 'ALL_QUESTIONS_FR', frQuestions, progress['fr']);
  writeFinalList(htPath, 'ALL_QUESTIONS_HT', htQuestions, progress['ht']);

  console.log("¡Todo listo! Las preguntas han sido completadas a 100 por categoría en cada idioma.");
}

function writeFinalList(
  filePath: string,
  exportName: string,
  originalList: DuelQuestion[],
  generatedMap: Record<string, DuelQuestion[]>
) {
  // Combine original with generated
  const combined = [...originalList];
  for (const catId of Object.keys(generatedMap)) {
    combined.push(...generatedMap[catId]);
  }

  // Format array to TS style matching existing structure
  const formattedItems = combined.map(q => {
    const optsStr = JSON.stringify(q.options).replace(/"id":/g, 'id:').replace(/"text":/g, 'text:');
    return `  { id:'${q.id}', questionText:\`${q.questionText.replace(/`/g, '\\`').replace(/\n/g, ' ')}\`, categoryId:'${q.categoryId}', categoryName:'${q.categoryName}', difficulty:'${q.difficulty}', language:'${q.language}',
    options:${optsStr}, correctOptionId:'${q.correctOptionId}',
    explanation:\`${q.explanation.replace(/`/g, '\\`').replace(/\n/g, ' ')}\`, bibleReference:'${q.bibleReference}' }`;
  });

  const content = `import { DuelQuestion } from './models';

export const ${exportName}: DuelQuestion[] = [
${formattedItems.join(',\n')}
];
`;

  fs.writeFileSync(filePath, content, 'utf-8');
}

main().catch(console.error);
