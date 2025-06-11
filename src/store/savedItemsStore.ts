import { create } from "zustand";
import { persist } from "zustand/middleware";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  size?: string;
  quantity: number;
  savedAt?: string;
};

type SavedItemsStore = {
  savedItems: Product[];
  saveItem: (item: Omit<Product, 'savedAt'>) => void;
  removeSavedItem: (id: string, size?: string) => void;
  moveToBasket: (id: string, size?: string) => Product | null;
  clearSavedItems: () => void;
};

export const useSavedItemsStore = create<SavedItemsStore>()(
  persist(
    (set, get) => ({
      savedItems: [],

      saveItem: (item) =>
        set((state) => {
          // Check if item with same ID and size already exists
          const existingIndex = state.savedItems.findIndex(
            (i) => i.id === item.id && i.size === item.size
          );

          if (existingIndex >= 0) {
            // Update quantity if item exists
            const updatedItems = [...state.savedItems];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + item.quantity,
            };
            return { savedItems: updatedItems };
          }

          // Add new item with current timestamp
          return {
            savedItems: [
              ...state.savedItems,
              {
                ...item,
                savedAt: new Date().toISOString(),
              },
            ],
          };
        }),

      removeSavedItem: (id, size) =>
        set((state) => ({
          savedItems: state.savedItems.filter(
            (item) => !(item.id === id && item.size === size)
          ),
        })),

      moveToBasket: (id, size) => {
        const item = get().savedItems.find(
          (i) => i.id === id && i.size === size
        );
        
        if (item) {
          get().removeSavedItem(id, size);
          return item;
        }
        return null;
      },

      clearSavedItems: () => set({ savedItems: [] }),
    }),
    {
      name: "saved-items-storage",
    }
  )
);
