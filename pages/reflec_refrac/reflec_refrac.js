// Constantes y variables globales
const MATERIALS = {
  glass: { name: "Vidrio", refractiveIndex: 1.52 },
  acrylic: { name: "Acrílico", refractiveIndex: 1.49 },
  quartz: { name: "Cuarzo", refractiveIndex: 1.46 },
  diamond: { name: "Diamante", refractiveIndex: 2.42 },
  ice: { name: "Hielo", refractiveIndex: 1.31 },
  zirconium: { name: "Circonio", refractiveIndex: 2.15 },
  
  // Materiales adicionales para la selección aleatoria
  sapphire: { name: "Zafiro", refractiveIndex: 1.77 },
  ruby: { name: "Rubí", refractiveIndex: 1.76 },
  amber: { name: "Ámbar", refractiveIndex: 1.55 },
  emerald: { name: "Esmeralda", refractiveIndex: 1.57 },
  plastic: { name: "Plástico", refractiveIndex: 1.46 },
  water: { name: "Agua", refractiveIndex: 1.33 },
};

// Lista de medios exteriores y sus índices de refracción
const EXTERIOR_MEDIUMS = {
  vacuum: { name: "Vacío", refractiveIndex: 1.0 },
  air: { name: "Aire", refractiveIndex: 1.0003 },
  methanol: { name: "Metanol", refractiveIndex: 1.329 },
  water: { name: "Agua", refractiveIndex: 1.333 },
  acetaldehyde: { name: "Acetaldeído", refractiveIndex: 1.372 },
  sugarSolution30: { name: "Solución de azúcar 30%", refractiveIndex: 1.38 },
  heptanol: { name: "Heptanol (25°C)", refractiveIndex: 1.423 },
  glycerin: { name: "Glicerina", refractiveIndex: 1.473 },
  benzene: { name: "Benceno", refractiveIndex: 1.501 },
  sugarSolution80: { name: "Solución de azúcar 80%", refractiveIndex: 1.49 },
};

// Estado de la simulación
let simulation = {
  error: 0,
  material: "glass",
  exteriorMedium: "air",
  thickness: 5,
  incidenceAngle: 30,
  gridSpacing: 1,
  gridOffset: { x: 0, y: 0 },
  applyErrors: true,
  measurements: [],
  currentMaterial: null,
  currentExteriorMedium: null,
  realThickness: 5,
  realIncidenceAngle: 30,
};

// Inicialización del canvas
const canvas = document.getElementById("simulation-canvas");
const ctx = canvas.getContext("2d");
let animationFrameId = null;
let hayEscenario = false;

// Referencias de elementos DOM
const thicknessSlider = document.getElementById("thickness");
const thicknessValue = document.getElementById("thickness-value");
const angleSlider = document.getElementById("angle");
const angleValue = document.getElementById("angle-value");
const materialSelect = document.getElementById("material");
const exteriorSelect = document.getElementById("exterior");
const applyErrorsCheck = document.getElementById("apply-errors");
const dataTable = document
  .getElementById("data-table")
  .getElementsByTagName("tbody")[0];

// Botones
const grid1mmBtn = document.getElementById("grid-1mm");
const grid5mmBtn = document.getElementById("grid-5mm");
const grid10mmBtn = document.getElementById("grid-10mm");

const resetBtn = document.getElementById("reset-simulation");
const addDataBtn = document.getElementById("add-data");
const exportDataBtn = document.getElementById("export-data");


// Inicializar la simulación
function initSimulation() {
  // Establecer el tamaño del canvas al tamaño del contenedor
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Seleccionar material inicial y medio exterior
  updateCurrentMaterial();
  updateCurrentExteriorMedium();

  // Iniciar el bucle de renderizado
  startRenderLoop();

  // Añadir eventos para controles de simulación
  setupEventListeners();
}

function resizeCanvas() {
  const simulationView = document.querySelector(".simulation-view");
  canvas.width = simulationView.clientWidth;
  canvas.height = simulationView.clientHeight;
}

