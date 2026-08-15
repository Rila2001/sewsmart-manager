import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  PERMISSIONS,
  stockStatus,
  type ActivityEntry,
  type GsmsState,
  type Permission,
  type Product,
  type Role,
  type RolePermissions,
  type User,
} from "./types";

const STORAGE_KEY = "gsms_state_v1";

function perms(list: Permission[]): Record<Permission, boolean> {
  return PERMISSIONS.reduce(
    (acc, p) => ({ ...acc, [p]: list.includes(p) }),
    {} as Record<Permission, boolean>,
  );
}

export const DEFAULT_USERS: User[] = [
  {
    id: "USR-001",
    name: "Mohamed Rila",
    email: "admin@gsms.io",
    role: "Admin",
    department: "Maintenance Store",
    active: true,
  },
  {
    id: "USR-002",
    name: "Priya Nair",
    email: "manager@gsms.io",
    role: "Manager",
    department: "Production Floor A",
    active: true,
  },
  {
    id: "USR-003",
    name: "Arun Kumar",
    email: "techlead@gsms.io",
    role: "Technical Lead",
    department: "Line 3 - Overlock",
    active: true,
  },
  {
    id: "USR-004",
    name: "Sathish Raj",
    email: "sathish@gsms.io",
    role: "Technical Lead",
    department: "Line 7 - Flatlock",
    active: true,
  },
  {
    id: "USR-005",
    name: "Fathima Zahra",
    email: "fathima@gsms.io",
    role: "Manager",
    department: "Quality & Maintenance",
    active: true,
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "GSMS-P-001",
    name: "Movie Knife",
    category: "Cutting Blade",
    machine: "Overlock 5-Thread",
    description: "Hardened steel moving knife used for edge trimming on overlock machines.",
    imageKey: "movie-knife",
    quantity: 10,
    assignment: null,
  },
  {
    id: "GSMS-P-002",
    name: "Fixing Knife",
    category: "Cutting Blade",
    machine: "Overlock 5-Thread",
    description: "Stationary counter blade paired with the moving knife for clean fabric cuts.",
    imageKey: "fixing-knife",
    quantity: 10,
    assignment: null,
  },
  {
    id: "GSMS-P-003",
    name: "Upper Looper",
    category: "Looper Assembly",
    machine: "Overlock / Flatlock",
    description: "Chrome-finished upper looper for consistent top thread formation.",
    imageKey: "upper-looper",
    quantity: 10,
    assignment: null,
  },
  {
    id: "GSMS-P-004",
    name: "Lower Looper",
    category: "Looper Assembly",
    machine: "Overlock / Flatlock",
    description: "Precision lower looper delivering stable bottom thread interlocking.",
    imageKey: "lower-looper",
    quantity: 10,
    assignment: null,
  },
];

const DEFAULT_PERMISSIONS: RolePermissions = {
  Manager: perms([
    "view_dashboard",
    "view_products",
    "edit_product",
    "assign_product",
    "view_stock",
    "update_stock",
    "view_reports",
    "view_activity",
  ]),
  "Technical Lead": perms(["view_dashboard", "view_products", "view_stock"]),
};

function defaultState(): GsmsState {
  return {
    products: DEFAULT_PRODUCTS,
    users: DEFAULT_USERS,
    permissions: DEFAULT_PERMISSIONS,
    activity: [
      {
        id: "ACT-0001",
        at: new Date().toISOString(),
        actor: "System",
        action: "Store initialised",
        detail: "4 spare parts loaded with 40 units of opening stock.",
        type: "product",
      },
    ],
    currentUserId: null,
  };
}

