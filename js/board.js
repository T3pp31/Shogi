import { Player, getKanji, isPromoted, HAND_PIECE_TYPES } from './pieces.js';

export class BoardRenderer {
  constructor(boardEl) {
    this.boardEl = boardEl;
    this.cells = [];
    this._createBoard();
  }

  _createBoard() {
    this.boardEl.innerHTML = '';
    this.cells = [];
    for (let row = 0; row < 9; row++) {
      this.cells[row] = [];
      for (let col = 0; col < 9; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        // 星（星印）- 交差点に打つ
        if (this._isStarPoint(row, col)) {
          cell.classList.add('star');
        }

        this.cells[row][col] = cell;
        this.boardEl.appendChild(cell);
      }
    }
  }

  _isStarPoint(row, col) {
    // 将棋盤の星は (3,3), (3,6), (6,3), (6,6) の交差点
    // 0-indexedでは row=2,5 col=2,5 のセルの右下角に配置
    // ただしCSSで左上にずらすことで交差点に描画
    return (row === 3 || row === 6) && (col === 3 || col === 6);
  }

  // 盤面を描画
  render(gameState) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = this.cells[row][col];

        // 既存の駒要素を削除
        const oldPiece = cell.querySelector('.piece');
        if (oldPiece) oldPiece.remove();

        // ハイライトをクリア
        cell.classList.remove('selected', 'movable', 'has-enemy', 'last-move-from', 'last-move-to');

        const piece = gameState.getPiece(row, col);
        if (piece) {
          cell.appendChild(this._createPieceElement(piece));
        }
      }
    }

    // 最終手のハイライト
    if (gameState.lastMove) {
      if (!gameState.lastMove.drop) {
        const { fromRow, fromCol } = gameState.lastMove;
        this.cells[fromRow][fromCol].classList.add('last-move-from');
      }
      const { toRow, toCol } = gameState.lastMove;
      this.cells[toRow][toCol].classList.add('last-move-to');
    }
  }

  _createPieceElement(piece) {
    const el = document.createElement('div');
    el.className = 'piece';

    if (piece.player === Player.GOTE) {
      el.classList.add('gote');
    }
    if (isPromoted(piece.type)) {
      el.classList.add('promoted');
    }

    const kanji = getKanji(piece.type, piece.player);
    el.textContent = kanji;
    return el;
  }

  // 移動可能マスをハイライト
  highlightMoves(moves, gameState) {
    for (const move of moves) {
      const cell = this.cells[move.row][move.col];
      cell.classList.add('movable');
      if (gameState.getPiece(move.row, move.col)) {
        cell.classList.add('has-enemy');
      }
    }
  }

  // 選択状態をハイライト
  highlightSelected(row, col) {
    this.cells[row][col].classList.add('selected');
  }

  // 全ハイライトをクリア
  clearHighlights() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.cells[r][c].classList.remove('selected', 'movable', 'has-enemy');
      }
    }
  }

  // 持ち駒を描画
  renderHands(gameState) {
    this._renderHand(gameState, Player.SENTE);
    this._renderHand(gameState, Player.GOTE);
  }

  _renderHand(gameState, player) {
    const container = document.querySelector(`.hand-pieces[data-player="${player}"]`);
    container.innerHTML = '';

    const hand = gameState.hands[player];
    // 表示順: 飛、角、金、銀、桂、香、歩
    for (const type of HAND_PIECE_TYPES) {
      const count = hand[type];
      if (count <= 0) continue;

      const el = document.createElement('div');
      el.className = 'hand-piece';
      el.dataset.pieceType = type;
      el.dataset.player = player;

      const mini = document.createElement('div');
      mini.className = 'piece-mini';
      if (player === Player.GOTE) {
        mini.classList.add('gote-piece');
      }
      mini.textContent = getKanji(type, player);

      const countEl = document.createElement('span');
      countEl.className = 'piece-count';
      countEl.textContent = count > 1 ? count : '';

      el.appendChild(mini);
      el.appendChild(countEl);
      container.appendChild(el);
    }
  }
}
