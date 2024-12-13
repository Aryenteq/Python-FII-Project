export const fetchTreeData = async (path: string | null): Promise<any> => {
    const url = path
        ? `${import.meta.env.VITE_BACKEND_URL}/tree?path=${encodeURIComponent(path)}`
        : `${import.meta.env.VITE_BACKEND_URL}/tree`;

    const response = await fetch(url);

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Fetch failed');
        (error as any).data = errorData;
        throw error;
    }

    return response.json();
};