"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { assetsApi, usersApi } from "@/lib/api";
import { formatCurrency, statusClass, formatDate } from "@/lib/utils";
import type { Asset, AssetCreate, User } from "@/types";
import { Plus, Search, Trash2, Pencil, X, Package, ShieldAlert } from "lucide-react";

function Modal({ token, users, editing, onClose, onSaved }:
  { token:string; users:User[]; editing:Asset|null; onClose:()=>void; onSaved:()=>void }) {
  const isEdit = !!editing;
  const [form, setForm] = useState<AssetCreate>({
    name: editing?.name??'', asset_tag: editing?.asset_tag??'',
    category: editing?.category??'Laptop', status: editing?.status??'available',
    value: editing?.value??0, description: editing?.description??'',
    assigned_to_id: editing?.assigned_to_id??undefined,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof AssetCreate, v: any) => setForm(p=>({...p,[k]:v}));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      isEdit ? await assetsApi.update(editing!.id, form, token) : await assetsApi.create(form, token);
      onSaved(); onClose();
    } catch(e:any) { setErr(e.message); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-fade-in rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{isEdit?'Edit Asset':'Add New Asset'}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X className="h-4 w-4"/></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Asset Name</label><input value={form.name} onChange={e=>set('name',e.target.value)} required className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"/></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Asset Tag</label><input value={form.asset_tag} onChange={e=>set('asset_tag',e.target.value)} required disabled={isEdit} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
              <select value={form.category} onChange={e=>set('category',e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none">
                {['Laptop','Monitor','Phone','Keyboard','Headset','Furniture','Other'].map(c=><option key={c}>{c}</option>)}
              </select></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
              <select value={form.status} onChange={e=>set('status',e.target.value as any)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none">
                <option value="available">Available</option><option value="assigned">Assigned</option><option value="retired">Retired</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Value ($)</label><input type="number" min={0} step={0.01} value={form.value} onChange={e=>set('value',parseFloat(e.target.value)||0)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"/></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Assign To</label>
              <select value={form.assigned_to_id??''} onChange={e=>set('assigned_to_id',e.target.value?parseInt(e.target.value):undefined)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none">
                <option value="">— Unassigned —</option>
                {users.map(u=><option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select></div>
          </div>
          <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description (optional)</label><input value={form.description??''} onChange={e=>set('description',e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"/></div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {saving?'Saving…':isEdit?'Save Changes':'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const { token, hasPermission } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users,  setUsers]  = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<Asset|null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    try { const [a,u] = await Promise.all([assetsApi.getAll(token), usersApi.getAll(token)]); setAssets(a); setUsers(u); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, [token]);

  if (!hasPermission('view:inventory')) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <ShieldAlert className="mb-4 h-16 w-16 text-destructive/40"/>
      <h2 className="text-xl font-semibold">Access Denied</h2>
      <p className="mt-2 text-muted-foreground">You don't have permission to view the inventory.</p>
    </div>
  );

  const filtered = assets.filter(a => {
    const ms = a.name.toLowerCase().includes(search.toLowerCase()) || a.asset_tag.toLowerCase().includes(search.toLowerCase());
    const mf = filter === 'all' || a.status === filter;
    return ms && mf;
  });

  async function handleDelete(id: number) {
    if (!token || !confirm('Delete this asset?')) return;
    await assetsApi.delete(id, token); load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Asset Inventory</h1><p className="text-sm text-muted-foreground">{assets.length} total assets</p></div>
        {hasPermission('create:asset') && (
          <button onClick={()=>{setEditing(null);setModal(true);}} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4"/>Add Asset
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <input placeholder="Search assets…" value={search} onChange={e=>setSearch(e.target.value)} className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all','available','assigned','retired'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition ${filter===f?'bg-primary text-primary-foreground':'border hover:bg-muted'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">{Array.from({length:6}).map((_,i)=><div key={i} className="h-12 animate-pulse rounded-lg bg-muted"/>)}</div>
        ) : filtered.length===0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground"><Package className="mb-3 h-10 w-10 opacity-30"/><p>No assets found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/40">{['Asset','Tag','Category','Status','Value','Assigned To','Added','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody className="divide-y">
                {filtered.map(a=>(
                  <tr key={a.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold">{a.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.asset_tag}</td>
                    <td className="px-4 py-3"><span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{a.category}</span></td>
                    <td className="px-4 py-3"><span className={statusClass(a.status)}>{a.status}</span></td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(a.value)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.assigned_user?.full_name??'—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(a.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {hasPermission('update:asset') && <button onClick={()=>{setEditing(a);setModal(true);}} className="rounded-lg p-1.5 hover:bg-muted"><Pencil className="h-3.5 w-3.5"/></button>}
                        {hasPermission('delete:asset') && <button onClick={()=>handleDelete(a.id)} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5"/></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && token && <Modal token={token} users={users} editing={editing} onClose={()=>{setModal(false);setEditing(null);}} onSaved={load}/>}
    </div>
  );
}
