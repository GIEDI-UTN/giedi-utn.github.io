// Use proper import from Chart.js UMD build
const Chart = window.Chart;

// Estado global de la simulación
const state = {
    mass: 70,                  // kg
    gravity: 9.8,              // m/s²
    currentAcceleration: 0,    // m/s²
    apparentWeight: 0,         // N
    simulationTime: 0,         // segundos
    running: false,
    data: {
        time: [],
        weight: [],
        acceleration: []
    },
    functionMode: 'manual',
    currentFunction: null,
    stars: [] // Arreglo para guardar las estrellas
};

// Elementos DOM
const elements = {
    // Displays
    weightDisplay: document.getElementById('weight-display'),
    scaleDisplay: document.getElementById('scale-display'),
    accelerationDisplay: document.getElementById('acceleration-display'),
    timeDisplay: document.getElementById('time-display'),
    sliderValue: document.getElementById('slider-value'),
    
    // Inputs
    massInput: document.getElementById('mass-input'),
    gravityInput: document.getElementById('gravity-input'),
    accelerationSlider: document.getElementById('acceleration-slider'),
    functionSelect: document.getElementById('function-select'),
    
    // Buttons
    startBtn: document.getElementById('start-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    resetBtn: document.getElementById('reset-btn'),
    downloadBtn: document.getElementById('download-btn'),
    applyFunctionBtn: document.getElementById('apply-function'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    
    // Tabs
    manualTab: document.getElementById('manual-tab'),
    presetTab: document.getElementById('preset-tab'),
    
    // Function params
    stepParams: document.getElementById('step-params'),
    rampParams: document.getElementById('ramp-params'),
    logarithmicParams: document.getElementById('logarithmic-params'),
    sinusoidalParams: document.getElementById('sinusoidal-params'),
    
    // Visual elements
    elevator: document.getElementById('elevator'),
    person: document.getElementById('person'),
    scale: document.getElementById('scale'),
    spaceBackground: document.getElementById('space-background')
};

// Configuración de gráficas
const weightChartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Peso Aparente (N)',
            data: [],
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Tiempo (s)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Peso (N)'
                }
            }
        }
    }
};

const accelerationChartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Aceleración (m/s²)',
            data: [],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Tiempo (s)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Aceleración (m/s²)'
                }
            }
        }
    }
};

// Inicializar gráficas
const weightChart = new Chart(
    document.getElementById('weight-chart'),
    weightChartConfig
);

const accelerationChart = new Chart(
    document.getElementById('acceleration-chart'),
    accelerationChartConfig
);

// Funciones de aceleración predefinidas
const accelerationFunctions = {
    step: (time, params) => {
        const { value, startTime } = params;
        return time >= startTime ? value : 0;
    },
    
    ramp: (time, params) => {
        const { finalValue, duration, startTime } = params;
        if (time < startTime) return 0;
        if (time > startTime + duration) return finalValue;
        return finalValue * (time - startTime) / duration;
    },
    
    logarithmic: (time, params) => {
        const { maxValue, rate, startTime } = params;
        if (time < startTime) return 0;
        return maxValue * (1 - Math.exp(-rate * (time - startTime)));
    },
    
    sinusoidal: (time, params) => {
        const { amplitude, frequency, offset } = params;
        return offset + amplitude * Math.sin(2 * Math.PI * frequency * time);
    }
};

// Función para calcular el peso aparente
function calculateApparentWeight(mass, gravity, acceleration) {
    // Peso aparente = m * (g + a)
    return mass * (gravity + acceleration);
}

