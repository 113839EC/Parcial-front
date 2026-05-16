export class AIBase {
  getNextAction(_gameState) {
    throw new Error('getNextAction must be implemented by subclass');
  }
}
