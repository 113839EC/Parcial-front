import { AIBase } from './aiBase.js';
import { GetAllValidActions } from '../rules.js';

export class AIEasy extends AIBase {
  getNextAction(gameState) {
    const actions = GetAllValidActions(gameState, 'MACHINE');
    if (actions.length === 0) return null;
    return actions[Math.floor(Math.random() * actions.length)];
  }
}
