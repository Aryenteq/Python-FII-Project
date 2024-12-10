import { useQuery } from "react-query";
import { useInfo } from "../../context/InfoContext";
import { fetchTreeData } from "../../fetch/treeFetch";

export const useTreeData = (path: string | null) => {
    const { setInfo } = useInfo();

    const { data: treeData = [], isLoading, error, refetch } = useQuery(
        ['treeData', path],
        () => fetchTreeData(path),
        {
            keepPreviousData: true,
            enabled: true,
            retry: false,
            retryDelay: 0,
            onError: (error: any) => {
                const parsedMessage = error.message || 'An unknown error occurred while fetching directories and files.';
                setInfo({ message: parsedMessage, isError: true });
            },
        }
    );

    return { treeData, isLoading, error, refetch };
};