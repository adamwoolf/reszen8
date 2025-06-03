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
};

type BasketItem = {
  product: Product;
  quantity: number;
};

type BasketStore = {
  items: BasketItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearBasket: () => void;
  itemCount: () => number;
  totalPrice: () => number;
};

export const useBasketStore = create<BasketStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.product.size === product.size
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity: 1 }],
          };
        }),

      removeItem: (productId: string, size?: string) =>
        set((state: any) => {
          const itemToDelete = state.items.find(
            (item: any) => item.product.id === productId && item.product.size === size
          );
          console.log(itemToDelete);
          return {
            items: state.items.filter((item: any) => item !== itemToDelete),
          };
        }),

      updateQuantity: (productId: string, size: string, quantity: number) =>
        set((state: any) => ({
          items:
            quantity <= 0
              ? state.items.filter((item: any) => item.product.id !== productId && item.product?.size !== size)
              : state.items.map((item: any) =>
                  item.product.id === productId && item.product.size === size ? { ...item, quantity } : item
                ),
        })),

      clearBasket: () => set({ items: [] }),

      itemCount: () => get().items.reduce((total: number, item: any) => total + item.quantity, 0),

      totalPrice: () => get().items.reduce((total: number, item: any) => total + item.product.price * item.quantity, 0),
    }),
    {
      name: "basket-storage",
    }
  )
);
