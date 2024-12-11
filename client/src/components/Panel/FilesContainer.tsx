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
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
}

const FilesContainer: React.FC<FilesContainerProps> = ({
    data,
    path,
    setPath,
    setPrevPath,
    selectedItems,
    setSelectedItems
}) => {
    const [sortField, setSortField] = useState<keyof FileOrDirectory>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const directories = data.filter((item) => item.extension === 'File Folder');
    const files = data.filter((item) => item.extension !== 'File Folder');

    const sortedDirectories = [...directories].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const sortedFiles = [...files].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const sortedData = sortOrder === 'asc' ? [...sortedDirectories, ...sortedFiles] : [...sortedFiles, ...sortedDirectories];

    const toggleSort = (field: keyof FileOrDirectory) => {
        setSortField(field);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const getFullName = (item: FileOrDirectory): string => {
        return item.extension === 'File Folder' ? path + item.name : path + `${item.name}.${item.extension}`;
    };

    const handleClick = (e: React.MouseEvent, index: number, item: FileOrDirectory) => {
        const fullName = getFullName(item);

        if (e.shiftKey) {
            // Shift+Click
            if (lastSelectedIndex === null) {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
                e.preventDefault();
                window.getSelection()?.removeAllRanges(); // Prevent text selection
                setSelectedItems([fullName]);
                setLastSelectedIndex(index);
                return;
            }
            
            // Prevent text selection
            e.preventDefault();
            window.getSelection()?.removeAllRanges();
            
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const range = sortedData.slice(start, end + 1).map(getFullName);
            
            setSelectedItems(range);
        } else if (e.ctrlKey || e.metaKey) {
            // Ctrl+Click || Cmd+Click
            if (selectedItems.includes(fullName)) {
                setSelectedItems(selectedItems.filter((item) => item !== fullName));
            } else {
                setSelectedItems([...selectedItems, fullName]);
            }
            setLastSelectedIndex(index);
        } else {
            // Single Click
            setSelectedItems([fullName]);
            setLastSelectedIndex(index);
        }
    };

    const handleDoubleClick = (item: FileOrDirectory) => {
        if (item.extension === 'File Folder') {
            setPrevPath(path);
            setPath(path ? `${path}/${item.name}` : item.name);
        }
    };

    return (
        <div className="flex flex-col min-h-0">
            {/* Go Up Button */}
            <div className="flex items-center justify-between p-2">
                <button
                    onClick={() => {
                        if (!path) return;
                        const newPath = path.substring(0, path.lastIndexOf('/')) || null;
                        setPrevPath(path);
                        setPath(newPath);
                    }}
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
                {sortedData.map((item, index) => {
                    const fullName = getFullName(item);
                    return (
                        <div
                            key={index}
                            className={`selectable-item grid grid-cols-4 gap-2 p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-700 ${
                                selectedItems.includes(fullName) ? 'bg-gray-600' : ''
                            }`}
                            onClick={(e) => handleClick(e, index, item)}
                            onDoubleClick={() => handleDoubleClick(item)}
                        >
                            <span className="flex items-center text-left">
                                <ColoredFileIcon extension={item.extension} />
                                <span className="ml-2">{item.name}</span>
                            </span>
                            <span className="text-left">{item.date_created}</span>
                            <span className="text-left">{item.extension}</span>
                            <span className="text-right">{item.size > 0 ? `${item.size} KB` : ''}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FilesContainer;