"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn, getInitials } from "@/lib/utils";
import { LayoutDashboard, Package, Users, Boxes, Settings, LogOut, TrendingUp, X, ChevronRight, Laptop, Plus } from "lucide-react";

const NAV = [
  { label:"Dashboard",    href:"/dashboard",           icon:LayoutDashboard },
  { label:"My Assets",    href:"/dashboard/my-gear",   icon:Laptop,    privilege:"view:my_gear" },
  { label:"Inventory",    href:"/dashboard/assets",    icon:Boxes,     privilege:"view:inventory" },
  { label:"Manage Users", href:"/dashboard/users",     icon:Users,     privilege:"manage:users" },
];

export function Sidebar({ isOpen, onClose }: { isOpen:boolean; onClose:()=>void }) {
  const pathname = usePathname();
  const { user, hasPermission, logout, isAdmin } = useAuth();
  const visible = NAV.filter(n => n.privilege ? hasPermission(n.privilege) : true);
  const isActive = (href:string) => href==="/dashboard" ? pathname==="/dashboard" : pathname.startsWith(href);

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={onClose}/>}
      <aside className={cn("sidebar fixed inset-y-0 left-0 z-30 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0", isOpen?"translate-x-0":"-translate-x-full")} style={{width:240}}>

        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5" style={{borderBottom:"1px solid hsl(var(--sidebar-border))"}}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
              <TrendingUp className="h-5 w-5 text-white"/>
            </div>
            <div>
              <span className="text-lg font-bold text-white">Opti</span>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{color:"hsl(var(--sidebar-accent))"}}>Asset System</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 lg:hidden" style={{color:"hsl(var(--sidebar-fg))"}}>
            <X className="h-4 w-4"/>
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-4" style={{borderBottom:"1px solid hsl(var(--sidebar-border))"}}>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{background:"hsl(var(--sidebar-muted))"}}>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
              style={{background:isAdmin?"#1e3a8a20":"#0c4a6e20", color:isAdmin?"#93c5fd":"#7dd3fc"}}>
              {user ? getInitials(user.full_name) : "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
              <span className={isAdmin?"badge-admin":"badge-employee"}>{isAdmin?"Admin":"Employee"}</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest" style={{color:"hsl(var(--sidebar-fg) / 0.4)"}}>Navigation</p>
          <ul className="space-y-0.5">
            {visible.map(item=>{
              const Icon=item.icon, active=isActive(item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} className={cn("sb-nav-item group", active&&"active")}>
                    <Icon className="h-4 w-4 flex-shrink-0"/>
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight className="h-3.5 w-3.5 opacity-60"/>}
                  </Link>
                </li>
              );
            })}
          </ul>

          {isAdmin && (
            <>
              <p className="mb-2 mt-5 px-3 text-xs font-semibold uppercase tracking-widest" style={{color:"hsl(39 95% 54% / 0.6)"}}>Admin Zone</p>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/dashboard/assets" className="sb-nav-item">
                    <Plus className="h-4 w-4 flex-shrink-0"/>
                    <span className="flex-1">Add Asset</span>
                  </Link>
                </li>
              </ul>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4" style={{borderTop:"1px solid hsl(var(--sidebar-border))"}}>
          <Link href="/dashboard/settings" className="sb-nav-item">
            <Settings className="h-4 w-4"/><span>Settings</span>
          </Link>
          <button onClick={logout} className="sb-nav-item w-full text-left hover:text-red-400">
            <LogOut className="h-4 w-4"/><span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
