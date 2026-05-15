'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Award, 
  Gavel, 
  Sparkles, 
  Landmark, 
  ScrollText, 
  Castle, 
  Medal, 
  Swords 
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';

export default function TournamentDetail() {
  const { user } = useAuthContext();

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-32 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <div className="flex items-center gap-4">
            <Link href="/arena" className="text-[#310065] hover:bg-[#310065]/5 transition-colors p-2 -ml-2 rounded-full active:scale-95">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-serif text-lg font-bold tracking-tight text-[#310065]">Bible Crown</h1>
          </div>
          <div className="flex items-center gap-2">
            <Award className="text-[#310065] w-6 h-6" />
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
        
        {/* Hero Section */}
        <section className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(49,0,101,0.15)] mx-2 sm:mx-0">
          <Image 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgvrvrBF5UEx95CrvsyNqcIKLNXwfjgeVLta0Tl6HvFOZek5XVwd3pWgk8L5dx6lVWaovifSE3m5AQhGsk15BdnPjgx_8Vukq31KGOKRGu7y80FuibudA1yr3QQxRLrkbwYU1J46Jni5EQDyTv_oAlCOl5guA8NXALDomNQJutTNDSMmlHeE_boEJQvgA7x2ZMnFskebEbGF7t0S2IU-Wmd1dvQ9R3T_lPWng24pm606KZgin9aV5RRUAipVTCjY2z-mKeYXXNfwM"
            alt="Corona Sagrada"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#310065]/95 via-[#310065]/40 to-transparent flex flex-col justify-end p-8">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="bg-[#cba72f] text-[#4e3d00] px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">Activo</span>
              <span className="text-white/90 text-[13px] font-medium tracking-wide">Finaliza en 2d 14h</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-white font-black tracking-tight mb-2">Copa de los Reyes</h2>
            <p className="text-[#d7baff]/90 text-[15px] font-medium max-w-2xl leading-relaxed">El torneo definitivo para los estudiosos de las monarquías bíblicas y la sabiduría de Salomón.</p>
          </div>
        </section>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-2 sm:mx-0">
          
          {/* Rules Section (Left Column) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Reglas del Reino */}
            <div className="bg-[#f5f3f7] rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Gavel className="text-[#310065] w-8 h-8" strokeWidth={2.5} />
                <h3 className="font-serif text-2xl font-bold text-[#310065]">Reglas del Reino</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-[#310065]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#310065] font-bold text-[11px]">1</span>
                  </div>
                  <p className="text-[#4a4452] text-[15px] leading-relaxed">Cada participante tiene 3 intentos diarios para acumular puntos sagrados.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-[#310065]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#310065] font-bold text-[11px]">2</span>
                  </div>
                   <p className="text-[#4a4452] text-[15px] leading-relaxed">La rapidez otorga multiplicadores de &quot;Sabiduría Divina&quot; hasta x2.5.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-[#310065]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#310065] font-bold text-[11px]">3</span>
                  </div>
                   <p className="text-[#4a4452] text-[15px] leading-relaxed">El uso de &quot;Pergaminos de Ayuda&quot; reduce la puntuación final de la ronda en un 15%.</p>
                </li>
              </ul>
            </div>

            {/* Categorías Ungidas */}
            <div className="bg-[#f5f3f7] rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-[#310065] w-8 h-8" strokeWidth={2.5} />
                <h3 className="font-serif text-2xl font-bold text-[#310065]">Categorías Ungidas</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <Landmark className="text-[#735c00] w-7 h-7 mb-3" />
                  <span className="text-[13px] font-bold text-[#1b1b1e]">Reino de Judá</span>
                </div>
                <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <ScrollText className="text-[#735c00] w-7 h-7 mb-3" />
                  <span className="text-[13px] font-bold text-[#1b1b1e]">Profecías Reales</span>
                </div>
                <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <Castle className="text-[#735c00] w-7 h-7 mb-3" />
                  <span className="text-[13px] font-bold text-[#1b1b1e]">El Templo</span>
                </div>
              </div>
            </div>

          </div>

          {/* Prizes & Leaderboard (Right Column) */}
          <div className="space-y-6">
            
            {/* Recompensas Sagradas */}
            <div className="bg-[#f5f3f7] rounded-[2rem] p-6 sm:p-8 relative overflow-hidden">
              {/* Decorative radial gradient in bg */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#cba72f]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Medal className="text-[#735c00] w-8 h-8" strokeWidth={2.5} />
                <h3 className="font-serif text-2xl font-bold text-[#310065]">Premios</h3>
              </div>
              
              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-[#735c00] rounded-xl flex items-center justify-center text-white font-black shadow-[0_4px_12px_rgba(115,92,0,0.2)]">1º</div>
                    <div className="text-[14px] font-bold text-[#1b1b1e]">Corona de Oro</div>
                  </div>
                  <div className="text-[#735c00] font-black text-lg">500 <span className="text-[9px] uppercase tracking-wider font-bold">Puntos</span></div>
                </div>
                <div className="flex items-center justify-between opacity-80">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-[#e3e2e6] rounded-xl flex items-center justify-center text-[#4a4452] font-black">2º</div>
                    <div className="text-[14px] font-bold text-[#1b1b1e]">Esfera de Plata</div>
                  </div>
                  <div className="text-[#4a4452] font-black text-lg">250 <span className="text-[9px] uppercase tracking-wider font-bold">Puntos</span></div>
                </div>
                <div className="flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-[#cba72f]/40 rounded-xl flex items-center justify-center text-[#735c00] font-black">3º</div>
                    <div className="text-[14px] font-bold text-[#1b1b1e]">Insignia de Bronce</div>
                  </div>
                  <div className="text-[#735c00] font-black text-lg">100 <span className="text-[9px] uppercase tracking-wider font-bold">Puntos</span></div>
                </div>
              </div>
            </div>

            {/* Ranking del Torneo (Mini-view) */}
            <div className="bg-[#f5f3f7] rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-[22px] font-bold text-[#310065]">Ranking</h3>
                <button className="text-[#310065] text-[10px] font-bold uppercase tracking-widest hover:text-[#4a148c]">Ver todo</button>
              </div>
              <div className="space-y-3">
                
                <div className="flex items-center gap-3.5 bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <span className="font-black text-[#735c00] w-4 text-center">1</span>
                  <Image 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSSlt6l4v3QtgUPompk4gaS_XZolSTF4FltgTgwz4FEgb1ROeAkvNNjuN_osfR3_vSZ_khoi4JM-Zmp1r2StmysYPenwUJzNdjVd3tQYl1JOK0U-tdHsA33fVo24usNbokxaGf41eZTq4Gb3zPo-GAvBQ8UiYKS6zKtTTW5IvIyDpq_hPwwtCi7XAebELSGP7w8y5p5WfN1i3bk03y3xprMQ41vG1NZnoTnBRsly4-yruP-VrBIJSHnvqFd_FDfoyE1imCUyif7q8"
                    width={36} height={36} alt="Elias"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="text-[14px] font-bold flex-1 truncate text-[#1b1b1e]">Elias_V</span>
                  <span className="text-[12px] font-black text-[#310065]">12.4k</span>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl">
                  <span className="font-black text-[#cdc3d4] w-4 text-center">2</span>
                  <Image 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhAiaJnQcov3yKuDDwb14tlwNy1VJeK-CbqvmJpEFQWvxSl7PJaiav5taJs72ZOLcj3nmju-YBHgJ47XoKIbujlBlqdnhJiwIcxuJGlpfdbaNm48J8JtM7Nnz1bGIeGE1pJGh7qI2JciEM2i8c2Wksr8IJOlhrCg-I-A4lulKrGW5kei6-GwKrLj88mzSAEavMzec3pUg6l1_88SbBgfW0I60UYU2PWG_F2RhvL1e1qyAXgxSTzsbifZSF9HsS4t7_VdmdrlAm1zU"
                    width={36} height={36} alt="Sara"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="text-[14px] font-bold flex-1 truncate text-[#1b1b1e]">Sara.Grace</span>
                  <span className="text-[12px] font-black text-[#310065]">11.8k</span>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/40 ring-1 ring-[#310065]/10">
                  <span className="font-black text-[#cdc3d4] w-4 text-center">3</span>
                  <Image 
                    src={user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDt9JT4OQl_zkl-mIPKXVuU0EObjcQ9sGqb82e7zBqVIgpOaKFMrafkNzfqxuczq8DVGtXhdFMZWbSr9a-Oem6k335TYYD9e-IyykCpwe6k28SeRblAovEdZC3o4v9W1Bfp62IsOCKHFNO4Kd_J7kpEORsvKQ1_GEJksc3TyJ0uk7wPgSPZcn1oh7yu58dCAPbmzBXroh_cX_FNOCvYfMjkfl4odBE62aB_3y4H65YLikDy59cn5I0S5U39EcmUsGvHdDiJHxpeavE"}
                    width={36} height={36} alt={user?.firstName || "Noble Peregrino"}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="text-[14px] font-bold flex-1 truncate text-[#1b1b1e]">{user?.firstName || "Noble Peregrino"}</span>
                  <span className="text-[12px] font-black text-[#310065]">11.2k</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/90 backdrop-blur-2xl px-6 pb-6 pt-4 flex flex-col items-center border-t border-[#310065]/5 shadow-[0_-10px_30px_rgba(49,0,101,0.05)]">
        <button className="w-full max-w-lg bg-[#310065] hover:bg-[#4a148c] text-white font-bold text-[17px] py-4 rounded-[1.25rem] shadow-[0_8px_20px_rgba(74,20,140,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
          <Swords className="w-[22px] h-[22px]" strokeWidth={2.5} />
          Entrar al Torneo
        </button>
        <p className="text-[9px] text-[#7c7483] uppercase tracking-[0.2em] mt-3 font-bold">Inscripción gratuita • 12,403 Almas compitiendo</p>
      </div>

    </div>
  );
}
