import React, { useState } from 'react';
import ColoredFileIcon from '../../utils/ColoredFileIcon';

interface FileOrDirectory {
    name: string;
    extension: string;
    date_created: string;
    size: number;
    hidden: boolean;
}

interface FilesContainerProps {
    data: FileOrDirectory[];
    path: string | null;
    setPath: React.Dispatch<React.SetStateAction<string | null>>;
    setPrevPath: React.Dispatch<React.SetStateAction<string | null>>;
    selectedItems: string[];
}

const FilesContainer: React.FC<FilesContainerProps> = ({
    data,
    path,
    setPath,
    setPrevPath,
    selectedItems,
}) => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [sortField, setSortField] = useState<keyof FileOrDirectory>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const directories = data.filter((item) => item.extension === 'File Folder');
    const files = data.filter((item) => item.extension !== 'File Folder');

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

    const validPath = Array.isArray(data) && data.length > 0;

    if (!validPath) {
        return <div className="flex flex-col min-h-0">
            {/* Go Up Button */}
            <div className="flex items-center justify-between p-2">
                <button
                    onClick={goUpDirectory}
                    className="text-sm font-bold text-blue-500 hover:underline"
                    disabled={!path}
                >
                    ⬆ Go Up
                </button>
                <span className="text-sm text-gray-500">{path || 'This PC'}</span>
            </div>
            <div>Empty folder</div>
        </div>
    }

    // Sorting
    const sortItems = (items: FileOrDirectory[]) =>
        [...items].sort((a, b) => {
            if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    const sortedDirectories = sortItems(directories);
    const sortedFiles = sortItems(files);

    const sortedData =
        sortOrder === 'asc'
            ? [...sortedDirectories, ...sortedFiles] // Folders first
            : [...sortedFiles, ...sortedDirectories]; // Folders last



    const handleSingleClick = (name: string) => {
        setSelectedItem(name);
    };

    const handleDoubleClick = (item: FileOrDirectory) => {
        if (item.extension === 'File Folder') {
            setPrevPath(path);
            setPath(path ? `${path}/${item.name}` : item.name);
        }
    };

    const toggleSort = (field: keyof FileOrDirectory) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="flex flex-col min-h-0">
            {/* Go Up Button */}
            <div className="flex items-center justify-between p-2">
                <button
                    onClick={goUpDirectory}
                    className="text-sm font-bold text-blue-500 hover:underline"
                    disabled={!path}
                >
                    ⬆ Go Up
                </button>
                <span className="text-sm text-gray-500">{path || 'This PC'}</span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 gap-2 p-2 bg-blue-900 text-white text-sm font-bold">
                <button onClick={() => toggleSort('name')} className="text-left">
                    Name {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </button>
                <button onClick={() => toggleSort('date_created')} className="text-left">
                    Date modified {sortField === 'date_created' && (sortOrder === 'asc' ? '▲' : '▼')}
                </button>
                <button onClick={() => toggleSort('extension')} className="text-left">
                    Type {sortField === 'extension' && (sortOrder === 'asc' ? '▲' : '▼')}
                </button>
                <button onClick={() => toggleSort('size')} className="text-right">
                    Size {sortField === 'size' && (sortOrder === 'asc' ? '▲' : '▼')}
                </button>
            </div>

            {/* Table Rows */}
            <div className="flex-grow overflow-auto custom-scrollbar">
                {sortedData.map((item, index) => (
                    <div
                        key={index}
                        className={`grid grid-cols-4 gap-2 p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-700 ${selectedItem === item.name ? 'bg-gray-600' : ''
                            }`}
                        onClick={() => handleSingleClick(item.name)} // Single-click to select
                        onDoubleClick={() => handleDoubleClick(item)} // Double-click to navigate
                    >
                        <span className={`flex items-center text-left ${item.hidden ? "opacity-50" : ""}`}>
                            <div
                                className="flex justify-center items-center"
                                style={{
                                    width: "15px",
                                    height: "15px",
                                }}
                            >
                                <ColoredFileIcon extension={item.extension} />
                            </div>
                            <span className="ml-2">{item.name}</span>
                        </span>
                        <span className="text-left">{item.date_created}</span>
                        <span className="text-left">{item.extension}</span>
                        <span className="text-right">{item.size > 0 ? `${item.size} KB` : ''}</span>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilesContainer;