'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Save, 
  Loader2,
  LineChart,
  HelpCircle,
  Layers,
  Users,
  Gamepad2,
  Trophy,
  LogOut,
  Search,
  Zap,
  Heart,
  Shield,
  Upload,
  AlertCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  getStoreItems, 
  createStoreItem, 
  updateStoreItem, 
  deleteStoreItem, 
  uploadStoreIcon,
  StoreItem 
} from '@/lib/store/admin-repository';
import { toast } from 'sonner';

// IDs that are critical for game logic and cannot be deleted or have their itemId changed
const CORE_POWER_IDS = ['removeTwo', 'hintBible', 'freezeTime', 'secondChance'];

export default function AdminStore() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<StoreItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { user, signOut } = useAuthContext();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      const data = await getStoreItems();
      setItems(data);
    } catch (error) {
      toast.error('Erè lè w ap chaje atik yo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (item?: StoreItem) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem({
        itemId: '',
        type: 'energy',
        name: '',
        description: '',
        cost: 0,
        icon: '',
        amount: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!editingItem || !editingItem.name || !editingItem.itemId || !editingItem.type) {
      toast.error('Tanpri ranpli tout chan yo.');
      return;
    }

    try {
      setIsSaving(true);
      if (editingItem.id) {
        await updateStoreItem(editingItem.id, editingItem);
        toast.success('Atik mete ajou ak siksè.');
      } else {
        await createStoreItem(editingItem as StoreItem);
        toast.success('Atik kreye ak siksè.');
      }
      fetchItems();
      handleCloseModal();
    } catch (error) {
      toast.error('Erè pandan anrejistreman an.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Tanpri chwazi yon imaj sèlman.');
      return;
    }

    try {
      setIsUploading(true);
      const downloadURL = await uploadStoreIcon(file);
      setEditingItem(prev => prev ? { ...prev, icon: downloadURL } : null);
      toast.success('Imaj chaje ak siksè.');
    } catch (error) {
      toast.error('Erè pandan chajman imaj la.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: StoreItem) => {
    if (CORE_POWER_IDS.includes(item.itemId)) {
      toast.error('Sa se yon pouvwa sistèm. Ou pa ka efase l.');
      return;
    }

    if (!confirm(`Èske ou sèten ou vle efase "${item.name}"?`)) return;
    
    try {
      await deleteStoreItem(item.id!);
      toast.success('Atik efase.');
      fetchItems();
    } catch (error) {
      toast.error('Erè pandan sipresyon an.');
    }
  };

  const isCoreItem = !!(editingItem?.itemId && CORE_POWER_IDS.includes(editingItem.itemId));

  const filteredItems = items
    .filter(i => filterType === 'all' || i.type === filterType)
    .filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.itemId.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <AdminGuard>
      <div className="bg-[#f8f9fa] text-[#1b1b1e] min-h-screen font-sans flex">
        
        {/* Sidebar */}
        <aside className="w-72 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col py-8 px-6 gap-8 shrink-0 shadow-sm z-50">
          <div>
            <h1 className="text-2xl font-black text-[#310065] tracking-tight mb-1">Store Admin</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kingdom Management</p>
          </div>
          
          <nav className="flex flex-col gap-1.5">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-gray-500 hover:text-[#310065] hover:bg-[#310065]/5 font-bold text-[14px]">
              <LineChart className="w-5 h-5" />
              Dashbord
            </Link>
            
            <Link href="/admin/dashboard/questions" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-gray-500 hover:text-[#310065] hover:bg-[#310065]/5 font-bold text-[14px]">
              <HelpCircle className="w-5 h-5" />
              Kesyon
            </Link>
            
            <Link href="/admin/dashboard/categories" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-gray-500 hover:text-[#310065] hover:bg-[#310065]/5 font-bold text-[14px]">
              <Layers className="w-5 h-5" />
              Kategori
            </Link>
            
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-gray-500 hover:text-[#310065] hover:bg-[#310065]/5 font-bold text-[14px]">
              <Users className="w-5 h-5" />
              Itilizatè
            </Link>

            <Link href="/admin/dashboard/store" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#310065] text-white font-bold text-[14px] shadow-lg shadow-[#310065]/20">
              <ShoppingBag className="w-5 h-5" />
              Boutik
            </Link>
            
            <Link href="/admin/dashboard/game-engine" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-gray-500 hover:text-[#310065] hover:bg-[#310065]/5 font-bold text-[14px]">
              <Gamepad2 className="w-5 h-5" />
              Motè Jwèt
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#f8f9fa] border border-gray-100 flex items-center justify-center overflow-hidden">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-[13px] font-black text-[#310065]">Admin Mode</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Store Overseer</p>
              </div>
            </div>
            <button 
              onClick={() => signOut()} 
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all font-black text-[12px] uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              Konekte Dehors
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen overflow-y-auto">
          <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-10 py-6 sticky top-0 z-40 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#310065]">Konfigirasyon Boutik</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Sistèm nan Aktif</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Chèche yon atik..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold w-64 focus:ring-2 focus:ring-[#310065]/10 transition-all"
                />
              </div>
              <button 
                onClick={() => handleOpenModal()}
                className="bg-[#310065] text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-[#4a148c] transition-all shadow-xl shadow-[#310065]/20 active:scale-95"
              >
                <Plus size={18} strokeWidth={3} /> Kreye Atik
              </button>
            </div>
          </header>

          <div className="px-10 py-8">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
              {[
                { id: 'all', label: 'Tout Atik' },
                { id: 'energy', label: 'Enèji' },
                { id: 'hearts', label: 'Kè' },
                { id: 'powers', label: 'Pouvwa' },
                { id: 'frames', label: 'Kadr Pwofil' },
                { id: 'avatars', label: 'Avatar' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-6 py-3 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap border ${
                    filterType === tab.id 
                      ? 'bg-[#310065] text-white border-[#310065] shadow-lg shadow-[#310065]/10' 
                      : 'bg-white border-gray-100 text-gray-500 hover:border-[#310065]/20 hover:bg-[#310065]/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-[#310065]/10 border-t-[#310065] animate-spin"></div>
                  <ShoppingBag className="absolute inset-0 m-auto w-6 h-6 text-[#310065]" />
                </div>
                <p className="text-gray-400 font-bold mt-6 text-sm uppercase tracking-widest">Chaje done...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-24 text-center border border-gray-50 shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-gray-200" />
                </div>
                <h3 className="text-2xl font-black text-[#310065]">Pa gen anyen isit la</h3>
                <p className="text-gray-400 mt-2 font-medium max-w-sm mx-auto">Nou pa jwenn okenn atik ki koresponn ak sa w ap chèche a. Eseye chanje filtè yo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredItems.map(item => {
                  const isCore = CORE_POWER_IDS.includes(item.itemId);
                  return (
                    <div key={item.id} className="group bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-[#310065]/5 transition-all duration-500 relative flex flex-col">
                      {isCore && (
                        <div className="absolute top-6 left-6 z-10">
                          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-200 shadow-sm">
                            <Shield size={12} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Sistèm</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-8">
                        <div className="w-24 h-24 relative bg-[#f8f9fa] rounded-3xl overflow-hidden flex items-center justify-center border border-gray-50 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                          {item.icon ? (
                            <Image src={item.icon} alt={item.name} fill className="object-contain p-4 drop-shadow-md" />
                          ) : (
                            <ShoppingBag className="text-gray-200 w-10 h-10" />
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => handleOpenModal(item)}
                            className="w-12 h-12 flex items-center justify-center bg-[#f8f9fa] text-gray-400 hover:bg-[#310065] hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                            title="Modifye"
                          >
                            <Pencil size={18} />
                          </button>
                          {!isCore && (
                            <button 
                              onClick={() => handleDelete(item)}
                              className="w-12 h-12 flex items-center justify-center bg-[#f8f9fa] text-gray-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                              title="Efase"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                            item.type === 'energy' ? 'bg-blue-50 text-blue-600' :
                            item.type === 'hearts' ? 'bg-red-50 text-red-600' :
                            item.type === 'powers' ? 'bg-amber-50 text-amber-600' :
                            'bg-purple-50 text-purple-600'
                          }`}>
                            {item.type}
                          </span>
                          {!item.isActive && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
                              Inaktif
                            </span>
                          )}
                        </div>
                        <h4 className="text-xl font-black text-[#310065] mb-2">{item.name}</h4>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-2 h-10">{item.description}</p>
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 relative bg-amber-50 rounded-full flex items-center justify-center">
                            <Image src="/assets/store/currency/coin.png" alt="Coins" fill className="object-contain p-1.5" />
                          </div>
                          <span className="text-xl font-black text-[#310065] tracking-tight">{item.cost.toLocaleString()}</span>
                        </div>
                        {item.amount && item.amount > 0 && (
                          <div className="bg-[#310065]/5 text-[#310065] px-4 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-tight">
                            +{item.amount} {item.type === 'energy' ? 'Pwen' : 'Inite'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Edit/Create Modal - iOS Inspired */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[#310065]/20 backdrop-blur-xl" onClick={handleCloseModal}></div>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${editingItem?.id ? 'bg-[#310065]/10 text-[#310065]' : 'bg-green-100 text-green-600'}`}>
                    {editingItem?.id ? <Pencil size={24} /> : <Plus size={24} strokeWidth={3} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#310065]">
                      {editingItem?.id ? 'Modifye Atik' : 'Nouvo Atik'}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                      {isCoreItem ? 'Konfigirasyon Sistèm' : 'Boutik Kingdom'}
                    </p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-full transition-all active:scale-90">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-10 overflow-y-auto no-scrollbar flex-1">
                {isCoreItem && (
                  <div className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex gap-4 items-start">
                    <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 shrink-0">
                      <AlertCircle size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-black text-amber-900 text-sm uppercase tracking-tight">Atik Sistèm Kritik</h4>
                      <p className="text-amber-700/80 text-[13px] font-medium leading-relaxed mt-1">
                        Sa se yon pouvwa debaz nan jwèt la. Ou ka chanje ikòn nan, pri a, ak deskripsyon an, men ou pa ka chanje ID a oswa tip la paske jwèt la depann sou yo.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-10">
                  {/* Category Selection */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Layers size={16} className="text-gray-400" />
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Kategori Atik</label>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'energy', label: 'Enèji', icon: Zap },
                        { id: 'hearts', label: 'Kè', icon: Heart },
                        { id: 'powers', label: 'Pouvwa', icon: Shield },
                        { id: 'frames', label: 'Kadr', icon: Layers },
                        { id: 'avatars', label: 'Avatar', icon: Users }
                      ].map(type => (
                        <button
                          key={type.id}
                          disabled={isCoreItem}
                          onClick={() => setEditingItem({ ...editingItem, type: type.id as any })}
                          className={`flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-[13px] font-bold border transition-all ${
                            editingItem?.type === type.id
                              ? 'bg-[#310065] text-white border-[#310065] shadow-lg shadow-[#310065]/20 scale-105'
                              : 'bg-white text-gray-500 border-gray-100 hover:border-[#310065]/20 hover:bg-gray-50'
                          } ${isCoreItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <type.icon size={16} />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Identification */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Info size={16} className="text-gray-400" />
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">ID Entèn</label>
                      </div>
                      <input 
                        type="text"
                        disabled={isCoreItem}
                        placeholder="eg: removeTwo"
                        value={editingItem?.itemId}
                        onChange={e => setEditingItem({ ...editingItem, itemId: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-[1.5rem] px-6 py-4 text-[15px] font-bold text-[#310065] focus:ring-4 focus:ring-[#310065]/5 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-gray-400" />
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Non nan Boutik</label>
                      </div>
                      <input 
                        type="text"
                        placeholder="eg: Retire 2 Repons"
                        value={editingItem?.name}
                        onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-[1.5rem] px-6 py-4 text-[15px] font-bold text-[#310065] focus:ring-4 focus:ring-[#310065]/5 transition-all"
                      />
                    </div>
                  </section>

                  {/* Description */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={16} className="text-gray-400" />
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Deskripsyon Atik</label>
                    </div>
                    <textarea 
                      placeholder="Mete yon deskripsyon kout pou jwè yo..."
                      value={editingItem?.description}
                      onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 border-none rounded-[2rem] px-6 py-5 text-[15px] font-medium text-[#310065] focus:ring-4 focus:ring-[#310065]/5 transition-all resize-none leading-relaxed"
                    />
                  </section>

                  {/* Economy */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Image src="/assets/store/currency/coin.png" alt="Coin" width={16} height={16} />
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Pri (Pyès Lò)</label>
                      </div>
                      <input 
                        type="number"
                        value={editingItem?.cost}
                        onChange={e => setEditingItem({ ...editingItem, cost: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-50 border-none rounded-[1.5rem] px-6 py-4 text-[18px] font-black text-[#310065] focus:ring-4 focus:ring-[#310065]/5 transition-all"
                      />
                    </div>
                    {(editingItem?.type === 'energy' || editingItem?.type === 'hearts') && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Plus size={16} className="text-gray-400" />
                          <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Kantite l bay</label>
                        </div>
                        <input 
                          type="number"
                          value={editingItem?.amount}
                          onChange={e => setEditingItem({ ...editingItem, amount: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-50 border-none rounded-[1.5rem] px-6 py-4 text-[18px] font-black text-[#310065] focus:ring-4 focus:ring-[#310065]/5 transition-all"
                        />
                      </div>
                    )}
                  </section>

                  {/* Icon Design */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Upload size={16} className="text-gray-400" />
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Imaj Atik</label>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-8 rounded-[2.5rem]">
                      <div className="w-32 h-32 relative bg-white rounded-3xl shrink-0 border border-gray-100 overflow-hidden shadow-xl shadow-[#310065]/5 flex items-center justify-center group">
                        {editingItem?.icon ? (
                          <Image src={editingItem.icon} alt="Preview" fill className="object-contain p-4 drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <ShoppingBag className="text-gray-100 w-12 h-12" />
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="animate-spin text-[#310065]" size={32} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 w-full space-y-4">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="icon-upload"
                          disabled={isUploading}
                        />
                        <label 
                          htmlFor="icon-upload"
                          className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white border-2 border-dashed border-gray-200 hover:border-[#310065]/30 hover:bg-white/50 transition-all cursor-pointer font-black text-[13px] text-[#310065] shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Upload size={20} strokeWidth={2.5} />
                          {editingItem?.icon ? 'CHÈNGE IMAJ SA A' : 'CHWAZI YON NOUVO IMAJ'}
                        </label>
                        
                        <div className="flex items-center gap-3">
                          <div className="h-[1px] flex-1 bg-gray-200"></div>
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">oswa</span>
                          <div className="h-[1px] flex-1 bg-gray-200"></div>
                        </div>

                        <input 
                          type="text"
                          placeholder="Kole URL imaj la isit la..."
                          value={editingItem?.icon}
                          onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })}
                          className="w-full bg-white border border-gray-100 rounded-[1.5rem] px-6 py-4 text-[13px] font-bold text-[#310065] focus:ring-4 focus:ring-[#310065]/5 transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-4 flex items-center gap-2">
                      <AlertCircle size={12} />
                      Sijesyon: PNG transparan (512x512) pou pi bèl rezilta.
                    </p>
                  </section>

                  {/* Status */}
                  <section className="flex items-center justify-between bg-gray-50 p-8 rounded-[2rem]">
                    <div>
                      <h4 className="font-black text-[#310065] text-sm uppercase tracking-tight">Estati Atik la</h4>
                      <p className="text-gray-400 text-[12px] font-medium mt-0.5">Aktive oswa dezaktive vizibilite nan boutik la.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={editingItem?.isActive}
                        onChange={e => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                      />
                      <div className="w-16 h-9 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                    </label>
                  </section>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-10 border-t border-gray-50 bg-gray-50/50 flex gap-4 sticky bottom-0 z-10 backdrop-blur-md">
                <button 
                  onClick={handleCloseModal}
                  className="flex-1 py-5 rounded-[1.5rem] font-black text-gray-400 bg-white hover:bg-white/80 transition-all border border-gray-100 uppercase tracking-widest text-[12px]"
                >
                  Anile
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-[#310065] text-white py-5 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.15em] shadow-2xl shadow-[#310065]/30 hover:bg-[#4a148c] transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={2.5} />}
                  ANREJISTRE MODIFIKASYON
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  );
}
