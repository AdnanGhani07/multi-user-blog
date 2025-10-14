# Full-Stack Blogging Platform

This repository contains the submission for the Full-Stack Blogging Platform. It is a modern, full-stack, type-safe blogging application built with a type-safe, end-to-end stack featuring Next.js 15, tRPC, Drizzle ORM, and PostgreSQL. The application allows for complete management of blog posts and categories, with a focus on code quality, clean architecture, and modern development practices.

**Live Deployment Link:** [https://multi-user-blog-iota.vercel.app/](https://multi-user-blog-iota.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-397694?style=for-the-badge&logo=trpc&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## Table of Contents

-   [Features Implemented](#features-implemented)
-   [Tech Stack](#tech-stack)
-   [Local Setup Instructions](#local-setup-instructions)
-   [Environment Variables](#environment-variables)
-   [Database Seeding](#database-seeding)
-   [tRPC Router Structure](#trpc-router-structure)
-   [Design Decisions & Trade-offs](#design-decisions--trade-offs)
-   [Deployment](#deployment)
-   [Time Spent](#time-spent)

## Features Implemented

This project successfully implements all core and expected features, with bonus features completed as time allowed.

### 🔴 Must Have (Core Requirements)

-   [x] **Blog post CRUD operations** (create, read, update, delete)
-   [x] **Category CRUD operations**
-   [x] **Assign one or more categories to posts**
-   [x] **Blog listing page** showing all posts
-   [x] **Individual post view page**
-   [x] **Category filtering** on listing page
-   [x] **Basic responsive navigation**
-   [x] **Clean, professional UI** (functional and clean)

### 🟡 Should Have (Expected Features)

-   [x] **Landing page** with Header/Hero, Features, and Footer sections
-   [x] **Dashboard page** for managing posts
-   [x] **Draft vs Published** post status
-   [x] **Loading and error states** handled gracefully
-   [x] **Mobile-responsive design** across the application
-   [x] **Markdown support** for the content editor

### 🟢 Nice to Have (Bonus Features)

-   [x] **SEO meta tags** (dynamic and static)
-   [x] **Image upload for posts** (via Cloudinary)
-   [x] Search functionality for posts
-   [x] Post statistics (word count, reading time)
-   [x] Dark mode support
-   [x] Pagination

## Tech Stack

The technologies used in this project are strictly aligned with the assignment's requirements.

-   **Framework:** Next.js 15 (with App Router)
-   **Database:** PostgreSQL (hosted on Neon)
-   **ORM:** Drizzle ORM
-   **API Layer:** tRPC
-   **Schema Validation:** Zod
-   **Data Fetching:** React Query (TanStack Query, integrated via tRPC)
-   **Global State Management:** Zustand
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** shadcn/ui
-   **Content Editor:** Markdown (textarea with `react-markdown` for rendering)
-   **Deployment:** Vercel

## Local Setup Instructions

Follow these steps to get the project running on your local machine.

#### 1. Clone the Repository

```bash
git clone https://github.com/AdnanGhani07/multi-user-blog.git
cd multi-user-blog
```
#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up the Database

1.  Go to [Neon](https://neon.tech), create a free account, and set up a new PostgreSQL database.
2.  From your Neon project dashboard, copy the **Connection String** that starts with `postgresql://`. This will be your `DATABASE_URL`.

#### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

#### 5. Push Database Schema

```bash
npx drizzle-kit generate
npx drizzle-kit push
```
#### 6. Seeding the Database

```bash
npx tsx db/seed.ts
```

#### 7. Run The Development Server

```bash
npm run dev
```

Environment Variables
You need to set these variables in your .env.local file for local development and in your Vercel project settings for deployment.

```
# Neon Database Connection String
DATABASE_URL="postgresql://..."

# Cloudinary - For Image Uploads (Bonus Feature)
# Your Cloudinary project's "Cloud Name"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
# The name of an "Unsigned" upload preset you create in Cloudinary settings
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="..."
```

## Database Seeding

The seed script (`/db/seed.ts`) is used to populate the database with initial data. As per the assignment, this is primarily used to seed a list of predefined post categories to make testing the filtering functionality easier.

-   **To run the seed script:** `npx tsx db/seed.ts`
-   **To modify the seed data:** Edit the `data` array within `/db/seed.ts` and re-run the script.

## tRPC Router Structure

tRPC is used to create a fully type-safe API layer. The structure is organized for clarity and scalability, following best practices.

-   **`server/trpc/trpc.ts`**: The initialization file. It defines the base `t` object and exports the main `router` and `publicProcedure`. Since authentication was not a requirement, `protectedProcedure` was not needed.

-   **`server/trpc/index.ts`**: This is the entry point for the API, defining the main `appRouter`. It merges all the individual, domain-specific routers from the `/routers` directory. This provides a single, unified API structure.

-   **`server/trpc/routers/`**: This directory contains the individual routers (e.g., `posts.ts`, `categories.ts`). Each file handles the procedures for a specific domain, keeping the codebase organized and maintainable. For example, `posts.ts` contains all CRUD operations for blog posts, each with its own Zod schema for input validation.


## Design Decisions & Trade-offs

-   **tRPC vs. REST/GraphQL:** I chose tRPC as required to achieve end-to-end type safety. This was a significant productivity booster, as it eliminated the need for manual API type definitions and caught potential integration errors during development.
-   **Drizzle ORM vs. Prisma:** Drizzle was used as required. I found its SQL-like syntax intuitive and appreciated its focus on performance and minimal overhead, making it a great choice for serverless environments.
-   **Markdown vs. Rich Text Editor:** As recommended in the assignment to save time, I opted for a simple Markdown implementation. A basic `textarea` is used for input, and `react-markdown` is used for rendering the output. This allowed more time to be spent on core backend logic and application architecture.
-   **State Management (Zustand):** Zustand was used sparingly, as most server state is managed efficiently by tRPC's React Query integration. I used Zustand for a simple global state need: managing the open/closed state of the mobile navigation menu, which is pure client-side UI state.
-   **`shadcn/ui`:** I leveraged `shadcn/ui` heavily, as suggested. This drastically cut down on UI development time, allowing me to build a clean, professional, and accessible interface without writing extensive custom CSS.

## Deployment

This project is deployed on **Vercel**.

1.  The GitHub repository was connected to a new Vercel project.
2.  Vercel automatically detected the Next.js framework and configured the build settings.
3.  All necessary environment variables were added to the **Environment Variables** section in the Vercel project settings to ensure the deployed application could connect to the database and Cloudinary.
4.  The site deploys automatically on every `git push` to the `main` branch.

## Time Spent

-   **Expected Time Investment:** 12-16 hours
-   **Actual Time Spent:** Approximately 15 hours
