import { useSyncExternalStore } from "react";
import type {
  AppNotification,
  AppState,
  Centre,
  Token,
  TokenStatus,
} from "./types";

const KEY = "kisan-setu-state-v1";
const SLOTS = [
  "09:00 AM – 10:00 AM",
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 01:00 PM",
  "01:00 PM – 02:00 PM",
];
export const TIME_SLOTS = SLOTS;

const DATE = "15 September 2026";
const TOMORROW = "16 September 2026";

const FARMER_NAMES = [
  "Amit Roy",
  "Rina Das",
  "Suman Das",
  "Bikash Mondal",
  "Sujata Ghosh",
  "Nitai Pal",
  "Habib Sk",
  "Parveen Bibi",
  "Dipak Manna",
  "Kalyan Jana",
  "Sourav Bera",
  "Anima Dolui",
  "Ratan Maity",
  "Jyotsna Sahoo",
  "Tapan Adak",
  "Sheikh Rahim",
  "Milan Patra",
  "Sabita Hazra",
  "Gopal Dutta",
  "Ashim Barman",
  "Salma Khatun",
  "Prabir Ghorai",
  "Uttam Samanta",
  "Chandan Koley",
  "Mamata Pramanik",
  "Sanjib Das",
  "Rekha Mandal",
  "Alok Bhunia",
  "Firoz Ali",
  "Nabin Chandra",
  "Bharati Rana",
  "Debu Santra",
  "Krishna Giri",
  "Sagar Naskar",
  "Piyali Ghosh",
  "Iqbal Molla",
];

function slotForToken(n: number) {
  return SLOTS[Math.min(Math.floor((n - 1) / 12), SLOTS.length - 1)];
}

function makeCentres(): Centre[] {
  const counters = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      name: `Counter ${i + 1}`,
      active: true,
    }));
  return [
    {
      centreId: "PC-BGN-01",
      code: "BGN01",
      name: "Bagnan Procurement Centre",
      address: "Bagnan Krishi Bazar, Howrah",
      distanceKm: 4.2,
      openingTime: "09:00 AM",
      closingTime: "02:00 PM",
      active: true,
      avgProcessingTime: 8,
      counters: counters(3),
      queueBase: 22,
    },
    {
      centreId: "PC-KLC-03",
      code: "KOL03",
      name: "Kaliachak Procurement Centre",
      address: "Kaliachak Block Office Road, Malda",
      distanceKm: 9.6,
      openingTime: "09:00 AM",
      closingTime: "03:00 PM",
      active: true,
      avgProcessingTime: 10,
      counters: counters(2),
      queueBase: 31,
    },
    {
      centreId: "PC-UDN-07",
      code: "UDN07",
      name: "Uluberia Procurement Centre",
      address: "Uluberia Municipality Yard, Howrah",
      distanceKm: 12.8,
      openingTime: "09:00 AM",
      closingTime: "02:00 PM",
      active: true,
      avgProcessingTime: 7,
      counters: counters(4),
      queueBase: 11,
    },
  ];
}

function seedTokens(): Token[] {
  const centreId = "PC-BGN-01";
  return FARMER_NAMES.map((name, i) => {
    const n = i + 1;
    let status: TokenStatus = "BOOKED";
    if (n <= 19) status = "COMPLETED";
    else if (n === 20) status = "PROCESSING";
    else if (n <= 26) status = "CHECKED_IN";
    if (n === 24) status = "BOOKED"; // "not arrived" demo case
    const qty = 15 + ((i * 7) % 22);
    return {
      tokenId: `TKN-${n}`,
      farmerId: `FRM${10200 + n}`,
      farmerName: name,
      mobile: `98${(30000000 + n * 137).toString().slice(0, 8)}`,
      centreId,
      date: DATE,
      tokenNumber: n,
      originalTokenNumber: n,
      slot: slotForToken(n),
      produce: n % 5 === 0 ? "Wheat" : "Paddy",
      expectedQuantity: qty,
      acceptedQuantity: n <= 19 ? qty - 0.4 : undefined,
      amount: n <= 19 ? Math.round((qty - 0.4) * 2320) : undefined,
      bookingId: `BGN01-1509-${slotForToken(n).slice(0, 2)}-${String(n).padStart(2, "0")}`,
      status,
      createdAt: "2026-09-14T10:00:00Z",
      updatedAt: "2026-09-15T09:00:00Z",
    } satisfies Token;
  });
}

