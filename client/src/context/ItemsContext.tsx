import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ItemsContextProps {
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
    cuttedItems: string[];
    setCuttedItems: React.Dispatch<React.SetStateAction<string[]>>;
    cuttedItemsPath: string | null;
    setCuttedItemsPath: React.Dispatch<React.SetStateAction<string | null>>;
    copiedItems: string[];
    setCopiedItems: React.Dispatch<React.SetStateAction<string[]>>;
    showHiddenItems: boolean;
    setShowHiddenItems: React.Dispatch<React.SetStateAction<boolean>>;
}

const ItemsContext = createContext<ItemsContextProps | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [cuttedItems, setCuttedItems] = useState<string[]>([]);
    const [cuttedItemsPath, setCuttedItemsPath] = useState<string | null>(null);
    const [copiedItems, setCopiedItems] = useState<string[]>([]);

    const [showHiddenItems, setShowHiddenItems] = useState<boolean>(false);

    return (
        <ItemsContext.Provider
            value={{
                selectedItems,
                setSelectedItems,
                cuttedItems,
                setCuttedItems,
                cuttedItemsPath,
                setCuttedItemsPath,
                copiedItems,
                setCopiedItems,
                showHiddenItems,
                setShowHiddenItems
            }}
        >
            {children}
        </ItemsContext.Provider>
    );
};

export const useItems = (): ItemsContextProps => {
    const context = useContext(ItemsContext);
    if (!context) {
        throw new Error('useItems must be used within an ItemsProvider');
    }
    return context;
};