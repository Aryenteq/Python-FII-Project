import React, { createContext, useContext, useState } from "react";

interface RefetchContextProps {
    refetchPaths: string[];
    addPathsToRefetch: (json: { changed_paths: string[]; }) => void
    removePathFromRefetch: (path: string) => void;
}

const RefetchContext = createContext<RefetchContextProps | undefined>(undefined);

export const RefetchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [refetchPaths, setRefetchPaths] = useState<string[]>([]);

    const addPathsToRefetch = (json: { changed_paths: string[] }) => {
        const { changed_paths } = json;
    
        if (!changed_paths || !Array.isArray(changed_paths)) {
            console.error("Invalid data: 'changed_paths' is missing or not an array.");
            return;
        }
    
        setRefetchPaths((prev) => {
            const normalizedPaths = changed_paths.map((path) => {
                // Random regex to replace \ with /
                // Replace backslashes with forward slashes
                let normalizedPath = path.replace(/\\/g, "/");
                // Ensure `F:/` becomes `F://`
                normalizedPath = normalizedPath.replace(/^([A-Za-z]):\//, "$1://");
                return normalizedPath;
            });
            const newPaths = normalizedPaths.filter((path) => !prev.includes(path));
            return [...prev, ...newPaths];
        });
    };    

    const removePathFromRefetch = (path: string) => {
        setRefetchPaths((prev) => prev.filter((p) => p !== path));
    };

    return (
        <RefetchContext.Provider value={{ refetchPaths, addPathsToRefetch, removePathFromRefetch }}>
            {children}
        </RefetchContext.Provider>
    );
};

export const useRefetch = (): RefetchContextProps => {
    const context = useContext(RefetchContext);
    if (!context) {
        throw new Error("useRefetch must be used within a RefetchProvider");
    }
    return context;
};