import { useInfo } from "../../context/InfoContext";
import { useMutation } from "react-query";
import { fileContentFetch } from "../../fetch/setFileContentFetch";

export const useSetFileContent = () => {
    const { setInfo } = useInfo();

    const mutation = useMutation(fileContentFetch, {
        retry: false,
        retryDelay: 0,
        onError: (error: any) => {
            const errorMessage = error.data?.error || error.message || 'An unknown error occurred while writting content.';
            setInfo({ message: errorMessage, isError: true });
        },
    });

    return mutation;
};