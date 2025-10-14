// app/posts/page.tsx

import { Suspense } from 'react';
import PostClientComponent from './PostClientComponent'; // The new component we'll create
import { Skeleton } from '@/components/ui/skeleton';      // Your skeleton component for loading UI

/**
 * A fallback component to display while the client component is loading.
 * This is rendered on the server and sent to the client initially.
 */
function PostLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PostPage() {
  return (
    <main className="container mx-auto p-4 sm:p-8">
      {/*
        Suspense tells Next.js to render the `fallback` UI first,
        and then stream in the `PostClientComponent` once it's ready on the client.
        This allows the page to be statically generated while still using client-side hooks.
      */}
      <Suspense fallback={<PostLoading />}>
        <PostClientComponent />
      </Suspense>
    </main>
  );
}