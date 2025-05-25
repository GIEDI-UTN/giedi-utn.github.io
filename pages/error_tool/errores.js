// jQuery para manejar el cambio dinámico de caja con parámetros

$(document).ready(function () {
  let simulador = "";

  // el botón seleccionado se guarda en simulador
  $("#reflec, #ascensor, #pensimple, #penbalistico, #artwood, #venturi").on("click", function () {
    simulador = this.id;

    // parametrosHTML guarda el HTML de cada cajita de parámetros
    const parametrosHTML = {
      reflec: `
        <h2 class="dark:text-white text-utn-dark text-2xl font-semibold m-4">
        Configurá los parámetros del simulador</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-3 justify-items-center w-full max-w-5xl">
          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center">
            <p>Error porcentual</p>
            <select id="ePorcentual" class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent w-48">
                <option value="0.1" class="dark:bg-slate-950 text-utn-dark dark:text-white">± 0.1%</option>
                <option value="0.5" class="dark:bg-slate-950 text-utn-dark dark:text-white">± 0.5%</option>
                <option value="1" class="dark:bg-slate-950 text-utn-dark dark:text-white">± 1%</option>
                <option value="2" class="dark:bg-slate-950 text-utn-dark dark:text-white">± 2%</option>
            </select>
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
            <p>Material</p>
            <select id="material" class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent">
                <option value="acrylic" class="dark:bg-slate-950 text-utn-dark dark:text-white">Acrílico</option>
                <option value="quartz" class="dark:bg-slate-950 text-utn-dark dark:text-white">Cuarzo</option>
                <option value="zirconium" class="dark:bg-slate-950 text-utn-dark dark:text-white">Circonio</option>
                <option value="diamond" class="dark:bg-slate-950 text-utn-dark dark:text-white">Diamante</option>
                <option value="ice" class="dark:bg-slate-950 text-utn-dark dark:text-white">Hielo</option>
                <option value="unknown" class="dark:bg-slate-950 text-utn-dark dark:text-white">Material Desconocido</option>
                <option value="glass" class="dark:bg-slate-950 text-utn-dark dark:text-white">Vidrio</option>
            </select>
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
            <label for="medioExterior">Medio exterior</label>
            <select id="medioExterior" class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent">
                <option class="dark:bg-slate-950 text-utn-dark dark:text-white" value="acetaldehyde">Acetaldeído</option>
                <option class="dark:bg-slate-950 text-utn-dark dark:text-white" value="water">Agua</option>
                <option class="dark:bg-slate-950 text-utn-dark dark:text-white" value="air">Aire</option>
                <option class="dark:bg-slate-950 text-utn-dark dark:text-white" value="benzene">Benceno</option>
                <option class="dark:bg-slate-950 text-utn-dark dark:text-white" value="glycerin">Glicerina</option>
                <option class="dark:bg-slate-950 text-utn-dark dark:text-white" value="heptanol">Heptanol (25°C)</option>
                <option class="dark:bg-slate-950 text-utn-dark dark:text-white" value="methanol">Metanol</option>
                <option class="dark:bg-slate-950 text-utn-dark dark:text-white" value="sugarSolution30">Solución de azúcar 30%</option>
                <option class="dark:bg-slate-950 text-utn-dark dark:text-white" value="sugarSolution80">Solución de azúcar 80%</option>
                <option class="dark:bg-slate-950 text-utn-dark dark:text-white" value="vacuum">Vacío</option>
            </select>
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
            <label for="espesor">Espesor del material (mm)</label>
            <input type="number" id="espesor" step="1" min="1" max="20" class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent">
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
              <label for="anguloIncidencia">Ángulo de incidencia (°)</label>
              <input type="number" id="anguloIncidencia" step="1" min="0" max="89" class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent">
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
              <label for="titulo">Título del escenario</label>
              <input type="text" id="titulo" class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent" placeholder="(opcional)">
          </div>

        </div>
      `,
      ascensor: `
        <h2 class="dark:text-white text-utn-dark text-2xl font-semibold m-4">
          Configurá los parámetros del simulador
        </h2>
        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-3 justify-items-center w-full max-w-5xl"
        >
          <div
            class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center"
          >
            <p>Error porcentual</p>
            <select
              id="ePorcentual"
              class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent w-48"
            >
              <option
                value="0.1"
                class="dark:bg-slate-950 text-utn-dark dark:text-white"
              >
                ± 0.1%
              </option>
              <option
                value="0.5"
                class="dark:bg-slate-950 text-utn-dark dark:text-white"
              >
                ± 0.5%
              </option>
              <option
                value="1"
                class="dark:bg-slate-950 text-utn-dark dark:text-white"
              >
                ± 1%
              </option>
              <option
                value="2"
                class="dark:bg-slate-950 text-utn-dark dark:text-white"
              >
                ± 2%
              </option>
            </select>
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
            <label for="masa">Masa de la persona (kg)</label>
            <input
              type="number"
              id="masa"
              step="0.1"
              min="1"
              max="500"
              class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
            />
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
            <label for="gravedad">Gravedad (m/s²)</label><br>
            <input
              type="number"
              id="gravedad"
              step="0.1"
              min="-500"
              max="500"
              class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
            />
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
            <label for="acelerac">Aceleración actual (m/s²)</label><br>
            <input
              type="number"
              id="acelerac"
              step="0.1"
              min="-500"
              max="500"
              class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
            />
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
            <label for="titulo">Título del escenario</label>
            <input
              type="text"
              id="titulo"
              class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
              placeholder="(opcional)"
            />
          </div>

        </div>
      `,
      pensimple: `
            <h2 class="dark:text-white text-utn-dark text-2xl font-semibold m-4">
              Configurá los parámetros del simulador
            </h2>

            

            <div
              class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-3 justify-items-center w-full max-w-5xl"
            >
              <div
                class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center"
              >
                <p>Error porcentual</p>
                <select
                  id="ePorcentual"
                  class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent w-48"
                >
                  <option
                    value="0.1"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    ± 0.1%
                  </option>
                  <option
                    value="0.5"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    ± 0.5%
                  </option>
                  <option
                    value="1"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    ± 1%
                  </option>
                  <option
                    value="2"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    ± 2%
                  </option>
                </select>
              </div>

            <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center">
                <p>Forma de cálculo</p>
                <select
                  id="tipoCalculo"
                  class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent w-48">
                  
                    <option
                      value="simplificada"
                      class="dark:bg-slate-950 text-utn-dark dark:text-white"
                    > Simplificada
                    </option>
                    <option
                      value="exacta"
                      class="dark:bg-slate-950 text-utn-dark dark:text-white"
                    > Exacta
                    </option>

                </select>
            </div> 

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="mass">Masa del cuerpo (gr)</label>
                <input
                  type="number"
                  id="mass"
                  step="10"
                  min="50"
                  max="500"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="length">Largo de la cuerda (cm)</label>
                <input
                  type="number"
                  id="length"
                  step="1"
                  min="10"
                  max="300"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="cycles">Cantidad de ciclos</label>
                <input
                  type="number"
                  id="cycles"
                  step="1"
                  min="1"
                  max="10000"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="angle">Ángulo de lanzamiento (°)</label>
                <input type="number" id="angle" step="5" min="5" max="45" class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent">
              </div>

            <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
              <label for="titulo">Título del escenario</label>
              <input
                  type="text"
                  id="titulo"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                  placeholder="(opcional)"
              />
            </div>

          </div>
      `,
      penbalistico: `
            <h2 class="dark:text-white text-utn-dark text-2xl font-semibold m-4">
              Configurá los parámetros del simulador
            </h2>   

            <div
              class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-3 justify-items-center w-full max-w-5xl"
            >
              <div
                class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center"
              >
                <p>Error porcentual</p>
                <select
                  id="ePorcentual"
                  class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent w-48"
                >
                  <option
                    value="0.1"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    ± 0.1%
                  </option>
                  <option
                    value="0.5"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    ± 0.5%
                  </option>
                  <option
                    value="1"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    ± 1%
                  </option>
                  <option
                    value="2"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    ± 2%
                  </option>
                </select>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="projectileMass">Masa del proyectil (kg)</label>
                <input
                  type="number"
                  id="projectileMass"
                  step="0.1"
                  min="0.1"
                  max="10"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="pendulumMass">Masa del cuerpo (kg)</label>
                <input
                  type="number"
                  id="pendulumMass"
                  step="0.1"
                  min="0.1"
                  max="100"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="pendulumLength">Largo de la cuerda (m)</label>
                <input
                  type="number"
                  id="pendulumLength"
                  step="0.1"
                  min="0.5"
                  max="5"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="initialVelocity">Velocidad inicial (m/s)</label>
                <input
                  type="number"
                  id="initialVelocity"
                  step="1"
                  min="1"
                  max="100"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="impactAngle">Ángulo de impacto (°)</label>
                <input type="number" id="impactAngle" step="5" min="5" max="45" class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent">
              </div>

            <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
              <label for="titulo">Título del escenario</label>
              <input
                  type="text"
                  id="titulo"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                  placeholder="(opcional)"
              />
            </div>

          </div>
      `,
      artwood: `
        <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
          <label>Masa A (kg)</label>
          <input type="number" step="0.1" min="0" class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent">
        </div>
        <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
          <label>Masa B (kg)</label>
          <input type="number" step="0.1" min="0" class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent">
        </div>
      `,
      venturi: `
        <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
          <label>Masa A (kg)</label>
          <input type="number" step="0.1" min="0" class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent">
        </div>
        <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
          <label>Masa B (kg)</label>
          <input type="number" step="0.1" min="0" class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent">
        </div>
      `
    };
  });

  // click en siguiente habilita mostrar la caja
  $("#mostrar-param").on("click", function () {
    if (simulador && parametrosHTML[simulador]) {
      $("#parametros .grid").html(parametrosHTML[simulador]);
      $("#parametros").show();
    } else {
      alert("Para continuar, seleccione un simulador.");
    }
  });
});



function exportarJSON() {
  // parámetros a exportar con getid
    const data = {
      material: document.getElementById('material').value,
      espesor: parseFloat(document.getElementById('espesor').value),
      medioExterior: document.getElementById('medioExterior').value,
      anguloIncidencia: parseFloat(document.getElementById('anguloIncidencia').value),
      errorPorcentual: parseFloat(document.getElementById('ePorcentual').value)
    };

    let titulo = document.getElementById('titulo').value;
    if (titulo===null || titulo==="") {
      titulo = "escenario";
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = titulo + ".json";
    a.click();

    URL.revokeObjectURL(url);
  }