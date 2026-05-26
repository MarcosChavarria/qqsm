# QQSM - Juego estilo "¿Quién quiere ser millonario?" (English Past Tense)

Aplicación web en **HTML + CSS + JavaScript** que simula una dinámica tipo *Who Wants to Be a Millionaire?* para practicar el **pasado en inglés** (verbos regulares e irregulares).

## Características

- Interfaz de juego con:
  - Pregunta actual
  - Opciones de respuesta
  - Confirmación de respuesta
  - Escalera de dinero por niveles
  - Acumulado de premio
- Banco de preguntas en archivo externo JSON (`qqsm_questions.json`).
- Selección aleatoria de preguntas por partida (run).
- Comodines:
  - `50-50` (elimina dos opciones incorrectas al azar)
  - `Ask Teacher` (marcar/desmarcar)
  - `Ask ChatGPT` (marcar/desmarcar)
- Indicador de origen de preguntas:
  - `Source: JSON` si se cargó desde archivo JSON
  - `Source: Fallback` si usó preguntas internas de respaldo

## Estructura esperada

```text
QQSM.HTML
qqsm_questions.json
run_qqsm_server.bat
```

## Requisitos

- Navegador moderno (Edge, Chrome, Firefox).
- Python instalado (solo para ejecutar servidor local simple con `http.server`).

## Ejecución recomendada (evitar CORS)

Si abres el HTML con `file://`, el navegador puede bloquear la lectura del JSON por CORS.

Usa servidor local:

1. Ejecuta:
   - `run_qqsm_server.bat`
2. Abre en navegador:
   - `http://localhost:8000/QQSM.HTML`

Alternativa manual:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000/QQSM.HTML`.

## Formato del JSON de preguntas

Cada pregunta debe tener esta estructura:

```json
{
  "question": "What is the past tense of \"go\"?",
  "options": ["goed", "went", "gone", "goes"],
  "answerIndex": 1
}
```

Reglas:

- `question`: texto de la pregunta.
- `options`: arreglo con opciones (idealmente 4).
- `answerIndex`: índice de la opción correcta (base 0).

## Personalización rápida

- Cambiar cantidad de preguntas por partida:
  - En `QQSM.HTML`, variable `QUESTIONS_PER_RUN`.
- Ajustar escalera de dinero:
  - En `QQSM.HTML`, arreglo `prizeLevels`.
- Modificar estilo visual:
  - Variables CSS en `:root`.

## Objetivo pedagógico

Reforzar la gramática del **pasado simple** en inglés mediante preguntas de:

- Cultura general
- Caricaturas noventeras
- Películas populares
- Uso de verbos regulares e irregulares

## Posibles mejoras futuras

- Cronómetro por pregunta.
- Niveles de dificultad progresivos.
- Sonidos/efectos estilo concurso.
- Guardado de puntajes.
- Modo profesor con carga de banco de preguntas desde UI.

