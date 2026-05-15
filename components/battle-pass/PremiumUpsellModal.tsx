'use client';

import { X, Crown, CheckCircle2 } from 'lucide-react';

export default function PremiumUpsellModal({ onClose }: { onClose: () => void }) {
  const handleUpgrade = () => {
    // In the future this triggers Stripe checkout or App Store IAP.
    alert("¡Flujo de pago simulado! El pase premium sería activado en el backend del usuario.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b1b1e]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header background */}
        <div className="bg-gradient-to-br from-[#310065] to-[#4a148c] p-6 pt-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#ffe088] to-[#cba72f] rounded-full p-1 shadow-[0_0_24px_rgba(255,224,136,0.4)] mb-4">
            <div className="w-full h-full bg-[#310065] rounded-full flex items-center justify-center border-2 border-[#ffe088]">
              <Crown className="w-8 h-8 text-[#ffe088]" />
            </div>
          </div>
          
          <h3 className="text-2xl font-serif font-black text-white leading-tight">Pase Premium</h3>
          <p className="text-white/80 text-[13px] font-medium mt-2">
            Desbloquea instantáneamente todas las recompensas doradas.
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-6 bg-[#faf9fc]">
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#cba72f] shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-bold text-[#1b1b1e]">Track Premium Desbloqueado</p>
                <p className="text-[12px] text-[#7c7483] leading-snug mt-0.5">Accede a más de 20 recompensas y marcos exclusivos.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#cba72f] shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-bold text-[#1b1b1e]">Recompensas Retrospectivas</p>
                <p className="text-[12px] text-[#7c7483] leading-snug mt-0.5">Obtén todas las recompensas de los niveles que ya pasaste.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#cba72f] shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-bold text-[#1b1b1e]">Apoya a Bible Crown</p>
                <p className="text-[12px] text-[#7c7483] leading-snug mt-0.5">Tu apoyo nos permite desarrollar más contenido Bíblico gratuito.</p>
              </div>
            </li>
          </ul>

          <button 
            onClick={handleUpgrade}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e9c349] to-[#ffe088] text-[#735c00] font-black uppercase tracking-wider shadow-[0_8px_16px_-4px_rgba(233,195,73,0.5)] transition-transform active:scale-[0.98]"
          >
            Adquirir Premium - $4.99
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-3 mt-3 rounded-xl text-[#7c7483] font-bold text-[13px] hover:bg-[#e9e7eb] transition-colors"
          >
            No por ahora, gracias
          </button>
        </div>
      </div>
    </div>
  );
}
