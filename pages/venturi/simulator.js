import { CONFIG, WATER_PROPERTIES, interpolateProperty } from './config.js';
import { getAvailablePipeSizes } from './pipe-standards.js';
import * as d3 from 'd3';
import { promptForAdminPassword } from './auth.js';

// Simulation state
let simulationState = {
    flowRate: CONFIG.flowRate.default,
    inletPressure: CONFIG.inletPressure.default,
    inletDiameter: CONFIG.inletDiameter.default,
    throatDiameter: CONFIG.throatDiameter.default,
    temperature: CONFIG.temperature.default,
    errorsActive: false,
    adminMode: false,
    errors: {
        fixed: {
            inletDiameter: 0,
            throatDiameter: 0,
            outletDiameter: 0,
            density: 0
        },
        random: {}
    }
};

// Initialize the simulation
function initSimulation() {
    setupEventListeners();
    populatePipeSizes();
    createVenturiDiagram();
    generateFixedErrors();
    updateSimulation();
}

// Populate the pipe size dropdown with ASTM SCH40 options
function populatePipeSizes() {
    const selectElement = document.getElementById('inlet-diameter-select');
    const pipeSizes = getAvailablePipeSizes();
    
    pipeSizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size.mm;
        option.textContent = `${size.inch}" (${size.mm} mm)`;
        selectElement.appendChild(option);
    });
    
    // Set default selection to match config default
    for (let i = 0; i < selectElement.options.length; i++) {
        if (parseFloat(selectElement.options[i].value) === CONFIG.inletDiameter.default) {
            selectElement.selectedIndex = i;
            break;
        }
    }
}

