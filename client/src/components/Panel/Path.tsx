import React, { useEffect, useState } from 'react';

interface PathProps {
    path: string | null;
    onPathChange: (newPath: string) => void;
}

const Path: React.FC<PathProps> = ({ path, onPathChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(path || '');

    useEffect(() => {
        path ? setInputValue(path) : setInputValue('');
    }, [path]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (inputValue.trim()) {
                onPathChange(inputValue.trim());
            }
            setIsEditing(false);
        } else if (event.key === 'Escape') {
            setIsEditing(false);
            setInputValue(path || '');
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        setInputValue(path || '');
    };

    return (
        <div className='flex-grow'>
            {isEditing ? (
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="w-full border border-gray-300 p-1 rounded"
                    autoFocus
                />
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="w-full cursor-pointer hover:bg-white-10 p-1 border border-transparent rounded"
                >
                    {path || 'This PC'}
                </div>
            )}
        </div>
    );
};

export default Path;