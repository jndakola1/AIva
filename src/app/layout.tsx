import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LayoutProvider } from '@/components/layout-provider';
import { ChatHistoryProvider } from '@/context/chat-history-context';

const inter = Inter({
  subsets: ['latin'],
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
    <html lang="en" className={inter.variable}>
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
