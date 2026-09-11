import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopBar } from "@/components/kisan/ui";
import { loginWorker, useAppState } from "@/lib/kisan/store";

export const Route = createFileRoute("/worker/")({
  head: () => ({
    meta: [
      { title: "Staff sign in — Kisan Setu" },
      {
        name: "description",
        content:
          "Procurement centre staff sign in to manage today's queue, counters, delays and payments.",
      },
      { property: "og:title", content: "Staff sign in — Kisan Setu" },
      {
        property: "og:description",
        content: "Sign in to the procurement centre staff portal.",
      },
    ],
  }),
  component: WorkerLogin,
});

function WorkerLogin() {
  const s = useAppState();
  const navigate = useNavigate();
  const [id, setId] = useState("PC-W-021");
  const [pin, setPin] = useState("1234");
  const [centre, setCentre] = useState(s.centres[0].centreId);

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Staff Portal" subtitle="Procurement centre login" back />
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="size-5" />
            <span className="text-sm font-semibold">
              Authorised staff access only
            </span>
          </div>
          <div className="space-y-1.5">
            <Label>Staff ID</Label>
            <Input
              className="h-11"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>PIN</Label>
            <Input
              className="h-11"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Procurement centre</Label>
            <Select value={centre} onValueChange={setCentre}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {s.centres.map((c) => (
                  <SelectItem key={c.centreId} value={c.centreId}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="h-12 w-full text-base"
            onClick={() => {
              loginWorker(id || "PC-W-021", centre);
              navigate({ to: "/worker/dashboard" });
            }}
          >
            Sign in
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo credentials are pre-filled.
          </p>
        </div>
      </main>
    </div>
  );
}
