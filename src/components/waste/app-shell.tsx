import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Recycle, LogOut, LayoutDashboard, User, HardHat } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWasteStore, type Role } from "@/lib/waste-store";

const NAV: { to: "/admin" | "/user" | "/worker"; label: string; role: Role; icon: typeof User }[] = [
  { to: "/user", label: "User Portal", role: "user", icon: User },
  { to: "/worker", label: "Worker Tasks", role: "worker", icon: HardHat },
  { to: "/admin", label: "Admin Dashboard", role: "admin", icon: LayoutDashboard },
];

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { role, signOut, signIn } = useWasteStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!role) navigate({ to: "/", replace: true });
  }, [role, navigate]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Recycle className="size-5" />
            </span>
            <span className="text-sm leading-tight font-semibold">
              Smart Waste
              <span className="block text-xs font-normal text-muted-foreground">
                Complaint Management
              </span>
            </span>
          </Link>

          <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-2 sm:w-auto sm:flex-1 sm:justify-center">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => signIn(item.role)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  pathname === item.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
            <span className="hidden rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium capitalize sm:inline">
              Signed in as {role ?? "guest"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
