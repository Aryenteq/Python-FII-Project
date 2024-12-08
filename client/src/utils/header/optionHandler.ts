export const handleOptionSelect = (selectedOption: string) => {
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
        case "Copy":
            console.log("Copy selected");
            break;
        case "Paste":
            console.log("Paste selected");
            break;
        case "Cut":
            console.log("Cut selected");
            break;
        default:
            console.log(`Action not defined for: ${selectedOption}`);
    }
};