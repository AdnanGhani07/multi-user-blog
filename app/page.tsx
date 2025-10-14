import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/landing');
  return null; // This won't be reached due to redirect
}