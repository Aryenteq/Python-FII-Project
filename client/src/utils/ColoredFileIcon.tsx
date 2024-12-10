import React from "react";
import { FileIcon } from "react-file-icon";

interface ColoredFileIconProps {
    extension: string;
}

const ColoredFileIcon: React.FC<ColoredFileIconProps> = ({ extension }) => {
    const normalizedExtension = extension.startsWith(".") ? extension.slice(1) : extension;

    // Define custom styles for specific file extensions
    const customStyles: { [key: string]: object } = {
        "File Folder": {
            labelColor: "#FFD700", // Gold for folders
            color: "#F0E68C",
        },
        ".txt": {
            labelColor: "#0000FF", // Blue for text files
            color: "#ADD8E6",
        },
        ".doc": {
            labelColor: "#1E90FF", // Dodger blue for Word docs
            color: "#B0C4DE",
        },
        ".docx": {
            labelColor: "#1E90FF", // Same as .doc
            color: "#B0C4DE",
        },
        ".pdf": {
            labelColor: "#FF0000", // Red for PDFs
            color: "#FFA07A",
        },
        ".jpg": {
            labelColor: "#FF69B4", // Pink for images
            color: "#FFC0CB",
        },
        ".png": {
            labelColor: "#FF69B4", // Same as .jpg
            color: "#FFC0CB",
        },
        ".mkv": {
            labelColor: "#8A2BE2", // Purple for video files
            color: "#D8BFD8",
        },
        ".mp4": {
            labelColor: "#FF4500", // Orange for video files
            color: "#FFDAB9",
        },
        ".mp3": {
            labelColor: "#32CD32", // Lime green for audio files
            color: "#98FB98",
        },
        ".wav": {
            labelColor: "#32CD32", // Same as .mp3
            color: "#98FB98",
        },
        ".exe": {
            labelColor: "#FF8C00", // Dark orange for executables
            color: "#FFE4B5",
        },
        ".dll": {
            labelColor: "#4682B4", // Steel blue for dynamic link libraries
            color: "#B0E0E6",
        },
        ".zip": {
            labelColor: "#8B4513", // Saddle brown for archives
            color: "#DEB887",
        },
        ".rar": {
            labelColor: "#8B4513", // Same as .zip
            color: "#DEB887",
        },
        ".7z": {
            labelColor: "#8B4513", // Same as .zip
            color: "#DEB887",
        },
        ".iso": {
            labelColor: "#2E8B57", // Sea green for ISO files
            color: "#98FB98",
        },
        ".html": {
            labelColor: "#FF4500", // Orange for HTML files
            color: "#FFDAB9",
        },
        ".css": {
            labelColor: "#1E90FF", // Dodger blue for CSS files
            color: "#B0C4DE",
        },
        ".js": {
            labelColor: "#FFD700", // Gold for JavaScript files
            color: "#FFFACD",
        },
        ".json": {
            labelColor: "#228B22", // Forest green for JSON files
            color: "#90EE90",
        },
        ".py": {
            labelColor: "#4B0082", // Indigo for Python files
            color: "#DDA0DD",
        },
        ".cpp": {
            labelColor: "#4682B4", // Steel blue for C++ files
            color: "#B0E0E6",
        },
        ".c": {
            labelColor: "#4682B4", // Steel blue for C files
            color: "#B0E0E6",
        },
        ".java": {
            labelColor: "#FF6347", // Tomato red for Java files
            color: "#FA8072",
        },
        ".bat": {
            labelColor: "#A52A2A", // Brown for batch files
            color: "#F4A460",
        },
        ".sh": {
            labelColor: "#008000", // Green for shell scripts
            color: "#90EE90",
        },
        ".log": {
            labelColor: "#696969", // Dim gray for log files
            color: "#D3D3D3",
        },
    };

    // Fallback style for unspecified extensions
    const fallbackStyle = {
        labelColor: "#808080", // Gray
        color: "#D3D3D3",
    };

    return (
        <FileIcon
            extension={normalizedExtension}
            {...(customStyles[extension] || fallbackStyle)}
        />
    );
};

export default ColoredFileIcon;