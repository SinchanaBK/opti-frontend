"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AuthState, User } from "@/types";

interface AuthCtx {
  user: User | null; token: string | null; permissions: string[];
  isLoading: boolean; isAdmin: boolean;
  hasPermission: (p: string) => boolean;
  login: (s: AuthState) => void;
  logout: () => void;
}
const Ctx = createContext<AuthCtx | null>(null);
const KEY = "opti_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user,        setUser]        = useState<User | null>(null);
  const [token,       setToken]       = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const s: AuthState = JSON.parse(raw); setUser(s.user); setToken(s.token); setPermissions(s.permissions); }
    } catch { localStorage.removeItem(KEY); }
    finally  { setIsLoading(false); }
  }, []);

  const login = useCallback((s: AuthState) => {
    setUser(s.user); setToken(s.token); setPermissions(s.permissions);
    localStorage.setItem(KEY, JSON.stringify(s));
  }, []);

  const logout = useCallback(() => {
    setUser(null); setToken(null); setPermissions([]);
    localStorage.removeItem(KEY);
    router.push("/login");
  }, [router]);

  const hasPermission = useCallback((p: string) => permissions.includes(p), [permissions]);
  const isAdmin = user?.role?.name === "Admin";

  return (
    <Ctx.Provider value={{ user, token, permissions, isLoading, isAdmin, hasPermission, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
