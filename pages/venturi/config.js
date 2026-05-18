// Configuration parameters for the Venturi Effect Simulator
export const CONFIG = {
    // Flow rate range
    flowRate: {
        min: 0,
        max: 20,
        step: 0.1,
        default: 5
    },
    
    // Inlet pressure range
    inletPressure: {
        min: 0,
        max: 1000,
        step: 1,
        default: 200
    },
    
    // Inlet diameter range (mm) - Now uses ASTM SCH40 standards
    inletDiameter: {
        min: 15.80,  // 1/2 inch SCH40
        max: 303.23, // 12 inch SCH40
        step: 1,
        default: 102.26 // 4 inch SCH40
    },
    
    // Throat diameter range (mm)
    throatDiameter: {
        min: 10,
        max: 100,
        step: 10,
        default: 50
    },
    
    // Temperature range (°C)
    temperature: {
        min: 0,
        max: 100,
        step: 1,
        default: 20
    },
    
    // Error distribution parameters
    errors: {
        fixedErrors: {
            stdDev: 0.02, // 2% standard deviation
            maxDeviation: 0.02 // 2% maximum deviation
        },
        randomErrors: {
            stdDev: 0.02, 
            maxDeviation: 0.05
        }
    },
    
    // Animation settings
    animation: {
        flowSpeed: 0.5, // Base speed for flow animation
        transitionDuration: 300 // ms
    }
};

// Water properties lookup tables
export const WATER_PROPERTIES = {
    // Density of water at different temperatures (kg/m^3)
    density: {
        0: 999.8,
        10: 999.7,
        20: 998.2,
        30: 995.7,
        40: 992.2,
        50: 988.1,
        60: 983.2,
        70: 977.8,
        80: 971.8,
        90: 965.3,
        100: 958.4
    },
    
    // Vapor pressure of water at different temperatures (kPa)
    vaporPressure: {
        0: 0.61,
        10: 1.23,
        20: 2.34,
        30: 4.24,
        40: 7.38,
        50: 12.33,
        60: 19.92,
        70: 31.16,
        80: 47.34,
        90: 70.10,
        100: 101.33
    }
};

// Helper function to interpolate water properties based on temperature
export function interpolateProperty(property, temperature) {
    const temps = Object.keys(property).map(Number).sort((a, b) => a - b);
    
    // If temperature is below minimum or above maximum, use boundary values
    if (temperature <= temps[0]) return property[temps[0]];
    if (temperature >= temps[temps.length - 1]) return property[temps[temps.length - 1]];
    
    // Find the two closest temperature points
    let lowerTemp = temps[0];
    let upperTemp = temps[temps.length - 1];
    
    for (let i = 0; i < temps.length; i++) {
        if (temps[i] <= temperature) lowerTemp = temps[i];
        if (temps[i] >= temperature) {
            upperTemp = temps[i];
            break;
        }
    }
    
    // If we found exact temperature match
    if (lowerTemp === upperTemp) return property[lowerTemp];
    
    // Linear interpolation
    const ratio = (temperature - lowerTemp) / (upperTemp - lowerTemp);
    return property[lowerTemp] + ratio * (property[upperTemp] - property[lowerTemp]);
}