import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "../lib/api-client";

interface User {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: (loadMe: boolean) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      checkAuth: async (loadMe: boolean) => {
        const token = localStorage.getItem("access_token");

        set({ isLoading: false });

        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        if (loadMe === true) {
          try {
            const response = await apiClient.get("/users/me");
            set({
              user: response.data,
              token,
              isAuthenticated: true,
            });
          } catch (error) {
            localStorage.removeItem("access_token");
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
          }
        }
      },

      login: async (username: string, password: string) => {
        const loginData = { username, password };
        const response = await apiClient.post("/login", loginData);

        const { access_token, user } = response.data;
        localStorage.setItem("access_token", access_token);

        set({
          user,
          token: access_token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      register: async (data: RegisterData) => {
        const response = await apiClient.post("/register", data);
        const { access_token, user } = response.data;
        localStorage.setItem("access_token", access_token);

        set({
          user,
          token: access_token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem("access_token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateProfile: async (data: Partial<User>) => {
        const response = await apiClient.put("/users/profile", data);
        set({ user: response.data });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
