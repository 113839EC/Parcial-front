const KEY_PREFS   = 'dominio_prefs';
const KEY_RANKING = 'dominio_ranking';

function SafeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function SafeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch { return false; }
}

export function SavePreferences(prefs) {
  return SafeSet(KEY_PREFS, prefs);
}

export function LoadPreferences() {
  return SafeGet(KEY_PREFS) ?? {};
}

export function SaveRankingLocal(ranking) {
  return SafeSet(KEY_RANKING, ranking);
}

export function LoadRankingLocal() {
  return SafeGet(KEY_RANKING) ?? [];
}
