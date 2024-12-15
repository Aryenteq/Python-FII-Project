import React, { useEffect, useState } from 'react';
import { useFileContent } from '../query/fileContentQuery';
import { useSetFileContent } from '../mutation/fileContentMutation';

interface EditFileProps {
    editingFile: string | null;
    setEditingFile: React.Dispatch<React.SetStateAction<string | null>>;
}

const EditFile: React.FC<EditFileProps> = ({ editingFile, setEditingFile }) => {
    const { mutate: setFileContent } = useSetFileContent();
    
    const { fileContent, error, isLoading } = useFileContent(editingFile);
    const [content, setContent] = useState<string>('');

    useEffect(() => {
        if (fileContent) {
            setContent(fileContent);
        }
    }, [fileContent]);

    const handleSave = () => {
        setFileContent({ file: editingFile!, content });
        setEditingFile(null);
    };

    const handleCancel = () => {
        setEditingFile(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            setFileContent({ file: editingFile!, content });
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
                className="bg-[#000114] p-6 rounded shadow-lg w-[40rem] max-h-[80vh] flex flex-col"
                onClick={handleBackdropClick} // Prevent closing when clicking inside
            >
                <h2 className="text-lg font-bold text-white mb-4 text-center">
                    Edit File: {editingFile || 'Unknown File'}
                </h2>
                <div className="flex-grow">
                    {isLoading ? (
                        <p className="text-white">Loading...</p>
                    ) : error ? (
                        <p className="text-red-400">Error loading file content</p>
                    ) : (
                        <textarea
                            className="w-full h-full p-2 bg-gray-900 text-white border border-gray-600 rounded focus:outline-none resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    )}
                </div>
                <div className="flex justify-end gap-4 mt-4">
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
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditFile;