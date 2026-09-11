import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stat, WorkerShell } from "@/components/kisan/ui";
import {
  activeCounters,
  centreOf,
  centreQueue,
  clearDelay,
  etaMinutes,
  reportDelay,
  toggleCounter,
  useAppState,
} from "@/lib/kisan/store";

export const Route = createFileRoute("/worker/counters")({
  head: () => ({
    meta: [
      { title: "Counters & delays — Kisan Setu Staff" },
      {
        name: "description",
        content:
          "Open or close procurement counters and report centre delays; waiting times update for every farmer.",
      },
      { property: "og:title", content: "Counters & delays — Kisan Setu Staff" },
      {
        property: "og:description",
        content: "Manage counters and report delays in real time.",
      },
    ],
  }),
  component: CountersPage,
});

const REASONS = [
  "Weighing machine problem",
  "Staff shortage",
  "Truck loading in progress",
  "Power failure",
  "Heavy rain",
];

function CountersPage() {
  const s = useAppState();
  const centreId = s.worker?.centreId ?? s.centres[0].centreId;
  const centre = centreOf(s, centreId);
  const waiting = centreQueue(s, centreId);
  const eta = etaMinutes(s, centreId, waiting);
  const [reason, setReason] = useState(REASONS[0]);
  const [minutes, setMinutes] = useState("30");

  return (
    <WorkerShell>
      <h1 className="text-xl font-bold">Counters & delays</h1>
      <p className="text-sm text-muted-foreground">{centre.name}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat value={waiting} caption="Farmers waiting" tone="warn" />
        <Stat value={activeCounters(centre)} caption="Active counters" tone="success" />
        <Stat value={`${centre.avgProcessingTime} min`} caption="Average per farmer" />
        <Stat value={`${eta} min`} caption="Queue clearance" tone="info" />
      </div>

      <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Counters
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {centre.counters.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{c.name}</span>
              <span
                className={
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                  (c.active
                    ? "bg-success/12 text-success"
                    : "bg-destructive/10 text-destructive")
                }
              >
                {c.active ? "Open" : "Closed"}
              </span>
            </div>
            <Button
              variant={c.active ? "outline" : "default"}
              className="mt-3 h-10 w-full"
              onClick={() => toggleCounter(centre.centreId, c.id)}
            >
              {c.active ? "Close counter" : "Reopen counter"}
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Closing a counter immediately increases the estimated waiting time shown
        to every farmer in this queue.
      </p>

      <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
        Report a delay
      </h2>
      <div className="max-w-xl space-y-3 rounded-xl border border-border bg-card p-4">
        {s.delay.active && (
          <div className="rounded-lg border border-warning/40 bg-warning/15 p-3 text-sm">
            Active delay: <b>{s.delay.reason}</b> (+{s.delay.minutes} min)
          </div>
        )}
        <div className="space-y-1.5">
          <Label>Reason</Label>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={
                  "rounded-full border px-3 py-1.5 text-xs font-medium " +
                  (reason === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card")
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Extra minutes</Label>
          <Input
            className="h-11 max-w-32"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="h-11"
            onClick={() => {
              reportDelay(reason, Number(minutes) || 15);
              toast.success("Delay reported — all farmers notified");
            }}
          >
            Report delay & notify farmers
          </Button>
          {s.delay.active && (
            <Button
              variant="secondary"
              className="h-11"
              onClick={() => {
                clearDelay();
                toast.success("Delay cleared");
              }}
            >
              Clear delay
            </Button>
          )}
        </div>
      </div>
    </WorkerShell>
  );
}