// Set up event listeners for the UI controls
function setupEventListeners() {
    // Diameter of inlet (now using dropdown instead of slider)
    const inletDiameterSelect = document.getElementById('inlet-diameter-select');
    const inletDiameterMm = document.getElementById('inlet-diameter-mm');
    
    inletDiameterSelect.addEventListener('change', () => {
        const selectedValue = parseFloat(inletDiameterSelect.value);
        simulationState.inletDiameter = selectedValue;
        inletDiameterMm.textContent = `${selectedValue.toFixed(2)} mm`;
        updateSimulation();
    });
    
    // Diameter of throat
    const throatDiameterSlider = document.getElementById('throat-diameter-slider');
    const throatDiameterInput = document.getElementById('throat-diameter');
    
    throatDiameterSlider.addEventListener('input', () => {
        throatDiameterInput.value = throatDiameterSlider.value;
        simulationState.throatDiameter = Number(throatDiameterSlider.value);
        updateSimulation();
    });
    
    throatDiameterInput.addEventListener('change', () => {
        if (throatDiameterInput.value < CONFIG.throatDiameter.min) throatDiameterInput.value = CONFIG.throatDiameter.min;
        if (throatDiameterInput.value > CONFIG.throatDiameter.max) throatDiameterInput.value = CONFIG.throatDiameter.max;
        throatDiameterSlider.value = throatDiameterInput.value;
        simulationState.throatDiameter = Number(throatDiameterInput.value);
        updateSimulation();
    });
    
    // Flow rate
    const flowRateSlider = document.getElementById('flow-rate-slider');
    const flowRateInput = document.getElementById('flow-rate');
    
    flowRateSlider.addEventListener('input', () => {
        flowRateInput.value = flowRateSlider.value;
        simulationState.flowRate = Number(flowRateSlider.value);
        updateSimulation();
    });
    
    flowRateInput.addEventListener('change', () => {
        if (flowRateInput.value < CONFIG.flowRate.min) flowRateInput.value = CONFIG.flowRate.min;
        if (flowRateInput.value > CONFIG.flowRate.max) flowRateInput.value = CONFIG.flowRate.max;
        flowRateSlider.value = flowRateInput.value;
        simulationState.flowRate = Number(flowRateInput.value);
        updateSimulation();
    });
    
    // Inlet pressure
    const inletPressureSlider = document.getElementById('inlet-pressure-slider');
    const inletPressureInput = document.getElementById('inlet-pressure');
    
    inletPressureSlider.addEventListener('input', () => {
        inletPressureInput.value = inletPressureSlider.value;
        simulationState.inletPressure = Number(inletPressureSlider.value);
        updateSimulation();
    });
    
    inletPressureInput.addEventListener('change', () => {
        if (inletPressureInput.value < CONFIG.inletPressure.min) inletPressureInput.value = CONFIG.inletPressure.min;
        if (inletPressureInput.value > CONFIG.inletPressure.max) inletPressureInput.value = CONFIG.inletPressure.max;
        inletPressureSlider.value = inletPressureInput.value;
        simulationState.inletPressure = Number(inletPressureInput.value);
        updateSimulation();
    });
    
    // Temperature
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureInput = document.getElementById('temperature');
    
    temperatureSlider.addEventListener('input', () => {
        temperatureInput.value = temperatureSlider.value;
        simulationState.temperature = Number(temperatureSlider.value);
        updateSimulation();
    });
    
    temperatureInput.addEventListener('change', () => {
        if (temperatureInput.value < CONFIG.temperature.min) temperatureInput.value = CONFIG.temperature.min;
        if (temperatureInput.value > CONFIG.temperature.max) temperatureInput.value = CONFIG.temperature.max;
        temperatureSlider.value = temperatureInput.value;
        simulationState.temperature = Number(temperatureInput.value);
        updateSimulation();
    });
    
    // Toggle errors button
    const toggleErrorsButton = document.getElementById('toggle-errors');
    toggleErrorsButton.addEventListener('click', () => {
        simulationState.errorsActive = !simulationState.errorsActive;
        toggleErrorsButton.classList.toggle('active');
        toggleErrorsButton.textContent = simulationState.errorsActive ? 'Desactivar Errores' : 'Activar Errores';
        updateSimulation();
    });
    
    // Admin mode button
    const adminModeButton = document.getElementById('admin-mode');
    adminModeButton.addEventListener('click', () => {
        // Require password authentication before enabling admin mode
        if (!simulationState.adminMode && !promptForAdminPassword()) {
            return; // Exit if authentication fails
        }
        
        simulationState.adminMode = !simulationState.adminMode;
        adminModeButton.classList.toggle('active');
        adminModeButton.textContent = simulationState.adminMode ? 'Salir de Modo Administrador' : 'Modo Administrador';
        
        // Toggle visibility of errors table and reconfigure errors button
        const errorsTable = document.getElementById('errors-table');
        const reconfigureErrorsButton = document.getElementById('reconfigure-errors');
        
        if (simulationState.adminMode) {
            errorsTable.classList.remove('hidden');
            reconfigureErrorsButton.classList.remove('hidden');
            updateErrorsTable();
        } else {
            errorsTable.classList.add('hidden');
            reconfigureErrorsButton.classList.add('hidden');
        }
    });
    
    // Reconfigure errors button
    const reconfigureErrorsButton = document.getElementById('reconfigure-errors');
    reconfigureErrorsButton.addEventListener('click', () => {
        generateFixedErrors();
        updateErrorsTable();
        updateSimulation();
    });
    
    // Export data button
    const exportDataButton = document.getElementById('export-data');
    exportDataButton.addEventListener('click', exportData);
}

