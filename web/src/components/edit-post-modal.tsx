import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useEditPost, type Post } from "../hooks/use-posts";

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export const EditPostModal = ({ post, isOpen, onClose }: EditPostModalProps) => {
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description || "");
  const [isPublic, setIsPublic] = useState(post.is_public);

  const editPostMutation = useEditPost();

  useEffect(() => {
    setTitle(post.title);
    setDescription(post.description || "");
    setIsPublic(post.is_public);
  }, [post]);

  const handleSubmit = async () => {
    await editPostMutation.mutateAsync({
      postId: post.id,
      data: { title, description, is_public: isPublic },
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is-public" className="text-right">
              Public
            </Label>
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={editPostMutation.isPending}>
            {editPostMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
