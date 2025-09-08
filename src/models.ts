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
  favourites?: {
    publications?: [];
    meditations?: [];
  };
}

export interface Meditation {
  generatedBy?: string;
  audioUrl: string;
  createdAt?: number;
  language?: string;
  title: string;
  type: string;
  content: string;
  likes?: number;
}

export interface Publication {
  fields: {
    title: string;
    body: string;
    slug: string;
  };
}

export interface Like {
  likes: number;
  id: string;
}

export interface AmbientEnv {
  name: string;
  url: string;
}
