import { createFileRoute } from "@tanstack/react-router";
import { Stat, StatusBadge, WorkerShell } from "@/components/kisan/ui";
import {
  activeCounters,
  centreLoad,
  centreQueue,
  etaMinutes,
  label,
  useAppState,
} from "@/lib/kisan/store";

export const Route = createFileRoute("/worker/admin")({
  head: () => ({
    meta: [
      { title: "Manager view — Kisan Setu Staff" },
      {
        name: "description",
        content:
          "Centre-wide performance, token change history and farmer call logs for procurement managers.",
      },
      { property: "og:title", content: "Manager view — Kisan Setu Staff" },
      {
        property: "og:description",
        content: "Centre performance, token history and call logs.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const s = useAppState();
  const completed = s.tokens.filter((t) => t.status === "COMPLETED");
  const cancelled = s.tokens.filter((t) => t.status === "CANCELLED").length;
  const rescheduled = s.tokens.filter((t) => t.status === "RESCHEDULED").length;
  const value = completed.reduce((n, t) => n + (t.amount ?? 0), 0);
  const quantity = completed.reduce((n, t) => n + (t.acceptedQuantity ?? 0), 0);

  return (
    <WorkerShell>
      <h1 className="text-xl font-bold">Manager view</h1>
      <p className="text-sm text-muted-foreground">
        {s.date} · all procurement centres
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat value={s.tokens.length} caption="Tokens issued" />
        <Stat value={completed.length} caption="Completed" tone="success" />
        <Stat value={rescheduled} caption="Rescheduled" tone="warn" />
        <Stat value={cancelled} caption="Cancelled" />
        <Stat
          value={`₹${(value / 100000).toFixed(2)}L`}
          caption="Value procured"
          tone="success"
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {quantity.toFixed(1)} quintals accepted today.
      </p>

      <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Centres
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {s.centres.map((c) => {
          const waiting = centreQueue(s, c.centreId);
          const counters = activeCounters(c);
          return (
            <div
              key={c.centreId}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.address}</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="font-bold tabular-nums">{waiting}</div>
                  <div className="text-[11px] text-muted-foreground">Waiting</div>
                </div>
                <div>
                  <div className="font-bold tabular-nums">{counters}</div>
                  <div className="text-[11px] text-muted-foreground">Counters</div>
                </div>
                <div>
                  <div className="font-bold tabular-nums">
                    {etaMinutes(s, c.centreId, waiting)}m
                  </div>
                  <div className="text-[11px] text-muted-foreground">Clearance</div>
                </div>
              </div>
              <div className="mt-3 text-xs font-semibold">
                Load: {centreLoad(waiting, counters)}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Token change history
      </h2>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-secondary text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Farmer</th>
              <th className="p-3">Change</th>
              <th className="p-3">Token</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Staff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {s.history.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-muted-foreground">
                  No changes recorded yet.
                </td>
              </tr>
            )}
            {s.history.slice(0, 15).map((h) => (
              <tr key={h.historyId}>
                <td className="p-3 whitespace-nowrap">{h.createdAt}</td>
                <td className="p-3">{h.farmerName}</td>
                <td className="p-3">
                  <span className="text-muted-foreground">
                    {label(h.oldStatus)} →{" "}
                  </span>
                  <StatusBadge status={h.newStatus} />
                </td>
                <td className="p-3 tabular-nums">
                  {h.oldTokenNumber} → {h.newTokenNumber}
                  {h.oldDate !== h.newDate && (
                    <div className="text-xs text-muted-foreground">
                      {h.oldDate} → {h.newDate}
                    </div>
                  )}
                </td>
                <td className="p-3">{h.reason}</td>
                <td className="p-3 text-xs text-muted-foreground">{h.staffId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Call logs
      </h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Farmer</th>
              <th className="p-3">Result</th>
              <th className="p-3">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {s.calls.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-muted-foreground">
                  No calls logged yet.
                </td>
              </tr>
            )}
            {s.calls.map((c) => (
              <tr key={c.callId}>
                <td className="p-3 whitespace-nowrap">{c.callTime}</td>
                <td className="p-3">{c.farmerName}</td>
                <td className="p-3">{c.result}</td>
                <td className="p-3 text-muted-foreground">{c.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WorkerShell>
  );
}
