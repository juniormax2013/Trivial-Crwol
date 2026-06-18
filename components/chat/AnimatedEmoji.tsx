'use client';

import { motion } from 'framer-motion';

export interface AnimatedEmojiData {
  id: string;
  emoji: string;
  labelEs: string;
  labelFr: string;
  labelHt: string;
  animate: any;
}

export const ANIMATED_EMOJIS: AnimatedEmojiData[] = [
  {
    id: 'heart',
    emoji: '❤️',
    labelEs: 'Amor',
    labelFr: 'Amour',
    labelHt: 'Renmen',
    animate: {
      scale: [1, 1.25, 1, 1.25, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  {
    id: 'fire',
    emoji: '🔥',
    labelEs: 'Fuego',
    labelFr: 'Feu',
    labelHt: 'Dife',
    animate: {
      y: [0, -8, 0],
      scaleY: [1, 1.2, 0.9, 1.1, 1],
      scaleX: [1, 0.9, 1.1, 0.95, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  {
    id: 'laugh',
    emoji: '😂',
    labelEs: 'Risa',
    labelFr: 'Rire',
    labelHt: 'Chire',
    animate: {
      rotate: [-15, 15, -15],
      y: [0, -6, 0],
      transition: {
        duration: 0.7,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
  {
    id: 'party',
    emoji: '🎉',
    labelEs: 'Fiesta',
    labelFr: 'Fête',
    labelHt: 'Fèt',
    animate: {
      scale: [1, 1.15, 1],
      rotate: [-8, 8, -8],
      transition: {
        duration: 0.9,
        repeat: Infinity,
      },
    },
  },
  {
    id: 'amen',
    emoji: '🙌',
    labelEs: 'Amén',
    labelFr: 'Amen',
    labelHt: 'Amèn',
    animate: {
      y: [0, -10, 0],
      scaleY: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  {
    id: 'surprised',
    emoji: '😮',
    labelEs: 'Wow',
    labelFr: 'Wow',
    labelHt: 'Wow',
    animate: {
      scale: [1, 1.2, 1],
      y: [0, -3, 0],
      transition: {
        duration: 1.1,
        repeat: Infinity,
      },
    },
  },
  {
    id: 'cry',
    emoji: '😢',
    labelEs: 'Triste',
    labelFr: 'Triste',
    labelHt: 'Tris',
    animate: {
      y: [0, 2, 0],
      x: [-1.5, 1.5, -1.5],
      transition: {
        duration: 0.6,
        repeat: Infinity,
      },
    },
  },
  {
    id: 'clap',
    emoji: '👏',
    labelEs: 'Aplauso',
    labelFr: 'Applaudissements',
    labelHt: 'Bravo',
    animate: {
      scaleX: [1, 0.75, 1.1, 1],
      scaleY: [1, 1.05, 0.95, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
      },
    },
  },
  {
    id: 'crown',
    emoji: '👑',
    labelEs: 'Corona',
    labelFr: 'Couronne',
    labelHt: 'Kouròn',
    animate: {
      y: [0, -5, 0],
      rotate: [0, 6, -6, 0],
      transition: {
        duration: 1.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  {
    id: 'pray',
    emoji: '🙏',
    labelEs: 'Oración',
    labelFr: 'Prière',
    labelHt: 'Lapriyè',
    animate: {
      scale: [1, 1.1, 1],
      y: [0, -2, 0],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  {
    id: 'sparkles',
    emoji: '✨',
    labelEs: 'Brillos',
    labelFr: 'Étincelles',
    labelHt: 'Klate',
    animate: {
      scale: [0.9, 1.15, 0.9],
      rotate: [0, 15, -15, 0],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 1.4,
        repeat: Infinity,
      },
    },
  },
  {
    id: 'eyes',
    emoji: '👀',
    labelEs: 'Mirar',
    labelFr: 'Regard',
    labelHt: 'Gade',
    animate: {
      x: [-3, 3, -3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  {
    id: 'angel',
    emoji: '😇',
    labelEs: 'Ángel',
    labelFr: 'Ange',
    labelHt: 'Zanj',
    animate: {
      y: [0, -6, 0],
      rotate: [-5, 5, -5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  {
    id: 'bible',
    emoji: '📖',
    labelEs: 'Biblia',
    labelFr: 'Bible',
    labelHt: 'Bib',
    animate: {
      scale: [1, 1.08, 1],
      rotateY: [0, 10, 0],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  {
    id: 'dove',
    emoji: '🕊️',
    labelEs: 'Paz',
    labelFr: 'Paix',
    labelHt: 'Lapè',
    animate: {
      y: [0, -7, 0],
      scaleX: [1, 0.9, 1.05, 1],
      transition: {
        duration: 1.3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
];

interface AnimatedEmojiProps {
  id: string;
  size?: number;
  className?: string;
}

export default function AnimatedEmoji({ id, size = 40, className = '' }: AnimatedEmojiProps) {
  const emojiData = ANIMATED_EMOJIS.find((e) => e.id === id);
  if (!emojiData) return null;

  return (
    <motion.div
      animate={emojiData.animate}
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
      className={`inline-flex items-center justify-center select-none ${className}`}
    >
      {emojiData.emoji}
    </motion.div>
  );
}
