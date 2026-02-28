import { PieceType, Player, HAND_PIECE_TYPES, PROMOTION_MAP, unpromote } from './pieces.js';

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    // 9x9の盤面 (row 0 = 一段目/上側, row 8 = 九段目/下側)
    // 各セルは { type, player } or null
    this.board = Array.from({ length: 9 }, () => Array(9).fill(null));

    // 持ち駒: { sente: { pawn: 0, lance: 0, ... }, gote: { ... } }
    this.hands = {
      [Player.SENTE]: this._emptyHand(),
      [Player.GOTE]: this._emptyHand(),
    };

    this.currentPlayer = Player.SENTE;
    this.gameOver = false;
    this.winner = null;
    this.inCheck = false;
    this.lastMove = null; // { fromRow, fromCol, toRow, toCol } or { drop: true, toRow, toCol }

    this._setupInitialPosition();
  }

  _emptyHand() {
    const hand = {};
    for (const type of HAND_PIECE_TYPES) {
      hand[type] = 0;
    }
    return hand;
  }

  _setupInitialPosition() {
    const S = Player.SENTE;
    const G = Player.GOTE;

    // 後手陣（上3段: row 0-2）
    // 1段目 (row 0): 香桂銀金玉金銀桂香
    this.board[0] = [
      { type: PieceType.LANCE, player: G },
      { type: PieceType.KNIGHT, player: G },
      { type: PieceType.SILVER, player: G },
      { type: PieceType.GOLD, player: G },
      { type: PieceType.KING, player: G },
      { type: PieceType.GOLD, player: G },
      { type: PieceType.SILVER, player: G },
      { type: PieceType.KNIGHT, player: G },
      { type: PieceType.LANCE, player: G },
    ];
    // 2段目 (row 1): 飛（8筋=col1）と角（2筋=col7）
    this.board[1][1] = { type: PieceType.ROOK, player: G };
    this.board[1][7] = { type: PieceType.BISHOP, player: G };
    // 3段目 (row 2): 歩9枚
    for (let col = 0; col < 9; col++) {
      this.board[2][col] = { type: PieceType.PAWN, player: G };
    }

    // 先手陣（下3段: row 6-8）
    // 7段目 (row 6): 歩9枚
    for (let col = 0; col < 9; col++) {
      this.board[6][col] = { type: PieceType.PAWN, player: S };
    }
    // 8段目 (row 7): 角（8筋=col1）と飛（2筋=col7）
    this.board[7][1] = { type: PieceType.BISHOP, player: S };
    this.board[7][7] = { type: PieceType.ROOK, player: S };
    // 9段目 (row 8): 香桂銀金王金銀桂香
    this.board[8] = [
      { type: PieceType.LANCE, player: S },
      { type: PieceType.KNIGHT, player: S },
      { type: PieceType.SILVER, player: S },
      { type: PieceType.GOLD, player: S },
      { type: PieceType.KING, player: S },
      { type: PieceType.GOLD, player: S },
      { type: PieceType.SILVER, player: S },
      { type: PieceType.KNIGHT, player: S },
      { type: PieceType.LANCE, player: S },
    ];
  }

  getPiece(row, col) {
    if (row < 0 || row > 8 || col < 0 || col > 8) return null;
    return this.board[row][col];
  }

  setPiece(row, col, piece) {
    this.board[row][col] = piece;
  }

  // 駒を移動する（バリデーションなし - movesモジュールで事前に検証する）
  movePiece(fromRow, fromCol, toRow, toCol, promote) {
    const piece = this.board[fromRow][fromCol];
    if (!piece) return false;

    const captured = this.board[toRow][toCol];

    // 取った駒を持ち駒に加える
    if (captured) {
      const capturedType = unpromote(captured.type);
      if (capturedType !== PieceType.KING) {
        this.hands[piece.player][capturedType]++;
      }
    }

    // 成りの処理
    let newType = piece.type;
    if (promote && PROMOTION_MAP[piece.type]) {
      newType = PROMOTION_MAP[piece.type];
    }

    this.board[toRow][toCol] = { type: newType, player: piece.player };
    this.board[fromRow][fromCol] = null;

    this.lastMove = { fromRow, fromCol, toRow, toCol };
    return true;
  }

  // 持ち駒を打つ
  dropPiece(type, toRow, toCol, player) {
    if (this.hands[player][type] <= 0) return false;
    if (this.board[toRow][toCol] !== null) return false;

    this.board[toRow][toCol] = { type, player };
    this.hands[player][type]--;

    this.lastMove = { drop: true, toRow, toCol };
    return true;
  }

  // ターン切り替え
  switchTurn() {
    this.currentPlayer = this.currentPlayer === Player.SENTE ? Player.GOTE : Player.SENTE;
  }

  opponent(player) {
    return player === Player.SENTE ? Player.GOTE : Player.SENTE;
  }

  // 玉の位置を取得
  findKing(player) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const p = this.board[row][col];
        if (p && p.type === PieceType.KING && p.player === player) {
          return { row, col };
        }
      }
    }
    return null;
  }

  // 盤面のディープコピー
  clone() {
    const copy = new GameState();
    copy.board = this.board.map(row =>
      row.map(cell => (cell ? { ...cell } : null))
    );
    copy.hands = {
      [Player.SENTE]: { ...this.hands[Player.SENTE] },
      [Player.GOTE]: { ...this.hands[Player.GOTE] },
    };
    copy.currentPlayer = this.currentPlayer;
    copy.gameOver = this.gameOver;
    copy.winner = this.winner;
    copy.inCheck = this.inCheck;
    copy.lastMove = this.lastMove ? { ...this.lastMove } : null;
    return copy;
  }
}
