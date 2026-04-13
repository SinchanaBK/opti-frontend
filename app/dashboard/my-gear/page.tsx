"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { assetsApi } from "@/lib/api";
import { formatCurrency, formatDate, statusClass } from "@/lib/utils";
import type { Asset } from "@/types";
import { Package, DollarSign, Calendar, Layers } from "lucide-react";

const ICONS: Record<string, string> = {
  Laptop:'💻', Monitor:'🖥️', Phone:'📱', Keyboard:'⌨️', Headset:'🎧', Furniture:'🪑',
};

export default function MyGearPage() {
  const { token, user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ if(token) assetsApi.getMy(token).then(setAssets).finally(()=>setLoading(false)); },[token]);

  const totalValue = assets.reduce((s,a)=>s+a.value,0);
  const grouped    = assets.reduce<Record<string,Asset[]>>((acc,a)=>{ (acc[a.category]=acc[a.category]||[]).push(a); return acc; }, {});

  if (loading) return <div className="space-y-4">{Array.from({length:3}).map((_,i)=><div key={i} className="h-36 animate-pulse rounded-xl bg-muted"/>)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Gear</h1>
        <p className="text-sm text-muted-foreground">Equipment assigned to {user?.full_name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          {label:'Items Assigned', value:assets.length, icon:Package, bg:'bg-blue-500/10', ic:'text-blue-500'},
          {label:'Total Value',    value:formatCurrency(totalValue), icon:DollarSign, bg:'bg-emerald-500/10', ic:'text-emerald-500', isText:true},
          {label:'Categories',     value:Object.keys(grouped).length, icon:Layers, bg:'bg-violet-500/10', ic:'text-violet-500'},
        ].map(c=>{
          const Icon=c.icon;
          return <div key={c.label} className="stat-card"><div className={`mb-2 inline-flex rounded-lg p-2 ${c.bg}`}><Icon className={`h-4 w-4 ${c.ic}`}/></div><div className="text-2xl font-bold">{c.value}</div><div className="text-xs text-muted-foreground">{c.label}</div></div>;
        })}
      </div>

      {assets.length===0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-20 text-center">
          <Package className="mb-4 h-16 w-16 text-muted-foreground/20"/>
          <h3 className="text-lg font-semibold">No gear assigned yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Contact your administrator to have equipment assigned to you.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items])=>(
          <div key={cat}>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">{ICONS[cat]??'📦'}</span>
              <h2 className="font-semibold">{cat}</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(a=>(
                <div key={a.id} className="overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5">
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-cyan-500"/>
                  <div className="p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div><h3 className="font-semibold">{a.name}</h3><p className="text-xs text-muted-foreground">{a.asset_tag}</p></div>
                      <span className={statusClass(a.status)}>{a.status}</span>
                    </div>
                    {a.description && <p className="mb-4 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>}
                    <div className="space-y-2 border-t pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><DollarSign className="h-3 w-3"/>Value</span>
                        <span className="font-semibold">{formatCurrency(a.value)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="h-3 w-3"/>Added</span>
                        <span>{formatDate(a.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
