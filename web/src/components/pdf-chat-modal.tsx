"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  useChatMessages,
  useSendMessage,
  useDeleteMessage,
} from "../hooks/use-chat";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";

interface PDFChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfTitle?: string;
  pdfId?: string;
}

export function PDFChatModal({
  open,
  onOpenChange,
  pdfTitle,
  pdfId,
}: PDFChatModalProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: messages, isLoading: isLoadingMessages } = useChatMessages(
    pdfId ?? "",
    { enabled: open }
  );
  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage();
  const { mutate: deleteMessage, isPending: isDeletingMessage } =
    useDeleteMessage();

  const allMessages = [
    {
      message_id: "initial-greeting",
      role: "assistant",
      content: `Hello! I'm your AI assistant for "${pdfTitle}". I can help you understand the content, answer questions, and discuss key points from this document. What would you like to know?`,
      timestamp: new Date().toISOString(),
    },
    ...(messages || []),
  ];

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [allMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !pdfId) return;

    sendMessage({ postId: pdfId, query: inputValue.trim() });
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-left">AI Assistant</DialogTitle>
                <p className="text-sm text-muted-foreground truncate">
                  Discussing: {pdfTitle}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {isLoadingMessages ? (
              <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading messages...</span>
                </div>
              </div>
            ) : (
              (allMessages || []).map((message) => (
                <div
                  key={message.message_id}
                  className={cn(
                    "group flex items-center gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {message.role === "user" &&
                    message.message_id !== "initial-greeting" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-500"
                        onClick={() => {
                          if (pdfId) {
                            deleteMessage({
                              postId: pdfId,
                              messageId: message.message_id,
                            });
                          }
                        }}
                        disabled={isDeletingMessage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1 opacity-70",
                        message.role === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {message.role === "assistant" &&
                    message.message_id !== "initial-greeting" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-500"
                        onClick={() => {
                          if (pdfId) {
                            deleteMessage({
                              postId: pdfId,
                              messageId: message.message_id,
                            });
                          }
                        }}
                        disabled={isDeletingMessage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              ))
            )}

            {isSendingMessage && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask about this PDF..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSendingMessage}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isSendingMessage}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
