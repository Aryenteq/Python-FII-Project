export const fileContentFetch = async ({file, content}: {file: string; content: string;}): Promise<any> => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/file-content`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file, content }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Write operation failed');
        (error as any).data = errorData;
        throw error;
    }

    return response.json();
};