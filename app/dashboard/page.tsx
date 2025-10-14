'use client';

import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image'; // For post images

import { type InferSelectModel } from 'drizzle-orm';
import { posts as postsSchema, categories as categoriesSchema } from '@/db/schema';
import { calculateReadingTime, calculateWordCount } from '@/lib/post-utils'; // NEW: Post utilities

type Post = InferSelectModel<typeof postsSchema> & {
    postsToCategories: {
        category: InferSelectModel<typeof categoriesSchema>;
    }[];
};


export default function Dashboard() {
  const queryClient = trpc.useUtils();
  const { data: posts, isLoading, isError } = trpc.posts.getAllPostsForDashboard.useQuery();

  const deletePostMutation = trpc.posts.deletePost.useMutation({
    onSuccess: () => {
      queryClient.posts.getAllPostsForDashboard.invalidate();
      queryClient.posts.getPublishedPosts.invalidate();
      toast.success("Post deleted!");
    },
    onError: (error) => toast.error("Failed to delete post", { description: error.message }),
  });

  const togglePublishStatusMutation = trpc.posts.togglePublishStatus.useMutation({
    onSuccess: (_, variables) => {
      queryClient.posts.getAllPostsForDashboard.invalidate();
      queryClient.posts.getPublishedPosts.invalidate();
      toast.success(`Post ${variables.currentStatus ? 'unpublished' : 'published'}!`);
    },
    onError: (error) => toast.error("Failed to update publish status", { description: error.message }),
  });

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 sm:p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </main>
    );
  }

  if (isError) return <div className="p-8 text-center text-red-500">Error: Could not load posts for dashboard.</div>;

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Button asChild><Link href="/create-post">Create New Post</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard/categories">Manage Categories</Link></Button>
      </div>

      <div className="space-y-4">
        {posts && posts.length === 0 && <p className="text-gray-600 dark:text-gray-400">No posts created yet. Start by creating one!</p>}
        {posts?.map((post) => {
            const wordCount = calculateWordCount(post.content || '');
            const readingTime = calculateReadingTime(wordCount);
            return (
              <Card key={post.id} className="flex flex-col md:flex-row items-start md:items-center">
                {post.imageUrl && (
                  <div className="relative h-24 w-full md:w-32 flex-shrink-0 mr-4 rounded-l-lg overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4 flex-grow flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-grow">
                    <h2 className="text-lg font-semibold">{post.title}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()} | Slug: {post.slug}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {wordCount} words &bull; {readingTime} min read
                    </p>
                    {post.postsToCategories && post.postsToCategories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {post.postsToCategories.map(ptc => (
                          <Badge key={ptc.category.id} variant="outline" className="text-xs">
                            {ptc.category.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id={`publish-toggle-${post.id}`}
                        checked={post.published ?? false}
                        onCheckedChange={() => togglePublishStatusMutation.mutate({ id: post.id, currentStatus: post.published ?? false })}
                        disabled={togglePublishStatusMutation.isPending}
                      />
                      <Label htmlFor={`publish-toggle-${post.id}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </Label>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/edit-post/${post.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePostMutation.mutate({ id: post.id })}
                      disabled={deletePostMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
        })}
      </div>
    </main>
  );
}