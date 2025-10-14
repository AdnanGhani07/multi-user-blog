'use client';

import { useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Import the 'InferSelectModel' type from drizzle-orm for type safety
import { type InferSelectModel } from 'drizzle-orm';
import { categories as categoriesSchema } from '@/db/schema'; // Alias to avoid name clash
import { Textarea } from '@/components/ui/textarea';

// Define the type for a single category item
type Category = InferSelectModel<typeof categoriesSchema>;


export default function CategoryManagementPage() {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDescription, setEditCategoryDescription] = useState('');

  const queryClient = trpc.useUtils();

  // data: categories will be of type Category[] | undefined
  const { data: categories, isLoading, isError } = trpc.categories.getCategories.useQuery();

  const createCategoryMutation = trpc.categories.createCategory.useMutation({
    onSuccess: () => {
      queryClient.categories.getCategories.invalidate();
      setNewCategoryName('');
      setNewCategoryDescription('');
      toast.success("Category created!");
    },
    onError: (error) => toast.error("Failed to create category", { description: error.message }),
  });

  const updateCategoryMutation = trpc.categories.updateCategory.useMutation({
    onSuccess: () => {
      queryClient.categories.getCategories.invalidate();
      setEditingCategoryId(null);
      toast.success("Category updated!");
    },
    onError: (error) => toast.error("Failed to update category", { description: error.message }),
  });

  const deleteCategoryMutation = trpc.categories.deleteCategory.useMutation({
    onSuccess: () => {
      queryClient.categories.getCategories.invalidate();
      toast.success("Category deleted!");
    },
    onError: (error) => toast.error("Failed to delete category", { description: error.message }),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate({ name: newCategoryName, description: newCategoryDescription });
  };

  const handleUpdateSubmit = (e: React.FormEvent, categoryId: number) => {
    e.preventDefault();
    updateCategoryMutation.mutate({
      id: categoryId,
      name: editCategoryName,
      description: editCategoryDescription,
    });
  };

  // --- FIX APPLIED HERE ---
  // We use the `Category` type we defined, which is a single item from the schema.
  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description || '');
  };
  // --- END FIX ---


  if (isLoading) {
    return (
      <main className="container mx-auto p-4 sm:p-8">
        <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (isError) return <div className="p-8 text-center text-red-500">Error: Could not load categories.</div>;

  return (
    <main className="container mx-auto p-4 sm:p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

      {/* Create New Category Form */}
      <Card className="mb-8">
        <CardHeader><CardTitle>Create New Category</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newCategoryName">Category Name</Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="newCategoryDescription">Description (Optional)</Label>
              <Textarea
                id="newCategoryDescription"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={createCategoryMutation.isPending}>
              {createCategoryMutation.isPending ? 'Creating...' : 'Add Category'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List Existing Categories */}
      <h2 className="text-2xl font-bold mb-4">Existing Categories</h2>
      <div className="space-y-4">
        {/* Important: Only map `categories` if it's not undefined */}
        {categories && categories.length === 0 && <p className="text-gray-600">No categories created yet.</p>}
        {categories?.map((category) => ( // Use optional chaining `?.` here
          <Card key={category.id}>
            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
              {editingCategoryId === category.id ? (
                // Edit form
                <form onSubmit={(e) => handleUpdateSubmit(e, category.id)} className="w-full space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row items-center">
                  <Input
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="flex-grow"
                  />
                  <Input
                    value={editCategoryDescription}
                    onChange={(e) => setEditCategoryDescription(e.target.value)}
                    className="flex-grow"
                  />
                  <div className="flex space-x-2 mt-2 md:mt-0">
                    <Button type="submit" size="sm" disabled={updateCategoryMutation.isPending}>Save</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditingCategoryId(null)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                // Display mode
                <>
                  <div>
                    <h3 className="text-lg font-semibold">{category.name} ({category.slug})</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex space-x-2 mt-2 md:mt-0">
                    <Button variant="outline" size="sm" onClick={() => startEditing(category)}>Edit</Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCategoryMutation.mutate({ id: category.id })}
                      disabled={deleteCategoryMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}