// Create the Venturi diagram using D3.js
function createVenturiDiagram() {
    const container = document.getElementById('venturi-diagram');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create SVG element
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Define gradient for cavitation effect
    const defs = svg.append('defs');
    
    const cavitationGradient = defs.append('linearGradient')
        .attr('id', 'cavitationGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
        
    cavitationGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#51a3d3');
        
    cavitationGradient.append('stop')
        .attr('offset', '40%')
        .attr('stop-color', '#51a3d3');
        
    cavitationGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', 'white');
        
    cavitationGradient.append('stop')
        .attr('offset', '60%')
        .attr('stop-color', '#51a3d3');
        
    cavitationGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#51a3d3');
    
    // Create Venturi tube
    const venturiGroup = svg.append('g')
        .attr('class', 'venturi')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Inlet section
    venturiGroup.append('rect')
        .attr('class', 'pipe inlet-pipe')
        .attr('x', -width/2 + 50)
        .attr('y', -40)
        .attr('width', width/4)
        .attr('height', 80)
        .attr('rx', 5)
        .attr('ry', 5);
    
    // Throat section
    venturiGroup.append('path')
        .attr('class', 'pipe throat-pipe')
        .attr('d', 'M ' + (-width/4 + 50) + ' -40 ' +
              'L ' + (-width/8 + 50) + ' -20 ' +
              'L ' + (width/8 - 50) + ' -20 ' +
              'L ' + (width/4 - 50) + ' -40 ' +
              'L ' + (width/4 - 50) + ' 40 ' +
              'L ' + (width/8 - 50) + ' 20 ' +
              'L ' + (-width/8 + 50) + ' 20 ' +
              'L ' + (-width/4 + 50) + ' 40 Z');
    
    // Outlet section
    venturiGroup.append('rect')
        .attr('class', 'pipe outlet-pipe')
        .attr('x', width/4 - 50)
        .attr('y', -40)
        .attr('width', width/4)
        .attr('height', 80)
        .attr('rx', 5)
        .attr('ry', 5);
    
    // Water flow visualization
    venturiGroup.append('rect')
        .attr('class', 'water inlet-water')
        .attr('x', -width/2 + 55)
        .attr('y', -35)
        .attr('width', width/4 - 10)
        .attr('height', 70);
    
    venturiGroup.append('path')
        .attr('class', 'water throat-water')
        .attr('d', 'M ' + (-width/4 + 55) + ' -35 ' +
              'L ' + (-width/8 + 45) + ' -15 ' +
              'L ' + (width/8 - 45) + ' -15 ' +
              'L ' + (width/4 - 55) + ' -35 ' +
              'L ' + (width/4 - 55) + ' 35 ' +
              'L ' + (width/8 - 45) + ' 15 ' +
              'L ' + (-width/8 + 45) + ' 15 ' +
              'L ' + (-width/4 + 55) + ' 35 Z');
    
    venturiGroup.append('rect')
        .attr('class', 'water outlet-water')
        .attr('x', width/4 - 45)
        .attr('y', -35)
        .attr('width', width/4 - 10)
        .attr('height', 70);
    
    // Create inlet pressure manometer
    createManometer(svg, width/4, height/4, 'Presión de Entrada', 'inlet-manometer');
    
    // Create throat pressure manometer
    createManometer(svg, width*3/4, height/4, 'Presión de Garganta', 'throat-manometer');
    
    // Add labels
    venturiGroup.append('text')
        .attr('x', -width/3)
        .attr('y', 80)
        .attr('text-anchor', 'middle')
        .attr('class', 'venturi-label')
        .text('Entrada');
    
    venturiGroup.append('text')
        .attr('x', 0)
        .attr('y', 80)
        .attr('text-anchor', 'middle')
        .attr('class', 'venturi-label')
        .text('Garganta');
    
    venturiGroup.append('text')
        .attr('x', width/3)
        .attr('y', 80)
        .attr('text-anchor', 'middle')
        .attr('class', 'venturi-label')
        .text('Salida');
    
    // Add flow direction arrow
    venturiGroup.append('path')
        .attr('class', 'flow-arrow')
        .attr('d', 'M -100,60 L -70,60 L -70,70 L -50,50 L -70,30 L -70,40 L -100,40 Z')
        .attr('fill', '#034f84');
    
    venturiGroup.append('text')
        .attr('x', -75)
        .attr('y', 90)
        .attr('text-anchor', 'middle')
        .attr('class', 'flow-label')
        .text('Dirección del flujo');
}

// Create a manometer display
function createManometer(svg, x, y, label, id) {
    const manometer = svg.append('g')
        .attr('class', 'manometer')
        .attr('id', id)
        .attr('transform', `translate(${x}, ${y})`);
    
    // Dial background
    manometer.append('circle')
        .attr('r', 50)
        .attr('fill', 'white')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2);
    
    // Dial marks
    for (let i = 0; i <= 10; i++) {
        const angle = -Math.PI + i * Math.PI / 5;
        const x1 = 40 * Math.cos(angle);
        const y1 = 40 * Math.sin(angle);
        const x2 = 50 * Math.cos(angle);
        const y2 = 50 * Math.sin(angle);
        
        manometer.append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', '#666')
            .attr('stroke-width', i % 5 === 0 ? 2 : 1);
        
        if (i % 5 === 0) {
            manometer.append('text')
                .attr('x', 35 * Math.cos(angle))
                .attr('y', 35 * Math.sin(angle))
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '10px')
                .text(i / 10 * 1000);
        }
    }
    
    // Needle
    manometer.append('line')
        .attr('class', 'needle')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', -40)
        .attr('stroke', 'red')
        .attr('stroke-width', 2);
    
    // Center pin
    manometer.append('circle')
        .attr('r', 5)
        .attr('fill', '#666');
    
    // Label
    manometer.append('text')
        .attr('x', 0)
        .attr('y', 70)
        .attr('text-anchor', 'middle')
        .attr('class', 'manometer-label')
        .text(label);
    
    // Value display
    manometer.append('text')
        .attr('x', 0)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('class', 'value-text')
        .text('0 kPa');
}

