import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-card">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* PDF Preview */}
      <CardContent className="p-0">
        <Skeleton className="w-full h-80" />
      </CardContent>

      {/* Action Buttons */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>

        {/* Likes and Comments */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </Card>
  );
}
