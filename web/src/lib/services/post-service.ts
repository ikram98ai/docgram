import apiClient from "../api-client";

export interface Post {
  id: string;
  title: string;
  content: string;
  visibility: "public" | "private";
  // Add other properties as needed based on your backend Post model
}

export const editPost = async (
  postId: string,
  data: { title?: string; description?: string; is_public?: boolean }
): Promise<Post> => {
  const response = await apiClient.put(`/posts/${postId}`, data);
  return response.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/posts/${postId}`);
};

export const togglePostVisibility = async (
  postId: string,
): Promise<Post> => {
  const response = await apiClient.patch(`/posts/${postId}/visibility`);
  return response.data;
};
