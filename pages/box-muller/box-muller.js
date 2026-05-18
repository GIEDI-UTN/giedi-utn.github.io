let resto;
let sobra = false;
let mediciones = [5];
let muestras;
const verrta = document.getElementById("verrta");

verrta.addEventListener("click", function () {
  let error = parseFloat(
    document.querySelector('input[name="eporcentual"]:checked').value
  );
  let dato = parseFloat(document.querySelector('input[name="dato"]').value);
  muestras = parseInt(document.querySelector('input[name="nromuestras"]').value);


  mediciones.length = 0; // limpia el arreglo
  for (let i = 0; i < muestras; i++) {
    mediciones.push(genError(dato, error));
  }

  rta();
});

function genError(real, destd) {
  // pasar de porcentaje a decimal
  destd = real * (destd / 100);

  if (sobra) {
    sobra = false;
    return resto * destd + real;
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

  // guardo z1 para poder usarlo sin que ejecute el bloque completo
  sobra = true;
  resto = z1;

  return z0 * destd + real;
}

function rta() {
  const resultado = document.getElementById("resultado");

  html = "<h2> Resultados </h2>";

  html += `<p> Mediciones realizadas: ${parseFloat(muestras)}</p><br>`;
  html += `<table>`;

  for (let i = 0; i < mediciones.length; i += 3) {
  html += "<tr>";
  for (let j = 0; j < 7; j++) {
    if (mediciones[i + j] !== undefined) {
      html += `<td> ${mediciones[i + j].toFixed(4)} </td>`;
    }
  }
  html += "</tr>";
}


  html += `</table>`;
  resultado.innerHTML = html;

  graficarDistribucion();
}

function graficarDistribucion() {
  // Ordenamos las mediciones
  const datosOrdenados = [...mediciones].sort((a, b) => a - b);

  // Agrupamos por intervalos para hacer un histograma
  let bins = parseInt(Math.sqrt(muestras)); 
  if (bins<3){
    bins = 5;
  }
  const min = datosOrdenados[0];
  const max = datosOrdenados[datosOrdenados.length - 1];
  const anchoBin = (max - min) / bins;

  const frecuencias = new Array(bins).fill(0);
  for (let val of datosOrdenados) {
    const i = Math.min(Math.floor((val - min) / anchoBin), bins - 1);
    frecuencias[i]++;
  }

  const etiquetas = frecuencias.map((_, i) => {
    const desde = (min + i * anchoBin).toFixed(2);
    const hasta = (min + (i + 1) * anchoBin).toFixed(2);
    return `${desde}–${hasta}`;
  });

  const ctx = document.getElementById("grafico").getContext("2d");
  if (window.graficoChart) window.graficoChart.destroy(); // evitar superposición

  window.graficoChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: "Distribución de mediciones",
          data: frecuencias,
          backgroundColor: "rgba(112, 230, 179, 0.5)",
          borderColor: "rgba(112, 230, 179, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}
