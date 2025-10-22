// server/routers/post.ts

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '@/drizzle/db';
import { posts, postsToCategories } from '@/drizzle/schema';
// Add `ilike` (for search) and `and` (to combine filters)
import { eq, desc, and, exists, ilike } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Helper function to generate a slug from a title
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};

export const postRouter = router({
  // ## 1. CREATE POST
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(3, 'Title must be at least 3 characters long'),
        content: z.string().optional(),
        categoryIds: z.array(z.number()).optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const { title, content, categoryIds, published } = input;

      const slug = createSlug(title);

      const newPost = await db.transaction(async (tx) => {
        const [insertedPost] = await tx
          .insert(posts)
          .values({
            title: title,
            content: content,
            slug: slug,
            published: published,
          })
          .returning();

        if (categoryIds && categoryIds.length > 0) {
          const links = categoryIds.map((id) => ({
            postId: insertedPost.id,
            categoryId: id,
          }));
          await tx.insert(postsToCategories).values(links);
        }

        return insertedPost;
      });

      return newPost;
    }),

  // ## 2. GET ALL POSTS (UPDATED FOR SEARCH)
  getAll: publicProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        searchTerm: z.string().optional(), // 1. Add search term to input
      })
    )
    .query(async ({ input }) => {
      const { categoryId, searchTerm } = input;

      // 2. Build category filter
      const categoryFilter = categoryId
        ? exists(
            db
              .select()
              .from(postsToCategories)
              .where(
                and(
                  eq(postsToCategories.postId, posts.id),
                  eq(postsToCategories.categoryId, categoryId)
                )
              )
          )
        : undefined;

      // 3. Build search filter (ilike is case-insensitive)
      const searchFilter = searchTerm
        ? ilike(posts.title, `%${searchTerm}%`)
        : undefined;

      // 4. Find posts with combined filters
      const allPosts = await db.query.posts.findMany({
        orderBy: [desc(posts.createdAt)],
        where: and(categoryFilter, searchFilter), // 5. Combine filters
        with: {
          postsToCategories: {
            with: {
              category: true,
            },
          },
        },
      });
      return allPosts;
    }),

  // ## 3. GET POST BY SLUG
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: eq(posts.slug, input.slug),
        with: {
          postsToCategories: {
            with: {
              category: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      return post;
    }),

  // ## GET POST BY ID (for editing)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
        with: {
          postsToCategories: {
            columns: {
              categoryId: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      return {
        id: post.id,
        title: post.title,
        content: post.content || '',
        published: post.published,
        categoryIds: post.postsToCategories.map((ptc) => ptc.categoryId),
      };
    }),

  // ## 4. UPDATE POST
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).optional(),
        content: z.string().optional(),
        published: z.boolean().optional(),
        categoryIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, title, content, published, categoryIds } = input;

      return await db.transaction(async (tx) => {
        const [updatedPost] = await tx
          .update(posts)
          .set({
            title: title,
            content: content,
            published: published,
            slug: title ? createSlug(title) : undefined,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, id))
          .returning();

        if (categoryIds) {
          await tx
            .delete(postsToCategories)
            .where(eq(postsToCategories.postId, id));

          if (categoryIds.length > 0) {
            const links = categoryIds.map((catId) => ({
              postId: id,
              categoryId: catId,
            }));
            await tx.insert(postsToCategories).values(links);
          }
        }

        return updatedPost;
      });
    }),

  // ## 5. DELETE POST
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        await tx
          .delete(postsToCategories)
          .where(eq(postsToCategories.postId, input.id));

        await tx.delete(posts).where(eq(posts.id, input.id));
      });

      return { success: true };
    }),
});