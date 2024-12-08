import React from "react";
import Panel from "./Panel";

const PanelContainer: React.FC = () => {
    return (
        <section className="flex flex-grow h-full">
            <Panel />
            <Panel />
        </section>
    );
};

export default PanelContainer;