import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Publication, AmbientEnv, Meditation } from "../models";

export interface Toast {
  text: string;
  type: string;
}

export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  features?: string[];
}

export interface CollectionImage {
  id: string;
  url: string;
  title?: string;
}

export interface MetaData {
  likes: Array<{ id: string; count: number }>;
  meditationLikes: Array<{ id: string; count: number }>;
}

export interface ContentState {
  meditations: Meditation[];
  publications: Publication[];
  meta: MetaData;
  staticMeditations: Meditation[];
  currentAudio?: AudioObject;
  articles: Publication[];
  immersiveEnv: AmbientEnv;
  membershipTiers: MembershipTier[];
  landingPageActive: boolean;
  toasts: Toast[];
  collectionImages: CollectionImage[];
  locationAllowed: boolean;
  meditationThemes: any[];
  showSignupModal: boolean;
  videos: any[];
  showGodControls: boolean;
}

export interface AudioObject {
  url: string;
  isImmersive: boolean;
  landingPageActive: boolean;
}

const initialState: ContentState = {
  meditations: [],
  publications: [],
  meta: {
    likes: [],
    meditationLikes: [],
  },
  staticMeditations: [],
  articles: [],
  immersiveEnv: { name: "Warm", url: "/audio/space.mp3" },
  landingPageActive: true,
  membershipTiers: [],
  toasts: [],
  collectionImages: [],
  locationAllowed: true,
  meditationThemes: [],
  showSignupModal: false,
  videos: [],
  showGodControls: true,
};

export const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setMeditations: (state, action: PayloadAction<Meditation[]>) => {
      state.meditations = action.payload;
    },
    setPublications: (state, action: PayloadAction<Publication[]>) => {
      state.publications = action.payload;
    },
    setMeta: (state, action: PayloadAction<MetaData>) => {
      state.meta = action.payload;
    },
    setStaticMeditations: (state, action: PayloadAction<Meditation[]>) => {
      state.staticMeditations = action.payload;
    },
    setArticles: (state, action: PayloadAction<Publication[]>) => {
      state.articles = action.payload;
      state.publications = action.payload;
    },
    setLikes: (state, action: PayloadAction<{ likes: number; uid: string; content: string }>) => {
      const { likes, uid, content } = action.payload;
      if (content === "Bespoke_Meditations") {
        state.meditations = state.meditations.map((med) => {
          if ("uid" in med && uid === med.uid) return { ...med, likes };
          return med;
        });
      }
      if (content === "Articles") {
        state.publications = state.publications.map((pub) => {
          if ("uid" in pub && uid === pub.uid) return { ...pub, likes };
          return pub;
        });
      }
      if (content === "Static_Meditations") {
        state.staticMeditations = state.staticMeditations.map((med) => {
          if ("uid" in med && uid === med.uid) return { ...med, likes };
          return med;
        });
      }
    },
    setImmersiveEnv: (state, action: PayloadAction<AmbientEnv>) => {
      state.immersiveEnv = action.payload;
    },
    setLandingPageActive: (state, action: PayloadAction<boolean>) => {
      state.landingPageActive = action.payload;
    },
    setMembershipTiers: (state, action: PayloadAction<MembershipTier[]>) => {
      state.membershipTiers = action.payload;
    },
    createToast: (state, action: PayloadAction<Toast>) => {
      state.toasts = [...state.toasts, action.payload];
    },
    deleteToast: (state, action: PayloadAction<Toast>) => {
      state.toasts = state.toasts.filter((t) => t.text !== action.payload.text);
    },
    setCollectionImages: (state, action: PayloadAction<CollectionImage[]>) => {
      state.collectionImages = action.payload;
    },
    setMeditationThemes: (state, action: PayloadAction<any[]>) => {
      state.meditationThemes = action.payload;
    },
    setLocationAllowed: (state, action) => {
      state.locationAllowed = action.payload;
    },
    setShowSignupModal: (state, action) => {
      state.showSignupModal = action.payload;
    },
    setVideos: (state, action) => {
      state.videos = action.payload;
    },
    setShowGodControls: (state, action) => {
      state.showGodControls = action.payload;
    },
  },
});

export const {
  setVideos,
  setMeditationThemes,
  setMeditations,
  setArticles,
  setPublications,
  setMeta,
  setStaticMeditations,
  setLikes,
  setImmersiveEnv,
  setLandingPageActive,
  setMembershipTiers,
  createToast,
  deleteToast,
  setCollectionImages,
  setLocationAllowed,
  setShowSignupModal,
  setShowGodControls,
} = contentSlice.actions;
export default contentSlice.reducer;
