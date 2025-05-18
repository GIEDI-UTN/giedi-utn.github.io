let resto;
let sobra = false;
let mediciones = [5];
const verrta = document.getElementById("verrta");

verrta.addEventListener("click", function () {
  let error = parseFloat(
    document.querySelector('input[name="eporcentual"]:checked').value
  );
  let dato = parseFloat(document.querySelector('input[name="dato"]').value);

  mediciones[0] = genError(dato, error);
  mediciones[1] = genError(dato, error);
  mediciones[2] = genError(dato, error);
  mediciones[3] = genError(dato, error);
  mediciones[4] = genError(dato, error);
  mediciones[5] = genError(dato, error);
  mediciones[6] = genError(dato, error);
  mediciones[7] = genError(dato, error);
  mediciones[8] = genError(dato, error);
  mediciones[9] = genError(dato, error);
  mediciones[10] = genError(dato, error);
  mediciones[11] = genError(dato, error);
  mediciones[12] = genError(dato, error);
  mediciones[13] = genError(dato, error);
  mediciones[14] = genError(dato, error);
  mediciones[15] = genError(dato, error);
  mediciones[16] = genError(dato, error);
  mediciones[17] = genError(dato, error);
  mediciones[18] = genError(dato, error);
  mediciones[19] = genError(dato, error);
  mediciones[20] = genError(dato, error);
  mediciones[21] = genError(dato, error);
  mediciones[22] = genError(dato, error);
  mediciones[23] = genError(dato, error);
  mediciones[24] = genError(dato, error);
  mediciones[25] = genError(dato, error);
  mediciones[26] = genError(dato, error);
  mediciones[27] = genError(dato, error);
  mediciones[28] = genError(dato, error);
  mediciones[29] = genError(dato, error);
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

  html += `<p> Mediciones realizadas: </p><br>`;
  html += `<table>`;
  html += `<tr>
  <td> ${mediciones[0]} </td>
  <td> ${mediciones[1]} </td>
  <td> ${mediciones[2]} </td>
  </tr>`;

  html += `<tr>
  <td> ${mediciones[3]} </td>
  <td> ${mediciones[4]} </td>
  <td> ${mediciones[5]} </td>
  </tr>`;

  html += `<tr>
  <td> ${mediciones[6]} </td>
  <td> ${mediciones[7]} </td>
  <td> ${mediciones[8]} </td>
  </tr>`;

  html += `<tr>
  <td> ${mediciones[9]} </td>
  <td> ${mediciones[10]} </td>
  <td> ${mediciones[11]} </td>
  </tr>`;

  html += `<tr>
  <td> ${mediciones[12]} </td>
  <td> ${mediciones[13]} </td>
  <td> ${mediciones[14]} </td>
  </tr>`;

  html += `<tr>
  <td> ${mediciones[15]} </td>
  <td> ${mediciones[16]} </td>
  <td> ${mediciones[17]} </td>
  </tr>`;

  html += `<tr>
  <td> ${mediciones[18]} </td>
  <td> ${mediciones[19]} </td>
  <td> ${mediciones[20]} </td>
  </tr>`;


  html += `<tr>
  <td> ${mediciones[21]} </td>
  <td> ${mediciones[22]} </td>
  <td> ${mediciones[23]} </td>
  </tr>`;

  html += `<tr>
  <td> ${mediciones[24]} </td>
  <td> ${mediciones[25]} </td>
  <td> ${mediciones[26]} </td>
  </tr>`;

  html += `<tr>
  <td> ${mediciones[27]} </td>
  <td> ${mediciones[28]} </td>
  <td> ${mediciones[29]} </td>
  </tr>`;
  
  html += `</table>`;
  resultado.innerHTML = html;
}
