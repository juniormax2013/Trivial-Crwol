'use client';

import React, { useState, useEffect } from 'react';
import ThreeModelViewer from '@/components/ThreeModelViewer';
import { 
  CheckCircle, 
  Play, 
  Sparkles, 
  HelpCircle, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Plus,
  Trash2,
  Download,
  Upload,
  User,
  X,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';

interface CharacterConfig {
  id: string;
  name: string;
  isDefault?: boolean;
  folderPath: string; // e.g. "/assets/Humanoid_2D_pixel_art_mobile"
}

const DEFAULT_CHARACTERS: CharacterConfig[] = [
  {
    id: 'crimson_devil',
    name: 'Diablo Carmesí',
    isDefault: true,
    folderPath: '/assets/Humanoid_2D_pixel_art_mobile',
  },
  {
    id: 'el_diablo_3d',
    name: 'El Diablo 3D',
    isDefault: true,
    folderPath: '/assets/El diablo 3D',
  },
  {
    id: 'jesus_3d',
    name: 'Jesús 3D',
    isDefault: true,
    folderPath: '/assets/Jesus 3D',
  }
];

// Helper to extract a friendly label from GLB filename
const getFriendlyName = (filename: string): string => {
  // Remove prefix e.g. "Meshy_AI_Crimson_Devil_in_a_Ta_biped_Animation_"
  let name = filename.replace(/^Meshy_AI_[A-Za-z0-9_]+_Animation_/, '');
  name = name.replace(/_withSkin\.glb$/, '');
  name = name.replace(/\.glb$/, '');
  name = name.replace(/_/g, ' ');
  // Capitalize first letter of each word
  return name.replace(/\b\w/g, c => c.toUpperCase());
};

export default function Test3DPage() {
  const [characters, setCharacters] = useState<CharacterConfig[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>('crimson_devil');
  
  // Animation files dynamically loaded for the active character
  const [animationFiles, setAnimationFiles] = useState<string[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string>('');
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Tested animations list per character
  const [testedAnims, setTestedAnims] = useState<Record<string, Record<string, boolean>>>({});
  
  // Modals / forms state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharFolder, setNewCharFolder] = useState('/assets/Humanoid_2D_pixel_art_mobile');

  // Load characters configuration
  useEffect(() => {
    const saved = localStorage.getItem('character_configs_3d');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CharacterConfig[];
        const defaultIds = DEFAULT_CHARACTERS.map(d => d.id);
        // Exclude obsolete configs that share the default IDs
        const customChars = parsed.filter(c => !c.isDefault && !defaultIds.includes(c.id));
        setCharacters([...DEFAULT_CHARACTERS, ...customChars]);
      } catch (e) {
        setCharacters(DEFAULT_CHARACTERS);
      }
    } else {
      setCharacters(DEFAULT_CHARACTERS);
    }
  }, []);

  const saveCharacters = (list: CharacterConfig[]) => {
    setCharacters(list);
    localStorage.setItem('character_configs_3d', JSON.stringify(list));
  };

  const activeCharacter = characters.find(c => c.id === selectedCharId) || DEFAULT_CHARACTERS[0];

  // Fetch GLB files inside the active character's folder
  const loadFolderFiles = async (folder: string) => {
    setLoadingFiles(true);
    setScanError(null);
    try {
      const res = await fetch(`/api/assets-list?folder=${encodeURIComponent(folder)}`);
      const data = await res.json();
      if (data.error) {
        setScanError(data.error);
        setAnimationFiles([]);
        setSelectedFilename('');
      } else {
        const files: string[] = data.files || [];
        setAnimationFiles(files);
        if (files.length > 0) {
          setSelectedFilename(files[0]);
        } else {
          setSelectedFilename('');
          setScanError('No se encontraron archivos .glb en esta carpeta.');
        }
      }
    } catch (err) {
      setScanError('Error de red al escanear la carpeta.');
      setAnimationFiles([]);
      setSelectedFilename('');
    } finally {
      setLoadingFiles(false);
    }
  };

  // Re-fetch files whenever active character or folder path changes
  useEffect(() => {
    if (activeCharacter) {
      loadFolderFiles(activeCharacter.folderPath);
    }
  }, [selectedCharId, activeCharacter?.folderPath]);

  // Create new character profile
  const handleCreateCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;

    const newChar: CharacterConfig = {
      id: 'char_' + Date.now(),
      name: newCharName,
      folderPath: newCharFolder,
    };

    const updated = [...characters, newChar];
    saveCharacters(updated);
    setSelectedCharId(newChar.id);
    setShowAddModal(false);
    
    setNewCharName('');
    setNewCharFolder('/assets/Humanoid_2D_pixel_art_mobile');
  };

  // Delete character profile
  const handleDeleteCharacter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = characters.filter(c => c.id !== id);
    saveCharacters(updated);
    if (selectedCharId === id) {
      setSelectedCharId('crimson_devil');
    }
  };

  // Export configs
  const handleExportConfigs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characters, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "personajes_3d_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import configs
  const handleImportConfigs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            saveCharacters(parsed);
            setSelectedCharId(parsed[0].id);
          } else {
            alert("Formato inválido.");
          }
        } catch (err) {
          alert("Error al parsear el archivo.");
        }
      };
    }
  };

  const toggleTested = (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTestedAnims(prev => {
      const charTested = prev[selectedCharId] || {};
      return {
        ...prev,
        [selectedCharId]: {
          ...charTested,
          [filename]: !charTested[filename]
        }
      };
    });
  };

  const charTestedAnims = testedAnims[selectedCharId] || {};
  const testedCount = Object.keys(charTestedAnims).filter(filename => animationFiles.includes(filename) && charTestedAnims[filename]).length;
  const isFinished = animationFiles.length > 0 && testedCount === animationFiles.length;

  const currentModelPath = selectedFilename ? `${activeCharacter.folderPath}/${selectedFilename}` : '';

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] p-4 sm:p-8 font-sans selection:bg-[#0A84FF]/10 text-[#0F172A]">
      
      {/* ── ENCABEZADO ── */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
            <span className="p-2.5 bg-[#0A84FF] text-white rounded-2xl shadow-lg shadow-[#0A84FF]/20">
              <Sparkles className="w-6 h-6" />
            </span>
            Character Animation Test
          </h1>
          <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest mt-2">
            Verificador Dinámico de Animaciones 3D
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExportConfigs}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider rounded-2xl transition-all hover:bg-slate-50 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" /> Exportar Config
          </button>
          
          <label className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider rounded-2xl transition-all hover:bg-slate-50 cursor-pointer active:scale-95">
            <Upload className="w-4 h-4" /> Importar Config
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportConfigs} 
              className="hidden" 
            />
          </label>

          <Link
            href="/"
            className="px-5 py-2.5 bg-[#0A84FF]/10 hover:bg-[#0A84FF]/15 text-[#0A84FF] font-bold text-[11px] uppercase tracking-wider rounded-2xl transition-all cursor-pointer text-center"
          >
            Regresar
          </Link>
        </div>
      </header>

      {/* ── BARRA DE PERSONAJES ── */}
      <section className="max-w-7xl mx-auto mb-8 bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-black text-[#64748B] uppercase tracking-widest mr-2">Personajes:</span>
        {characters.map((char) => (
          <div
            key={char.id}
            onClick={() => setSelectedCharId(char.id)}
            className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl border text-[12px] font-bold cursor-pointer transition-all ${
              selectedCharId === char.id
                ? 'bg-[#0A84FF] text-white border-transparent shadow-md shadow-[#0A84FF]/10'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{char.name}</span>
          </div>
        ))}

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-[#0A84FF]/10 text-[#0A84FF] hover:bg-[#0A84FF]/15 rounded-xl text-[12px] font-bold transition-all cursor-pointer border border-transparent"
        >
          <Plus className="w-4 h-4" /> Agregar Personaje
        </button>

        {!activeCharacter.isDefault && (
          <button
            onClick={(e) => handleDeleteCharacter(activeCharacter.id, e)}
            className="md:ml-auto flex items-center gap-1.5 px-4.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[12px] font-bold transition-all cursor-pointer border border-rose-200/40 active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> Eliminar {activeCharacter.name}
          </button>
        )}
      </section>

      {/* ── SECCIÓN CENTRAL ── */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL IZQUIERDO: VISOR 3D (Sticky) */}
        <div className="lg:col-span-7 flex flex-col gap-5 lg:sticky lg:top-8">
          <div className="bg-white rounded-[24px] p-6 shadow-md border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black text-[#0A84FF] uppercase tracking-widest flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5" />
                {activeCharacter.folderPath}
              </span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-xl max-w-[280px] truncate">
                {selectedFilename || 'Ninguna animación activa'}
              </span>
            </div>

            {/* Visor 3D */}
            <div className="h-[400px] w-full relative">
              {currentModelPath ? (
                <ThreeModelViewer modelPath={currentModelPath} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-[24px] text-center p-6 gap-2">
                  {loadingFiles ? (
                    <>
                      <div className="w-8 h-8 border-3 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider animate-pulse">Buscando archivos GLB...</p>
                    </>
                  ) : (
                    <>
                      <User className="w-10 h-10 text-slate-400" />
                      <p className="text-xs font-black text-rose-500 uppercase tracking-wider">No hay animaciones</p>
                      <p className="text-[11px] text-slate-400 max-w-xs">{scanError || 'Escaner inactivo'}</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Ficha de Detalles de la Animación */}
            {selectedFilename && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/80">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A]">{getFriendlyName(selectedFilename)}</h3>
                    <p className="text-[10.5px] font-mono text-[#64748B] mt-1 break-all">{selectedFilename}</p>
                  </div>
                  <button
                    onClick={(e) => toggleTested(selectedFilename, e)}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                      charTestedAnims[selectedFilename]
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {charTestedAnims[selectedFilename] ? 'Verificada' : 'Marcar Probada'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Barra de progreso general */}
          {animationFiles.length > 0 && (
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B]">Progreso de la Prueba</span>
                <span className="text-xs font-black text-[#0A84FF]">{testedCount} / {animationFiles.length} completadas</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0A84FF] transition-all duration-500" 
                  style={{ width: `${(testedCount / animationFiles.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* PANEL DERECHO: LISTADO DINÁMICO DE ANIMACIONES */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-[24px] p-6 shadow-md border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-[#0F172A]">Animaciones del Personaje</h2>
                <p className="text-xs text-[#64748B] mt-1">Lista generada automáticamente desde la carpeta del proyecto.</p>
              </div>
              <button 
                onClick={() => loadFolderFiles(activeCharacter.folderPath)}
                className="p-2 text-slate-400 hover:text-[#0A84FF] hover:bg-slate-50 rounded-xl transition-all"
                title="Escanear de nuevo"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingFiles ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-7 h-7 border-3 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-black">Escaneando archivos GLB...</span>
              </div>
            ) : scanError ? (
              <div className="py-8 text-center text-rose-500 space-y-2 border border-dashed border-rose-100 rounded-2xl bg-rose-50/10">
                <p className="text-xs font-black uppercase">Error al listar carpeta</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">{scanError}</p>
              </div>
            ) : animationFiles.length === 0 ? (
              <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                No se encontraron archivos .glb en el directorio.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {animationFiles.map((filename) => {
                  const isSelected = selectedFilename === filename;
                  const isTested = charTestedAnims[filename];

                  return (
                    <div
                      key={filename}
                      onClick={() => setSelectedFilename(filename)}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'border-[#0A84FF] bg-[#0A84FF]/5 shadow-sm'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected 
                            ? 'bg-[#0A84FF] text-white' 
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}>
                          <Play className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[12px] font-black tracking-tight leading-tight">{getFriendlyName(filename)}</p>
                          <p className="text-[9.5px] leading-tight text-[#64748B] max-w-[200px] truncate">{filename}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleTested(filename, e)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isTested
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Caja de confirmación final */}
          {isFinished && (
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[24px] p-6 text-white shadow-xl shadow-emerald-500/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">¡Prueba Finalizada!</h3>
                  <p className="text-[11px] text-emerald-100">Has verificado satisfactoriamente todos los movimientos de {activeCharacter.name}.</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* ── MODAL AGREGAR PERSONAJE ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-[#0F172A] mb-4">Agregar Nuevo Personaje</h2>
            
            <form onSubmit={handleCreateCharacter} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nombre del Personaje</label>
                <input 
                  type="text" 
                  required
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  placeholder="Ej. Ángel Guardián"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#0A84FF] outline-none"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Ruta de Carpeta de Assets</label>
                <input 
                  type="text" 
                  required
                  value={newCharFolder}
                  onChange={(e) => setNewCharFolder(e.target.value)}
                  placeholder="Ej. /assets/Jesus 3D"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#0A84FF] outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">La carpeta debe encontrarse dentro del directorio public/</span>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0A84FF] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0A84FF]/90 transition-all shadow-lg shadow-[#0A84FF]/10"
                >
                  Crear Personaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
