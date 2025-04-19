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
    
    html += `<tr><td>Diámetro de Entrada</td><td>${simulationState.inletDiameter.toFixed(1)} mm</td><td>${inletDiameterExact.toFixed(3).replace('.', ',')} mm</td></tr>`;
    html += `<tr><td>Diámetro de Garganta</td><td>${simulationState.throatDiameter.toFixed(1)} mm</td><td>${throatDiameterExact.toFixed(3).replace('.', ',')} mm</td></tr>`;
    html += `<tr><td>Diámetro de Salida</td><td>${simulationState.inletDiameter.toFixed(1)} mm</td><td>${outletDiameterExact.toFixed(3).replace('.', ',')} mm</td></tr>`;
    html += `<tr><td>Densidad del Fluido</td><td>${density.toFixed(1)} kg/m³</td><td>${densityExact.toFixed(3).replace('.', ',')} kg/m³</td></tr>`;
    
    // Random errors (only when generated)
    if (simulationState.errorsActive) {
        const flowRateExact = applyRandomError(simulationState.flowRate);
        const inletPressureExact = applyRandomError(simulationState.inletPressure);
        
        html += `<tr><td>Caudal de Entrada</td><td>${simulationState.flowRate.toFixed(1)} m³/h</td><td>${flowRateExact.toFixed(3).replace('.', ',')} m³/h</td></tr>`;
        html += `<tr><td>Presión de Entrada</td><td>${simulationState.inletPressure.toFixed(0)} kPa</td><td>${inletPressureExact.toFixed(2).replace('.', ',')} kPa</td></tr>`;
    }
    
    tableBody.innerHTML = html;
}