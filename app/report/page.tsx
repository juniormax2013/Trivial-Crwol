import Link from 'next/link';
import { 
  ArrowLeft,
  HelpCircle,
  Send
} from 'lucide-react';

export default function ReportQuestion() {
  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-12 font-sans selection:bg-[#eddcff] relative">
      
      {/* Decorative Aesthetic Background Element */}
      <div className="fixed top-0 right-0 -z-10 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#310065]/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#735c00]/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#faf9fc]/80 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#310065] hover:bg-[#4A148C]/5 p-2 -ml-2 rounded-full transition-colors active:scale-95 duration-150">
            <ArrowLeft className="w-[22px] h-[22px]" strokeWidth={2.5} />
          </Link>
          <h1 className="text-[15px] font-black text-[#310065] uppercase tracking-[0.15em] font-serif mt-0.5">Crown & Covenant</h1>
        </div>
        <div className="flex items-center">
          <button className="text-white bg-[#310065] hover:bg-[#4a148c] p-1.5 rounded-full transition-colors active:scale-95">
            <HelpCircle className="w-[18px] h-[18px] fill-[#310065] text-white" strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-[600px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="font-serif text-[32px] font-bold text-[#310065] tracking-tight mb-2 leading-none">Reportar Pregunta</h2>
          <p className="text-[#4a4452] font-medium text-[15px]">Ayúdanos a mantener la excelencia bíblica.</p>
        </div>

        {/* Question Reference */}
        <section className="bg-[#f5f3f7] rounded-[1rem] p-6 mb-10 border-l-4 border-[#cba72f] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#735c00] mb-2.5 block">Referencia de la Pregunta</span>
          <p className="font-serif text-[17px] italic text-[#1b1b1e] leading-relaxed">
            &quot;¿Quién fue el primer rey de Israel ungido por el profeta Samuel según el libro de 1 Samuel?&quot;
          </p>
        </section>

        {/* Categories (Motivo del reporte) */}
        <section className="mb-10">
          <label className="block text-[13px] font-bold text-[#4a4452] mb-4 uppercase tracking-widest">Motivo del Reporte</label>
          <div className="grid grid-cols-1 gap-3.5 flex-col">
            
            {/* Option 1 */}
            <label className="group relative flex items-center p-4 bg-white rounded-xl cursor-pointer hover:bg-[#f5f3f7] transition-all border border-[#1b1b1e]/5 shadow-sm active:scale-[0.99]">
              <input type="radio" name="category" className="sr-only peer" defaultChecked />
              <div className="w-5 h-5 rounded-full border-2 border-[#cdc3d4] flex items-center justify-center peer-checked:border-[#735c00] peer-checked:bg-[#735c00] transition-colors shrink-0">
                <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
              </div>
              <span className="ml-4 font-semibold text-[#1b1b1e] text-[15px]">Error doctrinal</span>
              <div className="absolute inset-0 rounded-xl border-2 border-transparent peer-checked:border-[#cba72f]/40 peer-checked:bg-[#fff9e6]/50 pointer-events-none transition-colors"></div>
            </label>

            {/* Option 2 */}
            <label className="group relative flex items-center p-4 bg-white rounded-xl cursor-pointer hover:bg-[#f5f3f7] transition-all border border-[#1b1b1e]/5 shadow-sm active:scale-[0.99]">
              <input type="radio" name="category" className="sr-only peer" />
              <div className="w-5 h-5 rounded-full border-2 border-[#cdc3d4] flex items-center justify-center peer-checked:border-[#735c00] peer-checked:bg-[#735c00] transition-colors shrink-0">
                <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
              </div>
              <span className="ml-4 font-semibold text-[#1b1b1e] text-[15px]">Respuesta incorrecta</span>
              <div className="absolute inset-0 rounded-xl border-2 border-transparent peer-checked:border-[#cba72f]/40 peer-checked:bg-[#fff9e6]/50 pointer-events-none transition-colors"></div>
            </label>

            {/* Option 3 */}
            <label className="group relative flex items-center p-4 bg-white rounded-xl cursor-pointer hover:bg-[#f5f3f7] transition-all border border-[#1b1b1e]/5 shadow-sm active:scale-[0.99]">
              <input type="radio" name="category" className="sr-only peer" />
              <div className="w-5 h-5 rounded-full border-2 border-[#cdc3d4] flex items-center justify-center peer-checked:border-[#735c00] peer-checked:bg-[#735c00] transition-colors shrink-0">
                <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
              </div>
              <span className="ml-4 font-semibold text-[#1b1b1e] text-[15px]">Redacción</span>
              <div className="absolute inset-0 rounded-xl border-2 border-transparent peer-checked:border-[#cba72f]/40 peer-checked:bg-[#fff9e6]/50 pointer-events-none transition-colors"></div>
            </label>

            {/* Option 4 */}
            <label className="group relative flex items-center p-4 bg-white rounded-xl cursor-pointer hover:bg-[#f5f3f7] transition-all border border-[#1b1b1e]/5 shadow-sm active:scale-[0.99]">
              <input type="radio" name="category" className="sr-only peer" />
              <div className="w-5 h-5 rounded-full border-2 border-[#cdc3d4] flex items-center justify-center peer-checked:border-[#735c00] peer-checked:bg-[#735c00] transition-colors shrink-0">
                <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
              </div>
              <span className="ml-4 font-semibold text-[#1b1b1e] text-[15px]">Duplicada</span>
              <div className="absolute inset-0 rounded-xl border-2 border-transparent peer-checked:border-[#cba72f]/40 peer-checked:bg-[#fff9e6]/50 pointer-events-none transition-colors"></div>
            </label>

            {/* Option 5 */}
            <label className="group relative flex items-center p-4 bg-white rounded-xl cursor-pointer hover:bg-[#f5f3f7] transition-all border border-[#1b1b1e]/5 shadow-sm active:scale-[0.99]">
              <input type="radio" name="category" className="sr-only peer" />
              <div className="w-5 h-5 rounded-full border-2 border-[#cdc3d4] flex items-center justify-center peer-checked:border-[#735c00] peer-checked:bg-[#735c00] transition-colors shrink-0">
                <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
              </div>
              <span className="ml-4 font-semibold text-[#1b1b1e] text-[15px]">Otro</span>
              <div className="absolute inset-0 rounded-xl border-2 border-transparent peer-checked:border-[#cba72f]/40 peer-checked:bg-[#fff9e6]/50 pointer-events-none transition-colors"></div>
            </label>

          </div>
        </section>

        {/* Comments Area */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-[13px] font-bold text-[#4a4452] uppercase tracking-widest">Comentarios adicionales</label>
            <span className="text-[11px] font-medium text-[#7c7483]">Opcional</span>
          </div>
          <textarea 
            className="w-full bg-white border border-[#cdc3d4] focus:border-[#310065] focus:ring-1 focus:ring-[#310065] rounded-xl p-4 text-[#1b1b1e] placeholder:text-[#7c7483]/60 resize-none transition-all outline-none" 
            placeholder="Describe brevemente el error encontrado..." 
            rows={4}
          ></textarea>
        </section>

        {/* Primary CTA */}
        <div className="flex flex-col gap-4">
          <button className="w-full bg-[#310065] text-white py-[18px] rounded-[1rem] font-bold text-[17px] shadow-[0_8px_20px_rgba(49,0,101,0.25)] hover:shadow-[0_10px_24px_rgba(49,0,101,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <Send className="w-5 h-5 fill-white/20" strokeWidth={2} />
            Enviar Reporte
          </button>
          <p className="text-center text-[11px] text-[#7c7483] italic mt-1 pb-8">
            Gracias por contribuir a la integridad de nuestra comunidad bíblica.
          </p>
        </div>

      </main>
    </div>
  );
}