function updateCurrentMaterial() {
  // Si se selecciona desconocido, generar semilla rand para elegir del array
  if (simulation.material === "unknown") {
    // Excluir "unknown" de las opciones
    const materialKeys = Object.keys(MATERIALS).filter(
      (key) => key !== "unknown"
    );
    const randomIndex = Math.floor(Math.random() * materialKeys.length);
    const randomMaterial = materialKeys[randomIndex];
    simulation.currentMaterial = MATERIALS[randomMaterial];
  } 
  
  else {
    simulation.currentMaterial = MATERIALS[simulation.material];
  }
}

function updateCurrentExteriorMedium() {
  simulation.currentExteriorMedium =
    EXTERIOR_MEDIUMS[simulation.exteriorMedium];
}

function startRenderLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  const render = () => {
    drawSimulation();
    animationFrameId = requestAnimationFrame(render);
  };

  render();
}

function setupEventListeners() {
  // Eventos de los controles de material y láser
  thicknessSlider.addEventListener("input", function () {
    simulation.thickness = parseInt(this.value);
    thicknessValue.textContent = `${simulation.thickness} mm`;
    simulation.realThickness = parseInt(this.value);
  });

  angleSlider.addEventListener("input", function () {
    simulation.incidenceAngle = parseInt(this.value);
    angleValue.textContent = `${simulation.incidenceAngle}°`;
    simulation.realIncidenceAngle = parseInt(this.value);
  });

  materialSelect.addEventListener("change", function () {
    simulation.material = this.value;
    updateCurrentMaterial();
  });

  exteriorSelect.addEventListener("change", function () {
    simulation.exteriorMedium = this.value;
    updateCurrentExteriorMedium();
  });

  // Botones de la grilla
  grid1mmBtn.addEventListener("click", function () {
    setGridSpacing(1);
  });

  grid5mmBtn.addEventListener("click", function () {
    setGridSpacing(5);
  });

  grid10mmBtn.addEventListener("click", function () {
    setGridSpacing(10);
  });


  resetBtn.addEventListener("click", function () {
    resetSimulation();
  });

  addDataBtn.addEventListener("click", function () {
    addMeasurement();
  });


  exportDataBtn.addEventListener("click", function () {
    exportData();
  });

}

function setGridSpacing(spacing) {
  simulation.gridSpacing = spacing;

  // Actualizar clases de los botones
  [grid1mmBtn, grid5mmBtn, grid10mmBtn].forEach((btn) => {
    btn.classList.remove("active");
  });

  if (spacing === 1) grid1mmBtn.classList.add("active");
  else if (spacing === 5) grid5mmBtn.classList.add("active");
  else if (spacing === 10) grid10mmBtn.classList.add("active");
}

function resetSimulation() {
  simulation = {
    material: "glass",
    exteriorMedium: "air",
    thickness: 5,
    incidenceAngle: 30,
    gridSpacing: 1,
    gridOffset: { x: 0, y: 0 },
    applyErrors: true,
    measurements: [],
    currentMaterial: MATERIALS.glass,
    currentExteriorMedium: EXTERIOR_MEDIUMS.air,
    realThickness: 5,
    realIncidenceAngle: 30,
  };

  // Restablecer controles de UI
  thicknessSlider.value = simulation.thickness;
  thicknessValue.textContent = `${simulation.thickness} mm`;

  angleSlider.value = simulation.incidenceAngle;
  angleValue.textContent = `${simulation.incidenceAngle}°`;

  materialSelect.value = simulation.material;
  exteriorSelect.value = simulation.exteriorMedium;

  setGridSpacing(1);

  // Limpiar tabla
  dataTable.innerHTML = "";
  const exitoEsc = document.getElementById('exito-esc');
  exitoEsc.innerHTML = "";

}

function drawSimulation() {
  const width = canvas.width;
  const height = canvas.height;

  // Limpiar canvas
  ctx.clearRect(0, 0, width, height);

  // Dibujar fondo
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.fillStyle = "oklch(12.9% 0.042 264.695)";
  } else {
    ctx.fillStyle = "oklch(0.96 0.0103 247.93)";
  }

  ctx.fillRect(0, 0, width, height);

  // Calcular escala y origen para la visualización
  const desiredXRange = 160; // -80 to 80 = 160 total width
  const scale = width / desiredXRange; // Adjust scale to fit desired range
  const originX = width / 2;
  const originY = height * 0.7; // Punto de origen más abajo para ver el láser mejor

  // Dibujar grilla
  drawGrid(originX, originY, scale);

  // Dibujar placa de material
  drawMaterialPlate(originX, originY, scale);

  // Dibujar láser
  drawLaser(originX, originY, scale);

  // Dibujar medidas y dimensiones
  drawMeasurements(originX, originY, scale);
}

