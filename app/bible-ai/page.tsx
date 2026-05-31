'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Square,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { useBibleAI } from '@/hooks/useBibleAI';
import BibleAIAvatar from '@/components/bible-ai/BibleAIAvatar';
import ChatBubble from '@/components/bible-ai/ChatBubble';

// ── Language options ───────────────────────────────────────────

const LANGUAGES = [
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'ht', flag: '🇭🇹', label: 'Kreyòl' },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    assistantTitle: 'Asistente Bíblico',
    notAvailable: 'No disponible',
    listening: '🎤 Escuchando...',
    thinking: '💭 Pensando...',
    responding: ' Respondiendo...',
    active: 'IA Bíblica activa',
    todayLimit: 'hoy',
    notAvailableDesc: 'El Asistente Bíblico no está disponible en este momento. Por favor intenta más tarde.',
    placeholder: 'Pregunta cualquier cosa sobre la Biblia',
    voiceListening: '🎤 Escuchando en {lang} — toca para detener',
    voiceSpeaking: '🔊 Hablando — toca el cuadrado para detener',
    voiceIdle: '🎙 Habla en {lang} · botón micrófono',
    browserNoSupport: 'Tu navegador no soporta reconocimiento de voz. Usa Chrome o Safari.'
  },
  en: {
    assistantTitle: 'Bible Assistant',
    notAvailable: 'Not available',
    listening: '🎤 Listening...',
    thinking: '💭 Thinking...',
    responding: ' Responding...',
    active: 'Biblical AI active',
    todayLimit: 'today',
    notAvailableDesc: 'The Bible Assistant is not available at this moment. Please try again later.',
    placeholder: 'Ask anything about the Bible',
    voiceListening: '🎤 Listening in {lang} — tap to stop',
    voiceSpeaking: '🔊 Speaking — tap the square to stop',
    voiceIdle: '🎙 Speak in {lang} · microphone button',
    browserNoSupport: 'Your browser does not support speech recognition. Use Chrome or Safari.'
  },
  fr: {
    assistantTitle: 'Assistant Biblique',
    notAvailable: 'Non disponible',
    listening: '🎤 Écoute...',
    thinking: '💭 Pensée...',
    responding: ' Réponse...',
    active: 'IA Biblique active',
    todayLimit: 'aujourd\'hui',
    notAvailableDesc: 'L\'assistant biblique n\'est pas disponible pour le moment. Veuillez réessayer plus tard.',
    placeholder: 'Posez n\'importe quelle question sur la Bible',
    voiceListening: '🎤 Écoute en {lang} — appuyez pour arrêter',
    voiceSpeaking: '🔊 Parole — appuyez sur le carré pour arrêter',
    voiceIdle: '🎙 Parlez en {lang} · bouton micro',
    browserNoSupport: 'Votre navigateur ne prend pas en charge la reconnaissance vocale. Utilisez Chrome ou Safari.'
  },
  ht: {
    assistantTitle: 'Asistan Bib',
    notAvailable: 'Pa disponib',
    listening: '🎤 Ap tande...',
    thinking: '💭 Ap panse...',
    responding: ' Ap reponn...',
    active: 'IA Bib la aktif',
    todayLimit: 'jodi a',
    notAvailableDesc: 'Asistan Bib la pa disponib nan moman sa a. Tanpri reyezi pita.',
    placeholder: 'Poze nenpòt kesyon sou Bib la',
    voiceListening: '🎤 Ap tande nan {lang} — manyen pou kanpe',
    voiceSpeaking: '🔊 Ap pale — manyen kare a pou kanpe',
    voiceIdle: '🎙 Pale nan {lang} · bouton mikwofòn',
    browserNoSupport: 'Navigatè w la pa sipòte rekonesans vwa. Sèvi ak Chrome oswa Safari.'
  }
};

