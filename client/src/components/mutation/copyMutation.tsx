import { useInfo } from "../../context/InfoContext";
import { useMutation } from "react-query";
import { copyItemsRequest } from "../../fetch/copyFetch";
import { useRefetch } from "../../context/RefetchContext";

export const useCopyItems = () => {
    const { setInfo } = useInfo();
    const { addPathsToRefetch } = useRefetch();

    const mutation = useMutation(copyItemsRequest, {
        retry: false,
        retryDelay: 0,
        onSuccess: (data) => {
            addPathsToRefetch(data);
        },
        onError: (error: any) => {
            const errorMessage = error.data?.error || error.message || 'An unknown error occurred while copying items.';
            setInfo({ message: errorMessage, isError: true });
        },
    });

    return mutation;
};