function drawGrid(originX, originY, scale) {
  const width = canvas.width;
  const height = canvas.height;

  // Tamaño de paso en pixeles
  const stepSize = simulation.gridSpacing * scale;

  // Offset en pixeles
  const offsetX = simulation.gridOffset.x * scale;
  const offsetY = simulation.gridOffset.y * scale;

  // Dibujar líneas de la grilla
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.strokeStyle = "#474a56";
  } else {
    ctx.strokeStyle = "#cdd9e3";
  }

  ctx.lineWidth = 0.5;

  // Líneas verticales
  for (let x = offsetX; x < width; x += stepSize) {
    ctx.beginPath();
    ctx.moveTo(originX + x, 0);
    ctx.lineTo(originX + x, height);
    ctx.stroke();
  }

  for (let x = offsetX - stepSize; x > -width; x -= stepSize) {
    ctx.beginPath();
    ctx.moveTo(originX + x, 0);
    ctx.lineTo(originX + x, height);
    ctx.stroke();
  }

  // Líneas horizontales
  for (let y = offsetY; y < height; y += stepSize) {
    ctx.beginPath();
    ctx.moveTo(0, originY + y);
    ctx.lineTo(width, originY + y);
    ctx.stroke();
  }

  for (let y = offsetY - stepSize; y > -height; y -= stepSize) {
    ctx.beginPath();
    ctx.moveTo(0, originY + y);
    ctx.lineTo(width, originY + y);
    ctx.stroke();
  }

  // Dibujar ejes X e Y
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.strokeStyle = "white";
  } else {
    ctx.strokeStyle = "#000000";
  }

  ctx.lineWidth = 1.5;

  // Eje X
  ctx.beginPath();
  ctx.moveTo(0, originY);
  ctx.lineTo(width, originY);
  ctx.stroke();

  // Eje Y
  ctx.beginPath();
  ctx.moveTo(originX, 0);
  ctx.lineTo(originX, height);
  ctx.stroke();

  // Dibujar marcas de escala y etiquetas

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.fillStyle = "white";
  } else {
    ctx.fillStyle = "#000000";
  }

  ctx.font = "8px Arial";
  ctx.textAlign = "center";

  // Marcas en X
  for (let x = 0; x < width / 2; x += stepSize * 5) {
    // Marca positiva
    ctx.beginPath();
    ctx.moveTo(originX + x, originY - 5);
    ctx.lineTo(originX + x, originY + 5);
    ctx.stroke();

    if (x > 0) {
      ctx.fillText(`${Math.round(x / scale)}`, originX + x, originY + 20);
    }

    // Marca negativa
    if (x > 0) {
      ctx.beginPath();
      ctx.moveTo(originX - x, originY - 5);
      ctx.lineTo(originX - x, originY + 5);
      ctx.stroke();
      ctx.fillText(`-${Math.round(x / scale)}`, originX - x, originY + 20);
    }
  }

  // Marcas en Y
  for (let y = 0; y < height / 2; y += stepSize * 5) {
    // Marca positiva
    ctx.beginPath();
    ctx.moveTo(originX - 5, originY + y);
    ctx.lineTo(originX + 5, originY + y);
    ctx.stroke();

    if (y > 0) {
      ctx.fillText(`${Math.round(y / scale)}`, originX - 20, originY + y);
    }

    // Marca negativa
    if (y > 0) {
      ctx.beginPath();
      ctx.moveTo(originX - 5, originY - y);
      ctx.lineTo(originX + 5, originY - y);
      ctx.stroke();
      ctx.fillText(`-${Math.round(y / scale)}`, originX - 20, originY - y);
    }
  }

  // Etiquetar origen
  ctx.fillText("0", originX - 20, originY + 20);
}

