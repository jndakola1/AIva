import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LayoutProvider } from '@/components/layout-provider';
import { ChatHistoryProvider } from '@/context/chat-history-context';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Gemini Switch',
  description: 'Your Hybrid AI Companion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ptSans.variable}>
      <body className="antialiased font-sans">
        <ChatHistoryProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </ChatHistoryProvider>
        <Toaster />
      </body>
    </html>
  );
}
