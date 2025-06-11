import { create } from "zustand";

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
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearBasket: () => void;
  itemCount: () => number;
  totalPrice: () => number;
  setItems: (items: BasketItem[]) => void; // To load items from DB
};

export const useBasketStore = create<BasketStore>((set, get) => ({
  items: [],

  setItems: (items) => set({ items }),

  addItem: (product) =>
    set((state) => {
      const productWithDefaults = {
        ...product,
        name: product.name || "Membership",
        price: product.price || 0,
      };

      const existingItem = state.items.find(
        (item) => item.product.id === productWithDefaults.id && item.product.size === productWithDefaults.size
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.product.id === productWithDefaults.id && item.product.size === productWithDefaults.size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        items: [...state.items, { product: productWithDefaults, quantity: 1 }],
      };
    }),

  removeItem: (productId, size) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId || item.product.size !== size),
    })),

  updateQuantity: (productId, size, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.product.id !== productId || item.product.size !== size)
          : state.items.map((item) =>
              item.product.id === productId && item.product.size === size ? { ...item, quantity } : item
            ),
    })),

  clearBasket: () => set({ items: [] }),

  itemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),

  totalPrice: () => get().items.reduce((total, item) => total + item.product.price * item.quantity, 0),
}));
