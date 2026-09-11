import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FarmerShell, InfoRow, Stat, StatusBadge } from "@/components/kisan/ui";
import {
  cancelMyBooking,
  centreOf,
  checkIn,
  etaMinutes,
  farmersAhead,
  myToken,
  useAppState,
} from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/booking")({
  head: () => ({
    meta: [
      { title: "My booking & token — Kisan Setu" },
      {
        name: "description",
        content:
          "Your procurement token, booking ID, centre details, check-in and live position in the queue.",
      },
      { property: "og:title", content: "My booking — Kisan Setu" },
      {
        property: "og:description",
        content: "Token details, check-in and live queue position.",
      },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  const s = useAppState();
  const token = myToken(s);
  const [reason, setReason] = useState("");

  if (!token)
    return (
      <FarmerShell title="My booking" back>
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            You have no booking yet.
          </p>
          <Button asChild className="mt-4 h-11">
            <Link to="/farmer/book">Book a slot</Link>
          </Button>
        </div>
      </FarmerShell>
    );

  const centre = centreOf(s, token.centreId);
  const ahead = farmersAhead(s, token);
  const eta = etaMinutes(s, token.centreId, ahead);
  const cancelled = token.status === "CANCELLED";

  return (
    <FarmerShell title="My booking" subtitle={centre.name} back>
      <div className="rounded-xl border-2 border-primary bg-card p-5 text-center">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Your token number
        </div>
        <div className="mt-1 text-5xl font-extrabold tracking-tight text-primary tabular-nums">
          P-{String(token.tokenNumber).padStart(3, "0")}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <StatusBadge status={token.status} />
          <span className="text-xs text-muted-foreground">
            Booking ID {token.bookingId}
          </span>
        </div>
        <div className="mt-4 flex flex-col items-center gap-1 text-muted-foreground">
          <QrCode className="size-16" />
          <span className="text-xs">Show this at the centre gate</span>
        </div>
      </div>

      {!cancelled && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat value={ahead} caption="Farmers ahead" />
          <Stat value={`${eta} min`} caption="Estimated wait" tone="info" />
          <Stat value={token.slot.slice(0, 8)} caption="Your slot" />
        </div>
      )}

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <InfoRow k="Farmer" v={token.farmerName} />
        <InfoRow k="Mobile" v={token.mobile} />
        <InfoRow k="Centre" v={centre.name} />
        <InfoRow k="Address" v={centre.address} />
        <InfoRow k="Date" v={token.date} strong />
        <InfoRow k="Time slot" v={token.slot} strong />
        <InfoRow
          k="Produce"
          v={`${token.produce} · ${token.expectedQuantity} quintals`}
        />
        {token.fieldVisit && (
          <InfoRow k="Field collection" v="Yes (above 35 quintals)" strong />
        )}
      </div>

      {!cancelled && (
        <>
          {token.status === "BOOKED" ? (
            <Button
              className="mt-4 h-12 w-full text-base"
              onClick={() => checkIn(token.tokenId)}
            >
              <CheckCircle2 className="mr-2 size-5" /> I have arrived — check in
            </Button>
          ) : (
            <Button asChild className="mt-4 h-12 w-full text-base">
              <Link to="/farmer/queue">View live queue</Link>
            </Button>
          )}

          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Cannot come today?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Cancelling frees your slot for another farmer.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Crop not ready", "Transport problem", "Health issue"].map(
                (r) => (
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
                ),
              )}
            </div>
            <Button
              variant="destructive"
              className="mt-3 h-11 w-full"
              disabled={!reason}
              onClick={() => cancelMyBooking(reason)}
            >
              Cancel my token
            </Button>
          </div>
        </>
      )}
    </FarmerShell>
  );
}
