import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, 
  Medal, 
  ScrollText, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Hourglass, 
  ChevronRight, 
  Swords, 
  Castle, 
  BookOpen 
} from 'lucide-react';

export default function ArenaMatch() {
  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] antialiased min-h-screen pb-24 font-sans selection:bg-[#eddcff]">
      
      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button className="text-[#310065] scale-95 active:duration-150">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif text-[22px] font-black text-[#310065]">Bible Crown</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-bold tracking-tight text-[#310065]">Arena</span>
          <button className="text-[#310065] scale-95 active:duration-150">
            <Medal className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="pt-24 px-4 max-w-lg mx-auto space-y-6">
        
        {/* Status Indicator */}
        <div className="flex justify-center">
          <div className="bg-[#4a148c] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(74,20,140,0.2)] flex items-center gap-2">
            <span className="w-2 h-2 bg-[#ffe088] rounded-full animate-pulse"></span>
            Tu turno
          </div>
        </div>

        {/* Versus Section */}
        <div className="relative flex items-center justify-between gap-2 py-4">
          
          {/* Background "Versus" Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <span className="font-serif text-8xl italic font-black text-[#310065]">VS</span>
          </div>

          {/* Player 1: Davi Lucas */}
          <div className="flex-1 flex flex-col items-center z-10">
            <div className="relative group">
              {/* Glow Behind Image */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#310065] to-[#4a148c] rounded-full blur-md opacity-30"></div>
              
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4GZ8fdu47CGCmElu0wFjlsASYO0zESmTv_7eofmcpjTpCgNPNjKybtZBHu_g2a2JG9rNB4b9cd9Gc2zmP1e_0RFC6oKdQB7lOvhxnh4YsKbDyTlP6km0QebOxjYLpTd_oDMoi0mx-Qw4RY2VzkRvl2rp1m3BOVndXrA92_BEQdun6YMPw0fXdMI8OCPKjl2nkgB8_8TmaeychfIaqpisktwkfTWsqisX61QmfGY6BQ7lgxznp2xWHfEU5Hg_zlOB00J6w0mlUq2M"
                alt="Davi Lucas profile picture"
                width={80} height={80}
                className="w-20 h-20 rounded-full object-cover border-4 border-white relative shadow-xl"
              />
              
              <div className="absolute -bottom-2 -right-2 bg-[#735c00] text-white rounded-full p-1.5 shadow-lg border-2 border-[#faf9fc]">
                <Medal className="w-4 h-4 fill-current" />
              </div>
            </div>
            
            <h3 className="mt-4 font-serif text-lg font-bold text-[#310065]">Davi Lucas</h3>
            <div className="mt-1 font-serif text-[28px] font-black text-[#1b1b1e] leading-none">1,240</div>
            <span className="text-[10px] font-bold text-[#7c7483] uppercase tracking-tighter mt-1">Puntos</span>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center px-4">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#cdc3d4] to-transparent"></div>
            <div className="my-2 bg-[#e9e7eb] rounded-full w-10 h-10 flex items-center justify-center text-[#310065] font-serif italic font-black text-sm border-2 border-white shadow-sm">
              VS
            </div>
            <div className="w-px h-12 bg-gradient-to-t from-transparent via-[#cdc3d4] to-transparent"></div>
          </div>

          {/* Player 2: Sara_Grace */}
          <div className="flex-1 flex flex-col items-center z-10">
            <div className="relative group">
              {/* Glow Behind Image */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#7c7483] to-[#cdc3d4] rounded-full blur-md opacity-20"></div>
              
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz8Lf6ZGWKfIDi0QRFBPyVN6JyYf_jSJ5LPz_LBZ-8VLmnagkUAYGecb2Z_fjbT4TnUpXqXW-qEMzi6FCZ9NxsH4HVbVah19JnuqKy6HUl5S-gwi2iJOKLOxGKUlrf9EyX-3RizOpxXYZnVapJMuf2xZR1kegKoTrfT_cwMn2oIksYpi6Ga7AM0cGjwx20c_921pF0ny_xc6sXEqVOJpYPxfSxCa6GNcz5Csre83t5jsRVBDcdoJ-WOltep3ABdRflQPL97SluufQ"
                alt="Sara_Grace profile picture"
                width={80} height={80}
                className="w-20 h-20 rounded-full object-cover border-4 border-white relative shadow-xl grayscale"
              />
              
              <div className="absolute -bottom-2 -left-2 bg-[#e3e2e6] text-[#4a4452] rounded-full p-1.5 shadow-lg border-2 border-[#faf9fc]">
                <ScrollText className="w-4 h-4" />
              </div>
            </div>
            
            <h3 className="mt-4 font-serif text-lg font-bold text-[#705573]">Sara_Grace</h3>
            <div className="mt-1 font-serif text-[28px] font-black text-[#1b1b1e] leading-none opacity-80">985</div>
            <span className="text-[10px] font-bold text-[#7c7483] uppercase tracking-tighter mt-1">Puntos</span>
          </div>

        </div>

        {/* Round Progression */}
        <div className="bg-[#f5f3f7] rounded-[1.5rem] p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#310065]/5">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#7c7483] tracking-widest block mb-1">Competición</span>
              <h2 className="font-serif text-[22px] font-bold text-[#310065] leading-none">Ronda 2 de 5</h2>
            </div>
            <div className="flex gap-1.5 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-[#310065]"></div>
              <div className="w-2 h-2 rounded-full bg-[#310065]/40"></div>
              <div className="w-2 h-2 rounded-full bg-[#cdc3d4]"></div>
              <div className="w-2 h-2 rounded-full bg-[#cdc3d4]"></div>
              <div className="w-2 h-2 rounded-full bg-[#cdc3d4]"></div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2.5 w-full bg-[#e3e2e6] rounded-full overflow-hidden">
            <div className="absolute h-full w-2/5 bg-gradient-to-r from-[#735c00] to-[#cba72f] rounded-full"></div>
          </div>
          
          <p className="text-xs text-[#4a4452] italic text-center leading-relaxed">
            &quot;La sabiduría es más preciosa que las piedras preciosas...&quot;
          </p>
        </div>

        {/* Turn History Bento Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[1.5rem] flex flex-col justify-between h-[120px] shadow-sm border border-[#310065]/5">
            <Sparkles className="text-[#735c00] w-7 h-7 fill-[#cba72f]" />
            <div>
              <div className="text-[10px] font-bold uppercase text-[#7c7483] mb-0.5 tracking-wider">Última acción</div>
              <div className="font-serif text-[17px] font-bold text-[#310065]">Parábolas II</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#310065] to-[#4a148c] p-5 rounded-[1.5rem] flex flex-col justify-between h-[120px] text-white shadow-[0_8px_20px_rgba(49,0,101,0.25)]">
            <Zap className="text-[#ffe088] w-7 h-7 fill-current" />
            <div>
              <div className="text-[10px] font-bold uppercase text-[#d7baff] mb-0.5 tracking-wider">Tu Efectividad</div>
              <div className="font-serif text-[28px] font-black leading-none">94%</div>
            </div>
          </div>
        </div>

        {/* Recent Turn Outcomes */}
        <div className="space-y-3 pt-2">
          <h4 className="px-2 text-[11px] font-extrabold uppercase text-[#7c7483] tracking-widest mb-1">Actividad Reciente</h4>
          
          {/* Turn Row 1 */}
          <div className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-[#310065]/5 cursor-pointer hover:bg-[#f5f3f7] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                <CheckCircle2 className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#1b1b1e]">Acertaste: Profetas</div>
                <div className="text-[10px] font-semibold text-[#7c7483] mt-0.5">Hace 2 min</div>
              </div>
            </div>
            <div className="text-[15px] font-serif font-black text-[#310065]">+150</div>
          </div>
          
          {/* Turn Row 2 */}
          <div className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-[#310065]/5 opacity-80 cursor-pointer hover:bg-[#f5f3f7] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e9e7eb] flex items-center justify-center text-[#7c7483]">
                <Hourglass className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#1b1b1e]">Sara_Grace respondió</div>
                <div className="text-[10px] font-semibold text-[#7c7483] mt-0.5">Hace 5 min</div>
              </div>
            </div>
            <div className="text-[15px] font-serif font-black text-[#705573]">+120</div>
          </div>
          
          {/* Turn Row 3 */}
          <div className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-[#310065]/5 cursor-pointer hover:bg-[#f5f3f7] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eddcff] flex items-center justify-center text-[#310065]">
                <ScrollText className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#1b1b1e]">Ronda 1 Completada</div>
                <div className="text-[10px] font-semibold text-[#7c7483] mt-0.5">Hace 8 min</div>
              </div>
            </div>
            <ChevronRight className="text-[#7c7483] w-5 h-5" />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 relative z-10">
          <button className="w-full py-[1.125rem] bg-gradient-to-r from-[#310065] to-[#4a148c] text-white font-bold text-[15px] rounded-[1.25rem] shadow-[0_8px_24px_rgba(49,0,101,0.25)] active:scale-[0.98] transition-transform flex items-center justify-center gap-3">
            <span className="tracking-widest">RECLAMAR TURNO</span>
            <Swords className="w-5 h-5 fill-current" />
          </button>
        </div>

      </main>

      {/* Bottom Navigation Shell */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-xl rounded-t-[2rem] border-t border-[#310065]/5 shadow-[0_-4px_30px_rgba(27,27,30,0.04)] z-40">
        
        <Link href="/" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] px-4 py-2 transition-all active:scale-95 duration-200">
          <Castle className="mb-1 w-[22px] h-[22px]" />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-widest">Temple</span>
        </Link>
        
        {/* Active Tab: Arena */}
        <div className="flex flex-col items-center justify-center bg-[#eddcff] text-[#310065] rounded-[1.25rem] px-6 py-2 shadow-sm cursor-default">
          <Swords className="mb-1 w-[22px] h-[22px] fill-current" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Arena</span>
        </div>
        
        <Link href="/crowns" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] px-4 py-2 transition-all active:scale-95 duration-200">
          <Medal className="mb-1 w-[22px] h-[22px]" />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-widest">Crowns</span>
        </Link>
        
        <Link href="/profile" className="flex flex-col items-center justify-center text-[#7c7483] hover:text-[#310065] px-4 py-2 transition-all active:scale-95 duration-200">
          <BookOpen className="mb-1 w-[22px] h-[22px]" />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-widest">Scribe</span>
        </Link>
        
      </nav>

    </div>
  );
}
