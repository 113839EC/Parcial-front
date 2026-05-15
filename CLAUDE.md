# Reglas del proyecto

## TypeScript

- Proyecto en **TypeScript** — todos los archivos en `scripts/`, compilados a `dist/`
- **Nunca usar `var`** — solo `const` o `let`
- **Siempre camelCase** para variables, funciones y parámetros
- **Tipar siempre** — variables, parámetros y retornos con su tipo explícito (`string`, `number`, `boolean`, etc.)

## Estructura de scripts

- `api.ts` — llamadas fetch a la API
- `game.ts` — lógica del juego, sin referencias al DOM
- `ui.ts` — manipulación del DOM y eventos
- `storage.ts` — localStorage y sessionStorage
- `index.ts` — entry point, inicialización