interface GsmsContextValue {
  state: GsmsState;
  ready: boolean;
  currentUser: User | null;
  can: (permission: Permission) => boolean;
  permissionsFor: (role: Role) => Record<Permission, boolean>;
  login: (role: Role) => void;
  logout: () => void;
  addProduct: (p: Omit<Product, "id" | "assignment">) => void;
  updateProduct: (id: string, patch: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  assignProduct: (productId: string, userId: string) => void;
  unassignProduct: (productId: string) => void;
  togglePermission: (role: Exclude<Role, "Admin">, permission: Permission, value: boolean) => void;
  addUser: (u: Omit<User, "id">) => void;
  updateUser: (id: string, patch: Partial<Omit<User, "id">>) => void;
  deleteUser: (id: string) => void;
  resetDemo: () => void;
}

const GsmsContext = createContext<GsmsContextValue | null>(null);

export function GsmsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GsmsState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GsmsState;
        if (parsed?.products?.length) setState({ ...defaultState(), ...parsed });
      }
    } catch {
      /* ignore corrupt state */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const log = useCallback(
    (s: GsmsState, entry: Omit<ActivityEntry, "id" | "at" | "actor">, actor?: string): GsmsState => {
      const who = actor ?? s.users.find((u) => u.id === s.currentUserId)?.name ?? "System";
      const item: ActivityEntry = {
        ...entry,
        id: `ACT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        at: new Date().toISOString(),
        actor: who,
      };
      return { ...s, activity: [item, ...s.activity].slice(0, 60) };
    },
    [],
  );

  const permissionsFor = useCallback(
    (role: Role): Record<Permission, boolean> => {
      if (role === "Admin") return perms([...PERMISSIONS]);
      return state.permissions[role];
    },
    [state.permissions],
  );

  const can = useCallback(
    (permission: Permission) => {
      if (!currentUser) return false;
      return permissionsFor(currentUser.role)[permission] ?? false;
    },
    [currentUser, permissionsFor],
  );

  const value: GsmsContextValue = {
    state,
    ready,
    currentUser,
    can,
    permissionsFor,
    login: (role) =>
      setState((s) => {
        const user = s.users.find((u) => u.role === role && u.active);
        if (!user) return s;
        return log(
          { ...s, currentUserId: user.id },
          { action: "Signed in", detail: `${user.name} signed in as ${role}.`, type: "auth" },
          user.name,
        );
      }),
    logout: () => setState((s) => ({ ...s, currentUserId: null })),
    addProduct: (p) =>
      setState((s) => {
        const next = `GSMS-P-${String(s.products.length + 1).padStart(3, "0")}`;
        const product: Product = { ...p, id: next, assignment: null };
        return log(
          { ...s, products: [...s.products, product] },
          {
            action: "Product added",
            detail: `${product.name} (${product.id}) created with ${product.quantity} units.`,
            type: "product",
          },
        );
      }),
    updateProduct: (id, patch) =>
      setState((s) => {
        const target = s.products.find((p) => p.id === id);
        if (!target) return s;
        return log(
          {
            ...s,
            products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          },
          {
            action: "Product updated",
            detail: `${target.name} (${id}) details were updated.`,
            type: "product",
          },
        );
      }),
    deleteProduct: (id) =>
      setState((s) => {
        const target = s.products.find((p) => p.id === id);
        if (!target) return s;
        return log(
          { ...s, products: s.products.filter((p) => p.id !== id) },
          {
            action: "Product deleted",
            detail: `${target.name} (${id}) was removed from the store.`,
            type: "product",
          },
        );
      }),
    setQuantity: (id, qty) =>
      setState((s) => {
        const target = s.products.find((p) => p.id === id);
        if (!target) return s;
        const safe = Math.max(0, Math.round(qty));
        return log(
          { ...s, products: s.products.map((p) => (p.id === id ? { ...p, quantity: safe } : p)) },
          {
            action: "Stock updated",
            detail: `${target.name}: ${target.quantity} → ${safe} units (${stockStatus(safe)}).`,
            type: "stock",
          },
        );
      }),
    assignProduct: (productId, userId) =>
      setState((s) => {
        const product = s.products.find((p) => p.id === productId);
        const user = s.users.find((u) => u.id === userId);
        const actor = s.users.find((u) => u.id === s.currentUserId);
        if (!product || !user) return s;
        const assignment = {
          userId: user.id,
          userName: user.name,
          role: user.role,
          assignedAt: new Date().toISOString(),
          assignedBy: actor?.name ?? "System",
        };
        const reassigned = Boolean(product.assignment);
        return log(
          {
            ...s,
            products: s.products.map((p) => (p.id === productId ? { ...p, assignment } : p)),
          },
          {
            action: reassigned ? "Product reassigned" : "Product assigned",
            detail: `${product.name} → ${user.name} (${user.role}).`,
            type: "assign",
          },
        );
      }),
    unassignProduct: (productId) =>
      setState((s) => {
        const product = s.products.find((p) => p.id === productId);
        if (!product?.assignment) return s;
        return log(
          {
            ...s,
            products: s.products.map((p) => (p.id === productId ? { ...p, assignment: null } : p)),
          },
          {
            action: "Product unassigned",
            detail: `${product.name} released from ${product.assignment.userName}.`,
            type: "assign",
          },
        );
      }),
    togglePermission: (role, permission, value) =>
      setState((s) =>
        log(
          {
            ...s,
            permissions: {
              ...s.permissions,
              [role]: { ...s.permissions[role], [permission]: value },
            },
          },
          {
            action: value ? "Permission granted" : "Permission revoked",
            detail: `${permission.replace(/_/g, " ")} ${value ? "enabled" : "disabled"} for ${role}.`,
            type: "role",
          },
        ),
      ),
    addUser: (u) =>
      setState((s) => {
        const user: User = { ...u, id: `USR-${String(s.users.length + 1).padStart(3, "0")}` };
        return log(
          { ...s, users: [...s.users, user] },
          { action: "User created", detail: `${user.name} added as ${user.role}.`, type: "user" },
        );
      }),
    updateUser: (id, patch) =>
      setState((s) => {
        const target = s.users.find((u) => u.id === id);
        if (!target) return s;
        return log(
          { ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) },
          { action: "User updated", detail: `${target.name} profile updated.`, type: "user" },
        );
      }),
    deleteUser: (id) =>
      setState((s) => {
        const target = s.users.find((u) => u.id === id);
        if (!target || target.id === s.currentUserId) return s;
        return log(
          {
            ...s,
            users: s.users.filter((u) => u.id !== id),
            products: s.products.map((p) =>
              p.assignment?.userId === id ? { ...p, assignment: null } : p,
            ),
          },
          { action: "User removed", detail: `${target.name} was removed.`, type: "user" },
        );
      }),
    resetDemo: () => setState(defaultState()),
  };

  return <GsmsContext.Provider value={value}>{children}</GsmsContext.Provider>;
}

export function useGsms() {
  const ctx = useContext(GsmsContext);
  if (!ctx) throw new Error("useGsms must be used inside GsmsProvider");
  return ctx;
}

export function useStats() {
  const { state } = useGsms();
  return useMemo(() => {
    const products = state.products;
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    return {
      totalProducts: products.length,
      totalStock,
      assigned: products.filter((p) => p.assignment).length,
      unassigned: products.filter((p) => !p.assignment).length,
      lowStock: products.filter((p) => stockStatus(p.quantity) === "Low Stock").length,
      outOfStock: products.filter((p) => stockStatus(p.quantity) === "Out of Stock").length,
    };
  }, [state.products]);
}