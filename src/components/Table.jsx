import React from "react";
import "../css/Table.css";

const Table = ({ number }) => {
    const rectangleNumbers = [1, 5, 6, 8, 9, 10, 13, 14, 15, 16, 18, 19, 20, 22, 23, 24, 25, 26, 31, 32, 33];
    const circleNumbers = [4, 7, 17, 21, 27];

    const shapeClass = rectangleNumbers.includes(number) 
        ? "rectangle" 
        : circleNumbers.includes(number) 
        ? "circle"
        : "square";
    return (
        <div className={`table ${shapeClass}`}>
            <p>{number}</p>
        </div>
    );
};

export default Table;