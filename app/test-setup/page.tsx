'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { updateUser } from '@/lib/user/repository';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function TestSetupPage() {
  const { user } = useAuthContext();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Preparando recursos de prueba...');
  const router = useRouter();

  useEffect(() => {
    async function setup() {
      if (!user) return;

      try {
        await updateUser(user.uid, {
          coins: 5000,
          crowns: 1000,
          inventory: {
            freezeTime: 10,
            removeTwo: 10,
            hint: 10,
            secondChance: 10,
            hintBible: 10
          },
          role: 'super_admin'
        });
        setStatus('success');
        setMessage('¡Recursos otorgados con éxito! Redirigiendo...');
        setTimeout(() => router.push('/'), 2000);
      } catch (error: any) {
        console.error('Error in test setup:', error);
        setStatus('error');
        setMessage(`Error: ${error.message}`);
      }
    }

    if (user) {
      setup();
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Por favor, inicia sesión primero.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {status === 'loading' && <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />}
        {status === 'success' && <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />}
        {status === 'error' && <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />}
        
        <h1 className="text-xl font-bold mb-2">Setup de Pruebas</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
