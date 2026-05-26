# QQSM - Juego estilo "¿Quién quiere ser millonario?" (Past Tense)

Aplicación web en **HTML + CSS + JavaScript** para practicar pasado simple en inglés con dinámica de concurso.

## Funcionalidades actuales

- Interfaz principal en inglés.
- Selección aleatoria de preguntas por partida (`QUESTIONS_PER_RUN = 10`).
- Escalera de dinero con **2 zonas seguras** (`safeLevelIndexes = [4, 7]`).
- Comodines:
  - `50-50`: elimina dos opciones incorrectas aleatorias.
  - `Ask Teacher for a Tip`: se puede marcar/desmarcar.
  - `Change Question`: cambia la pregunta actual (un solo uso).
- Flujo de juego: seleccionar opción + confirmar respuesta.
- Popups de final:
  - Victoria (si dinero final > `$0`).
  - Motivación (si termina en `$0`).
- Top 5 persistente (solo jugadores con premio > `$0`).
- Inicio solicitando nombre de participante.
- `New Player` para cambiar de participante.
- `Teacher Mode` como acceso administrativo separado del flujo de juego.
- Logo de marca de agua en panel principal (`logo_grande.png`).

## Sonidos incorporados

Se usan audios `.mp3` para eventos específicos:

- `gana premio.mp3`: popup de victoria (premio > `$0`).
- `perdio.mp3`: popup motivacional (termina en `$0`).
- `respuestacorrecta.mp3`: al confirmar respuesta correcta.
- `sonido antes de una pregunta.mp3`: antes de mostrar cada pregunta.
- `sonido al inicia juego nuevo player.mp3`:
  - al abrir popup de nombre con `New Player`
  - en primera carga, se reproduce en la primera interacción del usuario (por políticas de autoplay del navegador).
- `50_50 y tip.mp3`: al usar comodín `50-50` y al usar `Ask Teacher for a Tip`.

## Modo Profesor (Teacher Mode)

Archivo: `teacher_mode.html`

Permite editar banco de preguntas desde UI:

- Navegación tipo carrusel (una pregunta a la vez).
- Flechas `Previous/Next`.
- Al agregar una pregunta nueva, salta automáticamente a la última.
- Agregar / editar / borrar preguntas.
- Importar JSON.
- Exportar JSON.
- Guardar banco personalizado para el juego.
- Resetear al banco base (`qqsm_questions.json`).

El juego prioriza este banco custom y lo muestra como `Source: Teacher Bank`.

## Estructura del proyecto

```text
index.html
styles.css
app.js
teacher_mode.html
teacher_mode.css
teacher_mode.js
qqsm_questions.json
logo_grande.png
run_qqsm_server.bat
README.md
```

## Requisitos

- Navegador moderno (Edge, Chrome, Firefox).
- Python en PATH (si usarás servidor local con `http.server`).

## Ejecución recomendada (evitar CORS)

No abrir `index.html` con `file://` si quieres cargar JSON externo.

### Opción rápida

1. Ejecutar `run_qqsm_server.bat`.
2. Abrir `http://localhost:8000/`.

### Opción manual

```bash
python -m http.server 8000
```

Luego abrir `http://localhost:8000/`.

## Formato del banco JSON

Cada pregunta debe cumplir:

```json
{
  "question": "What is the past tense of \"go\"?",
  "options": ["goed", "went", "gone", "goes"],
  "answerIndex": 1
}
```

Reglas:

- `question`: string.
- `options`: arreglo de 4 strings no vacíos.
- `answerIndex`: entero de `0` a `3`.

## Persistencia local (`localStorage`)

- Puntajes: `qqsm_scores_v1`.
- Banco personalizado Teacher Mode: `qqsm_question_bank_v1`.

## Personalización rápida

- Preguntas por partida: `QUESTIONS_PER_RUN` en `app.js`.
- Escalera de dinero: `prizeLevels` en `app.js`.
- Zonas seguras: `safeLevelIndexes` en `app.js`.
- Estilos del juego: `styles.css`.
- Estilos Teacher Mode: `teacher_mode.css`.


