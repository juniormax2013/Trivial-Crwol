import Link from 'next/link';
import { 
  Menu, 
  UserCircle, 
  CheckCircle2, 
  Medal, 
  BookOpen, 
  Lightbulb, 
  Book, 
  Share2, 
  ScrollText, 
  ArrowRight,
  HelpCircle,
  BarChart3,
  User
} from 'lucide-react';

export default function Feedback() {
  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen flex flex-col font-sans selection:bg-[#eddcff] relative z-0">
      
      {/* Ambient Background Elements */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-[#310065]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-[#735c00]/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <Menu className="text-[#310065] cursor-pointer active:scale-95 duration-200 w-6 h-6" />
          <h1 className="font-serif text-xl font-bold text-[#310065]">Biblical Trivia</h1>
        </div>
        <div className="flex items-center gap-2">
          <UserCircle className="text-[#310065] cursor-pointer active:scale-95 duration-200 w-7 h-7" />
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-24 pb-32 px-6 max-w-2xl mx-auto w-full flex flex-col items-center">
        
        {/* Feedback Hero Section */}
        <div className="w-full flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            {/* Large Gold Glow Effect */}
            <div className="absolute inset-0 bg-[#735c00]/20 blur-3xl rounded-full scale-150"></div>
            {/* Correct Indicator (Checkmark) */}
            <div className="relative w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-[0_8px_32px_rgba(115,92,0,0.15)] border-4 border-[#e9c349]">
              <CheckCircle2 className="w-20 h-20 text-[#735c00] fill-current bg-white rounded-full" />
            </div>
          </div>
          
          <h2 className="font-serif text-4xl font-bold text-[#310065] mb-4 tracking-tight">Wisdom Revealed</h2>
          
          {/* Points Display */}
          <div className="bg-[#cba72f]/20 px-6 py-2 rounded-full flex items-center gap-2 border border-[#735c00]/10">
            <Medal className="text-[#735c00] w-[18px] h-[18px]" />
            <span className="font-bold text-[#735c00] tracking-wide">+10 Coronas</span>
          </div>
        </div>

        {/* Explanation Bento Card */}
        <section className="w-full space-y-4">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm relative overflow-hidden group border border-[#310065]/5">
            <div className="absolute -top-4 -right-4 p-4 opacity-[0.03]">
              <BookOpen className="w-32 h-32 text-[#310065]" />
            </div>
            
            <h3 className="font-serif text-xl text-[#310065] mb-4 flex items-center gap-2 relative z-10">
              <Lightbulb className="text-[#735c00] w-6 h-6 fill-current" />
              The Divine Insight
            </h3>
            
            <p className="text-[#4a4452] leading-relaxed text-[17px] mb-8 font-medium relative z-10">
              &quot;En el principio creó Dios los cielos y la tierra.&quot; This signifies the ultimate act of creation, establishing that everything in existence has a divine origin and purposeful design.
            </p>
            
            {/* Biblical Reference Section */}
            <div className="flex items-center justify-between pt-6 border-t border-[#cdc3d4]/30 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4a148c] flex items-center justify-center">
                  <Book className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#7c7483] font-bold">Sacred Text</p>
                  <p className="font-serif font-bold text-[#310065]">Génesis 1:1</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full hover:bg-[#f5f3f7] transition-colors flex items-center justify-center">
                <Share2 className="text-[#310065] w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Context Card (Asymmetric Layout) */}
          <div className="flex gap-4">
            <div className="flex-1 bg-[#f5f3f7] rounded-[1.5rem] p-6 border border-[#310065]/5">
              <ScrollText className="text-[#4a148c] mb-3 w-6 h-6" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#7c7483] mb-1.5">Context</p>
              <p className="text-[14px] text-[#1b1b1e] font-medium italic leading-snug">Written by Moses around 1445 BC.</p>
            </div>
            
            <div className="w-28 bg-[#ffe088] rounded-[1.5rem] p-4 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="font-serif text-3xl font-bold text-[#241a00] mb-1">1/10</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#241a00] opacity-70">Progress</span>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div className="w-full mt-10">
          <button className="w-full py-[1.125rem] rounded-[1rem] bg-[#310065] hover:bg-[#4a148c] text-white font-bold text-lg shadow-[0_8px_24px_rgba(49,0,101,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3">
            Continue Journey
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </main>

      {/* Bottom Navigation Shell */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-3 pb-8 bg-white/80 backdrop-blur-xl rounded-t-3xl border-t border-[#310065]/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="flex flex-col items-center justify-center bg-[#eddcff] text-[#310065] rounded-2xl px-6 py-2 active:scale-90 duration-200 cursor-default">
          <HelpCircle className="mb-1 w-5 h-5 fill-current" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Play</span>
        </div>
        <Link href="/rankings" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] transition-all active:scale-90 duration-200 px-4 py-1">
          <BarChart3 className="mb-1 w-5 h-5" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Rankings</span>
        </Link>
        <Link href="/study" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] transition-all active:scale-90 duration-200 px-4 py-1">
          <Book className="mb-1 w-5 h-5" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Study</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] transition-all active:scale-90 duration-200 px-4 py-1">
          <User className="mb-1 w-5 h-5" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </Link>
      </nav>

    </div>
  );
}