function drawMaterialPlate(originX, originY, scale) {
  // Parámetros de la placa
  const plateWidth = 100 * scale; // Ancho fijo de 10 cm
  const plateThickness = simulation.realThickness * scale; // Convertir mm a escala
  const plateLeft = originX - plateWidth / 2;
  const plateTop = originY; // La placa comienza en Y=0

  
  // Dibujar la placa. Cambia de color según material. Gris circonio, rosa cuarzo, azul el resto
  if ((simulation.currentMaterial == MATERIALS.zirconium) || (simulation.currentMaterial == MATERIALS.diamond)){
    ctx.fillStyle = "rgba(243, 243, 243, 0.5)"; // Azul claro semitransparente
    ctx.strokeStyle = "rgba(243, 243, 243, 0.5)"; // Azul más oscuro
    ctx.lineWidth = 2;
  }

  else if (simulation.currentMaterial == MATERIALS.quartz) {
    ctx.fillStyle = "rgba(130, 112, 116, 0.8)"; // Azul claro semitransparente
    ctx.strokeStyle = "rgba(130, 112, 116, 0.8)"; // Azul más oscuro
    ctx.lineWidth = 2;
  }
    else {
    ctx.fillStyle = "rgba(135, 206, 250, 0.3)"; // Azul claro semitransparente
    ctx.strokeStyle = "rgba(70, 130, 180, 0.3)"; // Azul más oscuro
    ctx.lineWidth = 2;
  }
  
  ctx.beginPath();
  ctx.rect(plateLeft, plateTop, plateWidth, plateThickness);
  ctx.fill();
  ctx.stroke();

  // Etiqueta con el material
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    ctx.fillStyle = "rgba(70, 130, 180, 1)";
  } else {
    ctx.fillStyle = "#020617";
  }
  
  ctx.font = "17px Arial";
  ctx.textAlign = "center";

  let materialName;
  if (simulation.material === "unknown") {
    materialName = "Material desconocido";
  } else {
    materialName = simulation.currentMaterial.name;
  }

  // Etiqueta con el medio exterior
  ctx.fillText(
    simulation.currentExteriorMedium.name,
    originX - 160,
    plateTop - 70
  );

  // Etiqueta con el medio exterior
  ctx.fillText(
    simulation.currentExteriorMedium.name,
    originX - 160,
    plateTop + 120
  );

  //Etiqueta con el material de la placa
  ctx.fillStyle = "white";
  ctx.fillText(materialName, originX - 160, plateTop + 45);
}

