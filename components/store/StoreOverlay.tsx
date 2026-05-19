'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { 
  X, 
  Check, 
  ChevronRight, 
  User, 
  ShoppingBag, 
  Zap, 
  Heart, 
  Shield, 
  Briefcase, 
  Info,
  Loader2,
  Sparkles,
  ArrowRight,
  Palette,
  Clock,
  LayoutGrid,
  Settings2
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { buyResource, buyPower, buyCosmetic, equipCosmetic } from '@/lib/store/repository';
import { getStoreItems, StoreItem } from '@/lib/store/admin-repository';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// --- ASSETS ---
const assets = {
  coin: '/assets/store/currency/coin.png',
  crown: '/assets/store/currency/crown.png',
  success: '/assets/store/ui/success-check.png',
  storeBag: '/assets/store/ui/store-bag.png'
};

export default function StoreOverlay() {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Energy');

  // Sync state with global event for visibility tracking
  useEffect(() => {
    const event = new CustomEvent('store-visibility-changed', { detail: { isOpen } });
    window.dispatchEvent(event);
  }, [isOpen]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [successModal, setSuccessModal] = useState<{show: boolean, type: string, name: string}>({show: false, type: '', name: ''});
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    item: StoreItem | null;
    onConfirm: ((currencyType: 'coin' | 'crown', cost: number) => void) | null;
  }>({ show: false, item: null, onConfirm: null });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen for global event
  useEffect(() => {
    const handleOpenStore = () => setIsOpen(true);
    window.addEventListener('open-store', handleOpenStore);
    return () => window.removeEventListener('open-store', handleOpenStore);
  }, []);

  // Fetch items from DB
  useEffect(() => {
    if (isOpen) {
      fetchStoreItems();
    }
  }, [isOpen]);

  async function fetchStoreItems() {
    try {
      setLoadingItems(true);
      const data = await getStoreItems();
      setItems(data.filter(i => i.isActive));
    } catch (error) {
      console.error("Error fetching store items:", error);
    } finally {
      setLoadingItems(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const currentCoins = user?.coins || 0;
  const currentCrowns = user?.crowns || 0;
  const inventory = user?.inventory || {};
  const ownedFrames = user?.ownedFrames || [];
  const ownedAvatars = user?.ownedAvatars || [];

  // Group items by type
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, StoreItem[]>);
  }, [items]);

  const showConfirmModal = (item: StoreItem, onConfirm: (currencyType: 'coin' | 'crown', cost: number) => void) => {
    setConfirmModal({ show: true, item, onConfirm });
  };

  const handleBuyResource = async (storeItem: StoreItem) => {
    showConfirmModal(storeItem, async (currencyType, cost) => {
      if (isProcessing) return;
      const balance = currencyType === 'coin' ? currentCoins : currentCrowns;
      if (balance < cost) {
        toast.error(currencyType === 'coin' ? 'Ou pa gen ase kòb.' : 'Ou pa gen ase kouwòn.');
        return;
      }
      try {
        setIsProcessing(true);
        const resType = storeItem.type === 'energy' ? 'energy' : 'heart';
        await buyResource(user!.uid, resType, storeItem.amount || 0, cost, currencyType);
        setSuccessModal({show: true, type: storeItem.type === 'energy' ? 'Enèji' : 'Kè', name: `+${storeItem.amount}`});
      } catch (e: any) {
        toast.error(e.message || 'Erè nan acha a.');
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleBuyPower = async (storeItem: StoreItem) => {
    showConfirmModal(storeItem, async (currencyType, cost) => {
      if (isProcessing) return;
      const balance = currencyType === 'coin' ? currentCoins : currentCrowns;
      if (balance < cost) {
        toast.error(currencyType === 'coin' ? 'Ou pa gen ase kòb.' : 'Ou pa gen ase kouwòn.');
        return;
      }
      try {
        setIsProcessing(true);
        await buyPower(user!.uid, storeItem.itemId, 1, cost, currencyType);
        setSuccessModal({show: true, type: 'Pouvwa', name: storeItem.name});
      } catch (e: any) {
        toast.error(e.message || 'Erè nan acha a.');
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleBuyCosmetic = async (storeItem: StoreItem) => {
    const cosmeticType = storeItem.type === 'frames' ? 'frame' : 'avatar';
    const isOwned = storeItem.type === 'frames' ? ownedFrames.includes(storeItem.itemId) : ownedAvatars.includes(storeItem.itemId);
    
    // If already owned, just equip it (no confirmation needed)
    if (isOwned) {
      try {
        setIsProcessing(true);
        await equipCosmetic(user!.uid, cosmeticType, storeItem.itemId);
        toast.success(`${storeItem.name} ekipe.`);
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Show confirmation before buying
    showConfirmModal(storeItem, async (currencyType, cost) => {
      const balance = currencyType === 'coin' ? currentCoins : currentCrowns;
      if (balance < cost) {
        toast.error(currencyType === 'coin' ? 'Ou pa gen ase kòb.' : 'Ou pa gen ase kouwòn.');
        return;
      }
      try {
        setIsProcessing(true);
        await buyCosmetic(user!.uid, cosmeticType, storeItem.itemId, cost, currencyType);
        await equipCosmetic(user!.uid, cosmeticType, storeItem.itemId);
        setSuccessModal({show: true, type: storeItem.type === 'frames' ? 'Kadr' : 'Avatar', name: storeItem.name});
      } catch (e: any) {
        toast.error(e.message || 'Erè nan acha a.');
      } finally {
        setIsProcessing(false);
      }
    });
  };

  // --- UI COMPONENTS ---

  const CurrencyBadge = ({ amount, icon, color }: { amount: number, icon: string, color: string }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-sm border border-black/5`}>
      <div className="w-4 h-4 relative">
        <Image src={icon} alt="Currency" fill className="object-contain" />
      </div>
      <span className={`font-black text-[13px] ${color}`}>{amount.toLocaleString()}</span>
    </div>
  );

  const SectionHeader = ({ title, onSeeAll }: { title: string, onSeeAll: () => void }) => (
    <div className="flex justify-between items-end mb-4 px-1">
      <h2 className="text-[#1b1b1e] font-black text-2xl tracking-tight leading-none">{title}</h2>
      <button onClick={onSeeAll} className="text-[#310065] font-bold text-sm flex items-center gap-0.5 hover:opacity-60 transition-opacity">
        Gade tout <ChevronRight size={16} />
      </button>
    </div>
  );

  // --- TABS RENDERING ---



  if (!user) return null;

  return (
    <>

      {/* Main Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-white flex flex-col"
          >
            {/* iOS Style Header */}
            <header className="px-6 pt-10 pb-4 border-b border-black/5 sticky top-0 bg-white z-20">
              <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#310065] rounded-xl flex items-center justify-center shadow-lg shadow-[#310065]/20">
                    <ShoppingBag className="text-white" size={20} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[#310065] text-[10px] font-black uppercase tracking-[0.15em] opacity-80 leading-tight">Wayòm Bondye</p>
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Koleksyon Sentespri</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2 mr-2">
                    <CurrencyBadge amount={currentCoins} icon={assets.coin} color="text-[#cba72f]" />
                    <CurrencyBadge amount={currentCrowns} icon={assets.crown} color="text-[#310065]" />
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-[#1b1b1e] hover:bg-black/10 transition-all"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* iOS Style Segmented Control - Modern pill look */}
              <div className="max-w-4xl mx-auto">
                <nav className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 p-1 bg-black/5 rounded-[1.5rem] w-fit">
                  {[

                    { id: 'Energy', label: 'Enèji', icon: Zap },
                    { id: 'Hearts', label: 'Vi', icon: Heart },
                    { id: 'Powers', label: 'Pouvwa', icon: Shield },
                    { id: 'Profile', label: 'Look', icon: Palette },
                    { id: 'Inventory', label: 'Sak ou', icon: Briefcase }
                  ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-2xl font-black text-[13px] transition-all whitespace-nowrap flex items-center gap-2 ${
                          isActive 
                            ? 'bg-white text-[#310065] shadow-sm scale-100' 
                            : 'text-gray-500 hover:text-[#1b1b1e]'
                        }`}
                      >
                        <tab.icon size={15} strokeWidth={isActive ? 3 : 2} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </header>

            {/* Scrollable Content */}
            <main ref={scrollRef} className="flex-1 overflow-y-auto bg-white px-4 py-6">
              <div className="max-w-4xl mx-auto pb-32">
                {loadingItems ? (
                  <div className="flex flex-col items-center justify-center py-40">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 animate-spin text-[#310065] opacity-20" />
                      <ShoppingBag className="absolute inset-0 m-auto text-[#310065] w-5 h-5" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-6">Chaje Boutik la...</p>
                  </div>
                ) : (
                  <>


                    {/* Resources */}
                    {(activeTab === 'Energy' || activeTab === 'Hearts') && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="grid grid-cols-2 gap-4"
                      >
                        {(groupedItems[activeTab === 'Energy' ? 'energy' : 'hearts'] || []).map(p => (
                          <button 
                            key={p.id}
                            onClick={() => handleBuyResource(p)}
                            disabled={isProcessing}
                            className="bg-white rounded-[2rem] p-5 border border-black/[0.04] shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-center flex flex-col items-center group relative overflow-hidden"
                          >
                            {/* Opaque White Background for Icon Container */}
                            <div className="relative w-20 h-20 mb-4 z-10">
                              <div className="absolute inset-0 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-black/[0.03]" />
                              <div 
                                className="absolute inset-0 m-2 group-hover:scale-110 transition-transform duration-500"
                                style={{
                                  backgroundImage: `url(${p.icon})`,
                                  backgroundSize: 'contain',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'center'
                                }}
                              />
                            </div>
                            
                            <h3 className="text-[#1b1b1e] font-black text-sm tracking-tight leading-tight mb-1">{p.name}</h3>
                            <p className="text-gray-400 text-[10px] mb-4 font-bold uppercase tracking-wider">{p.amount} {activeTab === 'Energy' ? 'Enèji' : 'Vi'}</p>
                            
                            <div className="w-full flex items-center justify-center gap-4 bg-[#f8f7fc] group-hover:bg-[#310065] group-hover:text-white py-3 rounded-2xl font-black text-xs transition-colors border border-black/[0.03] shadow-inner">
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 relative">
                                  <Image src={assets.coin} alt="Coin" fill className="object-contain" />
                                </div>
                                <span>{p.cost.toLocaleString()}</span>
                              </div>
                              <div className="w-px h-3 bg-black/10 group-hover:bg-white/20" />
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 relative">
                                  <Image src={assets.crown} alt="Crown" fill className="object-contain" />
                                </div>
                                <span>{Math.ceil(p.cost / 2).toLocaleString()}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {/* Powers */}
                    {activeTab === 'Powers' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="grid grid-cols-2 gap-4"
                      >
                        {(groupedItems.powers || []).map(p => (
                          <div 
                            key={p.id} 
                            className="bg-white rounded-[2rem] p-5 border border-black/[0.04] shadow-sm flex flex-col items-center group hover:shadow-xl transition-all relative text-center"
                          >
                            <div className="relative w-20 h-20 mb-4">
                              <div className="absolute inset-0 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-black/[0.03]" />
                              <div 
                                className="absolute inset-0 m-2 group-hover:scale-110 transition-transform duration-500"
                                style={{
                                  backgroundImage: `url(${p.icon})`,
                                  backgroundSize: 'contain',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'center'
                                }}
                              />
                            </div>

                            <h3 className="text-[#1b1b1e] font-black text-sm tracking-tight leading-tight mb-1">{p.name}</h3>
                            <p className="text-gray-400 text-[10px] mb-4 leading-snug font-medium line-clamp-2 px-2">{p.description}</p>
                            
                            <button 
                              onClick={() => handleBuyPower(p)}
                              disabled={isProcessing}
                              className="w-full flex items-center justify-center gap-4 bg-[#310065] text-white py-3 rounded-2xl font-black text-xs hover:bg-[#4a148c] shadow-lg shadow-[#310065]/10 active:scale-95 transition-all"
                            >
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 relative">
                                  <Image src={assets.coin} alt="Coin" fill className="object-contain" />
                                </div>
                                <span>{p.cost.toLocaleString()}</span>
                              </div>
                              <div className="w-px h-3 bg-white/20" />
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 relative">
                                  <Image src={assets.crown} alt="Crown" fill className="object-contain" />
                                </div>
                                <span>{Math.ceil(p.cost / 2).toLocaleString()}</span>
                              </div>
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Customization (Frames & Avatars) */}
                    {activeTab === 'Profile' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="space-y-12"
                      >
                        {['frames', 'avatars'].map(type => {
                          const catItems = groupedItems[type] || [];
                          if (catItems.length === 0) return null;
                          return (
                            <section key={type}>
                              <div className="flex items-center justify-between mb-6 px-1">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'frames' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {type === 'frames' ? <LayoutGrid size={20} /> : <User size={20} />}
                                  </div>
                                  <h2 className="text-[#1b1b1e] font-black text-xl tracking-tight uppercase">{type === 'frames' ? 'Kadr Pwofil' : 'Avatar'}</h2>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                {type === 'frames' && (() => {
                                  const isDefaultActive = !user.activeFrame || !['gold', 'fire', 'crown'].includes(user.activeFrame);
                                  return (
                                    <button 
                                      onClick={async () => {
                                        if (isProcessing) return;
                                        try {
                                          setIsProcessing(true);
                                          await equipCosmetic(user.uid, 'frame', null);
                                          toast.success(`Kadr Defo ekipe.`);
                                        } catch (e: any) {
                                          toast.error(e.message || 'Erè nan ekipe.');
                                        } finally {
                                          setIsProcessing(false);
                                        }
                                      }}
                                      className={`relative border-2 rounded-[2rem] p-5 flex flex-col items-center gap-3 transition-all active:scale-95 group ${
                                        isDefaultActive 
                                          ? 'bg-[#310065] border-[#310065] shadow-xl shadow-[#310065]/20' 
                                          : 'bg-white border-black/[0.03] hover:border-[#310065]/20 shadow-sm'
                                      }`}
                                    >
                                      {isDefaultActive && (
                                        <div className="absolute top-4 right-4 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg z-10 border-2 border-white scale-110">
                                          <Check size={10} strokeWidth={4}/>
                                        </div>
                                      )}
                                      <div className="relative w-20 h-20">
                                        <div className="absolute inset-0 bg-white rounded-2xl shadow-inner border border-black/[0.03]" />
                                        <div className="absolute inset-0 m-2 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center p-1">
                                           <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                             <defs>
                                               <linearGradient id="storeDefaultFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                 <stop offset="0%" stopColor="#e2e8f0" />
                                                 <stop offset="100%" stopColor="#cbd5e1" />
                                               </linearGradient>
                                             </defs>
                                             <rect x="4" y="4" width="92" height="92" rx="20" stroke="url(#storeDefaultFrameGrad)" strokeWidth="4.5" />
                                             <rect x="7.5" y="7.5" width="85" height="85" rx="16.5" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1" />
                                           </svg>
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <p className={`font-black text-xs leading-tight mb-1 ${isDefaultActive ? 'text-white' : 'text-[#1b1b1e]'}`}>Kadr Defo</p>
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${isDefaultActive ? 'text-white/60' : 'text-[#310065]'}`}>
                                          {isDefaultActive ? 'Ekipe' : 'Mete li'}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })()}
                                {catItems.map(item => {
                                  const isOwned = type === 'frames' ? ownedFrames.includes(item.itemId) : ownedAvatars.includes(item.itemId);
                                  const isActive = type === 'frames' ? user.activeFrame === item.itemId : user.activeAvatar === item.itemId;
                                  return (
                                    <button 
                                      key={item.id}
                                      onClick={() => handleBuyCosmetic(item)}
                                      className={`relative border-2 rounded-[2rem] p-5 flex flex-col items-center gap-3 transition-all active:scale-95 group ${
                                        isActive 
                                          ? 'bg-[#310065] border-[#310065] shadow-xl shadow-[#310065]/20' 
                                          : 'bg-white border-black/[0.03] hover:border-[#310065]/20 shadow-sm'
                                      }`}
                                    >
                                      {isActive && (
                                        <div className="absolute top-4 right-4 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg z-10 border-2 border-white scale-110">
                                          <Check size={10} strokeWidth={4}/>
                                        </div>
                                      )}
                                      <div className="relative w-20 h-20">
                                        <div className="absolute inset-0 bg-white rounded-2xl shadow-inner border border-black/[0.03]" />
                                        <div 
                                          className="absolute inset-0 m-2 group-hover:scale-110 transition-transform duration-500"
                                          style={{
                                            backgroundImage: `url(${item.icon})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center'
                                          }}
                                        />
                                      </div>
                                      <div className="text-center">
                                        <p className={`font-black text-xs leading-tight mb-1 ${isActive ? 'text-white' : 'text-[#1b1b1e]'}`}>{item.name}</p>
                                        {isOwned ? (
                                          <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-white/60' : 'text-[#310065]'}`}>
                                            {isActive ? 'Ekipe' : 'Mete li'}
                                          </span>
                                        ) : (
                                          <div className="flex items-center justify-center gap-3 bg-[#f8f7fc] px-3 py-1 rounded-full border border-black/[0.03] mt-1">
                                            <div className="flex items-center gap-1">
                                              <div className="w-3 h-3 relative"><Image src={assets.coin} alt="Coin" fill className="object-contain" /></div>
                                              <span className="text-[#cba72f] font-black text-[11px]">{item.cost.toLocaleString()}</span>
                                            </div>
                                            <div className="w-px h-2 bg-black/10" />
                                            <div className="flex items-center gap-1">
                                              <div className="w-3 h-3 relative"><Image src={assets.crown} alt="Crown" fill className="object-contain" /></div>
                                              <span className="text-[#310065] font-black text-[11px]">{Math.ceil(item.cost / 2).toLocaleString()}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </section>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* Inventory */}
                    {activeTab === 'Inventory' && (
                      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                        <div className="bg-white rounded-[3rem] p-10 border border-black/[0.04] shadow-sm text-center relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                              <Briefcase size={120} />
                           </div>
                           <div className="w-20 h-20 bg-[#f8f7fc] rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#310065] shadow-inner border border-black/[0.03]">
                              <Briefcase size={32} strokeWidth={2.5} />
                           </div>
                           <h2 className="text-3xl font-black text-[#1b1b1e] mb-2 tracking-tight">SA OU GENYEN</h2>
                           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Tout resous ak pouvwa ou kolekte</p>
                        </div>

                        <div className="space-y-8">
                           <div className="flex items-center gap-2 px-1">
                              <div className="w-1.5 h-6 bg-[#310065] rounded-full" />
                              <h3 className="font-black text-xl text-[#1b1b1e] tracking-tight">Pouvwa Aktif</h3>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              {(groupedItems.powers || []).map(p => {
                                const qty = (inventory[p.itemId] || 0) + (p.itemId === 'hintBible' ? (inventory['hint'] || 0) : 0);
                                if (qty <= 0) return null;
                                return (
                                  <div key={p.id} className="bg-white rounded-[2rem] p-5 border border-black/[0.04] shadow-sm flex flex-col items-center group hover:shadow-lg transition-all text-center">
                                    <div className="relative w-20 h-20 mb-4">
                                      <div className="absolute inset-0 bg-[#f8f7fc] rounded-2xl shadow-inner border border-black/[0.03]" />
                                      <div 
                                        className="absolute inset-0 m-2 group-hover:scale-110 transition-transform duration-500"
                                        style={{
                                          backgroundImage: `url(${p.icon})`,
                                          backgroundSize: 'contain',
                                          backgroundRepeat: 'no-repeat',
                                          backgroundPosition: 'center'
                                        }}
                                      />
                                    </div>
                                    <h3 className="text-[#1b1b1e] font-black text-sm tracking-tight mb-3">{p.name}</h3>
                                    <div className="bg-[#310065] text-white font-black px-5 py-2 flex items-center justify-center rounded-2xl text-lg shadow-lg shadow-[#310065]/20">
                                      {qty}
                                    </div>
                                  </div>
                                );
                              })}
                           </div>

                           {(ownedFrames.length > 0 || ownedAvatars.length > 0) && (
                             <>
                               <div className="flex items-center gap-2 px-1 pt-8">
                                  <div className="w-1.5 h-6 bg-[#310065] rounded-full" />
                                  <h3 className="font-black text-xl text-[#1b1b1e] tracking-tight">Koleksyon Look</h3>
                               </div>
                               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 pt-2">
                                  {[...ownedFrames, ...ownedAvatars].map(id => {
                                    const item = items.find(i => i.itemId === id);
                                    if (!item) return null;
                                    const isActive = user.activeFrame === id || user.activeAvatar === id;
                                    return (
                                      <div key={id} className={`flex-shrink-0 w-28 h-28 rounded-[2rem] border-2 flex items-center justify-center relative group transition-all ${isActive ? 'bg-[#310065] border-[#310065] shadow-xl shadow-[#310065]/20' : 'bg-white border-black/[0.04] shadow-sm'}`}>
                                        <div className="relative w-20 h-20">
                                          <div className={`absolute inset-0 bg-white rounded-2xl ${isActive ? 'shadow-lg' : 'shadow-inner'}`} />
                                          <div 
                                            className="absolute inset-0 m-2 group-hover:scale-110 transition-transform duration-500"
                                            style={{
                                              backgroundImage: `url(${item.icon})`,
                                              backgroundSize: 'contain',
                                              backgroundRepeat: 'no-repeat',
                                              backgroundPosition: 'center'
                                            }}
                                          />
                                        </div>
                                        {isActive && <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg z-10"><Check size={12} strokeWidth={5}/></div>}
                                      </div>
                                    );
                                  })}
                               </div>
                             </>
                           )}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Confirmation Modal - Premium iOS Style */}
      <AnimatePresence>
        {confirmModal.show && confirmModal.item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-6"
            onClick={() => setConfirmModal({ show: false, item: null, onConfirm: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[3rem] p-10 w-full max-w-sm relative shadow-2xl overflow-hidden"
            >
              {/* Animated Background Pulse */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#310065]/[0.03] rounded-full blur-3xl animate-pulse" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 relative mb-8">
                  <div className="absolute inset-0 bg-[#310065]/5 rounded-3xl rotate-6" />
                  <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-black/[0.05]" />
                  <div 
                    className="absolute inset-0 m-3"
                    style={{
                      backgroundImage: `url(${confirmModal.item.icon})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  />
                </div>

                <h2 className="text-center text-2xl font-black text-[#1b1b1e] tracking-tight mb-2">Èske w konfime?</h2>
                <p className="text-center text-gray-500 font-medium mb-8 text-sm px-4">Ou pral achte <span className="text-[#310065] font-black">{confirmModal.item.name}</span>. Chwazi kijan ou vle peye:</p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={async () => {
                      if (confirmModal.onConfirm && confirmModal.item) {
                        await confirmModal.onConfirm('coin', confirmModal.item.cost);
                      }
                      setConfirmModal({ show: false, item: null, onConfirm: null });
                    }}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-2xl bg-[#cba72f] text-white font-black text-sm hover:bg-[#a68620] transition-all active:scale-95 shadow-xl shadow-[#cba72f]/20 flex flex-col items-center justify-center gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 relative">
                        <Image src={assets.coin} alt="Coin" fill className="object-contain" />
                      </div>
                      <span className="text-lg">{confirmModal.item.cost.toLocaleString()} Pyès</span>
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      if (confirmModal.onConfirm && confirmModal.item) {
                        await confirmModal.onConfirm('crown', Math.ceil(confirmModal.item.cost / 2));
                      }
                      setConfirmModal({ show: false, item: null, onConfirm: null });
                    }}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-2xl bg-[#310065] text-white font-black text-sm hover:bg-[#4a148c] transition-all active:scale-95 shadow-xl shadow-[#310065]/20 flex flex-col items-center justify-center gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 relative">
                        <Image src={assets.crown} alt="Crown" fill className="object-contain" />
                      </div>
                      <span className="text-lg">{Math.ceil(confirmModal.item.cost / 2).toLocaleString()} Kouwòn</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setConfirmModal({ show: false, item: null, onConfirm: null })}
                    disabled={isProcessing}
                    className="w-full py-4 mt-2 rounded-2xl bg-gray-50 text-gray-400 font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                  >
                    Anile
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal - Ultra Premium Style */}
      <AnimatePresence>
        {successModal.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[800] bg-[#310065]/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="bg-white rounded-[4rem] p-12 max-w-sm w-full flex flex-col items-center text-center shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden"
            >
              {/* Celebration background elements */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-[#310065] to-amber-400" />
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-400/[0.05] rounded-full blur-3xl animate-pulse" />
              
              <div className="w-32 h-32 relative mb-10 group">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping scale-150 opacity-20" />
                <div className="absolute inset-0 bg-white rounded-full shadow-2xl border-4 border-green-500/20 flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-500">
                    <Check size={40} strokeWidth={4} />
                  </div>
                </div>
              </div>

              <h2 className="text-[36px] font-black text-[#1b1b1e] mb-4 tracking-tighter leading-none">KONFIME!</h2>
              <div className="h-1 w-12 bg-amber-400 rounded-full mb-6" />
              
              <p className="text-gray-500 font-bold mb-12 text-lg leading-relaxed px-4">
                Ou debloke <span className="text-[#310065] font-black">{successModal.name}</span> ak siksè nan Wayòm nan.
              </p>

              <button 
                onClick={() => setSuccessModal({show: false, type: '', name: ''})}
                className="w-full bg-[#310065] text-white font-black py-6 rounded-[2rem] transition-all hover:shadow-[0_20px_40px_rgba(49,0,101,0.4)] active:scale-95 text-sm uppercase tracking-[0.2em] relative group overflow-hidden"
              >
                <span className="relative z-10">MÈSI BONDYE</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </>
  );
}

