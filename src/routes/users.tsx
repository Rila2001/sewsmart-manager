import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PermissionGate } from "@/components/gsms/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGsms } from "@/lib/gsms/store";
import type { Role } from "@/lib/gsms/types";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "User Management — GSMS" },
      {
        name: "description",
        content: "Create, update and deactivate GSMS store users across Admin, Manager and Technical Lead roles.",
      },
      { property: "og:title", content: "User Management — GSMS" },
      { property: "og:description", content: "Manage GSMS maintenance store users and roles." },
    ],
  }),
  component: UsersRoute,
});

const BLANK = {
  name: "",
  email: "",
  role: "Technical Lead" as Role,
  department: "",
  active: true,
};

function UsersRoute() {
  const { state, addUser, updateUser, deleteUser, currentUser } = useGsms();
  const [form, setForm] = useState<typeof BLANK | null>(null);
  const [remove, setRemove] = useState<string | null>(null);

  return (
    <AppShell
      title="User Management"
      subtitle={`${state.users.length} people with store access`}
      actions={
        <Button onClick={() => setForm({ ...BLANK })}>
          <Plus className="mr-2 h-4 w-4" /> Add user
        </Button>
      }
    >
      <PermissionGate adminOnly>
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["User", "Role", "Department", "Assigned parts", "Active", ""].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.email} · {u.id}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary">{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.department}</td>
                  <td className="px-5 py-3">
                    {state.products.filter((p) => p.assignment?.userId === u.id).length}
                  </td>
                  <td className="px-5 py-3">
                    <Switch
                      checked={u.active}
                      aria-label={`Toggle ${u.name}`}
                      disabled={u.id === currentUser?.id}
                      onCheckedChange={(v) => {
                        updateUser(u.id, { active: v });
                        toast.success(`${u.name} ${v ? "activated" : "deactivated"}`);
                      }}
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      aria-label={`Remove ${u.name}`}
                      disabled={u.id === currentUser?.id}
                      onClick={() => setRemove(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add user</DialogTitle>
              <DialogDescription>Grant a colleague access to the maintenance store.</DialogDescription>
            </DialogHeader>
            {form && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="u-name">Full name</Label>
                  <Input
                    id="u-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-email">Email</Label>
                  <Input
                    id="u-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v) => setForm({ ...form, role: v as Role })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="u-dept">Department / line</Label>
                    <Input
                      id="u-dept"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setForm(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!form?.name.trim() || !form.email.trim()) {
                    toast.error("Name and email are required");
                    return;
                  }
                  addUser(form);
                  toast.success(`${form.name} added`);
                  setForm(null);
                }}
              >
                Add user
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={Boolean(remove)} onOpenChange={(o) => !o && setRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this user?</AlertDialogTitle>
              <AlertDialogDescription>
                Any parts assigned to them will be returned to the unassigned pool.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!remove) return;
                  deleteUser(remove);
                  toast.success("User removed");
                  setRemove(null);
                }}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PermissionGate>
    </AppShell>
  );
}