import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBasketStore } from "../store/basketStore";
import { useSelector, useDispatch } from "react-redux";
import { createToast, ContentState } from "../store/contentSlice";

type ItemType = {
  id: number | string;
  title: string;
  contentType: "meditation" | "publication" | "collection";
  duration?: string;
  author?: string;
  savedDate?: string;
  uid?: string;
  createdAt?: number;
};

type SavedItemsType = {
  meditations: ItemType[];
  ebooks: ItemType[];
  publications: ItemType[];
  collections: ItemType[];
};

type SavedItemsContextType = {
  savedItems: SavedItemsType;
  addItem: (item: ItemType) => boolean;
  removeItem: (item: ItemType, type: keyof SavedItemsType) => void;
};

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

interface RootState {
  content: ContentState;
}

export const SavedItemsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { meditations } = useSelector((state: RootState) => state.content);
  const { currentUser, setCurrentUser, updateUser } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItemsType>({
    meditations: [],
    ebooks: [],
    publications: [],
    collections: [],
  });
  const { items, setItems } = useBasketStore();
  const dispatch = useDispatch();
  useEffect(() => {
    if (currentUser) {
      // REPLACE THIS AWS
      // addOrUpdate(currentUser?.firebaseId, { ...currentUser, basket: items });
      updateUser(currentUser.uid, { basket: items });
      setCurrentUser({ ...currentUser, basket: items });
    }
  }, [items]);

  useEffect(() => {
    if (currentUser?.basket) {
      if (Array.isArray(currentUser.basket)) {
        setItems(currentUser?.basket);
      } else {
        setItems([]);
      }
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
        collections: currentUser?.savedItems?.collections || [],
      });
    }
  }, [meditations, currentUser?.savedItems]);

  const addItem = (item: ItemType): boolean => {
    const itemType =
      item.contentType === "meditation"
        ? "meditations"
        : item.contentType === "collection"
        ? "collections"
        : "publications";
    const itemExists =
      itemType !== "collections"
        ? savedItems[itemType].some((savedItem) => savedItem.uid === item.uid)
        : savedItems[itemType].some((savedItem) => savedItem.id === item.id);

    if (itemExists) return false;
    if (currentUser?.savedItems && currentUser.savedItems[itemType]) {
      updateUser(currentUser.uid, {
        savedItems: { ...currentUser.savedItems, [itemType]: [...currentUser.savedItems[itemType], item] },
      });

      setCurrentUser({
        ...currentUser,
        savedItems: { ...currentUser.savedItems, [itemType]: [...currentUser.savedItems[itemType], item] },
      });
      dispatch(createToast({ text: `${item.title} has been added to Your Journey`, type: "success" }));
    } else {
      const newItems = !currentUser?.savedItems
        ? { [itemType]: [item] }
        : { ...currentUser.savedItems, [itemType]: [item] };
      updateUser(currentUser.uid, { savedItems: newItems });

      setCurrentUser({
        ...currentUser,
        savedItems: newItems,
      });
      dispatch(createToast({ text: `${item.title} has been added to Your Journey`, type: "success" }));
    }
    return true;
  };

  const removeItem = (item: ItemType, type: keyof SavedItemsType): void => {
    const newItemsArray =
      type !== "publications" && type !== "collections"
        ? [...currentUser?.savedItems[type]].filter((i) => i.createdAt !== item.createdAt)
        : [...currentUser?.savedItems[type]].filter((i) => i.id !== item.id);

    let newSavedItems = { ...currentUser?.savedItems, [type]: newItemsArray };
    if (!newItemsArray.length) delete newSavedItems[type];

    const newUserObj = Object.keys(newSavedItems).length
      ? {
          ...currentUser,
          savedItems: newSavedItems,
        }
      : { ...currentUser, savedItems: {} };
    updateUser(currentUser?.uid, { savedItems: newSavedItems });
    dispatch(createToast({ text: `${item.title} has been removed from Your Journey`, type: "success" }));

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
