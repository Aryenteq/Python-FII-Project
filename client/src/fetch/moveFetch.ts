export const moveItemsRequest = async ({items, destination}: {items: string[]; destination: string;}): Promise<any> => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/move`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items, destination }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Move operation failed');
        (error as any).data = errorData;
        throw error;
    }

    return response.json();
};