export class Board {
  constructor() {
    this.cells = new Array(64).fill(null);
  }

  _index(col, row) { return row * 8 + col; }

  isValid(col, row) { return col >= 0 && col <= 7 && row >= 0 && row <= 7; }

  getCell(col, row) { return this.cells[this._index(col, row)]; }

  setPiece(col, row, piece) {
    this.cells[this._index(col, row)] = piece;
    if (piece) { piece.col = col; piece.row = row; }
  }

  removePiece(col, row) {
    const piece = this.getCell(col, row);
    this.cells[this._index(col, row)] = null;
    return piece;
  }

  getAdjacentCells(col, row) {
    const adj = [];
    if (col > 0) adj.push({ col: col - 1, row });
    if (col < 7) adj.push({ col: col + 1, row });
    if (row > 0) adj.push({ col, row: row - 1 });
    if (row < 7) adj.push({ col, row: row + 1 });
    return adj;
  }

  toJSON() {
    return { cells: this.cells.map(p => p ? p.toJSON() : null) };
  }
}
