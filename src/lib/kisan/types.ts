export type TokenStatus =
  | "BOOKED"
  | "CALLED"
  | "ARRIVING"
  | "CHECKED_IN"
  | "PROCESSING"
  | "DELAYED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_RESPONSE";

export interface Token {
  tokenId: string;
  farmerId: string;
  farmerName: string;
  mobile: string;
  centreId: string;
  date: string;
  tokenNumber: number;
  originalTokenNumber: number;
  slot: string;
  produce: string;
  expectedQuantity: number;
  actualQuantity?: number;
  acceptedQuantity?: number;
  quality?: "Accepted" | "Partially Accepted" | "Rejected";
  remarks?: string;
  amount?: number;
  procurementId?: string;
  paymentId?: string;
  paymentStage?: number; // 0..4
  bookingId: string;
  status: TokenStatus;
  isMine?: boolean;
  fieldVisit?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  historyId: string;
  tokenId: string;
  farmerName: string;
  staffId: string;
  staffName: string;
  oldStatus: TokenStatus;
  newStatus: TokenStatus;
  oldTokenNumber: number;
  newTokenNumber: number;
  oldDate: string;
  newDate: string;
  reason: string;
  note?: string;
  createdAt: string;
}

export interface CallLog {
  callId: string;
  tokenId: string;
  farmerName: string;
  staffId: string;
  callTime: string;
  result: string;
  note?: string;
}

export interface Counter {
  id: number;
  name: string;
  active: boolean;
}

export interface Centre {
  centreId: string;
  code: string;
  name: string;
  address: string;
  distanceKm: number;
  openingTime: string;
  closingTime: string;
  active: boolean;
  avgProcessingTime: number;
  counters: Counter[];
  queueBase: number;
}

export interface FarmerProfile {
  farmerId: string;
  name: string;
  mobile: string;
  village: string;
  district: string;
  state: string;
  verified: boolean;
  produce?: string;
}

export interface WorkerProfile {
  workerId: string;
  name: string;
  centreId: string;
  verified: boolean;
}

export interface AppNotification {
  id: string;
  icon: "info" | "warn" | "success" | "money";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface Delay {
  active: boolean;
  minutes: number;
  reason: string;
}

export interface AppState {
  farmer: FarmerProfile | null;
  worker: WorkerProfile | null;
  centres: Centre[];
  tokens: Token[];
  history: HistoryEntry[];
  calls: CallLog[];
  notifications: AppNotification[];
  delay: Delay;
  date: string;
  tomorrow: string;
  procurementStage: number; // farmer timeline 0..8
  draft: {
    produce: string;
    quantity: number;
    unit: string;
    harvestDate: string;
    remarks: string;
    centreId: string;
    slot: string;
  };
}
