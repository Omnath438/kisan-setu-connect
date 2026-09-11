import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FarmerShell, InfoRow } from "@/components/kisan/ui";
import { bookSlot, centreOf, useAppState } from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/confirm")({
  head: () => ({
    meta: [
      { title: "Confirm your slot — Kisan Setu" },
      {
        name: "description",
        content:
          "Review your crop, quantity, centre and time slot before confirming your procurement token.",
      },
      { property: "og:title", content: "Confirm your slot — Kisan Setu" },
      {
        property: "og:description",
        content: "Review your booking details before confirming.",
      },
    ],
  }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const s = useAppState();
  const navigate = useNavigate();
  const d = s.draft;
  const centre = centreOf(s, d.centreId);

  return (
    <FarmerShell title="Confirm your booking" back>
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-2 font-semibold">Booking summary</h2>
        <div className="border-t border-border pt-2">
          <InfoRow k="Farmer" v={s.farmer?.name ?? "Rahul Das"} />
          <InfoRow k="Kisan ID" v={s.farmer?.farmerId ?? "KISAN-DEMO-104"} />
          <InfoRow k="Crop" v={d.produce || "Paddy"} strong />
          <InfoRow k="Quantity" v={`${d.quantity} quintals`} />
          <InfoRow k="Harvest date" v={d.harvestDate} />
          <InfoRow k="Centre" v={centre.name} />
          <InfoRow k="Address" v={centre.address} />
          <InfoRow k="Date" v={s.date} strong />
          <InfoRow k="Time slot" v={d.slot} strong />
          {d.remarks && <InfoRow k="Remarks" v={d.remarks} />}
        </div>
      </div>

      {d.quantity > 35 && (
        <p className="mt-3 rounded-xl border border-warning/40 bg-warning/15 p-3 text-xs">
          Your quantity is above 35 quintals, so centre staff will visit your
          location with digital weighing equipment on the booked day.
        </p>
      )}

      <p className="mt-3 rounded-xl border border-border bg-secondary p-3 text-xs text-muted-foreground">
        Please reach the centre 15 minutes before your slot. You can check in
        from the app once you arrive. Only one active token is allowed per
        farmer per day.
      </p>

      <Button
        className="mt-4 h-12 w-full text-base"
        onClick={() => {
          bookSlot();
          navigate({ to: "/farmer/booking" });
        }}
      >
        Confirm booking
      </Button>
    </FarmerShell>
  );
}
