"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Settings,
  UserPlus,
  UserCheck,
  Grid3X3,
  Bookmark,
  FileText,
  LogOut,
} from "lucide-react";
import { useBookmarks } from "../hooks/use-user-profile";
import { type Post } from "../hooks/use-posts";
import { Skeleton } from "./ui/skeleton";
import { MoreMenu } from "./more-menu";
import { useUserPosts } from "../hooks/use-user-profile";
import { ScrollArea } from "./ui/scroll-area";
import { useAuthStore } from "../stores/auth-store";

interface UserProfileProps {
  user: {
    id: string | number;
    username: string;
    name: string;
    avatar?: string;
    bio?: string;
    followers: number;
    following: number;
    postsCount: number;
    isFollowing?: boolean;
    isOwnProfile?: boolean;
  };
  onFollowToggle?: (userId: string | number) => void;
  onPostClick?: (post: any) => void;
  onEditProfileClick?: () => void;
}

export function UserProfile({
  user,
  onFollowToggle,
  onPostClick,
  onEditProfileClick,
}: UserProfileProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [activeTab, setActiveTab] = useState("posts");
  const { logout } = useAuthStore();
  const {
    data: savedPosts,
    isLoading,
    isError,
  } = useBookmarks(user.id as string, { enabled: activeTab === "saved" });

  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isPostError,
  } = useUserPosts(user.id as string);

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
    onFollowToggle?.(user.id);
  };

  const renderPostGrid = (postsToRender: Post[]) => {
    return (
      <div className="grid grid-cols-3 gap-1 p-1">
        {postsToRender.map((post) => (
          <Card
            key={post.id}
            className="aspect-auto overflow-hidden border-0 hover:opacity-80 transition-opacity"
            onClick={() => onPostClick?.(post)}
          >
            <CardContent className="p-0 h-full relative">
              <img
                src={post.thumbnail_url || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              <div className="absolute top-0 right-2">
                {user.isOwnProfile &&<MoreMenu post={post} /> }
              </div>
              <div className="absolute top-0  py-1">
                <Badge variant="secondary" className="text-xs ">
                  <FileText className="h-3 w-3 mr-1" />
                  {post.page_count}
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs font-medium truncate">
                  {post.title}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Profile Header */}
      <div className="p-6 space-y-4 relative">
        {user.isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => logout()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
            />
            <AvatarFallback className="text-lg">
              {user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {user.username}
              </h1>
              <p className="text-sm text-muted-foreground">{user.name}</p>
            </div>

            {user.isOwnProfile ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={onEditProfileClick}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className="w-full"
                onClick={handleFollowClick}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Bio */}

        {user.bio && (
          <ScrollArea>
            <p className="text-sm text-foreground max-h-20">{user.bio}</p>
          </ScrollArea>
        )}

        {/* Stats */}
        <div className="flex justify-around py-2 border-t border-b border-border">
          <div className="text-center">
            <p className="font-semibold text-foreground">{user.postsCount}</p>
            <p className="text-xs text-muted-foreground">posts</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">
              {user.followers.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">followers</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">
              {user.following.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">following</p>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs
        defaultValue="posts"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Posts
          </TabsTrigger>
         {user.isOwnProfile && <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved
          </TabsTrigger>}
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {isPostLoading ? (
            <div className="grid grid-cols-3 gap-1 p-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square" />
              ))}
            </div>
          ) : isPostError ? (
            <div className="text-center py-12 text-red-500">
              <p>Error loading saved posts.</p>
            </div>
          ) : posts && posts.length > 0 ? (
            renderPostGrid(posts)
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}{" "}
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-1 p-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-red-500">
              <p>Error loading saved posts.</p>
            </div>
          ) : savedPosts && savedPosts.length > 0 ? (
            renderPostGrid(savedPosts)
          ) : (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No saved posts yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
