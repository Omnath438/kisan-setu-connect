import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Clock,
  Languages,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kisan Setu — Smart Procurement. Less Waiting." },
      {
        name: "description",
        content:
          "An intelligent procurement platform connecting farmers and procurement centres through smart slot booking, real-time queue visibility and end-to-end tracking.",
      },
      { property: "og:title", content: "Kisan Setu — Smart Procurement" },
      {
        property: "og:description",
        content:
          "Smart slot booking, live queue and dynamic waiting-time estimates for agricultural procurement.",
      },
    ],
  }),
  component: Landing,
});

const LANGS = ["English", "বাংলা", "हिन्दी"];

function Landing() {
  const [lang, setLang] = useState("English");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="size-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-extrabold tracking-tight">
              KISAN SETU
            </div>
            <div className="text-[11px] text-muted-foreground">
              Government-grade procurement platform (prototype)
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <Languages className="ml-1 size-4 text-muted-foreground" />
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  lang === l
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Demo prototype — sample data
            only
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            KISAN SETU
          </h1>
          <p className="mt-2 text-lg font-semibold">
            Smart Procurement. Less Waiting. More Certainty.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            An intelligent procurement management platform connecting farmers
            and procurement centres through smart slot booking, real-time queue
            visibility and end-to-end procurement tracking.
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
            <Link
              to="/farmer"
              className="group rounded-2xl border border-border bg-card p-6 text-left transition hover:border-primary"
            >
              <Users className="size-8 text-primary" />
              <div className="mt-4 text-xl font-bold">FARMER</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Book a slot, see the live queue and track your payment.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Access Farmer Portal{" "}
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              to="/worker"
              className="group rounded-2xl border border-border bg-card p-6 text-left transition hover:border-primary"
            >
              <Activity className="size-8 text-primary" />
              <div className="mt-4 text-xl font-bold">PROCUREMENT CENTRE</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage today's queue, counters, delays and procurement.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Access Worker Portal{" "}
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-bold">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Sprout,
              t: "1. Tell us your produce",
              d: "Choose your crop and approximate quantity.",
            },
            {
              icon: MapPin,
              t: "2. Pick a centre and slot",
              d: "See today's queue and expected load before you travel.",
            },
            {
              icon: Clock,
              t: "3. Watch the live queue",
              d: "Farmers ahead, active counters and updated waiting time.",
            },
            {
              icon: BadgeCheck,
              t: "4. Track till payment",
              d: "Weighing, acceptance, amount and payment status.",
            },
          ].map((c) => (
            <div
              key={c.t}
              className="rounded-xl border border-border bg-card p-5"
            >
              <c.icon className="size-6 text-primary" />
              <div className="mt-3 font-semibold">{c.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold">About the platform</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Today a farmer travels to a procurement centre without knowing how
              crowded it is, how long the wait will be, or whether the centre is
              running late. Kisan Setu makes that whole day predictable: the
              centre's live operations are visible to the farmer, and the
              centre's staff can manage counters, delays and the token order
              from one screen.
            </p>
            <p className="mt-3 text-sm font-medium">
              We are not just digitising procurement. We are making procurement
              predictable.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold">Key benefits</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {[
                "Know how many farmers are ahead of you before you leave home",
                "Waiting time updates when counters open, close or fall behind",
                "No overcrowding — arrive close to your real turn",
                "Full progress tracking from weighing to payment received",
                "Staff can reschedule a late farmer without breaking the queue",
              ].map((b) => (
                <li key={b} className="flex gap-2">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-bold">Need help?</div>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <PhoneCall className="size-4" /> Helpline 1800-000-000 (demo) ·
              help@kisansetu.demo
            </p>
          </div>
          <Button asChild>
            <Link to="/farmer">Start the demo</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Prototype for demonstration purposes. No real Aadhaar, banking or
          government API integration is used. All names, IDs and amounts are
          fictional.
        </p>
      </footer>
    </div>
  );
}
