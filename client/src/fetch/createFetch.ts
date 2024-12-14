export const createItemsRequest = async ({name, creatingItem, destination}: 
    {name: string; creatingItem: 'file' | 'folder'; destination: string;}): Promise<any> => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, creatingItem, destination }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Create operation failed');
        (error as any).data = errorData;
        throw error;
    }

    return response.json();
};