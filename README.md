# QQSM - Juego estilo "¿Quién quiere ser millonario?" (Past Tense)

Aplicación web en **HTML + CSS + JavaScript** para practicar pasado simple en inglés (verbos regulares e irregulares) con dinámica tipo concurso.

## Estado actual del proyecto

- Interfaz principal en inglés.
- Preguntas aleatorias por partida (10 por run).
- Escalera de dinero con **2 zonas seguras** (checkpoints).
- Comodines:
  - `50-50`: elimina dos opciones incorrectas aleatorias.
  - `Ask Teacher for a Tip`: se puede marcar/desmarcar.
  - `Change Question`: cambia la pregunta actual (un solo uso).
- Flujo de respuesta con selección + confirmación.
- Popups de cierre:
  - Celebración si termina con dinero.
  - Mensaje motivacional si termina en `$0`.
- Efectos de sonido estilo concurso (Web Audio API).
- Top 5 persistente con `localStorage` (solo puntajes > `$0`).
- Inicio de partida solicitando nombre del participante.
- Botón `New Player` para cambiar de participante.
- Botón `Teacher Mode` fuera del flujo del juego (zona administrativa inferior).

## Modo Profesor (Teacher Mode)

Incluye editor visual de banco de preguntas desde UI:

- Archivo: `teacher_mode.html`
- Navegación tipo carrusel (una pregunta a la vez).
- Flechas `Previous/Next` para moverse entre preguntas.
- Al crear una nueva pregunta, salta automáticamente a la última.
- Permite:
  - agregar preguntas
  - editar texto/opciones/respuesta correcta
  - borrar preguntas
  - importar JSON
  - exportar JSON
  - guardar banco personalizado para el juego
  - resetear al banco por defecto (`qqsm_questions.json`)

El banco personalizado se guarda en `localStorage` (`qqsm_question_bank_v1`) y el juego lo detecta automáticamente (`Source: Teacher Bank`).

## Estructura de archivos

```text
index.html
styles.css
app.js
teacher_mode.html
teacher_mode.css
teacher_mode.js
qqsm_questions.json
run_qqsm_server.bat
README.md
```

## Requisitos

- Navegador moderno (Edge, Chrome, Firefox).
- Python en PATH (para servidor local simple).

## Ejecución recomendada (evitar CORS)

No abras `index.html` con `file://` porque el navegador puede bloquear la carga del JSON.

### Opción rápida

1. Ejecuta `run_qqsm_server.bat`
2. Abre `http://localhost:8000/`

### Opción manual

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000/`.

## Formato del banco de preguntas (JSON)

Cada pregunta debe cumplir:

```json
{
  "question": "What is the past tense of \"go\"?",
  "options": ["goed", "went", "gone", "goes"],
  "answerIndex": 1
}
```

Reglas:

- `question`: string
- `options`: arreglo de 4 strings no vacíos
- `answerIndex`: entero entre `0` y `3`

## Persistencia local

- Puntajes: `localStorage` clave `qqsm_scores_v1`
- Banco custom de preguntas: `localStorage` clave `qqsm_question_bank_v1`

## Personalización rápida

- Cantidad de preguntas por run: `QUESTIONS_PER_RUN` en `app.js`.
- Escalera de dinero: `prizeLevels` en `app.js`.
- Zonas seguras: `safeLevelIndexes` en `app.js`.
- Estilos principales: `styles.css`.
- Estilos Teacher Mode: `teacher_mode.css`.


