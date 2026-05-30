import { Inter, Outfit, Playfair_Display } from 'next/font/google'
import './globals.css'
import { constructMetadata } from '../lib/metadata'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata = constructMetadata()

import { Toaster } from '../components/ui/Toaster'
import { AuthInit } from '../components/AuthInit'
import ScrollReset from '../components/layout/ScrollReset'
import { PWAInstallPrompt } from '../components/pwa/PWAInstallPrompt'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if ('scrollRestoration' in history) {
                    history.scrollRestoration = 'manual';
                  }

                  const theme = localStorage.getItem('theme');
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (theme === 'dark' || (!theme && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Register Service Worker for PWA
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').catch(function(err) {
                        console.error('ServiceWorker registration failed: ', err);
                      });
                    });
                  }
                } catch (e) {
                  console.error('Theme/SW initialization error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${playfair.variable} font-sans antialiased overflow-x-hidden`}>
        <AuthInit />
        <ScrollReset />
        {children}
        <PWAInstallPrompt />
        <Toaster />
      </body>
    </html>
  )
}
