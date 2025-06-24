export type Subscription = {
  startDate: string | number | Date; // ISO string, timestamp, or Date
  duration: number;
  isActiveSub?: boolean;
  subscription: "free-trial" | "monthly";
  hasCompletedTrial: boolean;
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
}
