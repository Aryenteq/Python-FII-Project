import React, { useState, useEffect, useRef } from "react";
import Panel from "./Panel";

const PanelContainer: React.FC = () => {
    const [leftPath, setLeftPath] = useState<string | null>(null);
    const [rightPath, setRightPath] = useState<string | null>(null);
    const [leftPanelWidth, setLeftPanelWidth] = useState(50);
    const [isDraggingDivider, setIsDraggingDivider] = useState(false);

    // Drag selection logic
    const [activePanel, setActivePanel] = useState<"left" | "right" | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const currentPanelRef = useRef<HTMLDivElement | null>(null);

    //
    //
    // Divider resizing
    //
    //
    const handleDividerMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDraggingDivider(true);
    };

    const handleDividerMouseMove = (e: MouseEvent) => {
        if (!isDraggingDivider) return;
        e.preventDefault();
        const newWidth = (e.clientX / window.innerWidth) * 100;
        setLeftPanelWidth(Math.min(80, Math.max(20, newWidth))); // Limit between 20% and 80%
    };

    const handleDividerMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        setIsDraggingDivider(false);
    };

    useEffect(() => {
        if (isDraggingDivider) {
            window.addEventListener("mousemove", handleDividerMouseMove);
            window.addEventListener("mouseup", handleDividerMouseUp);
        } else {
            window.removeEventListener("mousemove", handleDividerMouseMove);
            window.removeEventListener("mouseup", handleDividerMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleDividerMouseMove);
            window.removeEventListener("mouseup", handleDividerMouseUp);
        };
    }, [isDraggingDivider]);

    //
    //
    // Selection
    //
    //
    const handleMouseDown = (e: React.MouseEvent, panel: "left" | "right") => {
        // Blur inputs/buttons (eg. path input)
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const interactiveTags = ["INPUT", "TEXTAREA", "BUTTON"];
        if (!interactiveTags.includes((e.target as HTMLElement).tagName)) {
            e.preventDefault();
        }

        // Case 1: Drag an element - handled inside FilesContainer
        const panelType = "panel";
        if (e.target instanceof HTMLElement && e.target.closest(`[data-type="${panelType}"]`)) {
            return;
        // Case 2: Do the selection box
        } else {
            currentPanelRef.current = panel === "left" ? leftPanelRef.current : rightPanelRef.current;
            setActivePanel(panel);
            setIsSelecting(true);
            setDragStart({ x: e.clientX, y: e.clientY });
            setDragEnd(null);
            setSelectedItems([]); // Reset selected items
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isSelecting || !dragStart) return;
        e.preventDefault();
        setDragEnd({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        setActivePanel(null);
        if (dragStart && dragEnd) {
            const panelRef = activePanel === "left" ? leftPanelRef.current : rightPanelRef.current;
            const selected = computeSelectedItems(dragStart, dragEnd, panelRef, activePanel === "left" ? leftPath : rightPath);
            setSelectedItems(() => [...selected]);
        }
        setDragStart(null);
        setDragEnd(null);
    };


    const computeSelectedItems = (
        start: { x: number; y: number },
        end: { x: number; y: number },
        panelRef: HTMLDivElement | null,
        path: string | null
    ) => {
        if (!panelRef) return [];
        const rect = panelRef.getBoundingClientRect();
        const selectionBox = {
            left: Math.max(Math.min(start.x, end.x), rect.left),
            top: Math.max(Math.min(start.y, end.y), rect.top),
            right: Math.min(Math.max(start.x, end.x), rect.right),
            bottom: Math.min(Math.max(start.y, end.y), rect.bottom),
        };

        const items = Array.from(panelRef.querySelectorAll(".selectable-item")) as HTMLElement[];
        const filteredItems = items
            .filter((item) => {
                const itemRect = item.getBoundingClientRect();
                return !(
                    itemRect.right < selectionBox.left || // Completely to the left
                    itemRect.left > selectionBox.right || // Completely to the right
                    itemRect.bottom < selectionBox.top || // Completely above
                    itemRect.top > selectionBox.bottom // Completely below
                );
            })
            .map((item) => {
                const nameElement = item.querySelector("span:nth-child(1) span:last-child") as HTMLElement;
                const extensionElement = item.querySelector("span:nth-child(3)") as HTMLElement;

                const name = nameElement?.textContent?.trim() || '';
                const extension = extensionElement?.textContent?.trim() || '';

                // folders or no extension
                if (extension === 'File Folder' || !extension.startsWith('.') || extension === '') {
                    return path + name;
                }
                return path + `${name}.${extension}`;
            })
            .filter(Boolean); // Remove any empty or null items

        return filteredItems;
    };

    const computeSelectionBox = (
        start: { x: number; y: number },
        end: { x: number; y: number },
        panelRef: HTMLDivElement | null
    ) => {
        if (!panelRef) return null;

        const panelRect = panelRef.getBoundingClientRect();

        const box = {
            left: Math.max(Math.min(start.x, end.x), panelRect.left),
            top: Math.max(Math.min(start.y, end.y), panelRect.top),
            right: Math.min(Math.max(start.x, end.x), panelRect.right),
            bottom: Math.min(Math.max(start.y, end.y), panelRect.bottom),
        };

        return {
            left: box.left - panelRect.left,
            top: box.top - panelRect.top,
            width: box.right - box.left,
            height: box.bottom - box.top,
        };
    };


    useEffect(() => {
        if (isSelecting) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isSelecting, dragStart, dragEnd]);

    return (
        <main className="flex flex-grow min-h-0 overflow-hidden">
            {/* Left Panel */}
            <div
                className="relative flex flex-grow min-h-0"
                style={{ width: `${leftPanelWidth}%` }}
                onMouseDown={(e) => handleMouseDown(e, "left")}
                ref={leftPanelRef}
            >
                <Panel path={leftPath} setPath={setLeftPath} otherPath={rightPath} selectedItems={selectedItems} setSelectedItems={setSelectedItems} panelRef={leftPanelRef} currentPanelRef={currentPanelRef} />
                {isSelecting && activePanel === "left" && dragStart && dragEnd && (
                    <div
                        className="absolute bg-blue-500 opacity-80"
                        style={{
                            ...computeSelectionBox(dragStart, dragEnd, leftPanelRef.current),
                        }}
                    ></div>
                )}
            </div>

            {/* Draggable Divider */}
            <div
                className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400"
                onMouseDown={handleDividerMouseDown}
            />

            {/* Right Panel */}
            <div
                className="relative flex flex-grow min-h-0"
                style={{ width: `${100 - leftPanelWidth}%` }}
                onMouseDown={(e) => handleMouseDown(e, "right")}
                ref={rightPanelRef}
            >
                <Panel path={rightPath} setPath={setRightPath} otherPath={leftPath} selectedItems={selectedItems} setSelectedItems={setSelectedItems} panelRef={rightPanelRef} currentPanelRef={currentPanelRef} />
                {isSelecting && activePanel === "right" && dragStart && dragEnd && (
                    <div
                        className="absolute bg-blue-500 opacity-80"
                        style={{
                            ...computeSelectionBox(dragStart, dragEnd, rightPanelRef.current),
                        }}
                    ></div>
                )}
            </div>
        </main>
    );
};

export default PanelContainer;