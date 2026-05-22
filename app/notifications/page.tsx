import Image from 'next/image';
import Link from 'next/link';
import { 
  Menu,
  Swords,
  Award,
  Star,
  CalendarDays,
  Info,
  Landmark,
  Crown,
  Settings
} from 'lucide-react';

export default function Notifications() {
  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-8 font-sans selection:bg-[#eddcff]">
      
      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#faf9fc]/80 backdrop-blur-2xl">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <button className="text-[#310065] hover:bg-[#310065]/5 p-2 -ml-2 rounded-full transition-colors">
              <Menu className="w-6 h-6" strokeWidth={2.5} />
            </button>
            <h1 className="font-serif font-black text-[#310065] text-2xl tracking-tight leading-none mt-1">Bible Crown</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[13px] font-bold text-[#310065] px-3 py-1.5 rounded-full hover:bg-[#310065]/5 transition-colors">
              Limpiar todo
            </button>
            <div className="w-8 h-8 rounded-full border-2 border-[#1b1b1e]/5 overflow-hidden">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB38Br6CHha8J5B-vLRVhplYw5G-5VZrV8qj3T_tWdd4cFfbHzG8tL66lZfTbEuDe2VuIhW3syCpAZ2OiL3_b5NfNc5OLOPszHu7K3muXdRkFcchcV0nqjBaqeS_PX3onQT-YUN59m8sOS9HjrRORXrVue_2EHUpXAlKKOWOo9yo7pYkBCCCLQj8VnIHJpgkb81EbS9zvUNZUOHyCkpqB4i6EEubPT-bdhI9n6fWm0FHqm4diWyn2IqtdbLS3MCqqL_IgG88WwS-Ms" 
                alt="User Profile" 
                width={32} height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 max-w-[600px] mx-auto">
        
        {/* Section Header */}
        <header className="mb-8">
          <h2 className="text-[32px] font-serif font-black text-[#310065] mb-1.5 leading-none tracking-tight">Notificaciones</h2>
          <p className="text-[#4a4452] font-medium text-[15px]">Mantente al tanto de tus conquistas espirituales.</p>
        </header>

        {/* Category Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-6 -mx-6 px-6">
          <button className="flex-none px-6 py-2.5 rounded-full bg-[#310065] text-white font-bold text-[14px] shadow-[0_4px_12px_rgba(49,0,101,0.25)] active:scale-95 transition-all">
            Todos
          </button>
          <button className="flex-none px-6 py-2.5 rounded-full bg-[#f5f3f7] text-[#4a4452] font-bold text-[14px] hover:bg-[#e3e2e6] active:scale-95 transition-all">
            Duelos
          </button>
          <button className="flex-none px-6 py-2.5 rounded-full bg-[#f5f3f7] text-[#4a4452] font-bold text-[14px] hover:bg-[#e3e2e6] active:scale-95 transition-all">
            Eventos
          </button>
          <button className="flex-none px-6 py-2.5 rounded-full bg-[#f5f3f7] text-[#4a4452] font-bold text-[14px] hover:bg-[#e3e2e6] active:scale-95 transition-all">
            Recompensas
          </button>
          <button className="flex-none px-6 py-2.5 rounded-full bg-[#f5f3f7] text-[#4a4452] font-bold text-[14px] hover:bg-[#e3e2e6] active:scale-95 transition-all">
            Avisos
          </button>
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          
          {/* Duel Notification */}
          <div className="relative group bg-white p-5 rounded-[1.5rem] border-2 border-transparent hover:border-[#cba72f]/30 hover:shadow-[0_8px_24px_rgba(49,0,101,0.06)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300">
            <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-[#cba72f] rounded-full ring-4 ring-[#fff9e6]"></div>
            <div className="flex gap-4">
              <div className="w-[48px] h-[48px] flex-none rounded-2xl bg-[#310065]/5 flex items-center justify-center">
                <Swords className="text-[#310065] w-6 h-6" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#310065]/60 block mt-1">Duelo pendiente</span>
                  <span className="text-[11px] text-[#7c7483] font-bold pr-5 mt-1">Hace 2m</span>
                </div>
                <p className="text-[#1b1b1e] font-medium leading-relaxed text-[15px] mt-2">
                  <span className="text-[#310065] font-bold">Mateo_92</span> te ha retado a un duelo en <span className="italic font-serif font-bold text-[#310065]">Proverbios</span>. ¡Es tu turno!
                </p>
                <div className="mt-5 flex gap-3">
                  <button className="flex-1 px-5 py-2.5 bg-gradient-to-r from-[#310065] to-[#4a148c] text-white text-[14px] font-bold rounded-xl hover:shadow-[0_4px_12px_rgba(49,0,101,0.2)] active:scale-95 transition-all">
                    Aceptar Reto
                  </button>
                  <button className="px-6 py-2.5 bg-[#f5f3f7] text-[#4a4452] text-[14px] font-bold rounded-xl hover:bg-[#e3e2e6] active:scale-95 transition-all">
                    Declinar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reward Notification */}
          <div className="relative group bg-white p-5 rounded-[1.5rem] border-2 border-transparent hover:border-[#cba72f]/30 hover:shadow-[0_8px_24px_rgba(49,0,101,0.06)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300">
            <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-[#cba72f] rounded-full ring-4 ring-[#fff9e6]"></div>
            <div className="flex gap-4">
              <div className="w-[48px] h-[48px] flex-none rounded-2xl bg-[#fff9e6] flex items-center justify-center border border-[#e9c349]/30">
                <Award className="text-[#735c00] w-6 h-6 fill-[#e9c349]/50" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#735c00] block mt-1">Recompensa real</span>
                  <span className="text-[11px] text-[#7c7483] font-bold pr-5 mt-1">Hace 45m</span>
                </div>
                <p className="text-[#1b1b1e] font-medium leading-relaxed text-[15px] mt-2">
                  Has recibido <span className="text-[#735c00] font-black">500 Coronas</span> por tu victoria en el desafío diario.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fff9e6] text-[#735c00] text-[10px] font-black border border-[#e9c349]/30">
                  <Star className="w-3.5 h-3.5 fill-[#cba72f] text-[#cba72f]" strokeWidth={2} />
                  BONUS DE RACHA +15%
                </div>
              </div>
            </div>
          </div>

          {/* Event Notification */}
          <div className="relative bg-white p-5 rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5 opacity-90">
            <div className="flex gap-4">
              <div className="w-[48px] h-[48px] flex-none rounded-2xl bg-[#f8d5f9]/50 flex items-center justify-center">
                <CalendarDays className="text-[#705573] w-6 h-6" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#705573] block mt-1">Evento Especial</span>
                  <span className="text-[11px] text-[#7c7483] font-bold mt-1">Hace 3h</span>
                </div>
                <p className="text-[#1b1b1e] font-medium leading-relaxed text-[15px] mt-2">
                  El <span className="font-serif italic font-bold text-[#310065]">Torneo de Pentecostés</span> comienza en 2 horas. ¡Inscríbete ahora para asegurar tu lugar!
                </p>
              </div>
            </div>
          </div>

          {/* Notice Notification */}
          <div className="relative bg-[#f5f3f7] p-5 rounded-[1.5rem] shadow-sm border border-[#1b1b1e]/[0.02]">
            <div className="flex gap-4">
              <div className="w-[48px] h-[48px] flex-none rounded-2xl bg-[#e3e2e6] flex items-center justify-center">
                <Info className="text-[#7c7483] w-6 h-6" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#7c7483] block mt-1">Aviso del Sistema</span>
                  <span className="text-[11px] text-[#7c7483] font-bold mt-1">Ayer</span>
                </div>
                <p className="text-[#4a4452] font-medium leading-relaxed text-[15px] mt-2">
                  Mantenimiento programado: Mañana a las 02:00 AM. El acceso podría estar limitado por 30 minutos.
                </p>
              </div>
            </div>
          </div>

          {/* Promotion Banner */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#310065] to-[#4a148c] p-8 text-white mt-10 shadow-[0_12px_32px_rgba(49,0,101,0.25)]">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#cba72f]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 max-w-[280px]">
              <h3 className="text-[26px] font-serif font-black mb-3 leading-tight tracking-tight">¿Buscas más sabiduría?</h3>
              <p className="mb-8 text-[#d7baff]/90 font-medium text-[15px] leading-relaxed">
                Únete al Gremio de los Sabios y obtén multiplicadores de coronas x2 en todos tus duelos semanales.
              </p>
              <button className="bg-[#e9c349] text-[#4e3d00] font-black px-8 py-3.5 rounded-[1rem] shadow-[0_8px_20px_rgba(203,167,47,0.4)] active:scale-95 transition-all text-[15px]">
                Subir de Nivel
              </button>
            </div>
            
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRVo6W7m0fDAZ_DlYhv7OVJrL7PROyqdfIfow7gtp-scdxtXE8tuZNiFywjTelOShprSSslkIlcFqnZs0OQQctGPbW56JM_wSF4tBLE0KPolR1IR_nDrwQbjsl86NzQFSytZUKHtKmAIYzEjFr80LhSHuHn0Sx5fhmHCuaMrrFhaG9Qj5bbgP5m85H05iavTVh0dzzm4-Ee7DsC6D8DKnFUrRq6qHJlo6uIb7SJr-4itoCGot3bhB6-wc07ATBFfMmgraCZC7_aRw" 
              alt="Temple Light" 
              width={200} height={300}
              className="absolute bottom-0 right-0 h-full w-[45%] object-cover opacity-60 mix-blend-overlay hidden md:block"
            />
          </div>

        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#faf9fc]/90 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-[#1b1b1e]/5 shadow-[0_-8px_32px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center pt-4 pb-8 px-4 w-full max-w-[600px] mx-auto">
          
          <Link href="#" className="flex flex-col items-center justify-center text-[#7c7483] px-4 py-2 hover:text-[#310065] active:scale-90 transition-all group">
            <Landmark className="w-6 h-6 mb-1 group-hover:fill-[#310065]/10" strokeWidth={2} />
            <span className="font-sans text-[10px] font-extrabold uppercase tracking-[0.1em]">Temple</span>
          </Link>
          
          <Link href="#" className="flex flex-col items-center justify-center text-[#7c7483] px-4 py-2 hover:text-[#310065] active:scale-90 transition-all group">
            <Swords className="w-6 h-6 mb-1 group-hover:fill-[#310065]/10" strokeWidth={2} />
            <span className="font-sans text-[10px] font-extrabold uppercase tracking-[0.1em]">Duels</span>
          </Link>
          
          <Link href="#" className="flex flex-col items-center justify-center text-[#7c7483] px-4 py-2 hover:text-[#310065] active:scale-90 transition-all group">
            <Crown className="w-6 h-6 mb-1 group-hover:fill-[#310065]/10" strokeWidth={2} />
            <span className="font-sans text-[10px] font-extrabold uppercase tracking-[0.1em]">Crowns</span>
          </Link>
          
          <Link href="#" className="flex flex-col items-center justify-center text-[#cba72f] bg-[#fff9e6] rounded-[1rem] px-5 py-2 active:scale-90 transition-transform">
            <Settings className="w-6 h-6 mb-1 fill-[#e9c349]/30" strokeWidth={2.5} />
            <span className="font-sans text-[10px] font-extrabold uppercase tracking-[0.1em]">Settings</span>
          </Link>

        </div>
      </nav>

    </div>
  );
}
