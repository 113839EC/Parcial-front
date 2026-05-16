const DEFAULT_CONFIG = {
  variants: [
    {
      id: 'default',
      name: 'Configuración estándar',
      playerRow:  ['ROCA', 'ROCA', 'ROCA', 'ESPINA', 'ESPINA', 'ESPINA', 'BRUMA', 'BRUMA'],
      machineRow: ['BRUMA', 'BRUMA', 'ESPINA', 'ESPINA', 'ESPINA', 'ROCA', 'ROCA', 'ROCA']
    }
  ],
  difficulty: ['EASY', 'HARD']
};

export async function FetchConfig() {
  try {
    const res = await fetch('/data/config.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    console.warn('configApi: using default config (API unavailable)');
    return DEFAULT_CONFIG;
  }
}
