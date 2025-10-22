// app/_components/PostList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api'; // For runtime calls

// --- THIS IS THE CORRECT TYPE IMPORT ---
import { type inferProcedureOutput } from '@trpc/server';
import { type AppRouter } from '@/server/routers/_app'; // Import your main router TYPE
// --- END TYPE IMPORT ---

import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- THIS IS THE CORRECT TYPE DEFINITION ---
// Use the tRPC helper type to correctly infer the output type.
// Note: server types use Date for createdAt/updatedAt, but at runtime (over the wire)
// these fields may be serialized to strings (depending on transformer). Accept both.
type Post = Omit<
  inferProcedureOutput<AppRouter['post']['getAll']>[number],
  'createdAt' | 'updatedAt'
> & { createdAt: string | Date; updatedAt: string | Date };
// --- END TYPE DEFINITION ---

export function PostList() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const utils = api.useUtils();

  const { data: posts, isLoading, error } = api.post.getAll.useQuery({});

  const deletePostMutation = api.post.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.post.getAll.cancel();
      const previousPosts = utils.post.getAll.getData();
      utils.post.getAll.setData({}, (oldQueryData) =>
        oldQueryData
          ? oldQueryData.filter((post) => post.id !== id)
          : []
      );
      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      if (context?.previousPosts) {
        utils.post.getAll.setData({}, context.previousPosts);
      }
      toast.error('Failed to delete post', {
        description: err.message,
      });
    },
    onSuccess: () => {
      toast.success('Post deleted successfully!');
    },
    onSettled: () => {
      utils.post.getAll.invalidate();
      setShowDeleteDialog(false);
      setPostToDelete(null);
    },
  });

  const openDeleteDialog = (post: Post) => {
    setPostToDelete(post);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    if (postToDelete) {
      deletePostMutation.mutate({ id: postToDelete.id });
    }
  };

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts: {error.message}</div>;
  if (!posts || posts.length === 0) return <p>No posts found.</p>;

  return (
    <div className="border rounded-lg w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">
                <Link href={`/posts/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </TableCell>
              <TableCell>
                {post.published ? (
                  <Badge>Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </TableCell>
              <TableCell>
                {new Date(post.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/edit/${post.id}`}>Edit</Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteDialog(post)}
                  disabled={deletePostMutation.isPending}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              titled {postToDelete?.title}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}