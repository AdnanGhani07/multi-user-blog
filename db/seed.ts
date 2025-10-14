// db/seed.ts

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in the environment variables");
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

// A helper function to generate slugs
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text

async function main() {
  console.log("🌱 Seeding database...");

  const data: (typeof schema.categories.$inferInsert)[] = [
    {
      name: 'Technology',
      description: 'The latest in tech, software engineering, and gadgets.',
    },
    {
      name: 'Productivity',
      description: 'Tips, tricks, and systems to get more done.',
    },
    {
      name: 'Lifestyle',
      description: 'Exploring personal growth, wellness, and daily life.',
    },
    {
      name: 'Web Development',
      description: 'Tutorials and insights on building for the modern web.',
    },
    {
      name: 'Career Growth',
      description: 'Advice on navigating the modern workplace and advancing your career.',
    },
  ].map(cat => ({
    ...cat,
    slug: slugify(cat.name),
  }));
  
  try {
    console.log("Seeding categories...");
    await db
      .insert(schema.categories)
      .values(data)
      // onConflictDoNothing will prevent an error if a category with the same name already exists.
      // This makes the seed script safe to run multiple times.
      .onConflictDoNothing({ target: schema.categories.name });

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

main();