function drawLaser(originX, originY, scale) {
  // Punto de incidencia del láser
  const incidenceX = originX;
  const incidenceY = originY;

  // Convertir ángulo a radianes (ajustando para que 0° sea vertical y crezca hacia la derecha)
  const angleRad = ((90 - simulation.realIncidenceAngle) * Math.PI) / 180;

  // Color del láser según la longitud de onda
  const laserColor = 'rgb(0, 162, 255)';

  // Dibujar rayo incidente
  const incidentLength = 150 * scale;
  const incidentEndX = incidenceX + incidentLength * Math.cos(angleRad);
  const incidentEndY = incidenceY - incidentLength * Math.sin(angleRad);

  ctx.strokeStyle = laserColor;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(incidenceX, incidenceY);
  ctx.lineTo(incidentEndX, incidentEndY);
  ctx.stroke();

  // Calcular ángulos de reflexión y refracción
  const n1 = simulation.currentExteriorMedium.refractiveIndex;
  const n2 = simulation.currentMaterial.refractiveIndex;

  // Ángulo de incidencia desde la normal
  const incidenceFromNormal = (simulation.realIncidenceAngle * Math.PI) / 180;

  // Ángulo de reflexión (igual al de incidencia)
  const reflectionAngle = (Math.PI/2)-incidenceFromNormal;

  // Ángulo de refracción usando la ley de Snell
  let refractionAngle;
  const sinRefraction = (n1 / n2) * Math.sin(incidenceFromNormal);

  // Comprobar si hay reflexión total interna
  if (sinRefraction > 1) {
    // Reflexión total interna
    refractionAngle = Math.PI / 2; // 90 grados
  } else {
    refractionAngle = Math.asin(sinRefraction);
  }

  // Dibujar rayo reflejado
  const reflectionRad = Math.PI - angleRad; // Reflejo del ángulo incidente
  const reflectedLength = 100 * scale;
  const reflectedEndX = incidenceX + reflectedLength * Math.cos(reflectionRad);
  const reflectedEndY = incidenceY - reflectedLength * Math.sin(reflectionRad);

  ctx.beginPath();
  ctx.setLineDash([]); // Línea discontinua para el rayo reflejado
  ctx.moveTo(incidenceX, incidenceY);
  ctx.lineTo(reflectedEndX, reflectedEndY);
  ctx.stroke();
  ctx.setLineDash([]); // Restaurar línea continua

  // Dibujar rayo refractado

  // Calcular punto de salida del material
  const plateThickness = simulation.realThickness * scale;
  const refractedInMaterialLength = plateThickness / Math.cos(refractionAngle);
  const exitX =
    incidenceX + refractedInMaterialLength * Math.sin(refractionAngle);
  const exitY = incidenceY + plateThickness; // Punto de salida en la parte inferior de la placa

  // Rayo dentro del material
  ctx.strokeStyle = adjustColorIntensity(laserColor, 0.7);
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(incidenceX, incidenceY);
  ctx.lineTo(exitX, exitY);
  ctx.stroke();

  // Rayo al salir del material (segunda refracción)
  // Al salir, el rayo vuelve al ángulo original
  const refractedOutLength = 100 * scale;
  const refractedOutEndX =
    exitX + refractedOutLength * Math.sin(incidenceFromNormal);
  const refractedOutEndY =
    exitY + refractedOutLength * Math.cos(incidenceFromNormal);

  ctx.strokeStyle = laserColor;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(exitX, exitY);
  ctx.lineTo(refractedOutEndX, refractedOutEndY);
  ctx.stroke();

  // Dibujar ángulos
  drawAngle(
    incidenceX, incidenceY,
    Math.PI+angleRad,
    -Math.PI/2,
    30,"α","#52bfa0"
  );
  drawAngle(incidenceX, incidenceY, 
    -Math.PI / 2, 
    -reflectionAngle, 
    30, "β", "#e57f71");

  // Guardar los ángulos calculados para uso en mediciones
  simulation.calculatedAngles = {
    incidence: simulation.realIncidenceAngle,
    reflection: simulation.realIncidenceAngle, // Mismo valor
    refraction: (refractionAngle * 180) / Math.PI,
  };
}

function drawAngle(x, y, angle1, angle2, radius, label, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;

  // Dibujar arco
  ctx.beginPath();
  ctx.arc(x, y, radius,angle1,angle2);
  ctx.stroke();

}

function drawMeasurements(originX, originY, scale) {
  const plateThickness = simulation.realThickness * scale;
  const plateWidth = 100 * scale;
  const plateLeft = originX - plateWidth / 2;
  const plateRight = originX + plateWidth / 2;
  const plateTop = originY; // Ajustado a Y=0
  const plateBottom = originY + plateThickness; // Parte inferior de la placa

  // Dibujar indicador de espesor
  ctx.strokeStyle = "#e74c3c";
  ctx.fillStyle = "#e74c3c";
  ctx.lineWidth = 1;

  // Línea de dimensión
  const dimX = plateRight + 30;

  ctx.beginPath();
  ctx.moveTo(dimX, originY);
  ctx.lineTo(dimX, plateBottom);
  ctx.stroke();

  // Flechas
  drawArrow(dimX, originY, dimX, plateBottom);
  drawArrow(dimX, plateBottom, dimX, originY);

  // Etiqueta de espesor
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    `${simulation.thickness} mm`,
    dimX + 30,
    originY + plateThickness / 2
  );

  // Información del láser
  ctx.fillStyle = "#f19300";
  ctx.textAlign = "left";
  ctx.font = "14px Arial";

  const infoX = 20;
  const infoY = 15;
  const lineHeight = 20;

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.fillStyle = "white";
  } else {
    ctx.fillStyle = "#020617";
  }
  ctx.fillText(
    `Ángulo de incidencia: ${simulation.incidenceAngle}°`,
    infoX,
    infoY + lineHeight
  );

  if (simulation.material !== "unknown") {
    ctx.fillText(
      `Índice de refracción: ${simulation.currentMaterial.refractiveIndex.toFixed(
        2
      )}`,
      infoX,
      infoY + lineHeight * 2
    );
  }

  // Mostrar ángulos en la interfaz
  ctx.textAlign = "right";
  const anglesX = canvas.width - 20;

  ctx.fillStyle = "#52bfa0";
  ctx.fillText(
    `α (incidencia): ${simulation.calculatedAngles.incidence.toFixed(1)}°`,
    anglesX,
    infoY+20
  );

  ctx.fillStyle = "#e57f71";
  ctx.fillText(
    `β (reflexión): ${simulation.calculatedAngles.reflection.toFixed(1)}°`,
    anglesX,
    infoY + lineHeight + 15
  );
}

