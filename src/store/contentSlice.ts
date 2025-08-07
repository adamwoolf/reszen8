import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Publication } from "../models";

interface ContentState {
  meditations: any[];
  publications: any[];
  meta: any;
  staticMeditations: any[];
}

const initialState: ContentState = {
  meditations: [],
  publications: [],
  meta: {
    likes: [],
    meditationLikes: [],
  },
  staticMeditations: [],
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
  },
});

export const { setMeditations, setPublications, setMeta, setStaticMeditations } = contentSlice.actions;
export default contentSlice.reducer;
