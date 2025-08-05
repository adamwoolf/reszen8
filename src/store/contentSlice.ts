import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Publication } from "../models";

interface ContentState {
  meditations: any[];
  publications: any[];
  meta: any;
}

const initialState: ContentState = {
  meditations: [],
  publications: [],
  meta: {
    likes: [],
    meditationLikes: [],
  },
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
  },
});

export const { setMeditations, setPublications, setMeta } = contentSlice.actions;
export default contentSlice.reducer;
