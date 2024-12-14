import React, { useEffect, useState } from 'react';
import ColoredFileIcon from './ColoredFileIcon';
import { useDragAndDrop } from '../../hooks/DragAndDropState';
import DeleteConfirmation from './DeleteConfirmation';
import CreateItem from './CreateItem';
import ContextMenu from './ContextMenu';
import { useItems } from '../../context/ItemsContext';

export interface FileOrDirectory {
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
    otherPath: string | null;
    panelRef: React.MutableRefObject<HTMLDivElement | null>;
    currentPanelRef: React.MutableRefObject<HTMLDivElement | null>;
    creatingItem: false | 'file' | 'folder';
    setCreatingItem: React.Dispatch<React.SetStateAction<false | 'file' | 'folder'>>;
}

const FilesContainer: React.FC<FilesContainerProps> = ({
    data,
    path,
    setPath,
    setPrevPath,
    otherPath,
    panelRef,
    currentPanelRef,
    creatingItem,
    setCreatingItem
}) => {
    const { selectedItems, setSelectedItems, cuttedItems, cuttedItemsPath } = useItems();
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState<boolean>(false);

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

    // const mergedData = React.useMemo(() => {
    //     if (path === cuttedItemsPath) {
    //         // Filter out any cuttedItems that already exist in the sortedData
    //         const existingItems = new Set(sortedData.map((item) => item.name));
    //         const additionalItems = cuttedItems
    //             .filter((itemName) => !existingItems.has(itemName))
    //             .map((itemName) => ({
    //                 name: itemName,
    //                 extension: '', // Assign empty string for folders or adjust if file extensions are needed
    //                 date_created: 'Unknown',
    //                 size: 0,
    //                 hidden: true, // Mark it as hidden or adjust as needed
    //             }));

    //         return [...sortedData, ...additionalItems];
    //     }
    //     return sortedData;
    // }, [sortedData, cuttedItems, cuttedItemsPath, path]);


    const toggleSort = (field: keyof FileOrDirectory) => {
        setSortField(field);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const getFullName = (item: FileOrDirectory): string => {
        return item.extension === 'File Folder' ? path + '/' + item.name : path + `/${item.name}${item.extension}`;
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


    const { isDragging, initializeDragAndDrop } = useDragAndDrop({
        otherPath,
        currentPanelRef,
        setDeleteConfirmationOpen
    });

    const handleMouseDown = (item: FileOrDirectory) => {
        const fullName = getFullName(item);
        currentPanelRef.current = panelRef.current;

        const timeout = setTimeout(() => {
            if (!selectedItems.includes(fullName)) {
                // console.log("PROBLEMA?");
                setSelectedItems(() => [fullName]);
            }
            initializeDragAndDrop();
        }, 200);

        const handleQuickMouseUp = () => {
            clearTimeout(timeout);
            document.removeEventListener("mouseup", handleQuickMouseUp);
        };

        document.addEventListener("mouseup", handleQuickMouseUp);
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Delete' && selectedItems) {
                e.preventDefault();
                setDeleteConfirmationOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [selectedItems]);


    //
    //
    // CONTEXT MENU (right click)
    //
    // 

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; item: FileOrDirectory | null }>({
        x: 0,
        y: 0,
        visible: false,
        item: null,
    });

    const handleRightClick = (e: React.MouseEvent, item: FileOrDirectory | null) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, visible: true, item });
    };

    return (
        <div className="flex flex-col min-h-0">
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                visible={contextMenu.visible}
                item={contextMenu.item}
                onClose={() => setContextMenu({ ...contextMenu, visible: false })}
                path={path}
                setDeleteConfirmationOpen={setDeleteConfirmationOpen}
            />
            {/* Go Up Button */}
            <div className="flex items-center justify-between p-2">
                <button
                    onClick={() => {
                        if (!path) return;
                        let newPath = path.substring(0, path.lastIndexOf('/')) || null;
                        // C:/ goes to null, not to C:
                        if (newPath && newPath[newPath.length - 1] === ':') {
                            newPath = null;
                        }
                        setPrevPath(path);
                        setPath(newPath);
                    }}
                    className="text-sm font-bold text-blue-500 hover:underline"
                    disabled={!path}
                >
                    ⬆ Go Up
                </button>
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
            <div className={`flex-grow overflow-auto custom-scrollbar pb-10`} data-type="panel"
                onContextMenu={(e) => handleRightClick(e, null)}>

                {creatingItem && path && <CreateItem creatingItem={creatingItem} setCreatingItem={setCreatingItem} destination={path} />}

                {(!sortedData || sortedData.length === 0) ? (
                    <div className="text-center text-gray-500 mt-4">Folder is empty</div>
                ) : (
                    sortedData.map((item, index) => {
                        const fullName = getFullName(item);
                        return (
                            <div
                                key={index}
                                className={`selectable-item grid grid-cols-4 gap-2 p-2 border-b border-gray-200 hover:bg-gray-700 cursor-pointer
                                    ${selectedItems.includes(fullName) &&
                                        (isDragging || panelRef.current === currentPanelRef.current)
                                        ? 'bg-gray-600' : (cuttedItems.includes(fullName) && cuttedItemsPath === path ? 'bg-gray-800' : '')
                                    }`}
                                onClick={(e) => handleClick(e, index, item)}
                                onDoubleClick={() => handleDoubleClick(item)}
                                onMouseDown={() => handleMouseDown(item)}
                                onContextMenu={(e) => handleRightClick(e, item)}
                            >
                                <span className={`flex items-center text-left ${item.hidden ? 'opacity-50' : ''}`}>
                                    <ColoredFileIcon extension={item.extension} />
                                    <span className="ml-2">{item.name}</span>
                                </span>
                                <span className="text-left">{item.date_created}</span>
                                <span className="text-left">{item.extension}</span>
                                <span className="text-right">{item.size > 0 ? `${item.size} KB` : (item.extension !== 'File Folder' ? '0 KB' : '')}</span>
                            </div>
                        );
                    })
                )}
            </div>

            {deleteConfirmationOpen && (
                <DeleteConfirmation
                    setDeleteConfirmationOpen={setDeleteConfirmationOpen}
                    selectedItems={selectedItems}
                />
            )}
        </div>
    );
};

export default FilesContainer;