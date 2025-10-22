// app/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/utils/api';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PostList } from '@/app/_components/PostList';
import { CategoryManager } from '@/app/_components/CategoryManager';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  content: z.string().optional(),
  categoryIds: z.array(z.number()).optional(),
  published: z.boolean(),
});

export default function DashboardPage() {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: categories, isLoading: isLoadingCategories } =
    api.category.getAll.useQuery();

  const createPostMutation = api.post.create.useMutation({
    onSuccess: (newPost) => {
      toast.success('Post created successfully!');
      utils.post.getAll.invalidate();
      router.push(`/posts/${newPost.slug}`);
    },
    onError: (error) => {
      toast.error('Failed to create post', {
        description: error.message,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryIds: [],
      published: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createPostMutation.mutate(values);
  }

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-4xl">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild variant="outline">
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </header>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Manage Posts</h2>
        <PostList />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Manage Categories</h2>
        <CategoryManager />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Create New Post</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Post" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content (Markdown)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your post content here..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publish Post</FormLabel>
                  <FormDescription>
                    Make this post visible to the public on the homepage.
                  </FormDescription>
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

          <FormField
            control={form.control}
            name="categoryIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Categories</FormLabel>
                  <FormDescription>
                    Select one or more categories for your post.
                  </FormDescription>
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
                        render={({ field }) => {
                          return (
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
                          );
                        }}
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
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
          </Button>
        </form>
      </Form>
    </main>
  );
}