function initialState(): AppState {
  return {
    farmer: null,
    worker: null,
    centres: makeCentres(),
    tokens: seedTokens(),
    history: [],
    calls: [],
    notifications: [],
    delay: { active: false, minutes: 0, reason: "" },
    date: DATE,
    tomorrow: TOMORROW,
    procurementStage: 0,
    draft: {
      produce: "",
      quantity: 25,
      unit: "quintal",
      harvestDate: "2026-09-12",
      remarks: "",
      centreId: "",
      slot: "",
    },
  };
}

let state: AppState = initialState();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / SSR */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initialState(), ...(JSON.parse(raw) as AppState) };
  } catch {
    state = initialState();
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try {
      state = JSON.parse(e.newValue) as AppState;
      emit();
    } catch {
      /* ignore */
    }
  });
}

export function set(updater: (s: AppState) => AppState | void) {
  const next = updater(state);
  if (next) state = next as AppState;
  state = { ...state };
  persist();
  emit();
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const serverSnapshot = initialState();

export function useApp<T>(select: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(serverSnapshot),
  );
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );
}

export function getState() {
  return state;
}

export function resetDemo() {
  state = initialState();
  persist();
  emit();
}

/* ---------------- derived helpers ---------------- */

export const ACTIVE_STATUSES: TokenStatus[] = [
  "BOOKED",
  "CALLED",
  "ARRIVING",
  "CHECKED_IN",
  "DELAYED",
  "RESCHEDULED",
  "NO_RESPONSE",
];

export function centreOf(s: AppState, centreId: string) {
  return s.centres.find((c) => c.centreId === centreId) ?? s.centres[0];
}

export function activeCounters(c: Centre) {
  return c.counters.filter((x) => x.active).length;
}

export function myToken(s: AppState): Token | undefined {
  return s.tokens.find((t) => t.isMine);
}

export function nowServing(s: AppState): Token | undefined {
  return (
    s.tokens.find((t) => t.status === "PROCESSING") ??
    [...s.tokens].reverse().find((t) => t.status === "COMPLETED")
  );
}

export function farmersAhead(s: AppState, token?: Token): number {
  const mine = token ?? myToken(s);
  if (!mine) return 0;
  return s.tokens.filter(
    (t) =>
      t.centreId === mine.centreId &&
      t.tokenNumber < mine.tokenNumber &&
      t.status !== "COMPLETED" &&
      t.status !== "CANCELLED",
  ).length;
}

/** ETA = (farmers ahead x avg processing time) / active counters + delay */
export function etaMinutes(s: AppState, centreId: string, ahead: number) {
  const c = centreOf(s, centreId);
  const counters = Math.max(activeCounters(c), 1);
  const base = Math.round((ahead * c.avgProcessingTime) / counters);
  return base + (s.delay.active ? s.delay.minutes : 0);
}

export function centreQueue(s: AppState, centreId: string) {
  return s.tokens.filter(
    (t) =>
      t.centreId === centreId &&
      t.status !== "COMPLETED" &&
      t.status !== "CANCELLED",
  ).length;
}

export function centreLoad(waiting: number, counters: number) {
  const perCounter = waiting / Math.max(counters, 1);
  if (perCounter < 4) return "Low";
  if (perCounter < 9) return "Medium";
  return "High";
}

/* ---------------- actions ---------------- */

const time = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

export function notify(n: Omit<AppNotification, "id" | "time" | "read">) {
  set((s) => {
    s.notifications = [
      { ...n, id: `N${Date.now()}${Math.random()}`, time: time(), read: false },
      ...s.notifications,
    ];
  });
}

export function markNotificationsRead() {
  set((s) => {
    s.notifications = s.notifications.map((n) => ({ ...n, read: true }));
  });
}

function pushHistory(
  t: Token,
  newStatus: TokenStatus,
  newTokenNumber: number,
  reason: string,
  newDate?: string,
  note?: string,
) {
  set((s) => {
    s.history = [
      {
        historyId: `H${Date.now()}${Math.random()}`,
        tokenId: t.tokenId,
        farmerName: t.farmerName,
        staffId: s.worker?.workerId ?? "PC-W-021",
        staffName: s.worker?.name ?? "Staff",
        oldStatus: t.status,
        newStatus,
        oldTokenNumber: t.tokenNumber,
        newTokenNumber,
        oldDate: t.date,
        newDate: newDate ?? t.date,
        reason,
        note,
        createdAt: time(),
      },
      ...s.history,
    ];
  });
}