// Update needle position on the manometer
function updateManometer(id, pressure) {
    // Map pressure (0-1000 kPa) to angle (-180 to 0 degrees)
    const angle = -Math.PI + Math.min(pressure, 1000) / 1000 * Math.PI;
    
    // Update needle
    d3.select(`#${id} .needle`)
        .transition()
        .duration(CONFIG.animation.transitionDuration)
        .attr('x2', 40 * Math.cos(angle))
        .attr('y2', 40 * Math.sin(angle));
    
    // Update value text
    d3.select(`#${id} .value-text`)
        .text(`${Math.round(pressure)} kPa`);
}

// Generate fixed errors for the simulation
function generateFixedErrors() {
    const { stdDev, maxDeviation } = CONFIG.errors.fixedErrors;
    
    // Generate normalized Gaussian errors with truncation
    simulationState.errors.fixed = {
        inletDiameter: generateGaussianError(stdDev, maxDeviation),
        throatDiameter: generateGaussianError(stdDev, maxDeviation),
        outletDiameter: generateGaussianError(stdDev, maxDeviation),
        density: generateGaussianError(stdDev, maxDeviation)
    };
}

// Generate random Gaussian error with truncation
function generateGaussianError(stdDev, maxDeviation) {
    // Box-Muller transform to generate Gaussian random number
    const u1 = Math.random();
    const u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // Scale by standard deviation
    z0 = z0 * stdDev;
    
    // Truncate to max deviation
    if (z0 > maxDeviation) z0 = maxDeviation;
    if (z0 < -maxDeviation) z0 = -maxDeviation;
    
    return z0;
}

// Generate random error for a value
function applyRandomError(value) {
    if (!simulationState.errorsActive) return value;
    
    const { stdDev, maxDeviation } = CONFIG.errors.randomErrors;
    const error = generateGaussianError(stdDev, maxDeviation);
    return value * (1 + error);
}

// Apply fixed error to a value
function applyFixedError(value, errorType) {
    if (!simulationState.errorsActive) return value;
    
    const error = simulationState.errors.fixed[errorType];
    return value * (1 + error);
}

