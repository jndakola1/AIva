
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LayoutProvider } from '@/components/layout-provider';
import { ChatHistoryProvider } from '@/context/chat-history-context';
import { SettingsProvider } from '@/context/settings-context';
import { FirebaseClientProvider } from '@/firebase';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'AIva Assistant',
  description: 'Your Neural Glass Companion',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AIva',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
              }
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans">
        <FirebaseClientProvider>
          <SettingsProvider>
            <ChatHistoryProvider>
              <LayoutProvider>
                {children}
              </LayoutProvider>
            </ChatHistoryProvider>
          </SettingsProvider>
        </FirebaseClientProvider>
        <Toaster />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
