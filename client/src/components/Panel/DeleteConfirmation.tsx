import React from 'react';
import { useDeleteItems } from '../mutation/deleteMutation';

interface DeleteConfirmationProps {
    setDeleteConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedItems: string[];
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
    setDeleteConfirmationOpen,
    selectedItems,
}) => {
    const { mutate: deleteItems, isLoading } = useDeleteItems();

    const handleSave = () => {
        deleteItems(selectedItems);
        setDeleteConfirmationOpen(false);
    };

    const handleCancel = () => {
        setDeleteConfirmationOpen(false);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1000]" id="dialog"
            onClick={() => setDeleteConfirmationOpen(false)} // Close dialog on clicking outside
            role="dialog"
        >
            <div
                className="bg-[#000114] p-6 rounded shadow-lg w-96"
                onClick={handleBackdropClick} // Don't close dialog on clicking inside
            >
                <h2 className="text-lg font-bold mb-4">Delete Items</h2>
                <p className="mb-4">Are you sure you want to delete the following items?</p>

                {/* List selected items */}
                <ul className="max-h-40 overflow-y-auto border border-gray-200 rounded p-3 mb-4">
                    {selectedItems.map((item, index) => (
                        <li key={index} className="text-sm text-gray-400 break-words">
                            {item}
                        </li>
                    ))}
                </ul>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmation;