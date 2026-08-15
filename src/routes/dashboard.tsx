import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Boxes,
  CircleSlash,
  Layers,
  PackageCheck,
  PackageSearch,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, PermissionGate } from "@/components/gsms/AppShell";
import { StockBadge } from "@/components/gsms/StockBadge";
import { useGsms, useStats } from "@/lib/gsms/store";
import { productImage } from "@/lib/gsms/images";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GSMS Maintenance Store" },
      {
        name: "description",
        content:
          "Live overview of spare-part stock, assignments and maintenance activity across the garment factory.",
      },
      { property: "og:title", content: "Dashboard — GSMS Maintenance Store" },
      {
        property: "og:description",
        content: "Live spare-part stock, assignment and activity overview.",
      },
    ],
  }),
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <AppShell title="Dashboard" subtitle="Live overview of the maintenance store">
      <PermissionGate permission="view_dashboard">
        <Dashboard />
      </PermissionGate>
    </AppShell>
  );
}

function Dashboard() {
  const { state } = useGsms();
  const stats = useStats();

  const cards = [
    { label: "Total Products", value: stats.totalProducts, icon: Boxes, tone: "text-primary" },
    { label: "Total Stock", value: stats.totalStock, icon: Layers, tone: "text-primary" },
    { label: "Assigned", value: stats.assigned, icon: PackageCheck, tone: "text-success" },
    { label: "Unassigned", value: stats.unassigned, icon: PackageSearch, tone: "text-muted-foreground" },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, tone: "text-warning" },
    { label: "Out of Stock", value: stats.outOfStock, icon: CircleSlash, tone: "text-destructive" },
  ];

  const chartData = state.products.map((p) => ({ name: p.name, qty: p.quantity }));
  const pieData = [
    { name: "Assigned", value: stats.assigned, fill: "var(--primary)" },
    { name: "Unassigned", value: stats.unassigned, fill: "var(--muted-foreground)" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="surface-card p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {c.label}
              </p>
              <c.icon className={`h-4 w-4 ${c.tone}`} />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">{c.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Stock by product</h2>
              <p className="text-sm text-muted-foreground">Current units available in store</p>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="qty" radius={[6, 6, 0, 0]} fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="font-semibold">Assignment split</h2>
          <p className="text-sm text-muted-foreground">Allocated vs available parts</p>
          <div className="h-56">
            {pieData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={52} outerRadius={82} paddingAngle={3}>
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="pt-16 text-center text-sm text-muted-foreground">No products yet</p>
            )}
          </div>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.fill }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Inventory snapshot</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/products">View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {state.products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <img
                  src={productImage(p.imageKey)}
                  alt={p.name}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-12 w-12 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.id} · {p.assignment ? `Assigned to ${p.assignment.userName}` : "Unassigned"}
                  </p>
                </div>
                <span className="text-sm font-semibold">{p.quantity}</span>
                <StockBadge qty={p.quantity} />
              </div>
            ))}
            {!state.products.length && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No products in the store.
              </p>
            )}
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 font-semibold">Recent activity</h2>
          <ol className="space-y-4">
            {state.activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {a.actor} · {new Date(a.at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}