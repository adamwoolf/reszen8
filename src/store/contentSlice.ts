import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Publication } from "../models";

export interface ContentState {
  meditations: any[];
  publications: any[];
  meta: any;
  staticMeditations: any[];
  currentAudio: string;
  articles: any[];
}

const initialState: ContentState = {
  meditations: [],
  publications: [],
  meta: {
    likes: [],
    meditationLikes: [],
  },
  staticMeditations: [],
  currentAudio: "",
  articles: [],
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
    setCurrentAudio: (state, action: PayloadAction<string>) => {
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
      const { likes, uid } = action.payload;
      state.meditations = [...state.meditations].map((med) => {
        console.log(likes, uid);
        if (uid === med.uid) return { ...med, likes };
        return med;
      });
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
} = contentSlice.actions;
export default contentSlice.reducer;
