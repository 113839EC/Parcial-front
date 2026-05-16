import './styles/main.css';
import { GameState } from './engine/gameState.js';
import { AIEasy } from './engine/ai/aiEasy.js';
import { AIHard } from './engine/ai/aiHard.js';
import { CalculateFinalScores, GetScoreBreakdown } from './engine/scoring.js';
import { FetchConfig } from './api/configApi.js';
import { FetchRanking, SaveRankingEntry } from './api/rankingApi.js';
import { BoardRenderer } from './dom/boardRenderer.js';
import { EventHandlers } from './dom/eventHandlers.js';
import { UIState } from './dom/uiState.js';
import { SavePreferences, LoadPreferences, SaveRankingLocal, LoadRankingLocal } from './persistence/storage.js';

// ── State ──────────────────────────────────────────────
let config = null;
let gameState = null;
let ai = null;
let boardRenderer = null;
let eventHandlers = null;
let currentPlayerName = 'Jugador';
const uiState = new UIState();

// ── Screen management ──────────────────────────────────
function ShowScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Boot ───────────────────────────────────────────────
async function Init() {
  uiState.SetLoading('config-status', 'Cargando configuración…');
  try {
    config = await FetchConfig();
    PopulateVariants(config.variants);
    uiState.SetSuccess('config-status', 'Configuración lista.');
  } catch {
    uiState.SetError('config-status', 'Error al cargar configuración. Usando valores por defecto.');
    config = {
      variants: [{
        id: 'default', name: 'Estándar',
        playerRow:  ['ROCA','ROCA','ROCA','ESPINA','ESPINA','ESPINA','BRUMA','BRUMA'],
        machineRow: ['BRUMA','BRUMA','ESPINA','ESPINA','ESPINA','ROCA','ROCA','ROCA']
      }]
    };
    PopulateVariants(config.variants);
  }

  const prefs = LoadPreferences();
  if (prefs.playerName)  document.getElementById('player-name').value = prefs.playerName;
  if (prefs.difficulty)  document.getElementById('difficulty').value  = prefs.difficulty;
  if (prefs.variant)     document.getElementById('variant').value     = prefs.variant;

  document.getElementById('start-form').addEventListener('submit', e => {
    e.preventDefault();
    StartGame();
  });
  document.getElementById('ranking-btn').addEventListener('click', () => ShowRankingScreen());
  document.getElementById('result-ranking-btn').addEventListener('click', () => ShowRankingScreen());
  document.getElementById('play-again-btn').addEventListener('click', () => ShowScreen('start-screen'));
  document.getElementById('ranking-back-btn').addEventListener('click', () => ShowScreen('start-screen'));
  document.getElementById('surrender-btn').addEventListener('click', ConfirmSurrender);

  ShowScreen('start-screen');
}

function PopulateVariants(variants) {
  const sel = document.getElementById('variant');
  sel.innerHTML = variants.map(v =>
    `<option value="${v.id}">${v.name}</option>`
  ).join('');
}

// ── Start game ─────────────────────────────────────────
function StartGame() {
  const playerName = document.getElementById('player-name').value.trim() || 'Jugador';
  const difficulty = document.getElementById('difficulty').value;
  const variantId  = document.getElementById('variant').value;
  const variant    = config.variants.find(v => v.id === variantId) ?? config.variants[0];

  currentPlayerName = playerName;
  SavePreferences({ playerName, difficulty, variant: variantId });

  gameState = new GameState();
  gameState.initialize(variant);
  ai = difficulty === 'HARD' ? new AIHard() : new AIEasy();

  boardRenderer = new BoardRenderer('board-container');
  boardRenderer.Render(gameState);

  eventHandlers = new EventHandlers(gameState, boardRenderer, HandleMachineTurn);

  gameState.addEventListener('gameStateChanged', () => {
    boardRenderer.Update(gameState);
    UpdatePanel(difficulty);
  });
  gameState.addEventListener('invalidAction', e => {
    boardRenderer.ShowInvalidFeedback(e.detail);
    ShowInvalidMsg(e.detail.reason);
  });
  gameState.addEventListener('gameFinished', e => {
    setTimeout(() => ShowResultScreen(e.detail, difficulty), 600);
  });

  UpdatePanel(difficulty);
  document.getElementById('invalid-action-msg').textContent = '';

  ShowScreen('game-screen');
}

// ── Machine turn ───────────────────────────────────────
async function HandleMachineTurn() {
  if (gameState.status !== 'PLAYING' || gameState.activePlayer !== 'MACHINE') return;

  boardRenderer.SetInputEnabled(false);
  await Sleep(650);

  const action = ai.getNextAction(gameState);
  if (action) {
    gameState.applyAction(action);
    await boardRenderer.AnimateAction(action, gameState);
  }
  boardRenderer.SetInputEnabled(true);

  if (gameState.status === 'PLAYING' && gameState.activePlayer === 'MACHINE') {
    // Machine has no valid actions — pass turn
    gameState._nextTurn();
    gameState.dispatchEvent(new CustomEvent('gameStateChanged', { detail: gameState.toJSON() }));
    HandleMachineTurn();
  }
}

