"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const TITLES: Record<string,string> = {
  "/dashboard":"Overview",
  "/dashboard/assets":"Inventory",
  "/dashboard/users":"Manage Users",
  "/dashboard/my-gear":"My Assets",
  "/dashboard/settings":"Settings",
};

export function TopBar({ onMenuClick }: { onMenuClick:()=>void }) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-5">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="rounded-lg p-2 hover:bg-muted"><Menu className="h-5 w-5"/></button>
        <div>
          <h1 className="text-base font-bold">{TITLES[pathname]??"Dashboard"}</h1>
          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle/>
        <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
            style={{background:isAdmin?"#1e3a8a":"#0c4a6e", color:isAdmin?"#93c5fd":"#7dd3fc"}}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground">{user?.role?.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