// Actualizar la visualización
function updateVisuals() {
    // Actualizar displays
    elements.weightDisplay.textContent = state.apparentWeight.toFixed(1) + ' N';
    elements.scaleDisplay.textContent = state.apparentWeight.toFixed(1) + ' N';
    elements.accelerationDisplay.textContent = state.currentAcceleration.toFixed(1) + ' m/s²';
    elements.timeDisplay.textContent = state.simulationTime.toFixed(1) + ' s';
    
    // Animar las estrellas basado en la aceleración
    updateStars(state.currentAcceleration);
    
    // Animar la persona según la aceleración (efecto de compresión/estiramiento mejorado)
    // Usamos una función sigmoide para suavizar la transición
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));
    const accelerationFactor = state.currentAcceleration / 20; // Normalizado entre -1 y 1
    
    // Calculamos factores de transformación con límites para que no se deforme demasiado
    let personHeight = 1 - (accelerationFactor * 0.3);
    let personWidth = 1 + (accelerationFactor * 0.3);
    
    // Aplicamos transformación con limites
    personHeight = Math.max(0.7, Math.min(1.3, personHeight));
    personWidth = Math.max(0.7, Math.min(1.3, personWidth));
    
    elements.person.style.transform = `scaleY(${personHeight}) scaleX(${personWidth})`;
    
    // Animar la balanza según el peso
    const scaleCompressionFactor = Math.max(0.7, 1 - (state.apparentWeight / (state.mass * 40)));
    elements.scale.style.transform = `scaleY(${scaleCompressionFactor})`;
    
    // Activar efecto visual en la balanza si hay cambio significativo en el peso
    if (Math.abs(state.apparentWeight - lastWeight) > 5) {
        animateScale(state.apparentWeight);
        lastWeight = state.apparentWeight;
    }
}

// Actualizar los gráficos
function updateCharts() {
    // Si tenemos más de 120 puntos (2 minutos a 1 por segundo), eliminar el primero
    if (state.data.time.length > 120) {
        state.data.time.shift();
        state.data.weight.shift();
        state.data.acceleration.shift();
    }
    
    // Añadir nuevos datos
    weightChart.data.labels = state.data.time;
    weightChart.data.datasets[0].data = state.data.weight;
    weightChart.update();
    
    accelerationChart.data.labels = state.data.time;
    accelerationChart.data.datasets[0].data = state.data.acceleration;
    accelerationChart.update();
}

// Función principal de actualización (bucle de simulación)
let lastUpdateTime = 0;
let lastDataRecordTime = 0;
let lastWeight = 0;

function simulationLoop(timestamp) {
    if (!state.running) return;
    
    // Calcular el delta de tiempo en segundos
    const deltaTime = (timestamp - lastUpdateTime) / 1000;
    lastUpdateTime = timestamp;
    
    // Actualizar el tiempo de simulación
    state.simulationTime += deltaTime;
    
    // Actualizar la aceleración según el modo
    if (state.functionMode === 'preset' && state.currentFunction) {
        const functionType = elements.functionSelect.value;
        let params = {};
        
        switch (functionType) {
            case 'step':
                params = {
                    value: parseFloat(document.getElementById('step-value').value),
                    startTime: parseFloat(document.getElementById('step-time').value)
                };
                break;
            case 'ramp':
                params = {
                    finalValue: parseFloat(document.getElementById('ramp-final').value),
                    duration: parseFloat(document.getElementById('ramp-duration').value),
                    startTime: parseFloat(document.getElementById('ramp-start').value)
                };
                break;
            case 'logarithmic':
                params = {
                    maxValue: parseFloat(document.getElementById('log-max').value),
                    rate: parseFloat(document.getElementById('log-rate').value),
                    startTime: parseFloat(document.getElementById('log-start').value)
                };
                break;
            case 'sinusoidal':
                params = {
                    amplitude: parseFloat(document.getElementById('sin-amplitude').value),
                    frequency: parseFloat(document.getElementById('sin-frequency').value),
                    offset: parseFloat(document.getElementById('sin-offset').value)
                };
                break;
        }
        
        state.currentAcceleration = accelerationFunctions[functionType](state.simulationTime, params);
    }
    
    // Calcular el peso aparente
    state.apparentWeight = calculateApparentWeight(state.mass, state.gravity, state.currentAcceleration);
    
    // Registrar datos cada segundo
    if (state.simulationTime - lastDataRecordTime >= 1) {
        state.data.time.push(state.simulationTime.toFixed(1));
        state.data.weight.push(state.apparentWeight);
        state.data.acceleration.push(state.currentAcceleration);
        lastDataRecordTime = state.simulationTime;
        
        // Activar el botón de descarga si tenemos datos
        if (state.data.time.length > 0) {
            elements.downloadBtn.disabled = false;
        }
        
        // Actualizar los gráficos con los nuevos datos
        updateCharts();
    }
    
    // Actualizar la visualización
    updateVisuals();
    
    // Continuar el bucle
    requestAnimationFrame(simulationLoop);
}

