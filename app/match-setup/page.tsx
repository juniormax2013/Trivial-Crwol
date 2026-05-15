import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  HelpCircle, 
  Clock, 
  BarChart2, 
  Zap, 
  Crown, 
  Play 
} from 'lucide-react';

export default function MatchSetup() {
  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-32 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <Link href="/arena" className="mr-4 p-2 rounded-full hover:bg-[#310065]/5 transition-colors active:scale-95 duration-150 ease-in-out text-[#310065]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-serif text-xl tracking-tight text-[#310065] font-bold">Match Setup</h1>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-lg mx-auto space-y-8">
        
        {/* Category Card */}
        <section className="relative group overflow-hidden rounded-3xl bg-white shadow-[0_8px_24px_rgba(49,0,101,0.1)]">
          <div className="aspect-[4/5] w-full relative">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEJOX70dKO_WqBJxD-zTu1Y8d2qRnsKfOhbzglSheHDBlYvG2snLMhBQbTqjATT2qA70iKHXJ8qcl6H_UH_jK9nu2sTEYEaynuINVWlyp4X4KhI7k9KIhVhOfurYWwi6domnBzjp3RW5XdcM45eSzS_mPtSAVU5Ib8QctQXj6qCaW-8vLhtQNd6mnUKuIPHef4xekWv4c1dZzcouU92mRaeG2HhKph7Vesov-mBFxuwJQ5BRR6grYzAdIRuS0EqebOWzSDpvKBdmo"
              alt="Category background: Parábolas"
              fill
              className="object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#310065] via-transparent to-transparent opacity-90"></div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 w-full z-10">
              <span className="inline-block px-3 py-1 mb-3 rounded-full bg-[#cba72f] text-[#4e3d00] text-[10px] font-bold uppercase tracking-widest">
                Selected Category
              </span>
              <h2 className="font-serif text-4xl font-bold text-white mb-2 leading-tight">Parábolas</h2>
              <p className="text-white/80 text-[14px] font-medium leading-snug">Ancient wisdom through timeless stories and divine teachings.</p>
            </div>
          </div>
        </section>

        {/* Game Details Bento */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-[#f5f3f7] p-5 rounded-[1.25rem] flex flex-col justify-between space-y-4">
            <HelpCircle className="text-[#310065] w-7 h-7" strokeWidth={2.5} />
            <div>
              <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest mb-1">Quantity</p>
              <p className="text-lg font-bold font-serif text-[#1b1b1e]">10 Preguntas</p>
            </div>
          </div>
          
          <div className="bg-[#f5f3f7] p-5 rounded-[1.25rem] flex flex-col justify-between space-y-4">
            <Clock className="text-[#310065] w-7 h-7" strokeWidth={2.5} />
            <div>
              <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest mb-1">Pace</p>
              <p className="text-lg font-bold font-serif text-[#1b1b1e]">15 Segundos</p>
            </div>
          </div>
          
          <div className="bg-[#f5f3f7] p-5 rounded-[1.25rem] col-span-2 flex items-center space-x-4">
            <div className="h-12 w-12 rounded-[1rem] bg-[#eddcff] flex items-center justify-center">
              <BarChart2 className="text-[#310065] w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest mb-1">Complexity</p>
              <p className="text-lg font-bold font-serif text-[#1b1b1e]">Nivel Medio</p>
            </div>
          </div>
        </section>

        {/* Potential Rewards (Sacred Spoils) */}
        <section className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <h3 className="font-serif text-2xl font-bold text-[#1b1b1e]">Sacred Spoils</h3>
            <span className="text-[10px] font-bold text-[#735c00] uppercase tracking-widest pb-1">Potential Earnings</span>
          </div>
          
          <div className="bg-gradient-to-b from-[#f5f3f7] to-white p-1 rounded-[1.5rem] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <div className="bg-white rounded-[1.25rem] p-6 space-y-6">
              
              {/* Experience Points */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#eddcff] flex items-center justify-center">
                    <Zap className="text-[#4a148c] w-5 h-5 fill-current" />
                  </div>
                  <span className="font-bold text-[#1b1b1e] text-[15px]">Experience Points</span>
                </div>
                <span className="font-serif text-xl font-bold text-[#4a148c]">+200 XP</span>
              </div>
              
              <div className="h-px bg-[#cdc3d4]/40"></div>
              
              {/* Divine Crowns */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#ffe088] flex items-center justify-center">
                    <Crown className="text-[#735c00] w-5 h-5 fill-current" />
                  </div>
                  <span className="font-bold text-[#1b1b1e] text-[15px]">Divine Crowns</span>
                </div>
                <span className="font-serif text-xl font-bold text-[#735c00]">15 Coronas</span>
              </div>
              
            </div>
          </div>
        </section>

      </main>

      {/* BottomNavBar / CTA Container */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex flex-col items-center pt-5 pb-8 px-6 bg-white/90 backdrop-blur-xl shadow-[0_-4px_30px_rgba(49,0,101,0.08)] rounded-t-[2.5rem]">
        <button className="w-full max-w-lg py-[1.125rem] bg-[#310065] hover:bg-[#4a148c] rounded-[1.25rem] flex items-center justify-center text-white shadow-[0_8px_24px_rgba(49,0,101,0.25)] active:scale-95 transition-all duration-200">
          <Play className="mr-3 w-5 h-5 fill-current" />
          <span className="font-sans font-bold uppercase tracking-widest text-[14px]">Comenzar Desafío</span>
        </button>
      </nav>

    </div>
  );
}
