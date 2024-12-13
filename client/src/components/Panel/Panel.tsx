import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTreeData } from '../query/treeQuery';
import DrivesContainer from './DrivesContainer';
import FilesContainer from './FilesContainer';
import Path from './Path';

import deleteIcon from "../../media/svgs/delete.svg";
import newFolderIcon from "../../media/svgs/new-folder.svg";
import newFileIcon from "../../media/svgs/new-file.svg";
import { useRefetch } from '../../context/RefetchContext';
import { normalizePath } from '../../utils/normalizePath';

interface PathProps {
    path: string | null;
    setPath: React.Dispatch<React.SetStateAction<string | null>>;
    otherPath: string | null;
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
    panelRef: React.MutableRefObject<HTMLDivElement | null>;
    currentPanelRef: React.MutableRefObject<HTMLDivElement | null>;
}


const Panel: React.FC<PathProps> = ({ path, setPath, otherPath, selectedItems, setSelectedItems, panelRef, currentPanelRef }) => {
    const { refetchPaths, removePathFromRefetch } = useRefetch();
    const [prevPath, setPrevPath] = useState<string | null>(path); // in case you enter a wrong path, revert

    const panelId = useRef(uuidv4());
    const { treeData, refetch: refetchCurrent, error, isLoading } = useTreeData(path, panelId.current);

    // Handle path change
    const handlePathChange = (newPath: string) => {
        currentPanelRef.current = panelRef.current;
        setPrevPath(path);
        setPath(newPath);
        refetchCurrent();
    };

    useEffect(() => {
        if (error) {
            setPath(prevPath);
        }
    }, [error, prevPath, setPath]);

    useEffect(() => {
        if (path) {
            let normalizedPath = normalizePath(path);
            console.log("current norm: ", normalizedPath);
            if (refetchPaths.includes(normalizedPath)) {
                console.log("include current")
                refetchCurrent().then(() => removePathFromRefetch(normalizedPath));
            }
        }
    }, [path, refetchPaths, refetchCurrent, removePathFromRefetch]);

    if (isLoading) {
        return <div className="flex-grow min-h-full flex items-center justify-center">Loading...</div>;
    }

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
                            datatype='delete' title="Delete"
                        >
                            <img src={deleteIcon} alt="Delete" />
                        </button>
                        <button
                            className="w-12 h-12 hover:bg-white-10 rounded p-1 transition" title="New Folder"
                            onClick={() => console.log('Create New Folder')}
                        >
                            <img src={newFolderIcon} alt="New Folder" />
                        </button>
                        <button
                            className="w-12 h-12 hover:bg-white-10 rounded p-1 transition" title="New File"
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
                <FilesContainer data={treeData} path={path} setPath={setPath} setPrevPath={setPrevPath} otherPath={otherPath} selectedItems={selectedItems} setSelectedItems={setSelectedItems} panelRef={panelRef} currentPanelRef={currentPanelRef} />
            )}
        </div>
    );
};

export default Panel;