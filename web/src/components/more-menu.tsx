"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { MoreHorizontal, Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { useDeletePost, useTogglePostVisibility, type Post } from "../hooks/use-posts";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useToast } from "./ui/use-toast";
import { EditPostModal } from "./edit-post-modal";

export function MoreMenu({ post }: { post: Post }) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showVisibilityAlert, setShowVisibilityAlert] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const deletePost = useDeletePost();
  const togglePostVisibility = useTogglePostVisibility();
  const { toast } = useToast();

  const handleDeletePost = async () => {
    try {
      await deletePost.mutateAsync(post.id);
      toast({
        title: "Post Deleted",
        description: "Your post has been successfully deleted.",
      });
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async () => {
    const newVisibility = post.is_public ? "private" : "public";
    try {
      await togglePostVisibility.mutateAsync({
        postId: post.id,
      });
      toast({
        title: "Visibility Updated",
        description: `Post is now ${newVisibility}.`,
      });
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update post visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setShowEditModal(true)}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Post
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowVisibilityAlert(true)}
            className="cursor-pointer"
          >
            {post.is_public ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {post.is_public ? "Make Private" : "Make Public"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteAlert(true)}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              post and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Visibility Confirmation Dialog */}
      <AlertDialog
        open={showVisibilityAlert}
        onOpenChange={setShowVisibilityAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Visibility Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to make this post
              {post.is_public ? " private" : " public"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleVisibility}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <EditPostModal
        post={post}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
}
