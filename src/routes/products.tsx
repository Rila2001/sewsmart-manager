import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Minus, PackageOpen, Pencil, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PermissionGate } from "@/components/gsms/AppShell";
import { StockBadge } from "@/components/gsms/StockBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { IMAGE_OPTIONS, productImage } from "@/lib/gsms/images";
import { stockStatus, type Product } from "@/lib/gsms/types";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — GSMS Spare Parts Inventory" },
      {
        name: "description",
        content:
          "Browse, search and manage sewing-machine spare parts: knives, loopers, stock levels and assignments.",
      },
      { property: "og:title", content: "Products — GSMS Spare Parts Inventory" },
      {
        property: "og:description",
        content: "Search, filter and manage GSMS sewing-machine spare parts.",
      },
    ],
  }),
  component: ProductsRoute,
});

const EMPTY = {
  name: "",
  category: "Cutting Blade",
  machine: "Overlock 5-Thread",
  description: "",
  imageKey: IMAGE_OPTIONS[0],
  quantity: 0,
};

function ProductsRoute() {
  const { state, can, addProduct, updateProduct, deleteProduct, setQuantity, assignProduct, unassignProduct } =
    useGsms();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [allocation, setAllocation] = useState("all");
  const [sort, setSort] = useState("name");
  const [form, setForm] = useState<typeof EMPTY | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [details, setDetails] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [assignFor, setAssignFor] = useState<Product | null>(null);
  const [assignUser, setAssignUser] = useState("");

  const filtered = useMemo(() => {
    let list = state.products.filter((p) => {
      const q = query.trim().toLowerCase();
      const matches = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      const st = status === "all" || stockStatus(p.quantity) === status;
      const al =
        allocation === "all" ||
        (allocation === "assigned" ? Boolean(p.assignment) : !p.assignment);
      return matches && st && al;
    });
    list = [...list].sort((a, b) =>
      sort === "stock" ? b.quantity - a.quantity : a.name.localeCompare(b.name),
    );
    return list;
  }, [state.products, query, status, allocation, sort]);

  function saveForm() {
    if (!form?.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (editing) {
      updateProduct(editing.id, { ...form, quantity: Math.max(0, form.quantity) });
      toast.success(`${form.name} updated`);
    } else {
      addProduct({ ...form, quantity: Math.max(0, form.quantity) });
      toast.success(`${form.name} added to the store`);
    }
    setForm(null);
    setEditing(null);
  }

  function adjust(p: Product, delta: number) {
    const next = Math.max(0, p.quantity + delta);
    if (next === p.quantity) {
      toast.error("Stock cannot go below zero");
      return;
    }
    setQuantity(p.id, next);
    toast.success(`${p.name} stock set to ${next}`);
  }

  return (
    <AppShell
      title="Products"
      subtitle={`${state.products.length} spare parts in the maintenance store`}
      actions={
        can("add_product") ? (
          <Button
            onClick={() => {
              setEditing(null);
              setForm({ ...EMPTY });
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add product
          </Button>
        ) : null
      }
    >
      <PermissionGate permission="view_products">
        <div className="space-y-6">
          <div className="surface-card grid gap-3 p-4 md:grid-cols-4">
            <div className="relative md:col-span-1">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name or ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stock status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={allocation} onValueChange={setAllocation}>
              <SelectTrigger>
                <SelectValue placeholder="Assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Assigned & unassigned</SelectItem>
                <SelectItem value="assigned">Assigned only</SelectItem>
                <SelectItem value="unassigned">Unassigned only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by product name</SelectItem>
                <SelectItem value="stock">Sort by stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <PackageOpen className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No products match your filters</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try clearing the search or changing the stock filter.
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  setAllocation("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p, i) => (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="surface-card overflow-hidden"
                >
                  <div className="relative bg-muted">
                    <img
                      src={productImage(p.imageKey)}
                      alt={`${p.name} sewing machine spare part`}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="h-44 w-full object-cover"
                    />
                    <StockBadge qty={p.quantity} className="absolute top-3 right-3 bg-card/90" />
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold">{p.name}</h3>
                        <span className="text-xs text-muted-foreground">{p.id}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.category} · {p.machine}
                      </p>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                      <span className="text-xs text-muted-foreground">Quantity</span>
                      {can("update_stock") ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => adjust(p, -1)}
                            aria-label={`Decrease ${p.name} stock`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">{p.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => adjust(p, 1)}
                            aria-label={`Increase ${p.name} stock`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold">{p.quantity}</span>
                      )}
                    </div>

                    <div className="text-xs">
                      {p.assignment ? (
                        <p className="text-muted-foreground">
                          Assigned to{" "}
                          <span className="font-medium text-foreground">{p.assignment.userName}</span>{" "}
                          ({p.assignment.role})
                        </p>
                      ) : (
                        <Badge variant="secondary">Unassigned</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => setDetails(p)}>
                        View details
                      </Button>
                      {can("assign_product") && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setAssignFor(p);
                            setAssignUser(p.assignment?.userId ?? "");
                          }}
                        >
                          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                          {p.assignment ? "Reassign" : "Assign"}
                        </Button>
                      )}
                      {can("edit_product") && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          aria-label={`Edit ${p.name}`}
                          onClick={() => {
                            setEditing(p);
                            setForm({
                              name: p.name,
                              category: p.category,
                              machine: p.machine,
                              description: p.description,
                              imageKey: p.imageKey,
                              quantity: p.quantity,
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {can("delete_product") && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          aria-label={`Delete ${p.name}`}
                          onClick={() => setConfirmDelete(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>

        {/* Add / edit dialog */}
        <Dialog
          open={Boolean(form)}
          onOpenChange={(o) => {
            if (!o) {
              setForm(null);
              setEditing(null);
            }
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
              <DialogDescription>
                Maintain accurate spare-part records for the maintenance store.
              </DialogDescription>
            </DialogHeader>
            {form && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Product name</Label>
                  <Input
                    id="p-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="p-cat">Category</Label>
                    <Input
                      id="p-cat"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-machine">Machine</Label>
                    <Input
                      id="p-machine"
                      value={form.machine}
                      onChange={(e) => setForm({ ...form, machine: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="p-qty">Quantity</Label>
                    <Input
                      id="p-qty"
                      type="number"
                      min={0}
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: Math.max(0, Number(e.target.value) || 0) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <Select
                      value={form.imageKey}
                      onValueChange={(v) => setForm({ ...form, imageKey: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_OPTIONS.map((k) => (
                          <SelectItem key={k} value={k}>
                            {k.replace(/-/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-desc">Description</Label>
                  <Textarea
                    id="p-desc"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setForm(null);
                  setEditing(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={saveForm}>{editing ? "Save changes" : "Add product"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details dialog */}
        <Dialog open={Boolean(details)} onOpenChange={(o) => !o && setDetails(null)}>
          <DialogContent>
            {details && (
              <>
                <DialogHeader>
                  <DialogTitle>{details.name}</DialogTitle>
                  <DialogDescription>{details.description}</DialogDescription>
                </DialogHeader>
                <img
                  src={productImage(details.imageKey)}
                  alt={details.name}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-48 w-full rounded-xl border border-border object-cover"
                />
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <Detail label="Product ID" value={details.id} />
                  <Detail label="Category" value={details.category} />
                  <Detail label="Machine" value={details.machine} />
                  <Detail label="Quantity" value={String(details.quantity)} />
                  <Detail label="Stock status" value={stockStatus(details.quantity)} />
                  <Detail
                    label="Assigned to"
                    value={details.assignment ? details.assignment.userName : "Unassigned"}
                  />
                  {details.assignment && (
                    <>
                      <Detail label="Role" value={details.assignment.role} />
                      <Detail
                        label="Assigned on"
                        value={new Date(details.assignment.assignedAt).toLocaleString()}
                      />
                      <Detail label="Assigned by" value={details.assignment.assignedBy} />
                    </>
                  )}
                </dl>
                {details.assignment && can("assign_product") && (
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        unassignProduct(details.id);
                        toast.success(`${details.name} unassigned`);
                        setDetails(null);
                      }}
                    >
                      Unassign product
                    </Button>
                  </DialogFooter>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign dialog */}
        <Dialog open={Boolean(assignFor)} onOpenChange={(o) => !o && setAssignFor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign {assignFor?.name}</DialogTitle>
              <DialogDescription>Select the technician or manager responsible.</DialogDescription>
            </DialogHeader>
            <Select value={assignUser} onValueChange={setAssignUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignFor(null)}>
                Cancel
              </Button>
              <Button
                disabled={!assignUser}
                onClick={() => {
                  if (!assignFor || !assignUser) return;
                  assignProduct(assignFor.id, assignUser);
                  toast.success("Assignment confirmed");
                  setAssignFor(null);
                }}
              >
                Confirm assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={Boolean(confirmDelete)} onOpenChange={(o) => !o && setConfirmDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {confirmDelete?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the spare part and its assignment history from the store. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!confirmDelete) return;
                  deleteProduct(confirmDelete.id);
                  toast.success(`${confirmDelete.name} deleted`);
                  setConfirmDelete(null);
                }}
              >
                Delete product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PermissionGate>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}