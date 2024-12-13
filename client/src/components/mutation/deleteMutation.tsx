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
            const parsedMessage = error.message || 'An unknown error occurred while deleting items.';
            setInfo({ message: parsedMessage, isError: true });
        },
    });

    return mutation;
};