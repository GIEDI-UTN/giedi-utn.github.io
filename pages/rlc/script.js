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

    let circuito_ok = false;
    // Configurar circuito
    this.resonanceBtn.addEventListener("click", () => {
      circuito_ok = true;
      this.update();
    });

    this.osciloscopio.addEventListener("click", () => {
      // Dibujar diagramas
      const values = this.calculateValues();
      this.drawTriangles(values);
    });

    this.bus_resonancia.addEventListener("click", () => {
      if (circuito_ok) {
        this.busca_resonancia();
      }
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
    // Obtengo contexto y canvas de cada div que contiene el triángulo
    const ctx = this.impedanceCtx;
    const canvas = this.impedanceCanvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { R, XL, XC, Z, phi } = values;
    const X = XL - XC;

    // Máxima magnitud
    const max_magnitud = Math.max(Math.abs(R), Math.abs(X), Math.abs(Z));

    // Magnitudes
    const normalR = R / max_magnitud;
    const normalX = X / max_magnitud;

    // Centro de canvas y escala fija
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 60;

    // Inicio (recordar que eje y se mueve al revés que cartesiano)
    const inicioX = centerX - 40;
    const inicioY = centerY + 20;

    // Ejes de referencia
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Eje horizontal
    ctx.moveTo(inicioX - 10, inicioY);
    ctx.lineTo(inicioX + scale + 10, inicioY);

    // Eje vertical
    ctx.moveTo(inicioX, inicioY - scale - 10);
    ctx.lineTo(inicioX, inicioY + 10);
    ctx.stroke();

    ctx.lineWidth = 3;

    // R
    if (R > 0.01) {
      ctx.strokeStyle = "#4FA3D9";
      ctx.beginPath();

      ctx.moveTo(inicioX, inicioY);
      ctx.lineTo(inicioX + normalR * scale, inicioY);

      ctx.stroke();

      this.drawArrowhead(ctx, inicioX + normalR * scale, inicioY, 0, 8);
    }

    // X
    if (Math.abs(X) > 0.01) {
      ctx.strokeStyle = "red";
      const y_fin = inicioY - normalX * scale;

      ctx.beginPath();

      ctx.moveTo(inicioX, inicioY);
      ctx.lineTo(inicioX, y_fin);

      ctx.stroke();

      const arrowDirection = X > 0 ? -Math.PI / 2 : Math.PI / 2;
      this.drawArrowhead(ctx, inicioX, y_fin, arrowDirection, 8);
    } else {
      ctx.fillStyle = "red";
      ctx.font = "13px Arial";
      ctx.textAlign = "center";
      ctx.fillText("X" + "\u2245" + "0", inicioX - 30, inicioY);
    }

    // Z
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(inicioX, inicioY);
    const zX = inicioX + normalR * scale;
    const zY = inicioY - normalX * scale;
    ctx.lineTo(zX, zY);

    ctx.stroke();

    const zAngle = Math.atan2(-normalX * scale, normalR * scale);
    this.drawArrowhead(ctx, zX, zY, zAngle, 8);

    // Etiquetas
    ctx.font = "13px Arial";
    ctx.textAlign = "center";

    // Etiqueta R
    if (R > 0.01) {
      ctx.fillStyle = "#4FA3D9";
      ctx.fillText(`R`, inicioX + (normalR * scale) / 2, inicioY + 15);
      ctx.fillText(
        `${R.toFixed(1)}Ω`,
        inicioX + (normalR * scale) / 2,
        inicioY + 30
      );
    }

    // Etiqueta X
    if (Math.abs(X) > 0.01) {
      ctx.fillStyle = "red";

      const labelX = inicioX - 25;
      const labelY = inicioY - (normalX * scale) / 2;
      ctx.fillText("X", labelX, labelY);
      ctx.fillText(`${Math.abs(X).toFixed(1)}Ω`, labelX, labelY + 15);
    }

    // Etiqueta Z
    ctx.fillStyle = "green";
    const zLabelX = (inicioX + zX) / 2 + 35;
    const zLabelY = (inicioY + zY) / 2 - 5;
    ctx.fillText(`Z = ${Z.toFixed(1)}Ω`, zLabelX, zLabelY);

    // Arco φ
    if (Math.abs(phi) > 0.1) {
      ctx.fillStyle = "orange";
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const radius = 15;

      // Inductivo, sentido antihorario
      if (phi > 0) {
        ctx.arc(inicioX, inicioY, radius, 0, -phi, true);
      }

      // Capacitivo, sentido horario
      else {
        ctx.arc(inicioX, inicioY, radius, 0, -phi, false);
      }

      ctx.stroke();

      // Posición etiqueta del ángulo
      let angleLabelX, angleLabelY;
      const labelAngle = -phi / 2;

      angleLabelX = inicioX + (radius + 20) * Math.cos(labelAngle);
      angleLabelY = inicioY + (radius + 8) * Math.sin(labelAngle);

      ctx.fillText(
        `φ = ${((phi * 180) / Math.PI).toFixed(1)}°`,
        angleLabelX,
        angleLabelY
      );
    } else {
      // Ángulos chicos
      ctx.fillText(
        `φ = ${((phi * 180) / Math.PI).toFixed(1)}°`,
        inicioX + 20,
        inicioY - 10
      );
    }

    // Título
    ctx.fillStyle = "#4FA3D9";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Vectores R-X-Z", centerX, 30);
  }

  drawVoltageTriangle(values) {
    const ctx = this.voltageCtx;
    const canvas = this.voltageCanvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { VR, VL, VC, phi } = values;
    const VX = VL - VC;
    const Vtotal = Math.sqrt(VR * VR + VX * VX);

    // Normalizado
    const max_magnitud = Math.max(Math.abs(VR), Math.abs(VX), Math.abs(Vtotal));
    const normalizedVR = VR / max_magnitud;
    const normalizedVX = VX / max_magnitud;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 60;

    const inicioX = centerX - 40;
    const inicioY = centerY + 20;

    // Ejes de referencia
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(inicioX - 10, inicioY);
    ctx.lineTo(inicioX + scale + 10, inicioY);
    ctx.moveTo(inicioX, inicioY - scale - 10);
    ctx.lineTo(inicioX, inicioY + 10);
    ctx.stroke();

    // Vectores
    ctx.lineWidth = 3;

    // VR
    if (VR > 0.01) {
      ctx.strokeStyle = "#4FA3D9";
      ctx.beginPath();
      ctx.moveTo(inicioX, inicioY);
      ctx.lineTo(inicioX + normalizedVR * scale, inicioY);
      ctx.stroke();
      this.drawArrowhead(ctx, inicioX + normalizedVR * scale, inicioY, 0, 8);
    }

    // VX
    if (Math.abs(VX) > 0.01) {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(inicioX, inicioY);
      const y_fin = inicioY - normalizedVX * scale;
      ctx.lineTo(inicioX, y_fin);
      ctx.stroke();

      this.drawArrowhead(
        ctx,
        inicioX,
        y_fin,
        VX > 0 ? -Math.PI / 2 : Math.PI / 2,
        8
      );
    }

    // Vtotal
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(inicioX, inicioY);
    const vX = inicioX + normalizedVR * scale;
    const vY = inicioY - normalizedVX * scale;
    ctx.lineTo(vX, vY);
    ctx.stroke();

    const vAngle = Math.atan2(-normalizedVX * scale, normalizedVR * scale);
    this.drawArrowhead(ctx, vX, vY, vAngle, 8);

    // Arco φ
    if (Math.abs(phi) > 0.1) {
      ctx.font = "13px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "orange";
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const radius = 15;

      // Inductivo, sentido antihorario
      if (phi > 0) {
        ctx.arc(inicioX, inicioY, radius, 0, -phi, true);
      }

      // Capacitivo, sentido horario
      else {
        ctx.arc(inicioX, inicioY, radius, 0, -phi, false);
      }

      ctx.stroke();

      // Posición etiqueta del ángulo
      let angleLabelX, angleLabelY;
      const labelAngle = -phi / 2;

      angleLabelX = inicioX + (radius + 30) * Math.cos(labelAngle);
      angleLabelY = inicioY + (radius + 8) * Math.sin(labelAngle);

      ctx.fillText(
        `φ = ${((phi * 180) / Math.PI).toFixed(1)}°`,
        angleLabelX,
        angleLabelY
      );
    } else {
      // Ángulos chicos
      ctx.fillText(
        `φ = ${((phi * 180) / Math.PI).toFixed(1)}°`,
        inicioX + 20,
        inicioY - 10
      );
    }

    // Etiquetas
    ctx.font = "13px Arial";
    ctx.textAlign = "center";

    // ETIQUETA VR: AZUL - HORIZONTAL
    if (VR > 0.01) {
      ctx.fillStyle = "#4FA3D9";
      ctx.fillText(`VR`, inicioX + (normalizedVR * scale) / 2, inicioY + 15);
      ctx.fillText(
        `${VR.toFixed(1)}V`,
        inicioX + (normalizedVR * scale) / 2,
        inicioY + 30
      );
    }

    // ETIQUETA VX: ROJO - VERTICAL
    if (Math.abs(VX) > 0.01 || phi != 0) {
      ctx.fillStyle = "red";
      const labelX = inicioX - 15;
      const labelY = inicioY - (normalizedVX * scale) / 2;
      ctx.fillText("VX", labelX - 10, labelY);
      ctx.fillText(`${Math.abs(VX).toFixed(2)}V`, labelX - 10, labelY + 15);
    } else {
      ctx.fillStyle = "red";
      ctx.font = "13px Arial";
      ctx.textAlign = "center";
      ctx.fillText("VX" + "\u2245" + "0", inicioX - 30, inicioY);
    }

    // ETIQUETA V: VERDE - HIPOTENUSA
    ctx.fillStyle = "green";
    const vLabelX = (inicioX + vX) / 2 + 40;
    const vLabelY = (inicioY + vY) / 2 - 5;
    ctx.fillText(`V = ${Vtotal.toFixed(1)}V`, vLabelX, vLabelY);

    ctx.fillStyle = "#e74c3c";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Vectores VR-VX-Vrms", centerX, 30);
  }

  drawPowerTriangle(values) {
    const ctx = this.powerCtx;
    const canvas = this.powerCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { P, Q, S, phi } = values;

    // Normalizado
    const max_magnitud = Math.max(Math.abs(P), Math.abs(Q), Math.abs(S));
    const normalizedP = P / max_magnitud;
    const normalizedQ = Q / max_magnitud;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 60;

    const inicioX = centerX - 40;
    const inicioY = centerY + 20;

    // Ejes
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(inicioX - 10, inicioY);
    ctx.lineTo(inicioX + scale + 10, inicioY);
    ctx.moveTo(inicioX, inicioY - scale - 10);
    ctx.lineTo(inicioX, inicioY + 10);
    ctx.stroke();

    ctx.lineWidth = 3;

    // P
    if (P > 0.01) {
      ctx.strokeStyle = "#4FA3D9";
      ctx.beginPath();
      ctx.moveTo(inicioX, inicioY);
      ctx.lineTo(inicioX + normalizedP * scale, inicioY);
      ctx.stroke();
      this.drawArrowhead(ctx, inicioX + normalizedP * scale, inicioY, 0, 8);
    }

    // Q
    if (Math.abs(Q) > 0.01) {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(inicioX, inicioY);
      const y_fin = inicioY - normalizedQ * scale;
      ctx.lineTo(inicioX, y_fin);
      ctx.stroke();

      const arrowDirection = Q > 0 ? -Math.PI / 2 : Math.PI / 2;
      this.drawArrowhead(ctx, inicioX, y_fin, arrowDirection, 8);
    } else {
      ctx.fillStyle = "red";
      ctx.font = "13px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Q" + "\u2245" + "0", inicioX - 30, inicioY);
    }

    // S
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(inicioX, inicioY);
    const sX = inicioX + normalizedP * scale;
    const sY = inicioY - normalizedQ * scale;
    ctx.lineTo(sX, sY);
    ctx.stroke();
    const sAngle = Math.atan2(-normalizedQ * scale, normalizedP * scale);
    this.drawArrowhead(ctx, sX, sY, sAngle, 8);

    // Arco φ
    if (Math.abs(phi) > 0.1) {
      ctx.font = "13px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "orange";
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const radius = 15;

      // Inductivo, sentido antihorario
      if (phi > 0) {
        ctx.arc(inicioX, inicioY, radius, 0, -phi, true);
      }

      // Capacitivo, sentido horario
      else {
        ctx.arc(inicioX, inicioY, radius, 0, -phi, false);
      }

      ctx.stroke();

      // Posición etiqueta del ángulo
      let angleLabelX, angleLabelY;
      const labelAngle = -phi / 2;

      angleLabelX = inicioX + (radius + 30) * Math.cos(labelAngle);
      angleLabelY = inicioY + (radius + 8) * Math.sin(labelAngle);

      ctx.fillText(
        `φ = ${((phi * 180) / Math.PI).toFixed(1)}°`,
        angleLabelX,
        angleLabelY
      );
    } else {
      // Ángulos chicos
      ctx.fillText(
        `φ = ${((phi * 180) / Math.PI).toFixed(1)}°`,
        inicioX + 20,
        inicioY - 10
      );
    }

    // Etiquetas
    ctx.font = "13px Arial";
    ctx.textAlign = "center";

    if (P > 0.01) {
      ctx.fillStyle = "#4FA3D9";
      ctx.fillText(`P`, inicioX + (normalizedP * scale) / 2, inicioY + 15);
      ctx.fillText(
        `${P.toFixed(3)}W`,
        inicioX + (normalizedP * scale) / 2,
        inicioY + 30
      );
    }

    if (Math.abs(Q) > 0.01) {
      ctx.fillStyle = "red";
      const labelX = inicioX - 15;
      const labelY = inicioY - (normalizedQ * scale) / 2;
      ctx.fillText("Q", labelX - 10, labelY);
      ctx.fillText(`${Math.abs(Q).toFixed(2)}VAR`, labelX - 10, labelY + 15);
    }

    ctx.fillStyle = "green";
    const sLabelX = (inicioX + sX) / 2 + 13;
    const sLabelY = (inicioY + sY) / 2 - 5;
    ctx.fillText(`S = ${S.toFixed(2)}VA`, sLabelX + 20, sLabelY);

    ctx.fillStyle = "#27ae60";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Vectores P-Q-S", centerX, 30);
  }

  drawArrowhead(ctx, x, y, angle, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2);
    ctx.lineTo(-size, size / 2);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();

    ctx.restore();
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

  validarRangos() {
    let { R, L, C, omega, V0, timeScale } = this.getCircuitValues();

    L = L * 1000;
    C = C * 1e6;
    timeScale = timeScale * 1000;

    if (R < 1 || R > 100) return false;
    if (L < 10 || L > 1000) return false;
    if (C < 1 || C > 1000) return false;
    if (omega < 1 || omega > 500) return false;
    if (V0 < 1 || V0 > 50) return false;

    return true;
  }
}

