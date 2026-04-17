// materiales de placa
const MATERIALES = {
  vidrio: { name: "Vidrio", indice_refrac: 1.52 },
  acrilico: { name: "Acrílico", indice_refrac: 1.49 },
  cuarzo: { name: "Cuarzo", indice_refrac: 1.46 },
  diamante: { name: "Diamante", indice_refrac: 2.42 },
  hielo: { name: "Hielo", indice_refrac: 1.31 },
  circonio: { name: "Circonio", indice_refrac: 2.15 },

  // adicionales para la selección aleatoria
  safiro: { name: "Zafiro", indice_refrac: 1.77 },
  rubi: { name: "Rubí", indice_refrac: 1.76 },
  amber: { name: "Ámbar", indice_refrac: 1.55 },
  esmeralda: { name: "Esmeralda", indice_refrac: 1.57 },
  plastico: { name: "Plástico", indice_refrac: 1.46 },
  agua: { name: "Agua", indice_refrac: 1.33 },
};

// medios exteriores
const EXTERIOR_MEDIUMS = {
  vacio: { name: "Vacío", indice_refrac: 1.0 },
  aire: { name: "Aire", indice_refrac: 1.0003 },
  metanol: { name: "Metanol", indice_refrac: 1.329 },
  agua: { name: "Agua", indice_refrac: 1.333 },
  acetaldeido: { name: "Acetaldeído", indice_refrac: 1.372 },
  sugarSolution30: { name: "Solución de azúcar 30%", indice_refrac: 1.38 },
  sugarSolution80: { name: "Solución de azúcar 80%", indice_refrac: 1.49 },
  heptanol: { name: "Heptanol (25°C)", indice_refrac: 1.423 },
  glicerina: { name: "Glicerina", indice_refrac: 1.473 },
  benceno: { name: "Benceno", indice_refrac: 1.501 },
};

// estado de la simulación
let simulacion = {
  error: 0,
  material: "vidrio",
  medio_exterior: "aire",
  ancho_placa: 5,
  angulo_incidencia: 30,
  espacio_grilla: 10,
  gridOffset: { x: 0, y: 0 },
  medidas: [],
  material_actual: "vidrio",
  medio_actual: "aire",
};

// inicialización del canvas
const canvas = document.getElementById("simulacion-canvas");
const ctx = canvas.getContext("2d");
let animationFrameId = null;
let hayEscenario = false;

// referencias del DOM
const ancho_placaSlider = document.getElementById("ancho_placa_value");
const angleSlider = document.getElementById("angle_value");
const MATERIALESSelect = document.getElementById("material");
const exteriorSelect = document.getElementById("exterior");
const datos_tabla = document
  .getElementById("data-table")
  .getElementsByTagName("tbody")[0];

// botones
const grid1mmBtn = document.getElementById("grid-1mm");
const grid5mmBtn = document.getElementById("grid-5mm");
const grid10mmBtn = document.getElementById("grid-10mm");

const boton_reset = document.getElementById("boton_reset");
const agregar_data_btn = document.getElementById("add-data");
const exportar_txt_btn = document.getElementById("export-txt");
const exportar_csv_btn = document.getElementById("export-csv");

// simulación: inicio, render, redimensionado, reinicio
function iniciar_simulacion() {
  redim_canvas();
  window.addEventListener("resize", redim_canvas);

  actualizar_material();
  actualizar_medio_ext();

  // iniciar el bucle de renderizado
  iniciar_render_loop();
  setupEventListeners();
}

function iniciar_render_loop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  const render = () => {
    dibujar_sim();
    animationFrameId = requestAnimationFrame(render);
  };

  render();
}

function redim_canvas() {
  const vista_simulacion = document.querySelector(".simulation-view");
  canvas.width = vista_simulacion.clientWidth;
  canvas.height = vista_simulacion.clientHeight;

  generar_transportador();
}

function reset_sim() {
  simulacion = {
    error: 0,
    material: "vidrio",
    medio_exterior: "aire",
    ancho_placa: 5,
    angulo_incidencia: 30,
    espacio_grilla: 10,
    gridOffset: { x: 0, y: 0 },
    medidas: [],
    material_actual: MATERIALES.vidrio,
    medio_actual: EXTERIOR_MEDIUMS.aire,
  };

  // esto se usa para restablecer los controles de UI
  ancho_placaSlider.value = simulacion.ancho_placa;
  angleSlider.value = simulacion.angulo_incidencia;

  MATERIALESSelect.value = simulacion.material;
  exteriorSelect.value = simulacion.medio_exterior;

  set_grilla(10);

  // limpiar tabla
  datos_tabla.innerHTML = "";
  const exitoEsc = document.getElementById("exito-esc");
  if (exitoEsc) {
    exitoEsc.innerHTML = "";
  }

  hayEscenario = false;
}

