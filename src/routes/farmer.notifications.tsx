import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { BadgeIndianRupee, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { FarmerShell } from "@/components/kisan/ui";
import { markNotificationsRead, useAppState } from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Kisan Setu" },
      {
        name: "description",
        content:
          "All alerts about your token, queue changes, centre delays and payment updates in one place.",
      },
      { property: "og:title", content: "Notifications — Kisan Setu" },
      {
        property: "og:description",
        content: "Token, queue, delay and payment alerts.",
      },
    ],
  }),
  component: NotificationsPage,
});

const ICONS = {
  info: Info,
  warn: TriangleAlert,
  success: CheckCircle2,
  money: BadgeIndianRupee,
};

function NotificationsPage() {
  const s = useAppState();
  useEffect(() => {
    const id = setTimeout(markNotificationsRead, 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <FarmerShell title="Notifications">
      {s.notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {s.notifications.map((n) => {
            const Icon = ICONS[n.icon];
            const tone =
              n.icon === "warn"
                ? "text-warning-foreground bg-warning/15"
                : n.icon === "success"
                  ? "text-success bg-success/12"
                  : n.icon === "money"
                    ? "text-success bg-success/12"
                    : "text-info bg-info/12";
            return (
              <div
                key={n.id}
                className="flex gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${tone}`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{n.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {n.time}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {n.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </FarmerShell>
  );
}
