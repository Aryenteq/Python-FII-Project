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
    otherPath: string | null;
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
    panelRef: React.MutableRefObject<HTMLDivElement | null>;
    currentPanelRef: React.MutableRefObject<HTMLDivElement | null>;
}

const FilesContainer: React.FC<FilesContainerProps> = ({
    data,
    path,
    setPath,
    setPrevPath,
    otherPath,
    selectedItems,
    setSelectedItems,
    panelRef,
    currentPanelRef
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


    const [isDragging, setIsDragging] = useState<boolean>(false);

    const handleMouseDown = (e: React.MouseEvent, index: number, item: FileOrDirectory) => {
        const fullName = getFullName(item);

        currentPanelRef.current = panelRef.current;

        // Ensure single-click works by adding a 200ms cooldown
        const timeout = setTimeout(() => {
            setIsDragging(true);
            if (!selectedItems.includes(fullName)) {
                setSelectedItems([fullName]);
            }

            // Create a temporary effect near the cursor
            const cursorEffect = document.createElement("div");
            cursorEffect.style.position = "absolute";
            cursorEffect.style.width = "50px";
            cursorEffect.style.height = "50px";
            cursorEffect.style.backgroundColor = "rgba(255, 255, 255, 0.6)";
            cursorEffect.style.borderRadius = "4px";
            cursorEffect.style.pointerEvents = "none";
            cursorEffect.style.zIndex = "1000";
            document.body.appendChild(cursorEffect);

            const cursorText = document.createElement("div");
            cursorText.style.position = "absolute";
            cursorText.style.color = "black";
            cursorText.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            cursorText.style.borderRadius = "4px";
            cursorText.style.padding = "5px";
            cursorText.style.fontSize = "12px";
            cursorText.style.pointerEvents = "none";
            cursorText.style.zIndex = "1001";
            cursorText.style.display = 'none';
            document.body.appendChild(cursorText);

            const handleMouseMove = (moveEvent: MouseEvent) => {
                cursorEffect.style.left = `${moveEvent.clientX + 5}px`;
                cursorEffect.style.top = `${moveEvent.clientY + 5}px`;

                cursorText.style.left = `${moveEvent.clientX + 10}px`;
                cursorText.style.top = `${moveEvent.clientY + 20}px`;

                const targetElement = document.elementFromPoint(
                    moveEvent.clientX,
                    moveEvent.clientY
                );

                const panelElement = targetElement?.closest('[data-type="panel"]');

                if ((panelElement && currentPanelRef.current &&
                    currentPanelRef.current.contains(panelElement)) || // same panel
                    !panelElement) { // not inside a panel
                    document.head.appendChild(globalCursorStyle);
                } else {
                    globalCursorStyle.remove();
                }

                if (panelElement && currentPanelRef.current && !currentPanelRef.current.contains(panelElement)) {
                    const folderElement = targetElement?.closest('.selectable-item');
                
                    cursorText.style.display = 'block';
                
                    if (folderElement) {
                        // Folder type
                        const folderType = folderElement.querySelectorAll('span')[4]?.textContent;
                        if (folderType === 'File Folder') {
                            const folderName = folderElement.querySelectorAll('.flex span')[2]?.textContent || "Unknown Folder";
                            cursorText.innerText = `Copy to ${otherPath}/${folderName}`;
                        } else {
                            cursorText.innerText = `Copy to ${otherPath}`;
                        }
                    } else {
                        // No folder element found; default text
                        cursorText.innerText = `Copy to ${otherPath}`;
                    }
                } else {
                    // Not over another panel
                    cursorText.style.display = 'none';
                }
            };

            const handleMouseUp = (mouseupEvent: MouseEvent) => {
                setIsDragging(false);
                clearTimeout(timeout);
                globalCursorStyle.remove();
                cursorEffect.remove();
                cursorText.remove();
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);

                const targetElement = document.elementFromPoint(
                    mouseupEvent.clientX,
                    mouseupEvent.clientY
                );

                const panelElement = targetElement?.closest('[data-type="panel"]');

                if (
                    panelElement && // inside a panel
                    currentPanelRef.current &&
                    !currentPanelRef.current.contains(panelElement) // not the same panel
                ) {
                    // mutation here
                }
            };

            // Update the cursor style
            const globalCursorStyle = document.createElement("style");
            globalCursorStyle.innerHTML = `* { cursor: not-allowed !important; }`;
            document.head.appendChild(globalCursorStyle);

            // Add event listeners for cleanup
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }, 200); // Start effect only after 200ms cooldown

        // Cleanup timeout if the mouse is released quickly
        const handleQuickMouseUp = () => {
            clearTimeout(timeout);
            document.removeEventListener("mouseup", handleQuickMouseUp);
        };

        document.addEventListener("mouseup", handleQuickMouseUp);
    };

    return (
        <div className="flex flex-col min-h-0">
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
            <div className={`flex-grow overflow-auto custom-scrollbar pb-10 ${isDragging ? '' : 'cursor-pointer'}`} data-type='panel'>
                {sortedData.map((item, index) => {
                    const fullName = getFullName(item);
                    return (
                        <div
                            key={index}
                            className={`selectable-item grid grid-cols-4 gap-2 p-2 border-b border-gray-200 hover:bg-gray-700 ${selectedItems.includes(fullName) && panelRef.current === currentPanelRef.current
                                ? 'bg-gray-600'
                                : ''
                                } `}
                            onClick={(e) => handleClick(e, index, item)}
                            onDoubleClick={() => handleDoubleClick(item)}
                            onMouseDown={(e) => handleMouseDown(e, index, item)}
                        >
                            <span className={`flex items-center text-left ${item.hidden ? "opacity-50" : ""}`}>
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