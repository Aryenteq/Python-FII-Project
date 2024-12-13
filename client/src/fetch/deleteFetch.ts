export const deleteItemsRequest = async (items: string[]) => {
    const params = new URLSearchParams();
    items.forEach(item => params.append('items', item));

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tree?${params.toString()}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Delete failed');
        (error as any).data = errorData;
        throw error;
    }

    return response.json();
};