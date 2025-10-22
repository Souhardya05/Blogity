'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: post, isLoading, error } = api.post.getBySlug.useQuery({ slug });

  if (isLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold">Post not found.</h1>
        <Button asChild variant="link" className="p-0 mt-4">
          <Link href="/blog">Back to blog</Link>
        </Button>
      </div>
    );
  }


  const content = post.content || '';
  // --- 1. CALCULATE STATS ---
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  // Assumes an average reading speed of 200 words per minute
  const readingTime = Math.ceil(wordCount / 200);


  return (
    <main className="container mx-auto p-4 md:p-8 max-w-3xl">
      <Button asChild variant="link" className="p-0 mb-4">
        <Link href="/blog">&larr; Back to blog</Link>
      </Button>

      {/* Post Header */}
      <h1 className="text-4xl font-extrabold mb-4">{post.title}</h1>

      {/* --- 2. ADD STATS TO UI --- */}
      <div className="text-muted-foreground mb-4 flex items-center gap-2 flex-wrap">
        <span>
          Published on: {new Date(post.createdAt).toLocaleDateString()}
        </span>
        <span className="hidden md:inline">•</span>
        <span>{wordCount} words</span>
        <span className="hidden md:inline">•</span>
        <span>{readingTime} min read</span>
      </div>
     

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {post.postsToCategories.map((ptc) => (
          <Badge key={ptc.categoryId} variant="secondary">
            {ptc.category.name}
          </Badge>
        ))}
        {post.postsToCategories.length === 0 && (
          <Badge variant="outline">Uncategorized</Badge>
        )}
      </div>

      {/* Post Content */}
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content || ''}
        </ReactMarkdown>
      </div>
    </main>
  );
}