export type Subscription = {
  startDate: string | number | Date; // ISO string, timestamp, or Date
  duration: number;
  isActiveSub?: boolean;
  subscription: "free-trial" | "monthly";
  hasCompletedTrial: boolean;
  meditationCredits?: number;
};

export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  meditations?: [];
  basket?: {};
  firebaseId: string;
  firstName?: string;
  surName?: string;
  savedItems?: {};
  subscription?: Subscription;
  isGod?: boolean;
}

export interface Meditation {
  generatedBy?: string;
  audioUrl: string;
  createdAt?: number;
  language?: string;
  title: string;
  type: string;
}
