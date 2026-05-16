# USO_IA.md — Herramientas de IA utilizadas en el desarrollo

## Herramientas utilizadas

### Claude Code (Anthropic) — Claude Sonnet 4.6
Asistente de IA principal utilizado durante el desarrollo del proyecto.

## Partes del proyecto donde se empleó

| Módulo / Archivo | Uso de IA | Revisión humana |
|-----------------|-----------|-----------------|
| `src/engine/piece.js` | Generación completa de la clase `Piece` con ciclo de mutación | Verificación del ciclo ROCA→ESPINA→BRUMA→ROCA |
| `src/engine/board.js` | Generación completa de la clase `Board` | Revisión de indexado row*8+col y métodos adyacentes |
| `src/engine/rules.js` | Generación del módulo de validaciones | Verificación detallada del matchup y condición de adyacencia |
| `src/engine/gameState.js` | Generación del motor de estado con CustomEvents | Revisión del flujo applyAction, _checkVictory y energía |
| `src/engine/scoring.js` | Generación del módulo de puntaje final | Verificación de las 4 celdas centrales y condiciones de bonus |
| `src/engine/ai/aiEasy.js` | Generación de IA aleatoria | Revisión de uso de GetAllValidActions |
| `src/engine/ai/aiHard.js` | Generación de heurística depth-1 | Validación de prioridades: ataque > mutación táctica > movimiento |
| `src/api/configApi.js` | Generación con fallback a config embebida | Prueba manual de fetch y fallback |
| `src/api/rankingApi.js` | Generación con retry + backoff exponencial | Revisión de la lógica de reintentos |
| `src/persistence/storage.js` | Generación del wrapper localStorage | Prueba en modo incógnito |
| `src/dom/boardRenderer.js` | Generación del renderizado incremental con diff de fingerprints | Revisión del manejo de celda seleccionada y animaciones |
| `src/dom/eventHandlers.js` | Generación del flujo de selección/acción y navegación teclado | Verificación del flujo: seleccionar → confirmar → turno máquina |
| `src/dom/pieceRenderer.js` | Generación de elementos DOM con atributos ARIA | Revisión de aria-label descriptivos |
| `src/dom/animationManager.js` | Generación de animaciones CSS con prefers-reduced-motion | Prueba manual en sistema con reducción de movimiento |
| `src/dom/uiState.js` | Generación de estados loading/success/error | Revisión de aria-live y roles ARIA |
| `src/styles/main.css` | Generación de estilos Tailwind + CSS personalizado | Revisión responsive y contraste |
| `src/main.js` | Generación del bootstrap completo: API→engine→DOM→eventos | Revisión del flujo de turno máquina y manejo de errores |
| `index.html` | Generación del markup semántico de las 4 pantallas | Verificación de roles ARIA (grid, gridcell, live regions) |
| `public/data/config.json` | Generación de 3 variantes de configuración válidas | Validación de restricción 3R+3E+2B por fila |

## Criterio de revisión y validación humana

Cada output fue revisado según:

1. **Corrección de reglas**: comparado contra el SDD v1.0 sección por sección.
2. **Separación de capas**: verificado que `engine/` no importe ni referencie el DOM.
3. **Accesibilidad**: revisados atributos ARIA (`role="grid"`, `role="gridcell"`, `aria-live`).
4. **Seguridad de nulos**: verificados accesos a propiedades de piezas potencialmente nulas.
5. **Prueba funcional**: ejecutado el juego completo verificando turnos, victoria, y ranking.
