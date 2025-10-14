import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Lightbulb,
  LayoutGrid,
  Megaphone,
  Search,
  Layers,
  TrendingUp,
} from "lucide-react"; // More icons

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Your Ideas, Beautifully Expressed.
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            A powerful, type-safe blogging platform built with Next.js, tRPC,
            and Drizzle.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 dark:text-gray-800 dark:bg-white dark:hover:bg-gray-200 transition-colors duration-300 shadow-lg"
            >
              <Link href="/posts">Start Reading</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-blue-500 hover:bg-white hover:text-blue-600 dark:text-white dark:hover:text-gray-800 transition-colors duration-300 shadow-lg"
            >
              <Link href="/dashboard">Manage Posts</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="flex flex-col items-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-col items-center p-0 mb-4">
                {" "}
                {/* Adjusted CardHeader padding and flex for centering */}
                <Lightbulb className="h-12 w-12 text-blue-500 mb-4" />{" "}
                {/* mb-4 adds space below icon */}
                <CardTitle className="text-xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  {" "}
                  {/* Added whitespace-nowrap, overflow-hidden, text-ellipsis */}
                  Type-Safe API
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {" "}
                {/* Adjusted CardContent padding */}
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Leverage tRPC for end-to-end type safety between frontend and
                  backend, ensuring robust development.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-col items-center p-0 mb-4">
                <LayoutGrid className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle className="text-xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  Flexible Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Create, edit, categorize, and publish blog posts with an
                  intuitive dashboard.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-col items-center p-0 mb-4">
                <Megaphone className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  Responsive & Modern UI
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Built with Next.js and Tailwind CSS for a seamless experience
                  on any device.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-col items-center p-0 mb-4">
                <Search className="h-12 w-12 text-yellow-500 mb-4" />
                <CardTitle className="text-xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  Powerful Search & Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Find content quickly with integrated search and category
                  filtering options.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-col items-center p-0 mb-4">
                <Layers className="h-12 w-12 text-purple-500 mb-4" />
                <CardTitle className="text-xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  Cloud-Backed Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Securely upload and manage featured images for your posts with
                  Cloudinary integration.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              {" "}
              {/* Changed p-2 to p-6 for consistency */}
              <CardHeader className="flex flex-col items-center p-0 mb-4">
                <TrendingUp className="h-12 w-12 text-indigo-500 mb-4" />
                <CardTitle className="text-xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  {" "}
                  {/* Changed text-lg to text-xl for consistency */}
                  Post Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Get insights into your content with word count and estimated
                  reading time.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action (CTA) Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Share Your Voice?
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto">
            Join our community of writers and start publishing your unique
            insights today.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 dark:text-gray-800 dark:bg-white dark:hover:bg-gray-200 transition-colors duration-300 shadow-lg"
          >
            <Link href="/create-post">Create Your First Post</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="ml-4 border-white text-purple-500  hover:bg-white hover:text-purple-600 dark:text-white dark:hover:text-gray-800 transition-colors duration-300 shadow-lg"
          >
            <Link href="/posts">Explore the Blog</Link>
          </Button>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center">
        <div className="container mx-auto px-4">
          <p className="mb-4">
            &copy; {new Date().getFullYear()} My Blog. All rights reserved.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/posts" className="hover:text-white transition-colors">
              Blog
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/landing#features"
              className="hover:text-white transition-colors"
            >
              Features
            </Link>
          </div>
          <p className="mt-4 text-sm">
            Built with ❤️ using Next.js, tRPC, Drizzle, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
