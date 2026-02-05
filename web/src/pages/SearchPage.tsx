import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { PostCard } from "../components/post-card";
import { Loader2, SearchIcon } from "lucide-react";
import {type Post, useSearchPosts } from "../hooks/use-posts";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: posts,
    isLoading,
    isError,
  } = useSearchPosts(searchTerm);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search Bar */}
      <div className="max-w-md mx-auto px-4 mt-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title..."
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Content */}
      <main className="pb-20 mt-4">
        <div className="max-w-md mx-auto px-4">
          {isError && (
            <div className="text-center text-red-500">
              Error fetching search results.
            </div>
          )}
          {posts && posts.length === 0 && searchTerm && (
            <div className="text-center text-muted-foreground">
              No posts found for "{searchTerm}".
            </div>
          )}
          <div className="space-y-4">
            {posts?.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
