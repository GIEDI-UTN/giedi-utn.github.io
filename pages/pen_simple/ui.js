import PendulumSimulation from './simulation.js';
import { DataManager } from './data.js';

class UI {
    constructor() {
        // Initialize pendulum simulation and data manager
        this.simulation = new PendulumSimulation();
        this.dataManager = new DataManager();
        
        // Input elements
        this.stringLengthInput = document.getElementById('string-length');
        this.stringLengthValue = document.getElementById('string-length-value');
        this.bobMassInput = document.getElementById('bob-mass');
        this.bobMassValue = document.getElementById('bob-mass-value');
        this.angleInput = document.getElementById('angle');
        this.angleValue = document.getElementById('angle-value');
        this.cyclesInput = document.getElementById('cycles-input');
        
        // Buttons
        this.calculationModeButton = document.getElementById('calculation-mode');
        this.randomErrorsButton = document.getElementById('random-errors');
        this.launchButton = document.getElementById('launch-button');
        this.stopButton = document.getElementById('stop-button');
        this.resetButton = document.getElementById('reset-button');
        this.statsButton = document.getElementById('stats-button');
        this.exportButton = document.getElementById('export-button');
        this.adminButton = document.getElementById('admin-button');
        
        // Measurement table
        this.measurementsTable = document.getElementById('measurements-table').querySelector('tbody');
        
        // Stats panel
        this.statsPanel = document.getElementById('stats-panel');
        this.closeStatsButton = document.getElementById('close-stats');
        this.basicStats = document.getElementById('basic-stats');
        this.plotContainer = document.getElementById('plot-container');
        
        // Admin modal elements
        this.adminModal = document.getElementById('admin-modal');
        this.closeModalButton = document.querySelector('.close-button');
        this.adminPassword = document.getElementById('admin-password');
        this.loginButton = document.getElementById('login-button');
        this.loginError = document.getElementById('login-error');
        this.adminPanel = document.getElementById('admin-panel');
        this.realValues = document.getElementById('real-values');
        this.logoutButton = document.getElementById('logout-button');
        
        // Language selector
        this.languageSelector = document.getElementById('language-selector');
        
        // State variables
        this.simulationRunning = false;
        this.cycleCount = 10;
        
        // Ensure mobile compatibility
        this.checkMobileDevice();
        
        // Initialize UI
        this.initializeUI();
        this.setupEventListeners();
        this.loadTranslations();
    }
    
    initializeUI() {
        // Set initial values from simulation
        this.updatePendulumParameters();
    }
    
