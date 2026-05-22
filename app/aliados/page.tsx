'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Sparkles, Crown, Timer } from 'lucide-react';
import { useLanguage, useT } from '@/lib/i18n/context';
import { Translations } from '@/lib/i18n/types';

// ─────────────────────────────────────────────────────────────────
// DATOS DE PERSONAJES
// ─────────────────────────────────────────────────────────────────
interface AllyData {
  id: string;
  name: string;
  power: string;
  rarity: string;
  color: string;
  glowColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

// Genera los datos de aliados con las traducciones actuales
function getAlliesData(t: Translations): AllyData[] {
  return [
    {
      id: 'ester',
      name: 'Ester',
      rarity: t.allies.rarityEpic,
      power: t.allies.allies.ester.power,
      color: '#A855F7',
      glowColor: 'rgba(168,85,247,0.45)',
      borderColor: 'rgba(168,85,247,0.6)',
      icon: <Sparkles size={22} className="text-purple-300" />,
    },
    {
      id: 'david',
      name: 'David',
      rarity: t.allies.rarityRare,
      power: t.allies.allies.david.power,
      color: '#3B82F6',
      glowColor: 'rgba(59,130,246,0.45)',
      borderColor: 'rgba(59,130,246,0.6)',
      icon: <Shield size={22} className="text-blue-300" />,
    },
    {
      id: 'salomon',
      name: 'Salomón',
      rarity: t.allies.rarityEpic,
      power: t.allies.allies.salomon.power,
      color: '#F5C842',
      glowColor: 'rgba(245,200,66,0.45)',
      borderColor: 'rgba(245,200,66,0.6)',
      icon: <Crown size={22} className="text-yellow-300" />,
    },
    {
      id: 'moises',
      name: 'Moisés',
      rarity: t.allies.rarityRare,
      power: t.allies.allies.moises.power,
      color: '#22C55E',
      glowColor: 'rgba(34,197,94,0.45)',
      borderColor: 'rgba(34,197,94,0.6)',
      icon: <Timer size={22} className="text-green-300" />,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────
// BOTONES INVISIBLES  —  posicionados sobre la imagen (%)
// Imagen original: 941 × 1672 px
// ─────────────────────────────────────────────────────────────────
const INVISIBLE_BUTTONS = [
  // ← Volver  (x≈30-100, y≈28-100  de 941×1672)
  { id: 'back',    top: '1.7%',  left: '3.2%',  width: '7.5%',  height: '4.5%' },
  // Ester  "Usar"   (x≈50-445, y≈1042-1107)
  { id: 'ester',   top: '65%',   left: '5.3%',  width: '42.2%', height: '3.9%' },
  { id: 'david',   top: '65%',   left: '52.1%', width: '43.2%', height: '3.9%' },
  // Salomón "Equipar" (x≈50-445, y≈1407-1475)
  { id: 'salomon', top: '89%',   left: '5.3%',  width: '42.2%', height: '4.1%' },
  { id: 'moises',  top: '89%',   left: '52.1%', width: '43.2%', height: '4.1%' },
];

// ─────────────────────────────────────────────────────────────────
// COMPONENTE: Modal de aliado
// ─────────────────────────────────────────────────────────────────
function AllyModal({ ally, equipBtn, onClose }: { ally: AllyData; equipBtn: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(4,4,14,0.65)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        {/* Card */}
        <motion.div
          key="card"
          initial={{ y: 120, opacity: 0, scale: 0.96 }}
          animate={{ y: 0,   opacity: 1, scale: 1    }}
          exit={{    y: 80,  opacity: 0, scale: 0.97  }}
          transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm mx-4 rounded-[28px] overflow-hidden"
          style={{
            background: '#ffffff',
            border: `1px solid ${ally.color}30`,
            boxShadow: `0 8px 40px rgba(0,0,0,0.18), 0 2px 12px ${ally.glowColor}20`,
          }}
        >
          {/* Barra de color superior */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.12, duration: 0.4, ease: 'easeOut' }}
            className="h-[3px] w-full origin-left"
            style={{ background: `linear-gradient(to right, ${ally.color}, ${ally.color}44)` }}
          />

          <div className="px-5 pt-5 pb-6">
            {/* Header row: ícono + nombre + rareza + cerrar */}
            <div className="flex items-center gap-3 mb-4">
              {/* Ícono circular */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.1 }}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: `${ally.color}18`,
                  border: `1.5px solid ${ally.color}50`,
                  boxShadow: `0 0 14px ${ally.glowColor}`,
                }}
              >
                {ally.icon}
              </motion.div>

              {/* Nombre + rareza */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-black text-[17px] leading-none mb-1 tracking-tight">
                  {ally.name}
                </p>
                <span
                  className="text-[9px] font-black tracking-[0.22em] uppercase px-2 py-0.5 rounded-full"
                  style={{ color: ally.color, background: `${ally.color}18` }}
                >
                  {ally.rarity}
                </span>
              </div>

              {/* Cerrar */}
              <motion.button
                whileHover={{ scale: 1.12, rotate: 90 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center
                           bg-gray-100 text-gray-400 shrink-0"
              >
                <X size={14} strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Divisor sutil */}
            <div className="h-px mb-4" style={{ background: `${ally.color}25` }} />

            {/* Habilidad */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.3 }}
              className="flex items-start gap-2.5 mb-5"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${ally.color}14`, border: `1px solid ${ally.color}30` }}
              >
                {ally.icon}
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                {ally.power}
              </p>
            </motion.div>

            {/* Botón equipar — pill iOS */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: 0.22, duration: 0.28 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="w-full py-3 rounded-2xl font-black text-[14px]
                         flex items-center justify-center gap-2 tracking-wide"
              style={{
                background: `linear-gradient(135deg, ${ally.color}ee, ${ally.color}bb)`,
                color: ally.id === 'salomon' ? '#1a0e00' : '#fff',
                boxShadow: `0 4px 20px ${ally.glowColor}60`,
              }}
            >
              <Shield size={15} strokeWidth={2.5} />
              {equipBtn}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────
export default function AliadosPage() {
  const router = useRouter();
  const [activeAlly, setActiveAlly] = useState<AllyData | null>(null);
  const { language } = useLanguage();
  const t = useT();
  const alliesData = getAlliesData(t);

  // Imagen según el idioma configurado en la app
  const screenImage = (language === 'fr' || language === 'ht')
    ? '/assets/aliados/allies_screen_fr.png'
    : '/assets/aliados/allies_screen_light.png';

  const handleButtonClick = (id: string) => {
    if (id === 'back') { router.back(); return; }
    const ally = alliesData.find(a => a.id === id);
    if (ally) setActiveAlly(ally);
  };

  return (
    <>
      {/* Contenedor fijo — ocupa toda la pantalla, sin scroll */}
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center" style={{ background: '#f5ede0' }}>

        {/* Wrapper proporcional a la imagen — siempre visible completa */}
        <div
          className="relative w-full h-full"
          style={{ aspectRatio: '941 / 1672', maxWidth: 'calc(100vh * 941 / 1672)' }}
        >
          {/* Imagen 100% del wrapper */}
          <Image
            src={screenImage}
            alt="Pantalla de Aliados"
            fill
            className="object-fill"
            priority
          />

          {/* ── Botones invisibles — % relativos a la imagen ── */}
          {INVISIBLE_BUTTONS.map(btn => (
            <button
              key={btn.id}
              aria-label={btn.id === 'back' ? 'Regresar' : `Equipar ${btn.id}`}
              onClick={() => handleButtonClick(btn.id)}
              className="absolute z-50 cursor-pointer"
              style={{
                top: btn.top,
                left: btn.left,
                width: btn.width,
                height: btn.height,
                background: 'transparent',
                border: 'none',
                // background: 'rgba(255,0,0,0.3)', // depurar
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Modal de aliado ── */}
      {activeAlly && (
        <AllyModal
          ally={activeAlly}
          equipBtn={t.allies.equipBtn}
          onClose={() => setActiveAlly(null)}
        />
      )}
    </>
  );
}
