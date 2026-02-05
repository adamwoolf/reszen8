import React, { createContext, useContext, useReducer, ReactNode, useCallback, useMemo } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  size?: string;
};

type BasketItem = {
  product: Product;
  quantity: number;
  size?: string;
};

type BasketState = {
  items: BasketItem[];
  itemCount: number;
  totalPrice: number;
};

type BasketAction =
  | { type: "ADD_ITEM"; payload: Product; quantity?: number; size?: string }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_BASKET" };

const BasketContext = createContext<
  | {
      basket: BasketState;
      addToBasket: (product: Product, quantity?: number, size?: string) => void;
      removeFromBasket: (id: string) => void;
      updateQuantity: (id: string, quantity: number) => void;
      clearBasket: () => void;
      getItemCount: () => number;
      getTotalPrice: () => number;
    }
  | undefined
>(undefined);

const basketReducer = (state: BasketState, action: BasketAction): BasketState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === action.payload.id && item.size === action.size,
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (action.quantity || 1),
        };

        return {
          ...state,
          items: updatedItems,
          itemCount: state.itemCount + (action.quantity || 1),
          totalPrice: state.totalPrice + action.payload.price * (action.quantity || 1),
        };
      }

      const newItem = {
        product: action.payload,
        quantity: action.quantity || 1,
        size: action.size,
      };

      return {
        ...state,
        items: [...state.items, newItem],
        itemCount: state.itemCount + (action.quantity || 1),
        totalPrice: state.totalPrice + action.payload.price * (action.quantity || 1),
      };
    }

    case "REMOVE_ITEM": {
      const itemToRemove = state.items.find((_, index) => index === parseInt(action.payload));
      if (!itemToRemove) return state;

      return {
        ...state,
        items: state.items.filter((_, index) => index !== parseInt(action.payload)),
        itemCount: state.itemCount - itemToRemove.quantity,
        totalPrice: state.totalPrice - itemToRemove.product.price * itemToRemove.quantity,
      };
    }
    case "UPDATE_QUANTITY": {
      const itemToUpdate = state.items[parseInt(action.payload.id)];
      if (!itemToUpdate) return state;

      const quantityDiff = action.payload.quantity - itemToUpdate.quantity;
      const updatedItems = [...state.items];
      updatedItems[parseInt(action.payload.id)] = {
        ...itemToUpdate,
        quantity: action.payload.quantity,
      };

      return {
        ...state,
        items: updatedItems,
        itemCount: state.itemCount + quantityDiff,
        totalPrice: state.totalPrice + quantityDiff * itemToUpdate.product.price,
      };
    }
    case "CLEAR_BASKET":
      return {
        items: [],
        itemCount: 0,
        totalPrice: 0,
      };
    default:
      return state;
  }
};

export const BasketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [basket, dispatch] = useReducer(basketReducer, {
    items: [],
    itemCount: 0,
    totalPrice: 0,
  });

  const addToBasket = useCallback((product: Product, quantity: number = 1, size?: string) => {
    dispatch({ type: "ADD_ITEM", payload: product, quantity, size });
    toast.success(`${product.name} added to basket!`);
  }, []);

  const removeFromBasket = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  }, []);

  const clearBasket = useCallback(() => {
    dispatch({ type: "CLEAR_BASKET" });
  }, []);

  const getItemCount = useCallback(() => {
    return basket.itemCount;
  }, [basket.itemCount]);

  const getTotalPrice = useCallback(() => {
    return basket.totalPrice;
  }, [basket.totalPrice]);

  const contextValue = useMemo(
    () => ({
      basket,
      addToBasket,
      removeFromBasket,
      updateQuantity,
      clearBasket,
      getItemCount,
      getTotalPrice,
    }),
    [basket, addToBasket, removeFromBasket, updateQuantity, clearBasket, getItemCount, getTotalPrice],
  );

  return <BasketContext.Provider value={contextValue}>{children}</BasketContext.Provider>;
};

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
};
