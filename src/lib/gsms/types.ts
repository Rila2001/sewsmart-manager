export type Role = "Admin" | "Manager" | "Technical Lead";

export const PERMISSIONS = [
  "view_dashboard",
  "view_products",
  "add_product",
  "edit_product",
  "delete_product",
  "assign_product",
  "view_stock",
  "update_stock",
  "view_reports",
  "view_activity",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_dashboard: "View Dashboard",
  view_products: "View Products",
  add_product: "Add Product",
  edit_product: "Edit Product",
  delete_product: "Delete Product",
  assign_product: "Assign Product",
  view_stock: "View Stock",
  update_stock: "Update Stock",
  view_reports: "View Reports",
  view_activity: "View Activity",
};

export interface Assignment {
  userId: string;
  userName: string;
  role: Role;
  assignedAt: string;
  assignedBy: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  machine: string;
  description: string;
  imageKey: string;
  quantity: number;
  assignment: Assignment | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  active: boolean;
}

export interface ActivityEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
  type: "stock" | "assign" | "product" | "role" | "user" | "auth";
}

export type RolePermissions = Record<Exclude<Role, "Admin">, Record<Permission, boolean>>;

export interface GsmsState {
  products: Product[];
  users: User[];
  permissions: RolePermissions;
  activity: ActivityEntry[];
  currentUserId: string | null;
}

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export function stockStatus(qty: number): StockStatus {
  if (qty <= 0) return "Out of Stock";
  if (qty <= 5) return "Low Stock";
  return "In Stock";
}