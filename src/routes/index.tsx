import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Boxes, Loader2, ShieldCheck, UserCog, Wrench } from "lucide-react";
import { toast } from "sonner";
import loginBg from "@/assets/login-bg.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGsms } from "@/lib/gsms/store";
import type { Role } from "@/lib/gsms/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GSMS Login — Garment Smart Maintenance Store" },
      {
        name: "description",
        content:
          "Sign in to GSMS, the enterprise maintenance store system for garment factory sewing-machine spare parts.",
      },
      { property: "og:title", content: "GSMS Login — Garment Smart Maintenance Store" },
      {
        property: "og:description",
        content: "Role-based inventory control for sewing-machine spare parts.",
      },
    ],
  }),
  component: LoginPage,
});

const DEMO: { role: Role; email: string; icon: typeof ShieldCheck; blurb: string }[] = [
  { role: "Admin", email: "admin@gsms.io", icon: ShieldCheck, blurb: "Full system control" },
  { role: "Manager", email: "manager@gsms.io", icon: UserCog, blurb: "Stock & assignments" },
  { role: "Technical Lead", email: "techlead@gsms.io", icon: Wrench, blurb: "Floor visibility" },
];

function LoginPage() {
  const { login, currentUser, ready } = useGsms();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("Admin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && currentUser) navigate({ to: "/dashboard" });
  }, [ready, currentUser, navigate]);

  const selected = DEMO.find((d) => d.role === role)!;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(role);
      toast.success(`Welcome back — signed in as ${role}`);
      navigate({ to: "/dashboard" });
    }, 600);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <img
        src={loginBg}
        alt="Garment factory floor with industrial sewing machines"
        width={1600}
        height={1000}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="gradient-navy absolute inset-0 opacity-90" />
      <div className="absolute inset-0 bg-navy/60" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center"
      >
        <div className="hidden text-navy-foreground lg:block">
          <div className="mb-6 flex items-center gap-3">
            <div className="gradient-primary flex h-12 w-12 items-center justify-center rounded-2xl">
              <Boxes className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">GSMS</p>
              <p className="text-sm text-navy-foreground/70">Garment Smart Maintenance Store</p>
            </div>
          </div>
          <h2 className="max-w-md text-4xl leading-tight font-bold tracking-tight">
            Spare-part control for every sewing line.
          </h2>
          <p className="mt-4 max-w-md text-navy-foreground/75">
            Track knives and loopers, monitor stock health, assign parts to technicians and govern
            access with granular role permissions.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
            {[
              { k: "Products", v: "4" },
              { k: "Units in store", v: "40" },
              { k: "Roles", v: "3" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="text-2xl font-bold">{s.v}</p>
                <p className="text-xs text-navy-foreground/70">{s.k}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6 shadow-[var(--shadow-elevated)] sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Sign in to GSMS</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a demo role to explore the maintenance store.
            </p>
          </div>

          <div className="mb-6 grid gap-2">
            {DEMO.map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => setRole(d.role)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  role === d.role
                    ? "border-primary bg-accent shadow-[var(--shadow-card)]"
                    : "border-border hover:border-primary/40 hover:bg-muted",
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <d.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{d.role}</span>
                  <span className="block text-xs text-muted-foreground">{d.blurb}</span>
                </span>
                <span
                  className={cn(
                    "h-4 w-4 rounded-full border-2",
                    role === d.role ? "border-primary bg-primary" : "border-border",
                  )}
                />
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" value={selected.email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="demo1234" readOnly />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : `Continue as ${role}`}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo environment — data is stored locally in your browser.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
