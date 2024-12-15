import { useQuery } from "react-query";
import { useInfo } from "../../context/InfoContext";
import { fetchFileContent } from "../../fetch/fileContentFetch";

export const useFileContent = (path: string | null) => {
    const { setInfo } = useInfo();

    const { data, isLoading, error } = useQuery(
        ["file-content", path],
        async () => {
            if (!path) return '';
            const response = await fetchFileContent(path);
            return response.content || '';
        },
        {
            retry: false,
            cacheTime: 0,
            staleTime: 0,
            onError: (error: any) => {
                const errorMessage =
                    error.response?.data?.error || error.message || 'An unknown error occurred while fetching file content.';
                setInfo({ message: errorMessage, isError: true });
            },
        }
    );

    return { fileContent: data || '', isLoading, error };
};