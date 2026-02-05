import { useState } from "react";
import { UserProfile } from "../components/user-profile";
import { useAuthStore } from "../stores/auth-store";
import { Skeleton } from "../components/ui/skeleton";
import { useFollowToggle, useUserProfile } from "../hooks/use-user-profile";
import { EditProfileModal } from "../components/edit-profile-modal";
import { useSearchParams } from "react-router";

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");
  const followToggleMutation = useFollowToggle(); // Initialize the hook

  const { user } = useAuthStore();
  const {
    data: profileData,
    isLoading: loading,
    isError,
  } = useUserProfile(userId || user?.user_id);

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-background">
        <main className="p-6 max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-8 w-full mt-4" />
          <div className="grid grid-cols-3 gap-1 p-1 mt-4">
            <Skeleton className="aspect-square" />
            <Skeleton className="aspect-square" />
            <Skeleton className="aspect-square" />
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Could not load profile.</p>
      </div>
    );
  }

  const formattedUser = {
    id: profileData.user_id,
    username: profileData.username,
    name: profileData.full_name,
    avatar: profileData.avatar_url,
    bio: profileData.bio,
    followers: profileData.followers_count,
    following: profileData.following_count,
    postsCount: profileData.posts_count,
    isOwnProfile: user?.user_id === profileData.user_id,
    isFollowing: profileData.is_following, // Pass isFollowing prop
  };

  const handleFollowToggle = async (userId: string | number) => {
    try {
      await followToggleMutation.mutateAsync(userId as string);
    } catch (error) {
      console.error("Failed to toggle follow status:", error);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Profile Content */}
      <main className="pb-20">
        <UserProfile
          user={formattedUser}
          onEditProfileClick={() => setIsEditModalOpen(true)}
          onFollowToggle={handleFollowToggle} // Pass the handler
        />
      </main>

      {profileData && (
        <EditProfileModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          user={formattedUser}
        />
      )}
    </div>
  );
}
