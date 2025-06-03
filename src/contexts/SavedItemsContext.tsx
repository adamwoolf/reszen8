import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import useFirebasedatabase from "../hooks/useFirestoreCollection";
import { useAuth } from "../contexts/AuthContext";
type ItemType = {
  id: number;
  title: string;
  type: "meditation" | "ebook" | "publication";
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
  const { data: meditations } = useFirebasedatabase("meditations");
  const { addOrUpdate, data: users } = useFirebasedatabase("USERS");
  const { currentUser, setCurrentUser } = useAuth();

  useEffect(() => {
    // MOVE THIS TO USER CONTEXT
    if (users && currentUser) {
      const allDetails = Object.values(users).find((u) => u.email === currentUser.email);
      console.log(users);
      console.log(currentUser);
      console.log(allDetails);
      setCurrentUser({ ...currentUser, ...allDetails });
    }
  }, [users]);

  const [savedItems, setSavedItems] = useState<SavedItemsType>({ meditations: [], ebooks: [], publications: [] });

  useEffect(() => {
    if (meditations && currentUser) {
      const medArray = Object.values(meditations);

      setSavedItems({
        ebooks: savedItems.ebooks,
        publications: savedItems.publications,
        meditations: currentUser?.savedItems?.meditations || [],
      });
    }
  }, [meditations, currentUser]);

  console.log("SAVED", savedItems);

  // Save to localStorage whenever savedItems changes - do this
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedItems));
    // addOrUpdate(currentUser.firebaseId, { ...currentUser, savedItems });
  }, [savedItems]);
  console.log("current", currentUser);
  const addItem = (item: ItemType) => {
    const itemType = item.type === "meditation" ? "meditations" : item.type === "ebook" ? "ebooks" : "publications";
    addOrUpdate(currentUser.firebaseId, {
      ...currentUser,
      savedItems: { ...currentUser?.savedItems, [itemType]: [...currentUser.savedItems[itemType], item] },
    });
    // Check if item already exists
    const itemExists = savedItems[itemType].some((savedItem) => savedItem.id === item.id);

    if (!itemExists) {
      setSavedItems((prev) => {
        const newItems = {
          ...prev,
          [itemType]: [
            ...prev[itemType],
            {
              ...item,
              savedDate: new Date().toISOString(),
            },
          ],
        };
        return newItems;
      });
      return true;
    }
    return false;
  };

  const removeItem = (itemId: number, type: keyof SavedItemsType) => {
    setSavedItems((prev) => {
      const newItems = {
        ...prev,
        [type]: prev[type].filter((item) => item.id !== itemId),
      };
      return newItems;
    });
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
