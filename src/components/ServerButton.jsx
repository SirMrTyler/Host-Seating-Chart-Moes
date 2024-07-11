import React from "react";
import "../css/ServerButton.css";

const ServerButton = ({ count }) => {
    return (
        <button className="server-button">
            {count} Server{count > 1 ? "s" : ""}
        </button>
    );
};

export default ServerButton;