import { AIBase } from './aiBase.js';
import { GetAllValidActions, MATCHUP } from '../rules.js';

export class AIHard extends AIBase {
  getNextAction(gameState) {
    const actions = GetAllValidActions(gameState, 'MACHINE');
    if (actions.length === 0) return null;

    const scored = actions.map(action => ({
      action,
      score: this._evaluate(gameState, action)
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0].action;
  }

  _evaluate(gameState, action) {
    const { board, colonies } = gameState;
    const piece = colonies.MACHINE.pieces.find(p => p.id === action.pieceId);
    if (!piece) return 0;

    let score = Math.random() * 2; // tiebreaker

    if (action.type === 'ATTACK') {
      score += 100;
      // Bonus if the target would have attacked us next turn
      const target = board.getCell(action.targetCol, action.targetRow);
      if (target && MATCHUP[target.type].beats === piece.type) score += 20;
    } else if (action.type === 'MUTATE') {
      // Mutate if it unlocks an attack on an adjacent enemy
      const adj = board.getAdjacentCells(piece.col, piece.row);
      const mutatedType = { ROCA: 'ESPINA', ESPINA: 'BRUMA', BRUMA: 'ROCA' }[piece.type];
      const unlocks = adj.some(c => {
        const t = board.getCell(c.col, c.row);
        return t && t.owner === 'PLAYER' && MATCHUP[mutatedType].beats === t.type;
      });
      score += unlocks ? 60 : 10;
    } else if (action.type === 'MOVE') {
      // Prefer advancing toward center
      const distToCenter = Math.abs(action.targetCol - 3.5) + Math.abs(action.targetRow - 3.5);
      score += Math.max(0, 8 - distToCenter);

      // Prefer closing distance to vulnerable enemies
      for (const enemy of colonies.PLAYER.pieces) {
        if (MATCHUP[piece.type].beats !== enemy.type) continue;
        const prevDist = Math.abs(piece.col - enemy.col) + Math.abs(piece.row - enemy.row);
        const newDist = Math.abs(action.targetCol - enemy.col) + Math.abs(action.targetRow - enemy.row);
        if (newDist < prevDist) score += 15;
      }

      // Avoid moving into danger (enemy can attack us next turn)
      const adj = board.getAdjacentCells(action.targetCol, action.targetRow);
      for (const c of adj) {
        const threat = board.getCell(c.col, c.row);
        if (threat && threat.owner === 'PLAYER' && MATCHUP[threat.type].beats === piece.type)
          score -= 25;
      }
    }

    return score;
  }
}
