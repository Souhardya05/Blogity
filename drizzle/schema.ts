import { relations } from 'drizzle-orm';
import { pgTable, serial, text, varchar, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';

// Posts Table
// This table will store our blog posts.
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).unique().notNull(),
  content: text('content'),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories Table
// This table will store the different categories for posts.
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).unique().notNull(),
  slug: varchar('slug', { length: 256 }).unique().notNull(),
  description: text('description'),
});

//Posts to Categories Table (Junction Table)
// This table links posts to their categories (many-to-many relationship).
export const postsToCategories = pgTable('posts_to_categories', {
    postId: serial('post_id').notNull().references(() => posts.id),
    categoryId: serial('category_id').notNull().references(() => categories.id),
  }, (t) => ({
    pk: primaryKey({ columns: [t.postId, t.categoryId] }),
  })
);

// Drizzle Relations
// Define relations between tables for easier querying.
export const postsRelations = relations(posts, ({ many }) => ({
  postsToCategories: many(postsToCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  postsToCategories: many(postsToCategories),
}));

export const postsToCategoriesRelations = relations(postsToCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postsToCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postsToCategories.categoryId],
    references: [categories.id],
  }),
}));