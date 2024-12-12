export const deleteItemsRequest = async (items: string[]) => {
    const params = new URLSearchParams();
    items.forEach(item => params.append('items', item));

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tree?${params.toString()}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete items');
    }

    return response.json();
};