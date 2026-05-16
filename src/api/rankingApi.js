const API_BASE = '/api/ranking';
const MAX_RETRIES = 3;

async function FetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  let delay = 500;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

export async function FetchRanking() {
  return FetchWithRetry(API_BASE);
}

export async function SaveRankingEntry(entry) {
  return FetchWithRetry(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
}
