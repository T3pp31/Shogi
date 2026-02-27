import { GameState } from './game.js';
import { BoardRenderer } from './board.js';
import { UIController } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameState = new GameState();
  const renderer = new BoardRenderer(document.getElementById('board'));
  const ui = new UIController(gameState, renderer);
  ui.init();
});
