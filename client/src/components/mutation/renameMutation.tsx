import { useInfo } from "../../context/InfoContext";
import { useMutation } from "react-query";
import { renameItemsRequest } from "../../fetch/renameFetch";
import { useRefetch } from "../../context/RefetchContext";

export const useRenameItems = () => {
    const { setInfo } = useInfo();
    const { addPathsToRefetch } = useRefetch();

    const mutation = useMutation(renameItemsRequest, {
        retry: false,
        retryDelay: 0,
        onSuccess: (data) => {
            addPathsToRefetch(data);
        },
        onError: (error: any) => {
            const errorMessage = error.data?.error || error.message || 'An unknown error occurred while moving items.';
            setInfo({ message: errorMessage, isError: true });
        },
    });

    return mutation;
};