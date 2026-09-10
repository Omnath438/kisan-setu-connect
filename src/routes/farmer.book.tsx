import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, TriangleAlert } from "lucide-react";
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
import { FarmerShell } from "@/components/kisan/ui";
import { CROPS, UNITS, toQuintal } from "@/lib/kisan/crops";
import { setDraft, useApp } from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/book")({
  head: () => ({
    meta: [
      { title: "What are you selling? — Kisan Setu" },
      {
        name: "description",
        content:
          "Choose your crop, enter the approximate quantity and find procurement centres near you.",
      },
      { property: "og:title", content: "Book a procurement slot" },
      {
        property: "og:description",
        content: "Choose your crop and quantity, then find a centre.",
      },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const navigate = useNavigate();
  const draft = useApp((s) => s.draft);
  const [q, setQ] = useState(draft.produce);
  const [produce, setProduce] = useState(draft.produce);
  const [quantity, setQuantity] = useState(String(draft.quantity));
  const [unit, setUnit] = useState(draft.unit);
  const [harvest, setHarvest] = useState(draft.harvestDate);
  const [remarks, setRemarks] = useState(draft.remarks);

  const suggestions = useMemo(() => {
    if (!q.trim()) return [];
    return CROPS.filter((c) =>
      c.toLowerCase().startsWith(q.trim().toLowerCase()),
    ).slice(0, 6);
  }, [q]);

  const qtyNum = Number(quantity) || 0;
  const quintals = toQuintal(qtyNum, unit);
  const fieldVisit = quintals > 35;

  return (
    <FarmerShell title="What are you selling?" back>
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label>Search your crop</Label>
          <div className="relative">
            <Search className="absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="h-11 pl-9"
              placeholder="Type e.g. p for potato, pumpkin, pea…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setProduce("");
              }}
            />
          </div>
          {suggestions.length > 0 && produce !== q && (
            <div className="overflow-hidden rounded-lg border border-border">
              {suggestions.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setProduce(c);
                    setQ(c);
                  }}
                  className="block w-full px-3 py-2.5 text-left text-sm hover:bg-secondary"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          {produce && (
            <p className="text-sm font-semibold text-success">
              Selected: {produce}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Approximate quantity</Label>
            <Input
              className="h-11"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          That is <b>{quintals} quintals</b> ({Math.round(quintals * 100)} kg).
        </p>

        {fieldVisit && (
          <div className="rounded-lg border border-warning/40 bg-warning/15 p-3 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="size-4" /> Large quantity — field
              collection
            </div>
            <p className="mt-1 text-xs">
              Above 35 quintals, centre staff will visit your location with
              digital weighing equipment on the same day, verify quality and
              bring the produce to the centre. The usual procurement steps
              continue after that.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Harvest date</Label>
          <Input
            type="date"
            className="h-11"
            value={harvest}
            onChange={(e) => setHarvest(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Remarks (optional)</Label>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Anything the centre should know"
          />
        </div>

        <Button
          className="h-12 w-full text-base"
          onClick={() => {
            if (!produce) return toast.error("Please choose your crop");
            if (quintals <= 0) return toast.error("Enter a valid quantity");
            setDraft({
              produce,
              quantity: quintals,
              unit,
              harvestDate: harvest,
              remarks,
            });
            navigate({ to: "/farmer/centres" });
          }}
        >
          Find procurement centres
        </Button>
      </div>
    </FarmerShell>
  );
}
