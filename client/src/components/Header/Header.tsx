import React from "react";
import OptionsList from "./OptionsList";

import { options } from "../../utils/header/optionsConfig";
import { handleOptionSelect } from "../../utils/header/optionHandler";

const Header: React.FC = () => {
    return (
        <header className="flex items-center p-2 bg-gray-900 text-white">
            {options.map((option, index) => (
                <OptionsList
                    key={index}
                    option={option.name}
                    options={option.subOptions}
                    onSelect={handleOptionSelect}
                />
            ))}
        </header>
    );
};

export default Header;