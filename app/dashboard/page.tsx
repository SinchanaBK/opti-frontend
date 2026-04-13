"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { dashboardApi, assetsApi } from "@/lib/api";
import { formatCurrency, formatDate, statusClass } from "@/lib/utils";
import type { DashboardStats, Asset } from "@/types";
import { Boxes, Users, DollarSign, CheckCircle2, Package, AlertCircle, Clock, TrendingUp } from "lucide-react";

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 rounded-2xl bg-muted" />
      <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">{Array.from({length:6}).map((_,i)=><div key={i} className="h-28 rounded-xl bg-muted"/>)}</div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );
}

function AdminDash({ token }: { token: string }) {
  const [stats,  setStats]  = useState<DashboardStats | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.getStats(token), assetsApi.getAll(token)])
      .then(([s, a]) => { setStats(s); setAssets(a.slice(0, 6)); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Skeleton />;

  const cards = [
    { label: "Total Assets",   value: stats?.total_assets    ?? 0,                       icon: Boxes,        bg: "bg-blue-500/10",   ic: "text-blue-500" },
    { label: "Assigned",       value: stats?.assigned_assets ?? 0,                       icon: CheckCircle2, bg: "bg-emerald-500/10",ic: "text-emerald-500" },
    { label: "Available",      value: stats?.available_assets?? 0,                       icon: Package,      bg: "bg-amber-500/10",  ic: "text-amber-500" },
    { label: "Total Users",    value: stats?.total_users     ?? 0,                       icon: Users,        bg: "bg-violet-500/10", ic: "text-violet-500" },
    { label: "Fleet Value",    value: formatCurrency(stats?.total_value ?? 0),            icon: DollarSign,   bg: "bg-rose-500/10",   ic: "text-rose-500", isText: true },
    { label: "Retired",        value: stats?.retired_assets  ?? 0,                       icon: AlertCircle,  bg: "bg-slate-500/10",  ic: "text-slate-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-7 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100/80">Welcome back,</p>
          <h2 className="mt-1 text-3xl font-bold">Admin Dashboard</h2>
          <p className="mt-2 max-w-md text-sm text-blue-100/70">Full system visibility. Manage inventory, users, and all asset operations.</p>
        </div>
        <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 right-16 h-24 w-24 rounded-full bg-white/5" />
        <span className="absolute right-6 top-6 badge-admin px-4 py-1.5 text-base">Admin</span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="stat-card">
              <div className={`mb-3 inline-flex rounded-lg p-2 ${c.bg}`}><Icon className={`h-4 w-4 ${c.ic}`} /></div>
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <h3 className="font-semibold">Recent Assets</h3>
          <a href="/dashboard/assets" className="text-xs font-medium text-primary hover:underline">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/40">{["Asset","Tag","Category","Status","Value","Assigned To"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {assets.map(a=>(
                <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold">{a.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.asset_tag}</td>
                  <td className="px-4 py-3"><span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{a.category}</span></td>
                  <td className="px-4 py-3"><span className={statusClass(a.status)}>{a.status}</span></td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(a.value)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.assigned_user?.full_name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmployeeDash({ token, name }: { token: string; name: string }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { assetsApi.getMy(token).then(setAssets).finally(()=>setLoading(false)); }, [token]);
  if (loading) return <Skeleton />;
  const total = assets.reduce((s,a)=>s+a.value,0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-700 p-7 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm text-blue-100/80">Hello,</p>
          <h2 className="mt-1 text-3xl font-bold">{name}</h2>
          <p className="mt-2 text-sm text-blue-100/70">Here's your assigned equipment. Contact your admin for any changes.</p>
        </div>
        <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/5" />
        <span className="absolute right-6 top-6 badge-employee px-4 py-1.5 text-base">Employee</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label:"Items Assigned",       value: assets.length,             icon: Boxes,       bg:"bg-blue-500/10",  ic:"text-blue-500" },
          { label:"Total Value in Care",  value: formatCurrency(total),     icon: DollarSign,  bg:"bg-emerald-500/10",ic:"text-emerald-500", isText:true },
          { label:"Active Assignments",   value: assets.filter(a=>a.status==="assigned").length, icon: Clock, bg:"bg-amber-500/10",ic:"text-amber-500" },
        ].map(c=>{
          const Icon=c.icon;
          return <div key={c.label} className="stat-card"><div className={`mb-3 inline-flex rounded-lg p-2 ${c.bg}`}><Icon className={`h-4 w-4 ${c.ic}`}/></div><div className="text-2xl font-bold">{c.value}</div><div className="mt-0.5 text-xs text-muted-foreground">{c.label}</div></div>;
        })}
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="border-b p-5"><h3 className="font-semibold">My Assigned Gear</h3></div>
        {assets.length===0
          ? <div className="flex flex-col items-center py-16 text-muted-foreground"><Package className="mb-3 h-10 w-10 opacity-30"/><p>No assets assigned yet.</p></div>
          : <div className="grid gap-3 p-5 sm:grid-cols-2">{assets.map(a=>(
              <div key={a.id} className="flex items-start gap-4 rounded-xl border bg-muted/20 p-4 hover:bg-muted/40 transition-colors">
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary"/></div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.asset_tag} · {a.category}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={statusClass(a.status)}>{a.status}</span>
                    <span className="text-xs font-medium text-muted-foreground">{formatCurrency(a.value)}</span>
                  </div>
                </div>
              </div>
            ))}</div>
        }
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, token, isAdmin } = useAuth();
  if (!token || !user) return null;
  return isAdmin ? <AdminDash token={token} /> : <EmployeeDash token={token} name={user.full_name} />;
}
