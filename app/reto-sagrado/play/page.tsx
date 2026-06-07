'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  AlertTriangle,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Check,
  Award,
  Zap,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage, useT } from '@/lib/i18n/context';
import { getSacredQuestions, SacredQuestion } from '@/lib/reto-sagrado/questions';
import { playCorrectSound, playWrongSound } from '@/lib/game/audio';
import { grantJweRewards } from '@/lib/user/repository';
import { toast } from 'sonner';

export default function RetoSagradoPlay() {
  const { user } = useAuthContext();
  const { language, isLoaded } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMultiplayer = searchParams.get('multiplayer') === 'true';

  // Game state
  const [questions, setQuestions] = useState<SacredQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showTypeAnnouncement, setShowTypeAnnouncement] = useState(true);

  const currentQuestion = questions[currentIdx];

  // Initialize questions
  useEffect(() => {
    if (!isLoaded) return;

    // Get all combined questions for the selected language
    let combined = getSacredQuestions((language === 'es' || language === 'fr' || language === 'ht') ? language : 'es');
    
    if (isMultiplayer) {
      // 1. Separate pools by difficulty
      const easyPool = combined.filter(q => q.difficulty === 'easy' || !q.difficulty);
      const mediumPool = combined.filter(q => q.difficulty === 'medium');
      const hardPool = combined.filter(q => q.difficulty === 'hard');

      // 2. Select quantities: 15 easy, 15 medium, 20 hard
      const selectedEasy = [...easyPool].sort(() => Math.random() - 0.5).slice(0, 15);
      const selectedMedium = [...mediumPool].sort(() => Math.random() - 0.5).slice(0, 15);
      const selectedHard = [...hardPool].sort(() => Math.random() - 0.5).slice(0, 20);

      // 3. Group by type within each difficulty level to preserve transition announcements
      selectedEasy.sort((a, b) => a.type.localeCompare(b.type));
      selectedMedium.sort((a, b) => a.type.localeCompare(b.type));
      selectedHard.sort((a, b) => a.type.localeCompare(b.type));

      // 4. Concatenate to maintain Easy -> Medium -> Hard progression
      setQuestions([...selectedEasy, ...selectedMedium, ...selectedHard]);
    } else {
      // Determine number of questions based on difficulty
      const diff = searchParams.get('difficulty') || 'easy';
      let questionCount = 10;
      if (diff === 'medium') questionCount = 20;
      else if (diff === 'hard') questionCount = 30;

      // Distribute among different types
      const allTypes = ['multiple_choice', 'true_false', 'complete_sentence', 'trick_question', 'order_events', 'image_question'];
      const activeTypes = [...allTypes].sort(() => Math.random() - 0.5);
      
      let perType = 2;
      if (questionCount === 20) perType = 4;
      else if (questionCount === 30) perType = 6;
      
      const chosen: SacredQuestion[] = [];
      for (const t of activeTypes) {
        const ofType = combined.filter(q => q.type === t);
        if (ofType.length > 0) {
          const shuffledOfType = [...ofType].sort(() => Math.random() - 0.5).slice(0, perType);
          chosen.push(...shuffledOfType);
        }
        if (chosen.length >= questionCount) break;
      }

      const finalSelection = chosen.slice(0, questionCount);
      // Sort to group identical types together
      finalSelection.sort((a, b) => a.type.localeCompare(b.type));

      setQuestions(finalSelection);
    }
    setIsLoading(false);
  }, [language, searchParams, isMultiplayer]);

  // Set up order_events items when entering an ordering question
  useEffect(() => {
    if (currentQuestion && currentQuestion.type === 'order_events') {
      const items = [...currentQuestion.options].sort(() => Math.random() - 0.5);
      setOrderedItems(items);
    }
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentIdx, currentQuestion]);

  const handleOrderChange = (index: number, direction: 'up' | 'down') => {
    if (isAnswered) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= orderedItems.length) return;

    const list = [...orderedItems];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;
    setOrderedItems(list);
  };

  const handleCheckAnswer = () => {
    if (isAnswered || !currentQuestion) return;

    let correct = false;

    if (currentQuestion.type === 'order_events') {
      const answers = currentQuestion.correctAnswer as string[];
      correct = orderedItems.every((val, i) => val === answers[i]);
    } else {
      correct = selectedOption === currentQuestion.correctAnswer;
    }

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      playCorrectSound();
      setScore(prev => prev + 1);
      toast.success(language === 'ht' ? 'Bravo! Bon repons' : '¡Excelente! Respuesta correcta');
    } else {
      playWrongSound();
      const newHearts = hearts - 1;
      setHearts(newHearts);
      toast.error(
        language === 'ht' 
          ? `Manti! Repons la se: ${Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(' -> ') : currentQuestion.correctAnswer}` 
          : `Incorrecto. La respuesta es: ${Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(' -> ') : currentQuestion.correctAnswer}`
      );

      if (newHearts <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1500);
      }
    }
  };

  const handleNext = async () => {
    const nextIdx = currentIdx + 1;
    const isLast = nextIdx >= questions.length;
    if (isLast) {
      setIsGameOver(true);
      if (user?.uid && score > 0) {
        // Grant some rewards on finish
        try {
          await grantJweRewards(user.uid, false, 1.5);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      const nextQuestion = questions[nextIdx];
      if (nextQuestion.type !== currentQuestion.type) {
        setShowTypeAnnouncement(true);
      }
      setCurrentIdx(nextIdx);
    }
  };

  // Render SVG illustrations inside image questions
  const renderImageIllustration = (type?: string) => {
    switch (type) {
      case 'tablets':
        return (
          <div className="w-32 h-32 bg-amber-50 rounded-full flex items-center justify-center border-4 border-amber-200/50 shadow-inner relative">
            <Bookmark className="w-16 h-16 text-amber-600 fill-amber-500/20" strokeWidth={1.5} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-1 pt-1">
              <div className="w-5 h-8 bg-amber-100 border border-amber-300 rounded-sm flex flex-col gap-1 p-0.5 justify-around">
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
              </div>
              <div className="w-5 h-8 bg-amber-100 border border-amber-300 rounded-sm flex flex-col gap-1 p-0.5 justify-around">
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
                <div className="h-0.5 w-full bg-amber-400 rounded-full"></div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-200/50 shadow-inner">
            <ImageIcon className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
          </div>
        );
    }
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A84FF]"></div>
      </div>
    );
  }

  // GAME OVER / SUMMARY SCREEN
  if (isGameOver) {
    const isWin = score >= 3 && hearts > 0;
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 text-center py-12 overflow-hidden bg-white pt-safe pb-safe">
        {/* Decorative ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#fdfbfb_0%,#ebedee_100%)] opacity-50 -z-10"></div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-10 rounded-[3rem] border border-[#0A84FF]/10 shadow-2xl flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border ${
            isWin 
              ? 'bg-green-50 text-green-600 border-green-100' 
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            <Award size={48} />
          </div>

          <h1 className="text-[32px] font-black text-[#0f172a] mb-2 uppercase tracking-tighter">
            {isWin ? (language === 'ht' ? 'Ou Genyen!' : '¡Victoria!') : (language === 'ht' ? 'Jwèt Fini!' : 'Fin del Juego')}
          </h1>
          
          <p className="text-[#64748B] mb-8 text-[14px] font-medium max-w-[280px]">
            {isWin 
              ? (language === 'ht' ? 'Felisitasyon! Ou pase tès sagrado sa a.' : '¡Felicitaciones! Has superado el Reto Sagrado.')
              : (language === 'ht' ? 'Pran kouraj, eseye ankò pou w vin pi fò!' : '¡Sigue practicando la palabra para vencer la próxima vez!')}
          </p>

          {/* Reward cards */}
          <div className="bg-[#f8fafc] rounded-[2rem] p-6 shadow-inner w-full mb-8 border border-[#0A84FF]/5">
            <h3 className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-4">
              {language === 'ht' ? 'REZILTA PATI AN' : 'RESULTADOS DE LA PARTIDA'}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-1 text-[#0f172a]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">{language === 'ht' ? 'Kesyon' : 'Aciertos'}</span>
                <span className="font-extrabold text-[18px] text-[#0A84FF]">{score} / {questions.length}</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[#0f172a]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">XP</span>
                <span className="font-extrabold text-[18px] text-[#0A84FF]">{isWin ? '+50' : '+15'}</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[#0f172a]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">{language === 'ht' ? 'Kouwòn' : 'Coronas'}</span>
                <span className="font-extrabold text-[18px] text-amber-500">{isWin ? '+2' : '0'}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => router.push('/reto-sagrado')}
            className="w-full bg-[#0A84FF] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/25 hover:scale-105 active:scale-95 transition-transform"
          >
            {language === 'ht' ? 'KONTINYE' : 'CONTINUAR'}
          </button>
        </div>
      </div>
    );
  }

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return language === 'ht' ? 'Chwa Miltip' : language === 'fr' ? 'Choix Multiple' : 'Selección Múltiple';
      case 'true_false':
        return language === 'ht' ? 'Verite oswa Manti' : language === 'fr' ? 'Vrai ou Faux' : 'Verdadero o Falso';
      case 'complete_sentence':
        return language === 'ht' ? 'Ranpli Fraz la' : language === 'fr' ? 'Compléter la Phrase' : 'Completar la Frase';
      case 'order_events':
        return language === 'ht' ? 'Mete Evènman yo nan Lòd' : language === 'fr' ? 'Ordonner les Événements' : 'Ordenar Eventos';
      case 'image_question':
        return language === 'ht' ? 'Kesyon ak Ilistrasyon' : language === 'fr' ? 'Question avec Illustration' : 'Pregunta con Ilustración';
      case 'trick_question':
        return language === 'ht' ? 'Kesyon Pyèj' : language === 'fr' ? 'Question Piège' : 'Pregunta con Trampa';
      default:
        return language === 'ht' ? 'Nouvo Mòd' : language === 'fr' ? 'Nouveau Mode' : 'Nuevo Tipo';
    }
  };

  const getTypeDesc = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return language === 'ht' 
          ? 'Chwazi sèl repons ki kòrèk la pami kat opsyon yo.' 
          : language === 'fr' 
          ? 'Choisissez la seule bonne réponse parmi les quatre options.' 
          : 'Elige la única respuesta correcta de las cuatro opciones.';
      case 'true_false':
        return language === 'ht' 
          ? 'Deside si deklarasyon an se verite oswa manti.' 
          : language === 'fr' 
          ? 'Décidez si l\'affirmation est vraie ou fausse.' 
          : 'Decide si la afirmación es verdadera o falsa.';
      case 'complete_sentence':
        return language === 'ht' 
          ? 'Ranpli espas ki vid la ak opsyon ki pi apwopriye a.' 
          : language === 'fr' 
          ? 'Remplissez le vide avec l\'option la plus appropriée.' 
          : 'Completa el espacio en blanco con la opción más adecuada.';
      case 'order_events':
        return language === 'ht' 
          ? 'Deplase eleman yo pou mete yo nan lòd kwonolojik kòrèk la.' 
          : language === 'fr' 
          ? 'Déplacez les éléments pour les mettre dans le bon ordre chronologique.' 
          : 'Mueve los elementos para colocarlos en el orden cronológico correcto.';
      case 'image_question':
        return language === 'ht' 
          ? 'Gade ilistrasyon an epi reponn kesyon an kòrèkteman.' 
          : language === 'fr' 
          ? 'Regardez l\'illustration et répondez correctement à la question.' 
          : 'Mira la ilustración y responde correctamente a la pregunta.';
      case 'trick_question':
        return language === 'ht' 
          ? 'Fè atansyon! Kesyon sa a gen yon ti detay ki ka twonpe w.' 
          : language === 'fr' 
          ? 'Faites attention ! Cette question a un piège subtil.' 
          : '¡Ten cuidado! Esta pregunta tiene una trampa sutil.';
      default:
        return '';
    }
  };

  if (showTypeAnnouncement && currentQuestion) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex flex-col items-center justify-center px-6 text-center py-12">
        <div className="w-full max-w-md bg-white p-10 rounded-[3rem] border border-[#0A84FF]/10 shadow-2xl flex flex-col items-center gap-6 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0A84FF] flex items-center justify-center shadow-inner animate-pulse">
            <Sparkles size={32} />
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#64748B] uppercase">
              {language === 'ht' ? 'PWOCHÈN WON' : 'SIGUIENTE RONDA'}
            </span>
            <h2 className="text-[28px] font-serif font-black text-[#0f172a] leading-tight">
              {getTypeTitle(currentQuestion.type)}
            </h2>
            <p className="text-[#64748B] text-[13px] font-medium leading-relaxed max-w-[280px] mx-auto">
              {getTypeDesc(currentQuestion.type)}
            </p>
          </div>

          <button
            onClick={() => setShowTypeAnnouncement(false)}
            className="w-full bg-[#0A84FF] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/25 hover:scale-105 active:scale-95 transition-transform mt-4"
          >
            <span>{language === 'ht' ? 'Mwen Pare' : '¡Estoy Listo!'}</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen flex flex-col font-sans relative pt-safe">
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.06]">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0A84FF] blur-[150px] rounded-full scale-150"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9fc]/80 backdrop-blur-xl border-b border-[#0A84FF]/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-screen-md mx-auto">
          <button 
            onClick={() => setShowExitConfirm(true)} 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eddcff]/50 transition-colors"
          >
            <X className="w-6 h-6 text-[#1b1b1e]" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100">
              <span className="text-[13px] font-black text-red-600 flex items-center gap-1.5">
                ❤️ {hearts}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Gameplay Container */}
      <main className="flex-grow pt-24 pb-12 px-6 flex flex-col max-w-[480px] mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#64748B] uppercase">
              {language === 'ht' ? `Kesyon ${currentIdx + 1} sou ${questions.length}` : `Pregunta ${currentIdx + 1} de ${questions.length}`}
            </span>
            <span className="text-[12px] font-bold text-[#0A84FF]">
              {Math.round(((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#e3e2e6] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#0A84FF] to-[#310065] transition-all duration-300"
              style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Text Box */}
        <div className="bg-white rounded-[2.5rem] px-8 py-9 shadow-sm mb-6 relative border border-[#1b1b1e]/5 overflow-hidden flex flex-col items-center gap-6">
          {currentQuestion?.imageType && renderImageIllustration(currentQuestion.imageType)}
          <p className="text-[22px] font-serif font-bold text-[#0f172a] leading-tight text-center relative z-10">
            {currentQuestion ? currentQuestion.questionText : 'Chaje kesyon...'}
          </p>
        </div>

        {/* Question Type Options Layout */}
        <div className="space-y-3 mb-10">
          {/* order_events specific layout */}
          {currentQuestion?.type === 'order_events' ? (
            <div className="space-y-2">
              {orderedItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-full p-4.5 rounded-2xl flex items-center justify-between border bg-white shadow-sm transition-all ${
                    isAnswered
                      ? isCorrect
                        ? 'border-green-300 bg-green-50/20'
                        : 'border-red-300 bg-red-50/20'
                      : 'border-[#1b1b1e]/5 hover:border-[#0A84FF]/30'
                  }`}
                >
                  <span className="text-[14px] font-bold text-[#0f172a]">{item}</span>
                  {!isAnswered && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOrderChange(idx, 'up')}
                        disabled={idx === 0}
                        className="w-8 h-8 rounded-lg bg-[#faf9fc] hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => handleOrderChange(idx, 'down')}
                        disabled={idx === orderedItems.length - 1}
                        className="w-8 h-8 rounded-lg bg-[#faf9fc] hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Standard options choice layout */
            currentQuestion?.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              
              let btnClass = "w-full text-left p-5 rounded-[1.5rem] transition-all flex items-center border shadow-sm ";
              let labelClass = "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center mr-4 font-bold text-[16px] ";
              
              if (!isAnswered) {
                if (isSelected) {
                  btnClass += "bg-[#0A84FF] text-white border-transparent ring-4 ring-[#0A84FF]/25 scale-[0.99]";
                  labelClass += "bg-white/20 text-white";
                } else {
                  btnClass += "bg-white hover:bg-slate-50 border-[#1b1b1e]/5 active:scale-[0.98]";
                  labelClass += "bg-[#faf9fc] text-[#64748B] border border-[#1b1b1e]/5";
                }
              } else if (isCorrectOption) {
                btnClass += "bg-green-500 text-white border-green-400 shadow-green-200 ring-4 ring-green-500/20";
                labelClass += "bg-white/20 text-white";
              } else if (isSelected && !isCorrect) {
                btnClass += "bg-red-500 text-white border-red-400 shadow-red-200 ring-4 ring-red-500/20";
                labelClass += "bg-white/20 text-white";
              } else {
                btnClass += "bg-white border-[#1b1b1e]/5 opacity-60";
                labelClass += "bg-[#faf9fc] text-[#64748B]";
              }

              return (
                <button 
                  key={option}
                  disabled={isAnswered}
                  onClick={() => setSelectedOption(option)}
                  className={btnClass}
                >
                  <div className={labelClass}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-[16px] font-bold flex-grow">
                    {option}
                  </span>
                  {isAnswered && isCorrectOption && <CheckCircle2 className="w-6 h-6 text-white shrink-0 ml-2" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-white shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>

        {/* Explanation Card when answered */}
        {isAnswered && (
          <div className="bg-blue-50/35 border border-blue-100/50 rounded-3xl p-5 mb-8 text-center animate-in fade-in duration-300">
            <p className="text-[12px] text-[#64748B] leading-relaxed">
              {currentQuestion.explanation}
            </p>
            <p className="text-[11px] font-bold text-[#0A84FF] mt-1.5 uppercase tracking-wider">
              📖 {currentQuestion.bibleReference}
            </p>
          </div>
        )}

        {/* Dynamic Action Buttons */}
        {!isAnswered ? (
          <button 
            onClick={handleCheckAnswer}
            disabled={currentQuestion?.type !== 'order_events' && !selectedOption}
            className="w-full bg-[#0A84FF] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/20 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{language === 'ht' ? 'Tcheke Repons' : 'Comprobar'}</span>
            <Check size={20} />
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="w-full bg-[#0A84FF] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/25 hover:scale-105 active:scale-95 transition-transform"
          >
            <span>{currentIdx >= questions.length - 1 ? (language === 'ht' ? 'Fini Jwèt' : 'Finalizar') : (language === 'ht' ? 'Kesyon Pwochen' : 'Siguiente')}</span>
            <ChevronRight size={20} />
          </button>
        )}
      </main>

      {/* Exit Confirmation Modal Overlay */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center border border-white/20 shadow-2xl relative flex flex-col items-center gap-6 animate-scale-in">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center shadow-inner">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-black text-[#310065] italic">
                {language === 'ht' ? 'Èske ou vle kite jwèt la?' : '¿De verdad quieres salir?'}
              </h3>
              <p className="text-[12px] font-semibold text-[#1b1b1e]/60 leading-relaxed max-w-[90%] mx-auto">
                {language === 'ht' 
                  ? 'Si ou pati kounye a, ou pral pèdi tout pwogrè ak enèji ou te envesti nan pati sa a. Pa abandone!'
                  : 'Si te retiras ahora, perderás el progreso actual del Reto Sagrado. ¡No te rindas!'}
              </p>
            </div>

            <div className="flex gap-4 w-full pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-4 bg-gradient-to-r from-amber-400 to-[#e9c349] text-[#310065] rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                {language === 'ht' ? 'KONTINYE JWE' : 'SEGUIR JUGANDO'}
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  router.push('/reto-sagrado');
                }}
                className="flex-1 py-4 bg-[#f5f3f7] hover:bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-transparent shadow-sm hover:scale-105 active:scale-95 transition-transform"
              >
                {language === 'ht' ? 'KITE JWÈT LA' : 'SALIR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