    setupEventListeners() {
        // Parameter inputs
        this.stringLengthInput.addEventListener('input', this.updateStringLength.bind(this));
        this.bobMassInput.addEventListener('input', this.updateBobMass.bind(this));
        this.angleInput.addEventListener('input', this.updateAngle.bind(this));
        this.cyclesInput.addEventListener('input', this.updateCycles.bind(this));
        
        // Toggle buttons
        this.calculationModeButton.addEventListener('click', this.toggleCalculationMode.bind(this));
        this.randomErrorsButton.addEventListener('click', this.toggleRandomErrors.bind(this));
        
        // Action buttons
        this.launchButton.addEventListener('click', this.startSimulation.bind(this));
        this.stopButton.addEventListener('click', this.stopSimulation.bind(this));
        this.resetButton.addEventListener('click', this.resetSimulation.bind(this));
        this.statsButton.addEventListener('click', this.showStats.bind(this));
        this.exportButton.addEventListener('click', this.exportData.bind(this));
        
        // Stats panel
        this.closeStatsButton.addEventListener('click', () => {
            this.statsPanel.classList.add('hidden');
        });
        
        // Admin modal
        this.adminButton.addEventListener('click', this.showAdminModal.bind(this));
        this.closeModalButton.addEventListener('click', this.closeAdminModal.bind(this));
        this.loginButton.addEventListener('click', this.checkAdminPassword.bind(this));
        this.logoutButton.addEventListener('click', this.logoutAdmin.bind(this));
        
        // Language selector
        this.languageSelector.addEventListener('change', this.changeLanguage.bind(this));
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target == this.adminModal) {
                this.closeAdminModal();
            }
        });
    }
    
    // Parameter update handlers
    updateStringLength() {
        const lengthCm = parseInt(this.stringLengthInput.value);
        this.stringLengthValue.textContent = `${lengthCm} cm`;
        this.simulation.setLength(lengthCm);
    }
    
    updateBobMass() {
        const massG = parseInt(this.bobMassInput.value);
        this.bobMassValue.textContent = `${massG} g`;
        this.simulation.setMass(massG);
    }
    
    updateAngle() {
        const angleDeg = parseInt(this.angleInput.value);
        this.angleValue.textContent = `${angleDeg}°`;
        this.simulation.setAngle(angleDeg);
    }
    
    updateCycles() {
        this.cycleCount = parseInt(this.cyclesInput.value);
    }
    
    updatePendulumParameters() {
        // Update display values
        this.stringLengthValue.textContent = `${this.stringLengthInput.value} cm`;
        this.bobMassValue.textContent = `${this.bobMassInput.value} g`;
        this.angleValue.textContent = `${this.angleInput.value}°`;
        
        // Update simulation parameters
        this.simulation.setLength(parseInt(this.stringLengthInput.value));
        this.simulation.setMass(parseInt(this.bobMassInput.value));
        this.simulation.setAngle(parseInt(this.angleInput.value));
    }
    
    // Toggle button handlers
    toggleCalculationMode() {
        const isSimplified = this.calculationModeButton.textContent === 'Simplificada';
        if (isSimplified) {
            this.calculationModeButton.textContent = 'Exacta';
        } else {
            this.calculationModeButton.textContent = 'Simplificada';
        }
        this.simulation.setCalculationMode(!isSimplified);
    }
    
    toggleRandomErrors() {
        const isActive = this.randomErrorsButton.classList.contains('active');
        if (isActive) {
            this.randomErrorsButton.classList.remove('active');
            this.randomErrorsButton.textContent = 'Desactivados';
            this.simulation.setRandomErrors(false);
        } else {
            this.randomErrorsButton.classList.add('active');
            this.randomErrorsButton.textContent = 'Activados';
            this.simulation.setRandomErrors(true);
        }
    }
    
    // Simulation control
    startSimulation() {
        if (this.simulationRunning) return;
        
        this.simulationRunning = true;
        this.simulation.startSimulation();
        
        // Update button states
        this.launchButton.disabled = true;
        this.stopButton.disabled = false;
        
        // Disable parameter controls during simulation
        this.stringLengthInput.disabled = true;
        this.bobMassInput.disabled = true;
        this.angleInput.disabled = true;
        this.calculationModeButton.disabled = true;
        this.randomErrorsButton.disabled = true;
    }
    
    stopSimulation() {
        if (!this.simulationRunning) return;
        
        // Stop simulation and get elapsed time
        const elapsedTime = this.simulation.stopSimulation();
        this.simulationRunning = false;
        
        // Calculate period and add to data manager
        const length = parseInt(this.stringLengthInput.value);
        const mass = parseInt(this.bobMassInput.value);
        const angle = parseInt(this.angleInput.value);
        const cycles = this.cycleCount;
        const time = elapsedTime.toFixed(2);
        const period = (elapsedTime / cycles).toFixed(4);
        
        const measurementData = { length, mass, angle, cycles, time, period };
        this.dataManager.addMeasurement(measurementData);
        
        // Add row to table
        this.addTableRow(measurementData);
        
        // Reset UI state
        this.launchButton.disabled = false;
        this.stopButton.disabled = true;
        
        // Re-enable parameter controls
        this.stringLengthInput.disabled = false;
        this.bobMassInput.disabled = false;
        this.angleInput.disabled = false;
        this.calculationModeButton.disabled = false;
        this.randomErrorsButton.disabled = false;
    }
    
    resetSimulation() {
        this.simulation.resetSimulation();
        this.simulationRunning = false;
        
        // Reset UI state
        this.launchButton.disabled = false;
        this.stopButton.disabled = true;
        
        // Re-enable parameter controls
        this.stringLengthInput.disabled = false;
        this.bobMassInput.disabled = false;
        this.angleInput.disabled = false;
        this.calculationModeButton.disabled = false;
        this.randomErrorsButton.disabled = false;
    }
    
    // Table and data management
    addTableRow(data) {
        const rowCount = this.measurementsTable.childElementCount + 1;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rowCount}</td>
            <td>${data.length}</td>
            <td>${data.mass}</td>
            <td>${data.angle}</td>
            <td>${data.cycles}</td>
            <td>${data.time}</td>
            <td>${data.period}</td>
            <td><button class="delete-btn" data-i18n="delete">Eliminar</button></td>
        `;
        
        // Add delete button functionality
        const deleteBtn = row.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            this.dataManager.removeMeasurement(rowCount - 1);
            row.remove();
            this.updateTableIndices();
        });
        
        this.measurementsTable.appendChild(row);
        this.loadTranslations(); // Reload translations for the new row
    }
    
    updateTableIndices() {
        const rows = this.measurementsTable.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    }
    
    // Statistics display
    showStats() {
        if (this.dataManager.measurements.length === 0) {
            const lang = this.dataManager.currentLanguage || 'es';
            alert(translations[lang].noDataToAnalyze);
            return;
        }
        
        // Get periods from measurements
        const periods = this.dataManager.measurements.map(m => parseFloat(m.period));
        
        // Calculate statistics
        const mean = periods.reduce((sum, val) => sum + val, 0) / periods.length;
        const variance = periods.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / periods.length;
        const stdDev = Math.sqrt(variance);
        const min = Math.min(...periods);
        const max = Math.max(...periods);
        
        // Display basic statistics
        const lang = this.dataManager.currentLanguage || 'es';
        
        this.basicStats.innerHTML = `
            <h4>${translations[lang].periodStats || 'Estadísticas del Período'}</h4>
            <p><strong>${translations[lang].samplesNumber || 'Número de muestras'}:</strong> ${periods.length}</p>
            <p><strong>${translations[lang].mean || 'Valor promedio'}:</strong> ${mean.toFixed(4)} s</p>
            <p><strong>${translations[lang].stdDev || 'Desviación estándar'}:</strong> ${stdDev.toFixed(4)} s</p>
            <p><strong>${translations[lang].variance || 'Varianza'}:</strong> ${variance.toFixed(6)} s²</p>
            <p><strong>${translations[lang].minValue || 'Valor mínimo'}:</strong> ${min.toFixed(4)} s</p>
            <p><strong>${translations[lang].maxValue || 'Valor máximo'}:</strong> ${max.toFixed(4)} s</p>
        `;
        
        // Create statistical plots
        this.createStatisticalCharts(periods);
        
        // Show stats panel
        this.statsPanel.classList.remove('hidden');
    }
    
    createStatisticalCharts(data) {
        // Import Plotly dynamically
        import('https://cdn.plot.ly/plotly-2.24.1.min.js')
            .then(module => {
                const Plotly = window.Plotly;
                
                // Create layout with 2x2 subplots
                const lang = this.dataManager.currentLanguage || 'es';
                const layout = {
                    grid: { rows: 2, columns: 2, pattern: 'independent' },
                    title: translations[lang].statAnalysis || 'Análisis Estadístico de Períodos',
                    showlegend: false,
                    margin: { l: 60, r: 20, t: 60, b: 60 },
                    height: 600
                };
                
                // 1. Histogram trace
                const histogramTrace = {
                    x: data,
                    type: 'histogram',
                    marker: {
                        color: 'rgba(52, 152, 219, 0.7)',
                        line: {
                            color: 'rgba(41, 128, 185, 1)',
                            width: 1
                        }
                    },
                    nbinsx: Math.min(10, Math.ceil(data.length / 2)),
                    name: 'Histograma',
                    xaxis: 'x1',
                    yaxis: 'y1'
                };
                
                // 2. KDE plot (approximated with smoothed line)
                // Sort data for the KDE
                const sortedData = [...data].sort((a, b) => a - b);
                
                // Create KDE trace
                const kdeTrace = {
                    x: sortedData,
                    y: this.calculateKDE(sortedData),
                    type: 'scatter',
                    mode: 'lines',
                    line: {
                        color: 'rgba(231, 76, 60, 0.8)',
                        width: 2
                    },
                    name: 'KDE',
                    xaxis: 'x2',
                    yaxis: 'y2'
                };
                
                // 3. Box plot trace
                const boxplotTrace = {
                    y: data,
                    type: 'box',
                    name: 'Distribución',
                    marker: {
                        color: 'rgba(243, 156, 18, 0.7)'
                    },
                    boxmean: true,
                    xaxis: 'x3',
                    yaxis: 'y3'
                };
                
                // 4. Scatter plot trace (raw data points)
                const indices = Array.from({ length: data.length }, (_, i) => i + 1);
                const scatterTrace = {
                    x: indices,
                    y: data,
                    type: 'scatter',
                    mode: 'markers',
                    marker: {
                        color: 'rgba(46, 204, 113, 0.7)',
                        size: 8
                    },
                    name: 'Valores',
                    xaxis: 'x4',
                    yaxis: 'y4'
                };
                
                // Configure subplot titles and axes
                layout.annotations = [
                    {
                        text: translations[lang].histogram || 'Histograma',
                        xref: 'paper',
                        yref: 'paper',
                        x: 0.25,
                        y: 1,
                        showarrow: false
                    },
                    {
                        text: translations[lang].densityKDE || 'Densidad (KDE)',
                        xref: 'paper',
                        yref: 'paper',
                        x: 0.75,
                        y: 1,
                        showarrow: false
                    },
                    {
                        text: translations[lang].boxplot || 'Diagrama de Caja',
                        xref: 'paper',
                        yref: 'paper',
                        x: 0.25,
                        y: 0.45,
                        showarrow: false
                    },
                    {
                        text: translations[lang].valuesDist || 'Distribución de Valores',
                        xref: 'paper',
                        yref: 'paper',
                        x: 0.75,
                        y: 0.45,
                        showarrow: false
                    }
                ];
                
                // Add axis titles
                layout.xaxis1 = { title: `${translations[lang].period || 'Período'} (s)` };
                layout.xaxis2 = { title: `${translations[lang].period || 'Período'} (s)` };
                layout.xaxis4 = { title: translations[lang].measurement || 'Medición' };
                layout.yaxis1 = { title: translations[lang].frequency || 'Frecuencia' };
                layout.yaxis2 = { title: translations[lang].density || 'Densidad' };
                layout.yaxis3 = { title: `${translations[lang].period || 'Período'} (s)` };
                layout.yaxis4 = { title: `${translations[lang].period || 'Período'} (s)` };
                
                // Create plot with all traces
                Plotly.newPlot(this.plotContainer, [histogramTrace, kdeTrace, boxplotTrace, scatterTrace], layout);
            }).catch(error => {
                console.error("Error loading Plotly:", error);
                const lang = this.dataManager.currentLanguage || 'es';
                this.basicStats.innerHTML += `<p class='error-message'>${translations[lang].plotlyError || 'Error al cargar la biblioteca Plotly para visualizaciones. Por favor, recarga la página.'}</p>`;
            });
    }
    
    // Calculate Kernel Density Estimation (simplified approach)
    calculateKDE(data) {
        // Simple KDE calculation using Gaussian kernel
        const bandwidth = this.calculateBandwidth(data);
        const densities = [];
        
        // For each data point, calculate density
        for (let i = 0; i < data.length; i++) {
            let density = 0;
            
            // Sum kernel for each data point
            for (let j = 0; j < data.length; j++) {
                const z = (data[i] - data[j]) / bandwidth;
                density += Math.exp(-0.5 * z * z);
            }
            
            // Normalize
            density = density / (data.length * bandwidth * Math.sqrt(2 * Math.PI));
            densities.push(density);
        }
        
        return densities;
    }
    
    // Calculate bandwidth using Silverman's rule of thumb
    calculateBandwidth(data) {
        const n = data.length;
        
        // Calculate standard deviation
        const mean = data.reduce((sum, val) => sum + val, 0) / n;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        // Silverman's rule of thumb
        return 0.9 * stdDev * Math.pow(n, -0.2);
    }
    
    // Data export
    exportData() {
        if (this.dataManager.measurements.length === 0) {
            const lang = this.dataManager.currentLanguage || 'es';
            alert(translations[lang].noDataToExport);
            return;
        }
        
        const exportData = this.dataManager.getExportData();
        const blob = new Blob([exportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pendulo_datos.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Admin panel functionality
    showAdminModal() {
        this.adminModal.style.display = 'block';
        this.adminPassword.value = '';
        this.loginError.classList.add('hidden');
        this.adminPanel.classList.add('hidden');
    }
    
    closeAdminModal() {
        this.adminModal.style.display = 'none';
    }
    
    checkAdminPassword() {
        const password = this.adminPassword.value;
        
        if (password === 'GIEDI610') {
            this.loginError.classList.add('hidden');
            this.showAdminPanel();
        } else {
            this.loginError.classList.remove('hidden');
        }
    }
    
    showAdminPanel() {
        document.getElementById('login-section').classList.add('hidden');
        this.adminPanel.classList.remove('hidden');
        
        // Get real values from simulation
        const realValues = this.simulation.getRealValues();
        
        // Display real values
        this.realValues.innerHTML = `
            <p><strong>Longitud real:</strong> ${realValues.length.toFixed(2)} cm</p>
            <p><strong>Longitud aplicada:</strong> ${realValues.appliedLength.toFixed(2)} cm</p>
            <p><strong>Error longitud:</strong> ${(realValues.appliedLength - realValues.length).toFixed(2)} cm</p>
            <p><strong>Masa real:</strong> ${realValues.mass.toFixed(2)} g</p>
            <p><strong>Masa aplicada:</strong> ${realValues.appliedMass.toFixed(2)} g</p>
            <p><strong>Error masa:</strong> ${(realValues.appliedMass - realValues.mass).toFixed(2)} g</p>
            <p><strong>Ángulo real:</strong> ${realValues.angle.toFixed(2)}°</p>
            <p><strong>Ángulo aplicado:</strong> ${realValues.appliedAngle.toFixed(2)}°</p>
            <p><strong>Error ángulo:</strong> ${(realValues.appliedAngle - realValues.angle).toFixed(2)}°</p>
        `;
    }
    
    logoutAdmin() {
        document.getElementById('login-section').classList.remove('hidden');
        this.adminPanel.classList.add('hidden');
    }
    
    // Language handling
    changeLanguage() {
        const selectedLanguage = this.languageSelector.value;
        this.dataManager.currentLanguage = selectedLanguage;
        this.loadTranslations();
    }
    
    loadTranslations() {
        const lang = this.dataManager.currentLanguage || 'es';
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        
        // Update placeholder texts
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                element.setAttribute('placeholder', translations[lang][key]);
            }
        });
    }
    
    // Add new method for mobile detection
    checkMobileDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            // Apply mobile-specific adjustments
            document.body.classList.add('mobile-device');
            
            // Force pendulum visibility after a short delay
            setTimeout(() => {
                const pendulumElem = document.querySelector('.pendulum-simulation');
                const container = document.getElementById('pendulum-container');
                const string = document.getElementById('string');
                const bob = document.getElementById('bob');
                
                if (pendulumElem && container && string && bob) {
                    pendulumElem.style.visibility = 'visible';
                    pendulumElem.style.display = 'block';
                    container.style.visibility = 'visible';
                    string.style.visibility = 'visible';
                    bob.style.visibility = 'visible';
                }
            }, 500);
        }
    }
}

// Translations for UI elements
const translations = {
    'es': {
        simulatorTitle: 'Simulador de Péndulo Simple',
        stringLength: 'Largo del cordel (cm):',
        bobMass: 'Masa de la esfera (g):',
        initialAngle: 'Ángulo inicial (°):',
        simOptions: 'Opciones de Simulación',
        calcMode: 'Modo de cálculo:',
        simplified: 'Simplificada',
        exact: 'Exacta',
        randomErrors: 'Errores aleatorios:',
        activated: 'Activados',
        deactivated: 'Desactivados',
        launch: 'Lanzamiento',
        finishMeasurement: 'Finalizar medición',
        reset: 'Reiniciar',
        measurementRecord: 'Registro de Mediciones',
        measurement: 'Medición',
        length: 'Largo (cm)',
        mass: 'Masa (g)',
        angle: 'Ángulo (°)',
        cycles: 'Ciclos (N)',
        time: 'Tiempo (s)',
        period: 'Período (s)',
        actions: 'Acciones',
        cyclesNumber: 'Número de ciclos (N):',
        statsCalc: 'Cálculos estadísticos',
        exportData: 'Exportar datos',
        admin: 'Administrador',
        statAnalysis: 'Análisis Estadístico',
        close: 'Cerrar',
        adminAccess: 'Acceso Administrador',
        enterPassword: 'Ingrese la clave',
        access: 'Acceder',
        incorrectPassword: 'Clave incorrecta',
        realValues: 'Valores Reales',
        logout: 'Cerrar sesión',
        noDataToExport: 'No hay datos para exportar. Realice al menos una medición.',
        noDataToAnalyze: 'No hay datos para analizar. Realice al menos una medición.',
        delete: 'Eliminar',
        periodStats: 'Estadísticas del Período',
        samplesNumber: 'Número de muestras',
        mean: 'Valor promedio',
        stdDev: 'Desviación estándar',
        variance: 'Varianza',
        minValue: 'Valor mínimo',
        maxValue: 'Valor máximo',
        histogram: 'Histograma',
        densityKDE: 'Densidad (KDE)',
        boxplot: 'Diagrama de Caja',
        valuesDist: 'Distribución de Valores',
        period: 'Período',
        frequency: 'Frecuencia',
        density: 'Densidad',
        plotlyError: 'Error al cargar la biblioteca Plotly para visualizaciones. Por favor, recarga la página.',
        pendulumParams: 'Parámetros del Péndulo'
    },
    'en': {
        simulatorTitle: 'Simple Pendulum Simulator',
        stringLength: 'String Length (cm):',
        bobMass: 'Bob Mass (g):',
        initialAngle: 'Initial Angle (°):',
        simOptions: 'Simulation Options',
        calcMode: 'Calculation Mode:',
        simplified: 'Simplified',
        exact: 'Exact',
        randomErrors: 'Random Errors:',
        activated: 'Activated',
        deactivated: 'Deactivated',
        launch: 'Launch',
        finishMeasurement: 'Finish Measurement',
        reset: 'Reset',
        measurementRecord: 'Measurement Record',
        measurement: 'Measurement',
        length: 'Length (cm)',
        mass: 'Mass (g)',
        angle: 'Angle (°)',
        cycles: 'Cycles (N)',
        time: 'Time (s)',
        period: 'Period (s)',
        actions: 'Actions',
        cyclesNumber: 'Number of Cycles (N):',
        statsCalc: 'Statistical Calculations',
        exportData: 'Export Data',
        admin: 'Administrator',
        statAnalysis: 'Statistical Analysis',
        close: 'Close',
        adminAccess: 'Administrator Access',
        enterPassword: 'Enter password',
        access: 'Access',
        incorrectPassword: 'Incorrect password',
        realValues: 'Real Values',
        logout: 'Logout',
        noDataToExport: 'No data to export. Make at least one measurement.',
        noDataToAnalyze: 'No data to analyze. Make at least one measurement.',
        delete: 'Delete',
        periodStats: 'Period Statistics',
        samplesNumber: 'Number of samples',
        mean: 'Average value',
        stdDev: 'Standard deviation',
        variance: 'Variance',
        minValue: 'Minimum value',
        maxValue: 'Maximum value',
        histogram: 'Histogram',
        densityKDE: 'Density (KDE)',
        boxplot: 'Box Plot',
        valuesDist: 'Value Distribution',
        period: 'Period',
        frequency: 'Frequency',
        density: 'Density',
        plotlyError: 'Error loading Plotly library for visualizations. Please reload the page.',
        pendulumParams: 'Pendulum Parameters'
    },
    'pt': {
        simulatorTitle: 'Simulador de Pêndulo Simples',
        stringLength: 'Comprimento da corda (cm):',
        bobMass: 'Massa do peso (g):',
        initialAngle: 'Ângulo inicial (°):',
        simOptions: 'Opções de simulação',
        calcMode: 'Modo de cálculo:',
        simplified: 'Simplificada',
        exact: 'Exata',
        randomErrors: 'Erros aleatórios:',
        activated: 'Ativados',
        deactivated: 'Desativados',
        launch: 'Lançamento',
        finishMeasurement: 'Finalizar medição',
        reset: 'Reiniciar',
        measurementRecord: 'Registro de medições',
        measurement: 'Medição',
        length: 'Comprimento (cm)',
        mass: 'Massa (g)',
        angle: 'Ângulo (°)',
        cycles: 'Ciclos (N)',
        time: 'Tempo (s)',
        period: 'Período (s)',
        actions: 'Ações',
        cyclesNumber: 'Número de ciclos (N):',
        statsCalc: 'Cálculos estatísticos',
        exportData: 'Exportar dados',
        admin: 'Administrador',
        statAnalysis: 'Análise estatística',
        close: 'Fechar',
        adminAccess: 'Acesso de administrador',
        enterPassword: 'Digite a senha',
        access: 'Acessar',
        incorrectPassword: 'Senha incorreta',
        realValues: 'Valores reais',
        logout: 'Sair',
        noDataToExport: 'Não há dados para exportar. Faça pelo menos uma medição.',
        noDataToAnalyze: 'Não há dados para analisar. Faça pelo menos uma medição.',
        delete: 'Excluir',
        periodStats: 'Estatísticas do Período',
        samplesNumber: 'Número de amostras',
        mean: 'Valor médio',
        stdDev: 'Desvio padrão',
        variance: 'Variância',
        minValue: 'Valor mínimo',
        maxValue: 'Valor máximo',
        histogram: 'Histograma',
        densityKDE: 'Densidade (KDE)',
        boxplot: 'Diagrama de Caixa',
        valuesDist: 'Distribuição de Valores',
        period: 'Período',
        frequency: 'Frequência',
        density: 'Densidade',
        plotlyError: 'Erro ao carregar a biblioteca Plotly para visualizações. Por favor, recarregue a página.',
        pendulumParams: 'Parâmetros do Pêndulo'
    },
    'de': {
        simulatorTitle: 'Einfacher Pendelsimulator',
        stringLength: 'Fadenlänge (cm):',
        bobMass: 'Bobmasse (g):',
        initialAngle: 'Anfangswinkel (°):',
        simOptions: 'Simulationsoptionen',
        calcMode: 'Berechnungsmodus:',
        simplified: 'Vereinfacht',
        exact: 'Exakt',
        randomErrors: 'Zufällige Fehler:',
        activated: 'Aktiviert',
        deactivated: 'Deaktiviert',
        launch: 'Start',
        finishMeasurement: 'Messung beenden',
        reset: 'Zurücksetzen',
        measurementRecord: 'Messprotokoll',
        measurement: 'Messung',
        length: 'Länge (cm)',
        mass: 'Masse (g)',
        angle: 'Winkel (°)',
        cycles: 'Zyklen (N)',
        time: 'Zeit (s)',
        period: 'Periode (s)',
        actions: 'Aktionen',
        cyclesNumber: 'Anzahl der Zyklen (N):',
        statsCalc: 'Statistische Berechnungen',
        exportData: 'Daten exportieren',
        admin: 'Administrator',
        statAnalysis: 'Statistische Analyse',
        close: 'Schließen',
        adminAccess: 'Administratorzugang',
        enterPassword: 'Passwort eingeben',
        access: 'Zugriff',
        incorrectPassword: 'Falsches Passwort',
        realValues: 'Echte Werte',
        logout: 'Abmelden',
        noDataToExport: 'Keine Daten zum Exportieren. Machen Sie mindestens eine Messung.',
        noDataToAnalyze: 'Keine Daten zur Analyse. Machen Sie mindestens eine Messung.',
        delete: 'Löschen',
        periodStats: 'Periodenstatistik',
        samplesNumber: 'Anzahl der Proben',
        mean: 'Durchschnittswert',
        stdDev: 'Standardabweichung',
        variance: 'Varianz',
        minValue: 'Minimalwert',
        maxValue: 'Maximalwert',
        histogram: 'Histogramm',
        densityKDE: 'Dichte (KDE)',
        boxplot: 'Boxplot',
        valuesDist: 'Werteverteilung',
        period: 'Periode',
        frequency: 'Häufigkeit',
        density: 'Dichte',
        plotlyError: 'Fehler beim Laden der Plotly-Bibliothek für Visualisierungen. Bitte laden Sie die Seite neu.',
        pendulumParams: 'Pendelparameter'
    },
    'it': {
        simulatorTitle: 'Simulatore di Pendolo Semplice',
        stringLength: 'Lunghezza della corda (cm):',
        bobMass: 'Massa del peso (g):',
        initialAngle: 'Angolo iniziale (°):',
        simOptions: 'Opzioni di simulazione',
        calcMode: 'Modalità di calcolo:',
        simplified: 'Semplificata',
        exact: 'Esatta',
        randomErrors: 'Errori casuali:',
        activated: 'Attivati',
        deactivated: 'Disattivati',
        launch: 'Avvio',
        finishMeasurement: 'Termina misurazione',
        reset: 'Ripristina',
        measurementRecord: 'Registro delle misurazioni',
        measurement: 'Misurazione',
        length: 'Lunghezza (cm)',
        mass: 'Massa (g)',
        angle: 'Angolo (°)',
        cycles: 'Cicli (N)',
        time: 'Tempo (s)',
        period: 'Periodo (s)',
        actions: 'Azioni',
        cyclesNumber: 'Numero di cicli (N):',
        statsCalc: 'Calcoli statistici',
        exportData: 'Esporta dati',
        admin: 'Amministratore',
        statAnalysis: 'Analisi statistica',
        close: 'Chiudi',
        adminAccess: 'Accesso amministratore',
        enterPassword: 'Inserisci la password',
        access: 'Accesso',
        incorrectPassword: 'Password errata',
        realValues: 'Valori reali',
        logout: 'Esci',
        noDataToExport: 'Nessun dato da esportare. Effettua almeno una misurazione.',
        noDataToAnalyze: 'Nessun dato da analizzare. Effettua almeno una misurazione.',
        delete: 'Elimina',
        periodStats: 'Statistiche del Periodo',
        samplesNumber: 'Numero di campioni',
        mean: 'Valore medio',
        stdDev: 'Deviazione standard',
        variance: 'Varianza',
        minValue: 'Valore minimo',
        maxValue: 'Valore massimo',
        histogram: 'Istogramma',
        densityKDE: 'Densità (KDE)',
        boxplot: 'Diagramma a Scatola',
        valuesDist: 'Distribuzione dei Valori',
        period: 'Periodo',
        frequency: 'Frequenza',
        density: 'Densità',
        plotlyError: 'Errore durante il caricamento della libreria Plotly per le visualizzazioni. Si prega di ricaricare la pagina.',
        pendulumParams: 'Parametri del Pendolo'
    },
    'fr': {
        simulatorTitle: 'Simulateur de Pendule Simple',
        stringLength: 'Longueur de la corde (cm):',
        bobMass: 'Masse du pendule (g):',
        initialAngle: 'Angle initial (°):',
        simOptions: 'Options de simulation',
        calcMode: 'Mode de calcul:',
        simplified: 'Simplifiée',
        exact: 'Exacte',
        randomErrors: 'Erreurs aléatoires:',
        activated: 'Activées',
        deactivated: 'Désactivées',
        launch: 'Lancement',
        finishMeasurement: 'Terminer la mesure',
        reset: 'Réinitialiser',
        measurementRecord: 'Enregistrement des mesures',
        measurement: 'Mesure',
        length: 'Longueur (cm)',
        mass: 'Masse (g)',
        angle: 'Angle (°)',
        cycles: 'Cycles (N)',
        time: 'Temps (s)',
        period: 'Période (s)',
        actions: 'Actions',
        cyclesNumber: 'Nombre de cycles (N):',
        statsCalc: 'Calculs statistiques',
        exportData: 'Exporter les données',
        admin: 'Administrateur',
        statAnalysis: 'Analyse statistique',
        close: 'Fermer',
        adminAccess: 'Accès administrateur',
        enterPassword: 'Entrer le mot de passe',
        access: 'Accéder',
        incorrectPassword: 'Mot de passe incorrect',
        realValues: 'Valeurs réelles',
        logout: 'Déconnexion',
        noDataToExport: 'Aucune donnée à exporter. Effectuez au moins une mesure.',
        noDataToAnalyze: 'Aucune donnée à analyser. Effectuez au moins une mesure.',
        delete: 'Supprimer',
        periodStats: 'Statistiques de Période',
        samplesNumber: 'Nombre d\'échantillons',
        mean: 'Valeur moyenne',
        stdDev: 'Écart type',
        variance: 'Variance',
        minValue: 'Valeur minimale',
        maxValue: 'Valeur maximale',
        histogram: 'Histogramme',
        densityKDE: 'Densité (KDE)',
        boxplot: 'Boîte à Moustaches',
        valuesDist: 'Distribution des Valeurs',
        period: 'Période',
        frequency: 'Fréquence',
        density: 'Densité',
        plotlyError: 'Erreur lors du chargement de la bibliothèque Plotly pour les visualisations. Veuillez recharger la page.',
        pendulumParams: 'Paramètres du Pendule'
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
});