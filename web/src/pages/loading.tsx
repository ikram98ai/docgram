import { PostCardSkeleton } from "../components/post-card-skeleton";

export default function Loading() {
  return (
    <div className="max-w-md mx-auto space-y-6 p-4">
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
}
