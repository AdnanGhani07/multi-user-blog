import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Provider from './_trpc/Provider';
import { Toaster } from 'sonner';
import { NavBar } from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Full-Stack Blog',
  description: 'A comprehensive blogging platform built with Next.js, tRPC, Drizzle, and PostgreSQL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased transition-colors duration-200`}>
        <Provider>
          <NavBar />
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}