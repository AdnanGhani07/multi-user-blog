"use client";

import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";

import { trpc } from "../_trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { calculateReadingTime, calculateWordCount } from "@/lib/post-utils";
import { format } from "date-fns";
import { useAnonymousId } from "@/lib/hooks/useAnonymousId";

// Pagination components
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const POSTS_PER_PAGE = 9;

type RouterOutput = inferRouterOutputs<AppRouter>;
type PostOutput = RouterOutput["posts"]["getPublishedPosts"]["posts"][number]; // Get the type of a single post
type PostToCategoryOutput = PostOutput["postsToCategories"][number]; // Get the type of a single postsToCategories item

export default function PostsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const anonymousId = useAnonymousId();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const selectedCategorySlugs = searchParams.getAll("category");

  // --- QUERIES ---
  const { data: allCategories, isLoading: isLoadingAllCategories } =
    trpc.categories.getCategories.useQuery();
  const {
    data,
    isLoading: isLoadingPosts,
    isError,
  } = trpc.posts.getPublishedPosts.useQuery(
    {
      anonymousUserId: anonymousId ?? undefined,
      categorySlugs:
        selectedCategorySlugs.length > 0 ? selectedCategorySlugs : undefined,
      search: debouncedSearchTerm || undefined,
      page: currentPage,
      pageSize: POSTS_PER_PAGE,
    },
    { enabled: !!anonymousId }
  );

  const posts = data?.posts || [];
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    // Only run if debounced term is different from the current URL's search param
    if (debouncedSearchTerm !== searchParams.get("search")) {
      const newParams = new URLSearchParams(searchParams.toString());
      if (debouncedSearchTerm) {
        newParams.set("search", debouncedSearchTerm);
      } else {
        newParams.delete("search");
      }
      newParams.set("page", "1"); // Reset to page 1 on a new search
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [debouncedSearchTerm, searchParams, router, pathname]);

  const createQueryString = useCallback(
    (name: string, value: string | number | string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (Array.isArray(value)) {
        params.delete(name);
        value.forEach((v) => params.append(name, String(v)));
      } else {
        params.set(name, String(value));
      }
      return params.toString();
    },
    [searchParams]
  );

  const toggleCategoryFilter = (slug: string) => {
    const newSelectedSlugs = selectedCategorySlugs.includes(slug)
      ? selectedCategorySlugs.filter((s) => s !== slug)
      : [...selectedCategorySlugs, slug];

    // Create new query string and push to router
    const newQuery =
      createQueryString("category", newSelectedSlugs) +
      "&" +
      createQueryString("page", 1);
    router.push(`${pathname}?${newQuery}`, { scroll: false });
  };

  const goToPage = (pageNumber: number) => {
    router.push(pathname + "?" + createQueryString("page", pageNumber), {
      scroll: false,
    });
  };

  const isLoading = isLoadingPosts || isLoadingAllCategories;

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 sm:p-8">
        {/* Skeleton UI remains the same */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="mb-4">
          <Skeleton className="h-10 w-full max-w-lg" />
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
      </main>
    );
  }

  if (isError)
    return (
      <div className="p-8 text-center text-red-500">
        Error: Could not fetch posts.
      </div>
    );

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Blog Posts</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/create-post">Create New Post</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search posts by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg"
        />
      </div>

      {allCategories && allCategories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 items-center">
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 mr-2">
            Filter by:
          </span>
          {allCategories.map((category) => (
            <Badge
              key={category.id}
              variant={
                selectedCategorySlugs.includes(category.slug)
                  ? "default"
                  : "secondary"
              }
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleCategoryFilter(category.slug)}
            >
              {category.name}
            </Badge>
          ))}
          {selectedCategorySlugs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                router.push(pathname + "?" + createQueryString("category", []));
              }}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 && (
          <p className="col-span-full text-center text-gray-600 dark:text-gray-400 text-lg">
            {selectedCategorySlugs.length > 0 || debouncedSearchTerm
              ? "No posts found matching your criteria."
              : "No published posts available yet. Create one!"}
          </p>
        )}
        {posts.map((post) => {
          const wordCount = calculateWordCount(post.content || "");
          const userTotalTime =
            post.anonymousReadProgress?.[0]?.totalTimeSpentSeconds || 0;
          const formattedUserTime =
            userTotalTime > 0
              ? `You spent: ${Math.floor(userTotalTime / 60)}m ${
                  userTotalTime % 60
                }s`
              : "Not yet read by you";
          return (
            <Card key={post.id} className="flex flex-col">
              {post.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-t-lg object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-semibold leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <p className="text-gray-500 text-sm mt-1">
                  Published on:{" "}
                  {format(new Date(post.createdAt), "MMMM dd, yyyy")}
                </p>
                <p className="text-gray-500 text-xs">{wordCount} words</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-semibold">
                  {formattedUserTime}
                </p>
              </CardHeader>
              <CardContent className="flex-grow">
                {post.postsToCategories.map(
                  (
                    ptc: PostToCategoryOutput // <-- HERE'S THE CHANGE
                  ) => (
                    <Link
                      key={ptc.category.id}
                      href={`/posts?category=${ptc.category.slug}`}
                    >
                      <Badge
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {ptc.category.name}
                      </Badge>
                    </Link>
                  )
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={
                  pathname + "?" + createQueryString("page", currentPage - 1)
                }
                onClick={(e) => {
                  if (currentPage <= 1) e.preventDefault();
                  else goToPage(currentPage - 1);
                }}
                isActive={currentPage > 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={
                      pathname + "?" + createQueryString("page", pageNumber)
                    }
                    isActive={pageNumber === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href={
                  currentPage < totalPages
                    ? pathname +
                      "?" +
                      createQueryString("page", currentPage + 1)
                    : "#"
                }
                onClick={(e) => {
                  if (currentPage >= totalPages) e.preventDefault();
                  else goToPage(currentPage + 1);
                }}
                isActive={currentPage < totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </main>
  );
}