// canvas: dibujo
function set_grilla(spacing) {
  simulacion.espacio_grilla = spacing;

  [grid1mmBtn, grid5mmBtn, grid10mmBtn].forEach((btn) => {
    btn.classList.remove("active");
  });

  if (spacing === 1) grid1mmBtn.classList.add("active");
  else if (spacing === 5) grid5mmBtn.classList.add("active");
  else if (spacing === 10) grid10mmBtn.classList.add("active");
}

function dibujar_sim() {
  const width = canvas.width;
  const height = canvas.height;

  // limpiar canvas
  ctx.clearRect(0, 0, width, height);

  // dibujare el fondo
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.fillStyle = "oklch(12.9% 0.042 264.695)";
  } else {
    ctx.fillStyle = "oklch(0.96 0.0103 247.93)";
  }

  ctx.fillRect(0, 0, width, height);

  // calcular escala y origen para la visualización
  const desiredXRange = 160;
  const escala = width / desiredXRange;
  const origen_x = width / 2;
  const origen_y = height * 0.5;

  dibujar_grilla(origen_x, origen_y, escala);
  dibujar_placa(origen_x, origen_y, escala);
  dibujar_laser(origen_x, origen_y, escala);
  dibujar_medidas(origen_x, origen_y, escala);
}

function dibujar_grilla(origen_x, origen_y, escala) {
  const width = canvas.width;
  const height = canvas.height;
  const tam_paso = simulacion.espacio_grilla * escala;
  const offsetX = simulacion.gridOffset.x * escala;
  const offsetY = simulacion.gridOffset.y * escala;

  // líneas de la grilla
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.strokeStyle = "#474a56";
  } else {
    ctx.strokeStyle = "#cdd9e3";
  }

  ctx.lineWidth = 0.5;

  // verticales
  for (let x = offsetX; x < width; x += tam_paso) {
    ctx.beginPath();
    ctx.moveTo(origen_x + x, 0);
    ctx.lineTo(origen_x + x, height);
    ctx.stroke();
  }

  for (let x = offsetX - tam_paso; x > -width; x -= tam_paso) {
    ctx.beginPath();
    ctx.moveTo(origen_x + x, 0);
    ctx.lineTo(origen_x + x, height);
    ctx.stroke();
  }

  // horizontales
  for (let y = offsetY; y < height; y += tam_paso) {
    ctx.beginPath();
    ctx.moveTo(0, origen_y + y);
    ctx.lineTo(width, origen_y + y);
    ctx.stroke();
  }

  for (let y = offsetY - tam_paso; y > -height; y -= tam_paso) {
    ctx.beginPath();
    ctx.moveTo(0, origen_y + y);
    ctx.lineTo(width, origen_y + y);
    ctx.stroke();
  }

  // ejes x-y
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  } else {
    ctx.strokeStyle = "black";
  }

  ctx.lineWidth = 1.5;

  // x
  ctx.beginPath();
  ctx.moveTo(0, origen_y);
  ctx.lineTo(width, origen_y);
  ctx.stroke();

  // y
  ctx.beginPath();
  ctx.moveTo(origen_x, 0);
  ctx.lineTo(origen_x, height);
  ctx.stroke();

  // marcas de escala y etiquetas
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  } else {
    ctx.strokeStyle = "rgba(63, 63, 63, 0.8)";
  }

  ctx.font = "12px Arial";
  ctx.textAlign = "center";

  // en x
  for (let x = 0; x < width / 2; x += tam_paso * 5) {
    // x positiva
    ctx.beginPath();
    ctx.moveTo(origen_x + x, origen_y - 5);
    ctx.lineTo(origen_x + x, origen_y + 5);
    ctx.stroke();

    if (x > 0) {
      ctx.fillText(`${Math.round(x / escala)}`, origen_x + x, origen_y + 20);
    }

    // x negativa
    if (x > 0) {
      ctx.beginPath();
      ctx.moveTo(origen_x - x, origen_y - 5);
      ctx.lineTo(origen_x - x, origen_y + 5);
      ctx.stroke();
      ctx.fillText(`-${Math.round(x / escala)}`, origen_x - x, origen_y + 20);
    }
  }
  // en y
  for (let y = 0; y < height / 2; y += tam_paso * 5) {
    // y positiva
    ctx.beginPath();
    ctx.moveTo(origen_x - 5, origen_y + y);
    ctx.lineTo(origen_x + 5, origen_y + y);
    ctx.stroke();

    if (y > 0) {
      ctx.fillText(`-${Math.round(y / escala)}`, origen_x - 20, origen_y + y);
    }

    // y negativa
    if (y > 0) {
      ctx.beginPath();
      ctx.moveTo(origen_x - 5, origen_y - y);
      ctx.lineTo(origen_x + 5, origen_y - y);
      ctx.stroke();

      ctx.fillText(`${Math.round(y / escala)}`, origen_x - 20, origen_y - y);
    }
  }

  // origen
  ctx.fillText("0", origen_x - 20, origen_y + 20);
}

