"use client";

import { useState } from "react";
import { useLocation, Link } from "react-router";
import { Button } from "./ui/button";
import {
  Plus,
  Home,
  Search,
  Upload,
  Activity,
  User,
} from "lucide-react";
import { PDFUploadModal } from "./pdf-upload-modal";
import { cn } from "../lib/utils";
import { useAuthStore } from "../stores/auth-store";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    // TODO: Refetch posts - this needs to be handled globally
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-foreground">
            Docgram
          </Link>
          {isAuthenticated ? (
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setShowUploadModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Upload PDF
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="rounded-full">
                Login
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto pb-20">{children}</main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <Link to="/" key="feed">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-col gap-1 h-auto py-2",
                  location.pathname === "/" && "bg-accent"
                )}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Feed</span>
              </Button>
            </Link>
            <Link to="/search" key="search">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-col gap-1 h-auto py-2",
                  location.pathname === "/search" && "bg-accent"
                )}
              >
                <Search className="h-5 w-5" />
                <span className="text-xs">Search</span>
              </Button>
            </Link>
            {isAuthenticated ? (
              <Button
                key="upload"
                variant="ghost"
                size="sm"
                className="flex-col gap-1 h-auto py-2"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">Upload</span>
              </Button>
            ) : (
              <Link to="/auth" key="login-nav">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-col gap-1 h-auto py-2"
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs">Login</span>
                </Button>
              </Link>
            )}
            <Button
              key="activity"
              variant="ghost"
              size="sm"
              className="flex-col gap-1 h-auto py-2"
            >
              <Activity className="h-5 w-5" />
              <span className="text-xs">Activity</span>
            </Button>
            <Link to="/profile" key="profile">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-col gap-1 h-auto py-2",
                  location.pathname.startsWith("/profile") && "bg-accent"
                )}
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <PDFUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
