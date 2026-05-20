'use client';

import { motion } from 'framer-motion';
import { VoiceState } from '@/lib/bible-ai/types';

interface BibleAIAvatarProps {
  voiceState: VoiceState;
  disabled?: boolean;
}

export default function BibleAIAvatar({ voiceState, disabled }: BibleAIAvatarProps) {
  const isDisabled = disabled || voiceState === 'idle';
  const isListening = voiceState === 'listening';
  const isThinking = voiceState === 'thinking' || voiceState === 'transcribing';
  const isSpeaking = voiceState === 'speaking';

  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto select-none">

      {/* Outer aura ring — always present */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: disabled
            ? 'radial-gradient(circle, rgba(150,150,150,0.08) 0%, transparent 70%)'
            : isListening
            ? 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)'
            : isSpeaking
            ? 'radial-gradient(circle, rgba(233,195,73,0.25) 0%, transparent 70%)'
            : isThinking
            ? 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(233,195,73,0.12) 0%, transparent 70%)',
        }}
        animate={disabled ? { opacity: 0.4 } : { opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Listening waves */}
      {isListening && (
        <>
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-blue-400/40"
              animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.5, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}

      {/* Speaking golden pulse */}
      {isSpeaking && (
        <>
          {[1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-amber-400/50"
              animate={{ scale: [1, 1.4 + i * 0.2], opacity: [0.6, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}

      {/* Thinking particles */}
      {isThinking && (
        <>
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-violet-400"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, Math.cos((i / 5) * Math.PI * 2) * 52],
                y: [0, Math.sin((i / 5) * Math.PI * 2) * 52],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}

      {/* Main book avatar */}
      <motion.div
        className="relative z-10"
        animate={
          disabled
            ? { filter: 'grayscale(1)', opacity: 0.5 }
            : isThinking
            ? { rotateY: [0, 5, -5, 0], scale: [1, 1.02, 0.98, 1] }
            : isSpeaking
            ? { scale: [1, 1.04, 1] }
            : { y: [0, -4, 0] }
        }
        transition={
          disabled
            ? {}
            : isThinking
            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            : isSpeaking
            ? { duration: 0.8, repeat: Infinity }
            : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <svg
          width="100"
          height="90"
          viewBox="0 0 100 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Drop shadow filter */}
          <defs>
            <filter id="bookShadow" x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow
                dx="0"
                dy="6"
                stdDeviation="6"
                floodColor={isSpeaking ? '#e9c349' : disabled ? '#999' : '#e9c349'}
                floodOpacity={isSpeaking ? '0.5' : disabled ? '0.1' : '0.3'}
              />
            </filter>
            <linearGradient id="pageLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef9ec" />
              <stop offset="100%" stopColor="#f3e7c4" />
            </linearGradient>
            <linearGradient id="pageRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3d0" />
              <stop offset="100%" stopColor="#f7e4a0" />
            </linearGradient>
            <linearGradient id="spine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c9a227" />
              <stop offset="50%" stopColor="#e9c349" />
              <stop offset="100%" stopColor="#c9a227" />
            </linearGradient>
            <linearGradient id="cover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a148c" />
              <stop offset="100%" stopColor="#310065" />
            </linearGradient>
          </defs>

          {/* Book covers (outer) */}
          <rect x="2" y="8" width="42" height="74" rx="4" fill="url(#cover)" filter="url(#bookShadow)" />
          <rect x="56" y="8" width="42" height="74" rx="4" fill="url(#cover)" filter="url(#bookShadow)" />

          {/* Left page */}
          <rect x="6" y="12" width="38" height="66" rx="2" fill="url(#pageLeft)" />
          {/* Right page */}
          <rect x="56" y="12" width="38" height="66" rx="2" fill="url(#pageRight)" />

          {/* Spine (golden center) */}
          <rect x="44" y="6" width="12" height="78" rx="3" fill="url(#spine)" />
          <rect x="47" y="6" width="6" height="78" rx="1" fill="#e9c349" opacity="0.6" />

          {/* Left page lines (text simulation) */}
          {[20, 28, 36, 44, 52, 60, 68].map((y, i) => (
            <rect
              key={i}
              x="12"
              y={y}
              width={i % 3 === 0 ? 26 : i % 3 === 1 ? 22 : 20}
              height="2"
              rx="1"
              fill="#b8860b"
              opacity="0.3"
            />
          ))}

          {/* Right page lines */}
          {[20, 28, 36, 44, 52, 60, 68].map((y, i) => (
            <rect
              key={i}
              x="62"
              y={y}
              width={i % 3 === 0 ? 24 : i % 3 === 1 ? 20 : 26}
              height="2"
              rx="1"
              fill="#b8860b"
              opacity="0.3"
            />
          ))}

          {/* Cross on right page */}
          <rect x="75" y="30" width="2.5" height="14" rx="1" fill="#cba72f" opacity="0.7" />
          <rect x="71" y="36" width="10" height="2.5" rx="1" fill="#cba72f" opacity="0.7" />

          {/* Golden shine on spine */}
          {isSpeaking && (
            <rect x="47" y="6" width="6" height="78" rx="1" fill="#fff" opacity="0.4" />
          )}

          {/* Page curl hint */}
          <path d="M44 80 Q50 78 56 80" stroke="#c9a227" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M44 12 Q50 10 56 12" stroke="#c9a227" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>
      </motion.div>

      {/* State label */}
      <div className="absolute -bottom-7 left-0 right-0 flex justify-center">
        {isListening && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-black text-blue-500 tracking-widest uppercase flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Escuchando...
          </motion.span>
        )}
        {isThinking && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-black text-violet-500 tracking-widest uppercase flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:0.3s]" />
            Pensando
          </motion.span>
        )}
        {isSpeaking && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-black text-amber-500 tracking-widest uppercase flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            Respondiendo...
          </motion.span>
        )}
        {disabled && (
          <span className="text-[11px] font-bold text-gray-400 tracking-wider">
            No disponible
          </span>
        )}
      </div>
    </div>
  );
}
