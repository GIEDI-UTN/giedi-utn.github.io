import * as PlotlyModule from 'plotly';

const Plotly = PlotlyModule.default || PlotlyModule;

// Constantes y variables globales
const SCALE_FACTOR = 100; // Factor de escala para convertir metros a píxeles
const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;
let animationId = null;
let isSimulationRunning = false;
let simulationTime = 0;
let dataPoints = { 
    time: [], 
    angle: [], 
    height: []
};

// Lenguaje actual 
let currentLanguage = 'es';

// Diccionario de traducciones
const translations = {
    es: {
        title: "Simulador de Péndulo Balístico",
        subtitle: "Grupo GIEDI - Facultad Regional Santa Fe - Universidad Tencológica Nacional",
        startBtn: "Iniciar Simulación",
        stopBtn: "Detener Simulación",
        resetBtn: "Reiniciar",
        angleText: "Ángulo",
        heightText: "Altura",
        parameters: "Parámetros",
        projectileMass: "Masa del proyectil (kg)",
        initialVelocity: "Velocidad inicial (m/s)",
        pendulumLength: "Longitud del péndulo (m)",
        pendulumMass: "Masa del péndulo (kg)",
        gravity: "Gravedad (m/s²)",
        impactAngle: "Ángulo de impacto (°)",
        addErrors: "Añadir Errores Experimentales",
        slowMotion: "Cámara Lenta",
        multipleExperiments: "Experimentos Múltiples",
        numExperiments: "Número de Experimentos",
        experimentRecord: "Registro de Experimentos",
        runAnalysis: "Realizar Análisis Estadístico",
        exportData: "Exportar Datos",
        statisticalAnalysis: "Análisis Estadístico",
        calculations: "Cálculos Físicos",
        theoreticalValues: "Valores Teóricos",
        experimentalValues: "Valores Experimentales",
        velocity: "Velocidad del proyectil",
        maxAngle: "Ángulo máximo",
        maxHeight: "Altura máxima",
        initialEnergy: "Energía inicial",
        finalEnergy: "Energía final",
        momentumConservation: "Conservación de momento",
        experimentNumber: "Experimento",
        histogramTitle: "Histograma de Ángulos Máximos",
        distributionTitle: "Distribución de Valores de Ángulos",
        boxplotTitle: "Diagrama de Cajas de Ángulos",
        angleVsTime: "Ángulo vs Tiempo",
        angle: "Ángulo (°)",
        time: "Tiempo (s)",
        frequency: "Frecuencia",
        density: "Densidad",
        footer: "Simulador de Péndulo Balístico - Herramienta Educativa para Física"
    },
    en: {
        title: "Ballistic Pendulum Simulator",
        subtitle: "GIEDI Group - Santa Fe Regional Faculty - National Technological University",
        startBtn: "Start Simulation",
        stopBtn: "Stop Simulation", 
        resetBtn: "Reset",
        angleText: "Angle",
        heightText: "Height",
        parameters: "Parameters",
        projectileMass: "Projectile mass (kg)",
        initialVelocity: "Initial velocity (m/s)",
        pendulumLength: "Pendulum length (m)",
        pendulumMass: "Pendulum mass (kg)",
        gravity: "Gravity (m/s²)",
        impactAngle: "Impact angle (°)",
        addErrors: "Add Experimental Errors",
        slowMotion: "Slow Motion",
        multipleExperiments: "Multiple Experiments",
        numExperiments: "Number of Experiments",
        experimentRecord: "Experiment Record",
        runAnalysis: "Run Statistical Analysis",
        exportData: "Export Data",
        statisticalAnalysis: "Statistical Analysis",
        calculations: "Physical Calculations",
        theoreticalValues: "Theoretical Values",
        experimentalValues: "Experimental Values",
        velocity: "Projectile velocity",
        maxAngle: "Maximum angle",
        maxHeight: "Maximum height",
        initialEnergy: "Initial energy",
        finalEnergy: "Final energy",
        momentumConservation: "Momentum conservation",
        experimentNumber: "Experiment",
        histogramTitle: "Maximum Angles Histogram",
        distributionTitle: "Angle Values Distribution",
        boxplotTitle: "Angles Box Plot",
        angleVsTime: "Angle vs Time",
        angle: "Angle (°)",
        time: "Time (s)",
        frequency: "Frequency",
        density: "Density",
        footer: "Ballistic Pendulum Simulator - Educational Tool for Physics"
    }
};

// Experimentos múltiples
let experimentsList = [];
let currentExperimentNumber = 0;

// Estado de la simulación
const initialState = {
    projectileMass: 0.05,  // kg
    initialVelocity: 50,   // m/s
    pendulumLength: 1.5,   // m
    pendulumMass: 5,       // kg
    gravity: 9.8,          // m/s²
    impactAngle: 0,        // grados
    useErrors: false,
    slowMotion: false,
    runMultiple: false,    // Ejecución de experimentos múltiples
    numExperiments: 5      // Número de experimentos a ejecutar
};

let state = { ...initialState };

let theoreticalResults = {};
let experimentalResults = {};

