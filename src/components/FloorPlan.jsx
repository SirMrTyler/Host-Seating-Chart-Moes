import React, { useState, useEffect, useRef } from "react";
import Table from "./Table";
import ServerButton from "./ServerButton";
import "../css/FloorPlan.css";

const FloorPlan = () => {
    const [servers, setSelectedSection] = useState(1);
    const [tables, setTables] = useState(Array.from({ length: 36 }, (_, i) => ({
        tableNumber: i + 1,
        section: 1,
        isWindow: i <= 19,
        isSeated: (i + 1) === 30,
        assignedServer: null,
        partySize: 0,
        priority: 0,
    })));
    const [selectedTable, setSelectedTable] = useState(false);
    const [recommendedTable, setRecommendedTable] = useState(null);
    const [lastSeatedSection, setLastSeatedSection] = useState(null);
    const [skippedSections, setSkippedSections] = useState([]);
    const [partySizeInput, setPartySizeInput] = useState("");
    const [showPartySizeInput, setShowPartySizeInput] = useState(false);
    const partySizeInputRef = useRef(null);

    // Update tables when the number of servers changes
    useEffect(() => {
        const updatedTables = tables.map(table => ({
            ...table,
            section: updateTableSections(servers, table.tableNumber),
        }));
        setTables(updatedTables);
    }, [servers]);

    // Add an event listener to handle clicks outside the party size input
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (partySizeInputRef.current && !partySizeInputRef.current.contains(event.target)) {
                setShowPartySizeInput(false);
            }
        };
        if (showPartySizeInput) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        };
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [showPartySizeInput]);
    useEffect(() => {
        const nextTable = findNextTableToSeat();
        setRecommendedTable(nextTable);
    }, [tables, lastSeatedSection]);

    // Handle the click event for the ServerButton component
    const handleServerButtonClick = (count) => {setSelectedSection(count);}

    const serverButtons = Array.from({ length: 7 }, (_, i) => (
        <ServerButton 
            key={i} 
            onClick={() => handleServerButtonClick(i + 1)}
            isSelected={servers === i}
            backgroundColor={"blue"}
            textColor={"white"}
            name={`Server ${i + 1}`}
        />
    ));
    
    // Find the next table to seat based on the last seated table, 
    // isWindow, and isSeated properties
    const findNextTableToSeat = () => {
        const allAvailableTables = tables.filter(table => !table.isSeated);

        // Get unique sections from available tables
        const availableSections = [...new Set(allAvailableTables.map(table => table.section))];

        const prioritizedSections = [
            ...skippedSections,
            ...availableSections.filter(section => !skippedSections.includes(section))
        ];

        for (const section of prioritizedSections) {
            // Find all available tables in the current section
            const tablesInSection = allAvailableTables.filter(table => table.section === section);

            // Sort by window first, then by priority within the section
            const sortedTables = tablesInSection.sort((a, b) => {
                if (a.isWindow !== b.isWindow) {
                    return a.isWindow ? -1 : 1;
                }
                return a.priority - b.priority;
            });

            if (sortedTables.length > 0) {
                return sortedTables[0];
            }
        }

        return null;
    };

    const handleConfirmRecommendedSeating = () => {
        if (recommendedTable) {
            setTables(prevTables =>
                prevTables.map(table => {
                    if (table.tableNumber === recommendedTable.tableNumber) {
                        const updatedTable = {
                            ...table,
                            isSeated: true,
                            assignedServer: servers,
                            priority: 0,
                        };
                        // Update last seated section
                        setLastSeatedSection(updatedTable.section);

                        return updatedTable;
                    } else if (table.section === recommendedTable.section && !table.isSeated) {
                        // Incresase priority for skipped section tables
                        return {
                            ...table,
                            priority: table.priority + 1
                        };
                    }
                    return table;
                })
            );
            // Add last seated section to skipped sections
            if (!skippedSections.includes(recommendedTable.section)) {
                setSkippedSections([...skippedSections, recommendedTable.section]);
            }

            // Clear selected and recommended tables
            setSelectedTable(null);
            setRecommendedTable(null);
        }
    };

    const renderRecommendedTableOrSeatButton = () => {
        if (recommendedTable) {
            return (
                <ServerButton
                    key={`recommended-table-${recommendedTable.tableNumber}`}
                    onClick={handleConfirmRecommendedSeating}
                    backgroundColor={"blue"}
                    textColor={"white"}
                    name={`Seat Table ${recommendedTable.tableNumber}`}
                />
            );
        } else {
            return (
                <ServerButton
                    key={`no-tables-available`}
                    backgroundColor={"gray"}
                    textColor={"white"}
                    name={`No Tables Available`}
                />
            );
        }
    };

    const handleTableClick = (section, tableNumber) => {
        setSelectedTable(prevSelectedTable => {
            if(prevSelectedTable && prevSelectedTable.tableNumber === tableNumber) {
                return null;
            }
            return tables.find(table => table.tableNumber === tableNumber);
        });
        
        console.log(`Section ${section}, Table ${tableNumber} clicked`);
    }
    
    const handlePartySizeInput = (digit) => {
        setPartySizeInput(prevPartySizeInput => (prevPartySizeInput + digit).slice(0, 2));
    };

    const handleConfirmPartySize = () => {
        const partySize = parseInt(partySizeInput, 10);
        if (!isNaN(partySize) && selectedTable) {
            setTables(prevTables => prevTables.map(table => {
                if (table.tableNumber === selectedTable.tableNumber) {
                    const updatedTable = {
                        ...table,
                        isSeated: true,
                        assignedServer: servers,
                        partySize,
                    };
                    setSelectedTable(updatedTable);
                    return updatedTable;
                }
                return table;
            }));
        }
        setPartySizeInput("");
        setShowPartySizeInput(false);
    };

    const handleSeatTableButtonClick = (tableNumber) => {
        const currentTable = tables.find(table => table.tableNumber === tableNumber);

        if (currentTable.isSeated) {
            setTables(prevTables => prevTables.map(table => {
                if (table.tableNumber === tableNumber) {
                    return {
                        ...table,
                        isSeated: false,
                        assignedServer: null,
                        partySize: 0,
                    };
                }
                return table;
                }));
                setSelectedTable(null);
        } else {
            setSelectedTable(currentTable);
            setShowPartySizeInput(true);
        }
    };

    const getTableMaxCapacity = (tableNumber) => {
        const rectangleNumbers = [1, 5, 6, 8, 9, 10, 13, 14, 15, 16, 18, 19, 20, 22, 23, 24, 25, 26, 31, 32, 33];
        const circleNumbers = [4, 7, 17, 21, 27];
        const squareNumbers = [2, 3, 11, 12, 28, 29, 30, 34, 35, 36];

        if (rectangleNumbers.includes(tableNumber)) return 6;
        if (circleNumbers.includes(tableNumber)) return 8;
        if (squareNumbers.includes(tableNumber)) return 4;
    }

    const updateTableSections = (serversOn, tableNumber) => {
        let sectionNum = 1;
        
        switch (serversOn) {
            case 1:
                    return 1;
            case 2:
                    return tableNumber <= 11 || tableNumber >= 29 ? sectionNum = 1 : sectionNum = 2;
            case 3:
                if (tableNumber <= 6 || tableNumber >= 32) return 1;
                if ((tableNumber >= 7 && tableNumber <= 14) || (tableNumber >= 27 && tableNumber <= 32)) return 2;
                return 3;  
            case 4:
                if (tableNumber <= 4 || tableNumber >= 34) return 1;
                if ((tableNumber >= 5 && tableNumber <= 11) || (tableNumber >= 29 && tableNumber <= 33)) return 2;
                if ((tableNumber >= 12 && tableNumber <= 16) || (tableNumber >= 24 && tableNumber <= 28)) return 3;
                return 4;
            case 5:
                if (tableNumber <= 4 || tableNumber >= 34) return 1;
                if ((tableNumber >= 5 && tableNumber <= 9) || (tableNumber >= 32 && tableNumber <= 33)) return 2;
                if ((tableNumber >= 10 && tableNumber <= 13) || (tableNumber >= 27 && tableNumber <= 31)) return 3;
                if ((tableNumber >= 14 && tableNumber <= 16) || (tableNumber >= 23 && tableNumber <= 26)) return 4;
                return 5;
            case 6:
                if (tableNumber <= 3 || tableNumber >= 34) return 1;
                if ((tableNumber >= 4 && tableNumber <= 6) || (tableNumber >= 32 && tableNumber <= 33)) return 2;
                if ((tableNumber >= 7 && tableNumber <= 10) || (tableNumber >= 29 && tableNumber <= 31)) return 3;
                if ((tableNumber >= 11 && tableNumber <= 13) || (tableNumber >= 27 && tableNumber <= 28)) return 4;
                if ((tableNumber >= 14 && tableNumber <= 16) || (tableNumber >= 24 && tableNumber <= 26)) return 5;
                return 6;                
            case 7:
                if (tableNumber <= 3 || tableNumber >= 34)
                    return 1;
                if ((tableNumber >= 4 && tableNumber <= 6) || (tableNumber >= 32 && tableNumber <= 33)) 
                    return 2;
                if ((tableNumber >= 7 && tableNumber <= 9) || (tableNumber >= 30 && tableNumber <= 31)) 
                    return 3;
                if ((tableNumber >= 10 && tableNumber <= 12) || (tableNumber >= 28 && tableNumber <= 29)) 
                    return 4;
                if ((tableNumber >= 13 && tableNumber <= 15) || (tableNumber === 27)) 
                    return 5;
                if ((tableNumber >= 16 && tableNumber <= 17) || (tableNumber >= 24 && tableNumber <= 26)) return 6;
                    return 7;
            default:
                return sectionNum;
        }
    };

    const drawSections = (section) => {
        const tablesInSection = tables.filter(table => table.section === section);
        const sortedTables = sortTablesInSection(tablesInSection);
        
        return (
            <div 
                key={section} 
                className={`floor-section section-${section}`}
            >
                    {section}
                <div className="tables-container">
                    {sortedTables.map((table) => (
                        table.tableNumber === 30 ? 
                            <div className="bar" key={table.tableNumber}></div> 
                            : <Table
                                key={table.tableNumber}
                                onClick={() => handleTableClick(table.section, table.tableNumber)}
                                number={table.tableNumber}
                                section={table.section}
                                isWindow={table.isWindow}
                                isSeated={table.isSeated}
                                assignedServer={table.assignedServer}
                                partySize={table.partySize}
                                isSelected={selectedTable && selectedTable.tableNumber === table.tableNumber}
                            />
                    ))}
                </div>
            </div>
        );
    }

    const sortTablesInSection = (tablesInSection) => {
        const orderRow1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        const orderRow2 = [36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 18];
        const orderRow3 = [23, 22, 19];
        const orderRow4 = [21, 20];

        const sortedRow1 = tablesInSection.filter(table => 
            orderRow1.includes(table.tableNumber)).sort((a, b) => 
                orderRow1.indexOf(a.tableNumber) - orderRow1.indexOf(b.tableNumber));
        const sortedRow2 = tablesInSection.filter(table =>
            orderRow2.includes(table.tableNumber)).sort((a, b) =>
                orderRow2.indexOf(a.tableNumber) - orderRow2.indexOf(b.tableNumber));
        const sortedRow3 = tablesInSection.filter(table =>
            orderRow3.includes(table.tableNumber)).sort((a, b) =>
                orderRow3.indexOf(a.tableNumber) - orderRow3.indexOf(b.tableNumber));
        const sortedRow4 = tablesInSection.filter(table =>
            orderRow4.includes(table.tableNumber)).sort((a, b) =>
                orderRow4.indexOf(a.tableNumber) - orderRow4.indexOf(b.tableNumber));

        return [...sortedRow1, ...sortedRow2, ...sortedRow3, ...sortedRow4];
    }
    
    const gridStyle = {
        display: "grid",
        gridTemplateColumns: `repeat(${servers}, 1fr`,
        width: `${100}%`,
    };

    const drawFloorPlan = () => {
        const sections = [];        
        for(let i = 1; i <= servers; i++) {   
            sections.push(drawSections(i));
        }

        return (
            <div className="floor-container">
                <div className="sections-container" style={gridStyle}>
                    {sections}
                </div>
            </div>
        );
    }

    
    return (
        <div>
            <div className={`${showPartySizeInput ? "blur-background" : ""}`}>
                <div className="server-buttons">
                    {serverButtons}
                </div>
                <div className="card">
                    <div className="floor-plan">
                        {drawFloorPlan()}
                        {selectedTable && (
                            <div className="table-info">
                                <div className="table-info-row table-info-row-1">
                                    <div>Table Number: <b>{selectedTable.tableNumber}</b></div>
                                    <div>Section: <b>{`${selectedTable.section}`}</b></div>
                                    <div>Time Seated: </div>
                                    <div>Time Elapsed: </div>
                                    <div>Seating: <b>{selectedTable.isSeated ? "Taken" : "Open"}</b></div>
                                </div>
                                <div className="table-info-row table-info-row-2">
                                    <div>Window: <b>{`${selectedTable.isWindow ? "Yes" : "No"}`}</b></div>
                                    <div>Party Size: <b>{`${selectedTable.partySize}`}</b></div>
                                    <div>Max Capacity: <b>{getTableMaxCapacity(selectedTable.tableNumber)}</b></div>
                                    <div>Ticket Number: </div>
                                    <div>Assigned Server: <b>{`${selectedTable.assignedServer}`}</b></div>
                                </div>
                                {selectedTable.isSeated ? (
                                    <ServerButton 
                                        key={selectedTable.tableNumber} 
                                        onClick={() => handleSeatTableButtonClick(selectedTable.tableNumber)}
                                        backgroundColor={"green"}
                                        textColor={"white"}
                                        name={`Open Table ${selectedTable.tableNumber}`}
                                    />
                                ) : (
                                    <ServerButton 
                                        key={selectedTable.tableNumber} 
                                        onClick={() => handleSeatTableButtonClick(selectedTable.tableNumber)}
                                        backgroundColor={"blue"}
                                        textColor={"white"}
                                        name={`Seat Table ${selectedTable.tableNumber}`}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {renderRecommendedTableOrSeatButton()}
                </div>
            </div>
            {showPartySizeInput && (
                <div ref={partySizeInputRef} className="party-size-input">
                    <div className="party-size-display">
                        {partySizeInput || "0"}
                    </div>
                    <div className="party-size-buttons">
                        <div className="grid-container">
                            {[1, 2, 3, 4, 6, 7, 8, 9, 0].map(digit => (
                                <button 
                                    key={digit} 
                                    onClick={() => handlePartySizeInput(digit)}
                                >
                                    {digit}
                                </button>
                            ))}
                            <button className="clear-btn" onClick={() => setPartySizeInput("")}>
                                Clear
                            </button>
                            <button className="confirm-btn" onClick={handleConfirmPartySize}>
                                Confirm
                            </button>
                        </div>
                </div>
            </div>      
            )}
        </div>
    );
};

export default FloorPlan;