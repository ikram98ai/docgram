"use client";

import { useState } from "react";
import { useGetComments, useCreateComment, type Comment } from "../hooks/use-posts";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useAuthStore } from "../stores/auth-store";

interface CommentSectionProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentSection({
  postId,
  open,
  onOpenChange,
}: CommentSectionProps) {
  const [content, setContent] = useState("");
  const {
    data: comments = [],
    isLoading,
    error,
    refetch,
  } = useGetComments(postId, { enabled: open });
  const createComment = useCreateComment();
  const {isAuthenticated} = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment.mutateAsync({ postId, content });
      setContent("");
      refetch();
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[500px]">
          {isLoading && (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center py-4 flex-1">
              <p>Failed to load comments.</p>
              <Button onClick={() => refetch()} variant="link">
                Try again
              </Button>
            </div>
          )}

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 mb-6">
              {comments.map((comment: Comment) => (
                <div
                  key={comment.comment_id}
                  className="flex items-start gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.user?.avatar_url || "/placeholder.svg"}
                      alt={comment.user?.full_name}
                    />
                    <AvatarFallback>
                      {comment.user?.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-lg px-3 py-2">
                      <p className="text-sm font-semibold text-foreground">
                        {comment.user?.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 pt-4 border-t"
          >
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[40px] resize-none"
              rows={1}
              disabled= {!isAuthenticated}
            />
            <Button
              type="submit"
              size="icon"
              disabled={createComment.isPending || !content.trim() || !isAuthenticated}
            >
              {createComment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