// Referencias a elementos del DOM
const elements = {
    svg: document.getElementById('simulation-svg'),
    pendulumRod: document.getElementById('pendulum-rod'),
    pendulumBob: document.getElementById('pendulum-bob'),
    projectile: document.getElementById('projectile'),
    velocityVector: document.getElementById('velocity-vector'),
    angleText: document.getElementById('angle-text'),
    heightText: document.getElementById('height-text'),
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    errorToggle: document.getElementById('error-toggle'),
    slowMotion: document.getElementById('slow-motion'),
    multipleExperiments: document.getElementById('multiple-experiments'),
    numExperiments: document.getElementById('num-experiments'),
    runAnalysisBtn: document.getElementById('run-analysis-btn'),
    experimentsTable: document.getElementById('experiments-table'),
    experimentsTableBody: document.getElementById('experiments-table-body'),
    statsContainer: document.getElementById('statistics-container'),
    statsContent: document.getElementById('statistics-content'),
    angleChart: document.getElementById('angle-chart'),
    histogramChart: document.getElementById('histogram-chart'),
    scatterChart: document.getElementById('scatter-chart'),
    evolutionChart: document.getElementById('evolution-chart'),
    languageToggle: document.getElementById('language-toggle')
};

// Inicialización de controles
function initializeControls() {
    // Conectar inputs y sliders
    const parameters = [
        'projectile-mass', 'initial-velocity', 'pendulum-length',
        'pendulum-mass', 'gravity', 'impact-angle'
    ];

    parameters.forEach(param => {
        const input = document.getElementById(param);
        const slider = document.getElementById(`${param}-slider`);
        
        // Sincronizar input y slider
        input.addEventListener('input', () => {
            slider.value = input.value;
            updateSimulationParameter(param, parseFloat(input.value));
        });
        
        slider.addEventListener('input', () => {
            input.value = slider.value;
            updateSimulationParameter(param, parseFloat(slider.value));
        });

        // Mejorar interacción táctil en dispositivos móviles
        slider.addEventListener('touchstart', function(e) {
            e.preventDefault(); // Prevenir zoom en pantalla táctil
        }, { passive: false });
        
        slider.addEventListener('touchmove', function(e) {
            e.preventDefault(); // Mejorar deslizamiento en móviles
        }, { passive: false });
    });

    // Botones y toggles con soporte táctil mejorado
    const addTouchSupport = (element) => {
        if (element) {
            element.addEventListener('touchstart', function(e) {
                // Simular efecto de clic al tocar
                this.classList.add('touch-active');
                // No prevenir el evento predeterminado para permitir el clic
            });
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
        }
    };

    // Aplicar soporte táctil a todos los botones
    document.querySelectorAll('.btn').forEach(addTouchSupport);

    // Botones y toggles (código existente)
    elements.startBtn.addEventListener('click', toggleSimulation);
    elements.resetBtn.addEventListener('click', resetSimulation);
    elements.errorToggle.addEventListener('change', () => {
        state.useErrors = elements.errorToggle.checked;
        if (!isSimulationRunning) {
            calculateResults();
            updateCalculationsDisplay();
        }
    });
    elements.slowMotion.addEventListener('change', () => {
        state.slowMotion = elements.slowMotion.checked;
    });

    elements.multipleExperiments.addEventListener('change', () => {
        state.runMultiple = elements.multipleExperiments.checked;
        elements.numExperiments.disabled = !state.runMultiple;
    });
    
    elements.numExperiments.addEventListener('input', () => {
        state.numExperiments = parseInt(elements.numExperiments.value);
    });
    
    elements.runAnalysisBtn.addEventListener('click', runStatisticalAnalysis);
    
    // Agregar event listener para el botón de exportación
    if (document.getElementById('export-data-btn')) {
        document.getElementById('export-data-btn').addEventListener('click', exportExperimentData);
    }

    // Añadir event listener para el botón de cambio de idioma
    if (elements.languageToggle) {
        elements.languageToggle.addEventListener('click', toggleLanguage);
    }
}

// Actualizar parámetros de simulación
function updateSimulationParameter(param, value) {
    switch(param) {
        case 'projectile-mass':
            state.projectileMass = value;
            break;
        case 'initial-velocity':
            state.initialVelocity = value;
            break;
        case 'pendulum-length':
            state.pendulumLength = value;
            break;
        case 'pendulum-mass':
            state.pendulumMass = value;
            break;
        case 'gravity':
            state.gravity = value;
            break;
        case 'impact-angle':
            state.impactAngle = value;
            break;
    }
    
    // Actualizar cálculos y visualización
    if (!isSimulationRunning) {
        calculateResults();
        updateCalculationsDisplay();
        updatePendulumDisplay(0);
    }
}

// Calcular resultados teóricos y experimentales
function calculateResults() {
    // Convertir ángulo de impacto a radianes
    const impactAngleRad = state.impactAngle * DEG_TO_RAD;
    
    // Cálculos teóricos
    const totalMass = state.pendulumMass + state.projectileMass;
    const velocityAfterImpact = (state.projectileMass * state.initialVelocity * Math.cos(impactAngleRad)) / totalMass;
    const initialEnergy = 0.5 * state.projectileMass * Math.pow(state.initialVelocity, 2);
    
    // Ángulo máximo del péndulo (conservación de momento)
    const maxAngle = Math.asin(velocityAfterImpact / Math.sqrt(state.gravity * state.pendulumLength));
    const maxHeight = state.pendulumLength * (1 - Math.cos(maxAngle));
    const finalEnergy = totalMass * state.gravity * maxHeight;
    const momentum = state.projectileMass * state.initialVelocity * Math.cos(impactAngleRad);
    
    theoreticalResults = {
        velocityAfterImpact,
        maxAngle: maxAngle * RAD_TO_DEG,
        maxHeight,
        initialEnergy,
        finalEnergy,
        momentum
    };
    
    // Valores experimentales (con errores aleatorios si está activado)
    if (state.useErrors) {
        const addError = (value) => {
            // Error gaussiano con desviación estándar del 5% del valor
            const stdDev = value * 0.05;
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            return value + z * stdDev;
        };
        
        experimentalResults = {
            velocityAfterImpact: addError(velocityAfterImpact),
            maxAngle: addError(maxAngle) * RAD_TO_DEG,
            maxHeight: addError(maxHeight),
            initialEnergy: addError(initialEnergy),
            finalEnergy: addError(finalEnergy),
            momentum: addError(momentum)
        };
    } else {
        experimentalResults = { ...theoreticalResults };
    }
}

