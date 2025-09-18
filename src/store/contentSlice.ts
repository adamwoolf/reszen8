import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Publication, AmbientEnv } from "../models";
import test from "../assets/audio/space.mp3";

export interface ContentState {
  meditations: any[];
  publications: any[];
  meta: any;
  staticMeditations: any[];
  currentAudio: AudioObject;
  articles: any[];
  immersiveEnv: AmbientEnv;
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
  currentAudio: { url: "", isImmersive: false },
  articles: [],
  immersiveEnv: { name: "Warm", url: test },
  landingPageActive: true,
};

export const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setMeditations: (state, action: PayloadAction<any[]>) => {
      state.meditations = action.payload;
    },
    setPublications: (state, action: PayloadAction<Publication[]>) => {
      state.publications = action.payload;
    },
    setMeta: (state, action: PayloadAction<any>) => {
      state.meta = action.payload;
    },
    setStaticMeditations: (state, action: PayloadAction<any>) => {
      state.staticMeditations = action.payload;
    },
    setCurrentAudio: (state, action: PayloadAction<AudioObject>) => {
      state.currentAudio = action.payload;
    },
    setArticles: (state, action: PayloadAction<any[]>) => {
      const awsArticles = action.payload.map((a) => ({
        fields: { ...a, body: a.content, slug: a.title, audioFile: { fields: { file: { url: a.audioUrl } } } },
        sys: { ...a },
      }));
      state.articles = action.payload;
      state.publications = action.payload;
    },
    setLikes: (state, action) => {
      const { likes, uid, content } = action.payload;
      if (content === "Bespoke_Meditations") {
        state.meditations = [...state.meditations].map((med) => {
          console.log(likes, uid);
          if (uid === med.uid) return { ...med, likes };
          return med;
        });
      }
      if (content === "Articles") {
        state.publications = [...state.publications].map((med) => {
          console.log(likes, uid);
          if (uid === med.uid) return { ...med, likes };
          return med;
        });
      }
      if (content === "Static_Meditations") {
        state.staticMeditations = [...state.staticMeditations].map((med) => {
          console.log(likes, uid);
          if (uid === med.uid) return { ...med, likes };
          return med;
        });
      }
    },
    setImmersiveEnv: (state, action) => {
      state.immersiveEnv = action.payload;
    },
    setLandingPageActive: (state, action) => {
      state.landingPageActive = action.payload;
    },
  },
});

export const {
  setMeditations,
  setArticles,
  setCurrentAudio,
  setPublications,
  setMeta,
  setStaticMeditations,
  setLikes,
  setImmersiveEnv,
  setLandingPageActive,
} = contentSlice.actions;
export default contentSlice.reducer;
