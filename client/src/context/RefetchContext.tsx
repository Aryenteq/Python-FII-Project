import React, { createContext, useContext, useState } from "react";
import { normalizePath } from "../utils/normalizePath";

interface RefetchContextProps {
    refetchPaths: string[];
    addPathsToRefetch: (json: { changed_paths: string[]; }) => void
    removePathFromRefetch: (path: string) => void;
}

const RefetchContext = createContext<RefetchContextProps | undefined>(undefined);

export const RefetchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [refetchPaths, setRefetchPaths] = useState<string[]>([]);
    
    // const addPathsToRefetch = (json: { changed_paths: string[] }) => {
    //     const { changed_paths } = json;
    
    //     if (!changed_paths || !Array.isArray(changed_paths)) {
    //         console.error("Invalid data: 'changed_paths' is missing or not an array.");
    //         return;
    //     }
    
    //     setRefetchPaths((prev) => {
    //         const normalizedPaths = changed_paths.map(normalizePath);
    //         const newPaths = normalizedPaths.filter((path) => !prev.includes(path));
    //         return [...prev, ...newPaths];
    //     });
    
    //     console.log("added: ", changed_paths);
    // };
    
    // const removePathFromRefetch = (path: string | string[]) => {
    //     setRefetchPaths((prev) => {
    //         if (Array.isArray(path)) {
    //             const normalizedPaths = path.map(normalizePath);
    //             return prev.filter((p) => !normalizedPaths.includes(p));
    //         }
    //         return prev.filter((p) => p !== normalizePath(path));
    //     });
    //     console.log("Removed paths: ", Array.isArray(path) ? path : [path]);
    // };    

    const addPathsToRefetch = (json: { changed_paths: string[] }) => {
        const { changed_paths } = json;
    
        if (!changed_paths || !Array.isArray(changed_paths)) {
            console.error("Invalid data: 'changed_paths' is missing or not an array.");
            return;
        }
    
        setRefetchPaths((prev) => {
            const normalizedPaths = changed_paths.map((path) => {
                return normalizePath(path);
            });
            const newPaths = normalizedPaths.filter((path) => !prev.includes(path));
            return [...prev, ...newPaths];
        });

        console.log("added: ", changed_paths);
    };

    const removePathFromRefetch = (path: string | string[]) => {
        setRefetchPaths((prev) => {
            if (Array.isArray(path)) {
                return prev.filter((p) => !path.includes(p)); // Remove multiple paths
            }
            return prev.filter((p) => p !== path); // Remove a single path
        });
        console.log("Removed paths: ", Array.isArray(path) ? path : [path]);
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