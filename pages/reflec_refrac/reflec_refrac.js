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

const ADMIN_PASSWORD = "GIEDI610";

// Estado de la simulación
let simulation = {
  material: "glass",
  exteriorMedium: "air",
  thickness: 5,
  wavelength: 650,
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

// Referencias de elementos DOM
const thicknessSlider = document.getElementById("thickness");
const thicknessValue = document.getElementById("thickness-value");
const wavelengthSlider = document.getElementById("wavelength");
const wavelengthValue = document.getElementById("wavelength-value");
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
const adminBtn = document.getElementById("admin-button");
const resetBtn = document.getElementById("reset-simulation");
const addDataBtn = document.getElementById("add-data");
const calculateStatsBtn = document.getElementById("calculate-stats");
const exportDataBtn = document.getElementById("export-data");

// Modales
const statsModal = document.getElementById("stats-modal");
const adminModal = document.getElementById("admin-modal");
const closeModalBtns = document.querySelectorAll(".close-modal");
const adminLoginBtn = document.getElementById("admin-login-btn");
const adminPassword = document.getElementById("admin-password");
const adminPanel = document.getElementById("admin-panel");
const realValues = document.getElementById("real-values");

// Inicializar la simulación
function initSimulation() {
  // Establecer el tamaño del canvas al tamaño del contenedor
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Seleccionar material inicial y medio exterior
  updateCurrentMaterial();
  updateCurrentExteriorMedium();

  // Aplicar errores iniciales
  applySimulationErrors();

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
  //Si se selecciona desconocido, generar semilla rand para elegir del array
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

//Errores puestos por defecto
function applySimulationErrors() {
  const generateError = (value) => {
    const stdDev = value * 0.009; // 0.9% de error típico
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return value * (1 + (z * stdDev) / value);
  };

  simulation.realThickness = generateError(simulation.thickness);
  simulation.realIncidenceAngle = generateError(simulation.incidenceAngle);
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
    applySimulationErrors();
  });

  wavelengthSlider.addEventListener("input", function () {
    simulation.wavelength = parseInt(this.value);
    wavelengthValue.textContent = `${simulation.wavelength} nm`;
    // El color del láser cambiará en la función de dibujo
  });

  angleSlider.addEventListener("input", function () {
    simulation.incidenceAngle = parseInt(this.value);
    angleValue.textContent = `${simulation.incidenceAngle}°`;
    applySimulationErrors();
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

    // Botones de administración y gestión de datos
  adminBtn.addEventListener('click', function() {
    adminModal.className=adminModal.className.replace('hidden','block');
    adminPassword.value = '';
  });
  
  adminLoginBtn.addEventListener('click', function() {
     if (adminPassword.value === ADMIN_PASSWORD) {
      adminPanel.className=adminPanel.className.replace('hidden','block');
      updateAdminPanel();
     } else {
        alert('Contraseña incorrecta');
      }
  });

  resetBtn.addEventListener("click", function () {
    resetSimulation();
  });

  addDataBtn.addEventListener("click", function () {
    addMeasurement();
  });

  calculateStatsBtn.addEventListener("click", function () {
    if (simulation.measurements.length < 3) {
      alert("Se necesitan al menos 3 mediciones para calcular estadísticas");
      return;
    }
    showStatistics();
  });

  exportDataBtn.addEventListener("click", function () {
    exportData();
  });

  // Cerrar modales
  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      statsModal.style.display = "none";
      adminModal.style.display = "none";
    });
  });

  // Cerrar modales al hacer clic fuera
  window.addEventListener("click", function (e) {
    if (e.target === statsModal) {
      statsModal.style.display = "none";
    }
    if (e.target === adminModal) {
      adminModal.className=adminModal.className.replace('block','hidden');
      adminModal.style.display = "none";
    }
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
    wavelength: 650,
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

  wavelengthSlider.value = simulation.wavelength;
  wavelengthValue.textContent = `${simulation.wavelength} nm`;

  angleSlider.value = simulation.incidenceAngle;
  angleValue.textContent = `${simulation.incidenceAngle}°`;

  materialSelect.value = simulation.material;
  exteriorSelect.value = simulation.exteriorMedium;

  setGridSpacing(1);

  // Limpiar tabla
  dataTable.innerHTML = "";
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
  const plateRight = originX + plateWidth / 2;
  const plateTop = originY; // La placa comienza en Y=0

  
  // Dibujar la placa. Cambia de color según material. Gris circonio, rosa cuarzo, azul el resto
  if (simulation.currentMaterial == MATERIALS.zirconium){
    ctx.fillStyle = "rgba(243, 243, 243, 0.8)"; // Azul claro semitransparente
    ctx.strokeStyle = "rgba(243, 243, 243, 0.8)"; // Azul más oscuro
    ctx.lineWidth = 2;
  }
  else if (simulation.currentMaterial == MATERIALS.diamond) {
    ctx.fillStyle = "rgba(243, 243, 243, 0.8)"; // Azul claro semitransparente
    ctx.strokeStyle = "rgba(243, 243, 243, 0.8)"; // Azul más oscuro
    ctx.lineWidth = 2;
  }
  else if (simulation.currentMaterial == MATERIALS.quartz) {
    ctx.fillStyle = "rgba(130, 112, 116, 0.5)"; // Azul claro semitransparente
    ctx.strokeStyle = "rgba(130, 112, 116, 0.5)"; // Azul más oscuro
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
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.fillStyle = "white";
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
  ctx.fillStyle = "rgba(70, 130, 180, 1)";
  ctx.fillText(materialName, originX - 160, plateTop + 45);
}

function drawLaser(originX, originY, scale) {
  // Punto de incidencia del láser
  const incidenceX = originX;
  const incidenceY = originY;

  // Convertir ángulo a radianes (ajustando para que 0° sea vertical y crezca hacia la derecha)
  const angleRad = ((90 - simulation.realIncidenceAngle) * Math.PI) / 180;

  // Color del láser según la longitud de onda
  const laserColor = wavelengthToColor(simulation.wavelength);

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

function addMeasurement() {
  // Prompt the user to input the refraction angle
  const userRefractionAngle = prompt(
    "Ingrese el ángulo de refracción medido:",
    ""
  );

  // Validate input - if canceled or not a number, return
  if (userRefractionAngle === null || isNaN(parseFloat(userRefractionAngle)) || userRefractionAngle <=0 || userRefractionAngle > 90) {
    alert(
      "Por favor, ingrese un valor numérico válido para el ángulo de refracción."
    );
    return;
  }


  // Parse the user input value
  const refractionAngle = parseFloat(userRefractionAngle);

  // Calcular el índice de refracción experimental usando la ley de Snell
  const incidenceAngleRad =
    (simulation.calculatedAngles.incidence * Math.PI) / 180;
  const refractionAngleRad = (refractionAngle * Math.PI) / 180;
  const experimentalRI =
    (simulation.currentExteriorMedium.refractiveIndex *
      Math.sin(incidenceAngleRad)) /
    Math.sin(refractionAngleRad);

  const measurement = {
    number: simulation.measurements.length + 1,
    thickness: simulation.thickness,
    material:
      simulation.material === "unknown"
        ? "Desconocido"
        : simulation.currentMaterial.name,
    exteriorMedium: simulation.currentExteriorMedium.name,
    refractiveIndex:
      simulation.material === "unknown"
        ? "?"
        : simulation.currentMaterial.refractiveIndex.toFixed(2),
    incidenceAngle: simulation.calculatedAngles.incidence.toFixed(1),
    refractionAngle: refractionAngle.toFixed(1),
    experimentalRI: experimentalRI.toFixed(3),
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

function showStatistics() {
  statsModal.style.display = "block";

  // Obtener datos
  const refractionAngles = simulation.measurements.map((m) =>
    parseFloat(m.refractionAngle)
  );
  const experimentalRIs = simulation.measurements.map((m) =>
    parseFloat(m.experimentalRI)
  );
  const incidenceAngles = simulation.measurements.map((m) =>
    parseFloat(m.incidenceAngle)
  );

  // Histograma de ángulos de refracción
  const histogramCtx = document
    .getElementById("histogram-chart")
    .getContext("2d");
  if (window.histogramChart) window.histogramChart.destroy();

  // Calculate better bin boundaries for histogram
  const minAngle = Math.min(...refractionAngles);
  const maxAngle = Math.max(...refractionAngles);
  const range = maxAngle - minAngle;
  const binWidth = range / 5 || 1; // Prevent division by zero

  const histogramLabels = [];
  const histogramData = Array(5).fill(0);

  // Create proper bins
  for (let i = 0; i < 5; i++) {
    const binStart = minAngle + i * binWidth;
    const binEnd = minAngle + (i + 1) * binWidth;
    histogramLabels.push(`${binStart.toFixed(1)}°-${binEnd.toFixed(1)}°`);
  }

  // Count values in each bin
  refractionAngles.forEach((angle) => {
    if (angle < minAngle || angle > maxAngle) return;
    const binIndex = Math.min(Math.floor((angle - minAngle) / binWidth), 4);
    histogramData[binIndex]++;
  });

  window.histogramChart = new Chart(histogramCtx, {
    type: "bar",
    data: {
      labels: histogramLabels,
      datasets: [
        {
          label: "Distribución de Ángulos de Refracción",
          data: histogramData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Frecuencia",
          },
        },
        x: {
          title: {
            display: true,
            text: "Ángulo de Refracción (grados)",
          },
        },
      },
    },
  });

  // Gráfico de dispersión con línea de tendencia
  const scatterCtx = document.getElementById("scatter-chart").getContext("2d");
  if (window.scatterChart) window.scatterChart.destroy();

  // Prepare scatter data
  const scatterData = incidenceAngles.map((angle, i) => ({
    x: angle,
    y: refractionAngles[i],
  }));

  // Calculate regression line (y = mx + b)
  const n = incidenceAngles.length;
  const sumX = incidenceAngles.reduce((acc, val) => acc + val, 0);
  const sumY = refractionAngles.reduce((acc, val) => acc + val, 0);
  const sumXY = incidenceAngles.reduce(
    (acc, val, i) => acc + val * refractionAngles[i],
    0
  );
  const sumXX = incidenceAngles.reduce((acc, val) => acc + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n || 0;

  // Create regression line data points
  const minX = Math.min(...incidenceAngles);
  const maxX = Math.max(...incidenceAngles);
  const regressionData = [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];

  window.scatterChart = new Chart(scatterCtx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Ángulo de Incidencia vs Refracción",
          data: scatterData,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          pointRadius: 6,
        },
        {
          label: "Línea de Tendencia",
          data: regressionData,
          type: "line",
          fill: false,
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Ángulo de Incidencia (grados)",
          },
        },
        y: {
          title: {
            display: true,
            text: "Ángulo de Refracción (grados)",
          },
        },
      },
    },
  });

  // Mejorar el gráfico de índice de refracción experimental
  const boxplotCtx = document.getElementById("boxplot-chart").getContext("2d");
  if (window.boxplotChart) window.boxplotChart.destroy();

  // Calcular estadísticas para el diagrama de cajas
  const sortedRIs = [...experimentalRIs].sort((a, b) => a - b);
  const min = sortedRIs[0];
  const max = sortedRIs[sortedRIs.length - 1];
  const q1 = percentile(sortedRIs, 25);
  const median = percentile(sortedRIs, 50);
  const q3 = percentile(sortedRIs, 75);
  const mean = sortedRIs.reduce((acc, val) => acc + val, 0) / sortedRIs.length;

  // Calculate standard deviation
  const variance =
    sortedRIs.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
    sortedRIs.length;
  const stdDev = Math.sqrt(variance);

  // Create better visualization for the index of refraction
  window.boxplotChart = new Chart(boxplotCtx, {
    type: "bar",
    data: {
      labels: ["Índice de Refracción Experimental"],
      datasets: [
        {
          label: "Valor",
          data: [mean],
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          barPercentage: 0.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return [
                `Media: ${mean.toFixed(3)}`,
                `Mediana: ${median.toFixed(3)}`,
                `Desv. Estándar: ${stdDev.toFixed(3)}`,
                `Q1: ${q1.toFixed(3)}`,
                `Q3: ${q3.toFixed(3)}`,
                `Mín: ${min.toFixed(3)}`,
                `Máx: ${max.toFixed(3)}`,
              ];
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: Math.max(0, min - 0.2),
          max: max + 0.2,
          title: {
            display: true,
            text: "Valor del Índice",
          },
        },
        x: {
          title: {
            display: true,
            text: "Estadísticas",
          },
        },
      },
    },
  });

  // Add error bars and additional annotations
  const errorPlugin = {
    id: "errorBar",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      ctx.save();

      // Draw error bars
      const meta = chart.getDatasetMeta(0);
      const x = meta.data[0].x;
      const y = meta.data[0].y;
      const width = meta.data[0].width;

      // Draw min-max line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 1;
      ctx.moveTo(x, chart.scales.y.getPixelForValue(min));
      ctx.lineTo(x, chart.scales.y.getPixelForValue(max));
      ctx.stroke();

      // Draw quartile box
      ctx.beginPath();
      ctx.fillStyle = "rgba(54, 162, 235, 0.3)";
      ctx.strokeStyle = "rgba(54, 162, 235, 0.8)";
      ctx.lineWidth = 1;
      const q1Y = chart.scales.y.getPixelForValue(q1);
      const q3Y = chart.scales.y.getPixelForValue(q3);
      ctx.rect(x - width / 3, q1Y, (width * 2) / 3, q3Y - q1Y);
      ctx.fill();
      ctx.stroke();

      // Draw median line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 99, 132, 1)";
      ctx.lineWidth = 2;
      const medianY = chart.scales.y.getPixelForValue(median);
      ctx.moveTo(x - width / 3, medianY);
      ctx.lineTo(x + width / 3, medianY);
      ctx.stroke();

      ctx.restore();
    },
  };

  Chart.register(errorPlugin);
}

