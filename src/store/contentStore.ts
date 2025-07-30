import { create } from "zustand";

type ContentStore = {
  publications: any[];
  setPublications: (payload: any) => void;
};

export const useContentStore = create<ContentStore>((set, get) => ({
  publications: [],
  setPublications: (publications: any) => set({ publications }),
}));