// Actualizar visualización de cálculos
function updateCalculationsDisplay() {
    // Actualizar valores teóricos
    document.getElementById('theo-velocity').textContent = `${theoreticalResults.velocityAfterImpact.toFixed(2)} m/s`;
    document.getElementById('theo-angle').textContent = `${theoreticalResults.maxAngle.toFixed(2)}°`;
    document.getElementById('theo-height').textContent = `${theoreticalResults.maxHeight.toFixed(3)} m`;
    document.getElementById('theo-energy-initial').textContent = `${theoreticalResults.initialEnergy.toFixed(2)} J`;
    document.getElementById('theo-energy-final').textContent = `${theoreticalResults.finalEnergy.toFixed(2)} J`;
    document.getElementById('theo-momentum').textContent = `${theoreticalResults.momentum.toFixed(2)} kg·m/s`;
    
    // Actualizar valores experimentales
    document.getElementById('exp-velocity').textContent = `${experimentalResults.velocityAfterImpact.toFixed(2)} m/s`;
    document.getElementById('exp-angle').textContent = `${experimentalResults.maxAngle.toFixed(2)}°`;
    document.getElementById('exp-height').textContent = `${experimentalResults.maxHeight.toFixed(3)} m`;
    document.getElementById('exp-energy-initial').textContent = `${experimentalResults.initialEnergy.toFixed(2)} J`;
    document.getElementById('exp-energy-final').textContent = `${experimentalResults.finalEnergy.toFixed(2)} J`;
    document.getElementById('exp-momentum').textContent = `${experimentalResults.momentum.toFixed(2)} kg·m/s`;
}

// Actualizar la visualización del péndulo
function updatePendulumDisplay(angle) {
    const pivotX = 400;
    const pivotY = 100;
    const length = state.pendulumLength * SCALE_FACTOR;
    
    // Calcular posición del péndulo
    const bobX = pivotX + length * Math.sin(angle);
    const bobY = pivotY + length * Math.cos(angle);
    
    // Actualizar elementos SVG
    elements.pendulumRod.setAttribute('x1', pivotX);
    elements.pendulumRod.setAttribute('y1', pivotY);
    elements.pendulumRod.setAttribute('x2', bobX);
    elements.pendulumRod.setAttribute('y2', bobY);
    
    // Ajustar tamaño del péndulo según la masa
    const bobRadius = 15 + (state.pendulumMass / 10) * 15; // Entre 15 y 30px basado en la masa
    elements.pendulumBob.setAttribute('cx', bobX);
    elements.pendulumBob.setAttribute('cy', bobY);
    elements.pendulumBob.setAttribute('r', bobRadius);
    
    // Actualizar texto de información
    const angleInDegrees = angle * RAD_TO_DEG;
    const height = state.pendulumLength * (1 - Math.cos(angle));
    const t = translations[currentLanguage];
    elements.angleText.textContent = `${t.angleText}: ${angleInDegrees.toFixed(2)}°`;
    elements.heightText.textContent = `${t.heightText}: ${height.toFixed(3)} m`;
}

// Realizar un paso de simulación
function simulationStep(timestamp) {
    if (!isSimulationRunning) return;
    
    // Obtener el tiempo transcurrido
    const deltaTime = state.slowMotion ? 0.005 : 0.016; // 60 FPS o cámara lenta
    simulationTime += deltaTime;
    
    // Fase de proyectil antes del impacto
    if (simulationTime < 1) {
        const progress = simulationTime;
        const startX = 100;
        const endX = 400 - elements.pendulumBob.getAttribute('r');
        const y = 250;
        
        // Mover proyectil linealmente
        const x = startX + (endX - startX) * progress;
        elements.projectile.setAttribute('cx', x);
        elements.projectile.setAttribute('cy', y);
        
        // Mostrar vector de velocidad
        elements.velocityVector.setAttribute('x1', x);
        elements.velocityVector.setAttribute('y1', y);
        elements.velocityVector.setAttribute('x2', x + 50);
        elements.velocityVector.setAttribute('y2', y);
        elements.velocityVector.setAttribute('display', 'inline');
        
    // Fase posterior al impacto
    } else if (simulationTime >= 1) {
        // Ocultar proyectil y vector
        elements.projectile.setAttribute('display', 'none');
        elements.velocityVector.setAttribute('display', 'none');
        
        // La simulación usará el resultado "experimental" si los errores están activados
        const results = state.useErrors ? experimentalResults : theoreticalResults;
        
        // Calcular ángulo del péndulo basado en movimiento armónico simple
        const omega = Math.sqrt(state.gravity / state.pendulumLength); // Frecuencia angular
        const time = simulationTime - 1; // Tiempo desde el impacto
        const maxAngleRad = results.maxAngle * DEG_TO_RAD;
        const angle = maxAngleRad * Math.cos(omega * time);
        
        // Actualizar visualización del péndulo
        updatePendulumDisplay(angle);
        
        // Recopilar datos para gráficas
        if (time < 10) { // Limitar la recolección de datos a 10 segundos
            const totalMass = state.pendulumMass + state.projectileMass;
            const height = state.pendulumLength * (1 - Math.cos(angle));
            const potentialEnergy = totalMass * state.gravity * height;
            const velocity = angle * state.pendulumLength * omega * Math.sin(omega * time);
            const kineticEnergy = 0.5 * totalMass * velocity * velocity;
            
            dataPoints.time.push(time);
            dataPoints.angle.push(angle * RAD_TO_DEG);
            dataPoints.height.push(height);
            
            // Actualizar gráficas cada 10 frames
            if (dataPoints.time.length % 10 === 0) {
                updateCharts();
            }
        } else if (time > 10 && state.runMultiple) {
            // Finalizar este experimento y continuar con el siguiente
            completeCurrentExperiment();
            return;
        }
    }
    
    // Continuar la animación
    animationId = requestAnimationFrame(simulationStep);
}

