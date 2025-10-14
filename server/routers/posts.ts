import { publicProcedure, router } from "../trpc";
import { posts, postsToCategories, categories, anonymousReadProgress } from "@/db/schema";
import { z } from "zod";
import { db } from "@/db";
import { eq, desc, ilike, and, sql, ne } from "drizzle-orm";
import slugify from "slugify";
import { TRPCError } from "@trpc/server";

export const postsRouter = router({
  createPost: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required"),
        imageUrl: z.string().url().nullable().optional(),
        published: z.boolean().default(false),
        categoryIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("Received input for createPost:", input);

      if (!input.title || input.title.trim().length === 0) {
        throw new Error("Post title cannot be empty.");
      }

      let baseSlug = slugify(input.title, {
        lower: true,
        strict: true,
        trim: true,
      });
      let finalSlug = baseSlug;
      let counter = 0;

      while (true) {
        const existingPost = await db.query.posts.findFirst({
          where: eq(posts.slug, finalSlug),
        });

        if (!existingPost) {
          break;
        }

        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }

      const [newPost] = await db
        .insert(posts)
        .values({
          title: input.title,
          content: input.content,
          imageUrl: input.imageUrl,
          published: input.published,
          slug: finalSlug,
        })
        .returning();

      if (!newPost) {
        throw new Error("Failed to create the main post entry.");
      }

      if (input.categoryIds && input.categoryIds.length > 0) {
        const postCategories = input.categoryIds.map((categoryId: number) => ({
          postId: newPost.id,
          categoryId: categoryId,
        }));

        if (postCategories.length > 0) {
          await db.insert(postsToCategories).values(postCategories);
          console.log(
            `Inserted ${postCategories.length} categories for post ${newPost.id}`
          );
        } else {
          console.warn(
            "No valid category relationships to insert for post. This might indicate an issue with category IDs."
          );
        }
      } else {
        console.log("No categories provided for post.");
      }

      return newPost;
    }),

  getAllPostsForDashboard: publicProcedure.query(async () => {
    return db.query.posts.findMany({
      with: {
        postsToCategories: {
          with: {
            category: true,
          },
        },
      },
      orderBy: desc(posts.createdAt),
    });
  }),

  saveReadingProgress: publicProcedure
    .input(
      z.object({
        postId: z.number().int(),
        timeSpentInSeconds: z.number().int().min(0),
        anonymousUserId: z.string().uuid(), // Expect a UUID from the client
      })
    )
    .mutation(async ({ input }) => {
      const { postId, timeSpentInSeconds, anonymousUserId } = input;

      // Find existing progress for this anonymous user and post
      const existingProgress = await db.query.anonymousReadProgress.findFirst({
        where: and(
          eq(anonymousReadProgress.anonymousUserId, anonymousUserId),
          eq(anonymousReadProgress.postId, postId)
        ),
      });

      if (existingProgress) {
        // If record exists, update by incrementing total time and setting lastReadAt
        await db
          .update(anonymousReadProgress)
          .set({
            totalTimeSpentSeconds: sql`${anonymousReadProgress.totalTimeSpentSeconds} + ${timeSpentInSeconds}`,
            lastReadAt: new Date(),
          })
          .where(eq(anonymousReadProgress.id, existingProgress.id));
      } else {
        // If no record exists, create a new one
        await db.insert(anonymousReadProgress).values({
          anonymousUserId: anonymousUserId,
          postId: postId,
          totalTimeSpentSeconds: timeSpentInSeconds,
          lastReadAt: new Date(), // Set creation time as lastReadAt
        });
      }
      return { success: true };
    }),

  // --- UPDATED: getPublishedPosts query ---
  getPublishedPosts: publicProcedure
    .input(
      z.object({
        anonymousUserId: z.string().uuid().optional(), // Now accepts optional anonymousId
        categorySlugs: z.array(z.string()).optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { anonymousUserId, categorySlugs, search, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const whereClause = and(
        eq(posts.published, true), // Assuming 'status' field exists and is 'published'
        search ? ilike(posts.title, `%${search}%`) : undefined,
        categorySlugs && categorySlugs.length > 0
          ? sql`${posts.id} IN ${db.select({ postId: postsToCategories.postId }).from(postsToCategories).leftJoin(categories, eq(postsToCategories.categoryId, categories.id)).where(sql`${categories.slug} IN ${categorySlugs}`)}`
          : undefined
      );

      const postsQuery = db.query.posts.findMany({
        where: whereClause,
        limit: pageSize,
        offset: offset,
        with: {
          postsToCategories: {
            with: {
              category: true,
            },
          },
          // --- NEW: Conditionally fetch anonymous user's reading progress for this post ---
          anonymousReadProgress: anonymousUserId ? {
            where: (progress, { eq }) => eq(progress.anonymousUserId, anonymousUserId),
          } : undefined,
        },
        orderBy: (posts, { desc }) => desc(posts.createdAt),
      });

      const totalPostsQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(whereClause);

      const [postsResult, totalPostsResult] = await Promise.all([postsQuery, totalPostsQuery]);

      const totalPosts = totalPostsResult[0].count;
      const totalPages = Math.ceil(totalPosts / pageSize);

      return {
        posts: postsResult,
        totalPosts,
        totalPages,
      };
    }),

  getPostBySlug: publicProcedure
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

      if (!post || !post.published) {
        throw new Error("Post not found or not published.");
      }

      return post;
    }),

  getPostById: publicProcedure // Changed to publicProcedure based on our current no-auth setup
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
        with: {
          postsToCategories: {
            with: {
              category: true,
            },
          },
        },
      });

      if (!post) {
        throw new Error("Post not found.");
      }

      // Important: For editing, you typically want to fetch drafts too,
      // so we don't include `eq(posts.published, true)` here.
      return post;
    }),

  updatePost: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1, "Title is required").optional(),
        content: z.string().min(1, "Content is required").optional(),
        imageUrl: z.string().url().nullable().optional(),
        published: z.boolean().optional(),
        categoryIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, categoryIds, ...updateData } = input;

      const existingPost = await db.query.posts.findFirst({
        where: eq(posts.id, id),
      });

      if (!existingPost) {
        throw new Error(
          "Post not found or you don't have permission to update it."
        );
      }

      if (updateData.title && updateData.title !== existingPost.title) {
        let baseSlug = slugify(updateData.title, {
          lower: true,
          strict: true,
          trim: true,
        });
        let finalSlug = baseSlug;
        let counter = 0;

        while (true) {
          const checkSlugPost = await db.query.posts.findFirst({
            where: and(eq(posts.slug, finalSlug), ne(posts.id, id)),
          });

          if (!checkSlugPost) {
            break;
          }
          counter++;
          finalSlug = `${baseSlug}-${counter}`;
        }
        (updateData as any).slug = finalSlug;
      }

      const [updatedPost] = await db
        .update(posts)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost) {
        throw new Error("Failed to update post.");
      }

      await db
        .delete(postsToCategories)
        .where(eq(postsToCategories.postId, id));

      if (categoryIds && categoryIds.length > 0) {
        const newPostCategories = categoryIds.map((categoryId: number) => ({
          postId: updatedPost.id,
          categoryId: categoryId,
        }));
        if (newPostCategories.length > 0) {
          await db.insert(postsToCategories).values(newPostCategories);
        }
      }

      return updatedPost;
    }),

  deletePost: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const existingPost = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });

      if (!existingPost) {
        throw new Error(
          "Post not found or you don't have permission to delete it."
        );
      }

      const [deletedPost] = await db
        .delete(posts)
        .where(eq(posts.id, input.id))
        .returning();

      if (!deletedPost) {
        throw new Error("Failed to delete post.");
      }

      return { success: true, postId: deletedPost.id };
    }),

    togglePublishStatus: publicProcedure
        .input(
            z.object({
                id: z.number(),
                currentStatus: z.boolean(),
            })
        )
        .mutation(async ({ input }) => {
            const updatedPost = await db
                .update(posts)
                .set({ published: !input.currentStatus })
                .where(eq(posts.id, input.id))
                .returning(); // Use .returning() to get the updated record

            if (updatedPost.length === 0) {
                throw new Error("Post not found or could not be updated.");
            }

            return updatedPost[0];
        }),
});
