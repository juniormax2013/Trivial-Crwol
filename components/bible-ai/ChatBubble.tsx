'use client';

import { motion } from 'framer-motion';
import { AIMessage, BibleReference } from '@/lib/bible-ai/types';
import { BookOpen } from 'lucide-react';

interface ChatBubbleProps {
  message: AIMessage;
  index: number;
}

export default function ChatBubble({ message, index }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  if (message.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end gap-2"
      >
        {/* AI avatar tiny */}
        <div className="w-8 h-8 rounded-xl bg-[#f5f3f7] border border-[#310065]/10 flex items-center justify-center flex-shrink-0">
          <BookOpen size={14} className="text-[#310065]" />
        </div>
        <div className="bg-white border border-[#310065]/10 rounded-3xl rounded-bl-lg px-5 py-4 shadow-sm">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#310065]/30"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, type: 'spring', damping: 20, stiffness: 300 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar bubble */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#310065] to-[#4a148c] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#310065]/20">
          <BookOpen size={14} className="text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Main bubble */}
        <div
          className={`px-5 py-3.5 shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-[#310065] to-[#4a148c] text-white rounded-3xl rounded-br-lg'
              : 'bg-white border border-[#310065]/8 text-[#1b1b1e] rounded-3xl rounded-bl-lg'
          }`}
        >
          <p
            className={`text-[14px] leading-relaxed font-medium whitespace-pre-wrap ${
              isUser ? 'text-white' : 'text-[#1b1b1e]'
            }`}
          >
            {message.content}
          </p>
        </div>

        {/* Bible references */}
        {!isUser && message.bibleReferences && message.bibleReferences.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {message.bibleReferences.map((ref, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full"
              >
                <BookOpen size={10} className="text-amber-600" />
                <span className="text-[11px] font-black text-amber-700">
                  {ref.book}
                  {ref.chapter ? ` ${ref.chapter}` : ''}
                  {ref.verse ? `:${ref.verse}` : ''}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Suggested questions */}
        {!isUser && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <div className="flex flex-col gap-1.5 w-full px-1">
            <p className="text-[10px] font-black text-[#310065]/40 uppercase tracking-widest ml-1">
              Preguntas relacionadas
            </p>
            {message.suggestedQuestions.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-left text-[12px] font-bold text-[#310065] bg-[#f5f3f7] hover:bg-[#310065]/8 px-4 py-2.5 rounded-2xl border border-[#310065]/8 transition-colors active:scale-[0.98]"
                onClick={() => {
                  // Dispatch a custom event that the page can listen to
                  window.dispatchEvent(
                    new CustomEvent('bible-ai-suggestion', { detail: { question: q } })
                  );
                }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className={`text-[9px] font-bold text-gray-300 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
