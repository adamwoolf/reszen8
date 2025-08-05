import { create } from "zustand";

type ContentStore = {
  publications: any[];
  meditations: [];
  setPublications: (payload: any) => void;
  setMeditations: (payload: any) => void;
};

export const useContentStore = create<ContentStore>((set, get) => ({
  publications: [],
  meditations: null,
  setPublications: (publications: any) => set({ publications }),
  setMeditations: (meds: any) => {
    return set({
      meditations: meds,
    });
  },
}));
