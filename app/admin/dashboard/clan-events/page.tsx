'use client';

import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { 
  getAllClanEvents, 
  createClanEvent, 
  updateClanEvent, 
  deleteClanEvent,
  getClanEventRanking,
  ClanEventModel,
  ClanEventScoreModel 
} from '@/lib/clan/eventsRepository';
import Link from 'next/link';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Trophy, 
  Calendar, 
  Clock, 
  Settings, 
  Coins, 
  Crown, 
  Zap, 
  Globe, 
  Eye, 
  X,
  Loader2,
  Lock,
  Check,
  ArrowLeft,
  Sparkles,
  Image
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClanEventsAdminPage() {
  const [events, setEvents] = useState<ClanEventModel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs: all, active, upcoming, ended
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClanEventModel | null>(null);
  
  // Ranking preview
  const [selectedEventForRanking, setSelectedEventForRanking] = useState<ClanEventModel | null>(null);
  const [rankingList, setRankingList] = useState<ClanEventScoreModel[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  // Form State
  const [titleES, setTitleES] = useState('');
  const [titleFR, setTitleFR] = useState('');
  const [titleHT, setTitleHT] = useState('');
  const [descES, setDescES] = useState('');
  const [descFR, setDescFR] = useState('');
  const [descHT, setDescHT] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'active' | 'ended'>('upcoming');
  const [showInArena, setShowInArena] = useState(true);
  
  // Rules State
  const [easyQs, setEasyQs] = useState(20);
  const [easyPoints, setEasyPoints] = useState(10);
  const [easyMult, setEasyMult] = useState(1.0);

  const [normalQs, setNormalQs] = useState(30);
  const [normalPoints, setNormalPoints] = useState(10);
  const [normalMult, setNormalMult] = useState(1.5);

  const [hardQs, setHardQs] = useState(40);
  const [hardPoints, setHardPoints] = useState(10);
  const [hardMult, setHardMult] = useState(2.0);

  const [pointsFastAnswer, setPointsFastAnswer] = useState(3);
  const [fastAnswerMaxSeconds, setFastAnswerMaxSeconds] = useState(7);
  const [pointsStreak5, setPointsStreak5] = useState(25);
  const [pointsHardQuestion, setPointsHardQuestion] = useState(20);
  const [pointsPerfectMatch, setPointsPerfectMatch] = useState(100);
  const [minContribution, setMinContribution] = useState(300);
  const [maxDailyPoints, setMaxDailyPoints] = useState(3000);

  // Rewards State
  const [top1Coins, setTop1Coins] = useState(3000);
  const [top1Crowns, setTop1Crowns] = useState(500);
  const [top1Xp, setTop1Xp] = useState(1000);
  const [top1Chest, setTop1Chest] = useState('legendary_chest');

  const [top2to5Coins, setTop2to5Coins] = useState(2000);
  const [top2to5Crowns, setTop2to5Crowns] = useState(300);
  const [top2to5Xp, setTop2to5Xp] = useState(700);
  const [top2to5Chest, setTop2to5Chest] = useState('epic_chest');

  const [top6to20Coins, setTop6to20Coins] = useState(1000);
  const [top6to20Crowns, setTop6to20Crowns] = useState(150);
  const [top6to20Xp, setTop6to20Xp] = useState(400);
  const [top6to20Chest, setTop6to20Chest] = useState('rare_chest');

  const [partCoins, setPartCoins] = useState(300);
  const [partCrowns, setPartCrowns] = useState(50);
  const [partXp, setPartXp] = useState(100);
  const [partChest, setPartChest] = useState('common_chest');

  // Dates
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  // Slideshow States
  const [slideshowImages, setSlideshowImages] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);

  const handleAddManualImage = () => {
    if (!manualImageUrl) return;
    setSlideshowImages(prev => [...prev, manualImageUrl]);
    setManualImageUrl('');
    toast.success('Imagen agregada al slideshow');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSlideshowImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    toast.success('Imagen eliminada del slideshow');
  };

  const handleGenerateAiImage = async () => {
    if (!titleES) {
      toast.error('Por favor, ingresa el título en español para guiar a la IA');
      return;
    }
    
    setGeneratingImage(true);
    try {
      const prompt = `Ilustración digital bíblica e histórica de alta calidad, estilo premium, iluminación majestuosa, temática o representación visual inspirada en: "${titleES}". Descripción: "${descES}". Evitar textos o letras en la imagen, composición limpia de estilo artístico moderno.`;
      
      const response = await fetch('/api/admin/generate-event-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error en la generación');
      }

      const { image } = await response.json();
      
      // Upload to Firebase Storage
      const { ref: storageRef, uploadString, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/lib/firebase');
      
      const filename = `assets/clan-events/ai_event_${Date.now()}.jpg`;
      const sRef = storageRef(storage, filename);
      
      await uploadString(sRef, image, 'data_url');
      const downloadUrl = await getDownloadURL(sRef);
      
      setSlideshowImages(prev => [...prev, downloadUrl]);
      toast.success('¡Imagen generada con IA y subida correctamente!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al generar la imagen con IA');
    } finally {
      setGeneratingImage(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getAllClanEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar la lista de eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitleES('Copa de Sabiduría Bíblica');
    setTitleFR('Coupe de la Sagesse Biblique');
    setTitleHT('Koup Sajès Biblik la');
    setDescES('Compite junto a tu clan respondiendo preguntas bíblicas. Cada respuesta correcta suma puntos para tu clan.');
    setDescFR('Affrontez d\'autres clans en répondant aux questions bibliques.');
    setDescHT('Konpetisyon ansanm ak klan ou pou reponn kesyon biblik yo.');
    setBannerUrl('');
    setStatus('upcoming');
    setShowInArena(true);
    setStartAt(new Date().toISOString().substring(0, 16));
    setEndAt(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16));
    setSlideshowImages([]);
    setManualImageUrl('');
    
    // Default rules & rewards
    setEasyQs(20); setEasyPoints(10); setEasyMult(1.0);
    setNormalQs(30); setNormalPoints(10); setNormalMult(1.5);
    setHardQs(40); setHardPoints(10); setHardMult(2.0);
    setPointsFastAnswer(3); setFastAnswerMaxSeconds(7);
    setPointsStreak5(25); setPointsHardQuestion(20); setPointsPerfectMatch(100);
    setMinContribution(300); setMaxDailyPoints(3000);

    setTop1Coins(3000); setTop1Crowns(500); setTop1Xp(1000); setTop1Chest('legendary_chest');
    setTop2to5Coins(2000); setTop2to5Crowns(300); setTop2to5Xp(700); setTop2to5Chest('epic_chest');
    setTop6to20Coins(1000); setTop6to20Crowns(150); setTop6to20Xp(400); setTop6to20Chest('rare_chest');
    setPartCoins(300); setPartCrowns(50); setPartXp(100); setPartChest('common_chest');

    setIsModalOpen(true);
  };

  const openEditModal = (event: ClanEventModel) => {
    setEditingEvent(event);
    setTitleES(event.titleES || event.title);
    setTitleFR(event.titleFR || event.title);
    setTitleHT(event.titleHT || event.title);
    setDescES(event.descriptionES || event.description);
    setDescFR(event.descriptionFR || event.description);
    setDescHT(event.descriptionHT || event.description);
    setBannerUrl(event.bannerUrl || '');
    setStatus(event.status);
    setShowInArena(event.showInArena);
    
    // Parse Dates safely to datetime-local input string
    try {
      setStartAt(new Date(event.startAt).toISOString().substring(0, 16));
      setEndAt(new Date(event.endAt).toISOString().substring(0, 16));
    } catch {
      setStartAt('');
      setEndAt('');
    }

    // Rules
    setEasyQs(event.rules.difficulties.easy.questionsPerMatch);
    setEasyPoints(event.rules.difficulties.easy.pointsCorrect);
    setEasyMult(event.rules.difficulties.easy.multiplier);
    setNormalQs(event.rules.difficulties.normal.questionsPerMatch);
    setNormalPoints(event.rules.difficulties.normal.pointsCorrect);
    setNormalMult(event.rules.difficulties.normal.multiplier);
    setHardQs(event.rules.difficulties.hard.questionsPerMatch);
    setHardPoints(event.rules.difficulties.hard.pointsCorrect);
    setHardMult(event.rules.difficulties.hard.multiplier);

    setPointsFastAnswer(event.rules.pointsFastAnswer);
    setFastAnswerMaxSeconds(event.rules.fastAnswerMaxSeconds);
    setPointsStreak5(event.rules.pointsStreak5);
    setPointsHardQuestion(event.rules.pointsHardQuestion);
    setPointsPerfectMatch(event.rules.pointsPerfectMatch);
    setMinContribution(event.rules.minContributionToReward);
    setMaxDailyPoints(event.rules.maxDailyPointsPerUser);

    // Rewards
    setTop1Coins(event.rewards.top1.coins);
    setTop1Crowns(event.rewards.top1.crowns);
    setTop1Xp(event.rewards.top1.clanXp);
    setTop1Chest(event.rewards.top1.chest);

    setTop2to5Coins(event.rewards.top2to5.coins);
    setTop2to5Crowns(event.rewards.top2to5.crowns);
    setTop2to5Xp(event.rewards.top2to5.clanXp);
    setTop2to5Chest(event.rewards.top2to5.chest);

    setTop6to20Coins(event.rewards.top6to20.coins);
    setTop6to20Crowns(event.rewards.top6to20.crowns);
    setTop6to20Xp(event.rewards.top6to20.clanXp);
    setTop6to20Chest(event.rewards.top6to20.chest);

    setPartCoins(event.rewards.participation.coins);
    setPartCrowns(event.rewards.participation.crowns);
    setPartXp(event.rewards.participation.clanXp);
    setPartChest(event.rewards.participation.chest);
    setSlideshowImages(event.slideshowImages || []);
    setManualImageUrl('');

    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const eventPayload: Omit<ClanEventModel, 'id' | 'createdAt' | 'updatedAt'> = {
      title: titleES, // Keep title config
      description: descES,
      titleES,
      titleFR,
      titleHT,
      descriptionES: descES,
      descriptionFR: descFR,
      descriptionHT: descHT,
      type: 'CLAN_BATTLE',
      status,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      bannerUrl,
      showInArena,
      slideshowImages,
      rules: {
        difficulties: {
          easy: { label: 'Fácil', questionsPerMatch: easyQs, pointsCorrect: easyPoints, multiplier: easyMult },
          normal: { label: 'Normal', questionsPerMatch: normalQs, pointsCorrect: normalPoints, multiplier: normalMult },
          hard: { label: 'Difícil', questionsPerMatch: hardQs, pointsCorrect: hardPoints, multiplier: hardMult }
        },
        pointsFastAnswer,
        fastAnswerMaxSeconds,
        pointsStreak5,
        pointsHardQuestion,
        pointsPerfectMatch,
        minContributionToReward: minContribution,
        maxDailyPointsPerUser: maxDailyPoints,
        allowedQuestionTypes: ['multiple_choice', 'true_false', 'complete_phrase', 'trap_question']
      },
      rewards: {
        top1: { coins: top1Coins, crowns: top1Crowns, clanXp: top1Xp, chest: top1Chest },
        top2to5: { coins: top2to5Coins, crowns: top2to5Crowns, clanXp: top2to5Xp, chest: top2to5Chest },
        top6to20: { coins: top6to20Coins, crowns: top6to20Crowns, clanXp: top6to20Xp, chest: top6to20Chest },
        participation: { coins: partCoins, crowns: partCrowns, clanXp: partXp, chest: partChest }
      }
    };

    try {
      if (editingEvent) {
        await updateClanEvent(editingEvent.id, eventPayload);
        toast.success('¡Evento actualizado con éxito!');
      } else {
        await createClanEvent(eventPayload);
        toast.success('¡Evento creado con éxito!');
      }
      setIsModalOpen(false);
      loadEvents();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar la configuración del evento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este evento permanentemente? Esta acción es irreversible.')) return;
    try {
      await deleteClanEvent(id);
      toast.success('Evento eliminado correctamente');
      loadEvents();
    } catch (e) {
      console.error(e);
      toast.error('Error al eliminar el evento');
    }
  };

  const showRanking = async (event: ClanEventModel) => {
    setSelectedEventForRanking(event);
    setRankingList([]);
    setLoadingRanking(true);
    try {
      const ranks = await getClanEventRanking(event.id);
      setRankingList(ranks);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar la clasificación');
    } finally {
      setLoadingRanking(false);
    }
  };

  const filteredEvents = events.filter((evt) => {
    if (activeTab === 'all') return true;
    return evt.status === activeTab;
  });

  return (
    <AdminGuard>
      <div className="bg-[#f5f3f7] text-[#1b1b1e] min-h-screen font-sans selection:bg-[#eddcff]">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-2xl flex items-center gap-6 px-10 py-5 sticky top-0 z-40 border-b border-[#1b1b1e]/5">
          <Link href="/admin/dashboard" className="p-2 bg-slate-50 border border-slate-100 rounded-full hover:bg-[#310065]/5 transition">
            <ArrowLeft className="w-5 h-5 text-[#310065]" />
          </Link>
          <div className="flex-grow">
            <h2 className="font-serif text-[22px] font-black text-[#310065] tracking-tight">Eventos de Clan</h2>
            <p className="text-[#7c7483] font-medium text-xs mt-1">Configura torneos grupales y batallas de clanes</p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="bg-[#0A84FF] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#0A84FF]/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Evento
          </button>
        </header>

        {/* Content canvas */}
        <main className="px-10 py-8 max-w-5xl mx-auto space-y-6">

          {/* Filter tabs */}
          <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
            {(['all', 'active', 'upcoming', 'ended'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedEventForRanking(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-[#310065] text-white shadow-sm'
                    : 'text-[#7c7483] hover:bg-slate-200/50'
                }`}
              >
                {tab === 'all' ? 'Todos' : tab === 'active' ? 'Activos' : tab === 'upcoming' ? 'Próximos' : 'Finalizados'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* List area */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="bg-white rounded-[24px] p-12 flex flex-col items-center justify-center gap-2 border border-slate-100">
                  <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
                  <p className="text-xs text-[#64748B]">Buscando eventos en el reino...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="bg-white rounded-[24px] p-12 text-center border border-slate-100">
                  <p className="text-xs text-[#64748B]">No se encontraron eventos en esta categoría.</p>
                </div>
              ) : (
                filteredEvents.map((evt) => (
                  <div key={evt.id} className="bg-white rounded-[24px] p-6 border border-black/[0.03] shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            evt.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : evt.status === 'upcoming'
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {evt.status === 'active' ? 'En curso' : evt.status === 'upcoming' ? 'Próximo' : 'Finalizado'}
                          </span>
                          {evt.showInArena && (
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-blue-100">
                              En Arena
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif font-black text-lg text-[#310065] mt-2">{evt.title}</h3>
                        <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{evt.description}</p>
                      </div>
                      
                      {/* Dates details */}
                      <div className="text-right text-[11px] text-[#64748B] space-y-1">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Inicio: {new Date(evt.startAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Clock className="w-3.5 h-3.5 text-red-400" />
                          <span>Fin: {new Date(evt.endAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 pt-4 flex justify-between items-center">
                      <button
                        onClick={() => showRanking(evt)}
                        className="text-xs font-black text-[#0A84FF] hover:opacity-80 flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Clasificación
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(evt)}
                          className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(evt.id)}
                          className="p-2 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Side Auditor panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[24px] p-6 border border-black/[0.03] shadow-sm sticky top-28 space-y-4 min-h-[300px]">
                <h3 className="font-serif font-black text-sm text-[#310065] flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Trophy className="w-4 h-4 text-[#cba72f]" />
                  Clasificación del Evento
                </h3>

                {selectedEventForRanking ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Evento Seleccionado</p>
                      <h4 className="font-bold text-xs text-[#0F172A] mt-0.5">{selectedEventForRanking.title}</h4>
                    </div>

                    {loadingRanking ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs text-[#64748B]">
                        <Loader2 className="w-6 h-6 animate-spin text-[#0A84FF]" />
                        Cargando puntuaciones...
                      </div>
                    ) : rankingList.length === 0 ? (
                      <p className="text-center text-xs text-[#64748B] py-12">No hay clanes registrados en este ranking aún.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-1">
                        {rankingList.map((rank, index) => (
                          <div key={rank.clanId} className="flex justify-between items-center py-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 text-center font-black text-[#64748B]">#{index + 1}</span>
                              <span className="font-bold text-[#0F172A]">{rank.clanName}</span>
                            </div>
                            <span className="font-serif font-black text-[#0A84FF]">{rank.totalPoints.toLocaleString()} pts</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-xs text-[#64748B] py-20">
                    <Trophy className="w-10 h-10 text-slate-300 mb-2" />
                    Selecciona un evento de la lista para auditar su ranking en tiempo real.
                  </div>
                )}
              </div>
            </div>

          </div>

        </main>

        {/* Modal for Create/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl relative border border-slate-100 flex flex-col">
              
              {/* Modal Header */}
              <div className="sticky top-0 bg-white px-8 py-5 border-b border-slate-100 flex justify-between items-center z-10">
                <h3 className="font-serif font-black text-lg text-[#310065]">
                  {editingEvent ? 'Editar Evento de Clan' : 'Nuevo Evento de Clan'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="p-8 space-y-6 flex-grow">
                
                {/* 1. CONFIG GENERAL */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-[#310065] uppercase tracking-widest border-b border-slate-100 pb-1">
                    1. Información General (Multi-idioma)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Título (ES)</label>
                      <input type="text" value={titleES} onChange={e => setTitleES(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Título (FR)</label>
                      <input type="text" value={titleFR} onChange={e => setTitleFR(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Título (HT)</label>
                      <input type="text" value={titleHT} onChange={e => setTitleHT(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Descripción (ES)</label>
                      <textarea value={descES} onChange={e => setDescES(e.target.value)} required rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white resize-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Descripción (FR)</label>
                      <textarea value={descFR} onChange={e => setDescFR(e.target.value)} required rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white resize-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Descripción (HT)</label>
                      <textarea value={descHT} onChange={e => setDescHT(e.target.value)} required rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white resize-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">URL de Banner</label>
                      <input type="text" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Estado</label>
                      <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white">
                        <option value="upcoming">Próximo (Upcoming)</option>
                        <option value="active">Activo (Active)</option>
                        <option value="ended">Finalizado (Ended)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pt-5">
                      <input type="checkbox" id="showInArena" checked={showInArena} onChange={e => setShowInArena(e.target.checked)} className="w-4 h-4 rounded text-[#0A84FF] border-slate-300 focus:ring-[#0A84FF]" />
                      <label htmlFor="showInArena" className="text-xs font-bold text-[#0F172A]">Mostrar en Arena</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Fecha de Inicio</label>
                      <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Fecha de Fin</label>
                      <input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white" />
                    </div>
                  </div>
                </div>

                {/* 1.5. IMÁGENES DEL SLIDESHOW */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                    <h4 className="font-bold text-xs text-[#310065] uppercase tracking-widest">
                      1.5. Diapositivas del Evento (Slideshow)
                    </h4>
                    <span className="text-[10px] text-slate-400">Las imágenes se muestran en un carrusel dinámico en la app</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Agregar URL manual */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block">Agregar URL de Imagen Manualmente</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://ejemplo.com/imagen.jpg"
                          value={manualImageUrl}
                          onChange={e => setManualImageUrl(e.target.value)}
                          className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#0A84FF] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddManualImage}
                          className="bg-slate-100 hover:bg-slate-200 text-[#310065] px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>

                    {/* Generar con IA */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block">Generación de Imagen Temática con IA</label>
                      <button
                        type="button"
                        onClick={handleGenerateAiImage}
                        disabled={generatingImage || !titleES}
                        className="w-full bg-gradient-to-r from-[#0A84FF] to-[#30B0C7] text-white py-2.5 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generando y subiendo imagen...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generar Imagen con IA
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Lista de Imágenes actuales */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block">Imágenes en el Slideshow ({slideshowImages.length})</label>
                    {slideshowImages.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">No hay imágenes configuradas para el carrusel de diapositivas.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {slideshowImages.map((url, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-200 bg-white shadow-sm">
                            <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. REGLAS */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-[#310065] uppercase tracking-widest border-b border-slate-100 pb-1">
                    2. Reglas del Evento y Multiplicadores
                  </h4>

                  {/* Dificultades */}
                  <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-[#34C759] uppercase tracking-wider">Fácil</p>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Preguntas</label>
                        <input type="number" value={easyQs} onChange={e => setEasyQs(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Mult.</label>
                        <input type="number" step="0.1" value={easyMult} onChange={e => setEasyMult(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-[#0A84FF] uppercase tracking-wider">Normal</p>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Preguntas</label>
                        <input type="number" value={normalQs} onChange={e => setNormalQs(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Mult.</label>
                        <input type="number" step="0.1" value={normalMult} onChange={e => setNormalMult(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Difícil</p>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Preguntas</label>
                        <input type="number" value={hardQs} onChange={e => setHardQs(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Mult.</label>
                        <input type="number" step="0.1" value={hardMult} onChange={e => setHardMult(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Bonificaciones */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-[#64748B] uppercase">Puntos Correcta</label>
                      <input type="number" value={easyPoints} onChange={e => {
                        setEasyPoints(Number(e.target.value));
                        setNormalPoints(Number(e.target.value));
                        setHardPoints(Number(e.target.value));
                      }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#64748B] uppercase">Bonus Rápida</label>
                      <input type="number" value={pointsFastAnswer} onChange={e => setPointsFastAnswer(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#64748B] uppercase">Tiempo Rápida (s)</label>
                      <input type="number" value={fastAnswerMaxSeconds} onChange={e => setFastAnswerMaxSeconds(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#64748B] uppercase">Bonus Racha 5</label>
                      <input type="number" value={pointsStreak5} onChange={e => setPointsStreak5(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-[#64748B] uppercase">Bonus Difícil</label>
                      <input type="number" value={pointsHardQuestion} onChange={e => setPointsHardQuestion(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#64748B] uppercase">Bonus Perfecta</label>
                      <input type="number" value={pointsPerfectMatch} onChange={e => setPointsPerfectMatch(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#64748B] uppercase">Contribución Mín.</label>
                      <input type="number" value={minContribution} onChange={e => setMinContribution(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#64748B] uppercase">Límite Diario</label>
                      <input type="number" value={maxDailyPoints} onChange={e => setMaxDailyPoints(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" />
                    </div>
                  </div>
                </div>

                {/* 3. RECOMPENSAS */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-[#310065] uppercase tracking-widest border-b border-slate-100 pb-1">
                    3. Configuración de Recompensas
                  </h4>

                  {/* Top 1 */}
                  <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100/50 space-y-3">
                    <p className="text-xs font-bold text-amber-700">🥇 Rango 1 (Ganador)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[9px] text-[#64748B]">Monedas</label>
                        <input type="number" value={top1Coins} onChange={e => setTop1Coins(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Coronas</label>
                        <input type="number" value={top1Crowns} onChange={e => setTop1Crowns(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">XP Clan</label>
                        <input type="number" value={top1Xp} onChange={e => setTop1Xp(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Cofre</label>
                        <input type="text" value={top1Chest} onChange={e => setTop1Chest(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Top 2 al 5 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-700">🥈 Rango 2 al 5</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[9px] text-[#64748B]">Monedas</label>
                        <input type="number" value={top2to5Coins} onChange={e => setTop2to5Coins(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Coronas</label>
                        <input type="number" value={top2to5Crowns} onChange={e => setTop2to5Crowns(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">XP Clan</label>
                        <input type="number" value={top2to5Xp} onChange={e => setTop2to5Xp(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Cofre</label>
                        <input type="text" value={top2to5Chest} onChange={e => setTop2to5Chest(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Top 6 al 20 */}
                  <div className="bg-amber-50/10 p-4 rounded-2xl border border-amber-100/20 space-y-3">
                    <p className="text-xs font-bold text-amber-900">🥉 Rango 6 al 20</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[9px] text-[#64748B]">Monedas</label>
                        <input type="number" value={top6to20Coins} onChange={e => setTop6to20Coins(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Coronas</label>
                        <input type="number" value={top6to20Crowns} onChange={e => setTop6to20Crowns(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">XP Clan</label>
                        <input type="number" value={top6to20Xp} onChange={e => setTop6to20Xp(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Cofre</label>
                        <input type="text" value={top6to20Chest} onChange={e => setTop6to20Chest(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Participacion */}
                  <div className="bg-slate-50/30 p-4 rounded-2xl border border-slate-100/50 space-y-3">
                    <p className="text-xs font-bold text-[#64748B]">🎁 Participación General</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[9px] text-[#64748B]">Monedas</label>
                        <input type="number" value={partCoins} onChange={e => setPartCoins(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Coronas</label>
                        <input type="number" value={partCrowns} onChange={e => setPartCrowns(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">XP Clan</label>
                        <input type="number" value={partXp} onChange={e => setPartXp(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#64748B]">Cofre</label>
                        <input type="text" value={partChest} onChange={e => setPartChest(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-white py-5 border-t border-slate-100 flex justify-end gap-3 z-10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#0A84FF] text-white hover:bg-[#0A84FF]/90 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Guardar Cambios
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  );
}