export function updateToken(tokenId: string, patch: Partial<Token>) {
  set((s) => {
    s.tokens = s.tokens.map((t) =>
      t.tokenId === tokenId
        ? { ...t, ...patch, updatedAt: new Date().toISOString() }
        : t,
    );
  });
}

export function setStatus(
  tokenId: string,
  status: TokenStatus,
  reason = "Status update",
) {
  const t = getState().tokens.find((x) => x.tokenId === tokenId);
  if (!t) return;
  pushHistory(t, status, t.tokenNumber, reason);
  updateToken(tokenId, { status });
  if (t.isMine) notifyFarmerStatus(status);
}

function notifyFarmerStatus(status: TokenStatus) {
  notify({
    icon: status === "CANCELLED" ? "warn" : "info",
    title: "Your token status changed",
    body: `New status: ${label(status)}`,
  });
}

export function label(s: TokenStatus) {
  return (
    {
      BOOKED: "Booked",
      CALLED: "Called",
      ARRIVING: "Arriving",
      CHECKED_IN: "Waiting",
      PROCESSING: "Processing",
      DELAYED: "Delayed",
      RESCHEDULED: "Rescheduled",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      NO_RESPONSE: "No response",
    } as Record<TokenStatus, string>
  )[s];
}

/* ----- booking ----- */

