export type Subscription = {
  startDate: string | number | Date; // ISO string, timestamp, or Date
  duration: number;
  isActiveSub?: boolean;
  subscription: "free-trial" | "monthly";
  hasCompletedTrial: boolean;
  meditationCredits?: number;
  extraBespokeMeditationCredits?: number;
};

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  size?: string;
  quantity?: number;
}

export interface BasketItem {
  product: Product;
  quantity: number;
}

export interface SavedItem {
  id: number | string;
  title: string;
  contentType: "meditation" | "publication" | "collection";
  duration?: string;
  author?: string;
  savedDate?: string;
}

export interface SavedItemsType {
  meditations: SavedItem[];
  ebooks: SavedItem[];
  publications: SavedItem[];
  collections: SavedItem[];
}

interface activityItem {
  id: string;
  category: string;
  duration?: number;
  timeStamp: number;
  isBespoke?: boolean;
}
export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  meditations?: Meditation[];
  basket?: BasketItem[];
  firebaseId: string;
  firstName?: string;
  surName?: string;
  savedItems?: SavedItemsType;
  subscription?: Subscription;
  isGod?: boolean;
  favourites?: {
    publications?: string[];
    meditations?: string[];
  };
  consents?: {
    termsAndConditions: boolean;
    analytics: boolean;
    marketing: boolean;
    essentials: boolean;
  };

  activity?: {
    meditations: activityItem[];
    articles: activityItem[];
    collections?: activityItem[];
  };

  authProvider?: "cognito" | "enterprise";
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
  category?: any[];
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
