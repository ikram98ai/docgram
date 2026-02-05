import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";

export interface Post {
  id: string;
  user_id: string;
  user: {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  title: string;
  description: string;
  pdf_url: string;
  thumbnail_url: string;
  file_size: number;
  page_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  created_at: string;
  is_public: boolean;
}

export interface Comment {
  comment_id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  user: {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export const usePosts = (offset = 0, limit = 10) => {
  return useQuery({
    queryKey: ["posts", offset, limit],
    queryFn: async () => {
      const response = await apiClient.get(
        `/posts?offset=${offset}&limit=${limit}`
      );
      return response.data;
    },
  });
};

export const useFeed = (offset = 0, limit = 10) => {
  return useQuery({
    queryKey: ["feed", offset, limit],
    queryFn: async () => {
      const response = await apiClient.get(
        `/posts/feed?offset=${offset}&limit=${limit}`
      );
      return response.data;
    },
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await apiClient.get(`/posts/${postId}`);
      return response.data;
    },
    enabled: !!postId,
  });
};

export const useCreatePost = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      pdf_file: File;
      title?: string;
      description?: string;
    }) => {
      const formData = new FormData();
      formData.append("pdf_file", data.pdf_file);
      if (data.title) formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);

      const response = await apiClient.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Post Creating",
        description: data.message || "Your post is being created.",
      });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.post(`/posts/${postId}/like`);
      return response.data;
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries();

      const previousQueries: [any, any][] = [];

      const updater = (old: any) => {
        if (!old) return old;

        const updatePost = (post: Post) => {
          if (post.id === postId) {
            return {
              ...post,
              is_liked: !post.is_liked,
              likes_count: post.is_liked
                ? post.likes_count - 1
                : post.likes_count + 1,
            };
          }
          return post;
        };

        if (Array.isArray(old)) {
          return old.map(updatePost);
        }

        if (typeof old === "object" && old.id === postId) {
          return updatePost(old);
        }

        return old;
      };

      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll();

      for (const query of queries) {
        const queryKey = query.queryKey;
        if (
          queryKey[0] === "posts" ||
          queryKey[0] === "feed" ||
          (queryKey[0] === "post" && queryKey[1] === postId)
        ) {
          const oldData = queryClient.getQueryData(queryKey);
          if (oldData) {
            previousQueries.push([queryKey, oldData]);
            queryClient.setQueryData(queryKey, updater(oldData));
          }
        }
      }

      return { previousQueries };
    },
    onError: (err, _, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      useToast().toast({
        title: "Error",
        description: "An error occurred while liking the post." + String(err),
        variant: "destructive",
      });
    },
    onSettled: (_, error, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      useToast().toast({
        title: error ? "Error" : "Success",
        description: error
          ? "An error occurred while liking the post."
          : "Post like status updated.",
        variant: error ? "destructive" : "default",
      });
    },
  });
};

export const useBookmarkPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.post(`/posts/${postId}/bookmark`);
      return response.data;
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries();

      const previousQueries: [any, any][] = [];

      const updater = (old: any) => {
        if (!old) return old;

        const updatePost = (post: Post) => {
          if (post.id === postId) {
            return {
              ...post,
              is_bookmarked: !post.is_bookmarked,
            };
          }
          return post;
        };

        if (Array.isArray(old)) {
          return old.map(updatePost);
        }

        if (typeof old === "object" && old.id === postId) {
          return updatePost(old);
        }

        return old;
      };

      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll();

      for (const query of queries) {
        const queryKey = query.queryKey;
        if (
          queryKey[0] === "posts" ||
          queryKey[0] === "feed" ||
          (queryKey[0] === "post" && queryKey[1] === postId)
        ) {
          const oldData = queryClient.getQueryData(queryKey);
          if (oldData) {
            previousQueries.push([queryKey, oldData]);
            queryClient.setQueryData(queryKey, updater(oldData));
          }
        }
      }

      return { previousQueries };
    },
    onError: (err, _, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      useToast().toast({
        title: "Error",
        description: "An error occurred while bookmarking the post." + String(err),
        variant: "destructive",
      });
    },
    onSettled: (_, error, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      useToast().toast({
        title: error ? "Error" : "Success",
        description: error
          ? "An error occurred while bookmarking the post."
          : "Post bookmark status updated.",
        variant: error ? "destructive" : "default",
      });
    },
  });
};

import {
  editPost,
  deletePost,
  togglePostVisibility,
} from "../lib/services/post-service";
import { useToast } from "./use-toast";

export const useEditPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      postId,
      data,
    }: {
      postId: string;
      data: {
        title?: string;
        description?: string;
        is_public?: boolean;
      };
    }) => {
      return editPost(postId, data);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post Updated",
        description: `Your post ${postId} has been successfully updated.`,
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      return deletePost(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post Deleted",
        description: `Your post ${postId} has been successfully deleted.`,
        variant: "destructive",
      });
    },
  });
};

export const useTogglePostVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      return togglePostVisibility(postId);
    },
    onMutate: async ({ postId }: { postId: string }) => {
      await queryClient.cancelQueries();

      const previousQueries: [any, any][] = [];

      const updater = (old: any) => {
        if (!old) return old;

        const updatePost = (post: Post) => {
          if (post.id === postId) {
            return {
              ...post,
              is_public: !post.is_public,
            };
          }
          return post;
        };

        if (Array.isArray(old)) {
          return old.map(updatePost);
        }

        if (typeof old === "object" && old.id === postId) {
          return updatePost(old);
        }

        return old;
      };

      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll();

      for (const query of queries) {
        const queryKey = query.queryKey;
        if (
          queryKey[0] === "posts" ||
          queryKey[0] === "feed" ||
          (queryKey[0] === "post" && queryKey[1] === postId)
        ) {
          const oldData = queryClient.getQueryData(queryKey);
          if (oldData) {
            previousQueries.push([queryKey, oldData]);
            queryClient.setQueryData(queryKey, updater(oldData));
          }
        }
      }

      return { previousQueries };
    },
    onError: (err, _, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      useToast().toast({
        title: "Error",
        description: "An error occurred while toggling post visibility." + String(err),
        variant: "destructive",
      });
    },
    onSettled: (_, error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      useToast().toast({
        title: error ? "Error" : "Success",
        description: error
          ? "An error occurred while toggling post visibility."
          : "Post visibility status updated.",
        variant: error ? "destructive" : "default",
      });
    },
  });
};

export const useGetComments = (
  postId: string,
  options: { enabled?: boolean; offset?: number; limit?: number } = {}
) => {
  const { enabled = true, offset = 0, limit = 20 } = options;
  return useQuery<Comment[], Error>({
    queryKey: ["comments", postId, offset, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/posts/${postId}/comments`, {
        params: { offset, limit },
      });
      return response.data;
    },
    enabled: enabled && !!postId,
  });
};

export const useCreateComment = () => {

  return useMutation({
    mutationFn: async (data: { postId: string; content: string }) => {
      const formData = new FormData();
      formData.append("content", data.content);

      const response = await apiClient.post(
        `/posts/${data.postId}/comments`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
  });
};

export const useSearchPosts = (q: string) => {
  return useQuery({
    queryKey: ["posts", "search", q],
    queryFn: async () => {
      const response = await apiClient.get(`/posts/search?q=${q}`);
      return response.data;
    },
    enabled: !!q,
  });
};
