import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  CalendarPlus,
  CircleHelp,
  ListOrdered,
  MapPin,
  Sprout,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FarmerShell, InfoRow, Stat, StatusBadge } from "@/components/kisan/ui";
import {
  activeCounters,
  centreOf,
  centreQueue,
  etaMinutes,
  myToken,
  useAppState,
} from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/dashboard")({
  head: () => ({
    meta: [
      { title: "Farmer Home — Kisan Setu" },
      {
        name: "description",
        content:
          "Your bookings, live centre status and estimated waiting time in one place.",
      },
      { property: "og:title", content: "Farmer Home — Kisan Setu" },
      {
        property: "og:description",
        content: "Bookings, live centre status and estimated waiting time.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const s = useAppState();
  const token = myToken(s);
  const centre = centreOf(s, token?.centreId ?? s.centres[0].centreId);
  const queue = centreQueue(s, centre.centreId);
  const counters = activeCounters(centre);
  const eta = etaMinutes(s, centre.centreId, queue);

  return (
    <FarmerShell
      title={`Good morning, ${s.farmer?.name?.split(" ")[0] ?? "Farmer"}`}
      subtitle={`${s.farmer?.village ?? "Bagnan"} · ${s.farmer?.district ?? "Howrah"}`}
    >
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{s.farmer?.name ?? "Rahul Das"}</div>
            <div className="text-xs text-muted-foreground">
              Kisan ID {s.farmer?.farmerId ?? "KISAN-DEMO-104"}
            </div>
          </div>
          <span className="rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            ✓ Verified
          </span>
        </div>
      </div>

      <h2 className="mt-5 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Upcoming booking
      </h2>
      {token && token.status !== "CANCELLED" ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold">
                Token P-{String(token.tokenNumber).padStart(3, "0")}
              </div>
              <div className="text-sm text-muted-foreground">{centre.name}</div>
            </div>
            <StatusBadge status={token.status} />
          </div>
          <div className="mt-3 border-t border-border pt-2">
            <InfoRow k="Date" v={token.date} />
            <InfoRow k="Time" v={token.slot} />
            <InfoRow k="Produce" v={`${token.produce} · ${token.expectedQuantity} quintals`} />
          </div>
          <Button asChild className="mt-3 h-11 w-full">
            <Link to="/farmer/booking">View booking</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
          <Sprout className="mx-auto size-8 text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            You have no booking yet.
          </p>
          <Button asChild className="mt-4 h-11 w-full">
            <Link to="/farmer/book">Book a new slot</Link>
          </Button>
        </div>
      )}

      <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Live centre status
      </h2>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">{centre.name}</div>
          <span className="text-sm font-medium">
            {s.delay.active ? "🟠 Delay reported" : "🟢 Operating normally"}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Stat value={queue} caption="Farmers in queue" />
          <Stat value={`${eta} min`} caption="Estimated wait" tone="info" />
          <Stat value={counters} caption="Active counters" tone="success" />
        </div>
        {s.delay.active && (
          <p className="mt-3 rounded-lg bg-warning/15 p-3 text-xs font-medium">
            ⚠️ {s.delay.reason} — waiting time increased by about{" "}
            {s.delay.minutes} minutes.
          </p>
        )}
        <Button asChild variant="secondary" className="mt-3 h-11 w-full">
          <Link to="/farmer/queue">View live queue</Link>
        </Button>
      </div>

      <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Quick actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { to: "/farmer/book", icon: CalendarPlus, t: "Book new slot" },
          { to: "/farmer/booking", icon: MapPin, t: "My booking" },
          { to: "/farmer/queue", icon: ListOrdered, t: "Live queue" },
          { to: "/farmer/status", icon: Sprout, t: "Procurement status" },
          { to: "/farmer/payment", icon: Wallet, t: "Payment status" },
          { to: "/farmer/notifications", icon: Bell, t: "Notifications" },
        ].map((a) => (
          <Link
            key={a.t}
            to={a.to}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-semibold"
          >
            <a.icon className="size-5 text-primary" />
            {a.t}
          </Link>
        ))}
        <a
          href="tel:1800000000"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-semibold"
        >
          <CircleHelp className="size-5 text-primary" />
          Help
        </a>
      </div>
    </FarmerShell>
  );
}
