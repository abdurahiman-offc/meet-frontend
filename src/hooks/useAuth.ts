"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { getMe } from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUser = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("meet_token");
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await getMe();
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      localStorage.removeItem("meet_token");
      localStorage.removeItem("meet_user");
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signOut = useCallback(() => {
    localStorage.removeItem("meet_token");
    localStorage.removeItem("meet_user");
    setState({ user: null, isLoading: false, isAuthenticated: false });
    window.location.href = "/login";
  }, []);

  return { ...state, signOut, refetch: loadUser };
}
