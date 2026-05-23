'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  RefreshCcw, 
  Zap, 
  Clock, 
  Trophy, 
  Coins, 
  Crown, 
  Target,
  Loader2,
  CheckCircle2,
  Info,
  Heart,
  Download as DownloadIcon,
  Flame,
  Sparkles
} from 'lucide-react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { 
  getGameEngineConfig, 
  updateGameEngineConfig, 
  resetGameEngineConfig,
  GameEngineConfig,
  DEFAULT_GAME_ENGINE_CONFIG
} from '@/lib/admin/settings-repository';
import { resetAllUsersEnergy } from '@/lib/user/repository';

export default function GameEnginePage() {
  const [config, setConfig] = useState<GameEngineConfig>(DEFAULT_GAME_ENGINE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isResettingEnergy, setIsResettingEnergy] = useState(false);
  const [activeDuelTab, setActiveDuelTab] = useState<'easy' | 'medium' | 'hard'>('easy');

  // Cálculos dinámicos de pesos proporcionales del Diablo
  const powerWeight = config.devilTrap?.powerModeWeight ?? 50;
  const observerWeight = config.devilTrap?.observerModeWeight ?? 50;
  const obsEnabled = config.devilTrap?.observerModeEnabled ?? true;
  const totalWeight = powerWeight + (obsEnabled ? observerWeight : 0);
  const powerPercent = totalWeight > 0 ? Math.round((powerWeight / totalWeight) * 100) : 100;
  const observerPercent = totalWeight > 0 && obsEnabled ? Math.round((observerWeight / totalWeight) * 100) : 0;

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const data = await getGameEngineConfig();
    setConfig(data);
    setLoading(false);
  };

  const handleResetAllEnergy = async () => {
    if (confirm("¿Estás seguro de que quieres resetear la ENERGÍA y CORAZONES de TODOS los usuarios? Esta acción no se puede deshacer.")) {
      setIsResettingEnergy(true);
      try {
        await resetAllUsersEnergy();
        alert("¡Energía reseteada correctamente para todos los usuarios!");
      } catch (err) {
        console.error("Error resetting all energy:", err);
        alert("Error al resetear la energía");
      } finally {
        setIsResettingEnergy(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGameEngineConfig(config);
      alert("Configuración guardada correctamente");
    } catch (err) {
      console.error("Error saving config:", err);
      alert("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm("¿Estás seguro de que quieres restablecer todos los valores a los ajustes predeterminados?")) {
      setSaving(true);
      const data = await resetGameEngineConfig();
      setConfig(data);
      setSaving(false);
    }
  };

  const updateDuelSetting = (diff: 'easy' | 'medium' | 'hard', key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      duels: {
        ...prev.duels,
        difficultySettings: {
          ...prev.duels.difficultySettings,
          [diff]: {
            ...prev.duels.difficultySettings[diff],
            ...(typeof value === 'object' ? { rewards: { ...prev.duels.difficultySettings[diff].rewards, ...value } } : { [key]: value })
          }
        }
      }
    }));
  };

  const updateDCSetting = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      dailyChallenge: {
        ...prev.dailyChallenge,
        [key]: value
      }
    }));
  };

  const updatePWASetting = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      pwa: {
        ...(prev.pwa || { showInstallPrompt: false }),
        [key]: value
      }
    }));
  };

  const updateDevilTrapSetting = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      devilTrap: {
        ...(prev.devilTrap || { spawnProbability: 0.15 }),
        [key]: value
      }
    }));
  };

  const updateSpecialChallengeSetting = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      specialChallenge: {
        ...(prev.specialChallenge || { spawnProbability: 0.50 }),
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#310065] animate-spin mx-auto mb-4" />
          <p className="text-[#310065]/60 font-medium">Sintonizando el Motor...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen font-sans pb-20">
        {/* Header */}
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#310065]/5 px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/admin/dashboard" className="p-2 -ml-2 rounded-full hover:bg-[#310065]/5 transition-colors">
              <ArrowLeft className="w-6 h-6 text-[#310065]" />
            </Link>
            <h1 className="font-serif font-black text-lg sm:text-xl text-[#310065] truncate max-w-[120px] sm:max-w-none">Motor de Juego</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleReset}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full font-bold text-[11px] sm:text-[12px] text-[#310065]/60 hover:text-[#310065] hover:bg-[#310065]/5 transition-all uppercase tracking-widest"
              title="Restablecer valores predeterminados"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Restablecer</span>
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-[#310065] text-white rounded-full font-bold text-[12px] sm:text-[13px] hover:bg-[#4a0099] active:scale-95 transition-all shadow-lg shadow-[#310065]/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto pt-24 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-[#310065]/5 shadow-sm">
                <div className="w-12 h-12 bg-[#310065]/5 rounded-2xl flex items-center justify-center mb-4 text-[#310065]">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-[#310065] mb-2">Control Maestro</h2>
                <p className="text-sm text-[#1b1b1e]/60 leading-relaxed">
                  Ajusta los parámetros fundamentales del motor de juego. Estos cambios afectan instantáneamente a todos los usuarios activos en tiempo real.
                </p>
                <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-[12px] text-amber-800 leading-tight">
                    Ten precaución al modificar los tiempos de respuesta. Tiempos menores a 10s pueden ser demasiado difíciles para conexiones lentas.
                  </p>
                </div>
              </div>

              <div className="bg-[#310065] p-6 rounded-3xl text-white shadow-xl shadow-[#310065]/20">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5" />
                  Mantenimiento
                </h3>
                <p className="text-sm text-white/70 mb-6">
                  Acciones globales para gestionar el estado del juego.
                </p>
                <button
                  onClick={handleResetAllEnergy}
                  disabled={isResettingEnergy}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-2xl border border-white/10 font-bold text-sm"
                >
                  {isResettingEnergy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                  )}
                  Resetear Energía de Usuarios
                </button>
              </div>
            </div>

            {/* Main Config */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Duelos Config */}
              <section className="bg-white rounded-3xl border border-[#310065]/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#310065]/5 flex items-center justify-between bg-[#310065]/[0.02]">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-[#310065]" />
                    <h2 className="font-bold text-[#310065]">Configuración de Duelos</h2>
                  </div>
                </div>

                <div className="p-6">
                  {/* Difficulty Tabs */}
                  <div className="flex p-1 bg-[#310065]/5 rounded-2xl mb-8">
                    {(['easy', 'medium', 'hard'] as const).map(diff => (
                      <button
                        key={diff}
                        onClick={() => setActiveDuelTab(diff)}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                          activeDuelTab === diff 
                          ? 'bg-white text-[#310065] shadow-sm' 
                          : 'text-[#310065]/40 hover:text-[#310065]/60'
                        }`}
                      >
                        {diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Normal' : 'Difícil'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4 sm:col-span-2">
                      <label className="text-[12px] font-bold text-[#310065] uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Tiempo por Pregunta (Segundos)
                      </label>
                      <input 
                        type="range" 
                        min="5" 
                        max="60" 
                        step="5"
                        value={config.duels.difficultySettings[activeDuelTab].timeLimit}
                        onChange={(e) => updateDuelSetting(activeDuelTab, 'timeLimit', parseInt(e.target.value))}
                        className="w-full accent-[#310065]"
                      />
                      <div className="flex justify-between text-lg font-black text-[#310065]">
                        <span>5s</span>
                        <span className="px-4 py-1 bg-[#310065]/5 rounded-lg">{config.duels.difficultySettings[activeDuelTab].timeLimit}s</span>
                        <span>60s</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#310065]/60 block">PREGUNTAS POR RONDA</label>
                      <input 
                        type="number" 
                        value={config.duels.difficultySettings[activeDuelTab].questionsPerRound}
                        onChange={(e) => updateDuelSetting(activeDuelTab, 'questionsPerRound', parseInt(e.target.value))}
                        className="w-full bg-[#faf9fc] border-none rounded-2xl px-4 py-3 font-bold focus:ring-2 focus:ring-[#310065] outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#310065]/60 block">XP POR VICTORIA</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={config.duels.difficultySettings[activeDuelTab].rewards.xp}
                          onChange={(e) => updateDuelSetting(activeDuelTab, 'rewards', { xp: parseInt(e.target.value) })}
                          className="w-full bg-[#faf9fc] border-none rounded-2xl px-4 py-3 pl-10 font-bold focus:ring-2 focus:ring-[#310065] outline-none"
                        />
                        <Zap className="w-4 h-4 text-purple-600 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#310065]/60 block">MONEDAS POR VICTORIA</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={config.duels.difficultySettings[activeDuelTab].rewards.coins}
                          onChange={(e) => updateDuelSetting(activeDuelTab, 'rewards', { coins: parseInt(e.target.value) })}
                          className="w-full bg-[#faf9fc] border-none rounded-2xl px-4 py-3 pl-10 font-bold focus:ring-2 focus:ring-[#310065] outline-none"
                        />
                        <Coins className="w-4 h-4 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#310065]/60 block">CORONAS POR VICTORIA</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={config.duels.difficultySettings[activeDuelTab].rewards.crowns}
                          onChange={(e) => updateDuelSetting(activeDuelTab, 'rewards', { crowns: parseInt(e.target.value) })}
                          className="w-full bg-[#faf9fc] border-none rounded-2xl px-4 py-3 pl-10 font-bold focus:ring-2 focus:ring-[#310065] outline-none"
                        />
                        <Crown className="w-4 h-4 text-yellow-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Daily Challenge Config */}
              <section className="bg-white rounded-3xl border border-[#310065]/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#310065]/5 flex items-center justify-between bg-[#310065]/[0.02]">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[#310065]" />
                    <h2 className="font-bold text-[#310065]">Desafío Diario</h2>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#310065]/60 block">PUNTOS BASE (POR CORRECTA)</label>
                    <input 
                      type="number" 
                      value={config.dailyChallenge.basePoints}
                      onChange={(e) => updateDCSetting('basePoints', parseInt(e.target.value))}
                      className="w-full bg-[#faf9fc] border-none rounded-2xl px-4 py-3 font-bold focus:ring-2 focus:ring-[#310065] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#310065]/60 block">XP (POR CORRECTA)</label>
                    <input 
                      type="number" 
                      value={config.dailyChallenge.xpPerCorrect}
                      onChange={(e) => updateDCSetting('xpPerCorrect', parseInt(e.target.value))}
                      className="w-full bg-[#faf9fc] border-none rounded-2xl px-4 py-3 font-bold focus:ring-2 focus:ring-[#310065] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#310065]/60 block">BONUS VELOCIDAD (UMBRAL MS)</label>
                    <input 
                      type="number" 
                      value={config.dailyChallenge.speedBonusThresholdMs}
                      onChange={(e) => updateDCSetting('speedBonusThresholdMs', parseInt(e.target.value))}
                      placeholder="8000"
                      className="w-full bg-[#faf9fc] border-none rounded-2xl px-4 py-3 font-bold focus:ring-2 focus:ring-[#310065] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#310065]/60 block">PUNTOS EXTRA VELOCIDAD</label>
                    <input 
                      type="number" 
                      value={config.dailyChallenge.speedBonusPoints}
                      onChange={(e) => updateDCSetting('speedBonusPoints', parseInt(e.target.value))}
                      className="w-full bg-[#faf9fc] border-none rounded-2xl px-4 py-3 font-bold focus:ring-2 focus:ring-[#310065] outline-none"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[12px] font-bold text-[#310065]/60 block">PENALIZACIÓN ERROR (MONEDAS)</label>
                    <input 
                      type="number" 
                      value={config.dailyChallenge.wrongPenalty}
                      onChange={(e) => updateDCSetting('wrongPenalty', parseInt(e.target.value))}
                      className="w-full bg-[#faf9fc] border-none rounded-2xl px-4 py-3 font-bold focus:ring-2 focus:ring-[#310065] outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* PWA Config */}
              <section className="bg-white rounded-3xl border border-[#310065]/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#310065]/5 flex items-center justify-between bg-[#310065]/[0.02]">
                  <div className="flex items-center gap-3">
                    <DownloadIcon className="w-5 h-5 text-[#310065]" />
                    <h2 className="font-bold text-[#310065]">Configuración PWA</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between p-4 bg-[#faf9fc] rounded-2xl border border-[#310065]/5">
                    <div>
                      <h3 className="font-bold text-[#310065]">Aviso de Instalación</h3>
                      <p className="text-[12px] text-[#1b1b1e]/60">Muestra u oculta el mensaje para invitar al usuario a instalar la app.</p>
                    </div>
                    <button
                      onClick={() => updatePWASetting('showInstallPrompt', !config.pwa?.showInstallPrompt)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        config.pwa?.showInstallPrompt ? 'bg-[#310065]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.pwa?.showInstallPrompt ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* Eventos Especiales Config */}
              <section className="bg-white rounded-3xl border border-[#310065]/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#310065]/5 flex items-center justify-between bg-[#310065]/[0.02]">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#310065]" />
                    <h2 className="font-bold text-[#310065]">Probabilidades de Eventos Especiales</h2>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Probabilidad General de Aparición del Diablo */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-bold text-[#310065] uppercase tracking-wider flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-500 fill-red-500/20 animate-pulse" />
                        Probabilidad General de Aparición del Diablo
                      </label>
                      <span className="px-3 py-1 bg-red-50 text-red-700 font-extrabold text-[12px] rounded-lg border border-red-100">
                        {Math.round((config.devilTrap?.spawnProbability ?? 0.15) * 100)}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={config.devilTrap?.spawnProbability ?? 0.15}
                      onChange={(e) => updateDevilTrapSetting('spawnProbability', parseFloat(e.target.value))}
                      className="w-full accent-red-600"
                    />
                    <div className="flex justify-between text-[11px] font-bold text-[#1b1b1e]/40">
                      <span>0% (Desactivado)</span>
                      <span>50%</span>
                      <span>100% (Siempre activo)</span>
                    </div>
                  </div>

                  {/* Ajustes de Combate del Diablo (POWER_MODE) */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-[#310065]/70 uppercase tracking-widest flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      Ajustes de POWER_MODE (Combate de Cartas)
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* correctAnswersToDefeat */}
                      <div className="flex items-center justify-between p-4 bg-[#faf9fc] rounded-2xl border border-[#310065]/5">
                        <div className="max-w-[70%]">
                          <h4 className="font-bold text-[#310065] text-xs uppercase tracking-wider">Aciertos para vencerlo</h4>
                          <p className="text-[10px] text-[#1b1b1e]/60 leading-tight">Respuestas correctas acumuladas necesarias para derrotar al diablo.</p>
                        </div>
                        <input 
                          type="number" 
                          min="1"
                          max="5"
                          value={config.devilTrap?.correctAnswersToDefeat ?? 2}
                          onChange={(e) => updateDevilTrapSetting('correctAnswersToDefeat', parseInt(e.target.value))}
                          className="w-14 bg-white border border-[#310065]/10 rounded-xl px-2 py-2 font-black text-center focus:ring-2 focus:ring-red-500 outline-none text-[#310065]"
                        />
                      </div>

                      {/* wrongAnswersToWin */}
                      <div className="flex items-center justify-between p-4 bg-[#faf9fc] rounded-2xl border border-[#310065]/5">
                        <div className="max-w-[70%]">
                          <h4 className="font-bold text-[#310065] text-xs uppercase tracking-wider">Fallos para que gane</h4>
                          <p className="text-[10px] text-[#1b1b1e]/60 leading-tight">Errores acumulados para que el diablo gane la trampa.</p>
                        </div>
                        <input 
                          type="number" 
                          min="1"
                          max="5"
                          value={config.devilTrap?.wrongAnswersToWin ?? 3}
                          onChange={(e) => updateDevilTrapSetting('wrongAnswersToWin', parseInt(e.target.value))}
                          className="w-14 bg-white border border-[#310065]/10 rounded-xl px-2 py-2 font-black text-center focus:ring-2 focus:ring-red-500 outline-none text-[#310065]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuración de Modo Observador del Diablo */}
                  <div className="pt-4 border-t border-slate-100 space-y-5">
                    <h3 className="text-xs font-black text-[#310065]/70 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                      Ajustes de OBSERVER_MODE (Diablo Observador)
                    </h3>

                    {/* Habilitar / Deshabilitar */}
                    <div className="flex items-center justify-between p-4 bg-[#faf9fc] rounded-2xl border border-[#310065]/5">
                      <div>
                        <h4 className="font-bold text-[#310065] text-sm">Habilitar Diablo Observador</h4>
                        <p className="text-[12px] text-[#1b1b1e]/60">Permite que el diablo aparezca de fondo sin activar trampas de cartas tapadas.</p>
                      </div>
                      <button
                        onClick={() => updateDevilTrapSetting('observerModeEnabled', !config.devilTrap?.observerModeEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          config.devilTrap?.observerModeEnabled ? 'bg-cyan-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            config.devilTrap?.observerModeEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Distribución Dinámica de Modos */}
                    <div className="bg-[#310065]/[0.02] border border-[#310065]/5 rounded-3xl p-5 space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#310065] text-xs uppercase tracking-widest">Distribución de Modos por Partida</h4>
                        <p className="text-[11px] text-slate-400">Si el diablo decide aparecer en la partida, los pesos definen cuál de los dos modos se le asignará en exclusiva.</p>
                      </div>

                      {/* Gráfico Proporcional en Caliente */}
                      <div className="h-6 w-full rounded-full bg-slate-100 overflow-hidden flex font-black text-[9px] text-white tracking-widest uppercase">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center transition-all duration-500" 
                          style={{ width: `${powerPercent}%` }}
                          title={`Modo Poder: ${powerPercent}%`}
                        >
                          {powerPercent > 12 && `Poder (${powerPercent}%)`}
                        </div>
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center transition-all duration-500" 
                          style={{ width: `${observerPercent}%` }}
                          title={`Modo Observador: ${observerPercent}%`}
                        >
                          {observerPercent > 12 && `Observador (${observerPercent}%)`}
                        </div>
                      </div>

                      {/* Slider Peso Modo Poder */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-[12px] font-bold text-[#310065]">
                          <span>Peso del Modo Poder (POWER_MODE)</span>
                          <span className="bg-red-50 border border-red-100 text-red-700 px-2 py-0.5 rounded-lg text-[11px]">
                            {powerWeight} (Proporción: {powerPercent}%)
                          </span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={powerWeight}
                          onChange={(e) => updateDevilTrapSetting('powerModeWeight', parseInt(e.target.value))}
                          className="w-full accent-red-500"
                        />
                      </div>

                      {/* Slider Peso Modo Observador */}
                      {obsEnabled ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[12px] font-bold text-[#310065]">
                            <span>Peso del Modo Observador (OBSERVER_MODE)</span>
                            <span className="bg-cyan-50 border border-cyan-100 text-cyan-700 px-2 py-0.5 rounded-lg text-[11px]">
                              {observerWeight} (Proporción: {observerPercent}%)
                            </span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={observerWeight}
                            onChange={(e) => updateDevilTrapSetting('observerModeWeight', parseInt(e.target.value))}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-400 font-semibold text-center italic">
                          El Modo Observador está deshabilitado. Toda irrupción se forzará al Modo Poder (100% de peso).
                        </div>
                      )}
                    </div>

                    {config.devilTrap?.observerModeEnabled && (
                      <>
                        {/* Probabilidad de Aparición */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[12px] font-bold text-[#310065]/80 uppercase tracking-wider flex items-center gap-1.5">
                              Probabilidad de Aparición (Observador)
                            </label>
                            <span className="px-3 py-1 bg-cyan-50 text-cyan-700 font-extrabold text-[12px] rounded-lg border border-cyan-100">
                              {Math.round((config.devilTrap?.observerModeAppearanceChance ?? 0.20) * 100)}%
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={config.devilTrap?.observerModeAppearanceChance ?? 0.20}
                            onChange={(e) => updateDevilTrapSetting('observerModeAppearanceChance', parseFloat(e.target.value))}
                            className="w-full accent-cyan-600"
                          />
                          <div className="flex justify-between text-[11px] font-bold text-[#1b1b1e]/40">
                            <span>0% (Desactivado)</span>
                            <span>50%</span>
                            <span>100% (Siempre activo)</span>
                          </div>
                        </div>

                        {/* Reaccionar al Jugador */}
                        <div className="flex items-center justify-between p-4 bg-[#faf9fc] rounded-2xl border border-[#310065]/5">
                          <div>
                            <h4 className="font-bold text-[#310065] text-sm">Gesticular y Reaccionar visualmente</h4>
                            <p className="text-[12px] text-[#1b1b1e]/60">El diablo cambiará de expresión ante aciertos, fallos y rachas.</p>
                          </div>
                          <button
                            onClick={() => updateDevilTrapSetting('observerModeCanReactToPlayer', !config.devilTrap?.observerModeCanReactToPlayer)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              config.devilTrap?.observerModeCanReactToPlayer ? 'bg-cyan-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                config.devilTrap?.observerModeCanReactToPlayer ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Reto Especial */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-bold text-[#310065] uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                        Probabilidad de Reto Especial (50% actual)
                      </label>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 font-extrabold text-[12px] rounded-lg border border-amber-100">
                        {Math.round((config.specialChallenge?.spawnProbability ?? 0.50) * 100)}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={config.specialChallenge?.spawnProbability ?? 0.50}
                      onChange={(e) => updateSpecialChallengeSetting('spawnProbability', parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[11px] font-bold text-[#1b1b1e]/40">
                      <span>0% (Desactivado)</span>
                      <span>50%</span>
                      <span>100% (Siempre activo)</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
