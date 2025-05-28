import React, { createContext, useContext, useState, ReactNode } from 'react';

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

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

export const SavedItemsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedItems, setSavedItems] = useState<SavedItemsType>({
    meditations: [],
    ebooks: [],
    publications: []
  });

  const addItem = (item: ItemType) => {
    const itemType = item.type === 'meditation' ? 'meditations' : 
                    item.type === 'ebook' ? 'ebooks' : 'publications';
    
    // Check if item already exists
    const itemExists = savedItems[itemType].some(savedItem => savedItem.id === item.id);
    
    if (!itemExists) {
      setSavedItems(prev => ({
        ...prev,
        [itemType]: [
          ...prev[itemType], 
          { 
            ...item, 
            savedDate: new Date().toISOString().split('T')[0] 
          }
        ]
      }));
      return true; // Item was added
    }
    return false; // Item already exists
  };

  const removeItem = (itemId: number, type: keyof SavedItemsType) => {
    setSavedItems(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== itemId)
    }));
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
