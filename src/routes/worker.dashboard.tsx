import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, PlayCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, Stat, WorkerShell } from "@/components/kisan/ui";
import {
  ACTIVE_STATUSES,
  activeCounters,
  cancelToken,
  centreOf,
  centreQueue,
  checkIn,
  etaMinutes,
  logCall,
  moveToEndOfSlot,
  moveToFinalSlot,
  moveToTomorrow,
  setStatus,
  startProcurement,
  useAppState,
} from "@/lib/kisan/store";
import type { Token } from "@/lib/kisan/types";

export const Route = createFileRoute("/worker/dashboard")({
  head: () => ({
    meta: [
      { title: "Today's queue — Kisan Setu Staff" },
      {
        name: "description",
        content:
          "Manage today's procurement queue: check farmers in, start processing and handle farmers who have not arrived.",
      },
      { property: "og:title", content: "Today's queue — Kisan Setu Staff" },
      {
        property: "og:description",
        content: "Check in farmers, start processing, handle no-shows.",
      },
    ],
  }),
  component: WorkerDashboard,
});

function WorkerDashboard() {
  const s = useAppState();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Token | null>(null);

  const centreId = s.worker?.centreId ?? s.centres[0].centreId;
  const centre = centreOf(s, centreId);
  const tokens = s.tokens
    .filter((t) => t.centreId === centreId)
    .sort((a, b) => a.tokenNumber - b.tokenNumber);
  const waiting = centreQueue(s, centreId);
  const completed = tokens.filter((t) => t.status === "COMPLETED").length;
  const eta = etaMinutes(s, centreId, waiting);

  const list = tokens.filter((t) => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return (
      t.farmerName.toLowerCase().includes(term) ||
      t.mobile.includes(term) ||
      String(t.tokenNumber) === term
    );
  });

  return (
    <WorkerShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{centre.name}</h1>
          <p className="text-sm text-muted-foreground">
            {s.date} · {centre.openingTime} – {centre.closingTime}
          </p>
        </div>
        <div className="relative w-72 max-w-full">
          <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
          <Input
            className="h-10 pl-9"
            placeholder="Search farmer, mobile or token"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat value={tokens.length} caption="Tokens today" />
        <Stat value={waiting} caption="Waiting" tone="warn" />
        <Stat value={completed} caption="Completed" tone="success" />
        <Stat value={activeCounters(centre)} caption="Active counters" />
        <Stat value={`${eta} min`} caption="Queue clearance" tone="info" />
      </div>

      {s.delay.active && (
        <p className="mt-3 rounded-xl border border-warning/40 bg-warning/15 p-3 text-sm font-medium">
          Delay reported: {s.delay.reason} (+{s.delay.minutes} min).{" "}
          <Link to="/worker/counters" className="underline">
            Manage
          </Link>
        </p>
      )}

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-secondary text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="p-3">Token</th>
              <th className="p-3">Farmer</th>
              <th className="p-3">Slot</th>
              <th className="p-3">Produce</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((t) => (
              <tr key={t.tokenId} className={t.isMine ? "bg-primary/5" : ""}>
                <td className="p-3 font-bold tabular-nums">
                  P-{String(t.tokenNumber).padStart(3, "0")}
                </td>
                <td className="p-3">
                  <div className="font-medium">
                    {t.farmerName}
                    {t.isMine && (
                      <span className="ml-2 text-xs text-primary">(demo farmer)</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.mobile}</div>
                </td>
                <td className="p-3 whitespace-nowrap">{t.slot}</td>
                <td className="p-3">
                  {t.produce} · {t.expectedQuantity}q
                </td>
                <td className="p-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    {t.status === "BOOKED" && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => checkIn(t.tokenId)}
                        >
                          Check in
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpen(t)}
                        >
                          <Phone className="mr-1 size-3.5" /> Not arrived
                        </Button>
                      </>
                    )}
                    {(t.status === "CHECKED_IN" ||
                      t.status === "RESCHEDULED" ||
                      t.status === "ARRIVING") && (
                      <Button
                        size="sm"
                        onClick={() => {
                          startProcurement(t.tokenId);
                          navigate({
                            to: "/worker/token/$id",
                            params: { id: t.tokenId },
                          });
                        }}
                      >
                        <PlayCircle className="mr-1 size-3.5" /> Start
                      </Button>
                    )}
                    {t.status === "PROCESSING" && (
                      <Button size="sm" asChild>
                        <Link to="/worker/token/$id" params={{ id: t.tokenId }}>
                          Continue
                        </Link>
                      </Button>
                    )}
                    {ACTIVE_STATUSES.includes(t.status) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setStatus(t.tokenId, "CALLED", "Farmer called")}
                      >
                        Call
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <NotArrivedPanel token={open} onClose={() => setOpen(null)} />
      )}
    </WorkerShell>
  );
}

function NotArrivedPanel({
  token,
  onClose,
}: {
  token: Token;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [called, setCalled] = useState(false);

  const act = (fn: () => void) => {
    fn();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 p-4 md:items-center">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-lg">
        <h2 className="text-lg font-bold">
          Farmer not arrived — P-{String(token.tokenNumber).padStart(3, "0")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {token.farmerName} · {token.mobile}
        </p>

        <div className="mt-4 space-y-2">
          <Button
            variant="secondary"
            className="h-11 w-full justify-start"
            onClick={() => {
              logCall(token.tokenId, called ? "No response" : "Call placed", note);
              setCalled(true);
            }}
          >
            <Phone className="mr-2 size-4" />
            {called ? "Log another call attempt" : "Call farmer and log attempt"}
          </Button>
          <Input
            placeholder="Note (optional) — e.g. farmer said 20 minutes away"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Decide what happens to the token
          </p>
          <Button
            className="h-11 w-full justify-start"
            variant="outline"
            onClick={() => {
              logCall(token.tokenId, "Farmer arriving soon", note);
              act(() => setStatus(token.tokenId, "ARRIVING", "Farmer arriving soon"));
            }}
          >
            Farmer is on the way — keep the token
          </Button>
          <Button
            className="h-11 w-full justify-start"
            variant="outline"
            onClick={() =>
              act(() => moveToEndOfSlot(token.tokenId, "Farmer not arrived"))
            }
          >
            Move to the end of the current time slot
          </Button>
          <Button
            className="h-11 w-full justify-start"
            variant="outline"
            onClick={() =>
              act(() => moveToFinalSlot(token.tokenId, "Farmer not arrived"))
            }
          >
            Move to the last slot of today
          </Button>
          <Button
            className="h-11 w-full justify-start"
            variant="outline"
            onClick={() =>
              act(() => moveToTomorrow(token.tokenId, "Farmer not arrived"))
            }
          >
            Reschedule to tomorrow
          </Button>
          <Button
            className="h-11 w-full justify-start"
            variant="destructive"
            onClick={() =>
              act(() => cancelToken(token.tokenId, "No response from farmer", note))
            }
          >
            Cancel the token
          </Button>
        </div>

        <Button variant="ghost" className="mt-3 h-10 w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
