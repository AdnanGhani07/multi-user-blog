import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { categories, postsToCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Utility for creating URL-friendly slugs
const createSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export const categoriesRouter = router({
  // Read All Categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.categories.findMany();
  }),

  // Create Category
  createCategory: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Category name must be at least 2 characters."),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = createSlug(input.name);
      await ctx.db.insert(categories).values({ ...input, slug });
      revalidatePath("/dashboard/categories"); // Revalidate the categories management page
      return { success: true, message: "Category created!" };
    }),

  // Update Category (by ID)
  updateCategory: publicProcedure
    .input(
      z
        .object({
          id: z.number(),
          name: z
            .string()
            .min(2, "Category name must be at least 2 characters.")
            .optional(),
          description: z.string().optional(),
        })
        .partial()
    ) // .partial() makes all fields optional for update, but we'll manually check for at least one
    .mutation(async ({ ctx, input }) => {
      if (!input.id || (!input.name && !input.description)) {
        throw new Error("Invalid input for category update.");
      }

      const updateData: { name?: string; slug?: string; description?: string } =
        {};
      if (input.name) {
        updateData.name = input.name;
        updateData.slug = createSlug(input.name); // Re-generate slug if name changes
      }
      if (input.description) {
        updateData.description = input.description;
      }

      await ctx.db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, input.id));

      revalidatePath("/dashboard/categories");
      // Potentially revalidate post pages if categories are shown on posts
      return { success: true, message: "Category updated!" };
    }),

  // Delete Category (by ID)
  deleteCategory: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Consider handling orphaned posts or disallowing deletion if category is in use.
      // For now, let's allow it, Drizzle's FK will handle the cascade/restriction depending on schema.
      await ctx.db.delete(postsToCategories).where(eq(postsToCategories.categoryId, input.id));
      await ctx.db.delete(categories).where(eq(categories.id, input.id));
      revalidatePath("/dashboard/categories");
      return { success: true, message: "Category deleted!" };
    }),
});
