import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";


export const useChatMessages = (
  postId: string,
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["chat-messages", postId],
    queryFn: async () => {
      const response = await apiClient.get(`/posts/${postId}/messages`);
      return response.data;
    },
    enabled: !!postId && enabled,
    // refetchInterval: 2000, // Poll for new messages every 2 seconds
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
    }: {
      postId: string;
      messageId: string;
    }) => {
      const response = await apiClient.delete(`/posts/messages/${messageId}`);
      return response.data;
    },
    onSuccess: ( variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", variables.postId],
      });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      query,
    }: {
      postId: string;
      query: string;
    }) => {
      // Optimistically add user message
      const queryKey = ["chat-messages", postId];
      const userMessage = {
        message_id: `temp-user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKey, (oldData: any) =>
        oldData ? [...oldData, userMessage] : [userMessage]
      );

      const response = await apiClient.post(
        `posts/${postId}/messages`,
        { query },
        { responseType: "stream", adapter: "fetch" }
      );

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      if (!response.data) {
        throw new Error("Response body is missing");
      }

      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      const assistantMessageId = `temp-assistant-${Date.now()}`;
      const assistantMessage = {
        message_id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      // Add a placeholder for the assistant's message
      queryClient.setQueryData(queryKey, (oldData: any) => [
        ...oldData,
        assistantMessage,
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });

        // Update the assistant's message in the cache
        queryClient.setQueryData(queryKey, (oldData: any) => {
          return oldData.map((msg: any) =>
            msg.message_id === assistantMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg
          );
        });
      }
    },
    onError: (error, variables) => {
      console.error("Error sending message:", error);
      // Optionally, remove the optimistic user message on error
      const queryKey = ["chat-messages", variables.postId];
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
