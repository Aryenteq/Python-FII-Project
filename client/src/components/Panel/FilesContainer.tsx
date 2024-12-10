import React, { useState } from 'react';

interface FileOrDirectory {
    name: string;
    type: string;
}

interface FilesContainerProps {
    data: FileOrDirectory[];
    path: string | null;
    setPath: React.Dispatch<React.SetStateAction<string | null>>;
    setPrevPath: React.Dispatch<React.SetStateAction<string | null>>;
    selectedItems: string[];
}

const FilesContainer: React.FC<FilesContainerProps> = ({ data, path, setPath, setPrevPath, selectedItems }) => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // Separate directories and files
    const directories = data.filter((item) => item.type === 'directory');
    const files = data.filter((item) => item.type === 'file');

    // Go up one directory
    const goUpDirectory = () => {
        if (!path) return;
        let newPath = path.substring(0, path.lastIndexOf('/')) || null;

        // C:/ goes to null, not to C:
        if (newPath && newPath[newPath.length - 1] === ':') {
            newPath = null;
        }
        setPrevPath(path);
        setPath(newPath);
    };

    const handleSingleClick = (name: string) => {
        setSelectedItem(name);
    };

    const handleDoubleClick = (item: FileOrDirectory) => {
        if (item.type === 'directory') {
            setPrevPath(path);
            setPath(path ? `${path}/${item.name}` : item.name); // Navigate to directory
        }
        // files if needed
    };

    return (
        <div className="flex flex-col overflow-hidden">
            {/* Go Up Button */}
            <div className="flex items-center justify-between p-2">
                <button
                    onClick={goUpDirectory}
                    className="text-sm font-bold text-blue-500 hover:underline"
                    disabled={!path}
                >
                    ⬆ Go Up
                </button>
                <span className="text-sm text-gray-500">
                    {path || 'This PC'}
                </span>
            </div>
    
            {/* Conditional Rendering for Data */}
            {!data || data.length === 0 ? (
                <div className="flex-grow min-h-full flex items-center justify-center">
                    No data available
                </div>
            ) : (
                <div className="p-2 flex-grow overflow-auto">
                    {/* Directories Section */}
                    <h3 className="text-md font-bold">Directories</h3>
                    <ul>
                        {directories.map((dir, index) => (
                            <li
                                key={index}
                                className={`selectable-item p-1 border-b border-gray-200 cursor-pointer hover:bg-white-15 ${
                                    selectedItem === dir.name ? 'bg-white-10' : ''
                                }`}
                                onClick={() => handleSingleClick(dir.name)} // Single-click to select
                                onDoubleClick={() => handleDoubleClick(dir)} // Double-click to navigate
                            >
                                📁 {dir.name}
                            </li>
                        ))}
                    </ul>
    
                    {/* Files Section */}
                    <h3 className="text-md font-bold mt-4">Files</h3>
                    <ul>
                        {files.map((file, index) => (
                            <li
                                key={index}
                                className={`selectable-item p-1 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                                    selectedItem === file.name ? 'bg-gray-200' : ''
                                }`}
                                onClick={() => handleSingleClick(file.name)} // Single-click to select
                            >
                                📄 {file.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );    
};

export default FilesContainer;