// Calculate throat pressure using Bernoulli's equation
function calculateThroatPressure(inletPressure, inletDiameter, throatDiameter, flowRate, density) {
    // Convert units
    const inletArea = Math.PI * Math.pow(inletDiameter / 2000, 2); // m²
    const throatArea = Math.PI * Math.pow(throatDiameter / 2000, 2); // m²
    const flowRateM3s = flowRate / 3600; // m³/s
    
    // Calculate velocities
    const inletVelocity = flowRateM3s / inletArea; // m/s
    const throatVelocity = flowRateM3s / throatArea; // m/s
    
    // Apply Bernoulli's equation: P1 + 0.5*ρ*v1² = P2 + 0.5*ρ*v2²
    // Solve for P2 (throat pressure)
    const throatPressure = inletPressure - 0.5 * density * (Math.pow(throatVelocity, 2) - Math.pow(inletVelocity, 2));
    
    return throatPressure;
}

// Update the display of errors in the admin table
function updateErrorsTable() {
    if (!simulationState.adminMode) return;
    
    const tableBody = document.getElementById('errors-data');
    let html = '';
    
    // Fixed errors
    const inletDiameterExact = applyFixedError(simulationState.inletDiameter, 'inletDiameter');
    const throatDiameterExact = applyFixedError(simulationState.throatDiameter, 'throatDiameter');
    const outletDiameterExact = applyFixedError(simulationState.inletDiameter, 'outletDiameter');
    
    const density = interpolateProperty(WATER_PROPERTIES.density, simulationState.temperature);
    const densityExact = applyFixedError(density, 'density');
    
    html += `<tr><td>Diámetro de Entrada</td><td>${simulationState.inletDiameter.toFixed(1)} mm</td><td>${inletDiameterExact.toFixed(3)} mm</td></tr>`;
    html += `<tr><td>Diámetro de Garganta</td><td>${simulationState.throatDiameter.toFixed(1)} mm</td><td>${throatDiameterExact.toFixed(3)} mm</td></tr>`;
    html += `<tr><td>Diámetro de Salida</td><td>${simulationState.inletDiameter.toFixed(1)} mm</td><td>${outletDiameterExact.toFixed(3)} mm</td></tr>`;
    html += `<tr><td>Densidad del Fluido</td><td>${density.toFixed(1)} kg/m³</td><td>${densityExact.toFixed(3)} kg/m³</td></tr>`;
    
    // Random errors (only when generated)
    if (simulationState.errorsActive) {
        const flowRateExact = applyRandomError(simulationState.flowRate);
        const inletPressureExact = applyRandomError(simulationState.inletPressure);
        
        html += `<tr><td>Caudal de Entrada</td><td>${simulationState.flowRate.toFixed(1)} m³/h</td><td>${flowRateExact.toFixed(3)} m³/h</td></tr>`;
        html += `<tr><td>Presión de Entrada</td><td>${simulationState.inletPressure.toFixed(0)} kPa</td><td>${inletPressureExact.toFixed(2)} kPa</td></tr>`;
    }
    
    tableBody.innerHTML = html;
}

