import React from "react";

interface OptionsListProps {
    option: string;
    options: string[];
    onSelect: (selectedOption: string) => void;
}

const OptionsList: React.FC<OptionsListProps> = ({ option, options, onSelect }) => {
    return (
        <div className="relative group inline-block">
            {/* Header Option */}
            <div className="rounded px-2 py-1 cursor-pointer hover:bg-gray-600 text-white transition-colors duration-200">
                {option}
            </div>

            {/* Dropdown Menu */}
            <div className="min-w-[5em] flex flex-col items-center justify-center absolute left-0 top-full hidden group-hover:block bg-gray-800 rounded shadow-lg z-10">
                {options.map((subOption, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                        onClick={() => onSelect(subOption)}
                    >
                        {subOption}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OptionsList;