function dibujar_placa(origen_x, origen_y, escala) {
  const ancho_placa = 100 * escala;
  // mm a escala
  const grosor_placa = simulacion.ancho_placa * escala;
  const placa_izq = origen_x - ancho_placa / 2;
  const placa_top = origen_y;

  // gris circonio, rosa cuarzo, azul el resto
  if (
    simulacion.material_actual == MATERIALES.circonio ||
    simulacion.material_actual == MATERIALES.diamante
  ) {
    ctx.fillStyle = "rgba(243, 243, 243, 0.5)";
    ctx.strokeStyle = "rgba(243, 243, 243, 0.5)";
    ctx.lineWidth = 2;
  } else if (simulacion.material_actual == MATERIALES.cuarzo) {
    ctx.fillStyle = "rgba(130, 112, 116, 0.8)";
    ctx.strokeStyle = "rgba(130, 112, 116, 0.8)";
    ctx.lineWidth = 2;
  } else {
    ctx.fillStyle = "rgba(135, 206, 250, 0.3)";
    ctx.strokeStyle = "rgba(70, 130, 180, 0.3)";
    ctx.lineWidth = 2;
  }

  ctx.beginPath();
  ctx.rect(placa_izq, placa_top, ancho_placa, grosor_placa);
  ctx.fill();
  ctx.stroke();

  // etiqueta de material
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    ctx.fillStyle = "rgba(70, 130, 180, 1)";
  } else {
    ctx.fillStyle = "rgba(0,0,0,1)";
  }

  ctx.font = "17px Arial";
  ctx.textAlign = "center";

  let materialName;
  if (simulacion.material === "unknown") {
    materialName = "Material desconocido";
  } else {
    materialName = simulacion.material_actual.name;
  }

  // etiquetas con el medio exterior
  ctx.fillText(simulacion.medio_actual.name, origen_x - 80, placa_top - 30);
  ctx.fillText(simulacion.medio_actual.name, origen_x - 80, placa_top + 100);

  // etiqueta con el material de la placa
  ctx.fillStyle = "white";
  ctx.fillText(materialName, origen_x - 80, placa_top + 40);
}

