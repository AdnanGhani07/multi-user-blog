'use client';

import { trpc } from '@/app/_trpc/client';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image'; // For post image
import { calculateReadingTime, calculateWordCount } from '@/lib/post-utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { format } from 'date-fns';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';
import { ReadingTimer } from '@/components/ReadingTimer';
import { useRef } from 'react';

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();

  const articleRef = useRef<HTMLElement>(null);

  const { data: post, isLoading, isError } = trpc.posts.getPostBySlug.useQuery({ slug });

  const secondsSpent = useReadingProgress(articleRef, post?.id || 0);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-3xl space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="flex gap-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-20" /></div>
        <Skeleton className="h-64 w-full rounded-lg" /> {/* Image skeleton */}
        <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return <div className="p-8 text-center text-red-500 dark:text-red-400">Post not found.</div>;
  }

  const categories = post.postsToCategories?.map(ptc => ptc.category) || [];
  const wordCount = calculateWordCount(post.content || '');
  const readingTime = calculateReadingTime(wordCount);

  // Fix: Convert createdAt and updatedAt strings to Date objects for comparison and formatting
  const postCreatedAt = new Date(post.createdAt);
  const postUpdatedAt = new Date(post.updatedAt);


  return (
    <article ref={articleRef} className="container mx-auto p-4 sm:p-8 max-w-3xl">
      {/* SEO Meta Tags for Client Component - Basic Example */}
      {/* Reminder: For App Router, `generateMetadata` in a server component is the preferred way.
          Using `next/head` in client components for App Router might not work as expected or cause issues.
          This is kept for illustrative purposes, but a proper App Router solution would involve parent server components.
          For client-side dynamic titles, typically react-helmet-async is used if strictly necessary.
      */}
      {/* <Head>
        <title>{post.title} | Full-Stack Blog</title>
        <meta name="description" content={post.content?.substring(0, 150) || "Read more on " + post.title} />
        {post.imageUrl && <meta property="og:image" content={post.imageUrl} />}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.content?.substring(0, 150) || "Read more on " + post.title} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.content?.substring(0, 150) || "Read more on " + post.title} />
        {post.imageUrl && <meta name="twitter:image" content={post.imageUrl} />}
      </Head> */}

      {post.imageUrl && (
        <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
            priority // Prioritize loading for LCP
          />
        </div>
      )}

      <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">{post.title}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Published on: {format(postCreatedAt, 'MMMM dd, yyyy')}
        {/* Fix: Use postCreatedAt and postUpdatedAt (Date objects) for comparison */}
        {postUpdatedAt && postCreatedAt.getTime() !== postUpdatedAt.getTime() && (
          <span> &bull; Updated on: {format(postUpdatedAt, 'MMMM dd, yyyy')}</span>
        )}
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        {wordCount} word
      </p>
      <ReadingTimer seconds={secondsSpent}/>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(category => (
            <Link key={category.id} href={`/posts?category=${category.slug}`}>
              <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="prose lg:prose-xl dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {post.content || ''}
        </ReactMarkdown>
      </div>
    </article>
  );
}