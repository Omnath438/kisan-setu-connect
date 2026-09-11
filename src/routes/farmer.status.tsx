import { createFileRoute } from "@tanstack/react-router";
import { FarmerShell, InfoRow, Timeline } from "@/components/kisan/ui";
import { myToken, useAppState } from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/status")({
  head: () => ({
    meta: [
      { title: "Procurement progress — Kisan Setu" },
      {
        name: "description",
        content:
          "Follow every step of your procurement, from booking and check-in to weighing, quality check and receipt.",
      },
      { property: "og:title", content: "Procurement progress — Kisan Setu" },
      {
        property: "og:description",
        content: "Step-by-step progress of your produce at the centre.",
      },
    ],
  }),
  component: StatusPage,
});

const STEPS = [
  "Slot booked",
  "Checked in at centre",
  "Waiting in queue",
  "Verification started",
  "Weighing in progress",
  "Quality check",
  "Procurement completed",
  "Payment processing",
  "Payment received",
];

function StatusPage() {
  const s = useAppState();
  const token = myToken(s);

  return (
    <FarmerShell title="Procurement progress">
      {token ? (
        <>
          <div className="rounded-xl border border-border bg-card p-4">
            <InfoRow
              k="Token"
              v={`P-${String(token.tokenNumber).padStart(3, "0")}`}
              strong
            />
            <InfoRow k="Produce" v={token.produce} />
            <InfoRow k="Expected" v={`${token.expectedQuantity} quintals`} />
            {token.actualQuantity !== undefined && (
              <InfoRow k="Weighed" v={`${token.actualQuantity} quintals`} />
            )}
            {token.acceptedQuantity !== undefined && (
              <InfoRow
                k="Accepted"
                v={`${token.acceptedQuantity} quintals`}
                strong
              />
            )}
            {token.quality && <InfoRow k="Quality" v={token.quality} />}
            {token.amount !== undefined && (
              <InfoRow
                k="Amount"
                v={`₹${token.amount.toLocaleString("en-IN")}`}
                strong
              />
            )}
            {token.remarks && <InfoRow k="Staff remarks" v={token.remarks} />}
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <Timeline steps={STEPS} current={s.procurementStage} />
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Progress will appear here once you book a slot.
        </div>
      )}
    </FarmerShell>
  );
}
