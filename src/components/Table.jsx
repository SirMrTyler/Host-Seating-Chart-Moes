import React from "react";
import "../css/Table.css";

const Table = ({
    onClick,
    number,
    section,
    isWindow,
    isSeated,
    assignedServer,
    partySize,
    isSelected,
}) => {
   

    const rectangleNumbers = [1, 5, 6, 8, 9, 10, 13, 14, 15, 16, 18, 19, 20, 22, 23, 24, 25, 26, 31, 32, 33];
    const circleNumbers = [4, 7, 17, 21, 27];
    const squareNumbers = [2, 3, 11, 12, 28, 29, 34, 35, 36];
    
    let shapeClass;

    if (rectangleNumbers.includes(number)) {
        shapeClass = "rectangle";
    } else if (circleNumbers.includes(number)) {
        shapeClass = "circle";
    } else if (squareNumbers.includes(number)) {
        shapeClass = "square";
    }

    const backgroundColor = isSeated ? "red" : (isSelected ? "blue" : "white");
    const textColor = isSelected ? "white" : (isSeated ? "white" : "black");
    const boxShadow = isSelected ? "0 0 15px 0 rgba(0, 0, 0, 1)" : "none";

    return (
        <div 
            className={`table ${shapeClass} table-${number} section-${section}`}
            style={{ backgroundColor, boxShadow }}
            onClick={onClick}
        >
            <p style={{color: textColor}}>{number}</p>
            
        </div>
    );
};

export default Table;