import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoRow, StatusBadge, WorkerShell } from "@/components/kisan/ui";
import {
  advanceStage,
  completeProcurement,
  setPaymentStage,
  useAppState,
} from "@/lib/kisan/store";

export const Route = createFileRoute("/worker/token/$id")({
  head: () => ({
    meta: [
      { title: "Process farmer — Kisan Setu Staff" },
      {
        name: "description",
        content:
          "Verify the farmer, record weighing and quality, complete procurement and move the payment forward.",
      },
      { property: "og:title", content: "Process farmer — Kisan Setu Staff" },
      {
        property: "og:description",
        content: "Weighing, quality check, completion and payment updates.",
      },
    ],
  }),
  component: ProcessToken,
});

const PAY_STAGES = [
  "Payment generated",
  "Payment processing",
  "Payment approved",
  "Payment received",
];

function ProcessToken() {
  const { id } = useParams({ from: "/worker/token/$id" });
  const navigate = useNavigate();
  const s = useAppState();
  const token = s.tokens.find((t) => t.tokenId === id);

  const [actual, setActual] = useState("");
  const [accepted, setAccepted] = useState("");
  const [quality, setQuality] = useState<
    "Accepted" | "Partially Accepted" | "Rejected"
  >("Accepted");
  const [remarks, setRemarks] = useState("");

  if (!token)
    return (
      <WorkerShell>
        <p className="text-sm text-muted-foreground">Token not found.</p>
      </WorkerShell>
    );

  const done = token.status === "COMPLETED";

  return (
    <WorkerShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">
            Token P-{String(token.tokenNumber).padStart(3, "0")} ·{" "}
            {token.farmerName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {token.mobile} · Booking {token.bookingId}
          </p>
        </div>
        <StatusBadge status={token.status} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold">Farmer & booking</h2>
          <InfoRow k="Kisan ID" v={token.farmerId} />
          <InfoRow k="Slot" v={token.slot} />
          <InfoRow k="Produce" v={token.produce} strong />
          <InfoRow k="Expected quantity" v={`${token.expectedQuantity} quintals`} />
          {token.fieldVisit && <InfoRow k="Field collection" v="Yes" strong />}
          {!done && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  advanceStage(token.tokenId, 4);
                  toast.success("Weighing started");
                }}
              >
                Start weighing
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  advanceStage(token.tokenId, 5);
                  toast.success("Quality check started");
                }}
              >
                Start quality check
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-semibold">Weighing & quality</h2>
          {done ? (
            <>
              <InfoRow k="Weighed" v={`${token.actualQuantity} quintals`} />
              <InfoRow k="Accepted" v={`${token.acceptedQuantity} quintals`} strong />
              <InfoRow k="Quality" v={token.quality ?? "—"} />
              <InfoRow k="Procurement ID" v={token.procurementId ?? "—"} />
              <InfoRow
                k="Amount"
                v={`₹${(token.amount ?? 0).toLocaleString("en-IN")}`}
                strong
              />
              {token.remarks && <InfoRow k="Remarks" v={token.remarks} />}
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Actual quantity (quintals)</Label>
                  <Input
                    className="h-11"
                    inputMode="decimal"
                    value={actual}
                    onChange={(e) =>
                      setActual(e.target.value.replace(/[^\d.]/g, ""))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Accepted quantity</Label>
                  <Input
                    className="h-11"
                    inputMode="decimal"
                    value={accepted}
                    onChange={(e) =>
                      setAccepted(e.target.value.replace(/[^\d.]/g, ""))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Quality result</Label>
                <Select
                  value={quality}
                  onValueChange={(v) => setQuality(v as typeof quality)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Accepted", "Partially Accepted", "Rejected"].map((x) => (
                      <SelectItem key={x} value={x}>
                        {x}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Remarks</Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Moisture, foreign matter, etc."
                />
              </div>
              <Button
                className="h-12 w-full text-base"
                onClick={() => {
                  const a = Number(actual);
                  const acc = Number(accepted);
                  if (!a || !acc)
                    return toast.error("Enter weighed and accepted quantity");
                  if (acc > a)
                    return toast.error("Accepted cannot exceed weighed quantity");
                  const r = completeProcurement(token.tokenId, {
                    actualQuantity: a,
                    acceptedQuantity: acc,
                    quality,
                    remarks,
                  });
                  toast.success(
                    `Procurement completed · ₹${(r?.amount ?? 0).toLocaleString("en-IN")}`,
                  );
                }}
              >
                Complete procurement
              </Button>
            </div>
          )}
        </div>
      </div>

      {done && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-semibold">Payment status</h2>
          <div className="flex flex-wrap gap-2">
            {PAY_STAGES.map((p, i) => {
              const stage = i + 1;
              const active = (token.paymentStage ?? 0) >= stage;
              return (
                <Button
                  key={p}
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => setPaymentStage(token.tokenId, stage)}
                >
                  {active ? "✓ " : ""}
                  {p}
                </Button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            The farmer sees each change instantly on their payment screen.
          </p>
          <Button
            variant="secondary"
            className="mt-4 h-11"
            onClick={() => navigate({ to: "/worker/dashboard" })}
          >
            Back to today's queue
          </Button>
        </div>
      )}
    </WorkerShell>
  );
}
