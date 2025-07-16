// COMIENZO JQUERY
$(function () {
  //INICIO JQUERY
  let simulador = "";

  // parametrosHTML guarda el HTML de cada cajita de parámetros
  const parametrosHTML = {
    reflec: `
    <div class="p-2 m-4 dark:text-white text-utn-dark place-items-center flex flex-col items-center border-2 border-utn-regular rounded-2xl w-full max-w-7xl">
      <h2 class="dark:text-white text-utn-dark text-2xl font-semibold mt-4">
        Configurá los parámetros del simulador de reflexión y refracción
      </h2>
            <p class="dark:text-white text-utn-dark text-md">Importante: En caso de no introducir un valor de parámetro, tomará el valor por defecto</p>   
            <p class="text-md  text-amber-500">El generador de escenarios sólo soporta números decimales que usen puntos</p>   
            <p class="text-gray-500 text-md mb-4">Ej: 2/10 -> 0.2 | 2/100 -> 0.02</p>  
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-3 justify-items-center w-full max-w-5xl">
      <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center">
        <p>Error porcentual</p>
        <select
          id="ePorcentual"
          class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent min-w-52">
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
        <label class="mb-2 block text-center" for="material">Material</label>
        <select
          id="material"
          class="border-2 border-utn-regular rounded-lg px-2 py-1 bg-transparent min-w-52"
        >
          <option
            value="acrylic"
            class="dark:bg-slate-950 text-utn-dark dark:text-white"
          >
            Acrílico
          </option>
          <option
            value="quartz"
            class="dark:bg-slate-950 text-utn-dark dark:text-white"
          >
            Cuarzo
          </option>
          <option
            value="zirconium"
            class="dark:bg-slate-950 text-utn-dark dark:text-white"
          >
            Circonio
          </option>
          <option
            value="diamond"
            class="dark:bg-slate-950 text-utn-dark dark:text-white"
          >
            Diamante
          </option>
          <option
            value="ice"
            class="dark:bg-slate-950 text-utn-dark dark:text-white"
          >
            Hielo
          </option>
          <option
            value="unknown"
            class="dark:bg-slate-950 text-utn-dark dark:text-white"
          >
            Material Desconocido
          </option>
          <option
            value="glass"
            class="dark:bg-slate-950 text-utn-dark dark:text-white"
          >
            Vidrio
          </option>
        </select>
      </div>

    <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center">
      <label class="mb-2 block text-center" for="medioExterior"
        >Medio exterior</label
      >
      <select
        id="medioExterior"
        class="min-w-52 border-2 border-utn-regular rounded-lg px-2 py-1 bg-transparent"
      >
        <option
          class="dark:bg-slate-950 text-utn-dark dark:text-white"
          value="acetaldehyde"
        >
          Acetaldeído
        </option>
        <option
          class="dark:bg-slate-950 text-utn-dark dark:text-white"
          value="water"
        >
          Agua
        </option>
        <option
          class="dark:bg-slate-950 text-utn-dark dark:text-white"
          value="air"
        >
          Aire
        </option>
        <option
          class="dark:bg-slate-950 text-utn-dark dark:text-white"
          value="benzene"
        >
          Benceno
        </option>
        <option
          class="dark:bg-slate-950 text-utn-dark dark:text-white"
          value="glycerin"
        >
          Glicerina
        </option>
        <option
          class="dark:bg-slate-950 text-utn-dark dark:text-white"
          value="heptanol"
        >
          Heptanol (25°C)
        </option>
        <option
          class="dark:bg-slate-950 text-utn-dark dark:text-white"
          value="methanol"
        >
          Metanol
        </option>
        <option
          class="dark:bg-slate-950 text-utn-dark dark:text-white"
          value="sugarSolution30"
        >
          Solución de azúcar 30%
        </option>
        <option
          class="dark:bg-slate-950 text-utn-dark dark:text-white"
          value="sugarSolution80"
        >
          Solución de azúcar 80%
        </option>
        <option
          class="dark:bg-slate-950 text-utn-dark dark:text-white"
          value="vacuum"
        >
          Vacío
        </option>
      </select>
    </div>

    <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center">
      <label for="espesor" class="mb-2 block text-center"
        >Espesor del material (mm)</label
      >
      <input
        type="number"
        id="espesor"
        step="1"
        min="5"
        max="20"
        placeholder="Por defecto: 10 mm"
        class="min-w-52 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
      />
      <p class="text-gray-500 text-sm mt-[5px]">
        Rango válido: De 5 mm a 20 mm
      </p>
    </div>

    <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center">
      <label class="mb-2 block text-center" for="anguloIncidencia"
        >Ángulo de incidencia (°)</label
      >
      <input
        type="number"
        id="anguloIncidencia"
        step="1"
        min="1"
        max="89"
        placeholder="Por defecto: 30°"
        class="min-w-52 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
      />
      <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 1° a 89°</p>
    </div>
    <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center">
      <label for="titulo">Título del escenario</label>
      <input
        type="text"
        id="titulo"
        class="min-w-52 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
        placeholder="(opcional)"
      />
    </div>
  </div></div>
  `,
    ascensor: `
      <div class="p-2 m-4 dark:text-white text-utn-dark place-items-center flex flex-col items-center border-2 border-utn-regular rounded-2xl w-full max-w-7xl">
        <h2 class="dark:text-white text-utn-dark text-2xl font-semibold mt-4">
          Configurá los parámetros del simulador de peso aparente
        </h2>
            <p class="dark:text-white text-utn-dark text-md">Importante: En caso de no introducir un valor de parámetro, tomará el valor por defecto</p>   
            <p class="text-md  text-amber-500">El generador de escenarios sólo soporta números decimales que usen puntos</p>   
            <p class="text-gray-500 text-md mb-4">Ej: 2/10 -> 0.2 | 2/100 -> 0.02</p>          <div
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
              step="1"
              min="1"
              max="150"
              placeholder="Por defecto: 75 kg"
              class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
            />
            <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 1 kg a 150 kg</p>
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
            <label for="gravedad">Gravedad (g)</label><br>
            <input
              type="number"
              id="gravedad"
              step="0.1"
              min="-10"
              max="10"
              placeholder="Por defecto: 1g"
              class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
            />
            <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De -10g a 10g</p>
          </div>

          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
            <label for="acelerac">Aceleración actual (g)</label><br>
            <input
              type="number"
              id="acelerac"
              step="0.1"
              min="-10"
              max="10"
              placeholder="Por defecto: 1g"
              class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
            />
            <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De -10g a 10g</p>
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
      <div class="p-2 m-4 dark:text-white text-utn-dark place-items-center flex flex-col items-center border-2 border-utn-regular rounded-2xl w-full max-w-7xl">
        <h2 class="dark:text-white text-utn-dark text-2xl font-semibold mt-4">Configurá los parámetros del simulador de péndulo simple</h2>
            <p class="dark:text-white text-utn-dark text-md">Importante: En caso de no introducir un valor de parámetro, tomará el valor por defecto</p>   
            <p class="text-md  text-amber-500">El generador de escenarios sólo soporta números decimales que usen puntos</p>   
            <p class="text-gray-500 text-md mb-4">Ej: 2/10 -> 0.2 | 2/100 -> 0.02</p>  
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-3 justify-items-center w-full max-w-5xl">
          <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center">
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
                <label for="mass">Masa del cuerpo (g)</label>
                <input
                  type="number"
                  id="mass"
                  step="1"
                  min="10"
                  max="500"
                  placeholder="Por defecto: 50g"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 10g a 500g</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="length">Largo de la cuerda (cm)</label>
                <input
                  type="number"
                  id="length"
                  step="1"
                  min="10"
                  max="300"
                  placeholder="Por defecto: 100 cm"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 10 cm a 300 cm</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="cycles">Cantidad de ciclos</label>
                <input
                  type="number"
                  id="cycles"
                  step="1"
                  min="1"
                  max="10000"
                  placeholder="Por defecto: 10 ciclos"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 1 a 1000 ciclos</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="angle">Ángulo de lanzamiento (°)</label>
                <input type="number"
                id="angle"
                step="1"
                min="1"
                max="89"
                placeholder="Por defecto: 10°"
                class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent">
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 1° a 89°</p>
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
      <div class="p-2 m-4 dark:text-white text-utn-dark place-items-center flex flex-col items-center border-2 border-utn-regular rounded-2xl w-full max-w-7xl">
            <h2 class="dark:text-white text-utn-dark text-2xl font-semibold mt-4">
              Configurá los parámetros del simulador de péndulo balístico
            </h2>
            <p class="dark:text-white text-utn-dark text-md">Importante: En caso de no introducir un valor de parámetro, tomará el valor por defecto</p>   
            <p class="text-md  text-amber-500">El generador de escenarios sólo soporta números decimales que usen puntos</p>   
            <p class="text-gray-500 text-md mb-4">Ej: 2/10 -> 0.2 | 2/100 -> 0.02</p>  

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
                  placeholder="Por defecto: 0.5 kg"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 0.1 kg a 10 kg</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="pendulumMass">Masa del cuerpo (kg)</label>
                <input
                  type="number"
                  id="pendulumMass"
                  step="0.1"
                  min="0.1"
                  max="10"
                  placeholder="Por defecto: 0.5 kg"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 0.1 kg a 10 kg</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="pendulumLength">Largo de la cuerda (cm)</label>
                <input
                  type="number"
                  id="pendulumLength"
                  step="1"
                  min="10"
                  max="300"
                  placeholder="Por defecto: 10 cm"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 10 cm a 300 cm</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="initialVelocity">Velocidad inicial (m/s)</label>
                <input
                  type="number"
                  id="initialVelocity"
                  step="1"
                  min="1"
                  max="100"
                  placeholder="Por defecto: 5 m/s"
                  class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 1 m/s a 100 m/s</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="impactAngle">Ángulo de impacto (°)</label>
                <input type="number" id="impactAngle"
                step="1" 
                min="5" 
                max="45"
                placeholder="Por defecto: 0°" 
                class="w-48 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"/>
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 0° a 89°</p>
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
      <div class="p-2 m-4 dark:text-white text-utn-dark place-items-center flex flex-col items-center border-2 border-utn-regular rounded-2xl w-full max-w-7xl">
            <h2 class="dark:text-white text-utn-dark text-2xl font-semibold mt-4">
              Configurá los parámetros del simulador de máquina de Artwood
            </h2>
            <p class="dark:text-white text-utn-dark text-md">Importante: En caso de no introducir un valor de parámetro, tomará el valor por defecto</p>   
            <p class="text-md  text-amber-500">El generador de escenarios sólo soporta números decimales que usen puntos</p>   
            <p class="text-gray-500 text-md mb-4">Ej: 2/10 -> 0.2 | 2/100 -> 0.02</p>   


            <div
              class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-3 justify-items-center w-full max-w-5xl"
            >
              <div
                class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center"
              >
                <p>Error porcentual</p>
                <select
                  id="ePorcentual"
                  class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent w-56"
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
                <label for="fall-distance">Distancia de caída (cm)</label>
                <input
                  type="number"
                  id="fall-distance"
                  step="1"
                  min="10"
                  max="150"
                  placeholder="Por defecto: 100 cm"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 10 cm a 150 cm</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="pulley-type">Tipo de polea</label>
                <br>
                <select
                  id="pulley-type"
                  class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent w-56"
                >
                  <option
                    value="massless-pulley"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    Con masa despreciable
                  </option>
                  <option
                    value="massive-pulley"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    Con masa considerable
                  </option>
                </select>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="mass1-value">Masa del cuerpo 1 (kg)</label>
                <input
                  type="number"
                  id="mass1-value"
                  step="0.1"
                  min="0.1"
                  max="100"
                  placeholder="Por defecto: 1 kg"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 0.1 kg a 10 kg</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="mass2-value">Masa del cuerpo 2 (kg)</label>
                <input
                  type="number"
                  id="mass2-value"
                  step="0.1"
                  min="0.1"
                  max="100"
                  placeholder="Por defecto: 0.1 kg"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 0.1 kg a 10 kg</p>
              </div>

            <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
              <label for="titulo">Título del escenario</label>
              <input
                  type="text"
                  id="titulo"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                  placeholder="(opcional)"
              />
            </div>

            <div>

              <p class="text-utn-dark dark:text-white text-sm mt-[5px]">En caso de haber seleccionado polea considerable, complete los campos a continuación. De lo contrario, déjelos en blanco. </p>

            </div>
            
            <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl" id="masa_polea">
              <label for="pulley-mass">Masa de la polea (kg)</label>
                <input
                  type="number"
                  id="pulley-mass"
                  step="0.1"
                  min="0.1"
                  max="1"
                  placeholder="Por defecto: 0.5 kg"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 0.1 kg a 1 kg</p>
            </div>

            <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl" id="radio_polea">
              <label for="pulley-radius">Radio de la polea (cm)</label>
                <input
                  type="number"
                  id="pulley-radius"
                  step="1"
                  min="2"
                  max="10"
                  placeholder="Por defecto: 5 cm"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 2 cm a 10 cm</p>
            </div>


          </div>
      `,
    venturi: `
      <div class="p-2 m-4 dark:text-white text-utn-dark place-items-center flex flex-col items-center border-2 border-utn-regular rounded-2xl w-full max-w-7xl">
            <h2 class="dark:text-white text-utn-dark text-2xl font-semibold mt-4">
              Configurá los parámetros del simulador de tubo de Venturi
            </h2>
            <p class="dark:text-white text-utn-dark text-md">Importante: En caso de no introducir un valor de parámetro, tomará el valor por defecto</p>   
            <p class="text-md  text-amber-500">El generador de escenarios sólo soporta números decimales que usen puntos</p>   
            <p class="text-gray-500 text-md mb-4">Ej: 2/10 -> 0.2 | 2/100 -> 0.02</p>  
            <div
              class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-3 justify-items-center w-full max-w-5xl"
            >
              <div
                class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl items-center justify-center"
              >
                <p>Error porcentual</p>
                <select
                  id="ePorcentual"
                  class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent w-56"
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
                <label for="throat-diameter">Diámetro de garganta (cm)</label>
                <br>
                <input
                  type="number"
                  id="throat-diameter"
                  step="0.1"
                  min="0.1"
                  max="10"
                  placeholder="Por defecto: 0.5 cm"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 0.1 cm a 10 cm</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <p>Diámetro de entrada</p>
                <select
                  id="inlet-diameter"
                  class="border-2 border-utn-regular rounded-lg px-2 py-1 mt-2 bg-transparent w-56"
                >
                  <option
                    value="15.80"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    0.5" (16 mm)
                  </option>
                  <option
                    value="20.93"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    0.75" (21 mm)
                  </option>
                  <option
                    value="26.64"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    1" (27 mm)
                  </option>
                  <option
                    value="35.05"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    1.25" (35 mm)
                  </option>
                  <option
                    value="40.89"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    1.5" (41 mm)
                  </option>
                  <option
                    value="52.50"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    2" (52.5 mm)
                  </option>

                  <option
                    value="62.71"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    2.5" (63 mm)
                  </option>

                  <option
                    value="77.93"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    3" (78 mm)
                  </option>
                  <option
                    value="102.26"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    4" (102 mm)
                  </option>

                  <option
                    value="154.05"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    6" (154 mm)
                  </option>

                  <option
                    value="202.72"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    8" (78 mm)
                  </option>

                  <option
                    value="254.51"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    10" (254.5)
                  </option>

                  <option
                    value="303.23"
                    class="dark:bg-slate-950 text-utn-dark dark:text-white"
                  >
                    12" (303 mm)
                  </option>
                </select>
                <p class="text-gray-500 text-sm mt-2">ASTM SCH40</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
                <label for="flow-rate">Caudal de Entrada (m³/h)</label>
                <input
                  type="number"
                  id="flow-rate"
                  step="0.1"
                  min="0"
                  max="20"
                  placeholder="Por defecto: 5"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 0 m³/h a 20 m³/h</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
              <label for="inlet-pressure">Presión de Entrada (kPa)</label>
                <input
                  type="number"
                  id="inlet-pressure"
                  step="1"
                  min="0"
                  max="1000"
                  placeholder="Por defecto: 200 kPa"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 0 kPa a 1000 kPa</p>
              </div>

              <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
              <label for="temperature">Temperatura (°C)</label>
                <input
                  type="number"
                  id="temperature"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="Por defecto: 20°C"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                />
                <p class="text-gray-500 text-sm mt-[5px]">Rango válido: De 0°C a 100°C</p>
              </div>

            <div class="w-full h-24 bg-utn-light dark:bg-slate-950 rounded-xl">
              <label for="titulo">Título del escenario</label>
              <input
                  type="text"
                  id="titulo"
                  class="w-56 mt-2 border-utn-regular border-2 rounded-lg px-2 py-1 bg-transparent"
                  placeholder="(opcional)"
              />
            </div>
          </div>
      `,
  };

  // el botón seleccionado se guarda en simulador
  $("#reflec, #ascensor, #pensimple, #penbalistico, #artwood, #venturi").on(
    "click",
    function () {
      simulador = this.id;
    }
  );

  // click en siguiente habilita mostrar la caja
  $("#mostrar-param").on("click", function () {
    if (simulador && parametrosHTML[simulador]) {
      $("#parametros").html(parametrosHTML[simulador]);
      $("#parametros").show();
      $("#verificar-data").show();
    } else {
      alert("Para continuar, seleccione un simulador.");
    }
  });

  // click en siguiente verifica los datos y habilita descarga
  $("#verificar-dato").on("click", function () {
    switch (simulador) {
      case "reflec":
        $error = parseFloat($("#ePorcentual").val());
        $material = $("#material").val();
        $medio_ext = $("#medioExterior").val();
        $espesor = parseFloat($("#espesor").val());
        $angulo = parseFloat($("#anguloIncidencia").val());
        $titulo = $("#titulo").val();

        $text_adv = "";
        $fuera_rango = false;

        if ($espesor < 5 || $espesor > 20) {
          $text_adv += "El rango válido de espesor es de 5mm hasta 20mm";
          $fuera_rango = true;
        } else if (isNaN($espesor)) {
          $espesor = 10;
        }

        if ($angulo < 1 || $angulo > 89) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }
          $text_adv += "El rango válido de ángulos es de 1° hasta 89°";
          $fuera_rango = true;
        } else if (isNaN($angulo)) {
          $angulo = 30;
        }

        if ($titulo.length == 0) {
          $titulo = "escenario";
        }

        if ($fuera_rango) {
          alert($text_adv);
        } else {
          $id = "reflexion";
          const data = [$id, $error, $material, $medio_ext, $espesor, $angulo];
          exportarJSON(data, $titulo);
        }
        break;

      case "ascensor":
        $error = parseFloat($("#ePorcentual").val());
        $masa = parseFloat($("#masa").val());
        $gravedad = parseFloat($("#gravedad").val());
        $acelerac = parseFloat($("#acelerac").val());
        $titulo = $("#titulo").val();

        $text_adv = "";
        $fuera_rango = false;

        if ($masa < 1 || $masa > 150) {
          $text_adv += "El rango válido de masa es de 1kg a 150kg";
          $fuera_rango = true;
        } else if (isNaN($masa)) {
          $masa = 75;
        }

        if ($gravedad < -10 || $gravedad > 10) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $text_adv += "El rango válido de gravedad es de -10g a 10g";
          $fuera_rango = true;
        } else if (isNaN($gravedad)) {
          $gravedad = 1;
        }

        if ($acelerac < -10 || $acelerac > 10) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $text_adv += "El rango válido de aceleración es de -10g a 10g";
          $fuera_rango = true;
        }

        if ($titulo.length == 0) {
          $titulo = "escenario";
        }

        if ($fuera_rango) {
          alert($text_adv);
        } else {
          $id = "ascensor";
          const data = [$id, $masa, $gravedad, $acelerac];
          exportarJSON(data, $titulo);
        }
        break;

      case "pensimple":
        $error = parseFloat($("#ePorcentual").val());
        $masa = parseFloat($("#mass").val());
        $largo = parseFloat($("#length").val());
        $ciclos = parseFloat($("#cycles").val());
        $angulo = parseFloat($("#angle").val());
        $titulo = $("#titulo").val();

        $fuera_rango = false;
        $text_adv = "";

        if ($masa < 10 || $masa > 500) {
          $text_adv += "El rango válido para la masa es de 10g a 500g";
          $fuera_rango = true;
        } else if (isNaN($masa)) {
          $masa = 50;
        }

        if ($largo < 10 || $largo > 300) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }
          $text_adv += "El rango válido para el largo es de 10cm a 300cm";
          $fuera_rango = true;
        } else if (isNaN($largo)) {
          $largo = 100;
        }

        if ($ciclos < 1 || $ciclos > 1000) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }
          $text_adv += "El rango válido para los ciclos es de 1 a 1000 ciclos";
          $fuera_rango = true;
        } else if (isNaN($ciclos)) {
          $ciclos = 10;
        }

        if ($angulo < 1 || $angulo > 89) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }
          $text_adv += "El rango válido para el ángulo es de 1° a 89°";
          $fuera_rango = true;
        } else if (isNaN($angulo)) {
          $angulo = 10;
        }

        if ($titulo.length == 0) {
          $titulo = "escenario";
        }

        if ($fuera_rango) {
          alert($text_adv);
        } else {
          $id = "pen-simple";
          const data = [$id, $error, $masa, $largo, $ciclos, $angulo];
          exportarJSON(data, $titulo);
        }

        break;

      case "penbalistico":
        $error = parseFloat($("#ePorcentual").val());
        $masa_proy = parseFloat($("#projectileMass").val());
        $masa_cuerpo = parseFloat($("#pendulumMass").val());
        $long_pend = parseFloat($("#pendulumLength").val());
        $veloc_inic = parseFloat($("#initialVelocity").val());
        $ang_impac = parseFloat($("#impactAngle").val());
        $titulo = $("#titulo").val();

        $fuera_rango = false;
        $text_adv = "";

        if ($masa_proy < 0.1 || $masa_proy > 10) {
          $text_adv +=
            "El rango válido para la masa del proyectil es de 0.1kg a 10kg";
          $fuera_rango = true;
        } else if (isNaN($masa_proy)) {
          $masa_proy = 0.5;
        }

        if ($masa_cuerpo < 0.1 || $masa_cuerpo > 10) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $text_adv +=
            "El rango válido para la masa del cuerpo es de 0.1kg a 10kg";
          $fuera_rango = true;
        } else if (isNaN($masa_cuerpo)) {
          $masa_cuerpo = 0.5;
        }

        if ($long_pend < 10 || $long_pend > 300) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $text_adv +=
            "El rango válido para la long. de cuerda es de 10cm a 300cm";
          $fuera_rango = true;
        } else if (isNaN($long_pend)) {
          $long_pend = 10;
        }

        if ($veloc_inic < 1 || $veloc_inic > 100) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $text_adv +=
            "El rango válido para la veloc. inicial es de 1m/s a 100m/s";
          $fuera_rango = true;
        } else if (isNaN($veloc_inic)) {
          $veloc_inic = 5;
        }

        if ($ang_impac < 0 || $ang_impac > 89) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $text_adv +=
            "El rango válido para el ángulo de impacto es de 0° a 89°";
          $fuera_rango = true;
        } else if (isNaN($ang_impac)) {
          $ang_impac = 0;
        }

        if ($titulo.length == 0) {
          $titulo = "escenario";
        }

        if ($fuera_rango) {
          alert($text_adv);
        } else {
          $id = "pen-balistico";
          const data = [
            $id,
            $error,
            $masa_proy,
            $masa_cuerpo,
            $long_pend,
            $veloc_inic,
            $ang_impac,
          ];
          exportarJSON(data, $titulo);
        }

        break;

      case "artwood":
        $error = parseFloat($("#ePorcentual").val());
        $dist_caida = parseFloat($("#fall-distance").val());
        $masa1 = parseFloat($("#mass1-value").val());
        $masa2 = parseFloat($("#mass2-value").val());
        $titulo = $("#titulo").val();

        $masa_polea = parseFloat($("#pulley-mass").val());
        $radio_polea = parseFloat($("#pulley-radius").val());

        $fuera_rango = false;
        $text_adv = "";

        if ($dist_caida < 10 || $dist_caida > 150) {
          $text_adv +=
            "El rango válido para la distancia de caída es de 10cm a 150cm";
          $fuera_rango = true;
        } else if (isNaN($dist_caida)) {
          $dist_caida = 100;
        }

        if ($masa1 < 0.1 || $masa1 > 10) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $text_adv += "El rango válido para la masa 1 es de 0.1kg a 10kg";
          $fuera_rango = true;
        } else if (isNaN($dist_caida)) {
          $masa1 = 1;
        }

        if ($masa2 < 0.1 || $masa2 > 10) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $text_adv += "El rango válido para la masa 2 es de 0.1kg a 10kg";
          $fuera_rango = true;
        } else if (isNaN($masa2)) {
          $masa2 = 0.1;
        }

        $tipo_polea = $("#pulley-type").val();
        if ($tipo_polea == "massive-pulley") {
          if ($masa_polea < 0.1 || $masa_polea > 1) {
            if ($fuera_rango) {
              $text_adv += "\n";
            }

            $text_adv +=
              "El rango válido para la masa de la polea es de 0.1kg a 1kg";
            $fuera_rango = true;
          } 
          else if (isNaN($masa_polea)) {
            $masa_polea = 0.5;
          }

          if ($radio_polea < 2 || $radio_polea > 10) {
            if ($fuera_rango) {
              $text_adv += "\n";
            }

            $text_adv +=
              "El rango válido para el radio de la polea es de 2cm a 10cm";
            $fuera_rango = true;
          }
          else if (isNaN($radio_polea)) {
            $radio_polea = 5;
          }
        }

        if ($titulo.length == 0) {
          $titulo = "escenario";
        }

        if ($fuera_rango) {
          alert($text_adv);
        } else {
            $id="artwood";
            if ($tipo_polea == "massive-pulley"){
              const data = [$id, $error, $dist_caida, $masa1, $masa2, $masa_polea, $radio_polea];
              exportarJSON(data, $titulo);
            }
            else {
              const data = [$id, $error, $dist_caida, $masa1, $masa2];
              exportarJSON(data, $titulo);
          }
          
        }
        break;

      case "venturi":
        $error = parseFloat($("#ePorcentual").val());
        $garganta = parseFloat($("#throat-diameter").val());
        $diametro = ($("#inlet-diameter").val());
        $caudal = parseFloat($("#flow-rate").val());
        $presion = parseFloat($("#inlet-pressure").val());
        $temperatura = parseFloat($("#temperature").val());
        $titulo = $("#titulo").val();

        $fuera_rango = false;
        $text_adv = "";

        if ($garganta < 0.1 || $garganta > 10) {
          $fuera_rango = true;
          $text_adv +=
            "El rango válido para el diámetro de garganta es de 0.1cm a 10cm";
        } else if (isNaN($garganta)) {
          $garganta = 0.5;
        }

        if ($caudal < 0 || $caudal > 20) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $fuera_rango = true;
          $text_adv += "El rango válido de caudal es de 0m³/h a 20m³/h";
        } else if (isNaN($caudal)) {
          $caudal = 5;
        }

        if ($presion < 0 || $presion > 1000) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $fuera_rango = true;
          $text_adv +=
            "El rango válido de presión de entrada es de 0kPa a 1000kPa";
        } else if (isNaN($presion)) {
          $presion = 200;
        }

        if ($temperatura < 0 || $temperatura > 100) {
          if ($fuera_rango) {
            $text_adv += "\n";
          }

          $fuera_rango = true;
          $text_adv += "El rango válido de temperatura es de 0°C a 100°C";
        } else if (isNaN($temperatura)) {
          $temperatura = 20;
        }

        if ($titulo.length == 0) {
          $titulo = "escenario";
        }

        if ($fuera_rango) {
          alert($text_adv);
        }
        else {
          $id = "venturi";
            const data = [$id,$error, $garganta, $diametro, $caudal, $presion, $temperatura];
            exportarJSON(data, $titulo);
        }

        break;

      default:
        console.log(
          "Error de lectura \nFavor de reportar a giedifrsfutn@gmail.com"
        );
    }
  });

  // CIERRE JQUERY
});
// FIN JQUERY

function exportarJSON(data, titulo) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = titulo + ".json";
  a.click();

  URL.revokeObjectURL(url);
}
