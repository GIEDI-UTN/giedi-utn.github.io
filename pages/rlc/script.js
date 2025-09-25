class RLCSimulator {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.animationId = null;
    this.update();
    this.animate();
  }

  initializeElements() {
    // Controles
    this.resistanceSlider = document.getElementById("resistance");
    this.inductanceSlider = document.getElementById("inductance");
    this.capacitanceSlider = document.getElementById("capacitance");
    this.frequencySlider = document.getElementById("frequency");
    this.voltageSlider = document.getElementById("voltage");
    this.timeScaleSlider = document.getElementById("timeScale");

    this.resonanceBtn = document.getElementById("resonanceBtn");
    this.resonanceMessage = document.getElementById("resonanceMessage");
    this.bus_resonancia = document.getElementById("resonancia_si");

    // Valores mostrados
    this.resistanceValue = this.resistanceSlider.value;
    this.inductanceValue = this.inductanceSlider.value;
    this.capacitanceValue = this.capacitanceSlider.value;
    this.frequencyValue = this.frequencySlider.value;
    this.voltageValue = this.voltageSlider.value;
    this.timeScaleValue = this.timeScaleSlider.value;

    // Canvas
    this.waveformsCanvas = document.getElementById("waveforms");
    this.waveformsCtx = this.waveformsCanvas.getContext("2d");

    this.osciloscopio = document.getElementById("osci_on");
    this.impedanceCanvas = document.getElementById("impedanceTriangle");
    this.impedanceCtx = this.impedanceCanvas.getContext("2d");
    this.voltageCanvas = document.getElementById("voltageTriangle");
    this.voltageCtx = this.voltageCanvas.getContext("2d");
    this.powerCanvas = document.getElementById("powerTriangle");
    this.powerCtx = this.powerCanvas.getContext("2d");

    // Elementos de valores calculados
    this.valueElements = {
      freq: document.getElementById("freq-value"),
      period: document.getElementById("period-value"),
      xl: document.getElementById("xl-value"),
      xc: document.getElementById("xc-value"),
      z: document.getElementById("z-value"),
      phase: document.getElementById("phase-value"),
      ipeak: document.getElementById("ipeak-value"),
      irms: document.getElementById("irms-value"),
      vr: document.getElementById("vr-value"),
      vl: document.getElementById("vl-value"),
      vc: document.getElementById("vc-value"),
      vpr: document.getElementById("vpr-value"),
      vpl: document.getElementById("vpl-value"),
      vpc: document.getElementById("vpc-value"),
      s: document.getElementById("s-value"),
      p: document.getElementById("p-value"),
      q: document.getElementById("q-value"),
    };

    this.dominanceText = document.getElementById("dominanceText");
  }

  setupEventListeners() {
    // Sliders
    this.resistanceSlider.addEventListener("input", () => {
      this.resistanceValue.textContent = this.resistanceSlider.value;
      this.update();
    });

    this.inductanceSlider.addEventListener("input", () => {
      this.inductanceValue.textContent = this.inductanceSlider.value;
      this.update();
    });

    this.capacitanceSlider.addEventListener("input", () => {
      this.capacitanceValue.textContent = this.capacitanceSlider.value;
      this.update();
    });

    this.frequencySlider.addEventListener("input", () => {
      this.frequencyValue.textContent = this.frequencySlider.value;
      this.update();
    });

    this.voltageSlider.addEventListener("input", () => {
      this.voltageValue.textContent = this.voltageSlider.value;
      this.update();
    });

    this.timeScaleSlider.addEventListener("input", () => {
      this.timeScaleValue.textContent = this.timeScaleSlider.value;
      this.update();
    });

    // Botón de resonancia
    this.resonanceBtn.addEventListener("click", () => {
      this.update();
    });

    this.osciloscopio.addEventListener("click", () => {
      // Dibujar diagramas
      const values = this.calculateValues();
      this.drawTriangles(values);
    });

    this.bus_resonancia.addEventListener("click", () => {
      this.busca_resonancia();
    });
  }

  getCircuitValues() {
    const R = parseFloat(this.resistanceSlider.value);
    const L = parseFloat(this.inductanceSlider.value) / 1000; // mH -> H
    const C = parseFloat(this.capacitanceSlider.value) / 1e6; // µF -> F
    const omega = parseFloat(this.frequencySlider.value);
    const V0 = parseFloat(this.voltageSlider.value);
    const timeScale = parseFloat(this.timeScaleSlider.value) / 1000; // ms -> s

    return { R, L, C, omega, V0, timeScale };
  }

  calculateValues() {
    const { R, L, C, omega, V0 } = this.getCircuitValues();

    // Reactancias
    const XL = omega * L;
    const XC = omega === 0 ? Infinity : 1 / (omega * C);

    // Impedancia
    const Z = Math.sqrt(R * R + Math.pow(XL - XC, 2));

    // Ángulo de fase
    const phi = Math.atan((XL - XC) / R);

    // Frecuencia y período
    const f = omega / (2 * Math.PI);
    const T = f === 0 ? Infinity : 1 / f;

    // Corrientes
    const Irms = Z === 0 ? 0 : V0 / Z;
    const Ipeak = Irms * Math.sqrt(2);

    // Voltajes RMS
    const VR = Irms * R;
    const VL = Irms * XL;
    const VC = Irms * XC;

    // Voltajes pico
    const Vpr = Ipeak * R;
    const Vpl = Ipeak * XL;
    const Vpc = Ipeak * XC;

    // Potencias
    const P = Irms * Irms * R; // Potencia activa
    const S = Irms * V0; // Potencia aparente
    const Q = S * Math.sin(phi); // Potencia reactiva

    return {
      R,
      L,
      C,
      omega,
      V0,
      XL,
      XC,
      Z,
      phi,
      f,
      T,
      Ipeak,
      Irms,
      VR,
      VL,
      VC,
      Vpr,
      Vpl,
      Vpc,
      S,
      P,
      Q,
    };
  }

  update() {
    const values = this.calculateValues();

    // Actualizar valores mostrados
    this.valueElements.freq.textContent = values.f.toFixed(3) + " Hz";
    this.valueElements.period.textContent = values.T.toFixed(3) + " s";

    this.valueElements.xl.textContent = values.XL.toFixed(3) + " Ω";
    this.valueElements.xc.textContent = values.XC.toFixed(3) + " Ω";
    this.valueElements.z.textContent = values.Z.toFixed(3) + " Ω";
    this.valueElements.phase.textContent =
      ((values.phi * 180) / Math.PI).toFixed(1) + "°";
    this.valueElements.ipeak.textContent = values.Ipeak.toFixed(3) + " A";
    this.valueElements.irms.textContent = values.Irms.toFixed(3) + " A";
    this.valueElements.vr.textContent = values.VR.toFixed(3) + " V";
    this.valueElements.vl.textContent = values.VL.toFixed(3) + " V";
    this.valueElements.vc.textContent = values.VC.toFixed(3) + " V";
    this.valueElements.vpr.textContent = values.Vpr.toFixed(3) + " V";
    this.valueElements.vpl.textContent = values.Vpl.toFixed(3) + " V";
    this.valueElements.vpc.textContent = values.Vpc.toFixed(3) + " V";
    this.valueElements.s.textContent = values.S.toFixed(3) + " VA";
    this.valueElements.p.textContent = values.P.toFixed(3) + " W";
    this.valueElements.q.textContent = values.Q.toFixed(3) + " VAR";

    // Actualizar indicador de dominancia
    this.updateDominanceIndicator(values);
  }

  updateDominanceIndicator(values) {
    const { XL, XC, phi } = values;
    const phaseDegrees = ((phi * 180) / Math.PI).toFixed(1);

    let text = "";
    if (Math.abs(XL - XC) < 0.01) {
      text =
        "Estado del circuito: En resonancia. XL = XC. Voltaje y corriente en fase (φ = 0°)";
    } else if (XL > XC) {
      text = `Estado del circuito: Inductivo. XL > XC. El voltaje adelanta a la corriente por ${phaseDegrees}°`;
    } else {
      text = `Estado del circuito: Capacitivo. XC > XL. El voltaje atrasa a la corriente por ${Math.abs(
        phaseDegrees
      )}°`;
    }

    this.dominanceText.innerHTML = text;
  }

  busca_resonancia() {
    const { L, C } = this.getCircuitValues();
    const omega0 = 1 / Math.sqrt(L * C);

    const l1 = L * 1000;
    const c1 = C * 1000000;
    const f1 = omega0 / (2 * Math.PI);

    this.resonanceMessage.innerHTML = `Para encontrar la resonancia, XL=XC. Donde L = ${l1.toFixed(
      2
    )} mH y C = ${c1.toFixed(
      2
    )} µF  <br> Frecuencia de resonancia: ${omega0.toFixed(
      1
    )} rad/s <br>  Luego, f = ${f1.toFixed(1)} Hz`;
  }

  drawTriangles(values) {
    this.drawImpedanceTriangle(values);
    this.drawVoltageTriangle(values);
    this.drawPowerTriangle(values);
  }

  drawImpedanceTriangle(values) {
    const ctx = this.impedanceCtx;
    const canvas = this.impedanceCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { R, XL, XC, Z, phi } = values;
    const X = XL - XC;

    // Escalado
    const scale = Math.min(150 / Math.max(R, Math.abs(X), Z), 1);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Coordenadas del triángulo
    const x1 = centerX - (R * scale) / 2;
    const y1 = centerY;
    const x2 = centerX + (R * scale) / 2;
    const y2 = centerY;
    const x3 = x2;
    const y3 = centerY - X * scale;

    // Dibujar triángulo
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    // Etiquetas
    ctx.fillStyle = "#2c3e50";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`R = ${R.toFixed(1)}Ω`, (x1 + x2) / 2, y1 + 20);
    ctx.fillText(`X = ${X.toFixed(1)}Ω`, x2 + 20, (y2 + y3) / 2);
    ctx.fillText(`Z = ${Z.toFixed(1)}Ω`, (x1 + x3) / 2 - 20, (y1 + y3) / 2);
    ctx.fillText(
      `φ = ${((phi * 180) / Math.PI).toFixed(1)}°`,
      x2 - 30,
      y2 - 10
    );
  }

  drawVoltageTriangle(values) {
    const ctx = this.voltageCtx;
    const canvas = this.voltageCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { VR, VL, VC, V0, phi } = values;
    const VX = VL - VC;
    const Vrms = V0 / Math.sqrt(2);

    // Escalado
    const scale = Math.min(150 / Math.max(VR, Math.abs(VX), Vrms), 1);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Coordenadas del triángulo
    const x1 = centerX - (VR * scale) / 2;
    const y1 = centerY;
    const x2 = centerX + (VR * scale) / 2;
    const y2 = centerY;
    const x3 = x2;
    const y3 = centerY - VX * scale;

    // Dibujar triángulo
    ctx.strokeStyle = "#e74c3c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    // Etiquetas
    ctx.fillStyle = "#e74c3c";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`VR = ${VR.toFixed(1)}V`, (x1 + x2) / 2, y1 + 20);
    ctx.fillText(`VX = ${VX.toFixed(1)}V`, x2 + 20, (y2 + y3) / 2);
    ctx.fillText(`V = ${Vrms.toFixed(1)}V`, (x1 + x3) / 2 - 20, (y1 + y3) / 2);
  }

  drawPowerTriangle(values) {
    const ctx = this.powerCtx;
    const canvas = this.powerCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { P, Q, S } = values;

    // Escalado
    const scale = Math.min(150 / Math.max(Math.abs(P), Math.abs(Q), S), 1);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Coordenadas del triángulo
    const x1 = centerX - (P * scale) / 2;
    const y1 = centerY;
    const x2 = centerX + (P * scale) / 2;
    const y2 = centerY;
    const x3 = x2;
    const y3 = centerY - Q * scale;

    // Dibujar triángulo
    ctx.strokeStyle = "#27ae60";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    // Etiquetas
    ctx.fillStyle = "#27ae60";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`P = ${P.toFixed(3)}W`, (x1 + x2) / 2, y1 + 20);
    ctx.fillText(`Q = ${Q.toFixed(3)}VAR`, x2 + 20, (y2 + y3) / 2);
    ctx.fillText(`S = ${S.toFixed(3)}VA`, (x1 + x3) / 2 - 20, (y1 + y3) / 2);
  }

  animate() {
    this.drawWaveforms();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawWaveforms() {
    const ctx = this.waveformsCtx;
    const canvas = this.waveformsCanvas;
    const values = this.calculateValues();
    const { timeScale } = this.getCircuitValues();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ch1 = document.getElementById("chanel1").checked;
    const ch2 = document.getElementById("chanel2").checked;
    const ch3 = document.getElementById("chanel3").checked;
    const ch4 = document.getElementById("chanel4").checked;

    const { omega, Ipeak, VR, VL, VC, V0, phi } = values;

    // Configuración de la gráfica
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const timeRange = timeScale;
    const amplitude = height / 6;

    // Dibujar ejes
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Dibujar líneas de tiempo
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath();
      ctx.moveTo(x, centerY - 5);
      ctx.lineTo(x, centerY + 5);
      ctx.stroke();
    }

    // Dibujar ondas
    const points = 800;
    const dt = timeRange / points;

    // Función para dibujar una onda
    const drawWave = (amplitude, phase, color, label) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < points; i++) {
        const t = i * dt;
        const x = (i / points) * width;
        const y = centerY - amplitude * Math.sin(omega * t + phase);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Etiqueta
      ctx.fillStyle = color;
      ctx.font = "12px Arial";
      ctx.fillText(
        label,
        width - 100,
        centerY - amplitude * Math.sin(omega * timeRange + phase) - 10
      );
    };

    // Dibujar las ondas
    if (ch1) {
      drawWave(
        amplitude * (Ipeak / Math.max(Ipeak, V0 / 50)),
        0,
        "#3498db",
        "i(t)"
      );
    }
    if (ch2) {
      drawWave(amplitude * (VR / V0), 0, "#e74c3c", "vR(t)");
    }
    if (ch3) {
      drawWave(amplitude * (VL / V0), Math.PI / 2, "#27ae60", "vL(t)");
    }
    if (ch4) {
      drawWave(amplitude * (VC / V0), -Math.PI / 2, "#f39c12", "vC(t)");
    }

    // Etiquetas de los ejes
    ctx.fillStyle = "#2c3e50";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Tiempo", width / 2, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Amplitud", 0, 0);
    ctx.restore();
  }
}

// Inicializar el simulador cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  new RLCSimulator();
});

// COMIENZO JQUERY
$(function () {
  $("#caja_osci").hide();
  $("#datos-calculados").hide();
  let resonancia_seteada = false;

  $("#resonanceBtn").on("click", function () {
    $("#datos-calculados").show();
    resonancia_seteada = true;
  });

  $("#osci_on").on("click", function () {
    if (resonancia_seteada) {
      $("#caja_osci").show();
    } else {
      alert("Por favor, configure una resonancia primero");
    }
  });
});
// FIN JQUERY
