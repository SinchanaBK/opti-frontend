"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usersApi } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/utils";
import type { User, UserCreate } from "@/types";
import { Plus, Trash2, X, ShieldAlert, Search, Crown, UserIcon } from "lucide-react";

function AddModal({ token, onClose, onSaved }: { token:string; onClose:()=>void; onSaved:()=>void }) {
  const [form, setForm] = useState<UserCreate>({ full_name:'', email:'', password:'', role_id:2 });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof UserCreate, v: any) => setForm(p=>({...p,[k]:v}));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr('');
    try { await usersApi.create(form, token); onSaved(); onClose(); }
    catch(e:any) { setErr(e.message); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md animate-fade-in rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add New User</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X className="h-4 w-4"/></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Full Name</label><input value={form.full_name} onChange={e=>set('full_name',e.target.value)} required placeholder="Jane Doe" className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"/></div>
          <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} required placeholder="jane@opti.com" className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"/></div>
          <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label><input type="password" value={form.password} onChange={e=>set('password',e.target.value)} required minLength={6} placeholder="Min 6 characters" className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"/></div>
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Role</label>
            <div className="grid grid-cols-2 gap-3">
              {[{id:1,name:'Admin',desc:'Full access',Icon:Crown},{id:2,name:'Employee',desc:'View own gear',Icon:UserIcon}].map(r=>(
                <button key={r.id} type="button" onClick={()=>set('role_id',r.id)} className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all ${form.role_id===r.id?'border-primary bg-primary/5':'border-border hover:border-muted-foreground/30'}`}>
                  <div className="flex items-center gap-2"><r.Icon className={`h-4 w-4 ${form.role_id===r.id?'text-primary':'text-muted-foreground'}`}/><span className="text-sm font-semibold">{r.name}</span></div>
                  <span className="text-xs text-muted-foreground">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{saving?'Creating…':'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { token, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);

  async function load() {
    if (!token) return;
    setLoading(true);
    try { setUsers(await usersApi.getAll(token)); } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); },[token]);

  if (!hasPermission('manage:users')) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <ShieldAlert className="mb-4 h-16 w-16 text-destructive/40"/>
      <h2 className="text-xl font-semibold">Access Denied</h2>
      <p className="mt-2 text-muted-foreground">You don't have permission to manage users.</p>
    </div>
  );

  const filtered = users.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const AVATAR_COLORS: Record<string,{bg:string,color:string}> = {
    'Opti Admin':    {bg:'#1e3a8a', color:'#93c5fd'},
    'Alice Johnson': {bg:'#0c4a6e', color:'#7dd3fc'},
    'Bob Martinez':  {bg:'#134e4a', color:'#5eead4'},
    'Carol White':   {bg:'#4a044e', color:'#d8b4fe'},
  };
  function avStyle(name:string) {
    return AVATAR_COLORS[name] || {bg:'#1e3a5f', color:'#60a5fa'};
  }

  async function handleDelete(id:number, name:string) {
    if (!token || !confirm(`Delete "${name}"?`)) return;
    await usersApi.delete(id, token); load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Manage Users</h1><p className="text-sm text-muted-foreground">{users.length} registered users</p></div>
        <button onClick={()=>setModal(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4"/>Add User</button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {label:'Total Users', value:users.length},
          {label:'Admins',      value:users.filter(u=>u.role.name==='Admin').length},
          {label:'Employees',   value:users.filter(u=>u.role.name==='Employee').length},
          {label:'Active',      value:users.filter(u=>u.is_active).length},
        ].map(s=>(
          <div key={s.label} className="stat-card"><div className="text-2xl font-bold">{s.value}</div><div className="mt-1 text-xs text-muted-foreground">{s.label}</div></div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
        <input placeholder="Search users…" value={search} onChange={e=>setSearch(e.target.value)} className="w-full rounded-xl border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"/>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:4}).map((_,i)=><div key={i} className="h-40 animate-pulse rounded-xl bg-muted"/>)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(u=>{
            const av = avStyle(u.full_name);
            return (
              <div key={u.id} className="group relative rounded-2xl border bg-card p-5 transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold" style={{background:av.bg, color:av.color}}>{getInitials(u.full_name)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{u.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={u.role.name==='Admin'?'badge-admin':'badge-employee'}>{u.role.name==='Admin'?'Admin':'Employee'}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.is_active?'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400':'bg-red-100 text-red-700'}`}>{u.is_active?'Active':'Inactive'}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground/60">Joined {formatDate(u.created_at)}</p>
                  </div>
                  <button onClick={()=>handleDelete(u.id,u.full_name)} className="ml-1 flex-shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5"/></button>
                </div>
                <div className="mt-3 border-t pt-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {u.role.permissions.map(p=><span key={p.id} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{p.name}</span>)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {modal && token && <AddModal token={token} onClose={()=>setModal(false)} onSaved={load}/>}
    </div>
  );
}
