import React, { useEffect, useRef } from 'react';
import { useItems } from '../../context/ItemsContext';
import { useMoveItems } from '../mutation/moveMutation';
import { useCopyItems } from '../mutation/copyMutation';
import { FileOrDirectory } from './FilesContainer';

interface ContextMenuProps {
    x: number;
    y: number;
    visible: boolean;
    item: FileOrDirectory | null;
    onClose: () => void;
    path: string | null;
    setDeleteConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, visible, onClose, item, path, setDeleteConfirmationOpen }) => {
    const { selectedItems, setSelectedItems, cuttedItems, setCuttedItems, setCuttedItemsPath, copiedItems, setCopiedItems } = useItems();
    const { mutate: moveItems } = useMoveItems();
    const { mutate: copyItems } = useCopyItems();
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (visible) {
            if (item) {
                const fullName = item.extension === 'File Folder' ? path + '/' + item.name : path + `/${item.name}${item.extension}`;
                if (!selectedItems.includes(fullName)) {
                    setSelectedItems(() => [fullName]);
                }
            }

            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [visible, onClose]);

    if (!visible) return null;

    return (
        <div
            ref={menuRef}
            className="absolute bg-blue-900 text-white py-2 px-2 rounded-lg shadow-lg border border-gray-700 z-50 dialog-item"
            style={{
                top: y,
                left: x,
                position: 'fixed',
            }}
        >
            {/* If clicked in parent div, show Paste only */}
            {item === null ? (
                <button
                    onClick={() => {
                        if (!path || copiedItems.length === 0) return;
    
                        if (cuttedItems.length !== 0) {
                            moveItems({ items: copiedItems, destination: path });
                            setCopiedItems(cuttedItems);
                            setCuttedItems([]);
                            setCuttedItemsPath(null);
                        } else {
                            copyItems({ items: copiedItems, destination: path });
                        }
                        onClose();
                    }}
                    className={`block w-full px-4 py-2 text-center rounded hover:bg-blue-800 ${
                        copiedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={copiedItems.length === 0}
                >
                    Paste
                </button>
            ) : (
                // If clicked on an item, show all options
                <>
                    <button
                        onClick={() => {
                            setCopiedItems(selectedItems);
                            onClose();
                        }}
                        className="block w-full px-4 py-2 text-center rounded hover:bg-blue-800"
                    >
                        Copy
                    </button>
                    <button
                        onClick={() => {
                            setCuttedItems(selectedItems);
                            setCuttedItemsPath(path);
                            setCopiedItems(selectedItems);
                            onClose();
                        }}
                        className="block w-full px-4 py-2 text-center rounded hover:bg-blue-800"
                    >
                        Cut
                    </button>
                    <button
                        onClick={() => {
                            if (!path || copiedItems.length === 0) return;
    
                            if (cuttedItems.length !== 0) {
                                moveItems({ items: copiedItems, destination: path });
                                setCopiedItems(cuttedItems);
                                setCuttedItems([]);
                                setCuttedItemsPath(null);
                            } else {
                                copyItems({ items: copiedItems, destination: path });
                            }
                            onClose();
                        }}
                        className={`block w-full px-4 py-2 text-center rounded hover:bg-blue-800 ${
                            copiedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={copiedItems.length === 0}
                    >
                        Paste
                    </button>
                    <button
                        onClick={() => {
                            console.log('rename mutation');
                            onClose();
                        }}
                        className="block w-full px-4 py-2 text-center rounded hover:bg-blue-800"
                    >
                        Rename
                    </button>
                    <button
                        onClick={() => {
                            setDeleteConfirmationOpen(true);
                            onClose();
                        }}
                        className="block w-full px-4 py-2 text-center rounded hover:bg-blue-800"
                    >
                        Delete
                    </button>
                </>
            )}
        </div>
    );        
};

export default ContextMenu;