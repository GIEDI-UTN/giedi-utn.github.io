// ASTM SCH40 pipe standards for the Venturi simulator
// Standard pipe dimensions for ASTM SCH40 up to 12 inches
export const PIPE_STANDARDS = {
    // Format: [nominal size in inches, inner diameter in mm]
    astmSch40: [
        [0.5, 15.80],  // 1/2 inch
        [0.75, 20.93], // 3/4 inch
        [1, 26.64],    // 1 inch
        [1.25, 35.05], // 1-1/4 inch
        [1.5, 40.89],  // 1-1/2 inch
        [2, 52.50],    // 2 inch
        [2.5, 62.71],  // 2-1/2 inch
        [3, 77.93],    // 3 inch
        [4, 102.26],   // 4 inch
        [6, 154.05],   // 6 inch
        [8, 202.72],   // 8 inch
        [10, 254.51],  // 10 inch
        [12, 303.23]   // 12 inch
    ]
};

// Get available pipe sizes as an array of objects with inch and mm values
export function getAvailablePipeSizes() {
    return PIPE_STANDARDS.astmSch40.map(([inch, mm]) => ({
        inch: inch,
        mm: Math.round(mm)
    }));
}

// Find closest standard pipe size to a given diameter in mm
export function findClosestPipeSize(diameter) {
    const sizes = PIPE_STANDARDS.astmSch40;
    let closest = sizes[0];
    let minDiff = Math.abs(diameter - closest[1]);
    
    for (let i = 1; i < sizes.length; i++) {
        const diff = Math.abs(diameter - sizes[i][1]);
        if (diff < minDiff) {
            minDiff = diff;
            closest = sizes[i];
        }
    }
    
    return {
        inch: closest[0],
        mm: Math.round(closest[1])
    };
}