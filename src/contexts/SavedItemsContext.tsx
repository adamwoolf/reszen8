import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import useFirebasedatabase from "../hooks/useFirestoreCollection";
import { useAuth } from "../contexts/AuthContext";
import { useBasketStore } from "../store/basketStore";
import { useSelector, useDispatch } from "react-redux";
import { setDashboard } from "../store/contentSlice";

type ItemType = {
  id: number;
  title: string;
  contentType: "meditation" | "publication";
  duration?: string;
  author?: string;
  savedDate?: string;
};

type SavedItemsType = {
  meditations: ItemType[];
  ebooks: ItemType[];
  publications: ItemType[];
};

type SavedItemsContextType = {
  savedItems: SavedItemsType;
  addItem: (item: ItemType) => void;
  removeItem: (itemId: number, type: keyof SavedItemsType) => void;
};

const LOCAL_STORAGE_KEY = "reszen8_saved_items";

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

export const SavedItemsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { meditations, dashboard } = useSelector((state) => state.content);
  const { currentUser, setCurrentUser, updateUser } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItemsType>({ meditations: [], ebooks: [], publications: [] });
  const { items, setItems } = useBasketStore();
  const dispatch = useDispatch();
  useEffect(() => {
    if (currentUser) {
      // REPLACE THIS AWS
      // addOrUpdate(currentUser?.firebaseId, { ...currentUser, basket: items });
    }
  }, [items]);

  useEffect(() => {
    console.log(currentUser);

    if (currentUser?.basket) {
      setItems(Object.values(currentUser?.basket));
    }
    if (!currentUser) {
      setItems([]);
    }
  }, [currentUser]);

  // set savedItems with data from db
  useEffect(() => {
    if (currentUser && currentUser.savedItems) {
      setSavedItems({
        ebooks: currentUser?.savedItems?.ebooks || [],
        publications: currentUser?.savedItems?.publications || [],
        meditations: currentUser?.savedItems?.meditations || [],
      });
    }
  }, [meditations, currentUser?.savedItems]);

  const addItem = (item: ItemType) => {
    const itemType = item.contentType === "meditation" ? "meditations" : "publications";
    const itemExists = savedItems[itemType].some((savedItem) => savedItem.createdAt === item.createdAt);

    if (itemExists) return false;
    if (currentUser.savedItems && currentUser.savedItems[itemType]) {
      updateUser(currentUser?.uid, {
        savedItems: { ...currentUser?.savedItems, [itemType]: [...currentUser.savedItems?.[itemType], item] },
      });

      setCurrentUser({
        ...currentUser,
        savedItems: { ...currentUser?.savedItems, [itemType]: [...currentUser.savedItems?.[itemType], item] },
      });
    } else {
      const newItems = !currentUser.savedItems
        ? { [itemType]: [item] }
        : { ...currentUser?.savedItems, [itemType]: [item] };
      updateUser(currentUser?.uid, { savedItems: newItems });

      setCurrentUser({
        ...currentUser,
        savedItems: newItems,
      });
    }
    return true;
  };

  const removeItem = (item: any, type: keyof SavedItemsType) => {
    console.log("item", item);

    const newItemsArray =
      type !== "publications"
        ? [...currentUser?.savedItems[type]].filter((i) => i.createdAt !== item.createdAt)
        : [...currentUser?.savedItems[type]].filter((i) => i.id !== item.id);

    console.log([...currentUser?.savedItems[type]].filter((i) => i.id !== item.id));

    let newSavedItems = { ...currentUser?.savedItems, [type]: newItemsArray };
    if (!newItemsArray.length) delete newSavedItems[type];

    const newUserObj = Object.keys(newSavedItems).length
      ? {
          ...currentUser,
          savedItems: newSavedItems,
        }
      : { ...currentUser, savedItems: {} };
    updateUser(currentUser?.uid, { savedItems: newSavedItems });

    setCurrentUser(newUserObj);
  };

  return (
    <SavedItemsContext.Provider value={{ savedItems, addItem, removeItem }}>{children}</SavedItemsContext.Provider>
  );
};

export const useSavedItems = () => {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    throw new Error("useSavedItems must be used within a SavedItemsProvider");
  }
  return context;
};
