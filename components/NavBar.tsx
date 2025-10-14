'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes'; // NEW: For dark mode
import { Sun, Moon } from 'lucide-react'; // NEW: Icons for theme toggle

export function NavBar({ className }: React.HTMLAttributes<HTMLElement>) {
  const { theme, setTheme } = useTheme();

  return (
    <nav
      className={cn("flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-800 dark:bg-gray-950 text-white shadow-md", className)}
    >
      <Link href="/landing" className="text-2xl font-bold mb-4 sm:mb-0 hover:text-gray-300 transition-colors">
        My Blog
      </Link>
      <div className="flex space-x-4 items-center">
        <Button variant="link" asChild className="text-white hover:text-gray-300">
          <Link href="/posts">Blog</Link>
        </Button>
        <Button variant="link" asChild className="text-white hover:text-gray-300">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="link" asChild className="text-white hover:text-gray-300">
          <Link href="/create-post">New Post</Link>
        </Button>

        {/* NEW: Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-white hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        {/* END NEW */}
      </div>
    </nav>
  );
}