import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useCreateItems } from '../mutation/createMutation';
interface CreateItemProps {
    creatingItem: false | 'file' | 'folder';
    setCreatingItem: React.Dispatch<React.SetStateAction<false | 'file' | 'folder'>>;
    destination: string;
}

const CreateItem: React.FC<CreateItemProps> = ({ creatingItem, setCreatingItem, destination }) => {
    const [name, setName] = useState<string>(creatingItem === 'file' ? 'NewFile.txt' : 'NewFolder');
    const inputRef = useRef<HTMLInputElement>(null);

    const { mutate: createItems } = useCreateItems();

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && name.length !== 0 && creatingItem != false) { // Could be checked here if name surely exists, as extension has 
            // a length. But this is a python project, so the check will be done in the BE
            createItems({name, creatingItem, destination});
            setCreatingItem(false);
        } else if (e.key === 'Escape') {
            setCreatingItem(false);
        }
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();

            if (creatingItem === 'file') {
                const dotIndex = name.lastIndexOf('.');
                // Select text before the .txt (files)
                inputRef.current.setSelectionRange(0, dotIndex);
            } else {
                // Select the fulll name (folders)
                inputRef.current.select();
            }
        }
        // First time only
    }, [creatingItem]);

    return (
        <div className="p-2 border-b border-gray-200">
            <input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border rounded"
                placeholder={creatingItem === 'file' ? 'Enter file name...' : 'Enter folder name...'}
            />
        </div>
    );
};

export default CreateItem;