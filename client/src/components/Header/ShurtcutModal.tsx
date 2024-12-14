import React from "react";

interface ShortcutModalProps {
    onClose: () => void;
}

const ShortcutModal: React.FC<ShortcutModalProps> = ({ onClose }) => {
    const shortcuts = [
        { key: "Click + Ctrl", action: "Select multiple non-consecutive items" },
        { key: "Click + Shift", action: "Select multiple consecutive items" },
        { key: "Ctrl+C", action: "Copy selected items" },
        { key: "Ctrl+V", action: "Paste items" },
        { key: "Ctrl+X", action: "Cut selected items" },
        { key: "Delete", action: "Delete selected items" },
        { key: "Ctrl+S", action: "Save current editing text file" },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 dialog-item">
            <div className="bg-gray-800 text-white p-6 rounded shadow-lg max-w-xl">
                <h2 className="text-lg font-bold mb-8 text-center">Shortcut Info</h2>
                <ul className="space-y-2 overflow-auto">
                    {shortcuts.map((shortcut, index) => (
                        <li key={index} className="flex justify-between">
                            <span className="font-mono mr-10">{shortcut.key}</span>
                            <span>{shortcut.action}</span>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={onClose}
                    className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 mx-auto block"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ShortcutModal;