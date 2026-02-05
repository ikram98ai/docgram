import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import { type Post } from "./use-posts";

interface User {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following?: boolean; // Optional, only for other users' profiles
}

export const useUserProfile = (userId: string | undefined) => {
  return useQuery<User>({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}/profile`);
      return response.data;
    },
    enabled: !!userId,
  });
};

interface UpdateProfileData {
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_file?: File;
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const formData = new FormData();

      // Always use FormData to handle both file and text data
      if (data.avatar_file) {
        formData.append("avatar_file", data.avatar_file);
      }

      // Create update_data object for text fields
      const updateData: { [key: string]: any } = {};
      if (data.username) updateData.username = data.username;
      if (data.first_name) updateData.first_name = data.first_name;
      if (data.last_name) updateData.last_name = data.last_name;
      if (data.bio) updateData.bio = data.bio;

      // Add update_data as JSON string to FormData if there are text updates
      if (Object.keys(updateData).length > 0) {
        formData.append("update_data", JSON.stringify(updateData));
      }

      const response = await apiClient.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", data.user_id],
      });
    },
  });
};

interface FollowToggleResponse {
  following: boolean;
  followers_count: number;
  following_count: number;
}

export function useFollowToggle() {
  const queryClient = useQueryClient();

  return useMutation<FollowToggleResponse, Error, string>({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post(`/users/${userId}/follow`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export const useUserPosts = (
  userId: string,
  options: { enabled?: boolean; offset?: number; limit?: number } = {}
) => {
  const { enabled = true, offset = 0, limit = 20 } = options;
  return useQuery<Post[]>({
    queryKey: ["userProfilePosts", userId, offset, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}/posts`, {
        params: { offset, limit },
      });
      return response.data;
    },
    enabled: enabled && !!userId,
  });
};

export const useBookmarks = (
  userId: string,
  options: { enabled?: boolean; offset?: number; limit?: number } = {}
) => {
  const { enabled = true, offset = 0, limit = 20 } = options;
  return useQuery<Post[], Error>({
    queryKey: ["bookmarks", userId, offset, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}/bookmarks`, {
        params: { offset, limit },
      });
      return response.data;
    },
    enabled: enabled && !!userId,
  });
};
