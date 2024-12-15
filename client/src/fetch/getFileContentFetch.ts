export const fetchFileContent = async (path: string | null): Promise<any> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/file-content?path=${encodeURIComponent(path!)}`

    const response = await fetch(url);

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Fetch failed');
        (error as any).data = errorData;
        throw error;
    }

    return response.json();
};