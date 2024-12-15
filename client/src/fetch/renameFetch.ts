export const renameItemsRequest = async ({items, name, extension}: {items: string[]; name: string; extension: string}): Promise<any> => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rename`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items, name, extension }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Rename operation failed');
        (error as any).data = errorData;
        throw error;
    }

    return response.json();
};