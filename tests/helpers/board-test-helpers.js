import { BOARD_CONFIG } from '../../js/config.js';

/** テスト用: 盤面の全マスを null で初期化する */
export function clearBoard(state) {
  for (let row = BOARD_CONFIG.MIN_INDEX; row <= BOARD_CONFIG.MAX_INDEX; row += 1) {
    for (let col = BOARD_CONFIG.MIN_INDEX; col <= BOARD_CONFIG.MAX_INDEX; col += 1) {
      state.board[row][col] = null;
    }
  }
}

/** テスト用: 全プレイヤーの持ち駒を 0 にリセットする */
export function clearHands(state) {
  for (const player of Object.keys(state.hands)) {
    for (const pieceType of Object.keys(state.hands[player])) {
      state.hands[player][pieceType] = 0;
    }
  }
}
