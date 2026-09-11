import { createFileRoute } from "@tanstack/react-router";
import { FarmerShell, InfoRow, Timeline } from "@/components/kisan/ui";
import { myToken, useAppState } from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/payment")({
  head: () => ({
    meta: [
      { title: "Payment status — Kisan Setu" },
      {
        name: "description",
        content:
          "Track your procurement payment from generation and approval to money received in your bank account.",
      },
      { property: "og:title", content: "Payment status — Kisan Setu" },
      {
        property: "og:description",
        content: "Track your procurement payment step by step.",
      },
    ],
  }),
  component: PaymentPage,
});

const STEPS = [
  "Payment generated",
  "Payment processing",
  "Payment approved",
  "Payment received",
];

function PaymentPage() {
  const s = useAppState();
  const token = myToken(s);
  const stage = token?.paymentStage ?? 0;

  return (
    <FarmerShell title="Payment status">
      {token?.amount !== undefined ? (
        <>
          <div className="rounded-xl border-2 border-success/40 bg-success/8 p-5 text-center">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Amount payable
            </div>
            <div className="text-4xl font-extrabold text-success tabular-nums">
              ₹{token.amount.toLocaleString("en-IN")}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {token.acceptedQuantity} quintals of {token.produce}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <InfoRow k="Procurement ID" v={token.procurementId ?? "—"} />
            <InfoRow k="Payment reference" v={token.paymentId ?? "—"} />
            <InfoRow k="Bank account" v="•••• 4412 (State Bank of India)" />
            <InfoRow k="Mode" v="Direct bank transfer" />
            <InfoRow
              k="Current stage"
              v={stage > 0 ? STEPS[stage - 1] : "Awaiting completion"}
              strong
            />
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <Timeline steps={STEPS} current={stage} />
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Payment details appear after your procurement is completed at the
          centre.
        </div>
      )}
    </FarmerShell>
  );
}
