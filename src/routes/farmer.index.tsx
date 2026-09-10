import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopBar } from "@/components/kisan/ui";
import { loginFarmer } from "@/lib/kisan/store";

export const Route = createFileRoute("/farmer/")({
  head: () => ({
    meta: [
      { title: "Farmer Login — Kisan Setu" },
      {
        name: "description",
        content:
          "Login or register with your Kisan ID to book procurement slots and follow the live queue.",
      },
      { property: "og:title", content: "Farmer Portal — Kisan Setu" },
      {
        property: "og:description",
        content: "Login or register with your Kisan ID (demo verification).",
      },
    ],
  }),
  component: FarmerAuth,
});

const EXISTING_USED = "KISAN-DEMO-104"; // has used the app before
const EXISTING_NEW = "KISAN-DEMO-777"; // exists, never used the app

function FarmerAuth() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Welcome Farmer" subtitle="Kisan Setu Farmer Portal" back />
      <main className="mx-auto max-w-md px-4 py-6">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0" />
          Demo verification only — no real Aadhaar or bank check is performed.
          Try Kisan ID <b className="mx-1">{EXISTING_USED}</b> (existing user) or{" "}
          <b className="mx-1">{EXISTING_NEW}</b> (first time).
        </div>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signin">Sign-in</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginFlow />
          </TabsContent>
          <TabsContent value="signin">
            <SignInFlow />
          </TabsContent>
          <TabsContent value="register">
            <RegisterFlow />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Otp({
  onDone,
  mobile,
}: {
  onDone: () => void;
  mobile: string;
}) {
  const [otp, setOtp] = useState("");
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Demo OTP sent to {mobile || "your mobile"}. Use <b>123456</b>.
      </p>
      <Label htmlFor="otp">Enter OTP</Label>
      <Input
        id="otp"
        inputMode="numeric"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        placeholder="123456"
      />
      <Button
        className="h-12 w-full text-base"
        onClick={() => {
          if (otp.length !== 6) return toast.error("Enter the 6-digit OTP");
          onDone();
        }}
      >
        Verify OTP
      </Button>
    </div>
  );
}

function LoginFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [kisanId, setKisanId] = useState(EXISTING_USED);
  const [mobile, setMobile] = useState("9800000104");

  if (step === 1)
    return (
      <Card>
        <Otp
          mobile={mobile}
          onDone={() => {
            loginFarmer({ farmerId: kisanId, mobile, verified: true });
            toast.success("Identity verified");
            navigate({ to: "/farmer/dashboard" });
          }}
        />
      </Card>
    );

  return (
    <Card>
      <Field label="Kisan ID (registered)" value={kisanId} onChange={setKisanId} />
      <Field
        label="Registered mobile number"
        value={mobile}
        onChange={setMobile}
        inputMode="numeric"
      />
      <Button
        className="h-12 w-full text-base"
        onClick={() => {
          if (kisanId.trim() === EXISTING_NEW)
            return toast.info(
              "This Kisan ID has never used the app. Please use the Sign-in tab.",
            );
          if (kisanId.trim() !== EXISTING_USED)
            return toast.error(
              "Kisan ID does not exist. Would you like to register? Use the Register tab.",
            );
          if (mobile.length < 10) return toast.error("Enter a valid mobile number");
          setStep(1);
        }}
      >
        Send OTP
      </Button>
    </Card>
  );
}

function SignInFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [kisanId, setKisanId] = useState(EXISTING_NEW);
  const [mobile, setMobile] = useState("9800000777");
  const [name, setName] = useState("Rahul Das");
  const [district, setDistrict] = useState("Howrah");
  const [village, setVillage] = useState("Bagnan");

  return (
    <Card>
      {step === 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            First time using the app with an existing Kisan ID.
          </p>
          <Field label="Kisan ID" value={kisanId} onChange={setKisanId} />
          <Field
            label="Registered mobile number"
            value={mobile}
            onChange={setMobile}
            inputMode="numeric"
          />
          <Button
            className="h-12 w-full text-base"
            onClick={() => {
              if (![EXISTING_NEW, EXISTING_USED].includes(kisanId.trim()))
                return toast.error(
                  "Kisan ID does not exist — please register a new Kisan ID.",
                );
              setStep(1);
            }}
          >
            Send OTP
          </Button>
        </>
      )}
      {step === 1 && <Otp mobile={mobile} onDone={() => setStep(2)} />}
      {step === 2 && (
        <>
          <p className="text-sm font-medium text-success">
            ✓ Identity verified — confirm your basic profile
          </p>
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="District" value={district} onChange={setDistrict} />
          <Field label="Village" value={village} onChange={setVillage} />
          <Button
            className="h-12 w-full text-base"
            onClick={() => {
              if (!name || !district || !village)
                return toast.error("All fields are required");
              loginFarmer({
                farmerId: kisanId,
                name,
                mobile,
                district,
                village,
                verified: true,
              });
              toast.success(`Welcome, ${name}`);
              navigate({ to: "/farmer/dashboard" });
            }}
          >
            Confirm and continue
          </Button>
        </>
      )}
    </Card>
  );
}

function RegisterFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    name: "Rahul Das",
    mobile: "9800000104",
    village: "Bagnan",
    district: "Howrah",
    state: "West Bengal",
    aadhaar: "",
    epic: "",
    bank: "",
    produce: "Paddy",
  });
  const up = (k: string) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  if (step === 2)
    return (
      <Card>
        <div className="flex flex-col items-center py-6 text-center">
          <BadgeCheck className="size-12 text-success" />
          <div className="mt-3 text-lg font-bold">✓ Identity verified</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Kisan ID created (demo): KISAN-DEMO-104
          </p>
          <Button
            className="mt-6 h-12 w-full text-base"
            onClick={() => {
              loginFarmer({
                name: f.name,
                mobile: f.mobile,
                village: f.village,
                district: f.district,
                state: f.state,
                produce: f.produce,
                verified: true,
              });
              navigate({ to: "/farmer/dashboard" });
            }}
          >
            Welcome, {f.name} — continue
          </Button>
        </div>
      </Card>
    );

  if (step === 1)
    return (
      <Card>
        <p className="text-sm font-semibold">Verify Your Identity</p>
        <p className="text-xs text-muted-foreground">
          Demo verification — enter sample ID. Nothing is sent anywhere.
        </p>
        <Field
          label="Aadhaar number (demo)"
          value={f.aadhaar}
          onChange={up("aadhaar")}
          inputMode="numeric"
        />
        <Field label="EPIC / Voter ID (demo)" value={f.epic} onChange={up("epic")} />
        <Field
          label="Bank account number (demo)"
          value={f.bank}
          onChange={up("bank")}
          inputMode="numeric"
        />
        <div className="space-y-1">
          <Label>Bank passbook & land document (khatian / ROR)</Label>
          <Input type="file" accept=".jpg,.jpeg,.png" multiple />
          <p className="text-xs text-muted-foreground">
            JPG or PNG. Demo upload — files are not stored.
          </p>
        </div>
        <Otp
          mobile={f.mobile}
          onDone={() => {
            if (f.aadhaar.length < 12)
              return toast.error("Enter a 12-digit sample Aadhaar number");
            if (!f.bank) return toast.error("Enter a sample bank account number");
            setStep(2);
          }}
        />
      </Card>
    );

  return (
    <Card>
      <Field label="Full name" value={f.name} onChange={up("name")} />
      <Field
        label="Mobile number"
        value={f.mobile}
        onChange={up("mobile")}
        inputMode="numeric"
      />
      <Field label="Village" value={f.village} onChange={up("village")} />
      <Field label="District" value={f.district} onChange={up("district")} />
      <Field label="State" value={f.state} onChange={up("state")} />
      <Field label="Produce type" value={f.produce} onChange={up("produce")} />
      <Button
        className="h-12 w-full text-base"
        onClick={() => {
          if (!f.name || f.mobile.length < 10)
            return toast.error("Name and a valid mobile number are required");
          setStep(1);
        }}
      >
        Continue to verification
      </Button>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-5">
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "numeric" | "text";
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="h-11"
      />
    </div>
  );
}
