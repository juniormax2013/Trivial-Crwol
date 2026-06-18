'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/lib/i18n/context';
import ChatList from '@/components/chat/ChatList';
import ChatRoom from '@/components/chat/ChatRoom';
import BottomNav from '@/components/BottomNav';
import { MessageSquare } from 'lucide-react';

function ChatPageContent() {
  const { user, loading } = useAuthContext();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get chat ID from URL query param if present, default to global_main
  const chatId = searchParams.get('id') || 'global_main';

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-[#0A84FF] animate-spin" />
          </div>
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
            {language === 'es' ? 'Cargando...' : language === 'fr' ? 'Chargement...' : 'Chaje...'}
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-center px-6">
        <div>
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-black text-[#0F172A] mb-1">
            {language === 'es' ? 'Acceso denegado' : language === 'fr' ? 'Accès refusé' : 'Aksè refize'}
          </h2>
          <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">
            {language === 'es' ? 'Inicia sesión para chatear' : language === 'fr' ? 'Connectez-vous' : 'Konekte pou chat'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] pb-20">
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col overflow-hidden h-full">
        <ChatRoom 
          chatId={chatId}
          onBack={handleBack}
        />
      </div>

      <BottomNav activeTab="social" showTriggerButton={true} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-[#0A84FF] animate-spin" />
          </div>
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
            Cargando...
          </span>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
