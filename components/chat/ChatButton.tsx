'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatButton() {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push('/chat')}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-24 right-6 z-[60]
                 w-14 h-14 rounded-full
                 bg-[#0A84FF] text-white
                 shadow-[0_8px_24px_rgba(10,132,255,0.3)]
                 flex items-center justify-center
                 transition-shadow hover:shadow-[0_12px_30px_rgba(10,132,255,0.4)]"
      aria-label="Abrir chat"
    >
      <MessageCircle className="w-6 h-6" />
    </motion.button>
  );
}
