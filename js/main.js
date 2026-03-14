import { GameState } from './game.js';
import { BoardRenderer } from './board.js';
import { UIController } from './ui.js';
import { DOM_SELECTORS } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameState = new GameState();
  const renderer = new BoardRenderer(document.getElementById(DOM_SELECTORS.BOARD));
  const ui = new UIController(gameState, renderer);
  ui.init();
});
