'use client';

import { useState } from 'react';
import { Send, Loader2, Smile } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import AnimatedEmoji, { ANIMATED_EMOJIS } from './AnimatedEmoji';

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { language } = useLanguage();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || cleanText.length > 500 || isSending || cooldown || disabled) return;

    try {
      setIsSending(true);
      await onSendMessage(cleanText);
      setText('');
      // Cooldown spam protection (1 second)
      setCooldown(true);
      setTimeout(() => {
        setCooldown(false);
      }, 1000);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiSelect = async (emojiId: string) => {
    if (isSending || cooldown || disabled) return;
    try {
      setIsSending(true);
      await onSendMessage(`[animated-emoji:${emojiId}]`);
      setShowEmojiPicker(false);
      // Cooldown spam protection
      setCooldown(true);
      setTimeout(() => {
        setCooldown(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to send emoji:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getPlaceholder = () => {
    switch (language) {
      case 'es':
        return 'Escribe un mensaje sagrado...';
      case 'fr':
        return 'Écrivez un message sacré...';
      case 'ht':
      default:
        return 'Ekri yon mesaj sakre...';
    }
  };

  const maxLength = 500;
  const isButtonDisabled = !text.trim() || text.length > maxLength || isSending || cooldown || disabled;

  return (
    <div className="px-4 py-3 bg-transparent relative z-40 pb-safe">
      {/* iOS Style Floating Emoji Picker Sheet */}
      {showEmojiPicker && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setShowEmojiPicker(false)}
          />
          <div className="absolute bottom-full left-4 mb-2 p-1.5 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border border-[#310065]/5 dark:border-white/10 rounded-[24px] shadow-xl z-40 animate-in slide-in-from-bottom-2 duration-150 w-[270px]">
            <div className="grid grid-cols-8 gap-0.5">
              {ANIMATED_EMOJIS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleEmojiSelect(item.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all duration-150"
                  title={language === 'es' ? item.labelEs : language === 'fr' ? item.labelFr : item.labelHt}
                >
                  <AnimatedEmoji id={item.id} size={22} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <form onSubmit={handleSend} className="flex items-end gap-2.5">
        <div className="flex-1 flex flex-col bg-white dark:bg-[#1c1c1e] rounded-[24px] shadow-sm border border-[#310065]/5 dark:border-white/10 overflow-hidden">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled || isSending}
            maxLength={maxLength}
            placeholder={getPlaceholder()}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[14.5px] text-[#310065] dark:text-white placeholder-[#94a3b8] dark:placeholder-[#71717a] px-4 pt-3 pb-1"
          />
          <div className="flex items-center justify-between px-2 pb-1">
              <div className="flex items-center gap-1 text-[#94a3b8] dark:text-[#71717a]">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#7a3ce3] dark:hover:text-[#E3D5FF] transition-colors ${showEmojiPicker ? 'text-[#7a3ce3] dark:text-[#E3D5FF] bg-black/5 dark:bg-white/10' : ''}`}
                >
                  <Smile className="w-5 h-5" />
                </button>
             </div>
             {text.length > 0 && (
                <span className={`text-[10px] font-bold pr-2 ${text.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                  {text.length} / {maxLength}
                </span>
             )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all shrink-0 ${
            isButtonDisabled
              ? 'bg-white dark:bg-[#2c2c2e] text-[#94a3b8] dark:text-[#71717a] border border-[#310065]/5 dark:border-white/5 shadow-sm'
              : 'bg-gradient-to-tr from-[#9b51e0] to-[#7a3ce3] text-white shadow-lg shadow-[#7a3ce3]/30 hover:scale-105 active:scale-95'
          }`}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-[20px] h-[20px] ml-0.5" strokeWidth={2.5} />
          )}
        </button>
      </form>
    </div>
  );
}
