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

  setItems: (items: BasketItem[]) => set({ items }),

  addItem: (product: Product) =>
    set((state: any) => {
      const productWithDefaults = {
        ...product,
        name: product.name || "Membership",
        price: product.price || 0,
      };
      console.log(productWithDefaults);
      const existingItem = state.items.find(
        (item) => item.product.id === productWithDefaults.id && item.product.size === productWithDefaults.size
      );

      if (existingItem && product.type !== "subscription") {
        return {
          items: state.items.map((item) =>
            item.product.id === productWithDefaults.id && item.product.size === productWithDefaults.size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      if (product.type === "subscription") {
        if (state.items.some((item) => item.product.type === "subscription")) return { items: state.items };
        return {
          items: [
            ...state.items.filter((item) => item.type !== "subscription"),
            { product: productWithDefaults, quantity: 1 },
          ],
        };
      }

      return {
        items: [...state.items, { product: productWithDefaults, quantity: 1 }],
      };
    }),

  removeItem: (productId, size) => {
    set((state) => {
      const filteredItems = state.items.filter((item) => item.product.id !== productId || item.product.size !== size);
      return {
        items: filteredItems,
      };
    });
  },

  updateQuantity: (productId, size, quantity) => {
    return set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.product.id !== productId || item.product.size !== size)
          : state.items.map((item) =>
              item.product.id === productId && item.product.size === size ? { ...item, quantity } : item
            ),
    }));
  },

  clearBasket: () => set({ items: [] }),

  itemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),

  totalPrice: () => get().items.reduce((total, item) => total + item.product.price * item.quantity, 0),
}));
