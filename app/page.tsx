import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { ModeToggle } from '@/app/_components/ModeToggle';

export default function LandingPage() {
  const features = [
    'Create, edit, and delete posts',
    'Full category management',
    'Type-safe API with tRPC',
    'Blazing fast with Next.js',
    'Responsive dashboard',
    'Drizzle ORM with PostgreSQL',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header Section */}
      <header className="container mx-auto p-4 md:p-6">
        <nav className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Blogity</h1> 
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/blog">Blog</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <ModeToggle />
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <section className="text-center py-20 md:py-32 container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 max-w-2xl mx-auto">
            Build Your Blog. Own Your Content.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Your voice matters. Your story is unique. Find your audience and
            share your passion with the world.
          </p>
          <Button asChild size="lg">
            <Link href="/blog">Start Writing</Link>
          </Button>
        </section>

        {/* 3. Features Section */}
        <section className="bg-muted py-20 md:py-24">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">
              Features Included
            </h3>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base md:text-xl">
                      <Check className="text-primary h-5 w-5" />
                      {feature}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 4. Footer Section */}
      <footer className="bg-background border-t">
        <div className="container mx-auto p-6 text-center text-muted-foreground">
          <p>Created by Souhardya</p>
        </div>
      </footer>
    </div>
  );
}