// ── Panel update ───────────────────────────────────────
function UpdatePanel(difficulty) {
  const gs = gameState;
  document.getElementById('turn-counter').textContent = gs.turn + 1;
  document.getElementById('active-player').textContent =
    gs.activePlayer === 'PLAYER' ? `${currentPlayerName} (Tú)` : 'Máquina';
  document.getElementById('active-player').className =
    gs.activePlayer === 'PLAYER' ? 'text-blue-300 font-bold' : 'text-red-300 font-bold';

  document.getElementById('player-energy').textContent = gs.colonies.PLAYER.energy;
  document.getElementById('machine-energy').textContent = gs.colonies.MACHINE.energy;
  document.getElementById('player-score').textContent  = gs.scores.PLAYER;
  document.getElementById('machine-score').textContent = gs.scores.MACHINE;
  document.getElementById('player-pieces').textContent  = gs.colonies.PLAYER.pieces.length;
  document.getElementById('machine-pieces').textContent = gs.colonies.MACHINE.pieces.length;

  const progressEl = document.getElementById('turn-progress');
  if (progressEl) progressEl.style.width = `${(gs.turn / 100) * 100}%`;

  UpdateHistory();
}

function UpdateHistory() {
  const list = document.getElementById('action-history');
  const last5 = gameState.history.slice(-5).reverse();
  const ACTION_LABEL = { MOVE: 'Movió', ATTACK: 'Atacó', MUTATE: 'Mutó' };
  list.innerHTML = last5.map(a => {
    const cls = a.player === 'PLAYER' ? 'player-action' : 'machine-action';
    const who = a.player === 'PLAYER' ? currentPlayerName : 'Máquina';
    return `<div class="history-item ${cls}">${who}: ${ACTION_LABEL[a.type] ?? a.type} (${a.targetCol},${a.targetRow})</div>`;
  }).join('');
}

function ShowInvalidMsg(reason) {
  const el = document.getElementById('invalid-action-msg');
  el.textContent = reason;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.textContent = ''; }, 3000);
}

// ── Surrender ──────────────────────────────────────────
function ConfirmSurrender() {
  if (confirm(`¿Seguro que querés rendirte, ${currentPlayerName}?`)) {
    gameState._finish('MACHINE');
  }
}

// ── Result screen ──────────────────────────────────────
async function ShowResultScreen(detail, difficulty) {
  const { winner, scores } = detail;

  if (!gameState._finalScoresApplied) {
    CalculateFinalScores(gameState);
    gameState._finalScoresApplied = true;
  }
  const breakdown = GetScoreBreakdown(gameState);

  const winnerLabel = winner === 'PLAYER' ? `¡Ganaste, ${currentPlayerName}!`
    : winner === 'MACHINE' ? '¡Ganó la Máquina!'
    : '¡Empate!';

  document.getElementById('result-title').textContent = winnerLabel;
  document.getElementById('result-player-score').textContent = gameState.scores.PLAYER;
  document.getElementById('result-machine-score').textContent = gameState.scores.MACHINE;

  document.getElementById('result-breakdown').innerHTML = `
    <div class="grid grid-cols-3 gap-2 text-sm text-slate-300">
      <div class="text-slate-400 font-medium">Concepto</div>
      <div class="text-blue-300 font-medium text-center">Tú</div>
      <div class="text-red-300 font-medium text-center">Máquina</div>
      <div>Capturas (×10)</div>
      <div class="text-center">${breakdown.capturePoints.PLAYER}</div>
      <div class="text-center">${breakdown.capturePoints.MACHINE}</div>
      <div>Control centro</div>
      <div class="text-center">${breakdown.centerBonus.PLAYER}</div>
      <div class="text-center">${breakdown.centerBonus.MACHINE}</div>
      <div>Bonus economía</div>
      <div class="text-center">${breakdown.economyBonus.PLAYER}</div>
      <div class="text-center">${breakdown.economyBonus.MACHINE}</div>
      <div>Penaliz. mutaciones</div>
      <div class="text-center text-red-400">${breakdown.mutationPenalties.PLAYER}</div>
      <div class="text-center text-red-400">${breakdown.mutationPenalties.MACHINE}</div>
    </div>
  `;

  // Save ranking entry
  const entry = {
    id: crypto.randomUUID(),
    playerName: currentPlayerName,
    playerScore: gameState.scores.PLAYER,
    machineScore: gameState.scores.MACHINE,
    winner,
    turns: gameState.turn,
    difficulty,
    date: new Date().toISOString()
  };

  const localRanking = LoadRankingLocal();
  localRanking.unshift(entry);
  SaveRankingLocal(localRanking.slice(0, 50));

  SaveRankingEntry(entry).catch(() => {});

  ShowScreen('result-screen');
}

// ── Ranking screen ─────────────────────────────────────
async function ShowRankingScreen() {
  ShowScreen('ranking-screen');
  uiState.SetLoading('ranking-status', 'Cargando ranking…');

  let ranking = [];
  try {
    const data = await FetchRanking();
    ranking = Array.isArray(data) ? data : (data.ranking ?? []);
    uiState.Clear('ranking-status');
  } catch {
    ranking = LoadRankingLocal();
    uiState.SetError('ranking-status', 'API no disponible. Mostrando ranking local.');
  }

  ranking.sort((a, b) => b.playerScore - a.playerScore);
  const top10 = ranking.slice(0, 10);

  const WINNER_LABEL = { PLAYER: '✓ Jugador', MACHINE: '✗ Máquina', DRAW: '~ Empate' };
  const tbody = top10.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${e.playerName ?? '—'}</td>
      <td>${e.playerScore} – ${e.machineScore}</td>
      <td>${WINNER_LABEL[e.winner] ?? e.winner}</td>
      <td>${e.difficulty === 'HARD' ? 'Difícil' : 'Fácil'}</td>
      <td>${e.turns}</td>
      <td>${FormatDate(e.date)}</td>
    </tr>
  `).join('');

  document.getElementById('ranking-tbody').innerHTML =
    top10.length ? tbody : '<tr><td colspan="7" class="text-center text-slate-500 py-4">Sin partidas aún.</td></tr>';
}

function FormatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
  catch { return iso; }
}

function Sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Start ──────────────────────────────────────────────
Init();