function dibujar_laser(origen_x, origen_y, escala) {
  // punto de incidencia del láser
  const incidencia_ejeX = origen_x;
  const incidencia_ejeY = origen_y;

  // grados a radianes
  const angulo_radianes = ((90 - simulacion.angulo_incidencia) * Math.PI) / 180;

  const color_laser = "rgb(0, 162, 255)";

  // rayo incidente
  const incidentLength = 150 * escala;
  const incidentEndX =
    incidencia_ejeX + incidentLength * Math.cos(angulo_radianes);
  const incidentEndY =
    incidencia_ejeY - incidentLength * Math.sin(angulo_radianes);

  ctx.strokeStyle = color_laser;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(incidencia_ejeX, incidencia_ejeY);
  ctx.lineTo(incidentEndX, incidentEndY);
  ctx.stroke();

  // ángulos de reflexión y refracción
  const n1 = simulacion.medio_actual.indice_refrac;
  const n2 = simulacion.material_actual.indice_refrac;

  // incidencia desde la normal
  const incidencia_normal = (simulacion.angulo_incidencia * Math.PI) / 180;
  const angulo_reflexion = Math.PI / 2 - incidencia_normal;

  // refracción usando ley de Snell
  let angulo_refraccion;
  const seno_refrac = (n1 / n2) * Math.sin(incidencia_normal);

  // comprobar si hay reflexión total interna
  if (seno_refrac > 1) {
    angulo_refraccion = Math.PI / 2;
  } else {
    angulo_refraccion = Math.asin(seno_refrac);
  }

  const reflexion_rad = Math.PI - angulo_radianes;
  const largo_reflejado = 100 * escala;
  const reflectedEndX =
    incidencia_ejeX + largo_reflejado * Math.cos(reflexion_rad);
  const reflectedEndY =
    incidencia_ejeY - largo_reflejado * Math.sin(reflexion_rad);

  ctx.beginPath();
  ctx.setLineDash([]);
  ctx.moveTo(incidencia_ejeX, incidencia_ejeY);
  ctx.lineTo(reflectedEndX, reflectedEndY);
  ctx.stroke();
  ctx.setLineDash([]);

  // punto de salida del material
  const grosor_placa = simulacion.ancho_placa * escala;
  const largo_material_reflex = grosor_placa / Math.cos(angulo_refraccion);
  const exitX =
    incidencia_ejeX + largo_material_reflex * Math.sin(angulo_refraccion);
  const exitY = incidencia_ejeY + grosor_placa;

  ctx.strokeStyle = color_laser;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(incidencia_ejeX, incidencia_ejeY);
  ctx.lineTo(exitX, exitY);
  ctx.stroke();

  // al salir, el rayo vuelve al ángulo original
  const largo_refractado = 100 * escala;
  const largo_refractado_X =
    exitX + largo_refractado * Math.sin(incidencia_normal);
  const largo_refractado_Y =
    exitY + largo_refractado * Math.cos(incidencia_normal);

  ctx.strokeStyle = color_laser;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(exitX, exitY);
  ctx.lineTo(largo_refractado_X, largo_refractado_Y);
  ctx.stroke();

  // ángulos
  dibujar_angulo(
    incidencia_ejeX,
    incidencia_ejeY,
    Math.PI + angulo_radianes,
    -Math.PI / 2,
    30,
    "α",
    "#52bfa0",
  );

  dibujar_angulo(
    incidencia_ejeX,
    incidencia_ejeY,
    -Math.PI / 2,
    -angulo_reflexion,
    30,
    "β",
    "#e57f71",
  );

  simulacion.angulos_calculados = {
    incidence: simulacion.angulo_incidencia,
    reflection: simulacion.angulo_incidencia,
    refraction: (angulo_refraccion * 180) / Math.PI,
  };

  const largo_auxiliar = 150 * escala;
  const aux_X = exitX + largo_auxiliar * Math.sin(angulo_refraccion);
  const aux_Y = exitY + largo_auxiliar * Math.cos(angulo_refraccion);

  ctx.strokeStyle = color_laser;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);

  ctx.beginPath();
  ctx.moveTo(exitX, exitY);
  ctx.lineTo(aux_X, aux_Y);
  ctx.stroke();

  ctx.setLineDash([]);
}

function dibujar_angulo(x, y, ang_1, ang_2, radio, etiqueta, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;

  // arco
  ctx.beginPath();
  ctx.arc(x, y, radio, ang_1, ang_2);
  ctx.stroke();
}

function dibujar_medidas(origen_x, origen_y, escala) {
  const grosor_placa = simulacion.ancho_placa * escala;
  const ancho_placa = 100 * escala;
  const placa_izq = origen_x - ancho_placa / 2;
  const placa_der = origen_x + ancho_placa / 2;
  const placa_top = origen_y;
  const placa_bot = origen_y + grosor_placa;

  // indicador de espesor
  ctx.strokeStyle = "#e74c3c";
  ctx.fillStyle = "#e74c3c";
  ctx.lineWidth = 1;

  const dimX = placa_der + 30;

  ctx.beginPath();
  ctx.moveTo(dimX, origen_y);
  ctx.lineTo(dimX, placa_bot);
  ctx.stroke();

  dibujar_flecha(dimX, origen_y, dimX, placa_bot);
  dibujar_flecha(dimX, placa_bot, dimX, origen_y);

  // etiqueta de distancias
  ctx.font = "15px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    `${simulacion.ancho_placa} mm`,
    dimX + 30,
    origen_y + grosor_placa / 2 + 5,
  );
}

