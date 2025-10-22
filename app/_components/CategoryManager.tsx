// app/_components/CategoryManager.tsx
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/utils/api';
import { type inferProcedureOutput } from '@trpc/server';
import { type AppRouter } from '@/server/routers/_app';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

// Form schema for creating a new category
const categoryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type Category = inferProcedureOutput<AppRouter['category']['getAll']>[number];

export function CategoryManager() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Call hook at the top
  const utils = api.useUtils();

  // --- tRPC Hooks ---
  const { data: categories, isLoading: isLoadingCategories } =
    api.category.getAll.useQuery();

  const createCategoryMutation = api.category.create.useMutation({
    onSuccess: () => {
      toast.success('Category created!');
      // Use 'utils' variable
      utils.category.getAll.invalidate();
      utils.post.getAll.invalidate();
      form.reset();
    },
    onError: (error) => {
      toast.error('Failed to create category', {
        description: error.message,
      });
    },
  });

  const deleteCategoryMutation = api.category.delete.useMutation({
    onSuccess: () => {
      toast.success('Category deleted!');
      // Use 'utils' variable
      utils.category.getAll.invalidate();
      utils.post.getAll.invalidate();
    },
    onError: (error) => {
      toast.error('Failed to delete category', {
        description: error.message,
      });
    },
    onSettled: () => {
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    },
  });

  // --- Form Setup ---
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '' },
  });

  function onSubmit(values: z.infer<typeof categoryFormSchema>) {
    createCategoryMutation.mutate(values);
  }

  // --- Delete Dialog Logic ---
  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate({ id: categoryToDelete.id });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* 1. Create Category Form */}
      <div>
        <h3 className="text-lg font-medium mb-4">Create New Category</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Technology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </form>
        </Form>
      </div>

      {/* 2. List Existing Categories */}
      <div>
        <h3 className="text-lg font-medium mb-4">Existing Categories</h3>
        {isLoadingCategories ? (
          <p>Loading categories...</p>
        ) : (
          <div className="flex flex-wrap gap-2 rounded-lg border p-4 min-h-[100px]">
            {categories?.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories found.</p>
            )}
            {categories?.map((category) => (
              <Badge key={category.id} variant="secondary" className="group">
                {category.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100"
                  onClick={() => openDeleteDialog(category)}
                >
                  &times;
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 3. Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            {/* --- THIS IS THE FIX --- */}
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category {categoryToDelete?.name} and remove it from all posts.
            </AlertDialogDescription>
            {/* --- END FIX --- */}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}