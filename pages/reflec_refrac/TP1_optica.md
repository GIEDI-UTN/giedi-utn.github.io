---
titulo: "Reflexión y Refracción"
materia: "Física 1"
rev: "26.0"
año: "2026"
resumen: "Determinar experimentalmente el comportamiento de un rayo de luz al incidir sobre una placa de material transparente, modelando el sistema mediante la Ley de Snell."
---

## Objetivo General

Determinar experimentalmente el comportamiento de un rayo de luz al incidir sobre una placa de material transparente, modelando el sistema mediante la **Ley de Snell**, y obtener los índices de refracción relativo y absoluto de los medios intervinientes a partir de mediciones angulares en un simulador virtual.

## Marco Teórico

### Alcance y limitaciones de la óptica geométrica

La óptica geométrica describe la propagación de la luz en términos de rayos que se desplazan en línea recta, siendo válida cuando las dimensiones características del sistema son mucho mayores que la longitud de onda de la luz.

Este modelo permite analizar fenómenos como la reflexión y la refracción mediante relaciones geométricas simples. Sin embargo, no contempla efectos ondulatorios como la interferencia o la difracción.

### Ley de la Refracción (Ley de Snell)

Cuando un rayo de luz atraviesa la interfaz entre dos medios transparentes con distintos índices de refracción, su dirección de propagación cambia según:

$$n_1 \cdot \sin(\theta_1) = n_2 \cdot \sin(\theta_2)$$

donde:

- $n_1$, $n_2$: índices de refracción de los medios
- $\theta_1$: ángulo de incidencia (respecto a la normal)
- $\theta_2$: ángulo de refracción

Esta expresión permite determinar el índice de refracción de un material desconocido a partir de mediciones angulares.

### Ley de la Reflexión

Cuando un rayo incide sobre una superficie, parte de la energía se refleja cumpliendo:

$$\theta_i = \theta_r$$

donde $\theta_i$ es el ángulo de incidencia y $\theta_r$ el de reflexión. Ambos se miden respecto a la **normal** a la superficie.

### Reflexión Total Interna

Cuando la luz se propaga desde un medio de mayor índice de refracción hacia uno de menor índice, existe un ángulo límite denominado **ángulo crítico**, para el cual el rayo refractado se propaga tangencialmente a la interfaz.

Para ángulos de incidencia mayores que este valor, no existe refracción. El ángulo crítico se calcula como:

$$\theta_c = \arcsin\!\left(\frac{n_2}{n_1}\right) \quad \text{con } n_1 > n_2$$

### Consideraciones Metrológicas

Las principales fuentes de variabilidad en este tipo de mediciones son:

- Resolución del instrumento (transportador)
- Alineación del rayo incidente
- Precisión en la lectura angular
- Aproximaciones del modelo geométrico

Se recomienda realizar múltiples mediciones para reducir la influencia de errores aleatorios y evaluar la dispersión de los resultados.

## Desarrollo

### Modelo del sistema físico

Se considera la incidencia de un rayo de luz desde un medio transparente sobre una placa plana de otro material, produciéndose fenómenos de reflexión y refracción en las interfaces.

El análisis del sistema se realizará bajo las siguientes hipótesis:

- Los medios son homogéneos e isotrópicos
- La luz se propaga según el modelo de óptica geométrica
- Las superficies de la placa son planas y paralelas
- No se consideran efectos de dispersión ni absorción

## Experimento 1: Índice de Refracción Relativo

**Objetivo:** Determinar el índice de refracción relativo entre el medio exterior y el material de la placa a partir de mediciones angulares.

### Procedimiento

1. Seleccionar un **medio exterior** conocido y el **material de la placa**
2. Ajustar el ángulo de incidencia $\theta_1$
3. Medir el ángulo de refracción $\theta_2$ en el interior de la placa
4. Calcular el índice relativo:

$$n_{rel} = \frac{\sin(\theta_1)}{\sin(\theta_2)}$$

5. Repetir para distintos ángulos de incidencia y analizar la constancia del valor obtenido

### Tabla de datos

| $\theta_1$ (°) | $\theta_2$ (°) | $\sin(\theta_1)$ | $\sin(\theta_2)$ | $n_{rel}$ |
| :------------: | :------------: | :--------------: | :--------------: | :-------: |
|                |                |                  |                  |           |
|                |                |                  |                  |           |
|                |                |                  |                  |           |

## Experimento 2: Índice de Refracción Absoluto

El valor obtenido en el Experimento 1 es un índice **relativo** entre medios, no contrastable directamente con valores tabulados (que se expresan respecto al vacío).

### Parte A: Índice absoluto de la placa

Usando el vacío como referencia ($n_{vac} = 1{,}00$):

$$n_{placa} = \frac{\sin(\theta_{vac})}{\sin(\theta_{placa})}$$

Repetir para distintos ángulos y calcular un valor promedio.

### Parte B: Índice del medio exterior

Con $n_{placa}$ conocido, aplicar Snell para obtener el índice del medio exterior:

$$n_{medio} = n_{placa} \cdot \frac{\sin(\theta_{placa})}{\sin(\theta_{medio})}$$

## Actividades complementarias

- **Metrología:** Detectar los posibles orígenes de la incertidumbre. Analizar la dispersión de error.
- **Experimentación real:** Describir cómo puede lograrse la condición de vacío ($n = 1{,}00$) en un laboratorio real.

## Estructura del Informe

El informe deberá incluir:

1. Descripción de las experiencias con sus explicaciones
2. Desarrollo de los modelos de cálculo desde leyes fundamentales
3. Resultados presentados en tablas y gráficas
4. Comparación de resultados con valores de referencia y discusión
5. Conclusiones
6. Bibliografía y referencias

## Bibliografía

- Halliday, D. y Resnick, R. — _Física para Estudiantes de Ciencias e Ingeniería_, 5ª ed. Ed. Continental, 1964.
- Serway, R. A. — _Física_, Tomo I y II, 4ª ed. McGraw Hill.
- Tipler, D. — _Física_, Tomo II. Reverté.
