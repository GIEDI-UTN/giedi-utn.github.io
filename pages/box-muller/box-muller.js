let resto;
let sobra = false;
let mediciones = [5];
const verrta = document.getElementById("verrta");

verrta.addEventListener("click", function () {
  let error = parseFloat(document.querySelector('input[name="eporcentual"]:checked').value);
  let dato = parseFloat(document.querySelector('input[name="dato"]').value);

  mediciones[0] = genError(dato, error);
  mediciones[1] = genError(dato, error);
  mediciones[2] = genError(dato, error);
  mediciones[3] = genError(dato, error);
  mediciones[4] = genError(dato, error);

  rta();
});

function genError(real, destd) {
  // pasar de porcentaje a decimal
  destd = real * (destd/100);

  if (sobra) {
    sobra = false;
    return (resto * destd) + real;
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

  return (z0 * destd) + real;
}

function rta() {
  const resultado = document.getElementById("resultado");

  html = "<h2> Resultados </h2>";

  html += `<p> Mediciones realizadas: 5</p><br>`;
  html += `<p> 1: ${mediciones[0]} </p><br>`;
  html += `<p> 2: ${mediciones[1]} </p><br>`;
  html += `<p> 3: ${mediciones[2]} </p><br>`;
  html += `<p> 4: ${mediciones[3]} </p><br>`;
  html += `<p> 5: ${mediciones[4]} </p><br>`;

  resultado.innerHTML = html;
}
