export const copyItemsRequest = async ({items, destination}: {items: string[]; destination: string;}): Promise<any> => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/copy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items, destination }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Copy operation failed');
        (error as any).data = errorData;
        throw error;
    }

    return response.json();
};