export function bookSlot(): Token {
  const s = getState();
  const d = s.draft;
  const centre = centreOf(s, d.centreId);
  const dup = s.tokens.find(
    (t) =>
      t.isMine && t.date === s.date && ACTIVE_STATUSES.includes(t.status),
  );
  if (dup) return dup; // backend rule: one active token per farmer per day
  const nextNumber =
    Math.max(...s.tokens.map((t) => t.tokenNumber), 0) + 1;
  const slotIdx = Math.max(TIME_SLOTS.indexOf(d.slot), 0);
  const position =
    s.tokens.filter((t) => t.slot === d.slot).length + 1;
  const token: Token = {
    tokenId: `TKN-MY-${nextNumber}`,
    farmerId: s.farmer?.farmerId ?? "KISAN-DEMO-104",
    farmerName: s.farmer?.name ?? "Rahul Das",
    mobile: s.farmer?.mobile ?? "9800000104",
    centreId: centre.centreId,
    date: s.date,
    tokenNumber: nextNumber,
    originalTokenNumber: nextNumber,
    slot: d.slot,
    produce: d.produce,
    expectedQuantity: d.quantity,
    fieldVisit: d.quantity > 35,
    bookingId: `${centre.code}-1509-${String(9 + slotIdx).padStart(2, "0")}-${String(position).padStart(2, "0")}`,
    status: "BOOKED",
    isMine: true,
    paymentStage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  set((s2) => {
    s2.tokens = [...s2.tokens, token];
    s2.procurementStage = 1;
  });
  notify({
    icon: "success",
    title: "Slot confirmed",
    body: `Token P-${String(nextNumber).padStart(3, "0")} at ${centre.name}, ${d.slot}.`,
  });
  return token;
}

export function cancelMyBooking(reason: string) {
  const t = myToken(getState());
  if (!t) return;
  pushHistory(t, "CANCELLED", t.tokenNumber, reason);
  updateToken(t.tokenId, { status: "CANCELLED" });
  set((s) => {
    s.procurementStage = 0;
  });
  notify({
    icon: "warn",
    title: "Token cancelled",
    body: `Reason: ${reason}. Contact the centre if you need help.`,
  });
}

export function checkIn(tokenId: string) {
  const t = getState().tokens.find((x) => x.tokenId === tokenId);
  if (!t) return;
  pushHistory(t, "CHECKED_IN", t.tokenNumber, "Farmer checked in");
  updateToken(tokenId, { status: "CHECKED_IN" });
  if (t.isMine) {
    set((s) => {
      s.procurementStage = Math.max(s.procurementStage, 2);
    });
    notify({
      icon: "success",
      title: "Checked in",
      body: "You are now waiting in the live queue.",
    });
  }
}

/* ----- worker processing ----- */

export function startProcurement(tokenId: string) {
  const t = getState().tokens.find((x) => x.tokenId === tokenId);
  if (!t) return;
  pushHistory(t, "PROCESSING", t.tokenNumber, "Procurement started");
  updateToken(tokenId, { status: "PROCESSING" });
  if (t.isMine) {
    set((s) => {
      s.procurementStage = 3;
    });
    notify({
      icon: "info",
      title: "Your turn has started",
      body: "Verification of your produce has begun.",
    });
  }
}

export function advanceStage(tokenId: string, stage: number) {
  const t = getState().tokens.find((x) => x.tokenId === tokenId);
  if (!t?.isMine) return;
  set((s) => {
    s.procurementStage = stage;
  });
}

export function completeProcurement(
  tokenId: string,
  data: {
    actualQuantity: number;
    acceptedQuantity: number;
    quality: "Accepted" | "Partially Accepted" | "Rejected";
    remarks?: string;
  },
) {
  const t = getState().tokens.find((x) => x.tokenId === tokenId);
  if (!t) return;
  const rate = t.produce === "Wheat" ? 2275 : 2320;
  const amount = Math.round(data.acceptedQuantity * rate);
  const procurementId = `PROC-${28000 + t.tokenNumber}`;
  pushHistory(t, "COMPLETED", t.tokenNumber, "Procurement completed");
  updateToken(tokenId, {
    ...data,
    status: "COMPLETED",
    amount,
    procurementId,
    paymentId: `PAY-${9000 + t.tokenNumber}`,
    paymentStage: 1,
  });
  if (t.isMine) {
    set((s) => {
      s.procurementStage = 6;
    });
    notify({
      icon: "success",
      title: "Procurement completed",
      body: `${data.acceptedQuantity} quintals accepted. Amount ₹${amount.toLocaleString("en-IN")}.`,
    });
    notify({
      icon: "money",
      title: "Payment processing started",
      body: `Payment reference PAY-${9000 + t.tokenNumber}.`,
    });
  }
  return { procurementId, amount };
}

export function setPaymentStage(tokenId: string, stage: number) {
  const t = getState().tokens.find((x) => x.tokenId === tokenId);
  if (!t) return;
  updateToken(tokenId, { paymentStage: stage });
  if (t.isMine) {
    set((s) => {
      s.procurementStage = stage >= 4 ? 8 : 7;
    });
    notify({
      icon: "money",
      title: "Payment update",
      body: ["", "Payment generated", "Payment processing", "Payment approved", "Payment received"][stage],
    });
  }
}

/* ----- counters and delays ----- */

export function toggleCounter(centreId: string, counterId: number) {
  set((s) => {
    s.centres = s.centres.map((c) =>
      c.centreId === centreId
        ? {
            ...c,
            counters: c.counters.map((k) =>
              k.id === counterId ? { ...k, active: !k.active } : k,
            ),
          }
        : c,
    );
  });
  const c = centreOf(getState(), centreId);
  const k = c.counters.find((x) => x.id === counterId);
  notify({
    icon: k?.active ? "info" : "warn",
    title: k?.active ? "Counter resumed" : "Queue delay detected",
    body: k?.active
      ? `${k.name} is active again. Your estimated waiting time has been updated.`
      : `One procurement counter is currently unavailable. Your estimated waiting time has been updated.`,
  });
}

export function reportDelay(reason: string, minutes: number) {
  set((s) => {
    s.delay = { active: true, minutes, reason };
  });
  notify({
    icon: "warn",
    title: "Procurement centre delay",
    body: `${reason} — about ${minutes} extra minutes. Your estimated waiting time has been updated.`,
  });
}

export function clearDelay() {
  set((s) => {
    s.delay = { active: false, minutes: 0, reason: "" };
  });
  notify({
    icon: "info",
    title: "Delay cleared",
    body: "The centre is operating normally again.",
  });
}

/* ----- not-arrived workflow (backend-calculated token moves) ----- */

export function logCall(tokenId: string, result: string, note?: string) {
  const t = getState().tokens.find((x) => x.tokenId === tokenId);
  if (!t) return;
  set((s) => {
    s.calls = [
      {
        callId: `C${Date.now()}`,
        tokenId,
        farmerName: t.farmerName,
        staffId: s.worker?.workerId ?? "PC-W-021",
        callTime: time(),
        result,
        note,
      },
      ...s.calls,
    ];
  });
}

/** Move to the end of the farmer's current slot; backend calculates the number. */
export function moveToEndOfSlot(tokenId: string, reason: string) {
  const s = getState();
  const t = s.tokens.find((x) => x.tokenId === tokenId);
  if (!t) return;
  const slotTokens = s.tokens.filter(
    (x) =>
      x.centreId === t.centreId &&
      x.date === t.date &&
      x.slot === t.slot &&
      x.status !== "CANCELLED",
  );
  const last = Math.max(...slotTokens.map((x) => x.tokenNumber));
  const newNumber = last; // slides in behind everyone still in the slot
  set((st) => {
    st.tokens = st.tokens.map((x) => {
      if (x.tokenId === t.tokenId)
        return { ...x, tokenNumber: newNumber, status: "RESCHEDULED" as TokenStatus };
      if (
        x.centreId === t.centreId &&
        x.date === t.date &&
        x.tokenNumber > t.tokenNumber &&
        x.tokenNumber <= newNumber &&
        x.status !== "COMPLETED" &&
        x.status !== "CANCELLED"
      )
        return { ...x, tokenNumber: x.tokenNumber - 1 };
      return x;
    });
  });
  pushHistory(t, "RESCHEDULED", newNumber, reason);
  if (t.isMine)
    notify({
      icon: "warn",
      title: "Token updated",
      body: `Previous token ${t.tokenNumber}. New position: end of the current time slot. Please arrive as soon as possible.`,
    });
  return newNumber;
}

export function moveToFinalSlot(tokenId: string, reason: string) {
  const s = getState();
  const t = s.tokens.find((x) => x.tokenId === tokenId);
  if (!t) return;
  const finalSlot = TIME_SLOTS[TIME_SLOTS.length - 1];
  const newNumber = Math.max(...s.tokens.map((x) => x.tokenNumber)) + 1;
  updateToken(tokenId, {
    tokenNumber: newNumber,
    slot: finalSlot,
    status: "RESCHEDULED",
  });
  pushHistory(t, "RESCHEDULED", newNumber, reason);
  if (t.isMine)
    notify({
      icon: "warn",
      title: "Token rescheduled",
      body: `Moved to the final slot today (${finalSlot}). New token ${newNumber}.`,
    });
  return { newNumber, finalSlot };
}

export function moveToTomorrow(tokenId: string, reason: string) {
  const s = getState();
  const t = s.tokens.find((x) => x.tokenId === tokenId);
  if (!t) return;
  const tomorrowTokens = s.tokens.filter((x) => x.date === s.tomorrow);
  const newNumber = tomorrowTokens.length + 1;
  updateToken(tokenId, {
    tokenNumber: newNumber,
    date: s.tomorrow,
    slot: TIME_SLOTS[0],
    status: "RESCHEDULED",
  });
  pushHistory(t, "RESCHEDULED", newNumber, reason, s.tomorrow);
  if (t.isMine)
    notify({
      icon: "warn",
      title: "Token rescheduled",
      body: `Previous date ${s.date}. New date ${s.tomorrow}. New token ${newNumber}.`,
    });
  return newNumber;
}

export function cancelToken(tokenId: string, reason: string, note?: string) {
  const t = getState().tokens.find((x) => x.tokenId === tokenId);
  if (!t) return;
  pushHistory(t, "CANCELLED", t.tokenNumber, reason, undefined, note);
  updateToken(tokenId, { status: "CANCELLED" });
  if (t.isMine)
    notify({
      icon: "warn",
      title: "Token cancelled",
      body: `Reason: ${reason}. Contact the procurement centre if you need further assistance.`,
    });
}

/* ----- auth (demo only) ----- */

export function loginFarmer(profile: Partial<AppState["farmer"]>) {
  set((s) => {
    s.farmer = {
      farmerId: "KISAN-DEMO-104",
      name: "Rahul Das",
      mobile: "9800000104",
      village: "Bagnan",
      district: "Howrah",
      state: "West Bengal",
      verified: true,
      ...(profile as object),
    };
  });
}

export function loginWorker(workerId: string, centreId: string) {
  set((s) => {
    s.worker = {
      workerId,
      name: "Sanjoy Pradhan",
      centreId,
      verified: true,
    };
  });
}

export function logoutFarmer() {
  set((s) => {
    s.farmer = null;
  });
}
export function logoutWorker() {
  set((s) => {
    s.worker = null;
  });
}

export function setCounterCount(centreId: string, count: number) {
  set((s) => {
    s.centres = s.centres.map((c) =>
      c.centreId === centreId
        ? {
            ...c,
            counters: Array.from({ length: count }, (_, i) => ({
              id: i + 1,
              name: `Counter ${i + 1}`,
              active: c.counters[i]?.active ?? true,
            })),
          }
        : c,
    );
  });
}

export function setDraft(patch: Partial<AppState["draft"]>) {
  set((s) => {
    s.draft = { ...s.draft, ...patch };
  });
}
