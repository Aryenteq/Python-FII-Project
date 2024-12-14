import React, { useState } from "react";
import OptionsList from "./OptionsList";
import { options } from "../../utils/header/optionsConfig";
import { handleOptionSelect } from "./optionHandler";
import ShortcutModal from "./ShurtcutModal";
import { useItems } from "../../context/ItemsContext";

const Header: React.FC = () => {
    const [showShortcutInfo, setShowShortcutInfo] = useState(false);
    const { setShowHiddenItems } = useItems();

    return (
        <>
            <header className="flex items-center p-2 bg-gray-900 text-white">
                {options.map((option, index) => (
                    <OptionsList
                        key={index}
                        option={option.name}
                        options={option.subOptions}
                        onSelect={(selectedOption) => handleOptionSelect(selectedOption, setShowShortcutInfo, setShowHiddenItems)}
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