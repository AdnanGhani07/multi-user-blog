'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../_trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image'; // For displaying selected image preview
import { X } from 'lucide-react'; // For removing image

export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null); // NEW: For image file
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null); // NEW: For image preview
  const [isUploadingImage, setIsUploadingImage] = useState(false); // NEW: Uploading state

  const queryClient = trpc.useUtils();

  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = trpc.categories.getCategories.useQuery();

  const createPostMutation = trpc.posts.createPost.useMutation({
    onSuccess: () => {
      queryClient.posts.getPublishedPosts.invalidate();
      queryClient.posts.getAllPostsForDashboard.invalidate();
      toast.success("Post created!", {
        description: `Your new post titled "${title}" has been ${published ? 'published' : 'saved as a draft'}.`,
      });
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error("Failed to create post", {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsUploadingImage(false); // Ensure upload state is reset regardless of success/fail
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic client-side validation for file type and size
      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type", { description: "Please select an image file." });
        setImageFile(null);
        setImageUrlPreview(null);
        e.target.value = ''; // Clear the input
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit example
        toast.error("File too large", { description: "Please select an image smaller than 5MB." });
        setImageFile(null);
        setImageUrlPreview(null);
        e.target.value = ''; // Clear the input
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrlPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImageUrlPreview(null);
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    setIsUploadingImage(true);
    const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast.error("Cloudinary configuration missing.", {
        description: "Please check your environment variables: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
      });
      console.error("Cloudinary configuration missing. Check .env.local");
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    // Optional: Add folder for better organization in Cloudinary
    formData.append('folder', 'multi-user-blog-posts');


    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // Fallback to text if response isn't JSON or is empty
          errorData.message = await response.text();
        }

        console.error('Cloudinary upload error:', errorData);
        toast.error("Image upload failed", {
            description: errorData.error?.message || errorData.message || "Something went wrong during upload."
        });
        return null;
      }
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Network error during image upload:', error);
      toast.error("Image upload failed", { description: "Network error or Cloudinary configuration issue." });
      return null;
    } finally {
      setIsUploadingImage(false); // Ensure upload state is reset regardless of success/fail
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation for title and content
    if (!title.trim()) {
      toast.error("Title is required.", { description: "Please enter a title for your post." });
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required.", { description: "Please enter some content for your post." });
      return;
    }


    let uploadedImageUrl: string | null | undefined = undefined; // Initialize as undefined

    if (imageFile) {
      setIsUploadingImage(true); // Set loading state for image upload
      uploadedImageUrl = await uploadImageToCloudinary(imageFile);
      // setIsUploadingImage(false) is handled in uploadImageToCloudinary's finally block

      if (uploadedImageUrl === null) {
        // If image upload failed, stop the post creation process
        return;
      }
    }

    // Now, call the createPost mutation with the potentially uploaded imageUrl
    // If uploadedImageUrl is null (failed upload) or was never set (no file selected),
    // it will remain `undefined`, which matches the `nullable().optional()` in your Zod schema.
    createPostMutation.mutate({
      title,
      content,
      published,
      categoryIds: selectedCategoryIds,
      imageUrl: uploadedImageUrl, // This is already `string | null | undefined`
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.options)
                               .filter(option => option.selected)
                               .map(option => parseInt(option.value));
    setSelectedCategoryIds(selectedOptions);
  };

  if (isLoadingCategories) {
    return (
      <main className="container mx-auto p-4 sm:p-8 max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
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

  if (isErrorCategories) {
    return <div className="p-8 text-center text-red-500">Error: Could not load categories.</div>;
  }

  const isSubmitting = createPostMutation.isPending || isUploadingImage;

  return (
    <main className="container mx-auto p-4 sm:p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Blog Post"
            required
            disabled={isSubmitting} // Disable during submission
          />
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your amazing post here. Markdown is supported..."
            rows={15}
            required
            disabled={isSubmitting} // Disable during submission
          />
        </div>

        {/* Image Upload Section */}
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
            {imageUrlPreview && (
                <div className="relative w-48 h-32 mt-4 border rounded-md overflow-hidden">
                    <Image src={imageUrlPreview} alt="Image Preview" fill className="object-cover" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => {
                            setImageFile(null);
                            setImageUrlPreview(null);
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
          {isSubmitting ? 'Processing...' : 'Create Post'}
        </Button>
      </form>
    </main>
  );
}