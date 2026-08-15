import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, UserCog, Wrench } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PermissionGate } from "@/components/gsms/AppShell";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useGsms } from "@/lib/gsms/store";
import { PERMISSIONS, PERMISSION_LABELS, type Role } from "@/lib/gsms/types";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — GSMS" },
      {
        name: "description",
        content:
          "Configure granular GSMS permissions for Manager and Technical Lead roles with instant effect across the app.",
      },
      { property: "og:title", content: "Roles & Permissions — GSMS" },
      { property: "og:description", content: "Granular role-based access control for GSMS." },
    ],
  }),
  component: RolesRoute,
});

const ROLE_META: Record<Role, { icon: typeof ShieldCheck; blurb: string }> = {
  Admin: { icon: ShieldCheck, blurb: "Full, non-editable system control" },
  Manager: { icon: UserCog, blurb: "Supervises stock and assignments" },
  "Technical Lead": { icon: Wrench, blurb: "Works with parts on the floor" },
};

function RolesRoute() {
  const { state, permissionsFor, togglePermission, currentUser } = useGsms();
  const roles: Role[] = ["Admin", "Manager", "Technical Lead"];

  return (
    <AppShell title="Roles & Permissions" subtitle="Control what each role can access">
      <PermissionGate adminOnly>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => {
              const meta = ROLE_META[role];
              const granted = Object.values(permissionsFor(role)).filter(Boolean).length;
              return (
                <div key={role} className="surface-card p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <meta.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{role}</p>
                      <p className="text-xs text-muted-foreground">{meta.blurb}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {state.users.filter((u) => u.role === role).length} users
                    </span>
                    <Badge variant="secondary">
                      {granted}/{PERMISSIONS.length} permissions
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="surface-card overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 font-medium text-muted-foreground">Permission</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Admin</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Manager</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Technical Lead</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((permission) => (
                  <tr key={permission} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium">{PERMISSION_LABELS[permission]}</td>
                    <td className="px-5 py-3">
                      <Switch checked disabled aria-label={`Admin ${permission}`} />
                    </td>
                    {(["Manager", "Technical Lead"] as const).map((role) => (
                      <td key={role} className="px-5 py-3">
                        <Switch
                          checked={state.permissions[role][permission]}
                          aria-label={`${role} ${permission}`}
                          onCheckedChange={(value) => {
                            togglePermission(role, permission, value);
                            toast.success(
                              `${PERMISSION_LABELS[permission]} ${value ? "enabled" : "disabled"} for ${role}`,
                            );
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Changes apply immediately. You are signed in as {currentUser?.name} (Admin), so your own
            access always stays complete.
          </p>
        </div>
      </PermissionGate>
    </AppShell>
  );
}