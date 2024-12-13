import { useInfo } from "../../context/InfoContext";
import { useMutation } from "react-query";
import { deleteItemsRequest } from "../../fetch/deleteFetch";
import { useRefetch } from "../../context/RefetchContext";

export const useDeleteItems = () => {
    const { setInfo } = useInfo();
    const { addPathsToRefetch } = useRefetch();

    const mutation = useMutation(deleteItemsRequest, {
        onSuccess: (data) => {
            addPathsToRefetch(data);
        },
        onError: (error: any) => {
            const errorMessage = error.data?.error || error.message || 'An unknown error occurred while deleting items.';
            setInfo({ message: errorMessage, isError: true });
        },
    });

    return mutation;
};