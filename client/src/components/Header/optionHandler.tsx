import React from "react";

export const handleOptionSelect = (
    selectedOption: string,
    setShowShortcutInfo: React.Dispatch<React.SetStateAction<boolean>>
) => {
    switch (selectedOption) {
        case "Open":
            console.log("Open selected");
            break;
        case "Save":
            console.log("Save selected");
            break;
        case "Close":
            console.log("Close selected");
            break;
        case "Show":
            setShowShortcutInfo(true); // Trigger modal
            break;
        default:
            console.log(`Action not defined for: ${selectedOption}`);
    }
};