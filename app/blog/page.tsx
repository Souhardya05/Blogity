// app/blog/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/utils/api';
import ReactMarkdown from 'react-markdown';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // 1. Import Input

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // 2. Add search state

  const { data: categories, isLoading: isLoadingCategories } =
    api.category.getAll.useQuery();

  const {
    data: posts,
    isLoading: isLoadingPosts,
    error: postsError,
  } = api.post.getAll.useQuery({
    categoryId: selectedCategory ?? undefined,
    searchTerm: searchTerm || undefined, // 3. Pass search term to API
  });

  const isLoading = isLoadingPosts || isLoadingCategories;

  if (postsError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Error fetching posts: {postsError.message}</div>
      </div>
    );
  }

  const publishedPosts = posts?.filter((post) => post.published);

  return (
    <main className="container mx-auto p-4 md:p-8">
      {/* Header and Navigation */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Blog</h1>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </header>

      {/* --- 4. ADD SEARCH AND FILTER SECTION --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search posts by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-full md:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            All Posts
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      {/* --- END SECTION --- */}

      {/* Grid for Blog Posts */}
      {isLoading ? (
        <div className="text-center py-12">Loading posts...</div>
      ) : publishedPosts && publishedPosts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {publishedPosts.map((post) => (
            <Card key={post.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  Published on: {new Date(post.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="line-clamp-3 text-sm text-muted-foreground">
                  <ReactMarkdown
                    allowedElements={['p', 'strong', 'em']}
                    unwrapDisallowed={true}
                  >
                    {post.content || 'No content...'}
                  </ReactMarkdown>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div className="flex flex-wrap gap-2">
                  {post.postsToCategories.map((ptc) => (
                    <Badge key={ptc.categoryId} variant="secondary">
                      {ptc.category.name}
                    </Badge>
                  ))}
                  {post.postsToCategories.length === 0 && (
                    <Badge variant="outline">Uncategorized</Badge>
                  )}
                </div>

                <Button asChild variant="link" className="p-0">
                  <Link href={`/posts/${post.slug}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl">No posts found.</h2>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Try adjusting your search or filter.'
              : 'Check the dashboard to create a new post.'}
          </p>
        </div>
      )}
    </main>
  );
}