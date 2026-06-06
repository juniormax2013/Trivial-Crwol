'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Sparkles,
  Download,
  Save,
  RotateCw,
  Film,
  History,
  Info,
  Loader2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  User,
  Plus,
  Compass,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { pixellabService, PixelLabHistoryItem } from '@/lib/pixellab/service';
import { toast } from 'sonner';

// Presets for Biblical Characters
const BIBLICAL_PRESETS = [
  {
    name: 'Jesus',
    category: 'Jesus',
    prompt: 'Jesus Christ, biblical clothes, red and white robe, brown hair, beard, holy halo, pixel art, 16bit style',
    negative: 'modern clothing, armor, weapon, dark shadow, sci-fi',
    view: 'side',
    direction: 'south',
    characterType: 'humanoid'
  },
  {
    name: 'Devil',
    category: 'Devil',
    prompt: 'Devil, red skin, horns, tail, wings, pitchfork, pixel art, 16bit style, evil expression',
    negative: 'angel, holy, halo, human skin, cute',
    view: 'side',
    direction: 'south',
    characterType: 'humanoid'
  },
  {
    name: 'Moses',
    category: 'Allies',
    prompt: 'Moses, old prophet, long white beard, holding stone tablets, staff, brown robe, pixel art, 16bit style',
    negative: 'young, modern, armor, swords, lasers',
    view: 'side',
    direction: 'south',
    characterType: 'humanoid'
  },
  {
    name: 'David',
    category: 'Allies',
    prompt: 'David, young shepherd boy, sling in hand, stone pouch, simple tunic, heroic stance, pixel art, 16bit style',
    negative: 'old, crown, heavy armor, beard, modern',
    view: 'side',
    direction: 'south',
    characterType: 'humanoid'
  },
  {
    name: 'Solomon',
    category: 'Allies',
    prompt: 'King Solomon, wise king, gold crown, royal purple robe, holding scroll, majestic beard, pixel art, 16bit style',
    negative: 'poor clothes, shepherd, weapons, young, beast',
    view: 'side',
    direction: 'south',
    characterType: 'humanoid'
  },
  {
    name: 'Esther',
    category: 'Allies',
    prompt: 'Queen Esther, beautiful Persian Jewish queen, elegant gold crown, royal dress, courageous stance, pixel art, 16bit style',
    negative: 'man, warrior, armor, peasant, casual clothes',
    view: 'side',
    direction: 'south',
    characterType: 'humanoid'
  }
];

