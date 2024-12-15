import { useState, useRef } from 'react';
import { useMoveItems } from '../components/mutation/moveMutation';
import { useItems } from '../context/ItemsContext';

interface UseDragAndDropProps {
    otherPath: string | null;
    currentPanelRef: React.MutableRefObject<HTMLDivElement | null>;
    setDeleteConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useDragAndDrop = ({
    otherPath,
    currentPanelRef,
    setDeleteConfirmationOpen,
}: UseDragAndDropProps) => {
    const { selectedItems } = useItems();
    const [isDragging, setDragging] = useState(false);
    const isDraggingRef = useRef(false);
    const cursorEffect = useRef<HTMLDivElement | null>(null);
    const cursorText = useRef<HTMLDivElement | null>(null);
    const globalCursorStyle = useRef<HTMLStyleElement | null>(null);
    const { mutate: moveItems } = useMoveItems();

    const createCursorElements = () => {
        if (!globalCursorStyle.current) {
            globalCursorStyle.current = document.createElement('style');
            globalCursorStyle.current.innerHTML = `* { cursor: not-allowed !important; }`;
            document.head.appendChild(globalCursorStyle.current);
        }

        cursorEffect.current = document.createElement('div');
        cursorEffect.current.style.position = 'absolute';
        cursorEffect.current.style.width = '50px';
        cursorEffect.current.style.height = '50px';
        cursorEffect.current.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        cursorEffect.current.style.borderRadius = '4px';
        cursorEffect.current.style.pointerEvents = 'none';
        cursorEffect.current.style.zIndex = '1000';
        document.body.appendChild(cursorEffect.current);

        cursorText.current = document.createElement('div');
        cursorText.current.style.position = 'absolute';
        cursorText.current.style.color = 'black';
        cursorText.current.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        cursorText.current.style.borderRadius = '4px';
        cursorText.current.style.padding = '5px';
        cursorText.current.style.fontSize = '12px';
        cursorText.current.style.pointerEvents = 'none';
        cursorText.current.style.zIndex = '1001';
        cursorText.current.style.display = 'none';
        document.body.appendChild(cursorText.current);
    };

    const cleanupCursorElements = () => {
        if (globalCursorStyle.current) {
            globalCursorStyle.current.remove();
            globalCursorStyle.current = null;
        }

        cursorEffect.current?.remove();
        cursorText.current?.remove();
        cursorEffect.current = null;
        cursorText.current = null;
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isDraggingRef.current || !cursorEffect.current || !cursorText.current) return;

        cursorEffect.current.style.left = `${event.clientX + 5}px`;
        cursorEffect.current.style.top = `${event.clientY + 5}px`;
        cursorText.current.style.left = `${event.clientX + 10}px`;
        cursorText.current.style.top = `${event.clientY + 20}px`;

        const targetElement = document.elementFromPoint(event.clientX, event.clientY);
        const panelElement = targetElement?.closest('[data-type="panel"]');
        const deleteElement = targetElement?.closest('[datatype="delete"]');


        if (((panelElement && currentPanelRef.current &&
            currentPanelRef.current.contains(panelElement)) || // same panel
            !panelElement) && !deleteElement) { // not inside a panel
            if (!globalCursorStyle.current) {
                globalCursorStyle.current = document.createElement('style');
                globalCursorStyle.current.innerHTML = `* { cursor: not-allowed !important; }`;
                document.head.appendChild(globalCursorStyle.current);
            }
        } else {
            if (globalCursorStyle.current) {
                globalCursorStyle.current.remove();
                globalCursorStyle.current = null;
            }
        }

        if (panelElement && currentPanelRef.current && !currentPanelRef.current.contains(panelElement)) {
            const folderElement = targetElement?.closest('.selectable-item');

            cursorText.current.style.display = 'block';

            if (folderElement) {
                // Folder type (hardcoded selectors numbering || +2 'cause of ColoredFileIcon)
                const folderType = folderElement.querySelectorAll('span')[4]?.textContent;
                if (folderType === 'File Folder') {
                    const folderName = folderElement.querySelectorAll('.flex span')[2]?.textContent || "Unknown Folder";
                    cursorText.current.innerText = `Move to ${otherPath}/${folderName}`;
                } else {
                    cursorText.current.innerText = `Move to ${otherPath}`;
                }
            } else {
                // No folder element found; default text
                cursorText.current.innerText = `Move to ${otherPath}`;
            }
            // Over a delete
        } else if (deleteElement) {
            cursorText.current.style.display = 'block';
            cursorText.current.innerText = `Delete selected items`;
        } else {
            // Not over another panel
            cursorText.current.style.display = 'none';
        }
    };

    const handleMouseUp = (event: MouseEvent) => {
        let finalPath = (cursorText.current?.textContent)?.slice(8); // get rid of "Copy to "
        isDraggingRef.current = false;
        setDragging(false);
        cleanupCursorElements();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        const targetElement = document.elementFromPoint(event.clientX, event.clientY);
        const panelElement = targetElement?.closest('[data-type="panel"]');
        const deleteElement = targetElement?.closest('[datatype="delete"]');

        if (finalPath && selectedItems && selectedItems.length !== 0 && panelElement &&
            currentPanelRef.current && !currentPanelRef.current.contains(panelElement)) {
            moveItems({ items: selectedItems, destination: finalPath });
        } else if (deleteElement) {
            setDeleteConfirmationOpen(true);
        }
    };

    const initializeDragAndDrop = () => {
        createCursorElements();
        isDraggingRef.current = true;
        setDragging(true);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return {
        isDragging,
        initializeDragAndDrop,
    };
};