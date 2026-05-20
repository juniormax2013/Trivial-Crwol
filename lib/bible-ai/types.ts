// ---------------------------------------------------------------
// BIBLE AI MODULE — TYPESCRIPT TYPES
// ---------------------------------------------------------------

export interface BibleAIConfig {
  aiBibleEnabled: boolean;
  aiVoiceEnabled: boolean;
  aiStrictBibleOnly: boolean;
  aiShowBibleReferences: boolean;
  aiMultilanguageEnabled: boolean;
  autoDetectLanguage: boolean;
  aiDailyLimit: number;
  aiAllowedLanguages: string[];
  defaultAiLanguage: string;
  aiWelcomeMessage: string;
  updatedAt?: string;
}

export const DEFAULT_BIBLE_AI_CONFIG: BibleAIConfig = {
  aiBibleEnabled: true,
  aiVoiceEnabled: true,
  aiStrictBibleOnly: true,
  aiShowBibleReferences: true,
  aiMultilanguageEnabled: true,
  autoDetectLanguage: true,
  aiDailyLimit: 20,
  aiAllowedLanguages: ['es', 'en', 'fr', 'ht'],
  defaultAiLanguage: 'es',
  aiWelcomeMessage:
    'Hola, soy tu Asistente Bíblico. Puedes preguntarme sobre libros, personajes, versículos, historias o enseñanzas de la Biblia.',
};

// ── Conversation & Messages ────────────────────────────────────

export type MessageRole = 'user' | 'assistant';
export type ChatMode = 'text' | 'voice';

export interface BibleReference {
  book: string;
  chapter?: number;
  verse?: number;
  text?: string;
}

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  bibleReferences?: BibleReference[];
  suggestedQuestions?: string[];
  mode: ChatMode;
  createdAt: string;
  isLoading?: boolean;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  messages: AIMessage[];
}

// ── Voice State ────────────────────────────────────────────────

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'thinking'
  | 'speaking'
  | 'stopped'
  | 'error';

// ── API Request / Response ────────────────────────────────────

export interface ChatRequest {
  message: string;
  language?: string;
  conversationId?: string;
}

export interface ChatResponse {
  answer: string;
  bibleReferences: BibleReference[];
  suggestedQuestions: string[];
  conversationId: string;
  usageInfo?: {
    questionsUsedToday: number;
    dailyLimit: number;
  };
}

export interface ChatErrorResponse {
  error: 'AI_DISABLED' | 'DAILY_LIMIT_REACHED' | 'NOT_BIBLICAL' | 'UNKNOWN';
  message: string;
}

// ── Daily Usage ────────────────────────────────────────────────

export interface DailyUsage {
  questionsUsedToday: number;
  lastRequestAt: string;
  date: string;
}
