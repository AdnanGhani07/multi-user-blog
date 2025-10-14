import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Provider from './_trpc/Provider';
import { Toaster } from 'sonner';
import { NavBar } from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // metadataBase is crucial for resolving absolute URLs for og:image and other tags.
  metadataBase: new URL('https://multi-user-blog-iota.vercel.app/'), 
  
  title: {
    default: 'Multi-User Blog Platform', // Default title for pages that don't set their own
    template: '%s | Multi-User Blog',   // Template for page titles, %s is replaced by the specific page's title
  },
  description: 'A collaborative blog platform where users can share ideas, stories, and insights on various topics.',
  
  // Open Graph (for Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'Multi-User Blog Platform',
    description: 'Share ideas, stories, and insights.',
    url: 'https://multi-user-blog-iota.vercel.app',
    siteName: 'Multi-User Blog',
    images: [
      {
        url: 'https://multi-user-blog-iota.vercel.app/og-image.png', // Must be an absolute URL. `metadataBase` helps resolve this.
        width: 1200,
        height: 630,
        alt: 'A vibrant banner for the Multi-User Blog Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-User Blog Platform',
    description: 'Share ideas, stories, and insights.',
    // creator: '@yourTwitterHandle', // Optional: your twitter handle
    images: ['https://multi-user-blog-iota.vercel.app/twitter-image.png'], // Must be an absolute URL
  },
  
  // Optional: For better indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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