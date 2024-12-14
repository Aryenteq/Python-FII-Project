import { useInfo } from "../../context/InfoContext";
import { useMutation } from "react-query";
import { createItemsRequest } from "../../fetch/createFetch";
import { useRefetch } from "../../context/RefetchContext";

export const useCreateItems = () => {
    const { setInfo } = useInfo();
    const { addPathsToRefetch } = useRefetch();

    const mutation = useMutation(createItemsRequest, {
        retry: false,
        retryDelay: 0,
        onSuccess: (data) => {
            addPathsToRefetch(data);
        },
        onError: (error: any) => {
            const errorMessage = error.data?.error || error.message || 'An unknown error occurred while creating the item.';
            setInfo({ message: errorMessage, isError: true });
        },
    });

    return mutation;
};