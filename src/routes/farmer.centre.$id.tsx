import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FarmerShell, InfoRow, Stat } from "@/components/kisan/ui";
import {
  TIME_SLOTS,
  activeCounters,
  centreLoad,
  centreOf,
  centreQueue,
  etaMinutes,
  setDraft,
  useAppState,
} from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/centre/$id")({
  head: () => ({
    meta: [
      { title: "Centre details & slots — Kisan Setu" },
      {
        name: "description",
        content:
          "Live operations of the procurement centre and the time slots you can book today.",
      },
      { property: "og:title", content: "Centre details — Kisan Setu" },
      {
        property: "og:description",
        content: "Live queue, counters and bookable slots for this centre.",
      },
    ],
  }),
  component: CentreDetails,
});

function CentreDetails() {
  const { id } = useParams({ from: "/farmer/centre/$id" });
  const navigate = useNavigate();
  const s = useAppState();
  const c = centreOf(s, id);
  const queue = centreQueue(s, c.centreId);
  const counters = activeCounters(c);
  const eta = etaMinutes(s, c.centreId, queue);

  const capacity = 20;
  const slots = TIME_SLOTS.map((slot, i) => {
    const used = s.tokens.filter(
      (t) => t.centreId === c.centreId && t.slot === slot && t.status !== "CANCELLED",
    ).length;
    return { slot, free: Math.max(capacity - used - i, 2), capacity };
  });

  return (
    <FarmerShell title={c.name} subtitle={c.address} back>
      <div className="rounded-xl border border-border bg-card p-4">
        <InfoRow k="Operating hours" v={`${c.openingTime} – ${c.closingTime}`} />
        <InfoRow
          k="Current status"
          v={s.delay.active ? "🟠 Running late" : "🟢 Operating normally"}
          strong
        />
      </div>

      <h2 className="mt-5 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Live operations
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <Stat value={queue} caption="Farmers in queue" />
        <Stat value={counters} caption="Active counters" tone="success" />
        <Stat
          value={`${c.avgProcessingTime} min`}
          caption="Average per farmer"
        />
        <Stat value={`${eta} min`} caption="Estimated waiting time" tone="info" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Centre load: <b>{centreLoad(queue, counters)}</b>
      </p>

      <h2 className="mt-5 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Available slots
      </h2>
      <div className="space-y-3">
        {slots.map((sl) => (
          <div
            key={sl.slot}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div>
              <div className="font-semibold">{sl.slot}</div>
              <div className="text-xs text-muted-foreground">
                {sl.free} out of {sl.capacity} slots available
              </div>
            </div>
            <Button
              className="h-11"
              onClick={() => {
                setDraft({ centreId: c.centreId, slot: sl.slot });
                navigate({ to: "/farmer/confirm" });
              }}
            >
              Book slot
            </Button>
          </div>
        ))}
      </div>
    </FarmerShell>
  );
}
