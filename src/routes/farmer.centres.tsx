import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FarmerShell, InfoRow } from "@/components/kisan/ui";
import {
  activeCounters,
  centreLoad,
  centreQueue,
  etaMinutes,
  useAppState,
} from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/centres")({
  head: () => ({
    meta: [
      { title: "Procurement centres near you — Kisan Setu" },
      {
        name: "description",
        content:
          "Compare nearby procurement centres by distance, queue length, active counters and estimated waiting time.",
      },
      { property: "og:title", content: "Find a procurement centre" },
      {
        property: "og:description",
        content: "Compare centres by queue, counters and waiting time.",
      },
    ],
  }),
  component: Centres,
});

const FILTERS = [
  { key: "near", label: "Nearest" },
  { key: "wait", label: "Lowest waiting time" },
  { key: "slots", label: "Available slots" },
  { key: "load", label: "Lowest centre load" },
] as const;

function Centres() {
  const s = useAppState();
  const [filter, setFilter] = useState<string>("near");
  const [loc, setLoc] = useState<string | null>(null);

  const rows = s.centres.map((c) => {
    const queue = centreQueue(s, c.centreId);
    const counters = activeCounters(c);
    return {
      c,
      queue,
      counters,
      eta: etaMinutes(s, c.centreId, queue),
      load: centreLoad(queue, counters),
    };
  });
  rows.sort((a, b) => {
    if (filter === "wait") return a.eta - b.eta;
    if (filter === "load") return a.queue / a.counters - b.queue / b.counters;
    if (filter === "slots") return b.counters - a.counters;
    return a.c.distanceKm - b.c.distanceKm;
  });

  return (
    <FarmerShell title="Procurement centres" subtitle={s.draft.produce} back>
      <div className="mb-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="size-4 text-primary" />
          <span className="flex-1">
            {loc ?? "Share your location to sort centres by real distance."}
          </span>
          {!loc && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (!navigator.geolocation)
                  return toast.error("Location is not available on this device");
                navigator.geolocation.getCurrentPosition(
                  (p) =>
                    setLoc(
                      `Latitude ${p.coords.latitude.toFixed(4)}, Longitude ${p.coords.longitude.toFixed(4)}`,
                    ),
                  () =>
                    toast.info(
                      "Location permission declined — distances shown are approximate.",
                    ),
                );
              }}
            >
              Allow
            </Button>
          )}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          We only use location to show the nearest centre and help staff know
          you are approaching. You can refuse and still book.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map(({ c, queue, counters, eta, load }) => (
          <div key={c.centreId} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {c.address}
                </div>
              </div>
              <span className="text-sm font-semibold">🟢 Open</span>
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <InfoRow k="Distance" v={`${c.distanceKm} km`} />
              <InfoRow k="Current queue" v={`${queue} farmers`} />
              <InfoRow k="Active counters" v={counters} />
              <InfoRow k="Estimated wait" v={`${eta} min`} strong />
              <InfoRow k="Today's availability" v="🟢 Slots available" />
              <InfoRow k="Expected load" v={load} />
            </div>
            <Button asChild className="mt-3 h-11 w-full">
              <Link to="/farmer/centre/$id" params={{ id: c.centreId }}>
                View centre
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </FarmerShell>
  );
}
