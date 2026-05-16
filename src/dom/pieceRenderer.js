const TYPE_ICON  = { ROCA: '⬟', ESPINA: '✦', BRUMA: '◎' };
const TYPE_LABEL = { ROCA: 'Roca', ESPINA: 'Espina', BRUMA: 'Bruma' };

export function CreatePieceElement(piece) {
  const el = document.createElement('div');
  el.className = BuildPieceClasses(piece);
  el.dataset.pieceId = piece.id;
  el.innerHTML = `<span class="piece-icon" aria-hidden="true">${TYPE_ICON[piece.type]}</span>
                  <span class="piece-label sr-only">${TYPE_LABEL[piece.type]}</span>`;
  el.setAttribute('aria-label', BuildAriaLabel(piece));
  el.setAttribute('role', 'img');
  return el;
}

export function UpdatePieceElement(el, piece) {
  el.className = BuildPieceClasses(piece);
  el.dataset.pieceId = piece.id;
  el.querySelector('.piece-icon').textContent = TYPE_ICON[piece.type];
  el.setAttribute('aria-label', BuildAriaLabel(piece));
}

function BuildPieceClasses(piece) {
  const owner = piece.owner === 'PLAYER' ? 'piece-player' : 'piece-machine';
  return `piece ${owner} piece-${piece.type.toLowerCase()}`;
}

function BuildAriaLabel(piece) {
  const owner = piece.owner === 'PLAYER' ? 'del jugador' : 'de la máquina';
  return `${TYPE_LABEL[piece.type]} ${owner} en columna ${piece.col + 1} fila ${piece.row + 1}`;
}
