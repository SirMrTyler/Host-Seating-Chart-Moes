import React from "react";
import "../css/ServerButton.css";

const ServerButton = ({ 
        onClick,
        isSelected,
        backgroundColor, 
        textColor, 
        name 
    }) => {
    return (
        <button 
            className={`
                server-button ${isSelected ? "selected" : ""}`
            }
            style={{ 
                backgroundColor: backgroundColor,
                color: textColor
            }}
            onClick={onClick}
        >
            {name}
        </button>
    );
};

export default ServerButton;