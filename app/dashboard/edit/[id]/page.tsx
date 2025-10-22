'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/utils/api';

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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

// 1. Define the form schema (same as create page)
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  content: z.string().optional(),
  categoryIds: z.array(z.number()).optional(),
  published: z.boolean().default(false),
});

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);
  const utils = api.useUtils();

  
  const { data: categories, isLoading: isLoadingCategories } =
    api.category.getAll.useQuery();


  const { data: postData, isLoading: isLoadingPost } =
    api.post.getById.useQuery({ id: postId });


  const updatePostMutation = api.post.update.useMutation({
    onSuccess: () => {
      toast.success('Post updated successfully!');
      
      utils.post.getAll.invalidate(); 
      utils.post.getById.invalidate({ id: postId }); 
      utils.category.getAll.invalidate(); 

      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error('Failed to update post', {
        description: error.message,
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryIds: [],
      published: false,
    },
  });


  useEffect(() => {
    if (postData) {
      form.reset({
        title: postData.title,
        content: postData.content || '',
        published: postData.published,
        categoryIds: postData.categoryIds,
      });
    }
  }, [postData, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    updatePostMutation.mutate({
      id: postId, 
      ...values,  
    });
  }

  if (isLoadingPost) {
    return <div className="container mx-auto p-8">Loading post data...</div>;
  }

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-2xl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content Field */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content (Markdown)</FormLabel>
                <FormControl>
                  <Textarea className="min-h-[200px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Published Field */}
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publish Post</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Categories Field */}
          <FormField
            control={form.control}
            name="categoryIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Categories</FormLabel>
                </div>
                {isLoadingCategories ? (
                  <div>Loading categories...</div>
                ) : (
                  <div className="space-y-2">
                    {categories?.map((category) => (
                      <FormField
                        key={category.id}
                        control={form.control}
                        name="categoryIds"
                        render={({ field }) => (
                          <FormItem
                            key={category.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value ?? []),
                                        category.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== category.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {category.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={updatePostMutation.isPending}
          >
            {updatePostMutation.isPending ? 'Updating...' : 'Update Post'}
          </Button>
        </form>
      </Form>
    </main>
  );
}