// Inicializar el simulador cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  let simulador = new RLCSimulator();
  // Encontrar todos los elementos en el DOM
  const cajaOsci = document.getElementById("caja_osci");
  const datosCalculados = document.getElementById("datos-calculados");
  const tercerCaja = document.getElementById("tercer-caja");
  const resonanceBtn = document.getElementById("resonanceBtn");
  const osciOn = document.getElementById("osci_on");

  // Ocultar todas las cajas a menos que se opriman los botones
  cajaOsci.classList.add("!hidden");
  datosCalculados.classList.add("!hidden");
  tercerCaja.classList.add("!hidden");

  // Inicialmente no hay circuito configurado
  let resonanciaSeteada = false;

  // Si se configura el circuito, las demás cajas están habilitadas
  resonanceBtn.addEventListener("click", function () {
    let rango_valido = simulador.validarRangos();
    if (rango_valido) {
      datosCalculados.classList.remove("!hidden");
      resonanciaSeteada = true;
    } else {
      alert("Por favor, ingrese valores dentro de los rangos permitidos.");
    }
  });

  osciOn.addEventListener("click", function () {
    if (resonanciaSeteada) {
      cajaOsci.classList.remove("!hidden");
      tercerCaja.classList.remove("!hidden");
    } else {
      alert("Por favor, configure el circuito primero");
    }
  });
});
