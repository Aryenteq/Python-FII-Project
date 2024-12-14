import React from "react";

export const handleOptionSelect = (
    selectedOption: string,
    setShowShortcutInfo: React.Dispatch<React.SetStateAction<boolean>>,
    setShowHiddenItems: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    switch (selectedOption) {
        case "Toggle hidden items":
            setShowHiddenItems((prev) => !prev);
            break;
        case "Proof":
            alert("Proof of concept");
            break;
        case "Show":
            setShowShortcutInfo(true); // Trigger modal
            break;
        default:
            console.log(`Action not defined for: ${selectedOption}`);
    }
};