function drawArrow(fromX, fromY, toX, toY) {
  const headLength = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

// Variables a usar en algoritmo de Box-Muller
let resto;
let sobra = false;

function boxmuller(real, cant_error) {
  // pasar de porcentaje a decimal
  cant_error = real * (cant_error / 100);

  if (sobra) {
    sobra = false;
    return resto * cant_error + real;
  }

  // valores aleatorios entre [0, 1). u1 con let para poder modificarlo si es 0
  let u1 = Math.random();
  const u2 = Math.random();

  if (u1 === 0) {
    u1 = Number.MIN_VALUE;
  }

  const R = Math.sqrt(-2.0 * Math.log(u1));
  const theta = 2.0 * Math.PI * u2;

  const z0 = R * Math.cos(theta);
  const z1 = R * Math.sin(theta);

  // guardo z1 para poder usarlo en la siguiente iteración sin que ejecute el bloque completo
  sobra = true;
  resto = z1;

  return z0 * cant_error + real;
}

function addMeasurement() {
  const userRefractionAngle = prompt(
    "Ingrese el ángulo de refracción medido usando '.' para decimales",
    ""
  );
  if (userRefractionAngle === null || userRefractionAngle === "") {
    return;
  }

  if ((userRefractionAngle <=0 || userRefractionAngle > 90) || (isNaN(userRefractionAngle))) {
    alert(
      "Por favor, ingrese un valor numérico válido para el ángulo de refracción."
    );
    return;
  }

  const refractionAngle = parseFloat(userRefractionAngle);

  // Calcular el índice de refracción experimental usando la ley de Snell
  const incidenceAngleRad = (simulation.calculatedAngles.incidence * Math.PI) / 180;
  const refractionAngleRad = (refractionAngle * Math.PI) / 180;
  const experimentalRI = (simulation.currentExteriorMedium.refractiveIndex * Math.sin(incidenceAngleRad)) / Math.sin(refractionAngleRad);
  
  let IR_error;
  if (hayEscenario) {
    IR_error = boxmuller(experimentalRI, simulation.error).toFixed(3);
  }
  else {
    IR_error = boxmuller(experimentalRI, 0.1).toFixed(3);
  }

  const measurement = {
    number: simulation.measurements.length + 1,
    thickness: simulation.thickness,
    material: simulation.material === "unknown" ? "Desconocido" : simulation.currentMaterial.name,
    exteriorMedium: simulation.currentExteriorMedium.name,
    refractiveIndex: simulation.material === "unknown" ? "?": simulation.currentMaterial.refractiveIndex.toFixed(2),
    incidenceAngle: simulation.calculatedAngles.incidence.toFixed(2),
    refractionAngle: refractionAngle.toFixed(2),
    experimentalRI: IR_error,
  };

  simulation.measurements.push(measurement);

  // Agregar a la tabla
  const row = dataTable.insertRow();
  row.className = "bg-utn-light text-slate-950 dark:bg-slate-950 dark:text-white items-center text-center pt-4";

  const cellNum = row.insertCell(0);
  cellNum.textContent = measurement.number;
  cellNum.className = "py-2";

  const cellThickness = row.insertCell(1);
  cellThickness.textContent = measurement.thickness;

  const cellMaterial = row.insertCell(2);
  cellMaterial.textContent = measurement.material;

  const cellRI = row.insertCell(3);
  cellRI.textContent = measurement.refractiveIndex;

  const cellIncidence = row.insertCell(4);
  cellIncidence.textContent = measurement.incidenceAngle;

  const cellRefraction = row.insertCell(5);
  cellRefraction.textContent = measurement.refractionAngle;

  const cellExpRI = row.insertCell(6);
  cellExpRI.textContent = measurement.experimentalRI;
}

function importarJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data[0]!="reflexion"){
          alert("El escenario subido no corresponde a este simulador.")
        }
        else{
          setearEscenario(data);
        }

      } catch (err) {
        alert("Error al leer el archivo JSON");
      }
    };

    reader.readAsText(file);
  }

