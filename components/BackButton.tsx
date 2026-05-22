'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface BackButtonProps {
  /** Ruta explícita a la que navegar. Si no se pasa, usa router.back() */
  href?: string;
  /** Clase extra para ajustar posicionamiento si es necesario */
  className?: string;
}

/**
 * Botón de regreso reutilizable.
 * Usa router.back() por defecto, o navega a `href` si se proporciona.
 *
 * Uso básico (en el header de cualquier página):
 * ```tsx
 * import BackButton from '@/components/BackButton';
 * <BackButton />
 * ```
 */
export default function BackButton({ href, className = '' }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.06, x: -2 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={handleBack}
      aria-label="Regresar"
      className={`w-10 h-10 rounded-2xl
                  bg-[#310065]/[0.06] hover:bg-[#310065]/[0.11]
                  flex items-center justify-center
                  text-[#310065] transition-colors duration-200
                  ${className}`}
    >
      <ArrowLeft size={20} strokeWidth={2.5} />
    </motion.button>
  );
}
