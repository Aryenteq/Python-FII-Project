import React, { useState } from 'react';
import driveIcon from "../../media/imgs/drive.png"

interface Drive {
    name: string;
    type: string;
    total_space: number;
    used_space: number;
    free_space: number;
}

interface DrivesContainerProps {
    data: Drive[];
    path: string | null;
    setPath: React.Dispatch<React.SetStateAction<string | null>>;
    setPrevPath: React.Dispatch<React.SetStateAction<string | null>>;
}

const DrivesContainer: React.FC<DrivesContainerProps> = ({ data, path, setPath, setPrevPath }) => {
    const formatBytes = (bytes: number) => {
        const gb = bytes / (1024 ** 3); // Convert bytes to gigabytes
        return `${gb.toFixed(2)} GB`;
    };

    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const handleSingleClick = (name: string) => {
        setSelectedItem(name);
    };

    const handleDoubleClick = (item: Drive) => {
        const normalizedPath = item.name.replace(/\\/g, '/'); // Replace all backslashes with forward slashes
        setPrevPath(null);
        setPath(normalizedPath);
    };

    return (
        <div className="flex flex-col overflow-hidden">
            <h2 className="text-lg font-bold p-2">Available Drives ({data.length})</h2>
            <div className="p-2 flex-grow overflow-auto">
                {data.map((drive, index) => (
                    <div
                        key={index}
                        className={`flex items-center p-2 border-b border-gray-200 cursor-pointer
                                    hover:bg-white-15 transition-all 
                                    ${selectedItem === drive.name ? 'bg-white-10' : ''}`}
                        onClick={() => handleSingleClick(drive.name)}
                        onDoubleClick={() => handleDoubleClick(drive)}
                    >
                        {/* Drive Icon */}
                        <img src={driveIcon} alt="Drive" className="w-12 h-12 mr-4" />

                        {/* Drive Info */}
                        <div className="flex flex-col w-full">
                            <p className="text-sm font-semibold">Local Disk ({drive.name})</p>

                            <div className="relative w-full h-3 bg-gray-300 rounded-md mt-2">
                                <div
                                    className="absolute h-3 bg-blue-500 rounded-md"
                                    style={{
                                        width: `${(drive.used_space / drive.total_space) * 100}%`,
                                    }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {formatBytes(drive.free_space)} free of {formatBytes(drive.total_space)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DrivesContainer;