// Iniciar o detener la simulación
function toggleSimulation() {
    if (isSimulationRunning) {
        stopSimulation();
        elements.startBtn.textContent = translations[currentLanguage].startBtn;
    } else {
        startSimulation();
        elements.startBtn.textContent = state.runMultiple ? 
            `${translations[currentLanguage].experimentNumber} ${currentExperimentNumber}/${state.numExperiments}` : 
            translations[currentLanguage].stopBtn;
    }
}

// Iniciar la simulación
function startSimulation() {
    if (isSimulationRunning) return;
    
    isSimulationRunning = true;
    
    if (state.runMultiple && experimentsList.length === 0) {
        // Iniciar experimentos múltiples
        currentExperimentNumber = 1;
        resetExperimentData();
        runNextExperiment();
    } else {
        // Ejecutar un solo experimento
        simulationTime = 0;
        
        // Reiniciar datos para gráficas
        dataPoints = {
            time: [],
            angle: [],
            height: []
        };
        
        // Configurar elementos iniciales
        elements.projectile.setAttribute('display', 'inline');
        elements.projectile.setAttribute('cx', '100');
        elements.projectile.setAttribute('cy', '250');
        
        // Ajustar tamaño del proyectil según su masa
        const projectileRadius = 5 + (state.projectileMass / 2) * 10; // Entre 5 y 15px
        elements.projectile.setAttribute('r', projectileRadius);
        
        // Calcular resultados teóricos y experimentales
        calculateResults();
        updateCalculationsDisplay();
        
        // Iniciar la animación
        animationId = requestAnimationFrame(simulationStep);
    }
}