export default function CharacterGeneratorPage() {
  // Main form states
  const [characterName, setCharacterName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [spriteSize, setSpriteSize] = useState<'48x48' | '64x64' | '128x128'>('64x64');
  const [transparent, setTransparent] = useState(true);
  const [directions, setDirections] = useState<4 | 8>(4);
  const [cameraView, setCameraView] = useState<'side' | 'low top-down' | 'high top-down'>('side');
  const [characterType, setCharacterType] = useState<'humanoid' | 'quadruped'>('humanoid');
  const [category, setCategory] = useState<'Jesus' | 'Devil' | 'Allies' | 'Enemies' | 'NPC'>('Allies');

  // Generation status & outputs
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // base64 dataUrl
  const [historyList, setHistoryList] = useState<PixelLabHistoryItem[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  // Post-generation tools
  const [rotationView, setRotationView] = useState<'low top-down' | 'high top-down' | 'side'>('side');
  const [rotationDir, setRotationDir] = useState<string>('east');
  const [isGeneratingRotation, setIsGeneratingRotation] = useState(false);

  const [animationAction, setAnimationAction] = useState<string>('walk');
  const [animationFrames, setAnimationFrames] = useState<number>(4);
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false);

  // Directory import and animation preview states
  const [importedCharacter, setImportedCharacter] = useState<{
    name: string;
    baseImage: string | null;
    rotations: { [key: string]: string };
    animations: { [action: string]: string[] };
  } | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'base' | 'rotations' | 'animations'>('base');
  const [selectedAnim, setSelectedAnim] = useState<string>('');
  const [currentAnimFrame, setCurrentAnimFrame] = useState<number>(0);
  const [isPlayingAnim, setIsPlayingAnim] = useState<boolean>(true);
  const [selectedRotationDir, setSelectedRotationDir] = useState<string>('east');

  // Animation frame advance effect
  useEffect(() => {
    if (activePreviewTab !== 'animations' || !isPlayingAnim || !importedCharacter || !selectedAnim) return;
    const frames = importedCharacter.animations[selectedAnim];
    if (!frames || frames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAnimFrame((prev) => (prev + 1) % frames.length);
    }, 180);

    return () => clearInterval(interval);
  }, [activePreviewTab, isPlayingAnim, importedCharacter, selectedAnim]);

  // Set default selected animation when importedCharacter changes
  useEffect(() => {
    if (importedCharacter && Object.keys(importedCharacter.animations).length > 0) {
      const firstAnim = Object.keys(importedCharacter.animations)[0];
      setSelectedAnim(firstAnim);
      setCurrentAnimFrame(0);
    }
  }, [importedCharacter]);

  useEffect(() => {
    loadBalance();
    loadHistory();
  }, []);

  async function loadBalance() {
    try {
      const response = await fetch('/api/admin/pixellab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getBalance' })
      });
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance?.credits ?? 0);
      }
    } catch (e) {
      console.error("Failed to load PixelLab balance", e);
    }
  }

  async function loadHistory() {
    try {
      const list = await pixellabService.getGenerationHistory(12);
      setHistoryList(list);
    } catch (e) {
      console.error("Failed to load generation history", e);
    }
  }

  const applyPreset = (preset: typeof BIBLICAL_PRESETS[0]) => {
    setCharacterName(preset.name);
    setPrompt(preset.prompt);
    setNegativePrompt(preset.negative);
    setCameraView(preset.view as any);
    setCharacterType(preset.characterType as any);
    setCategory(preset.category as any);
    toast.success(`Preset cargado para ${preset.name}`);
  };

  const handleGenerate = async () => {
    if (!characterName.trim()) {
      toast.error('Por favor, ingresa el nombre del personaje.');
      return;
    }
    if (!prompt.trim()) {
      toast.error('Por favor, describe el personaje (Prompt).');
      return;
    }

    const [w, h] = spriteSize.split('x').map(Number);

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const result = await pixellabService.generateCharacter({
        description: prompt,
        width: w,
        height: h,
        negativeDescription: negativePrompt,
        view: cameraView,
        direction: 'south',
        noBackground: transparent
      });

      if (result.image?.base64) {
        const dataUrl = `data:image/${result.image.format};base64,${result.image.base64}`;
        setGeneratedImage(dataUrl);
        setImportedCharacter({
          name: characterName,
          baseImage: dataUrl,
          rotations: {},
          animations: {}
        });
        setActivePreviewTab('base');
        toast.success('¡Personaje generado con éxito!');
        loadBalance();
      } else {
        toast.error('Error: La API no devolvió una imagen válida.');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error durante la generación.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setGeneratedImage(event.target.result as string);
        setImportedCharacter(null); // Clear directory import if single image uploaded
        
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const capitalizedName = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
        setCharacterName(capitalizedName);
        
        toast.success(`Personaje '${capitalizedName}' importado correctamente.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDirectoryImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Sort files alphabetically by path name to ensure chronological frame loading
    files.sort((a, b) => a.webkitRelativePath.localeCompare(b.webkitRelativePath));

    let detectedName = "";
    if (files[0].webkitRelativePath) {
      detectedName = files[0].webkitRelativePath.split('/')[0];
    } else {
      detectedName = "Character_Imported";
    }

    const rotations: { [key: string]: string } = {};
    const animations: { [action: string]: string[] } = {};
    let baseImage: string | null = null;

    const readAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string || "");
        reader.readAsDataURL(file);
      });
    };

    toast.loading("Procesando y cargando archivos de la carpeta...", { id: "import-toast" });

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        const pathParts = file.webkitRelativePath.toLowerCase().split('/');
        const dataUrl = await readAsDataURL(file);

        const isRotation = pathParts.includes('rotations') || pathParts.includes('rotacion') || pathParts.includes('rotaciones') || file.name.toLowerCase().includes('rotation');
        const isAnimation = pathParts.includes('animations') || pathParts.includes('animacion') || pathParts.includes('animaciones') || file.name.toLowerCase().includes('anim');

        if (isRotation) {
          const name = file.name.toLowerCase();
          let direction = "east";
          if (name.includes('east') || name.includes('este')) direction = 'east';
          else if (name.includes('west') || name.includes('oeste')) direction = 'west';
          else if (name.includes('north-east') || name.includes('noreste')) direction = 'north-east';
          else if (name.includes('south-east') || name.includes('sureste')) direction = 'south-east';
          else if (name.includes('north') || name.includes('norte')) direction = 'north';
          else if (name.includes('south') || name.includes('sur')) direction = 'south';
          
          rotations[direction] = dataUrl;
        } else if (isAnimation) {
          const name = file.name.toLowerCase();
          let action = "walk";
          if (name.includes('walk') || name.includes('caminar')) action = 'walk';
          else if (name.includes('attack') || name.includes('atacar')) action = 'attack';
          else if (name.includes('idle') || name.includes('esperar') || name.includes('reposo')) action = 'idle';
          else if (name.includes('jump') || name.includes('saltar')) action = 'jump';
          else if (name.includes('die') || name.includes('morir')) action = 'die';
          else {
            const animIndex = pathParts.indexOf('animations');
            if (animIndex !== -1 && pathParts[animIndex + 1]) {
              action = pathParts[animIndex + 1];
            } else {
              const animIndexEsp = pathParts.indexOf('animaciones');
              if (animIndexEsp !== -1 && pathParts[animIndexEsp + 1]) {
                action = pathParts[animIndexEsp + 1];
              }
            }
          }

          if (!animations[action]) {
            animations[action] = [];
          }
          animations[action].push(dataUrl);
        } else {
          if (file.name.toLowerCase().includes('base') || !baseImage) {
            baseImage = dataUrl;
          }
        }
      }

      const cleanCharacterName = detectedName.charAt(0).toUpperCase() + detectedName.slice(1);
      setCharacterName(cleanCharacterName);
      setGeneratedImage(baseImage || Object.values(rotations)[0] || null);

      setImportedCharacter({
        name: cleanCharacterName,
        baseImage: baseImage,
        rotations: rotations,
        animations: animations
      });

      setActivePreviewTab('base');
      toast.success(`Carpeta '${cleanCharacterName}' cargada. Se detectaron ${Object.keys(rotations).length} rotaciones y ${Object.keys(animations).length} animaciones.`, { id: "import-toast" });
    } catch (e: any) {
      console.error(e);
      toast.error(`Error al importar carpeta: ${e.message}`, { id: "import-toast" });
    }
  };

  const handleSaveImportedCharacter = async () => {
    if (!importedCharacter) return;
    setIsSaving(true);
    const [w, h] = spriteSize.split('x').map(Number);

    toast.loading("Subiendo carpeta de personaje a la biblioteca...", { id: "save-toast" });

    try {
      if (importedCharacter.baseImage) {
        await pixellabService.saveGeneratedAsset({
          characterName,
          description: `Imported Base - ${characterName}`,
          width: w,
          height: h,
          view: cameraView,
          direction: 'south',
          category,
          characterType,
          transparent,
          base64Data: importedCharacter.baseImage,
          type: 'base'
        });
      }

      for (const dir in importedCharacter.rotations) {
        await pixellabService.saveGeneratedAsset({
          characterName,
          description: `Imported Rotation ${dir} - ${characterName}`,
          width: w,
          height: h,
          view: cameraView,
          direction: dir,
          category,
          characterType,
          transparent,
          base64Data: importedCharacter.rotations[dir],
          type: 'rotation'
        });
      }

      for (const action in importedCharacter.animations) {
        const frames = importedCharacter.animations[action];
        for (let i = 0; i < frames.length; i++) {
          await pixellabService.saveGeneratedAsset({
            characterName,
            description: `Imported Anim ${action} Frame ${i + 1} - ${characterName}`,
            width: w,
            height: h,
            view: cameraView,
            direction: 'south',
            category,
            characterType,
            transparent,
            base64Data: frames[i],
            type: 'animation'
          });
        }
      }

      toast.success(`Personaje '${characterName}' y todas sus animaciones guardados con éxito.`, { id: "save-toast" });
      loadHistory();
      setImportedCharacter(null);
    } catch (e: any) {
      console.error(e);
      toast.error(`Error al guardar: ${e.message}`, { id: "save-toast" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedImage) return;
    setIsSaving(true);
    const [w, h] = spriteSize.split('x').map(Number);

    try {
      const url = await pixellabService.saveGeneratedAsset({
        characterName,
        description: prompt,
        negativeDescription: negativePrompt,
        width: w,
        height: h,
        view: cameraView,
        direction: 'south',
        category,
        characterType,
        transparent,
        base64Data: generatedImage,
        type: 'base'
      });

      toast.success('Personaje guardado en la biblioteca y subido a Storage.');
      loadHistory();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al guardar el asset.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${characterName.toLowerCase() || 'character'}_base.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateRotation = async () => {
    if (!generatedImage) return;
    setIsGeneratingRotation(true);
    const [w, h] = spriteSize.split('x').map(Number);

    try {
      const rawBase64 = generatedImage.split('base64,')[1];
      const result = await pixellabService.generateRotation({
        fromImageBase64: rawBase64,
        fromFormat: 'png',
        width: w,
        height: h,
        fromView: cameraView,
        toView: rotationView,
        fromDirection: 'south',
        toDirection: rotationDir as any
      });

      if (result.image?.base64) {
        const dataUrl = `data:image/${result.image.format};base64,${result.image.base64}`;
        
        // Save the rotated image automatically
        await pixellabService.saveGeneratedAsset({
          characterName,
          description: `Rotation to ${rotationDir} - ${prompt}`,
          width: w,
          height: h,
          view: rotationView,
          direction: rotationDir,
          category,
          characterType,
          transparent,
          base64Data: dataUrl,
          type: 'rotation'
        });

        // Add dynamically to imported character's rotations list
        setImportedCharacter(prev => {
          const currentRotations = prev?.rotations || {};
          return {
            name: characterName || "Character",
            baseImage: prev?.baseImage || generatedImage,
            rotations: {
              ...currentRotations,
              [rotationDir]: dataUrl
            },
            animations: prev?.animations || {}
          };
        });

        setGeneratedImage(dataUrl);
        setActivePreviewTab('rotations');
        setSelectedRotationDir(rotationDir);

        toast.success(`Rotación generada y guardada en rotations/`);
        loadHistory();
        loadBalance();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al generar la rotación.');
    } finally {
      setIsGeneratingRotation(false);
    }
  };

  const handleGenerateAnimation = async () => {
    if (!generatedImage) return;
    setIsGeneratingAnimation(true);
    const [w, h] = spriteSize.split('x').map(Number);

    try {
      const rawBase64 = generatedImage.split('base64,')[1];
      const result = await pixellabService.generateAnimation({
        referenceImageBase64: rawBase64,
        referenceFormat: 'png',
        description: `Character performing ${animationAction} animation, pixel art`,
        actionName: animationAction,
        width: w,
        height: h,
        view: cameraView,
        direction: 'south',
        nFrames: animationFrames
      });

      if (result.images && result.images.length > 0) {
        // We will stack or save the first one or save all frames
        const frameData = result.images[0];
        const dataUrl = `data:image/${frameData.format};base64,${frameData.base64}`;

        await pixellabService.saveGeneratedAsset({
          characterName,
          description: `Animation ${animationAction} - ${prompt}`,
          width: w,
          height: h,
          view: cameraView,
          direction: 'south',
          category,
          characterType,
          transparent,
          base64Data: dataUrl,
          type: 'animation'
        });

        // Add all animation frames to the visualizer
        const frames = result.images.map((img: any) => `data:image/${img.format};base64,${img.base64}`);
        setImportedCharacter(prev => {
          const currentAnims = prev?.animations || {};
          return {
            name: characterName || "Character",
            baseImage: prev?.baseImage || generatedImage,
            rotations: prev?.rotations || {},
            animations: {
              ...currentAnims,
              [animationAction]: frames
            }
          };
        });

        setGeneratedImage(dataUrl);
        setActivePreviewTab('animations');
        setSelectedAnim(animationAction);
        setCurrentAnimFrame(0);
        setIsPlayingAnim(true);

        toast.success(`Animación '${animationAction}' generada y guardada en animations/`);
        loadHistory();
        loadBalance();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al generar la animación.');
    } finally {
      setIsGeneratingAnimation(false);
    }
  };

  return (
    <AdminGuard>
      <div className="bg-slate-50 text-[#0F172A] min-h-screen font-sans">
        
        {/* iOS-Style Premium Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 sm:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Character Generator</h1>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PixelLab AI integration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {balance !== null && (
              <div className="bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0A84FF] animate-pulse"></span>
                <span className="text-xs font-bold text-[#0A84FF]">{balance} Créditos PixelLab</span>
              </div>
            )}
            <Link href="/admin/dashboard" className="text-xs font-bold text-slate-500 hover:text-[#0A84FF] transition-all">
              Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 sm:p-10 space-y-10">
          
          {/* Preset Buttons Block */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <UserCheck className="w-5 h-5 text-[#0A84FF]" />
              <h3 className="text-sm font-bold">Plantillas de Personajes Bíblicos</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {BIBLICAL_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-4 py-2 bg-slate-50 hover:bg-blue-50 hover:text-[#0A84FF] border border-slate-100 rounded-full text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  {preset.name} ({preset.category})
                </button>
              ))}
            </div>
          </div>

          {/* Main Workspace: Left Form, Right Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Generator Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-bold">Configuración de Generación</h2>
                <p className="text-xs text-slate-400">Define los parámetros estéticos y del modelo de pixel art.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Nombre del Personaje</label>
                  <input
                    type="text"
                    placeholder="Ej. Moses, Jesus, David..."
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Categoría del Asset</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm font-semibold text-slate-600"
                  >
                    <option value="Jesus">Jesus</option>
                    <option value="Devil">Devil</option>
                    <option value="Allies">Allies (Aliados)</option>
                    <option value="Enemies">Enemies (Enemigos)</option>
                    <option value="NPC">NPC</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Descripción / Prompt Principal</label>
                <textarea
                  placeholder="Describe las características visuales del personaje de pixel art..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-sm font-medium h-24 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Prompt Negativo (Evitar)</label>
                <input
                  type="text"
                  placeholder="Ej. modern, high detail, photorealistic..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Tamaño del Sprite</label>
                  <select
                    value={spriteSize}
                    onChange={(e) => setSpriteSize(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="48x48">48 x 48 px</option>
                    <option value="64x64">64 x 64 px</option>
                    <option value="128x128">128 x 128 px</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Vista de Cámara</label>
                  <select
                    value={cameraView}
                    onChange={(e) => setCameraView(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="side">Sidescroller (Lado)</option>
                    <option value="low top-down">Low Top-down (Bajo)</option>
                    <option value="high top-down">High Top-down (Alto)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Tipo de Personaje</label>
                  <select
                    value={characterType}
                    onChange={(e) => setCharacterType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="humanoid">Humanoide</option>
                    <option value="quadruped">Cuadrúpedo</option>
                  </select>
                </div>
              </div>

              {/* Toggles & Options */}
              <div className="flex flex-col sm:flex-row gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transparent}
                    onChange={(e) => setTransparent(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0A84FF] focus:ring-blue-100 border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Fondo Transparente</span>
                    <span className="text-[10px] text-slate-400 block">Elimina el fondo de color de la imagen.</span>
                  </div>
                </label>

                <div className="h-px sm:h-8 w-full sm:w-px bg-slate-200"></div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700">Direcciones:</span>
                  <div className="flex gap-2">
                    {[4, 8].map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => setDirections(dir as any)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                          directions === dir 
                            ? 'bg-[#0A84FF] text-white border-transparent' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {dir} Vías
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Trigger Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-[#0A84FF] text-white py-4 rounded-2xl font-bold text-sm shadow-[0_8px_20px_rgba(10,132,255,0.2)] hover:shadow-[0_12px_28px_rgba(10,132,255,0.3)] hover:bg-[#0070e0] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generar Base (AI)
                    </>
                  )}
                </button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]">
                    <Download className="w-4 h-4 rotate-180 text-slate-400" />
                    Importar Imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <label className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]">
                    <Download className="w-4 h-4 rotate-180 text-slate-400" />
                    Importar Carpeta
                    <input
                      type="file"
                      webkitdirectory=""
                      directory=""
                      multiple
                      onChange={handleDirectoryImport}
                      className="hidden"
                      {...({ directory: "", webkitdirectory: "" } as any)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Preview & Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Main Preview Card */}
              <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
                {importedCharacter ? (
                  <div className="w-full flex flex-col items-center gap-6">
                    {/* Tab Navigation */}
                    <div className="flex bg-slate-100 p-1 rounded-full w-full">
                      {(['base', 'rotations', 'animations'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActivePreviewTab(tab);
                            if (tab === 'rotations' && Object.keys(importedCharacter.rotations).length > 0) {
                              setSelectedRotationDir(Object.keys(importedCharacter.rotations)[0]);
                            }
                          }}
                          className={`flex-1 py-1.5 rounded-full text-[10px] font-bold capitalize transition-all cursor-pointer ${
                            activePreviewTab === tab 
                              ? 'bg-white text-[#0A84FF] shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {tab === 'base' ? 'Base' : tab === 'rotations' ? 'Rotaciones' : 'Movimientos'}
                        </button>
                      ))}
                    </div>

                    {/* Preview Area */}
                    <div className="w-64 h-64 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center bg-slate-50 relative group overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                      
                      {activePreviewTab === 'base' && importedCharacter.baseImage && (
                        <img 
                          src={importedCharacter.baseImage} 
                          alt="Base" 
                          className="max-w-[85%] max-h-[85%] object-contain pixelated drop-shadow-md"
                        />
                      )}

                      {activePreviewTab === 'rotations' && (
                        <div className="w-full h-full flex items-center justify-center relative">
                          {importedCharacter.rotations[selectedRotationDir] ? (
                            <img 
                              src={importedCharacter.rotations[selectedRotationDir]} 
                              alt={`Rotation ${selectedRotationDir}`} 
                              className="max-w-[85%] max-h-[85%] object-contain pixelated drop-shadow-md"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">Sin vista para {selectedRotationDir}</span>
                          )}
                        </div>
                      )}

                      {activePreviewTab === 'animations' && selectedAnim && (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          {importedCharacter.animations[selectedAnim]?.[currentAnimFrame] ? (
                            <img 
                              src={importedCharacter.animations[selectedAnim][currentAnimFrame]} 
                              alt={`Animation frame ${currentAnimFrame}`} 
                              className="max-w-[85%] max-h-[85%] object-contain pixelated drop-shadow-md"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">Sin frames cargados</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata & Sub-Controls */}
                    <div className="text-center w-full space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A]">{characterName}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{category} · {spriteSize}</p>
                      </div>

                      {/* Rotations direction selector */}
                      {activePreviewTab === 'rotations' && (
                        <div className="flex justify-center gap-1.5 flex-wrap">
                          {Object.keys(importedCharacter.rotations).map((dir) => (
                            <button
                              key={dir}
                              onClick={() => setSelectedRotationDir(dir)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all cursor-pointer ${
                                selectedRotationDir === dir 
                                  ? 'bg-[#0A84FF] text-white border-transparent' 
                                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                              }`}
                            >
                              {dir}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Animations selector and play/pause controls */}
                      {activePreviewTab === 'animations' && (
                        <div className="space-y-3 w-full px-2">
                          <div className="flex gap-2">
                            <select
                              value={selectedAnim}
                              onChange={(e) => {
                                setSelectedAnim(e.target.value);
                                setCurrentAnimFrame(0);
                              }}
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none"
                            >
                              {Object.keys(importedCharacter.animations).map((anim) => (
                                <option key={anim} value={anim}>{anim}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => setIsPlayingAnim(!isPlayingAnim)}
                              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              {isPlayingAnim ? 'Pausar' : 'Reproducir'}
                            </button>
                          </div>
                          {importedCharacter.animations[selectedAnim] && (
                            <p className="text-[10px] text-slate-400 font-semibold">
                              Frame {currentAnimFrame + 1} de {importedCharacter.animations[selectedAnim].length}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => setImportedCharacter(null)}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                      >
                        Limpiar
                      </button>
                      <button
                        onClick={handleSaveImportedCharacter}
                        disabled={isSaving}
                        className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isSaving ? 'Guardando...' : 'Guardar Todo'}
                      </button>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <div className="w-full flex flex-col items-center gap-6">
                    <div className="w-64 h-64 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center bg-slate-50 relative group">
                      {/* Grid overlay to show pixel art transparency */}
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none rounded-3xl"></div>
                      
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={generatedImage} 
                        alt="Generated Asset Preview" 
                        className="max-w-[85%] max-h-[85%] object-contain pixelated drop-shadow-md transition-transform group-hover:scale-105"
                      />
                    </div>

                    {/* Output metadata */}
                    <div className="text-center">
                      <h4 className="text-sm font-bold text-[#0F172A]">{characterName || 'Personaje Sin Nombre'}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">{category} · {spriteSize}</p>
                    </div>

                    {/* Quick Utility Buttons */}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleDownload}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Descargar PNG
                      </button>
                      <button
                        onClick={handleSaveToLibrary}
                        disabled={isSaving}
                        className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isSaving ? 'Guardando...' : 'Guardar en Lib'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 space-y-4 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                      <Sparkles className="w-7 h-7 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-600">Ningún Asset Generado o Importado</h3>
                      <p className="text-xs text-slate-400 max-w-xs mt-1">Completa el formulario para generar o importa una imagen/carpeta local para comenzar.</p>
                    </div>
                    <div className="flex gap-2">
                      <label className="bg-blue-50 hover:bg-blue-100 text-[#0A84FF] px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-[0.97]">
                        <Download className="w-4 h-4 rotate-180" />
                        Importar Imagen
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <label className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-[0.97]">
                        <Download className="w-4 h-4 rotate-180" />
                        Importar Carpeta
                        <input
                          type="file"
                          webkitdirectory=""
                          directory=""
                          multiple
                          onChange={handleDirectoryImport}
                          className="hidden"
                          {...({ directory: "", webkitdirectory: "" } as any)}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Post Generation Tool Tabs (Only visible when generatedImage exists) */}
              {generatedImage && (
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#0F172A]">Herramientas de Post-Generación</h3>
                    <p className="text-[11px] text-slate-400">Genera rotaciones o animaciones a partir de este personaje.</p>
                  </div>

                  {/* 1. Generate Rotation */}
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <RotateCw className="w-4 h-4 text-[#0A84FF]" />
                      Generar Rotación de Dirección
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={rotationView}
                        onChange={(e) => setRotationView(e.target.value as any)}
                        className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none"
                      >
                        <option value="side">Sidescroller</option>
                        <option value="low top-down">Low Top-down</option>
                        <option value="high top-down">High Top-down</option>
                      </select>
                      <select
                        value={rotationDir}
                        onChange={(e) => setRotationDir(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none"
                      >
                        <option value="east">Este (East)</option>
                        <option value="west">Oeste (West)</option>
                        <option value="north">Norte (North)</option>
                        <option value="north-east">Nor-Este (North-East)</option>
                        <option value="south-east">Sur-Este (South-East)</option>
                      </select>
                    </div>
                    <button
                      onClick={handleGenerateRotation}
                      disabled={isGeneratingRotation}
                      className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-[#0A84FF] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isGeneratingRotation ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCw className="w-4 h-4" />
                      )}
                      {isGeneratingRotation ? 'Girando Sprite...' : 'Generar Rotación'}
                    </button>
                  </div>

                  {/* 2. Generate Animation */}
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Film className="w-4 h-4 text-[#0A84FF]" />
                      Crear Sprite Animado
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={animationAction}
                        onChange={(e) => setAnimationAction(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none"
                      >
                        <option value="walk">Caminar (Walk)</option>
                        <option value="attack">Atacar (Attack)</option>
                        <option value="idle">Esperar (Idle)</option>
                        <option value="jump">Saltar (Jump)</option>
                        <option value="die">Morir (Die)</option>
                      </select>
                      <select
                        value={animationFrames}
                        onChange={(e) => setAnimationFrames(Number(e.target.value))}
                        className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none"
                      >
                        <option value="4">4 Frames (Frames)</option>
                        <option value="8">8 Frames (Frames)</option>
                      </select>
                    </div>
                    <button
                      onClick={handleGenerateAnimation}
                      disabled={isGeneratingAnimation}
                      className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isGeneratingAnimation ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Film className="w-4 h-4" />
                      )}
                      {isGeneratingAnimation ? 'Animando...' : 'Generar Animación'}
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* History / Previous Generations List */}
          <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                <h3 className="text-base font-bold">Historial de Generaciones</h3>
              </div>
              <button 
                onClick={loadHistory}
                className="text-xs font-bold text-[#0A84FF] hover:underline"
              >
                Actualizar
              </button>
            </div>

            {historyList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No hay generaciones previas en la biblioteca aún.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {historyList.map((item) => (
                  <div 
                    key={item.id} 
                    className="border border-slate-100 rounded-2xl p-3 bg-slate-50 flex flex-col justify-between gap-3 group relative hover:shadow-md transition-all"
                  >
                    <div className="aspect-square bg-white border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.imageUrl} 
                        alt={item.characterName} 
                        className="max-w-[90%] max-h-[90%] object-contain pixelated"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold truncate">{item.characterName}</h4>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase truncate mt-0.5">
                        {item.type} · {item.width}x{item.height}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCharacterName(item.characterName);
                        setPrompt(item.description);
                        setNegativePrompt(item.negativeDescription || '');
                        setSpriteSize(`${item.width}x${item.height}` as any);
                        setCameraView(item.view as any);
                        setGeneratedImage(item.imageUrl);
                        toast.success('Prompt cargado desde el historial.');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-[#0A84FF] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Cargar prompt y preview"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </AdminGuard>
  );
}
