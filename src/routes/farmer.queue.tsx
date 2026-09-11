import { createFileRoute } from "@tanstack/react-router";
import { FarmerShell, Stat, StatusBadge } from "@/components/kisan/ui";
import {
  activeCounters,
  centreOf,
  etaMinutes,
  farmersAhead,
  myToken,
  nowServing,
  useAppState,
} from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/queue")({
  head: () => ({
    meta: [
      { title: "Live queue — Kisan Setu" },
      {
        name: "description",
        content:
          "See who is being served now, how many farmers are ahead of you and your live estimated waiting time.",
      },
      { property: "og:title", content: "Live queue — Kisan Setu" },
      {
        property: "og:description",
        content: "Now serving, farmers ahead and live estimated waiting time.",
      },
    ],
  }),
  component: QueuePage,
});

function QueuePage() {
  const s = useAppState();
  const token = myToken(s);
  const centreId = token?.centreId ?? s.centres[0].centreId;
  const centre = centreOf(s, centreId);
  const serving = nowServing(s);
  const ahead = farmersAhead(s, token);
  const eta = etaMinutes(s, centreId, ahead);

  const list = s.tokens
    .filter(
      (t) =>
        t.centreId === centreId &&
        t.date === s.date &&
        t.status !== "CANCELLED" &&
        t.status !== "COMPLETED",
    )
    .sort((a, b) => a.tokenNumber - b.tokenNumber)
    .slice(0, 12);

  return (
    <FarmerShell title="Live queue" subtitle={centre.name}>
      <div className="rounded-xl border border-info/30 bg-info/10 p-4 text-center">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Now serving
        </div>
        <div className="text-4xl font-extrabold text-info tabular-nums">
          P-{String(serving?.tokenNumber ?? 0).padStart(3, "0")}
        </div>
        <div className="text-xs text-muted-foreground">
          Counter {(serving?.tokenNumber ?? 1) % activeCounters(centre) + 1} ·{" "}
          {serving?.farmerName}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat
          value={token ? `P-${String(token.tokenNumber).padStart(3, "0")}` : "—"}
          caption="Your token"
        />
        <Stat value={ahead} caption="Farmers ahead" tone="warn" />
        <Stat value={`${eta} min`} caption="Estimated wait" tone="info" />
      </div>

      {s.delay.active && (
        <p className="mt-3 rounded-xl border border-warning/40 bg-warning/15 p-3 text-sm font-medium">
          ⚠️ {s.delay.reason} — about {s.delay.minutes} extra minutes. Your
          estimated waiting time has been updated.
        </p>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Estimated wait = farmers ahead × {centre.avgProcessingTime} min ÷{" "}
        {activeCounters(centre)} active counters
        {s.delay.active ? " + reported delay" : ""}.
      </p>

      <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Queue today
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {list.map((t) => (
          <div
            key={t.tokenId}
            className={
              "flex items-center gap-3 p-3 " +
              (t.isMine ? "bg-primary/5" : "")
            }
          >
            <span className="w-14 text-sm font-bold tabular-nums">
              P-{String(t.tokenNumber).padStart(3, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">
              {t.isMine ? "You" : t.farmerName}
              <span className="ml-2 text-xs text-muted-foreground">
                {t.slot.slice(0, 8)}
              </span>
            </span>
            <StatusBadge status={t.status} />
          </div>
        ))}
      </div>
    </FarmerShell>
  );
}
