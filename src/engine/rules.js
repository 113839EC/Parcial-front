// ROCA beats BRUMA, ESPINA beats ROCA, BRUMA beats ESPINA
export const MATCHUP = {
  ROCA:   { beats: 'BRUMA',  losesTo: 'ESPINA' },
  ESPINA: { beats: 'ROCA',   losesTo: 'BRUMA'  },
  BRUMA:  { beats: 'ESPINA', losesTo: 'ROCA'   }
};

export function CanMove(board, piece, targetCol, targetRow) {
  if (!board.isValid(targetCol, targetRow)) return false;
  const dCol = Math.abs(targetCol - piece.col);
  const dRow = Math.abs(targetRow - piece.row);
  if (dCol + dRow !== 1) return false;
  return board.getCell(targetCol, targetRow) === null;
}

export function CanAttack(board, attacker, targetCol, targetRow) {
  if (!board.isValid(targetCol, targetRow)) return false;
  const dCol = Math.abs(targetCol - attacker.col);
  const dRow = Math.abs(targetRow - attacker.row);
  if (dCol + dRow !== 1) return false;
  const target = board.getCell(targetCol, targetRow);
  if (!target || target.owner === attacker.owner) return false;
  return MATCHUP[attacker.type].beats === target.type;
}

export function CanMutate(colony) {
  return colony.energy >= 2;
}

export function ValidateAction(gameState, action) {
  const { board, colonies, activePlayer } = gameState;
  const colony = colonies[activePlayer];
  const piece = colony.pieces.find(p => p.id === action.pieceId);

  if (!piece) return { valid: false, reason: 'Pieza no encontrada.' };

  switch (action.type) {
    case 'MOVE':
      if (!CanMove(board, piece, action.targetCol, action.targetRow))
        return { valid: false, reason: 'Movimiento inválido: celda ocupada o no adyacente.' };
      return { valid: true, reason: '' };
    case 'ATTACK':
      if (!CanAttack(board, piece, action.targetCol, action.targetRow))
        return { valid: false, reason: 'Ataque inválido: matchup desfavorable o pieza no adyacente.' };
      return { valid: true, reason: '' };
    case 'MUTATE':
      if (!CanMutate(colony))
        return { valid: false, reason: 'Energía insuficiente para mutar (necesitás 2 puntos).' };
      return { valid: true, reason: '' };
    default:
      return { valid: false, reason: 'Tipo de acción desconocido.' };
  }
}

export function GetValidActionsForPiece(board, piece, colony) {
  const actions = [];
  for (const cell of board.getAdjacentCells(piece.col, piece.row)) {
    if (CanMove(board, piece, cell.col, cell.row))
      actions.push({ type: 'MOVE', pieceId: piece.id, targetCol: cell.col, targetRow: cell.row });
    if (CanAttack(board, piece, cell.col, cell.row))
      actions.push({ type: 'ATTACK', pieceId: piece.id, targetCol: cell.col, targetRow: cell.row });
  }
  if (CanMutate(colony))
    actions.push({ type: 'MUTATE', pieceId: piece.id, targetCol: piece.col, targetRow: piece.row });
  return actions;
}

export function GetAllValidActions(gameState, owner) {
  const colony = gameState.colonies[owner];
  const actions = [];
  for (const piece of colony.pieces)
    actions.push(...GetValidActionsForPiece(gameState.board, piece, colony));
  return actions;
}
