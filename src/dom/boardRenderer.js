import { CreatePieceElement, UpdatePieceElement } from './pieceRenderer.js';
import { AnimateMove, AnimateAttack, AnimateMutate } from './animationManager.js';

export class BoardRenderer {
  constructor(containerId) {
    this._container = document.getElementById(containerId);
    this._cells = [];       // DOM elements, indexed by row*8+col
    this._prevKeys = new Array(64).fill(null); // piece fingerprints
    this._animating = false;
    this._inputEnabled = true;
    this._Build();
  }

  _Build() {
    this._container.innerHTML = '';
    this._container.setAttribute('role', 'grid');
    this._container.setAttribute('aria-label', 'Tablero Dominio 8×8');

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = document.createElement('div');
        cell.setAttribute('role', 'gridcell');
        cell.dataset.col = col;
        cell.dataset.row = row;
        const isDark = (col + row) % 2 === 0;
        cell.className = `cell ${isDark ? 'cell-dark' : 'cell-light'}`;
        cell.setAttribute('tabindex', '-1');
        this._container.appendChild(cell);
        this._cells[row * 8 + col] = cell;
      }
    }
  }

  Render(gameState) {
    for (let i = 0; i < 64; i++) {
      const piece = gameState.board.cells[i];
      this._RenderCell(i, piece);
      this._prevKeys[i] = this._Key(piece);
    }
  }

  Update(gameState) {
    for (let i = 0; i < 64; i++) {
      const piece = gameState.board.cells[i];
      const key = this._Key(piece);
      if (key !== this._prevKeys[i]) {
        this._RenderCell(i, piece);
        this._prevKeys[i] = key;
      }
    }
  }

  async AnimateAction(action, gameState) {
    this._animating = true;
    const piece = gameState.board.cells.find
      ? null // already applied, use board position
      : null;

    if (action.type === 'MOVE') {
      const idx = action.targetRow * 8 + action.targetCol;
      await AnimateMove(this._cells[idx]);
    } else if (action.type === 'ATTACK') {
      const idx = action.targetRow * 8 + action.targetCol;
      await AnimateAttack(this._cells[idx]);
    } else if (action.type === 'MUTATE') {
      // piece stays in place — we find it by pieceId
      for (let i = 0; i < 64; i++) {
        const p = gameState.board.cells[i];
        if (p && p.id === action.pieceId) {
          await AnimateMutate(this._cells[i]);
          break;
        }
      }
    }
    this._animating = false;
  }

  HighlightPiece(col, row) {
    this._cells[row * 8 + col].classList.add('cell-selected');
  }

  HighlightValidActions(actions) {
    for (const action of actions) {
      const idx = action.targetRow * 8 + action.targetCol;
      const cls = action.type === 'MOVE'   ? 'cell-move'
                : action.type === 'ATTACK' ? 'cell-attack'
                : 'cell-mutate';
      this._cells[idx].classList.add(cls);
    }
  }

  ClearHighlights() {
    for (const cell of this._cells) {
      cell.classList.remove('cell-selected', 'cell-move', 'cell-attack', 'cell-mutate', 'cell-invalid');
    }
  }

  FlashInvalid(col, row) {
    const idx = row * 8 + col;
    const cell = this._cells[idx];
    cell.classList.add('cell-invalid');
    setTimeout(() => cell.classList.remove('cell-invalid'), 400);
  }

  ShowInvalidFeedback(detail) {
    // Flash all cells briefly to indicate invalid action
    this._container.classList.add('board-shake');
    setTimeout(() => this._container.classList.remove('board-shake'), 400);
  }

  SetInputEnabled(enabled) {
    this._inputEnabled = enabled;
    this._container.classList.toggle('board-disabled', !enabled);
  }

  IsAnimating() { return this._animating; }
  IsInputEnabled() { return this._inputEnabled; }

  GetCellElement(col, row) {
    return this._cells[row * 8 + col];
  }

  _RenderCell(index, piece) {
    const cell = this._cells[index];
    // Remove existing piece child
    const existing = cell.querySelector('.piece');
    if (existing) existing.remove();

    if (piece) {
      cell.appendChild(CreatePieceElement(piece));
      cell.setAttribute('aria-label', piece ? `Celda con pieza en col ${piece.col + 1} fila ${piece.row + 1}` : '');
    } else {
      cell.removeAttribute('aria-label');
    }
  }

  _Key(piece) {
    return piece ? `${piece.id}:${piece.type}` : null;
  }
}