// Detener la simulación
function stopSimulation() {
    isSimulationRunning = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Reiniciar la simulación
function resetSimulation() {
    stopSimulation();
    elements.startBtn.textContent = translations[currentLanguage].startBtn;
    
    // Reiniciar estado
    state = { ...initialState };
    
    // Reiniciar controles de la interfaz
    document.getElementById('projectile-mass').value = state.projectileMass;
    document.getElementById('projectile-mass-slider').value = state.projectileMass;
    document.getElementById('initial-velocity').value = state.initialVelocity;
    document.getElementById('initial-velocity-slider').value = state.initialVelocity;
    document.getElementById('pendulum-length').value = state.pendulumLength;
    document.getElementById('pendulum-length-slider').value = state.pendulumLength;
    document.getElementById('pendulum-mass').value = state.pendulumMass;
    document.getElementById('pendulum-mass-slider').value = state.pendulumMass;
    document.getElementById('gravity').value = state.gravity;
    document.getElementById('gravity-slider').value = state.gravity;
    document.getElementById('impact-angle').value = state.impactAngle;
    document.getElementById('impact-angle-slider').value = state.impactAngle;
    
    elements.errorToggle.checked = false;
    elements.slowMotion.checked = false;
    elements.multipleExperiments.checked = false;
    elements.numExperiments.value = state.numExperiments;
    elements.numExperiments.disabled = true;
    
    // Reiniciar visualización
    elements.projectile.setAttribute('display', 'inline');
    elements.projectile.setAttribute('cx', '100');
    elements.projectile.setAttribute('cy', '250');
    elements.projectile.setAttribute('r', '10');
    elements.velocityVector.setAttribute('display', 'none');
    updatePendulumDisplay(0);
    
    // Reiniciar cálculos
    calculateResults();
    updateCalculationsDisplay();
    
    // Limpiar gráficas
    dataPoints = {
        time: [],
        angle: [],
        height: []
    };
    initializeCharts();
    
    // Reiniciar experimentos
    resetExperimentData();
}

// Inicializar gráficas
function initializeCharts() {
    // Gráfica de ángulo
    Plotly.newPlot(elements.angleChart, [
        {
            x: [],
            y: [],
            name: translations[currentLanguage].angle,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#9b59b6' }
        }
    ], {
        title: translations[currentLanguage].angleVsTime,
        xaxis: { title: translations[currentLanguage].time },
        yaxis: { title: translations[currentLanguage].angle },
        margin: { t: 40, l: 60, r: 10, b: 40 }
    });
}

// Actualizar gráficas con nuevos datos
function updateCharts() {
    // Actualizar gráfica de ángulo con el idioma actual
    const t = translations[currentLanguage];
    
    if (elements.angleChart && Plotly) {
        Plotly.update(elements.angleChart, {
            x: [dataPoints.time],
            y: [dataPoints.angle]
        }, {
            title: t.angleVsTime,
            xaxis: { title: t.time },
            yaxis: { title: t.angle }
        }, [0]);
    }
}

// Función para completar el experimento actual y continuar con los demás
function completeCurrentExperiment() {
    // Guardar resultados del experimento actual
    const experimentResult = {
        number: currentExperimentNumber,
        parameters: {
            projectileMass: state.projectileMass,
            initialVelocity: state.initialVelocity,
            pendulumLength: state.pendulumLength,
            pendulumMass: state.pendulumMass,
            gravity: state.gravity,
            impactAngle: state.impactAngle
        },
        results: {
            maxAngle: experimentalResults.maxAngle,
            maxHeight: experimentalResults.maxHeight,
            velocityAfterImpact: experimentalResults.velocityAfterImpact,
            initialEnergy: experimentalResults.initialEnergy,
            finalEnergy: experimentalResults.finalEnergy,
            errorFactor: state.useErrors ? calculateErrorFactor(theoreticalResults, experimentalResults) : 0
        }
    };
    
    experimentsList.push(experimentResult);
    
    // Agregar a la tabla de experimentos
    addExperimentToTable(experimentResult);
    
    // Mostrar la tabla de experimentos si estaba oculta
    elements.experimentsTable.closest('.data-container').style.display = 'block';
    
    // Verificar si hay más experimentos por realizar
    if (currentExperimentNumber < state.numExperiments) {
        currentExperimentNumber++;
        elements.startBtn.textContent = `${translations[currentLanguage].experimentNumber} ${currentExperimentNumber}/${state.numExperiments}`;
        runNextExperiment();
    } else {
        // Todos los experimentos completados
        stopSimulation();
        elements.startBtn.textContent = translations[currentLanguage].startBtn;
        
        // Actualizar gráficos estadísticos automáticamente al finalizar
        runStatisticalAnalysis();
    }
}

// Calcula el factor de error promedio entre resultados teóricos y experimentales
function calculateErrorFactor(theoretical, experimental) {
    const errorFactors = [
        Math.abs(experimental.maxAngle - theoretical.maxAngle) / theoretical.maxAngle,
        Math.abs(experimental.maxHeight - theoretical.maxHeight) / theoretical.maxHeight,
        Math.abs(experimental.velocityAfterImpact - theoretical.velocityAfterImpact) / theoretical.velocityAfterImpact
    ];
    
    return errorFactors.reduce((sum, factor) => sum + factor, 0) / errorFactors.length;
}

// Ejecutar el siguiente experimento con pequeñas variaciones si tiene errores activados
function runNextExperiment() {
    simulationTime = 0;
    
    // Reiniciar datos para gráficas
    dataPoints = {
        time: [],
        angle: [],
        height: []
    };
    
    // Aplicar pequeñas variaciones aleatorias a algunos parámetros para experimentos múltiples
    if (state.useErrors && currentExperimentNumber > 1) {
        const addNoise = (value) => {
            // Error gaussiano con desviación estándar del 5% del valor
            const noise = (Math.random() * 2 - 1) * value * 0.05;
            return value + noise;
        };
        
        // Variar ligeramente los parámetros para simular experimentos reales
        state.projectileMass = addNoise(initialState.projectileMass);
        state.initialVelocity = addNoise(initialState.initialVelocity);
        
        // Actualizar controles visuales
        document.getElementById('projectile-mass').value = state.projectileMass;
        document.getElementById('projectile-mass-slider').value = state.projectileMass;
        document.getElementById('initial-velocity').value = state.initialVelocity;
        document.getElementById('initial-velocity-slider').value = state.initialVelocity;
    }
    
    // Configurar elementos iniciales
    elements.projectile.setAttribute('display', 'inline');
    elements.projectile.setAttribute('cx', '100');
    elements.projectile.setAttribute('cy', '250');
    
    // Ajustar tamaño del proyectil según su masa
    const projectileRadius = 5 + (state.projectileMass / 2) * 10;
    elements.projectile.setAttribute('r', projectileRadius);
    
    // Calcular resultados teóricos y experimentales
    calculateResults();
    updateCalculationsDisplay();
    
    // Iniciar la animación
    animationId = requestAnimationFrame(simulationStep);
}

// Agregar experimento a la tabla
function addExperimentToTable(experiment) {
    const row = document.createElement('tr');
    
    // Crear celdas con los datos del experimento
    const cells = [
        experiment.number,
        experiment.parameters.projectileMass.toFixed(2),
        experiment.parameters.initialVelocity.toFixed(1),
        experiment.parameters.pendulumMass.toFixed(1),
        experiment.parameters.pendulumLength.toFixed(2),
        experiment.parameters.impactAngle.toFixed(0),
        experiment.results.maxAngle.toFixed(2),
        experiment.results.maxHeight.toFixed(3),
        experiment.results.velocityAfterImpact.toFixed(2)
    ];
    
    cells.forEach(cellData => {
        const cell = document.createElement('td');
        cell.textContent = cellData;
        row.appendChild(cell);
    });
    
    elements.experimentsTableBody.appendChild(row);
}

// Función para limpiar datos de experimentos previos
function resetExperimentData() {
    experimentsList = [];
    elements.experimentsTableBody.innerHTML = '';
    
    // Ocultar contenedores de resultados si están vacíos
    if (experimentsList.length === 0) {
        elements.experimentsTable.closest('.data-container').style.display = 'none';
        elements.statsContainer.style.display = 'none';
    }
}

// Calcular estadísticas descriptivas
function calculateStatistics(values) {
    // Ordenar los valores para facilitar los cálculos
    const sorted = [...values].sort((a, b) => a - b);
    
    // Valor mínimo y máximo
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    
    // Media
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / sorted.length;
    
    // Desviación estándar
    const squaredDifferences = sorted.map(value => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / sorted.length;
    const stdDev = Math.sqrt(variance);
    
    // Rango
    const range = max - min;
    
    // Error relativo (con respecto a la media)
    const relativeError = (stdDev / mean) * 100;
    
    return {
        values: sorted,
        min,
        max,
        mean,
        stdDev,
        range,
        relativeError
    };
}

// Crear histograma
function createHistogram(container, data, title, xLabel, yLabel) {
    // Calcular el número de bins usando la raíz cuadrada del número de observaciones
    const numBins = Math.round(Math.sqrt(data.length));
    
    // Calcular bins
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / numBins;
    
    // Inicializar conteo de bins
    const bins = Array(numBins).fill(0);
    const binLabels = [];
    
    // Crear etiquetas de bins
    for (let i = 0; i < numBins; i++) {
        const binStart = min + i * binWidth;
        const binEnd = binStart + binWidth;
        binLabels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
    }
    
    // Contar valores en cada bin
    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
        if (binIndex >= 0) {
            bins[binIndex]++;
        }
    });
    
    // Crear gráfico
    Plotly.newPlot(container, [{
        x: binLabels,
        y: bins,
        type: 'bar',
        marker: {
            color: 'rgba(52, 152, 219, 0.7)',
            line: {
                color: 'rgba(52, 152, 219, 1.0)',
                width: 1
            }
        }
    }], {
        title: translations[currentLanguage].histogramTitle,
        xaxis: { title: translations[currentLanguage].angle },
        yaxis: { title: translations[currentLanguage].frequency },
        margin: { t: 40, l: 60, r: 10, b: 40 }
    });
}

