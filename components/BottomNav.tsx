'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Swords, Crown, Users, UserCircle, Menu, X, Shield } from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomNavProps {
  activeTab: 'home' | 'play' | 'ranking' | 'social' | 'profile' | 'aliados';
  /** Si false, no se renderiza el botón flotante fijo (la página gestiona su propio trigger) */
  showTriggerButton?: boolean;
}

export default function BottomNav({ activeTab, showTriggerButton = true }: BottomNavProps) {
  const t = useT();
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);

  // Escucha el evento global para que cualquier página pueda abrir el panel
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-sidenav', handler);
    return () => window.removeEventListener('open-sidenav', handler);
  }, []);

  const navItems = [
    { id: 'home',    label: t.nav.home,    icon: Home,       href: '/'          },
    { id: 'play',    label: t.nav.play,    icon: Swords,     href: '/arena'     },
    { id: 'ranking', label: t.nav.ranking, icon: Crown,      href: '/ranking'   },
    { id: 'social',  label: t.nav.social,  icon: Users,      href: '/social'    },
    { id: 'aliados', label: t.nav.aliados, icon: Shield,     href: '/aliados'   },
    { id: 'profile', label: t.nav.profile, icon: UserCircle, href: '/profile'   },
  ] as const;

  const xpProgress = Math.min(100, (user?.xp || 0) % 100);
  const displayName = user?.firstName || user?.fullName?.split(' ')[0] || user?.username || '—';

  return (
    <>
      {/* ── Botón fijo superior-derecha (solo si showTriggerButton === true) ── */}
      {showTriggerButton && (
        <motion.button
          id="sidenav-toggle"
          aria-label="Abrir menú de navegación"
          aria-expanded={isOpen}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(true)}
          className="fixed top-4 right-4 z-[65]
                     w-10 h-10 rounded-2xl
                     bg-white/90 backdrop-blur-md
                     border border-[#310065]/10
                     shadow-[0_4px_16px_rgba(49,0,101,0.12)]
                     flex items-center justify-center
                     text-[#310065]
                     transition-shadow hover:shadow-[0_6px_20px_rgba(49,0,101,0.2)]"
          style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <Menu size={20} strokeWidth={2.5} />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* ── Backdrop ── */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[3px]"
              aria-hidden="true"
            />

            {/* ── Panel Lateral ── */}
            <motion.nav
              key="sidenav"
              role="navigation"
              aria-label="Menú principal"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-[75] w-[300px]
                         bg-white
                         shadow-[24px_0_60px_rgba(49,0,101,0.14)]
                         flex flex-col overflow-hidden"
            >
              {/* Decoración de fondo */}
              <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72
                              bg-[#310065]/[0.03] rounded-full blur-3xl" />

              {/* ─────────────────────────────────────────
                  CABECERA — Perfil del usuario
              ───────────────────────────────────────── */}
              <div
                className="relative px-5 pt-6 pb-5
                           bg-gradient-to-br from-[#310065] to-[#4a148c]
                           overflow-hidden shrink-0"
                style={{ paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top) + 1rem))' }}
              >
                {/* Glow decorativo */}
                <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48
                                bg-white/[0.05] rounded-full blur-2xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 w-full h-12
                                bg-gradient-to-t from-black/10 to-transparent" />

                {/* Botón cerrar */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={() => setIsOpen(false)}
                  aria-label="Cerrar menú"
                  className="absolute top-4 right-4 w-8 h-8 rounded-xl
                             bg-white/10 hover:bg-white/20
                             flex items-center justify-center text-white/70
                             transition-colors"
                  style={{ top: 'max(1rem, calc(env(safe-area-inset-top) + 0.5rem))' }}
                >
                  <X size={16} strokeWidth={2.5} />
                </motion.button>

                {/* Avatar + Nombre */}
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="relative shrink-0">
                    <div className="w-[56px] h-[56px] rounded-2xl overflow-hidden
                                    bg-white/20 border-2 border-white/20 shadow-lg">
                      {user?.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt="Foto de perfil"
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center
                                        text-white font-black text-2xl">
                          {displayName[0]?.toUpperCase() ?? 'U'}
                        </div>
                      )}
                    </div>
                    {/* Badge de nivel */}
                    <div className="absolute -bottom-1.5 -right-1.5
                                    bg-[#e9c349] text-[#310065] text-[9px] font-black
                                    w-5 h-5 rounded-lg flex items-center justify-center
                                    border-2 border-[#310065] shadow-md">
                      {user?.level || 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-white font-black text-[15px] leading-tight truncate">
                      {displayName}
                    </p>
                    <p className="text-white/60 text-[11px] font-bold mt-0.5">
                      {user?.xp?.toLocaleString() ?? 0} XP total
                    </p>
                  </div>
                </div>

                {/* Barra de progreso XP */}
                <div className="relative z-10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.18em]">
                      Progreso de nivel
                    </span>
                    <span className="text-[10px] font-bold text-[#e9c349]">
                      {xpProgress}<span className="text-white/40">/100 XP</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-gradient-to-r from-[#e9c349] to-[#cba72f] rounded-full
                                 shadow-[0_0_8px_rgba(233,195,73,0.5)]"
                    />
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────
                  ITEMS DE NAVEGACIÓN
              ───────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.055 + 0.1,
                        type: 'spring',
                        stiffness: 420,
                        damping: 26,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl
                                    transition-colors duration-200 group select-none
                                    ${isActive
                                      ? 'bg-[#310065]/[0.07]'
                                      : 'hover:bg-gray-50'
                                    }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="sideNavActiveBar"
                            className="absolute left-0 top-1/2 -translate-y-1/2
                                       w-[3px] h-8 bg-[#e9c349] rounded-r-full"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}

                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center
                                      transition-colors duration-200 shrink-0
                                      ${isActive
                                        ? 'bg-[#310065]/10 shadow-inner'
                                        : 'bg-gray-100 group-hover:bg-[#310065]/[0.06]'
                                      }`}
                        >
                          <Icon
                            className={`w-[18px] h-[18px] transition-colors duration-200
                                        ${isActive
                                          ? 'text-[#310065]'
                                          : 'text-gray-400 group-hover:text-[#310065]'
                                        }`}
                            strokeWidth={isActive ? 2.3 : 1.8}
                          />
                        </div>

                        <span
                          className={`text-[14px] font-bold tracking-tight transition-colors duration-200
                                      ${isActive
                                        ? 'text-[#310065]'
                                        : 'text-gray-600 group-hover:text-[#310065]'
                                      }`}
                        >
                          {item.label}
                        </span>

                        {isActive && (
                          <motion.span
                            layoutId="sideNavActiveDot"
                            className="ml-auto w-[7px] h-[7px] rounded-full bg-[#310065]"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-black/[0.04] shrink-0">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.22em] text-center">
                  Bible Crown © 2025
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