export default function BibleAIPage() {
  const router = useRouter();
  const {
    messages,
    voiceState,
    isLoading,
    config,
    usageInfo,
    selectedLanguage,
    setLanguage,
    sendMessage,
    startListening,
    stopListening,
    stopSpeaking,
    clearMessages,
  } = useBibleAI();

  const [inputText, setInputText] = useState('');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for suggested question clicks
  useEffect(() => {
    const handler = (e: Event) => {
      const question = (e as CustomEvent).detail?.question;
      if (question) {
        setInputText(question);
        inputRef.current?.focus();
      }
    };
    window.addEventListener('bible-ai-suggestion', handler);
    return () => window.removeEventListener('bible-ai-suggestion', handler);
  }, []);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    sendMessage(text, 'text');
    setInputText('');
  }, [inputText, isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (voiceState === 'listening') {
      stopListening();
    } else if (voiceState === 'speaking') {
      stopSpeaking();
    } else {
      startListening();
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLanguage) ?? LANGUAGES[0];
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.es;
  const isVoiceActive = voiceState === 'listening';
  const isAIDisabled = config && !config.aiBibleEnabled;
  const isVoiceEnabled = config?.aiVoiceEnabled !== false;

  // Quick prompts per language
  const quickPrompts: Record<string, string[]> = {
    es: ['¿Quién fue Moisés?', 'Juan 3:16', 'Salmo 23', '¿Qué es la fe?', '¿Qué es el amor según la Biblia?'],
    en: ['Who was Moses?', 'John 3:16', 'Psalm 23', 'What is faith?', 'What does the Bible say about love?'],
    fr: ['Qui était Moïse?', 'Jean 3:16', 'Psaume 23', 'Qu\'est-ce que la foi?', 'Qu\'est-ce que l\'amour selon la Bible?'],
    ht: ['Ki moun Moyiz te ye?', 'Jan 3:16', 'Sòm 23', 'Kisa lafwa ye?', 'Kisa Bib la di sou lanmou?'],
  };
  const prompts = quickPrompts[selectedLanguage] ?? quickPrompts.es;

  return (
    <div
      className="flex flex-col min-h-screen bg-[#faf9fc] font-sans"
      style={{ maxWidth: 640, margin: '0 auto' }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-[#310065]/5 pt-safe"
        style={{ maxWidth: 640, margin: '0 auto' }}
      >
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-[#f5f3f7] flex items-center justify-center text-[#310065] active:scale-90 transition-transform"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>

          <div className="text-center">
            <h1 className="text-[15px] font-black text-[#310065] tracking-tight">
              {t.assistantTitle}
            </h1>
            <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest">
              {isAIDisabled
                ? t.notAvailable
                : voiceState === 'listening'
                ? t.listening
                : voiceState === 'thinking' || voiceState === 'transcribing'
                ? t.thinking
                : voiceState === 'speaking'
                ? t.responding
                : t.active}
            </p>
          </div>

          <button
            onClick={clearMessages}
            className="w-10 h-10 rounded-2xl bg-[#f5f3f7] flex items-center justify-center text-[#7c7483] active:scale-90 transition-transform"
          >
            <Trash2 size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Usage bar */}
        {usageInfo && (
          <div className="px-4 pb-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-[#f5f3f7] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#310065] to-[#7b1fa2] rounded-full transition-all"
                style={{ width: `${(usageInfo.questionsUsedToday / usageInfo.dailyLimit) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-[#7c7483] whitespace-nowrap">
              {usageInfo.questionsUsedToday}/{usageInfo.dailyLimit} {t.todayLimit}
            </span>
          </div>
        )}
      </header>

      {/* ── Content Area ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pt-[80px] pb-[160px] px-4">

        {/* Disabled State */}
        {isAIDisabled ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 text-center px-8">
            <div className="w-20 h-20 rounded-3xl bg-[#f5f3f7] flex items-center justify-center">
              <BookOpen size={36} className="text-gray-300" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-[#310065] mb-2">
                {t.notAvailable}
              </h2>
              <p className="text-[14px] text-[#7c7483] font-medium leading-relaxed">
                {t.notAvailableDesc}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Avatar section */}
            <div className="pt-4 pb-10">
              <BibleAIAvatar voiceState={voiceState} disabled={isAIDisabled || false} />
              <div className="mt-10 text-center space-y-1">
                <h2 className="text-[20px] font-black text-[#310065] tracking-tight">
                  {t.assistantTitle}
                </h2>
                <p className="text-[13px] font-medium text-[#7c7483]">
                  {t.placeholder}
                </p>
              </div>
            </div>

            {/* Chat messages */}
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <ChatBubble key={msg.id} message={msg} index={i} />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </main>

      {/* ── Input Bar ───────────────────────────────────────────── */}
      {!isAIDisabled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-[#310065]/5 pb-safe"
          style={{ maxWidth: 640, margin: '0 auto' }}
        >
          <div className="px-4 py-3 space-y-2">

            {/* Top row: language picker + quick prompts */}
            <div className="flex items-center gap-2">
              {/* Language selector */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowLangPicker(p => !p)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f5f3f7] border border-[#310065]/10 rounded-xl text-[12px] font-black text-[#310065] active:scale-95 transition-transform"
                >
                  <span className="text-[14px]">{currentLang.flag}</span>
                  <span>{currentLang.label}</span>
                </button>

                {/* Language dropdown */}
                <AnimatePresence>
                  {showLangPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="absolute bottom-[44px] left-0 bg-white rounded-2xl shadow-2xl shadow-[#310065]/15 border border-[#310065]/8 overflow-hidden z-50 min-w-[160px]"
                    >
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => { setLanguage(lang.code); setShowLangPicker(false); }}
                          className={`flex items-center gap-3 w-full px-4 py-3 text-[13px] font-bold transition-colors ${
                            selectedLanguage === lang.code
                              ? 'bg-[#310065] text-white'
                              : 'text-[#1b1b1e] hover:bg-[#f5f3f7]'
                          }`}
                        >
                          <span className="text-[16px]">{lang.flag}</span>
                          {lang.label}
                          {lang.code === 'ht' && (
                            <span className="ml-auto text-[9px] opacity-60 font-bold">via fr</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick prompts scroll */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
                {prompts.map(q => (
                  <button
                    key={q}
                    onClick={() => { setInputText(q); inputRef.current?.focus(); setShowLangPicker(false); }}
                    className="flex-shrink-0 text-[10px] font-bold text-[#310065] bg-[#f5f3f7] hover:bg-[#310065]/8 px-2.5 py-1.5 rounded-xl border border-[#310065]/8 transition-colors whitespace-nowrap active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input row */}
            <div className="flex items-end gap-2">
              {/* Voice button */}
              {isVoiceEnabled && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleVoiceToggle}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md transition-colors ${
                    isVoiceActive
                      ? 'bg-blue-500 text-white shadow-blue-500/30'
                      : voiceState === 'speaking'
                      ? 'bg-amber-500 text-white shadow-amber-500/30'
                      : 'bg-[#f5f3f7] text-[#310065]'
                  }`}
                >
                  {voiceState === 'speaking' ? (
                    <Square size={18} fill="currentColor" />
                  ) : isVoiceActive ? (
                    <MicOff size={20} strokeWidth={2.5} />
                  ) : (
                    <Mic size={20} strokeWidth={2.5} />
                  )}
                </motion.button>
              )}

              {/* Text input */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedLanguage === 'en' ? 'Ask a biblical question...' :
                    selectedLanguage === 'fr' ? 'Posez une question biblique...' :
                    selectedLanguage === 'ht' ? 'Poze yon kesyon biblik...' :
                    'Escribe tu pregunta bíblica...'
                  }
                  rows={1}
                  disabled={isLoading || voiceState === 'listening'}
                  className="w-full resize-none bg-[#f5f3f7] border border-[#310065]/10 rounded-2xl px-4 py-3 text-[14px] font-medium text-[#1b1b1e] placeholder:text-[#cdc3d4] focus:outline-none focus:border-[#310065]/30 focus:ring-2 focus:ring-[#310065]/10 transition-all max-h-28 leading-relaxed disabled:opacity-50"
                  style={{ minHeight: 48 }}
                />
              </div>

              {/* Send button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#310065] to-[#4a148c] text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#310065]/25 disabled:opacity-40 disabled:shadow-none transition-all"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <Send size={18} strokeWidth={2.5} />
                )}
              </motion.button>
            </div>

            {/* Voice hint */}
            {isVoiceEnabled && (
              <p className="text-center text-[10px] font-bold text-[#7c7483] uppercase tracking-widest">
                {isVoiceActive
                  ? t.voiceListening.replace('{lang}', currentLang.label)
                  : voiceState === 'speaking'
                  ? t.voiceSpeaking
                  : t.voiceIdle.replace('{lang}', currentLang.label)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
