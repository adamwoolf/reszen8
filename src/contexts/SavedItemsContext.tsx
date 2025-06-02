import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type ItemType = {
  id: number;
  title: string;
  type: 'meditation' | 'ebook' | 'publication';
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

const LOCAL_STORAGE_KEY = 'reszen8_saved_items';

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

export const SavedItemsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedItems, setSavedItems] = useState<SavedItemsType>(() => {
    if (typeof window === 'undefined') {
      return { meditations: [], ebooks: [], publications: [] };
    }
    
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved items from localStorage', e);
      }
    }
    return { meditations: [], ebooks: [], publications: [] };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedItems));
  }, [savedItems]);

  const addItem = (item: ItemType) => {
    const itemType = item.type === 'meditation' ? 'meditations' : 
                    item.type === 'ebook' ? 'ebooks' : 'publications';
    
    const itemExists = savedItems[itemType].some(savedItem => savedItem.id === item.id);
    
    if (!itemExists) {
      setSavedItems(prev => {
        const newItems = {
          ...prev,
          [itemType]: [
            ...prev[itemType], 
            { 
              ...item, 
              savedDate: new Date().toISOString() 
            }
          ]
        };
        return newItems;
      });
      return true;
    }
    return false;
  };

  const removeItem = (itemId: number, type: keyof SavedItemsType) => {
    setSavedItems(prev => {
      const newItems = {
        ...prev,
        [type]: prev[type].filter(item => item.id !== itemId)
      };
      return newItems;
    });
  };

  return (
    <SavedItemsContext.Provider value={{ savedItems, addItem, removeItem }}>
      {children}
    </SavedItemsContext.Provider>
  );
};

export const useSavedItems = () => {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
};
