import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PermissionGate } from "@/components/gsms/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { productImage } from "@/lib/gsms/images";

export const Route = createFileRoute("/assign")({
  head: () => ({
    meta: [
      { title: "Assign Product — GSMS Maintenance Store" },
      {
        name: "description",
        content:
          "Assign, reassign or release sewing-machine spare parts to technicians and managers with a full audit trail.",
      },
      { property: "og:title", content: "Assign Product — GSMS Maintenance Store" },
      { property: "og:description", content: "Assign spare parts to technicians in three steps." },
    ],
  }),
  component: AssignRoute,
});

function AssignRoute() {
  const { state, assignProduct, unassignProduct } = useGsms();
  const [productId, setProductId] = useState("");
  const [userId, setUserId] = useState("");
  const [release, setRelease] = useState<string | null>(null);

  const product = state.products.find((p) => p.id === productId) ?? null;
  const user = state.users.find((u) => u.id === userId) ?? null;
  const assigned = state.products.filter((p) => p.assignment);

  return (
    <AppShell title="Assign Product" subtitle="Allocate spare parts to your maintenance team">
      <PermissionGate permission="assign_product">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="surface-card p-6">
            <h2 className="font-semibold">New assignment</h2>
            <p className="text-sm text-muted-foreground">Product → User → Confirm</p>

            <div className="mt-6 space-y-5">
              <Step index={1} label="Select product">
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a spare part" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.quantity} in stock
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Step>

              <Step index={2} label="Select user">
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.users
                      .filter((u) => u.active)
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} — {u.role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Step>

              <Step index={3} label="Confirm assignment">
                {product && user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted p-3 text-sm"
                  >
                    <img
                      src={productImage(product.imageKey)}
                      alt={product.name}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <span className="font-medium">{product.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.name}</span>
                    <Badge variant="secondary">{user.role}</Badge>
                  </motion.div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pick a product and a user to preview the assignment.
                  </p>
                )}
                <Button
                  className="mt-3 w-full"
                  disabled={!product || !user}
                  onClick={() => {
                    if (!product || !user) return;
                    assignProduct(product.id, user.id);
                    toast.success(`${product.name} assigned to ${user.name}`);
                    setProductId("");
                    setUserId("");
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm assignment
                </Button>
              </Step>
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="font-semibold">Current assignments</h2>
            <p className="text-sm text-muted-foreground">
              {assigned.length} of {state.products.length} products allocated
            </p>
            <div className="mt-5 space-y-3">
              {assigned.map((p) => (
                <div key={p.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={productImage(p.imageKey)}
                      alt={p.name}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.assignment!.userName} · {p.assignment!.role}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setRelease(p.id)}
                    >
                      <UserMinus className="mr-1.5 h-3.5 w-3.5" /> Unassign
                    </Button>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Assigned {new Date(p.assignment!.assignedAt).toLocaleString()} by{" "}
                    {p.assignment!.assignedBy}
                  </p>
                </div>
              ))}
              {!assigned.length && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No products are currently assigned.
                </p>
              )}
            </div>
          </div>
        </div>

        <AlertDialog open={Boolean(release)} onOpenChange={(o) => !o && setRelease(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unassign this product?</AlertDialogTitle>
              <AlertDialogDescription>
                The part returns to the unassigned pool and the change is recorded in the activity
                log.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!release) return;
                  unassignProduct(release);
                  toast.success("Product unassigned");
                  setRelease(null);
                }}
              >
                Unassign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PermissionGate>
    </AppShell>
  );
}

function Step({
  index,
  label,
  children,
}: {
  index: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-sm font-medium">{label}</p>
        {children}
      </div>
    </div>
  );
}