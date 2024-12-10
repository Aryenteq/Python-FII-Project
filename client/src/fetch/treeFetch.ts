export const fetchTreeData = async (path: string | null): Promise<any> => {
    const url = path
        ? `${import.meta.env.VITE_BACKEND_URL}/tree?path=${encodeURIComponent(path)}`
        : `${import.meta.env.VITE_BACKEND_URL}/tree`;

    const response = await fetch(url);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

    return response.json();
};