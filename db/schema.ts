import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, integer, uniqueIndex, boolean, serial } from 'drizzle-orm/pg-core';

// ... (The code for posts, categories, and relations tables is exactly the same)
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  content: text('content'),
  imageUrl: text('image_url'),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
});

export const postsToCategories = pgTable('posts_to_categories', {
  postId: serial('post_id').notNull().references(() => posts.id),
  categoryId: serial('category_id').notNull().references(() => categories.id),
});

export const postsRelations = relations(posts, ({ many }) => ({
  postsToCategories: many(postsToCategories),
  anonymousReadProgress: many(anonymousReadProgress),
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

// Define the anonymousReadProgress table
export const anonymousReadProgress = pgTable('anonymous_read_progress', {
  id: serial('id').primaryKey(),
  anonymousUserId: text('anonymous_user_id').notNull(), // Stores the UUID from localStorage
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  totalTimeSpentSeconds: integer('total_time_spent_seconds').notNull().default(0),
  lastReadAt: timestamp('last_read_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    // Ensures only one progress record per anonymous user per post
    userPostUnique: uniqueIndex('anonymous_user_post_unique').on(table.anonymousUserId, table.postId),
  };
});

export const anonymousReadProgressRelations = relations(anonymousReadProgress, ({ one }) => ({
  post: one(posts, {
    fields: [anonymousReadProgress.postId],
    references: [posts.id],
  }),
}));