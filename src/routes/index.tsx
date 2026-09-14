import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Recycle, User, HardHat, ShieldCheck, ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWasteStore, type Role } from "@/lib/waste-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in | AI Smart Waste Complaint System" },
      {
        name: "description",
        content:
          "Sign in as resident, collection worker or administrator to report, assign and verify campus waste complaints.",
      },
      { property: "og:title", content: "Sign in | AI Smart Waste Complaint System" },
      {
        property: "og:description",
        content:
          "Multi-role access for photo-based waste reporting, AI priority analysis, worker assignment and verification.",
      },
    ],
  }),
  component: LoginPage,
});

const ROLES: {
  role: Role;
  label: string;
  portal: string;
  blurb: string;
  features: string[];
  demo: string;
  icon: typeof User;
  to: "/user" | "/worker" | "/admin";
}[] = [
  {
    role: "user",
    label: "User",
    portal: "User Portal",
    blurb: "Resident / student — report waste and track complaints",
    features: ["Photo-based reporting", "AI condition & priority", "Live status tracking", "Rate the resolution"],
    demo: "priya.s@campus.edu",
    icon: User,
    to: "/user",
  },
  {
    role: "worker",
    label: "Worker",
    portal: "Worker Portal",
    blurb: "Collection staff — view tasks and upload proof",
    features: ["Assigned task list", "Location & photo context", "Start work timer", "Completion proof upload"],
    demo: "anita.d@staff.edu",
    icon: HardHat,
    to: "/worker",
  },
  {
    role: "admin",
    label: "Admin",
    portal: "Admin Portal",
    blurb: "Assign workers, verify work and read analytics",
    features: ["Complaint queue & filters", "Worker assignment", "Before/after verification", "Hotspots & analytics"],
    demo: "admin@campus.edu",
    icon: ShieldCheck,
    to: "/admin",
  },
];


function LoginPage() {
  const { signIn } = useWasteStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role>("user");
  const [email, setEmail] = useState("priya.s@campus.edu");
  const [password, setPassword] = useState("demo1234");

  const enter = (role: Role, to: "/user" | "/worker" | "/admin") => {
    signIn(role);
    navigate({ to });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const target = ROLES.find((r) => r.role === selected)!;
    enter(target.role, target.to);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Recycle className="size-6" />
          </span>
          <span className="font-semibold">Smart Waste Platform</span>
        </div>
        <div>
          <h2 className="max-w-md text-4xl leading-tight font-semibold">
            From waste reporting to AI analysis, assignment and verification.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            One centralised digital system for campus and hostel waste complaints — photo based
            reporting, automatic priority, deadline tracking and hotspot analytics.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 text-sm">
            {["Report", "AI Analysis", "Assign", "Verify", "Analytics"].map((step) => (
              <span
                key={step}
                className="rounded-full bg-primary-foreground/12 px-3 py-1 text-primary-foreground/90"
              >
                {step}
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm text-primary-foreground/70">
          Colleges · Hostels · Apartments · Hospitals · Organizations
        </p>
      </div>

      <div className="flex items-center justify-center bg-surface px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Recycle className="size-5" />
              </span>
              <span className="font-semibold">Smart Waste Platform</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a role to explore the demo — no real account needed.
            </p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelected(r.role)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
                        selected === r.role
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <r.icon className="size-5" />
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Sign in
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Quick role switch
            </p>
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => enter(r.role, r.to)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <r.icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">Continue as {r.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.blurb}</span>
                </span>
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
