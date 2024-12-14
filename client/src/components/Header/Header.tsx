import React, { useState } from "react";
import OptionsList from "./OptionsList";
import { options } from "../../utils/header/optionsConfig";
import { handleOptionSelect } from "./optionHandler";
import ShortcutModal from "./ShurtcutModal";

const Header: React.FC = () => {
    const [showShortcutInfo, setShowShortcutInfo] = useState(false);

    return (
        <>
            <header className="flex items-center p-2 bg-gray-900 text-white">
                {options.map((option, index) => (
                    <OptionsList
                        key={index}
                        option={option.name}
                        options={option.subOptions}
                        onSelect={(selectedOption) => handleOptionSelect(selectedOption, setShowShortcutInfo)}
                    />
                ))}
            </header>

            {showShortcutInfo && (
                <ShortcutModal onClose={() => setShowShortcutInfo(false)} />
            )}
        </>
    );
};

export default Header;