// Función para iniciar la simulación
function startSimulation() {
    if (!state.running) {
        state.running = true;
        lastUpdateTime = performance.now();
        elements.startBtn.disabled = true;
        elements.pauseBtn.disabled = false;
        requestAnimationFrame(simulationLoop);
    }
}

// Función para pausar la simulación
function pauseSimulation() {
    state.running = false;
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
}

// Función para reiniciar la simulación
function resetSimulation() {
    state.running = false;
    state.simulationTime = 0;
    state.currentAcceleration = 0;
    state.apparentWeight = calculateApparentWeight(state.mass, state.gravity, state.currentAcceleration);
    state.data = {
        time: [],
        weight: [],
        acceleration: []
    };
    
    // Reiniciar los gráficos
    weightChart.data.labels = [];
    weightChart.data.datasets[0].data = [];
    weightChart.update();
    
    accelerationChart.data.labels = [];
    accelerationChart.data.datasets[0].data = [];
    accelerationChart.update();
    
    // Reiniciar controles
    elements.accelerationSlider.value = 0;
    elements.sliderValue.textContent = '0.0 m/s²';
    
    // Reiniciar botones
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.downloadBtn.disabled = true;
    
    // Actualizar visualización
    updateVisuals();
}

// Función para cambiar de pestaña
function switchTab(tabName) {
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    elements.manualTab.style.display = tabName === 'manual' ? 'block' : 'none';
    elements.presetTab.style.display = tabName === 'preset' ? 'block' : 'none';
    
    state.functionMode = tabName;
    
    // Si cambiamos a manual, actualizamos la aceleración según el slider
    if (tabName === 'manual') {
        state.currentAcceleration = parseFloat(elements.accelerationSlider.value);
        state.currentFunction = null;
    }
}

// Función para cambiar los parámetros visibles según la función seleccionada
function updateFunctionParams() {
    const functionType = elements.functionSelect.value;
    
    elements.stepParams.style.display = 'none';
    elements.rampParams.style.display = 'none';
    elements.logarithmicParams.style.display = 'none';
    elements.sinusoidalParams.style.display = 'none';
    
    switch (functionType) {
        case 'step':
            elements.stepParams.style.display = 'block';
            break;
        case 'ramp':
            elements.rampParams.style.display = 'block';
            break;
        case 'logarithmic':
            elements.logarithmicParams.style.display = 'block';
            break;
        case 'sinusoidal':
            elements.sinusoidalParams.style.display = 'block';
            break;
    }
}

// Función para aplicar la función seleccionada
function applyFunction() {
    const functionType = elements.functionSelect.value;
    state.currentFunction = functionType;
    
    // Si estamos en modo manual, cambiamos a preset
    if (state.functionMode === 'manual') {
        switchTab('preset');
    }
}

// Función para descargar los datos
function downloadData() {
    if (state.data.time.length === 0) return;
    
    let csvContent = "data:text/plain;charset=utf-8,";
    
    // Añadir información de autor
    csvContent += "Simulador Interactivo de Peso Aparente en un Ascensor\n";
    csvContent += "Autor: Rodrigo Agosta\n";
    csvContent += "Grupo de Investigación: GIEDI\n";
    csvContent += "Facultad Regional Santa Fe - Universidad Tecnológica Nacional\n\n";
    
    // Añadir parámetros de la simulación
    csvContent += `Masa: ${state.mass} kg\n`;
    csvContent += `Gravedad: ${state.gravity} m/s²\n\n`;
    
    // Añadir encabezados
    csvContent += "Tiempo (s),Aceleración (m/s²),Peso Aparente (N)\n";
    
    // Añadir datos
    for (let i = 0; i < state.data.time.length; i++) {
        csvContent += `${state.data.time[i]},${state.data.acceleration[i].toFixed(2)},${state.data.weight[i].toFixed(2)}\n`;
    }
    
    // Crear elemento para descargar
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "simulacion_peso_aparente.txt");
    document.body.appendChild(link);
    
    // Descargar archivo
    link.click();
    
    // Eliminar elemento
    document.body.removeChild(link);
}

