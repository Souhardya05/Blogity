// server/routers/category.ts

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '@/drizzle/db';
import { categories, postsToCategories } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Helper function to generate a slug
const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/[\s_]+/g, '-')     // Replace spaces and underscores with -
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing dashes
};

export const categoryRouter = router({
  
  // ## 1. CREATE CATEGORY
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { name, description } = input;
      const slug = createSlug(name);

      try {
        const [newCategory] = await db
          .insert(categories)
          .values({
            name,
            description,
            slug,
          })
          .returning();
        return newCategory;
      } catch (error: any) {
        // Handle potential unique constraint errors (e.g., same name/slug)
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A category with this name or slug already exists.',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not create category.',
        });
      }
    }),

  // ## 2. GET ALL CATEGORIES
  getAll: publicProcedure.query(async () => {
    return await db.query.categories.findMany({
      orderBy: [desc(categories.name)],
    });
  }),

  // ## 3. GET CATEGORY BY SLUG
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, input.slug),
        // Optionally, you could include all posts related to this category
        // with: {
        //   postsToCategories: {
        //     with: {
        //       post: true,
        //     }
        //   }
        // }
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }
      return category;
    }),

  // ## 4. UPDATE CATEGORY
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, name, description } = input;
      
      const [updatedCategory] = await db
        .update(categories)
        .set({
          name,
          description,
          slug: name ? createSlug(name) : undefined,
        })
        .where(eq(categories.id, id))
        .returning();

      if (!updatedCategory) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });
      }
      return updatedCategory;
    }),

  // ## 5. DELETE CATEGORY
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Before deleting a category, we must remove its links to posts.
      await db.transaction(async (tx) => {
        // Delete all references in the junction table
        await tx
          .delete(postsToCategories)
          .where(eq(postsToCategories.categoryId, input.id));
        
        // Then, delete the category itself
        await tx.delete(categories).where(eq(categories.id, input.id));
      });
      
      return { success: true };
    }),
});