function setearEscenario(data) {
  hayEscenario = true;
  // Cargar los valores del escenario como array en cada variable de la simulación actual
  simulation.error = parseFloat(data[1]);
  simulation.material = data[2];
  simulation.exteriorMedium = data[3];
  simulation.thickness = parseFloat(data[4]);
  simulation.realIncidenceAngle = parseInt(data[5]);

  // Cambiar los valores visuales de los selectores en el contenedor con los recibidos
  thicknessSlider.value = simulation.thickness;
  thicknessValue.textContent = `${simulation.thickness} mm`;
  angleSlider.value = simulation.realIncidenceAngle;
  angleValue.textContent = `${simulation.realIncidenceAngle}°`;
  materialSelect.value = simulation.material;
  exteriorSelect.value = simulation.exteriorMedium;

  updateCurrentMaterial();
  updateCurrentExteriorMedium();
  inhabInput();
}

function inhabInput() {
  thicknessSlider.disabled = true;
  angleSlider.disabled = true;
  materialSelect.disabled = true;
  exteriorSelect.disabled = true;

  const exitoEsc = document.getElementById('exito-esc');
  exitoEsc.className = 'text-center text-green-400 italic mt-4';
  exitoEsc.textContent = 'Escenario cargado con éxito.';
}

function exportData() {
  if (simulation.measurements.length === 0) {
    alert("Aún no hay datos para exportar");
    return;
  }

  let text = "DATOS DE SIMULACIÓN DE REFRACCIÓN Y REFLEXIÓN\n";
  text += "------------------------------------------------\n\n";
  text += `Fecha: ${new Date().toLocaleDateString()}\n`;
  text += "Grupo de Investigación GIEDI\n";
  text += "Facultad Regional Santa Fe, Universidad Tecnológica Nacional\n\n";

  text += "PARÁMETROS DE SIMULACIÓN:\n";
  text += `Material: ${
    simulation.material === "unknown"
      ? "Desconocido"
      : simulation.currentMaterial.name
  }\n`;
  text += `Espesor: ${simulation.thickness} mm\n`;
  text += `Medio Exterior: ${simulation.currentExteriorMedium.name}\n`;

  text += "MEDICIONES:\n";
  text +=
    "N°\tEspesor(mm)\tMaterial\tIR\tMedio ext.\tÁng. inc.\tÁng. ref.\tIR Exp.\n";
  text +=
    "---------------------------------------------------------------------------------------------------------------\n";

  simulation.measurements.forEach((m) => {
    text += `${m.number}\t\t${m.thickness}\t${m.material}\t\t${m.refractiveIndex}\t${m.exteriorMedium}\t\t${m.incidenceAngle}\t\t${m.refractionAngle}\t\t${m.experimentalRI}\n`;
  });

  // Crear y descargar archivo
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "datos_sim_optica.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function adjustColorIntensity(rgbColor, factor) {
  // Extraer valores RGB
  const rgb = rgbColor.match(/\d+/g).map(Number);

  // Ajustar intensidad
  const adjustedRgb = rgb.map((value) => Math.floor(value * factor));

  return `rgb(${adjustedRgb[0]}, ${adjustedRgb[1]}, ${adjustedRgb[2]})`;
}

// Iniciar la simulación cuando la página esté cargada
window.addEventListener("load", initSimulation);