import { Board } from './board.js';
import { Piece } from './piece.js';
import { ValidateAction, GetAllValidActions } from './rules.js';
import { CalculateFinalScores } from './scoring.js';

const INITIAL_ENERGY = 5;
const MAX_ENERGY = 10;
const MAX_TURNS = 100;

export class GameState extends EventTarget {
  constructor() {
    super();
    this.board = new Board();
    this.colonies = {
      PLAYER:  { pieces: [], energy: INITIAL_ENERGY },
      MACHINE: { pieces: [], energy: INITIAL_ENERGY }
    };
    this.turn = 0;
    this.activePlayer = 'PLAYER';
    this.scores = { PLAYER: 0, MACHINE: 0 };
    this.history = [];
    this.status = 'PLAYING';
    this.winner = null;
    this._finalScoresApplied = false;
  }

  initialize(variant) {
    variant.playerRow.forEach((type, col) => {
      const piece = new Piece(type, 'PLAYER', col, 7);
      this.colonies.PLAYER.pieces.push(piece);
      this.board.setPiece(col, 7, piece);
    });
    variant.machineRow.forEach((type, col) => {
      const piece = new Piece(type, 'MACHINE', col, 0);
      this.colonies.MACHINE.pieces.push(piece);
      this.board.setPiece(col, 0, piece);
    });
  }

  applyAction(action) {
    if (this.status !== 'PLAYING') return false;

    const result = ValidateAction(this, action);
    if (!result.valid) {
      this.dispatchEvent(new CustomEvent('invalidAction', {
        detail: { reason: result.reason, action }
      }));
      return false;
    }

    const colony = this.colonies[this.activePlayer];
    const piece = colony.pieces.find(p => p.id === action.pieceId);

    switch (action.type) {
      case 'MOVE':
        this.board.setPiece(piece.col, piece.row, null);
        this.board.setPiece(action.targetCol, action.targetRow, piece);
        break;

      case 'ATTACK': {
        const enemy = this.board.getCell(action.targetCol, action.targetRow);
        this.board.removePiece(action.targetCol, action.targetRow);
        this.colonies[enemy.owner].pieces = this.colonies[enemy.owner].pieces.filter(
          p => p.id !== enemy.id
        );
        this.scores[this.activePlayer] += 10;
        break;
      }

      case 'MUTATE':
        colony.energy -= 2;
        piece.mutate();
        this.scores[this.activePlayer] -= 5;
        break;
    }

    this.history.push({ ...action, player: this.activePlayer, turn: this.turn });
    this.turn++;

    const finished = this._checkVictory();
    if (!finished) this._nextTurn();

    this.dispatchEvent(new CustomEvent('gameStateChanged', { detail: this.toJSON() }));
    return true;
  }

  _checkVictory() {
    if (this.colonies.PLAYER.pieces.length === 0) {
      this._finish('MACHINE');
      return true;
    }
    if (this.colonies.MACHINE.pieces.length === 0) {
      this._finish('PLAYER');
      return true;
    }
    if (this.turn >= MAX_TURNS) {
      this._finishByScore();
      return true;
    }
    return false;
  }

  _finishByScore() {
    if (!this._finalScoresApplied) {
      CalculateFinalScores(this);
      this._finalScoresApplied = true;
    }

    const ps = this.scores.PLAYER;
    const ms = this.scores.MACHINE;

    if (ps !== ms) {
      this._finish(ps > ms ? 'PLAYER' : 'MACHINE');
      return;
    }

    const pp = this.colonies.PLAYER.pieces.length;
    const mp = this.colonies.MACHINE.pieces.length;
    if (pp !== mp) {
      this._finish(pp > mp ? 'PLAYER' : 'MACHINE');
      return;
    }

    const CENTER = [
      { col: 3, row: 3 }, { col: 3, row: 4 },
      { col: 4, row: 3 }, { col: 4, row: 4 }
    ];
    let pc = 0, mc = 0;
    for (const c of CENTER) {
      const piece = this.board.getCell(c.col, c.row);
      if (piece?.owner === 'PLAYER') pc++;
      else if (piece?.owner === 'MACHINE') mc++;
    }

    this._finish(pc >= mc ? 'PLAYER' : 'MACHINE');
  }

  _finish(winner) {
    this.status = 'FINISHED';
    this.winner = winner;
    if (!this._finalScoresApplied) {
      CalculateFinalScores(this);
      this._finalScoresApplied = true;
    }
    this.dispatchEvent(new CustomEvent('gameFinished', {
      detail: { winner, scores: { ...this.scores } }
    }));
  }

  _nextTurn() {
    this.activePlayer = this.activePlayer === 'PLAYER' ? 'MACHINE' : 'PLAYER';
    const colony = this.colonies[this.activePlayer];
    colony.energy = Math.min(colony.energy + 1, MAX_ENERGY);
  }

  getAllValidActions(owner) {
    return GetAllValidActions(this, owner);
  }

  toJSON() {
    return {
      board: this.board.toJSON(),
      colonies: {
        PLAYER:  { pieces: this.colonies.PLAYER.pieces.map(p => p.toJSON()),  energy: this.colonies.PLAYER.energy  },
        MACHINE: { pieces: this.colonies.MACHINE.pieces.map(p => p.toJSON()), energy: this.colonies.MACHINE.energy }
      },
      turn: this.turn,
      activePlayer: this.activePlayer,
      scores: { ...this.scores },
      status: this.status,
      winner: this.winner
    };
  }
}
