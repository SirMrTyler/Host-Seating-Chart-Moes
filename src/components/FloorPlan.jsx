import React from "react";
import Table from "./Table";
import ServerButton from "./ServerButton";
import "../css/FloorPlan.css";

const FloorPlan = () => {
    const serverButtons = Array.from({ length: 7 }, (_, i) => (
        <ServerButton key={i} count={i + 1} />
    ));

    const tableNumbers = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        31, 32, 33, 34, 35, 36
    ];

    const tables = tableNumbers.map((number) => (
        <Table key={number} number={number} />
    ));

    return (
        <div className="card">
            <div className="floor-plan">
                <div className="server-buttons">
                    {serverButtons}
                </div>
                <div className="tables-container">
                    <div className="tables">{tables}</div>
                </div>
                <div className="table-info">
                    <div className="table-info-row">
                        <div>Table Number: </div>
                        <div>Time Seated: </div>
                        <div>Time Till Check In: </div>
                        <div>Time Elapsed: </div>
                    </div>
                    <div className="table-info-row">
                        <div>Section: </div>
                        <div>Party Size: </div>
                        <div>Ticket Number: </div>
                        <div>Assigned Server: </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FloorPlan;