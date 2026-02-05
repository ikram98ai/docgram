"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Download,
  BotIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { type Post, useLikePost, useBookmarkPost } from "../hooks/use-posts";
import { CommentSection } from "./comment-section";
import { PDFChatModal } from "./pdf-chat-modal";
import { Link } from "react-router";
import { MoreMenu } from "./more-menu";
import { ScrollArea } from "./ui/scroll-area";
import { useAuthStore } from "../stores/auth-store";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const likePost = useLikePost();
  const bookmarkPost = useBookmarkPost();
  const {user, isAuthenticated} = useAuthStore()
  
  const handleLike = async () => {
    try {
      await likePost.mutateAsync(post.id);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      await bookmarkPost.mutateAsync(post.id);
    } catch (error) {
      console.error("Failed to bookmark post:", error);
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-sm py-0 bg-card">
        {/* Post Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <Link to={`/profile?id=${post.user?.user_id}`}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={post.user?.avatar_url || "/placeholder.svg"}
                    alt={post.user?.full_name}
                  />
                  <AvatarFallback>
                    {post.user?.full_name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {post.user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
            {post.user_id=== user?.user_id &&<MoreMenu post={post} />}
          </div>
        </div>

        {/* Post Content */}
        <CardContent className="p-0">
          <div className="relative bg-muted/30">
            <img
              src={post.thumbnail_url || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-80  object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="text-white font-semibold text-sm mb-1 text-balance">
                {post.title}
              </h3>
              <ScrollArea>
                <p className="text-white/80 text-xs mt-2 max-h-20">
                  {post.page_count} pages • {post.description || "PDF Document"}
                </p>
              </ScrollArea>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="py-2 px-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0"
                  onClick={handleLike}
                  disabled={likePost.isPending || !isAuthenticated}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      post.is_liked
                        ? "fill-red-500 text-red-500"
                        : "text-foreground"
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0"
                  onClick={() => setShowComments(true)}
                  disabled={!isAuthenticated}
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(true)}
                  disabled={!isAuthenticated}
                >
                  <BotIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <a href={post.pdf_url} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-0"
                onClick={handleBookmark}
                disabled={bookmarkPost.isPending || !isAuthenticated}
                >
                <Bookmark
                  className={cn(
                    "h-5 w-5",
                    post.is_bookmarked
                      ? "fill-foreground text-foreground"
                      : "text-foreground"
                  )}
                />
              </Button>
            </div>

            {/* Likes and Comments */}
            <div className="">
              <p className="text-sm font-semibold text-foreground">
                {post.likes_count?.toLocaleString()} likes
              </p>

              <span
                onClick={() => setShowComments(true)}
                className="text-xs text-muted-foreground"
              >
                View all {post.comments_count} comments
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <CommentSection
        postId={post.id}
        open={showComments}
        onOpenChange={setShowComments}
      />

      <PDFChatModal
        open={showChat}
        onOpenChange={setShowChat}
        pdfTitle={post.title}
        pdfId={post.id}
      />
    </>
  );
}
