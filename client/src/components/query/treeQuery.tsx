import { useQuery } from "react-query";
import { useInfo } from "../../context/InfoContext";
import { fetchTreeData } from "../../fetch/treeFetch";

export const useTreeData = (path: string | null, key: string) => {
    const { setInfo } = useInfo();

    const { data: treeData = [], isLoading, error, refetch } = useQuery(
        [key, path],
        () => fetchTreeData(path),
        {
            keepPreviousData: true,
            enabled: true,
            retry: false,
            retryDelay: 0,
            cacheTime: 0,
            onError: (error: any) => {
                const errorMessage = error.data?.error || error.message || 'An unknown error occurred while fetching directories and files.';
                setInfo({ message: errorMessage, isError: true });
            },
        }
    );

    return { treeData, isLoading, error, refetch };
};