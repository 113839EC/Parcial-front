export const TYPES = Object.freeze({ ROCA: 'ROCA', ESPINA: 'ESPINA', BRUMA: 'BRUMA' });
export const OWNERS = Object.freeze({ PLAYER: 'PLAYER', MACHINE: 'MACHINE' });

const MUTATION_CYCLE = { ROCA: 'ESPINA', ESPINA: 'BRUMA', BRUMA: 'ROCA' };

export class Piece {
  constructor(type, owner, col, row) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.owner = owner;
    this.col = col;
    this.row = row;
  }

  mutate() {
    this.type = MUTATION_CYCLE[this.type];
    return this.type;
  }

  toJSON() {
    return { id: this.id, type: this.type, owner: this.owner, col: this.col, row: this.row };
  }
}