function updateAdminPanel() {
  // Mostrar valores reales en el panel de administrador
  let html = '<table class="admin-table">';
  html +=
    "<tr><th>Parámetro</th><th>Valor Real</th><th>Valor Mostrado</th></tr>";

  html += `<tr>
        <td>Espesor</td>
        <td>${simulation.realThickness.toFixed(3)} mm</td>
        <td>${simulation.thickness} mm</td>
    </tr>`;

  html += `<tr>
        <td>Ángulo de Incidencia</td>
        <td>${simulation.realIncidenceAngle.toFixed(3)}°</td>
        <td>${simulation.incidenceAngle}°</td>
    </tr>`;

  html += `<tr>
        <td>Material</td>
        <td>${simulation.currentMaterial.name}</td>
        <td>${
          simulation.material === "unknown"
            ? "Desconocido"
            : simulation.currentMaterial.name
        }</td>
    </tr>`;

  html += `<tr>
        <td>Índice de Refracción (material)</td>
        <td>${simulation.currentMaterial.refractiveIndex.toFixed(4)}</td>
        <td>${
          simulation.material === "unknown"
            ? "?"
            : simulation.currentMaterial.refractiveIndex.toFixed(2)
        }</td>
    </tr>`;

  html += `<tr>
        <td>Medio Exterior</td>
        <td>${simulation.currentExteriorMedium.name}</td>
        <td>${simulation.currentExteriorMedium.name}</td>
    </tr>`;

  html += `<tr>
        <td>Índice de Refracción (exterior)</td>
        <td>${simulation.currentExteriorMedium.refractiveIndex.toFixed(4)}</td>
        <td>${simulation.currentExteriorMedium.refractiveIndex.toFixed(4)}</td>
    </tr>`;

  // Añadir información de errores si están activados
  if (simulation.applyErrors) {
    const thicknessError = (
      ((simulation.realThickness - simulation.thickness) /
        simulation.thickness) *
      100
    ).toFixed(3);
    const angleError = (
      ((simulation.realIncidenceAngle - simulation.incidenceAngle) /
        simulation.incidenceAngle) *
      100
    ).toFixed(3);

    html += `<tr>
            <td>Error en Espesor</td>
            <td colspan="2">${thicknessError}%</td>
        </tr>`;

    html += `<tr>
            <td>Error en Ángulo</td>
            <td colspan="2">${angleError}%</td>
        </tr>`;
  }

  html += "</table>";

  // Lista de todas las mediciones
  if (simulation.measurements.length > 0) {
    html += "<h3>Historial de Mediciones</h3>";
    html += '<table class="admin-table">';
    html +=
      "<tr><th>N°</th><th>Material Real</th><th>IR Real</th><th>IR Experimental</th><th>Error (%)</th></tr>";

    simulation.measurements.forEach((m, i) => {
      const realRI = simulation.currentMaterial.refractiveIndex;
      const expRI = parseFloat(m.experimentalRI);
      const errorRI = (((expRI - realRI) / realRI) * 100).toFixed(2);

      html += `<tr>
                <td>${i + 1}</td>
                <td>${simulation.currentMaterial.name}</td>
                <td>${realRI.toFixed(4)}</td>
                <td>${expRI.toFixed(4)}</td>
                <td>${errorRI}%</td>
            </tr>`;
    });

    html += "</table>";
  }

  realValues.innerHTML = html;
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

// Funciones auxiliares

function wavelengthToColor(wavelength) {
  let r, g, b;
    r = 0;
    g = 0.5;
    b = 1;

  // Intensidad
  let factor;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
  } else if (wavelength >= 420 && wavelength < 700) {
    factor = 1.0;
  } else if (wavelength >= 700 && wavelength <= 750) {
    factor = 0.3 + (0.7 * (750 - wavelength)) / (750 - 700);
  } else {
    factor = 0.3;
  }

  r = Math.floor(255 * Math.pow(r * factor, 0.8));
  g = Math.floor(255 * Math.pow(g * factor, 0.8));
  b = Math.floor(255 * Math.pow(b * factor, 0.8));

  return `rgb(${r}, ${g}, ${b})`;
}

function adjustColorIntensity(rgbColor, factor) {
  // Extraer valores RGB
  const rgb = rgbColor.match(/\d+/g).map(Number);

  // Ajustar intensidad
  const adjustedRgb = rgb.map((value) => Math.floor(value * factor));

  return `rgb(${adjustedRgb[0]}, ${adjustedRgb[1]}, ${adjustedRgb[2]})`;
}

function percentile(data, p) {
  const sortedData = [...data].sort((a, b) => a - b);
  if (sortedData.length === 0) return 0;

  const index = ((sortedData.length - 1) * p) / 100;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sortedData[lower];

  const weight = index - lower;
  return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
}

// Iniciar la simulación cuando la página esté cargada
window.addEventListener("load", initSimulation);