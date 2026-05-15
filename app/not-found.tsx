import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9fc] p-6 text-center">
      <h2 className="text-4xl font-black text-[#310065] mb-4">404</h2>
      <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest">Paj sa a pa egziste</p>
      <Link 
        href="/"
        className="px-8 py-4 bg-[#310065] text-white rounded-2xl font-black shadow-lg shadow-[#310065]/20 hover:bg-[#4a148c] transition-all"
      >
        TOUNEN NAN PAJ AKÈY
      </Link>
    </div>
  );
}
