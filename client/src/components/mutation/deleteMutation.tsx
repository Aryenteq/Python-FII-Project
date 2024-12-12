import { useInfo } from "../../context/InfoContext";
import { useMutation } from "react-query";
import { deleteItemsRequest } from "../../fetch/deleteFetch";

export const useDeleteItems = () => {
    const { setInfo } = useInfo();

    const mutation = useMutation(deleteItemsRequest, {
        onSuccess: (data) => {
            setInfo({ message: 'Items deleted successfully', isError: false });
        },
        onError: (error: any) => {
            const parsedMessage = error.message || 'An unknown error occurred while deleting items.';
            setInfo({ message: parsedMessage, isError: true });
        },
    });

    return mutation;
};