// Generar datos de histograma normalizado para la curva de distribución
function generateHistogramData(data, min, max, numBins) {
    // Calcular el número de bins usando la raíz cuadrada del número de observaciones
    numBins = Math.round(Math.sqrt(data.length));
    
    const bins = Array(numBins).fill(0);
    const binWidth = (max - min) / numBins;
    const binCenters = [];
    
    // Contar valores en cada bin
    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
        if (binIndex >= 0) {
            bins[binIndex]++;
        }
    });
    
    // Calcular centros de los bins
    for (let i = 0; i < numBins; i++) {
        binCenters.push(min + (i + 0.5) * binWidth);
    }
    
    // Normalizar altura del histograma para comparar con la curva de densidad
    const totalArea = data.length * binWidth;
    const normalizedBins = bins.map(count => count / totalArea);
    
    return {
        x: binCenters,
        y: normalizedBins
    };
}

// Crear curva de distribución de valores
function createDistributionCurve(container, data, title, xLabel, yLabel) {
    // Calcular media y desviación estándar
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const stdDev = Math.sqrt(
        data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );
    
    // Generar puntos para la curva de distribución normal
    const min = Math.min(...data) - stdDev;
    const max = Math.max(...data) + stdDev;
    const step = (max - min) / 100;
    
    const xValues = [];
    const yValues = [];
    
    for (let x = min; x <= max; x += step) {
        const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
        const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
        xValues.push(x);
        yValues.push(y);
    }
    
    // Preparar histograma normalizado para comparar con la curva
    const histogramData = generateHistogramData(data, min, max, 10);
    
    // Crear gráfico
    Plotly.newPlot(container, [
        {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines',
            name: translations[currentLanguage].distributionTitle,
            line: {
                color: 'rgba(52, 152, 219, 1.0)',
                width: 2
            }
        },
        {
            x: histogramData.x,
            y: histogramData.y,
            type: 'bar',
            name: translations[currentLanguage].angle,
            marker: {
                color: 'rgba(231, 76, 60, 0.7)',
                line: {
                    color: 'rgba(231, 76, 60, 1.0)',
                    width: 1
                }
            },
            opacity: 0.5
        }
    ], {
        title: translations[currentLanguage].distributionTitle,
        xaxis: { title: translations[currentLanguage].angle },
        yaxis: { title: translations[currentLanguage].density },
        margin: { t: 40, l: 60, r: 10, b: 40 },
        legend: { x: 0, y: 1 }
    });
}

// Crear gráfico de cajas (box plot)
function createBoxPlot(container, data, title, xLabel) {
    Plotly.newPlot(container, [
        {
            y: data,
            type: 'box',
            name: translations[currentLanguage].angle,
            boxpoints: 'all',
            jitter: 0.3,
            pointpos: -1.8,
            marker: {
                color: 'rgba(46, 204, 113, 0.7)',
                size: 8,
                opacity: 0.6
            },
            line: {
                color: 'rgba(44, 62, 80, 1.0)'
            },
            boxmean: true
        }
    ], {
        title: translations[currentLanguage].boxplotTitle,
        yaxis: { title: translations[currentLanguage].angle },
        margin: { t: 40, l: 60, r: 10, b: 40 }
    });
}

// Realizar análisis estadístico de los experimentos
function runStatisticalAnalysis() {
    if (experimentsList.length < 2) {
        alert('Se necesitan al menos 2 experimentos para realizar análisis estadístico');
        return;
    }
    
    // Mostrar contenedores
    elements.experimentsTable.closest('.data-container').style.display = 'block';
    elements.statsContainer.style.display = 'block';
    
    // Extraer datos para análisis
    const maxAngles = experimentsList.map(exp => exp.results.maxAngle);
    
    // Histograma de ángulos máximos
    createHistogram(elements.histogramChart, maxAngles, translations[currentLanguage].histogramTitle, translations[currentLanguage].angle, translations[currentLanguage].frequency);
    
    // Curva de distribución de valores de ángulos
    createDistributionCurve(elements.scatterChart, maxAngles, translations[currentLanguage].distributionTitle, translations[currentLanguage].angle, translations[currentLanguage].density);
    
    // Gráfico de cajas de valores de ángulos
    createBoxPlot(elements.evolutionChart, maxAngles, translations[currentLanguage].boxplotTitle, translations[currentLanguage].angle);
}

