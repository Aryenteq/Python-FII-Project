import React, { useEffect, useState } from 'react';
import { useTreeData } from '../query/treeQuery';
import DrivesContainer from './DrivesContainer';
import FilesContainer from './FilesContainer';
import Path from './Path';

import deleteIcon from "../../media/svgs/delete.svg";
import newFolderIcon from "../../media/svgs/new-folder.svg";
import newFileIcon from "../../media/svgs/new-file.svg";

interface PathProps {
    path: string | null;
    setPath: React.Dispatch<React.SetStateAction<string | null>>;
    otherPath: string | null;
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
    panelRef: React.MutableRefObject<HTMLDivElement | null>;
    currentPanelRef: React.MutableRefObject<HTMLDivElement | null>;
}


const Panel: React.FC<PathProps> = ({path, setPath, otherPath, selectedItems, setSelectedItems, panelRef, currentPanelRef}) => {
    const [prevPath, setPrevPath] = useState<string | null>(path); // in case you enter a wrong path, revert
    const { treeData, isLoading, error, refetch } = useTreeData(path);

    // Handle path change
    const handlePathChange = (newPath: string) => {
        currentPanelRef.current = panelRef.current;
        setPrevPath(path);
        setPath(newPath);
        refetch();
    };

    useEffect(() => {
        if (error) {
            setPath(prevPath);
        }
    }, [error, prevPath, setPath]);

    if (isLoading) {
        return <div className="flex-grow min-h-full flex items-center justify-center">Loading...</div>;
    }

    // Check the `type` field to decide what to render
    const isDriveData = treeData[0]?.type === 'drive';

    return (
        <div className="flex flex-col flex-grow px-5 min-h-0">
            {/* Header with Path and Action Buttons */}
            <header className="flex justify-between items-center w-full p-4 rounded-md shadow-sm gap-2">
                <Path path={path} onPathChange={handlePathChange} />
                {!isDriveData && (
                    <div className="flex space-x-3">
                        <button
                            className="w-12 h-12 hover:bg-white-10 rounded p-1 transition"
                            onClick={() => console.log('Delete')}
                        >
                            <img src={deleteIcon} alt="Delete" />
                        </button>
                        <button
                            className="w-12 h-12 hover:bg-white-10 rounded p-1 transition"
                            onClick={() => console.log('Create New Folder')}
                        >
                            <img src={newFolderIcon} alt="New Folder" />
                        </button>
                        <button
                            className="w-12 h-12 hover:bg-white-10 rounded p-1 transition"
                            onClick={() => console.log('Create New File')}
                        >
                            <img src={newFileIcon} alt="New File" />
                        </button>
                    </div>
                )}
            </header>

            {/* Drives or Files/Directories */}
            {isDriveData ? (
                <DrivesContainer data={treeData} path={path} setPath={setPath} setPrevPath={setPrevPath} />
            ) : (
                <FilesContainer data={treeData} path={path} setPath={setPath} setPrevPath={setPrevPath} otherPath={otherPath} selectedItems={selectedItems} setSelectedItems={setSelectedItems} panelRef={panelRef} currentPanelRef={currentPanelRef}/>
            )}
        </div>
    );
};

export default Panel;