function dibujar_flecha(fromX, fromY, toX, toY) {
  const headLength = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();
}

function generar_transportador() {
  const svg = document.getElementById("protractor-svg");
  if (!svg) return;

  svg.innerHTML = "";
  const width = canvas.width;
  const height = canvas.height;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute(
    "class",
    "absolute inset-0 w-full h-full text-slate-800 dark:text-slate-300 pointer-events-none drop-shadow-md",
  );

  const origen_x = width / 2;
  const origen_y = height * 0.5;

  const desiredXRange = 160;
  const escala = width / desiredXRange;

  const r_out = 65 * escala;

  const tickLong = r_out * 0.08;
  const tickMed = r_out * 0.05;
  const tickShort = r_out * 0.03;
  const tickHalf = r_out * 0.015;

  const svgns = "http://www.w3.org/2000/svg";

  const grupo = document.createElementNS(svgns, "g");
  grupo.setAttribute("transform", `translate(${origen_x}, ${origen_y})`);

  const fondo = document.createElementNS(svgns, "circle");
  fondo.setAttribute("r", r_out);
  fondo.setAttribute("fill", "rgba(200, 210, 220, 0.05)");
  fondo.setAttribute("stroke", "currentColor");
  fondo.setAttribute("stroke-width", "1");
  grupo.appendChild(fondo);

  for (let a = 0; a < 360; a += 0.5) {
    const rad = (a * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    let outerTickLen;
    let strokeWidth;

    if (a % 10 === 0) {
      outerTickLen = tickLong;
      strokeWidth = "1.5";
    } else if (a % 5 === 0) {
      outerTickLen = tickMed;
      strokeWidth = "1";
    } else if (a % 1 === 0) {
      outerTickLen = tickShort;
      strokeWidth = "0.5";
    } else {
      outerTickLen = tickHalf;
      strokeWidth = "0.3";
    }

    const lineOut = document.createElementNS(svgns, "line");
    lineOut.setAttribute("x1", cos * r_out);
    lineOut.setAttribute("y1", sin * r_out);
    lineOut.setAttribute("x2", cos * (r_out - outerTickLen));
    lineOut.setAttribute("y2", sin * (r_out - outerTickLen));
    lineOut.setAttribute("stroke", "currentColor");
    lineOut.setAttribute("stroke-width", strokeWidth);
    grupo.appendChild(lineOut);

    if (a % 10 === 0) {
      const valOuter = (a + 180) % 360;
      const rTextOut = r_out * 0.83;

      const textElement = document.createElementNS(svgns, "text");
      textElement.setAttribute("x", cos * rTextOut);
      textElement.setAttribute("y", sin * rTextOut);
      textElement.setAttribute("text-anchor", "middle");
      textElement.setAttribute("dominant-baseline", "middle");
      textElement.setAttribute("font-size", `${r_out * 0.06}px`);
      textElement.setAttribute("font-family", "sans-serif");
      textElement.setAttribute("font-weight", "bold");
      textElement.setAttribute("fill", "currentColor");

      const rotacion = a + 90;
      textElement.setAttribute(
        "transform",
        `rotate(${rotacion}, ${cos * rTextOut}, ${sin * rTextOut})`,
      );
      textElement.textContent = valOuter.toString();
      grupo.appendChild(textElement);
    }
  }

  const cruz = document.createElementNS(svgns, "path");
  const crossSize = r_out * 0.06;
  cruz.setAttribute(
    "d",
    `M -${crossSize} 0 L ${crossSize} 0 M 0 -${crossSize} L 0 ${crossSize}`,
  );
  cruz.setAttribute("stroke", "currentColor");
  cruz.setAttribute("stroke-width", "1");
  grupo.appendChild(cruz);

  svg.appendChild(grupo);
}

// eventos
function setupEventListeners() {
  ancho_placaSlider.addEventListener("input", function () {
    simulacion.ancho_placa = parseInt(this.value);
  });

  angleSlider.addEventListener("input", function () {
    simulacion.angulo_incidencia = parseFloat(this.value);
  });

  MATERIALESSelect.addEventListener("change", function () {
    simulacion.material = this.value;
    actualizar_material();
  });

  exteriorSelect.addEventListener("change", function () {
    simulacion.medio_exterior = this.value;
    actualizar_medio_ext();
  });

  grid1mmBtn.addEventListener("click", function () {
    set_grilla(1);
  });

  grid5mmBtn.addEventListener("click", function () {
    set_grilla(5);
  });

  grid10mmBtn.addEventListener("click", function () {
    set_grilla(10);
  });

  boton_reset.addEventListener("click", function () {
    reset_sim();
  });

  agregar_data_btn.addEventListener("click", function () {
    agregar_medida();
  });

  exportar_txt_btn.addEventListener("click", function () {
    exportar_txt();
  });

  exportar_csv_btn.addEventListener("click", function () {
    exportar_csv();
  });
}

function actualizar_material() {
  // si se selecciona desconocido, generar semilla rand para elegir del array
  if (simulacion.material === "unknown") {
    const materialKeys = Object.keys(MATERIALES).filter(
      (key) => key !== "unknown",
    );
    const randomIndex = Math.floor(Math.random() * materialKeys.length);
    const randomMaterial = materialKeys[randomIndex];

    simulacion.material_actual = MATERIALES[randomMaterial];
  } else {
    simulacion.material_actual = MATERIALES[simulacion.material];
  }
}

function actualizar_medio_ext() {
  simulacion.medio_actual = EXTERIOR_MEDIUMS[simulacion.medio_exterior];
}

// BOX-MULLER
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

function renderizar_tabla() {
  datos_tabla.innerHTML = "";

  simulacion.medidas.forEach((medida, index) => {
    const fila = datos_tabla.insertRow();
    fila.className =
      "bg-utn-light text-slate-950 dark:bg-slate-950 dark:text-white items-center text-center pt-4";

    const cellNum = fila.insertCell(0);
    cellNum.textContent = medida.number;
    cellNum.className = "py-2";

    const cellancho_placa = fila.insertCell(1);
    cellancho_placa.textContent = medida.ancho_placa;

    const cellMaterial = fila.insertCell(2);
    cellMaterial.textContent = medida.material;

    const cellRI = fila.insertCell(3);
    cellRI.textContent = medida.indice_refrac;

    const cellIncidence = fila.insertCell(4);
    cellIncidence.textContent = medida.angulo_incidencia;

    const cellRefraction = fila.insertCell(5);
    cellRefraction.textContent = medida.angulo_refraccion;

    const cellExpRI = fila.insertCell(6);
    cellExpRI.textContent = medida.experimentalRI;

    // esto se usa para crear el botón de eliminación y asignarle su respectivo índice
    const cellAction = fila.insertCell(7);
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className =
      "text-red-600 font-semibold cursor-pointer py-1 px-2";

    btnEliminar.onclick = function () {
      eliminar_medida(index);
    };

    cellAction.appendChild(btnEliminar);
  });
}

function eliminar_medida(indice) {
  simulacion.medidas.splice(indice, 1);

  simulacion.medidas.forEach((medida, idx) => {
    medida.number = idx + 1;
  });

  renderizar_tabla();
}

function agregar_medida() {
  const ang_refrac_input = prompt(
    "Ingrese el ángulo de refracción medido usando '.' para decimales",
    "",
  );
  if (ang_refrac_input === null || ang_refrac_input === "") {
    return;
  }

  const angulo_refraccion = parseFloat(ang_refrac_input);
  if (
    angulo_refraccion <= 0 ||
    angulo_refraccion > 90 ||
    isNaN(angulo_refraccion)
  ) {
    alert(
      "Por favor, ingrese un valor numérico válido para el ángulo de refracción.",
    );
    return;
  }

  const angulo_incidenciaRad =
    (simulacion.angulos_calculados.incidence * Math.PI) / 180;
  const angulo_refraccionRad = (angulo_refraccion * Math.PI) / 180;
  const experimentalRI =
    (simulacion.medio_actual.indice_refrac * Math.sin(angulo_incidenciaRad)) /
    Math.sin(angulo_refraccionRad);

  let IR_error;
  if (hayEscenario) {
    IR_error = boxmuller(experimentalRI, simulacion.error).toFixed(3);
  } else {
    IR_error = boxmuller(experimentalRI, 0.1).toFixed(3);
  }

  const medida = {
    number: simulacion.medidas.length + 1,
    ancho_placa: simulacion.ancho_placa,
    material:
      simulacion.material === "unknown"
        ? "Desconocido"
        : simulacion.material_actual.name,
    medio_exterior: simulacion.medio_actual.name,
    indice_refrac:
      simulacion.material === "unknown"
        ? "?"
        : simulacion.material_actual.indice_refrac.toFixed(2),
    angulo_incidencia: simulacion.angulos_calculados.incidence.toFixed(2),
    angulo_refraccion: angulo_refraccion.toFixed(2),
    experimentalRI: IR_error,
  };

  simulacion.medidas.push(medida);
  renderizar_tabla();
}

// carga y descarga de archivos
function importarJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data[0] != "reflexion") {
        alert("El escenario subido no corresponde a este simulador.");
      } else {
        set_escenario(data);
      }
      if (data[1] != 0.1 || data[1] != 0.5 || data[1] != 1 || data[1] != 2) {
        alert(
          "El escenario cuenta con un valor fuera de rango. Asegurate de usar el escenario original válido.",
        );
      }

      for (key in MATERIALES) {
        if (data[2] != MATERIALES[key].name) {
          alert("El material para la placa no es válido.");
        }
        if (data[3] != EXTERIOR_MEDIUMS.name) {
          alert("El medio exterior no es válido.");
        }
      }
    } catch (err) {
      alert("Error al leer el archivo JSON");
    }
  };

  reader.readAsText(file);
}

