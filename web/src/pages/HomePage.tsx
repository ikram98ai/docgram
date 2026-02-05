import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { useFeed, usePosts } from "../hooks/use-posts";
import { PostCard } from "../components/post-card";
import { PostCardSkeleton } from "../components/post-card-skeleton";
import { useAuthStore } from "../stores/auth-store";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const {
    data: posts = [],
    isLoading,
    error,
    refetch,
  } = isAuthenticated ? usePosts(): useFeed();

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto space-y-6 p-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load posts</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No posts yet</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload your first PDF
          </Button>
        </div>
      ) : (
        posts.map((post: any) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
