import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router";
import { useAuthStore } from "../../stores/auth-store";
import { PostCardSkeleton } from "../post-card-skeleton";

interface AuthGuardProps {
  loadMe?: boolean;
}

export function AuthGuard({ loadMe = false }: AuthGuardProps) {
  const { user, isLoading, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
      checkAuth(loadMe);
    
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto space-y-6 p-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Outlet />;
}
