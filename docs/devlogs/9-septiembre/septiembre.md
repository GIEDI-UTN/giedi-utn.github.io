# Bitácora de Desarrollo - Simuladores físicos experimentales

**Autor:** Suárez B. Gael G.  
**Fecha:** `09/2025`  
**Versión:** `2.1.0`  
**Repositorio:** [giedi-utn en GitHub](https://github.com/GIEDI-UTN/giedi-utn.github.io)

---

## Objetivo

_Implementar el simulador RLC. Obtener una versión funcional. Insertar con éxito Google Analytics._

---

## Actividades realizadas

### 1. Google Analytics

Se creó una cuenta de Google específica para el simulador de GIEDI, donde se recopilaran los datos obtenidos de la página. Esta cuenta también puede ser útil para recibir reportes de bugs por parte de los usuarios. Se eligió Google Analytics en lugar de Google Tag Manager por la simplicidad de uso y de las métricas requeridas para la página.

### 2. Simulador RLC

### Análisis de las funciones

---

El simulador es un objeto representado por la clase RLCSimulator, con los siguientes métodos:

`constructor()`

- Llama a la función initializeElements, setupEventListeners, update y animate. Setea animationId en null

`initializeElements()`

Para los siguientes parámetros: Resistencia, inductancia, capacitancia, frecuencia, voltaje, escala de tiempo.

- Encuentra el slider en el DOM con getElementById y se lo asigna una variable con forma \<nombre>Slider.
- Para cada slider, toma su valor con getElementById con id \<nombre>-value y se lo asigna a una variable con forma \<nombre>Value.

Luego, almacena todos los valores calculados en un set clave-valor llamado valueElements con getElementById. Se almacenan en el siguiente orden: [freq, period, xl, xc, z, phase, ipeak, irms, vr, vl, vc, s, p, q]

Y para los siguientes elementos HTML: Botón de resonancia, mensaje de resonancia, texto de dominancia.

- Encuentra el elemento HTML en el DOM con getElementById y se lo asigna a las variables: resonanceBtn, resonanceMessage y dominanceText respectivamente.

Para el canvas del osciloscopio, encuentra el canvas en el DOM con getElementById y se lo asigna a una variable waveformsCanvas.
Luego, llama al método getContext con argumento '2d' y obtiene el CanvasRenderingContext2D, una interface de la API de canvas que le permite dibujar posteriormente.

`setupEventListeners()`

- Se encarga de actualizar el valor mostrado debajo del slider cuando el valor cambia. Usa addEventListener para cada variable de tipo slider, con listener en input. Cambia el valor asignando el valor del slider (método value) a la variable que le corresponde con el método textContent.
- Para el botón de resonancia, utiliza listener para los clicks y en caso de trigger llama a la función setResonance.

`getCircuitValues()`

- Toma todos los valores de las variables slider con el método value. Realiza conversiones si es necesario para dejarlos en su unidad fundamental (ej: De mH a H).
- Luego, los retorna en el siguiente orden: R, L, C, omega, V0, timeScale

`calculateValues()`

- Declara 5 variables con los parámetros modificables: R, L, C, omega, V0. En la misma línea, llama a la función getcircuitValues() para asignarles su valor correspondiente.
- Comienza con el cálculo necesario para la parte izquierda del panel.

  - XL = omega \* L
  - XC: Si omega=0, infinito. Else, 1 / (omega \* C)
  - Z = sqrt(R² + (XL - XC)²);
  - phi (ángulo de fase) = Math.atan2(XL - XC, R)
    - `Nota: Debería cambiarse por acos(R/Z)`
  - f = omega / 2pi
  - T: Si f=0, infinito. Else, 1/f
  - ipico: Si XL=XC (Z=0) entonces 0. Else, V0/Z
  - irms = ipico / sqrt(2)
  - VR = irms\*R
  - VL = irms\*XL
  - VC = irms\*XC
  - S (aparente) = V0\*irms / sqrt(2)
  - P (activa) = S\*cos(phi)
  - Q (reactiva) = S\*sin(phi)

- Finalmente, retorna todos los valores en este orden: R, L, C, omega, V0, XL, XC, Z, phi, f, T, Ipeak, Irms, VR, VL, VC, S, P, Q

`update()`

- Llama a la función calculateValues y almacena todos los valores calculados en una variable values.
- Luego, actualiza todos los valores mediante el método textContent asignandole el valor que le corresponde en values, truncando a 2 decimales y a 1 decimal a valores que interesan ver como enteros como las resistencias.
- Finalmente, llama a la función updateDominanceIndicator y le entrega los valores calculados.
  - `Nota: Debería solo pasarle los valores que le interesa: XL, XC, phi para evitar nueva asignación`

`updateDominanceIndicator(values)`

- Recibe los valores XL, XC y phi de values.
- Pasa el valor de phi de radianes a grados. Luego, almacena en una variable phaseDegrees truncado sin decimales.
- Declara una variable text donde se almacenara la frase. Inicializa con cadena vacía.
- Compara los valores de XL con XC. Si es menor a 0,01, está en resonancia. Si XL es mayor, es inductivo. De lo contrario, es capacitivo. Se informa con "Estado del circuito " + estado + valor de phi en grados (phaseDegrees).
- Luego, cambia el elemento DOM dominanceText por el texto.
  - `Nota: InnerHTML o textContent?`

`setResonance()`

- Toma inductancia y capacitancia con getCircuitValues.
- Asigna el valor de 1 / sqrt(L\*C) a una variable omega0.
- Si omega0 es mayor a 200, no es posible setear la resonancia y nunca se actualiza (llamada a update). De lo contrario, el slider de frecuencia toma el valor de omega0, se informa la frecuencia de resonancia y se llama a update.
  - `Nota: Por revisar.`

`animate()`

- Llama a la función drawWaveforms que se encarga de dibujar el diagrama fasorial.
- Luego, se llama recursivamente para continuar con la animación.

`drawWaveforms()`

- Obtiene el contexto del canvas y lo guarda en una variable llamada ctx.
- Obtiene el canvas desde el DOM y lo guarda en una variable llamada canvas.
- Guarda todos los valores calculados en una variable values y también la escala de tiempo elegida.
- Guarda el tamaño del canvas para centrar los ejes. Luego, los dibuja.
- Dibuja las divisiones de tiempo con un ciclo for.

  - Dentro de drawWaveforms:
    `drawWave()` - Recibe: Amplitud, fase, color y etiqueta. - Dibuja la línea a través de ciclo for que va desde 0 a la cantidad de puntos indicada en variable points.

## REFERENCIAS

- Trabajo práctico final RLC 2024 \- Física 2, ISI B.
- [MDN getContext](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext)

## Entrega parcial Septiembre:

Simulador funcional con ciertos ajustes pendientes de responsive.

## Defectos conocidos

Problemas de resolución para tablets y tamaños intermedios entre PC y tablet. Solución: Sobreescribir los valores por defecto de lg y xl de Tailwind.

## Tecnologías utilizadas

| Herramienta      | Versión  | Uso en el proyecto      |
| ---------------- | -------- | ----------------------- |
| **HTML**         | `5`      | Estructura de la página |
| **Javascript**   | `ES13`   | Funcionamiento          |
| **Tailwind CSS** | `v4.1`   | CSS Framework           |
| **Chart.js**     | `v9.2.0` | Diseño de gráficas      |
