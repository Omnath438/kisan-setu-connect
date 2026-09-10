import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  Home,
  ListOrdered,
  Sprout,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/kisan/store";
import type { TokenStatus } from "@/lib/kisan/types";
import { label } from "@/lib/kisan/store";

export function StatusBadge({ status }: { status: TokenStatus }) {
  const tone: Record<TokenStatus, string> = {
    COMPLETED: "bg-success/12 text-success border-success/25",
    PROCESSING: "bg-info/12 text-info border-info/25",
    CHECKED_IN: "bg-secondary text-secondary-foreground border-border",
    BOOKED: "bg-muted text-muted-foreground border-border",
    CALLED: "bg-warning/15 text-warning-foreground border-warning/30",
    ARRIVING: "bg-warning/15 text-warning-foreground border-warning/30",
    DELAYED: "bg-warning/20 text-warning-foreground border-warning/40",
    RESCHEDULED: "bg-accent text-accent-foreground border-accent",
    CANCELLED: "bg-destructive/10 text-destructive border-destructive/25",
    NO_RESPONSE: "bg-destructive/10 text-destructive border-destructive/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        tone[status],
      )}
    >
      {label(status)}
    </span>
  );
}

export function Stat({
  value,
  caption,
  tone = "default",
}: {
  value: ReactNode;
  caption: string;
  tone?: "default" | "success" | "warn" | "info";
}) {
  const toneCls = {
    default: "text-foreground",
    success: "text-success",
    warn: "text-warning-foreground",
    info: "text-info",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={cn("text-2xl font-bold tabular-nums", toneCls)}>
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">
        {caption}
      </div>
    </div>
  );
}

export function TopBar({
  title,
  subtitle,
  back,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        {back && (
          <button
            aria-label="Go back"
            onClick={() => router.history.back()}
            className="rounded-md p-1 hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">{title}</h1>
          {subtitle && (
            <p className="truncate text-xs opacity-80">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}

export function FarmerShell({
  title,
  subtitle,
  back,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  children: ReactNode;
}) {
  const unread = useApp((s) => s.notifications.filter((n) => !n.read).length);
  const items = [
    { to: "/farmer/dashboard", icon: Home, text: "Home" },
    { to: "/farmer/queue", icon: ListOrdered, text: "Live Queue" },
    { to: "/farmer/status", icon: Sprout, text: "Progress" },
    { to: "/farmer/payment", icon: Wallet, text: "Payment" },
    { to: "/farmer/notifications", icon: Bell, text: "Alerts" },
  ] as const;
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title={title} subtitle={subtitle} back={back} />
      <main className="mx-auto max-w-2xl px-4 py-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card">
        <div className="mx-auto flex max-w-2xl">
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              activeProps={{ className: "text-primary" }}
              className="relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground"
            >
              <i.icon className="size-5" />
              {i.text}
              {i.text === "Alerts" && unread > 0 && (
                <span className="absolute top-1 right-4 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function WorkerShell({ children }: { children: ReactNode }) {
  const worker = useApp((s) => s.worker);
  const links = [
    { to: "/worker/dashboard", text: "Dashboard" },
    { to: "/worker/counters", text: "Counters & Delays" },
    { to: "/worker/admin", text: "Manager View" },
  ] as const;
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/" className="font-bold tracking-tight">
            KISAN SETU
            <span className="ml-2 text-xs font-normal opacity-80">
              Staff Portal
            </span>
          </Link>
          <nav className="flex flex-1 gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeProps={{ className: "bg-primary-foreground/15" }}
                className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-primary-foreground/10"
              >
                {l.text}
              </Link>
            ))}
          </nav>
          <div className="text-right text-xs opacity-90">
            <div className="font-semibold">{worker?.name ?? "Staff"}</div>
            <div>{worker?.workerId ?? "PC-W-021"}</div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

export function InfoRow({
  k,
  v,
  strong,
}: {
  k: string;
  v: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("text-right", strong && "font-semibold")}>{v}</span>
    </div>
  );
}

export function Timeline({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="relative space-y-0">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold",
                  done && "border-success bg-success text-success-foreground",
                  active && "border-info bg-info text-info-foreground",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "w-0.5 flex-1",
                    done ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className="pt-1 pb-5">
              <div className="text-sm font-medium">{s}</div>
              <div className="text-xs text-muted-foreground">
                {done ? "Completed" : active ? "In progress" : "Pending"}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