function set_escenario(data) {
  hayEscenario = true;
  simulacion.error = parseFloat(data[1]);
  simulacion.material = data[2];
  simulacion.medio_exterior = data[3];
  simulacion.ancho_placa = parseFloat(data[4]);
  simulacion.angulo_incidencia = parseInt(data[5]);

  ancho_placaSlider.value = simulacion.ancho_placa;
  angleSlider.value = simulacion.angulo_incidencia;
  MATERIALESSelect.value = simulacion.material;
  exteriorSelect.value = simulacion.medio_exterior;

  actualizar_material();
  actualizar_medio_ext();
  inhabInput();
}

function inhabInput() {
  ancho_placaSlider.disabled = true;
  angleSlider.disabled = true;
  MATERIALESSelect.disabled = true;
  exteriorSelect.disabled = true;

  const exitoEsc = document.getElementById("exito-esc");
  exitoEsc.className = "text-center text-green-400 italic mt-4";
  exitoEsc.textContent = "Escenario cargado con éxito.";
}

function descargar_archivo(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function exportar_txt() {
  if (simulacion.medidas.length < 5) {
    alert("Necesitas al menos 5 mediciones para poder exportar los datos");
    return;
  }

  let text = "DATOS DE SIMULACIÓN DE REFRACCIÓN Y REFLEXIÓN\n";
  text += "------------------------------------------------\n\n";
  text += `Fecha: ${new Date().toLocaleDateString()}\n`;
  text += "Grupo de Investigación GIEDI\n\n";

  text += "MEDICIONES:\n";
  text +=
    "N°\tEspesor(mm)\tMaterial\tIR\tMedio ext.\tÁng. inc.\tÁng. ref.\tIR Exp.\n";
  text +=
    "---------------------------------------------------------------------------------------------------------------\n";

  simulacion.medidas.forEach((m) => {
    text += `${m.number}\t${m.ancho_placa}\t\t${m.material}\t\t${m.indice_refrac}\t${m.medio_exterior}\t\t${m.angulo_incidencia}\t\t${m.angulo_refraccion}\t\t${m.experimentalRI}\n`;
  });

  descargar_archivo(text, "datos_sim_optica.txt", "text/plain");
}

function exportar_csv() {
  if (simulacion.medidas.length < 5) {
    alert("Necesitas al menos 5 mediciones para poder exportar los datos");
    return;
  }

  const headers = [
    "N°",
    "Espesor (mm)",
    "Material",
    "IR",
    "Medio Ext.",
    "Áng. Inc.",
    "Áng. Ref.",
    "IR Exp.",
  ];
  const rows = simulacion.medidas.map((m) =>
    [
      m.number,
      m.ancho_placa,
      m.material,
      m.indice_refrac,
      m.medio_exterior,
      m.angulo_incidencia,
      m.angulo_refraccion,
      m.experimentalRI,
    ].join(","),
  );

  const csvContent = [headers.join(","), ...rows].join("\n");
  descargar_archivo(
    csvContent,
    "datos_sim_optica.csv",
    "text/csv;charset=utf-8;",
  );
}

// iniciar la simulación cuando la página esté cargada
window.addEventListener("load", iniciar_simulacion);