// Update the simulation based on current parameters
function updateSimulation() {
    // Get water properties at current temperature
    const density = interpolateProperty(WATER_PROPERTIES.density, simulationState.temperature);
    const vaporPressure = interpolateProperty(WATER_PROPERTIES.vaporPressure, simulationState.temperature);
    
    // Apply errors to input values if active
    const inletDiameterExact = applyFixedError(simulationState.inletDiameter, 'inletDiameter');
    const throatDiameterExact = applyFixedError(simulationState.throatDiameter, 'throatDiameter');
    const densityExact = applyFixedError(density, 'density');
    
    let flowRateExact = simulationState.flowRate;
    let inletPressureExact = simulationState.inletPressure;
    
    if (simulationState.errorsActive) {
        flowRateExact = applyRandomError(flowRateExact);
        inletPressureExact = applyRandomError(inletPressureExact);
    }
    
    // Calculate pressures using exact values
    const throatPressure = calculateThroatPressure(
        inletPressureExact, 
        inletDiameterExact, 
        throatDiameterExact, 
        flowRateExact, 
        densityExact
    );
    
    // Check for cavitation
    const cavitationWarning = document.getElementById('cavitation-warning');
    if (throatPressure <= vaporPressure) {
        cavitationWarning.classList.remove('hidden');
        d3.select('.throat-water').classed('cavitation', true);
    } else {
        cavitationWarning.classList.add('hidden');
        d3.select('.throat-water').classed('cavitation', false);
    }
    
    // Outlet pressure is same as inlet pressure assuming ideal conditions
    // In reality there would be small losses
    let outletPressure = inletPressureExact - 0.05 * inletPressureExact; // 5% pressure loss
    
    // If cavitation occurs, pressure recovery is affected
    if (throatPressure <= vaporPressure) {
        outletPressure = inletPressureExact - 0.2 * inletPressureExact; // 20% pressure loss
    }
    
    // Update manometers
    updateManometer('inlet-manometer', inletPressureExact);
    updateManometer('throat-manometer', Math.max(0, throatPressure));
    
    // Update table of data
    document.getElementById('inlet-pressure-value').textContent = `${inletPressureExact.toFixed(0)} kPa`;
    document.getElementById('throat-pressure-value').textContent = `${Math.max(0, throatPressure).toFixed(0)} kPa`;
    document.getElementById('outlet-pressure-value').textContent = `${outletPressure.toFixed(0)} kPa`;
    document.getElementById('flow-rate-value').textContent = `${flowRateExact.toFixed(1).replace('.', ',')} m³/h`;
    document.getElementById('inlet-diameter-value').textContent = `${simulationState.inletDiameter.toFixed(0)} mm`;
    document.getElementById('throat-diameter-value').textContent = `${simulationState.throatDiameter.toFixed(0)} mm`;
    document.getElementById('temperature-value').textContent = `${simulationState.temperature.toFixed(0)} °C`;
    document.getElementById('density-value').textContent = `${density.toFixed(1).replace('.', ',')} kg/m³`;
    document.getElementById('vapor-pressure-value').textContent = `${vaporPressure.toFixed(2).replace('.', ',')} kPa`;
    
    // Update admin error table if needed
    if (simulationState.adminMode) {
        updateErrorsTable();
    }
    
    // Adjust animation speed based on flow rate
    const animationDuration = 2000 / (simulationState.flowRate / 5);
    
    // Scale SVG elements based on diameters
    const inletHeight = 80 * (simulationState.inletDiameter / CONFIG.inletDiameter.default);
    const throatHeight = 40 * (simulationState.throatDiameter / CONFIG.throatDiameter.default);
    
    d3.select('.inlet-pipe')
        .transition()
        .duration(CONFIG.animation.transitionDuration)
        .attr('y', -inletHeight/2)
        .attr('height', inletHeight);
    
    d3.select('.outlet-pipe')
        .transition()
        .duration(CONFIG.animation.transitionDuration)
        .attr('y', -inletHeight/2)
        .attr('height', inletHeight);
    
    d3.select('.throat-pipe')
        .transition()
        .duration(CONFIG.animation.transitionDuration)
        .attr('d', 'M ' + (-width/4 + 50) + ' ' + (-inletHeight/2) + ' ' +
              'L ' + (-width/8 + 50) + ' ' + (-throatHeight/2) + ' ' +
              'L ' + (width/8 - 50) + ' ' + (-throatHeight/2) + ' ' +
              'L ' + (width/4 - 50) + ' ' + (-inletHeight/2) + ' ' +
              'L ' + (width/4 - 50) + ' ' + (inletHeight/2) + ' ' +
              'L ' + (width/8 - 50) + ' ' + (throatHeight/2) + ' ' +
              'L ' + (-width/8 + 50) + ' ' + (throatHeight/2) + ' ' +
              'L ' + (-width/4 + 50) + ' ' + (inletHeight/2) + ' Z');
    
    // Update water flow visualization
    d3.select('.inlet-water')
        .transition()
        .duration(CONFIG.animation.transitionDuration)
        .attr('y', -inletHeight/2 + 5)
        .attr('height', inletHeight - 10);
    
    d3.select('.outlet-water')
        .transition()
        .duration(CONFIG.animation.transitionDuration)
        .attr('y', -inletHeight/2 + 5)
        .attr('height', inletHeight - 10);
    
    d3.select('.throat-water')
        .transition()
        .duration(CONFIG.animation.transitionDuration)
        .attr('d', 'M ' + (-width/4 + 55) + ' ' + (-inletHeight/2 + 5) + ' ' +
              'L ' + (-width/8 + 45) + ' ' + (-throatHeight/2 + 5) + ' ' +
              'L ' + (width/8 - 45) + ' ' + (-throatHeight/2 + 5) + ' ' +
              'L ' + (width/4 - 55) + ' ' + (-inletHeight/2 + 5) + ' ' +
              'L ' + (width/4 - 55) + ' ' + (inletHeight/2 - 5) + ' ' +
              'L ' + (width/8 - 45) + ' ' + (throatHeight/2 - 5) + ' ' +
              'L ' + (-width/8 + 45) + ' ' + (throatHeight/2 - 5) + ' ' +
              'L ' + (-width/4 + 55) + ' ' + (inletHeight/2 - 5) + ' Z');
}

