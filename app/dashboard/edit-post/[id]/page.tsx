'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image'; // For displaying selected image preview
import { X } from 'lucide-react'; // For removing image

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id);

  const queryClient = trpc.useUtils();

  const { data: post, isLoading: isLoadingPost, isError: isErrorPost } = trpc.posts.getPostById.useQuery({ id: postId });
  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = trpc.categories.getCategories.useQuery();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // State to hold the final image URL (from DB or new upload)
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Populate form fields once post data is loaded
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content || '');
      setPublished(post.published ?? false);
      setSelectedCategoryIds(post.postsToCategories?.map(ptc => ptc.categoryId) || []);
      setImageUrl(post.imageUrl || null); // Set initial image URL from post data
    }
  }, [post]);

  const updatePostMutation = trpc.posts.updatePost.useMutation({
    onSuccess: () => {
      queryClient.posts.getAllPostsForDashboard.invalidate();
      queryClient.posts.getPublishedPosts.invalidate();
      if (post?.slug) {
        queryClient.posts.getPostBySlug.invalidate({ slug: post.slug });
      }
      toast.success("Post updated!");
      router.push('/dashboard');
    },
    onError: (error) => toast.error("Failed to update post", { description: error.message }),
    onSettled: () => {
      setIsUploadingImage(false); // Ensure upload state is reset
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string); // Set preview to base64
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImageUrl(post?.imageUrl || null); // Revert to original if cancelled
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary upload error:', errorData);
        toast.error("Image upload failed", { description: errorData.error?.message || "Something went wrong during upload." });
        return null;
      }
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Network error during image upload:', error);
      toast.error("Image upload failed", { description: "Network error or Cloudinary configuration issue." });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(postId)) {
      toast.error("Invalid Post ID.");
      return;
    }

    let finalImageUrl: string | null | undefined = imageUrl; // Start with current DB URL or preview URL

    if (imageFile) { // If a new file was selected
      setIsUploadingImage(true);
      const uploadedUrl = await uploadImageToCloudinary(imageFile);
      if (uploadedUrl === null) {
        setIsUploadingImage(false);
        return; // Stop submission if image upload failed
      }
      finalImageUrl = uploadedUrl;
    } else if (imageUrl === null && post?.imageUrl) {
      // If imageUrl was cleared by user, set to null to remove from DB
      finalImageUrl = null;
    } else if (imageUrl && !imageUrl.startsWith('data:image/') && !imageFile) {
      // If imageUrl is present and not a data URL (i.e., it's the original Cloudinary URL)
      // And no new file selected, keep the existing one.
      finalImageUrl = imageUrl;
    }


    updatePostMutation.mutate({
      id: postId,
      title,
      content,
      published,
      categoryIds: selectedCategoryIds,
      imageUrl: finalImageUrl // Pass the determined image URL
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.options)
                                 .filter(option => option.selected)
                                 .map(option => parseInt(option.value));
    setSelectedCategoryIds(selectedOptions);
  };

  if (isLoadingPost || isLoadingCategories) {
    return (
      <main className="container mx-auto p-4 sm:p-8 max-w-2xl space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" /> {/* Image upload area */}
        <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-12" /> <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-32" />
      </main>
    );
  }

  if (isErrorPost || !post) {
    return <div className="p-8 text-center text-red-500">Post not found for editing.</div>;
  }
  if (isErrorCategories) {
    return <div className="p-8 text-center text-red-500">Error: Could not load categories.</div>;
  }

  const isSubmitting = updatePostMutation.isPending || isUploadingImage;

  return (
    <main className="container mx-auto p-4 sm:p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Post: {post.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={15} disabled={isSubmitting} />
        </div>

        {/* NEW: Image Upload Section for Edit */}
        <div>
            <Label htmlFor="image">Featured Image</Label>
            <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file:text-primary file:bg-muted"
                disabled={isSubmitting}
            />
            {(imageUrl || imageFile) && ( // Show preview if there's an existing URL or a new file
                <div className="relative w-48 h-32 mt-4 border rounded-md overflow-hidden">
                    <Image src={imageUrl || ''} alt="Image Preview" fill className="object-cover" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => {
                            setImageFile(null); // Clear file input
                            setImageUrl(null); // Clear image URL (to be removed from DB)
                            // Clear input visually
                            const inputElement = document.getElementById('image') as HTMLInputElement;
                            if (inputElement) inputElement.value = '';
                        }}
                        disabled={isSubmitting}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {isUploadingImage && <p className="text-sm text-gray-500 mt-2">Uploading image...</p>}
        </div>
        {/* END NEW */}

        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={setPublished}
            disabled={isSubmitting}
          />
          <Label htmlFor="published">Publish Post</Label>
        </div>
        <div>
          <Label htmlFor="categories">Categories</Label>
          {categories && categories.length > 0 ? (
            <select
              id="categories"
              multiple
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 p-2"
              value={selectedCategoryIds.map(String)}
              onChange={handleCategoryChange}
              size={Math.min(categories.length, 5)}
              disabled={isSubmitting}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-500 text-sm">No categories available. Go to dashboard to create some.</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </main>
  );
}