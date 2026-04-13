# Opti Asset Management — Next.js Frontend

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set API URL
cp .env.example .env.local
# Edit .env.local → NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Run dev server
npm run dev
```

App is live at: **http://localhost:3000**

## Login Credentials (after seeding backend)

| Role     | Email              | Password  |
|----------|--------------------|-----------|
| Admin    | admin@opti.com     | admin123  |
| Employee | alice@opti.com     | alice123  |
| Employee | bob@opti.com       | bob123    |

## Project Structure

```
app/
  layout.tsx                    Root layout (ThemeProvider + AuthProvider)
  page.tsx                      Redirect → /login or /dashboard
  login/page.tsx                Clean login form (no demo accounts)
  dashboard/
    layout.tsx                  Protected layout (Sidebar + TopBar)
    page.tsx                    Role-aware dashboard
    assets/page.tsx             Full CRUD inventory  (Admin only)
    users/page.tsx              User management      (Admin only)
    my-gear/page.tsx            Employee asset view
    settings/page.tsx           Profile + theme switcher

components/
  sidebar.tsx                   RBAC-aware navigation ← key component
  top-bar.tsx                   Header with theme toggle
  theme-toggle.tsx / theme-provider.tsx
  ui/                           Shadcn UI primitives

lib/
  auth-context.tsx              Auth state (token, user, permissions[])
  api.ts                        Typed API client
  utils.ts                      cn(), formatCurrency(), statusClass()

types/index.ts                  Shared TypeScript interfaces
```

## RBAC — How the Sidebar Works

```tsx
const NAV = [
  { label: "Dashboard",    href: "/dashboard" },
  { label: "My Assets",    href: "/dashboard/my-gear",  privilege: "view:my_gear" },
  { label: "Inventory",    href: "/dashboard/assets",   privilege: "view:inventory" },
  { label: "Manage Users", href: "/dashboard/users",    privilege: "manage:users" },
];

// Only show items the logged-in user has privilege for:
const visible = NAV.filter(n => n.privilege ? hasPermission(n.privilege) : true);
```
