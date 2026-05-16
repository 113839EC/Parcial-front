const CENTER_CELLS = [
  { col: 3, row: 3 }, { col: 3, row: 4 },
  { col: 4, row: 3 }, { col: 4, row: 4 }
];

export function CalculateFinalScores(gameState) {
  for (const owner of ['PLAYER', 'MACHINE']) {
    const centerCount = CENTER_CELLS.filter(c => {
      const piece = gameState.board.getCell(c.col, c.row);
      return piece && piece.owner === owner;
    }).length;
    if (centerCount >= 3) gameState.scores[owner] += 15;

    if (gameState.colonies[owner].pieces.length >= 6) gameState.scores[owner] += 5;
  }
}

export function GetScoreBreakdown(gameState) {
  const captures = { PLAYER: 0, MACHINE: 0 };
  const mutations = { PLAYER: 0, MACHINE: 0 };

  for (const action of gameState.history) {
    if (action.type === 'ATTACK') captures[action.player]++;
    if (action.type === 'MUTATE') mutations[action.player]++;
  }

  const centerControl = { PLAYER: 0, MACHINE: 0 };
  for (const c of CENTER_CELLS) {
    const piece = gameState.board.getCell(c.col, c.row);
    if (piece) centerControl[piece.owner]++;
  }

  return {
    captures,
    mutations,
    centerControl,
    capturePoints: { PLAYER: captures.PLAYER * 10, MACHINE: captures.MACHINE * 10 },
    mutationPenalties: { PLAYER: -(mutations.PLAYER * 5), MACHINE: -(mutations.MACHINE * 5) },
    centerBonus: {
      PLAYER: centerControl.PLAYER >= 3 ? 15 : 0,
      MACHINE: centerControl.MACHINE >= 3 ? 15 : 0
    },
    economyBonus: {
      PLAYER: gameState.colonies.PLAYER.pieces.length >= 6 ? 5 : 0,
      MACHINE: gameState.colonies.MACHINE.pieces.length >= 6 ? 5 : 0
    }
  };
}
