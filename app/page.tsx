"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Root() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading) router.replace(token ? "/dashboard" : "/login");
  }, [token, isLoading, router]);
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
