import { createFileRoute } from "@tanstack/react-router";
import { Activity as ActivityIcon } from "lucide-react";
import { AppShell, PermissionGate } from "@/components/gsms/AppShell";
import { Badge } from "@/components/ui/badge";
import { useGsms } from "@/lib/gsms/store";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity Log — GSMS Maintenance Store" },
      {
        name: "description",
        content: "Full audit trail of stock updates, assignments and permission changes in GSMS.",
      },
      { property: "og:title", content: "Activity Log — GSMS Maintenance Store" },
      { property: "og:description", content: "Audit trail of every GSMS store action." },
    ],
  }),
  component: ActivityRoute,
});

function ActivityRoute() {
  const { state } = useGsms();
  return (
    <AppShell title="Activity Log" subtitle="Every action recorded in the maintenance store">
      <PermissionGate permission="view_activity">
        <div className="surface-card divide-y divide-border">
          {state.activity.map((a) => (
            <div key={a.id} className="flex flex-wrap items-start gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ActivityIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{a.action}</p>
                <p className="text-sm text-muted-foreground">{a.detail}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.actor} · {new Date(a.at).toLocaleString()}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {a.type}
              </Badge>
            </div>
          ))}
          {!state.activity.length && (
            <p className="p-10 text-center text-sm text-muted-foreground">No activity recorded.</p>
          )}
        </div>
      </PermissionGate>
    </AppShell>
  );
}