// Función para exportar datos experimentales a un archivo de texto
function exportExperimentData() {
    if (experimentsList.length === 0) {
        alert('No hay datos experimentales para exportar');
        return;
    }
    
    let fileContent = currentLanguage === 'es' ? 
        "DATOS DE EXPERIMENTOS DE PÉNDULO BALÍSTICO\n" : 
        "BALLISTIC PENDULUM EXPERIMENT DATA\n";
    fileContent += "========================================\n\n";
    
    // Agregar información del autor e institución
    fileContent += "Autor: Rodrigo Agosta\n";
    fileContent += "Grupo GIEDI\n";
    fileContent += "Facultad Regional Santa Fe - Universidad Tecnológica Nacional\n\n";
    
    // Agregar configuración del sistema
    fileContent += currentLanguage === 'es' ? "CONFIGURACIÓN DEL SISTEMA:\n" : "SYSTEM CONFIGURATION:\n";
    fileContent += "--------------------------\n";
    fileContent += `${translations[currentLanguage].gravity}: ${initialState.gravity} m/s²\n`;
    fileContent += `${translations[currentLanguage].pendulumLength}: ${initialState.pendulumLength} m\n`;
    fileContent += `${translations[currentLanguage].pendulumMass}: ${initialState.pendulumMass} kg\n`;
    fileContent += `${translations[currentLanguage].initialVelocity}: ${initialState.initialVelocity} m/s\n`;
    fileContent += `${translations[currentLanguage].impactAngle}: ${initialState.impactAngle}°\n`;
    fileContent += `${translations[currentLanguage].addErrors}: ${initialState.useErrors ? (currentLanguage === 'es' ? "Sí" : "Yes") : "No"}\n\n`;
    
    // Agregar tabla de mediciones
    fileContent += currentLanguage === 'es' ? "TABLA DE MEDICIONES:\n" : "MEASUREMENT TABLE:\n";
    fileContent += "-------------------\n";
    fileContent += "# | M.Proyectil | Velocidad | M.Péndulo | Longitud | Áng.Impacto | Áng.Máx | Alt.Máx | Vel.Final\n";
    fileContent += "-------------------------------------------------------------------------------------------\n";
    
    experimentsList.forEach(exp => {
        fileContent += `${exp.number} | `;
        fileContent += `${exp.parameters.projectileMass.toFixed(2)} | `;
        fileContent += `${exp.parameters.initialVelocity.toFixed(1)} | `;
        fileContent += `${exp.parameters.pendulumMass.toFixed(1)} | `;
        fileContent += `${exp.parameters.pendulumLength.toFixed(2)} | `;
        fileContent += `${exp.parameters.impactAngle.toFixed(0)} | `;
        fileContent += `${exp.results.maxAngle.toFixed(2)} | `;
        fileContent += `${exp.results.maxHeight.toFixed(3)} | `;
        fileContent += `${exp.results.velocityAfterImpact.toFixed(2)}\n`;
    });
    
    // Agregar estadísticas si hay más de un experimento
    if (experimentsList.length > 1) {
        const maxAngles = experimentsList.map(exp => exp.results.maxAngle);
        const stats = calculateStatistics(maxAngles);
        
        fileContent += "\nESTADÍSTICAS DE ÁNGULOS MÁXIMOS:\n";
        fileContent += "--------------------------------\n";
        fileContent += `Media: ${stats.mean.toFixed(2)}°\n`;
        fileContent += `Desviación estándar: ${stats.stdDev.toFixed(2)}°\n`;
        fileContent += `Valor mínimo: ${stats.min.toFixed(2)}°\n`;
        fileContent += `Valor máximo: ${stats.max.toFixed(2)}°\n`;
        fileContent += `Rango: ${stats.range.toFixed(2)}°\n`;
        fileContent += `Error relativo: ${stats.relativeError.toFixed(2)}%\n`;
    }
    
    // Crear y descargar el archivo
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datos_pendulo_balistico.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Función para cambiar el idioma
function toggleLanguage() {
    currentLanguage = (currentLanguage === 'es') ? 'en' : 'es';
    elements.languageToggle.textContent = (currentLanguage === 'es') ? 'EN' : 'ES';
    updateInterfaceLanguage();
}

// Actualizar el idioma de la interfaz
function updateInterfaceLanguage() {
    const t = translations[currentLanguage];
    
    // Actualizar título y subtítulo
    document.querySelector('header h1').textContent = t.title;
    document.querySelector('header p').textContent = t.subtitle;
    
    // Actualizar botones
    elements.startBtn.textContent = isSimulationRunning ? t.stopBtn : t.startBtn;
    elements.resetBtn.textContent = t.resetBtn;
    
    // Actualizar etiquetas del SVG
    updatePendulumDisplay(parseFloat(elements.pendulumBob.getAttribute('cy')));
    
    // Actualizar parámetros
    document.querySelector('.parameters h2').textContent = t.parameters;
    const labels = document.querySelectorAll('.parameter-group label');
    labels.forEach(label => {
        if (label.getAttribute('for') === 'projectile-mass') label.textContent = t.projectileMass + ':';
        if (label.getAttribute('for') === 'initial-velocity') label.textContent = t.initialVelocity + ':';
        if (label.getAttribute('for') === 'pendulum-length') label.textContent = t.pendulumLength + ':';
        if (label.getAttribute('for') === 'pendulum-mass') label.textContent = t.pendulumMass + ':';
        if (label.getAttribute('for') === 'gravity') label.textContent = t.gravity + ':';
        if (label.getAttribute('for') === 'impact-angle') label.textContent = t.impactAngle + ':';
        if (label.getAttribute('for') === 'num-experiments') label.textContent = t.numExperiments + ':';
    });
    
    // Actualizar toggles
    document.querySelectorAll('.toggle-container label:not(.switch)').forEach(label => {
        if (label.getAttribute('for') === 'error-toggle') label.textContent = t.addErrors + ':';
        if (label.getAttribute('for') === 'slow-motion') label.textContent = t.slowMotion + ':';
        if (label.getAttribute('for') === 'multiple-experiments') label.textContent = t.multipleExperiments + ':';
    });
    
    // Actualizar sección de experimentos
    if (document.querySelector('.data-container h2')) {
        document.querySelector('.data-container h2').textContent = t.experimentRecord;
    }
    if (elements.runAnalysisBtn) {
        elements.runAnalysisBtn.textContent = t.runAnalysis;
    }
    if (document.getElementById('export-data-btn')) {
        document.getElementById('export-data-btn').textContent = t.exportData;
    }
    
    // Actualizar encabezados de tabla de experimentos
    const tableHeaders = document.querySelectorAll('#experiments-table th');
    if (tableHeaders.length > 0) {
        tableHeaders[0].textContent = '#';
        tableHeaders[1].textContent = t.projectileMass.split(' ')[0] + ' (kg)';
        tableHeaders[2].textContent = t.initialVelocity.split(' ')[0] + ' (m/s)';
        tableHeaders[3].textContent = t.pendulumMass.split(' ')[0] + ' (kg)';
        tableHeaders[4].textContent = t.pendulumLength.split(' ')[0] + ' (m)';
        tableHeaders[5].textContent = t.impactAngle.split(' ')[0] + ' (°)';
        tableHeaders[6].textContent = t.maxAngle.split(' ')[0] + ' (°)';
        tableHeaders[7].textContent = t.maxHeight.split(' ')[0] + ' (m)';
        tableHeaders[8].textContent = t.velocity.split(' ')[0] + ' (m/s)';
    }
    
    // Actualizar sección de estadísticas
    if (elements.statsContainer.querySelector('h2')) {
        elements.statsContainer.querySelector('h2').textContent = t.statisticalAnalysis;
    }
    
    // Actualizar sección de cálculos
    document.querySelector('.calculations-container h2').textContent = t.calculations;
    document.querySelectorAll('.calculation h3')[0].textContent = t.theoreticalValues;
    document.querySelectorAll('.calculation h3')[1].textContent = t.experimentalValues;
    
    const calculationLabels = document.querySelectorAll('table td:first-child');
    calculationLabels.forEach(td => {
        if (td.textContent.includes('Velocidad')) td.textContent = t.velocity + ':';
        if (td.textContent.includes('Ángulo máximo')) td.textContent = t.maxAngle + ':';
        if (td.textContent.includes('Altura máxima')) td.textContent = t.maxHeight + ':';
        if (td.textContent.includes('Energía inicial')) td.textContent = t.initialEnergy + ':';
        if (td.textContent.includes('Energía final')) td.textContent = t.finalEnergy + ':';
        if (td.textContent.includes('Conservación de momento')) td.textContent = t.momentumConservation + ':';
    });
    
    // Actualizar gráficas
    updateCharts();
    
    // Actualizar pie de página
    document.querySelector('footer p').textContent = t.footer;
}

// Inicializar la aplicación
function initApp() {
    // Verificar si los elementos existen antes de inicializar
    if (!elements.svg || !elements.pendulumRod || !elements.pendulumBob) {
        console.error("No se encontraron elementos necesarios en el DOM");
        return;
    }

    initializeControls();
    calculateResults();
    updateCalculationsDisplay();
    updatePendulumDisplay(0);
    initializeCharts();
    
    // Actualizar el idioma inicial
    if (elements.languageToggle) {
        updateInterfaceLanguage();
    }
    
    // Ocultar contenedores de resultados inicialmente
    if (elements.experimentsTable && elements.statsContainer) {
        elements.experimentsTable.closest('.data-container').style.display = 'none';
        elements.statsContainer.style.display = 'none';
    }
    
    // Detectar orientación y ajustar la interfaz
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            updateLayoutForOrientation();
            if (Plotly && elements.angleChart) {
                Plotly.relayout(elements.angleChart, {autosize: true});
            }
        }, 200);
    });
    
    updateLayoutForOrientation();
}

// Función para ajustar la interfaz según la orientación del dispositivo
function updateLayoutForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape && window.innerWidth <= 992) {
        // Ajustes específicos para modo horizontal en móviles
        document.querySelectorAll('.chart').forEach(chart => {
            chart.style.height = '200px';
        });
    } else {
        // Restaurar altura predeterminada
        document.querySelectorAll('.chart').forEach(chart => {
            chart.style.height = '';
        });
    }
}

// Ajustar visualización para dispositivos móviles
if (window.innerWidth <= 768) {
    // Ajustar tamaño del SVG para pantallas pequeñas
    const svgViewBox = elements.svg.getAttribute('viewBox').split(' ');
    elements.svg.setAttribute('viewBox', `0 0 ${svgViewBox[2]} ${svgViewBox[3]}`);
    
    // Ajustar posiciones de elementos para mejor visualización en móvil
    document.getElementById('angle-text').setAttribute('x', '20');
    document.getElementById('angle-text').setAttribute('y', '30');
    document.getElementById('height-text').setAttribute('x', '20');
    document.getElementById('height-text').setAttribute('y', '50');
}

// Iniciar la aplicación cuando se cargue la página
document.addEventListener('DOMContentLoaded', initApp);