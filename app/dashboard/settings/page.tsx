"use client";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "next-themes";
import { formatDate, getInitials } from "@/lib/utils";
import { Sun, Moon, ShieldCheck, Mail, UserIcon, Key, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  if (!user) return null;
  const av = isAdmin ? {bg:'#1e3a8a',color:'#93c5fd'} : {bg:'#0c4a6e',color:'#7dd3fc'};

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-5 font-semibold">Account Profile</h2>
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-bold" style={{background:av.bg,color:av.color}}>{getInitials(user.full_name)}</div>
          <div className="space-y-3 flex-1">
            {[
              {icon:UserIcon, label:'Full Name', value:user.full_name},
              {icon:Mail,     label:'Email',     value:user.email},
              {icon:Key,      label:'Member Since', value:formatDate(user.created_at)},
            ].map(r=>( <div key={r.label} className="flex items-center gap-3"><r.icon className="h-4 w-4 text-muted-foreground"/><div><p className="text-xs text-muted-foreground">{r.label}</p><p className="font-medium text-sm">{r.value}</p></div></div> ))}
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-muted-foreground"/>
              <div><p className="text-xs text-muted-foreground">Role</p><span className={isAdmin?'badge-admin':'badge-employee'}>{isAdmin?'Admin':'Employee'}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-1 font-semibold">Your Permissions</h2>
        <p className="mb-4 text-xs text-muted-foreground">Privileges granted to the <strong>{user.role.name}</strong> role</p>
        <div className="grid grid-cols-2 gap-2">
          {user.role.permissions.map(p=>(
            <div key={p.id} className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500"/>
              <span className="font-mono text-xs">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-1 font-semibold">Appearance</h2>
        <p className="mb-4 text-xs text-muted-foreground">Choose your preferred color theme</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {value:'light', label:'Light Mode', sub:'Bright & clean', Icon:Sun,  bg:'#fef9c3', ic:'text-amber-500'},
            {value:'dark',  label:'Dark Mode',  sub:'Easy on the eyes', Icon:Moon, bg:'#1e293b', ic:'text-slate-300'},
          ].map(t=>(
            <button key={t.value} onClick={()=>setTheme(t.value)} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${theme===t.value?'border-primary bg-primary/5':'border-border hover:border-muted-foreground/30'}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{background:t.bg}}><t.Icon className={`h-5 w-5 ${t.ic}`}/></div>
              <div><p className="text-sm font-semibold">{t.label}</p><p className="text-xs text-muted-foreground">{t.sub}</p></div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-destructive/20 bg-card p-6">
        <h2 className="mb-1 font-semibold text-destructive">Sign Out</h2>
        <p className="mb-4 text-xs text-muted-foreground">End your current session</p>
        <button onClick={logout} className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
          <LogOut className="h-4 w-4"/>Sign out of Opti
        </button>
      </div>
    </div>
  );
}
