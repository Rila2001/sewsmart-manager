import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  UserCog,
  UserPlus,
  X,
} from "lucide-react";
import { useGsms } from "@/lib/gsms/store";
import type { Permission } from "@/lib/gsms/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; icon: typeof Boxes; permission: Permission | null }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "view_dashboard" },
  { to: "/products", label: "Products", icon: Package, permission: "view_products" },
  { to: "/assign", label: "Assign Product", icon: UserPlus, permission: "assign_product" },
  { to: "/roles", label: "Roles & Permissions", icon: ShieldCheck, permission: null },
  { to: "/users", label: "User Management", icon: UserCog, permission: null },
  { to: "/reports", label: "Reports", icon: BarChart3, permission: "view_reports" },
  { to: "/activity", label: "Activity Log", icon: Activity, permission: "view_activity" },
];

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { currentUser, can, logout, ready } = useGsms();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !currentUser) navigate({ to: "/" });
  }, [ready, currentUser, navigate]);

  useEffect(() => setOpen(false), [pathname]);

  if (!ready || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const isAdmin = currentUser.role === "Admin";
  const items = NAV.filter((n) => (n.permission === null ? isAdmin : can(n.permission)));

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "gradient-navy fixed inset-y-0 left-0 z-50 flex w-72 flex-col text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
          <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <Boxes className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-sidebar-accent-foreground">GSMS</p>
            <p className="text-[11px] text-sidebar-foreground/70">Smart Maintenance Store</p>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-sidebar-foreground/70">{currentUser.role}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
              {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {currentUser.role}
            </Badge>
            {actions}
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PermissionGate({
  permission,
  adminOnly,
  children,
}: {
  permission?: Permission;
  adminOnly?: boolean;
  children: ReactNode;
}) {
  const { can, currentUser } = useGsms();
  const allowed = adminOnly ? currentUser?.role === "Admin" : permission ? can(permission) : true;
  if (allowed) return <>{children}</>;
  return (
    <div className="surface-card mx-auto max-w-md p-8 text-center">
      <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">Access restricted</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your role does not have permission for this section. Ask an administrator to enable it in
        Roles &amp; Permissions.
      </p>
      <Button asChild className="mt-5">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}