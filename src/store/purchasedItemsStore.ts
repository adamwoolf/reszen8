import { create } from "zustand";
import { persist } from "zustand/middleware";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  size?: string;
  quantity?: number;
  purchaseDate?: string;
};

type PurchasedItemsStore = {
  purchasedItems: Product[];
  addPurchasedItems: (items: Product[]) => void;
  clearPurchasedItems: () => void;
};

export const usePurchasedItemsStore = create<PurchasedItemsStore>()(
  persist(
    (set) => ({
      purchasedItems: [],

      addPurchasedItems: (items) =>
        set((state) => ({
          purchasedItems: [
            ...state.purchasedItems,
            ...items.map(item => ({
              ...item,
              purchaseDate: new Date().toISOString()
            }))
          ]
        })),

      clearPurchasedItems: () => set({ purchasedItems: [] }),
    }),
    {
      name: "purchased-items-storage",
    }
  )
);