// Export the simulation data to a text file
function exportData() {
    // Get current date
    const now = new Date();
    const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Get water properties
    const density = interpolateProperty(WATER_PROPERTIES.density, simulationState.temperature);
    const vaporPressure = interpolateProperty(WATER_PROPERTIES.vaporPressure, simulationState.temperature);
    
    // Get displayed pressure values
    const inletPressure = document.getElementById('inlet-pressure-value').textContent;
    const throatPressure = document.getElementById('throat-pressure-value').textContent;
    const outletPressure = document.getElementById('outlet-pressure-value').textContent;
    
    // Create content for the text file
    let content = 'SIMULADOR DE EFECTO VENTURI\n';
    content += '=========================\n\n';
    content += 'Autor: Rodrigo Agosta\n';
    content += 'Grupo de Investigación GIEDI - UTN\n\n';
    content += `Fecha: ${dateString} ${timeString}\n\n`;
    content += 'DATOS DE LA SIMULACIÓN\n';
    content += '=====================\n\n';
    content += `Presión de Entrada: ${inletPressure}\n`;
    content += `Presión de Garganta: ${throatPressure}\n`;
    content += `Presión de Salida: ${outletPressure}\n`;
    content += `Caudal: ${simulationState.flowRate.toFixed(1).replace('.', ',')} m³/h\n`;
    content += `Diámetro de Entrada: ${simulationState.inletDiameter.toFixed(0)} mm\n`;
    content += `Diámetro de Garganta: ${simulationState.throatDiameter.toFixed(0)} mm\n`;
    content += `Temperatura: ${simulationState.temperature.toFixed(0)} °C\n`;
    content += `Fluido: Agua\n`;
    content += `Densidad del Fluido: ${density.toFixed(1).replace('.', ',')} kg/m³\n`;
    content += `Tensión de Vapor: ${vaporPressure.toFixed(2).replace('.', ',')} kPa\n\n`;
    
    // Add cavitation information if applicable
    if (!document.getElementById('cavitation-warning').classList.contains('hidden')) {
        content += 'ADVERTENCIA: FLUIDO EN CAVITACIÓN\n';
    }
    
    // Create and download the text file
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.download = `venturi_simulation_${dateString}.txt`;
    a.href = window.URL.createObjectURL(blob);
    a.click();
}

// Initialize the simulation when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initSimulation);

// Define width for global use in SVG calculations
let width = 0;
document.addEventListener('DOMContentLoaded', () => {
    width = document.getElementById('venturi-diagram').clientWidth;
    
    // Add window resize listener to update the diagram on window resize
    window.addEventListener('resize', () => {
        width = document.getElementById('venturi-diagram').clientWidth;
        updateSimulation();
    });
});