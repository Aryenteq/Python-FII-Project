import React, { useState } from 'react';
import { useRenameItems } from '../mutation/renameMutation';

interface RenameModalProps {
    setRenameModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedItems: string[];
}

const RenameModal: React.FC<RenameModalProps> = ({
    setRenameModalOpen,
    selectedItems,
}) => {
    const { mutate: renameItems, isLoading } = useRenameItems();

    const [newName, setNewName] = useState<string>('');
    const [newExtension, setNewExtension] = useState<string>('');

    const handleSave = () => {
        if (selectedItems.length === 0 || (!newName.trim() && !newExtension.trim())) return;
    
        // Add a dot at the start if there isn't one already
        const extension = newExtension.trim() 
            ? newExtension.trim().startsWith('.') 
                ? newExtension.trim() 
                : `.${newExtension.trim()}`
            : ''; 
    
        renameItems({ items: selectedItems, name: newName, extension });
        setRenameModalOpen(false);
    };
    

    const handleCancel = () => {
        setRenameModalOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1000] dialog-item"
            onClick={handleCancel} // Close dialog on clicking outside
            role="dialog"
        >
            <div
                className="bg-[#000114] p-6 rounded shadow-lg w-96"
                onClick={handleBackdropClick} // Prevent closing when clicking inside
            >
                <h2 className="text-lg font-bold text-white mb-4">Rename Items</h2>
                <div
                    className="flex gap-2"
                    onKeyDown={handleKeyDown} // Enter = handleSave
                >
                    <input
                        type="text"
                        className="flex-grow p-2 border rounded bg-gray-900 text-white placeholder-gray-500"
                        placeholder="Enter new name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                    />
                    <input
                        type="text"
                        className="w-20 p-2 border rounded bg-gray-900 text-white placeholder-gray-500"
                        placeholder="ext"
                        value={newExtension}
                        onChange={(e) => setNewExtension(e.target.value)}
                    />
                </div>
                <div className="mt-4 text-gray-400 text-sm">
                    Excepting folders, all files will be given the new extension, if one is provided.
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Renaming...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RenameModal;