// Función para crear estrellas
function createStars(count) {
    const spaceBackground = document.getElementById('space-background');
    spaceBackground.innerHTML = '';
    state.stars = [];
    
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Posición aleatoria
        const x = Math.random() * 100; // porcentaje
        const y = Math.random() * 100; // porcentaje
        const size = 1 + Math.random() * 2;
        const opacity = 0.5 + Math.random() * 0.5;
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.opacity = opacity;
        
        spaceBackground.appendChild(star);
        state.stars.push({
            element: star,
            x,
            y,
            speed: 0.5 + Math.random() * 0.5
        });
    }
}

// Función para actualizar el movimiento de las estrellas
function updateStars(acceleration) {
    // La dirección y velocidad de movimiento de las estrellas dependerá de la aceleración
    const direction = -acceleration; // Negativo para que se mueven en dirección opuesta
    const speedFactor = Math.abs(acceleration) / 5; // Factor para ajustar la velocidad
    
    state.stars.forEach(star => {
        let newY = parseFloat(star.y) + direction * star.speed * speedFactor;
        
        // Si la estrella sale del contenedor, reubicarla al lado opuesto
        if (newY > 100) newY = 0;
        if (newY < 0) newY = 100;
        
        star.y = newY;
        star.element.style.top = `${newY}%`;
    });
}

// Función para animar la balanza (efecto de brillo cuando cambia el peso)
function animateScale(value) {
    // Añadir clase para efecto de brillo
    elements.scale.classList.add('highlight');
    
    // Quitar clase después de un breve tiempo
    setTimeout(() => {
        elements.scale.classList.remove('highlight');
    }, 300);
}

// Event Listeners
function setupEventListeners() {
    // Mass Input
    elements.massInput.addEventListener('change', () => {
        state.mass = parseFloat(elements.massInput.value);
        state.apparentWeight = calculateApparentWeight(state.mass, state.gravity, state.currentAcceleration);
        updateVisuals();
    });
    
    // Gravity Input
    elements.gravityInput.addEventListener('change', () => {
        state.gravity = parseFloat(elements.gravityInput.value);
        state.apparentWeight = calculateApparentWeight(state.mass, state.gravity, state.currentAcceleration);
        updateVisuals();
    });
    
    // Acceleration Slider
    elements.accelerationSlider.addEventListener('input', () => {
        const value = parseFloat(elements.accelerationSlider.value);
        state.currentAcceleration = value;
        elements.sliderValue.textContent = `${value.toFixed(1)} m/s²`;
        state.apparentWeight = calculateApparentWeight(state.mass, state.gravity, state.currentAcceleration);
        updateVisuals();
    });
    
    // Function Select
    elements.functionSelect.addEventListener('change', updateFunctionParams);
    
    // Tab Buttons
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Start Button
    elements.startBtn.addEventListener('click', startSimulation);
    
    // Pause Button
    elements.pauseBtn.addEventListener('click', pauseSimulation);
    
    // Reset Button
    elements.resetBtn.addEventListener('click', resetSimulation);
    
    // Apply Function Button
    elements.applyFunctionBtn.addEventListener('click', applyFunction);
    
    // Download Button
    elements.downloadBtn.addEventListener('click', downloadData);
}

// Función para inicialización
function init() {
    // Configurar valores iniciales
    state.apparentWeight = calculateApparentWeight(state.mass, state.gravity, state.currentAcceleration);
    
    // Crear estrellas para el fondo
    createStars(100);
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar parámetros de función
    updateFunctionParams();
    
    // Actualizar visualización inicial
    updateVisuals();
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', init);