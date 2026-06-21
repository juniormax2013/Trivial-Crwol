import type {Metadata} from 'next';
import { Noto_Serif, Manrope } from 'next/font/google';
import './globals.css';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '700', '900'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Bible Crown',
  description: 'Defi Biblik la - Konpetisyon sou Bib la',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bible Crown',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};


import { AuthProvider } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';
import IncomingDuelListener from '@/components/duel/IncomingDuelListener';
import ArenaInvitationListener from '@/components/arena/ArenaInvitationListener';
import { LanguageProvider } from '@/lib/i18n/context';
import { NotificationProvider } from '@/hooks/useNotifications';
import LanguageSyncer from '@/components/LanguageSyncer';
import SWRegistration from '@/components/pwa/SWRegistration';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import { Toaster } from 'sonner';
import NotificationDrawer from '@/components/notifications/NotificationDrawer';
import StoreOverlay from '@/components/store/StoreOverlay';
import { ThemeProvider } from '@/components/ThemeProvider';


export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ht" className={`${notoSerif.variable} ${manrope.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Status Bar Styling: 'default' provides dark text on a white background on iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Theme Color: Controls the top bar color on mobile browsers (Android/Chrome) */}
        <meta name="theme-color" content="#ffffff" />
        
        {/* iOS Specifics */}
        <meta name="apple-mobile-web-app-title" content="Bible Crown" />
        
        {/* Prevent zoom on focus in iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="font-sans bg-[var(--background)] text-[var(--foreground)] flex flex-col min-h-screen selection:bg-[#eddcff] overflow-x-hidden" suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <AuthGuard>
              <NotificationProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <LanguageSyncer />
                  
                  {/* Main Content Container with Safe Area Handling */}
                  <div className="w-full bg-[var(--background)] text-[var(--foreground)] relative min-h-[100dvh] overflow-x-hidden flex flex-col flex-1">
                    {children}
                  </div>
                  
                  <NotificationDrawer />
                  <IncomingDuelListener />
                  <ArenaInvitationListener />
                  <StoreOverlay />
                  <SWRegistration />
                  <InstallPrompt />
                  <Toaster richColors position="top-center" />
                </ThemeProvider>
              </NotificationProvider>
            </AuthGuard>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
