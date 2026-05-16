import { GetValidActionsForPiece } from '../engine/rules.js';

export class EventHandlers {
  constructor(gameState, boardRenderer, onMachineTurn) {
    this._gameState = gameState;
    this._renderer = boardRenderer;
    this._onMachineTurn = onMachineTurn;
    this._selectedPiece = null;
    this._validActions = [];
    this._Bind();
  }

  _Bind() {
    const container = document.getElementById('board-container');

    container.addEventListener('click', e => {
      const cell = e.target.closest('[data-col]');
      if (!cell) return;
      this._HandleCellClick(parseInt(cell.dataset.col), parseInt(cell.dataset.row));
    });

    container.addEventListener('keydown', e => {
      if (e.key === 'Escape') { this._Deselect(); return; }
      if (e.key === 'Enter' || e.key === ' ') {
        const cell = document.activeElement.closest('[data-col]') ?? document.activeElement;
        if (cell?.dataset?.col !== undefined) {
          e.preventDefault();
          this._HandleCellClick(parseInt(cell.dataset.col), parseInt(cell.dataset.row));
        }
      }
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        this._HandleArrowKey(e.key);
      }
    });
  }

  _HandleCellClick(col, row) {
    const gs = this._gameState;
    if (gs.status !== 'PLAYING') return;
    if (gs.activePlayer !== 'PLAYER') return;
    if (!this._renderer.IsInputEnabled()) return;

    const piece = gs.board.getCell(col, row);

    if (this._selectedPiece) {
      // Clicking the selected piece → try mutate, else deselect
      if (this._selectedPiece.col === col && this._selectedPiece.row === row) {
        const mutate = this._validActions.find(a => a.type === 'MUTATE');
        if (mutate) this._Execute(mutate);
        else this._Deselect();
        return;
      }

      // Try to execute an action toward target cell
      const action = this._validActions.find(
        a => a.targetCol === col && a.targetRow === row
      );
      if (action) { this._Execute(action); return; }

      // Click another own piece → switch selection
      if (piece && piece.owner === 'PLAYER') { this._Select(piece); return; }

      // Invalid target
      this._renderer.FlashInvalid(col, row);
      this._Deselect();
      return;
    }

    if (piece && piece.owner === 'PLAYER') this._Select(piece);
  }

  _Select(piece) {
    this._renderer.ClearHighlights();
    this._selectedPiece = piece;
    const colony = this._gameState.colonies.PLAYER;
    this._validActions = GetValidActionsForPiece(this._gameState.board, piece, colony);
    this._renderer.HighlightPiece(piece.col, piece.row);
    this._renderer.HighlightValidActions(this._validActions);
    this._renderer.GetCellElement(piece.col, piece.row).focus();
  }

  _Deselect() {
    this._selectedPiece = null;
    this._validActions = [];
    this._renderer.ClearHighlights();
  }

  async _Execute(action) {
    this._Deselect();
    this._renderer.SetInputEnabled(false);
    const ok = this._gameState.applyAction(action);
    if (ok) {
      await this._renderer.AnimateAction(action, this._gameState);
    }
    this._renderer.SetInputEnabled(true);

    // Trigger machine turn if game still going
    if (this._gameState.status === 'PLAYING' && this._gameState.activePlayer === 'MACHINE') {
      this._onMachineTurn();
    }
  }

  _HandleArrowKey(key) {
    const active = document.activeElement;
    if (!active?.dataset?.col) return;
    let col = parseInt(active.dataset.col);
    let row = parseInt(active.dataset.row);
    if (key === 'ArrowUp')    row = Math.max(0, row - 1);
    if (key === 'ArrowDown')  row = Math.min(7, row + 1);
    if (key === 'ArrowLeft')  col = Math.max(0, col - 1);
    if (key === 'ArrowRight') col = Math.min(7, col + 1);
    const target = this._renderer.GetCellElement(col, row);
    if (target) target.focus();
  }
}
