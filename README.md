# Dominio — Juego de Estrategia por Turnos

Juego de estrategia para un jugador contra una IA sobre un tablero de 8×8. Dos tipos de IA: fácil (aleatoria) y difícil (heurística).

## Reglas resumidas

- Tablero 8×8. Cada jugador arranca con **8 piezas** en su fila: 3 Rocas, 3 Espinas, 2 Brumas.
- **Matchup (ciclo):** Roca ⬟ vence Bruma ◎ · Espina ✦ vence Roca ⬟ · Bruma ◎ vence Espina ✦
- **Acciones por turno (elige una):**
  - **Mover** — celda adyacente ortogonal vacía
  - **Atacar** — pieza enemiga adyacente con matchup favorable (+10 pts)
  - **Mutar** — avanza el tipo en el ciclo Roca→Espina→Bruma→Roca (cuesta 2⚡, −5 pts)
- **Energía:** empieza en 5, gana +1 por turno, tope 10.
- **Fin:** sin piezas → derrota · 100 turnos → gana quien tenga más puntos.
- **Puntaje:** +10 captura · +15 control centro (≥3/4 celdas) · +5 bonus economía (≥6 piezas) · −5 por mutación.

## Requisitos

- Node.js ≥ 18

## Instalación y ejecución

```bash
npm install
npm run dev       # Vite (puerto 5173) + json-server (puerto 3001)
```

Abrí `http://localhost:5173` en el navegador.

Para compilar producción:
```bash
npm run build
npm run preview
```

## Estructura del proyecto

```
src/
  engine/       — lógica pura (sin DOM)
    piece.js    — clase Pieza
    board.js    — tablero 8×8
    rules.js    — validaciones (canMove, canAttack, canMutate)
    gameState.js — estado central, emite CustomEvents
    scoring.js  — cálculo de puntaje final
    ai/
      aiEasy.js — IA fácil: acción aleatoria válida
      aiHard.js — IA difícil: heurística depth-1
  api/
    configApi.js   — fetch /data/config.json
    rankingApi.js  — fetch/POST a json-server
  dom/
    boardRenderer.js   — renderiza tablero (incremental)
    pieceRenderer.js   — crea elementos pieza
    animationManager.js — animaciones CSS
    eventHandlers.js   — clicks, teclado, lógica de selección
    uiState.js         — estados loading/success/error
  persistence/
    storage.js  — wrapper localStorage
  styles/main.css
  main.js       — bootstrap: API → engine → DOM
public/
  data/
    config.json   — variantes de tablero
    ranking.json  — ranking (json-server)
```

## Niveles de dificultad

| Nivel | Estrategia |
|-------|-----------|
| **Fácil** | Elige una acción válida al azar. Predecible, ideal para aprender. |
| **Difícil** | Heurística: prioriza ataques favorables → mutaciones que desbloquean ataques → avance hacia el centro o piezas vulnerables. Raramente desperdicia turnos. |

## Decisiones técnicas

| Decisión | Justificación |
|----------|--------------|
| Vanilla JS + ES Modules | Sin framework según requisito. Total control del DOM. Facilita separación engine/DOM. |
| Vite | HMR instantáneo, soporte nativo de ESM, proxy a json-server sin config extra. |
| CustomEvent para engine→DOM | Desacopla capas sin bus de eventos externo. Engine no importa el DOM. |
| localStorage como respaldo | API nativa, sin dependencias. El ranking persiste offline. |
| Heurística depth-1 para IA difícil | Diferencia observable sin overhead computacional. Minimax innecesario para este tamaño de árbol. |
| Tailwind CSS | Clases utilitarias, responsive sin CSS custom excesivo. |
