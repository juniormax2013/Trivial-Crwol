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
    <form onSubmit={handleSend} className="p-4 bg-white border-t border-black/5 flex flex-col gap-2 relative z-40">
      {/* iOS Style Floating Emoji Picker Sheet */}
      {showEmojiPicker && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setShowEmojiPicker(false)}
          />
          <div className="absolute bottom-full left-4 mb-2 p-1 bg-white/95 backdrop-blur-xl border border-black/5 rounded-2xl shadow-xl z-40 animate-in slide-in-from-bottom-2 duration-150 w-[270px]">
            <div className="grid grid-cols-8 gap-0.5">
              {ANIMATED_EMOJIS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleEmojiSelect(item.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 active:scale-90 transition-all duration-150"
                  title={language === 'es' ? item.labelEs : language === 'fr' ? item.labelFr : item.labelHt}
                >
                  <AnimatedEmoji id={item.id} size={18} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || isSending}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            showEmojiPicker 
              ? 'bg-[#0A84FF]/10 text-[#0A84FF] scale-95' 
              : 'bg-gray-50 hover:bg-gray-100 text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Smile className="w-5.5 h-5.5" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled || isSending}
          maxLength={maxLength}
          placeholder={getPlaceholder()}
          className="flex-1 px-4 py-3 rounded-full bg-gray-50 border border-black/5 focus:outline-none focus:border-[#0A84FF] focus:bg-white text-[14px] text-[#0F172A] placeholder-gray-400 transition-all"
        />
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            isButtonDisabled
              ? 'bg-gray-100 text-gray-400'
              : 'bg-[#0A84FF] text-white shadow-lg shadow-[#0A84FF]/25 hover:scale-105 active:scale-95'
          }`}
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {text.length > 0 && (
        <div className="flex justify-end px-2">
          <span className={`text-[10px] font-bold ${text.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
            {text.length} / {maxLength}
          </span>
        </div>
      )}
    </form>
  );
}
