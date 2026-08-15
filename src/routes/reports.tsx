import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, PermissionGate } from "@/components/gsms/AppShell";
import { StockBadge } from "@/components/gsms/StockBadge";
import { useGsms, useStats } from "@/lib/gsms/store";
import { stockStatus } from "@/lib/gsms/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — GSMS Stock & Assignment Analytics" },
      {
        name: "description",
        content:
          "Analyse spare-part stock health, assignment coverage and consumption trends across the GSMS maintenance store.",
      },
      { property: "og:title", content: "Reports — GSMS Stock & Assignment Analytics" },
      { property: "og:description", content: "Stock health and assignment analytics for GSMS." },
    ],
  }),
  component: ReportsRoute,
});

function ReportsRoute() {
  const { state } = useGsms();
  const stats = useStats();

  const byProduct = state.products.map((p) => ({
    name: p.name,
    stock: p.quantity,
    assigned: p.assignment ? 1 : 0,
  }));

  const trend = Array.from({ length: 6 }).map((_, i) => {
    const base = stats.totalStock;
    return {
      month: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"][i],
      stock: Math.max(0, base - (5 - i) * 2),
      issued: (5 - i) * 2,
    };
  });

  return (
    <AppShell title="Reports" subtitle="Stock health and assignment analytics">
      <PermissionGate permission="view_reports">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { k: "Total stock", v: stats.totalStock },
              { k: "Assignment coverage", v: `${Math.round((stats.assigned / Math.max(1, stats.totalProducts)) * 100)}%` },
              { k: "Low stock items", v: stats.lowStock },
              { k: "Out of stock", v: stats.outOfStock },
            ].map((c) => (
              <div key={c.k} className="surface-card p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">{c.k}</p>
                <p className="mt-2 text-2xl font-bold">{c.v}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card p-5">
              <h2 className="mb-4 font-semibold">Stock levels</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byProduct} margin={{ left: -20 }}>
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
                    <Bar dataKey="stock" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="surface-card p-5">
              <h2 className="mb-4 font-semibold">Stock vs issued (indicative)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="stock" stroke="var(--primary)" strokeWidth={2} />
                    <Line type="monotone" dataKey="issued" stroke="var(--warning)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="surface-card overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Product", "ID", "Quantity", "Status", "Assigned to"].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.id}</td>
                    <td className="px-5 py-3">{p.quantity}</td>
                    <td className="px-5 py-3">
                      <StockBadge qty={p.quantity} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {p.assignment ? `${p.assignment.userName} (${p.assignment.role})` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!state.products.length && (
              <p className="p-10 text-center text-sm text-muted-foreground">
                Nothing to report yet — add a product first ({stockStatus(0)}).
              </p>
            )}
          </div>
        </div>
      </PermissionGate>
    </AppShell>
  );
}