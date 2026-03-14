/**
 * js/moves.js のテスト（BOARD_CONFIG 参照の確認を含む）
 *
 * テスト観点の表（等価分割・境界値）
 *
 * | # | 観点                           | 分類   | 入力値/条件                           | 期待結果                             |
 * |---|--------------------------------|--------|---------------------------------------|--------------------------------------|
 * | 1 | getPromotionStatus: 先手成りゾーン | 正常系 | fromRow=3, toRow=2（先手の歩）        | 'optional'                           |
 * | 2 | getPromotionStatus: 先手強制成り   | 境界値 | toRow=0 の歩・香                      | 'mandatory'                          |
 * | 3 | getPromotionStatus: 先手桂強制成り | 境界値 | toRow=1 の桂                          | 'mandatory'                          |
 * | 4 | getPromotionStatus: 後手成りゾーン | 正常系 | fromRow=5, toRow=6（後手の歩）        | 'optional'                           |
 * | 5 | getPromotionStatus: 後手強制成り   | 境界値 | toRow=8 の歩・香                      | 'mandatory'                          |
 * | 6 | getPromotionStatus: 後手桂強制成り | 境界値 | toRow=7 の桂                          | 'mandatory'                          |
 * | 7 | getPromotionStatus: ゾーン外       | 正常系 | fromRow=5, toRow=4                    | 'none'                               |
 * | 8 | getPromotionStatus: 成れない駒     | 正常系 | 金将                                   | 'none'                               |
 * | 9 | getPromotionStatus: 既成り駒       | 正常系 | 成り歩（と金）                         | 'none'                               |
 * |10 | getLegalDrops: 二歩チェック        | 異常系 | 同列に歩がある場合                     | その列には打てない                   |
 * |11 | getLegalDrops: 先手歩の打ち禁止行  | 境界値 | row=0 に歩を打つ                       | row=0 のマスは含まれない             |
 * |12 | getLegalDrops: 先手香の打ち禁止行  | 境界値 | row=0 に香を打つ                       | row=0 のマスは含まれない             |
 * |13 | getLegalDrops: 先手桂の打ち禁止行  | 境界値 | row=0,1 に桂を打つ                    | row=0,1 のマスは含まれない           |
 * |14 | getLegalDrops: 後手歩の打ち禁止行  | 境界値 | row=8 に歩を打つ                       | row=8 のマスは含まれない             |
 * |15 | getLegalDrops: 後手桂の打ち禁止行  | 境界値 | row=7,8 に桂を打つ                    | row=7,8 のマスは含まれない           |
 * |16 | isInCheck: 王手状態               | 正常系 | 敵が王を攻撃できる位置                 | true                                 |
 * |17 | isInCheck: 非王手状態             | 正常系 | 初期配置                               | false                                |
 * |18 | isCheckmate: 詰み                 | 正常系 | 詰みの局面                             | true                                 |
 * |19 | isCheckmate: 非詰み               | 正常系 | 逃げられる局面                         | false                                |
 * |20 | getRawMoves: 歩の移動             | 正常系 | 先手の歩                               | 1マス前のみ                          |
 * |21 | getRawMoves: 盤外                 | 境界値 | 盤の端の駒                             | 盤外には移動しない                   |
 * |22 | getLegalMoves: 自王手防止         | 異常系 | 動かすと自分の王が王手になる駒         | その手は含まれない                   |
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { GameState } from '../js/game.js';
import { BOARD_CONFIG } from '../js/config.js';
import { PieceType, Player } from '../js/pieces.js';
import {
  getRawMoves,
  getLegalMoves,
  getLegalDrops,
  getPromotionStatus,
  isInCheck,
  isCheckmate,
} from '../js/moves.js';

let state;

beforeEach(() => {
  state = new GameState();
});

// ============================================================
// getPromotionStatus テスト
// ============================================================

describe('getPromotionStatus() - 成りの判定', () => {
  test('先手の歩がゾーン外から成りゾーンへ: optional', () => {
    // Given: 先手の歩が row=3 から row=2 (SENTE_PROMOTION_ZONE に含まれる)
    // When: getPromotionStatus を呼ぶ
    // Then: 'optional'
    const piece = { type: PieceType.PAWN, player: Player.SENTE };
    expect(getPromotionStatus(piece, 3, 2)).toBe('optional');
  });

  test('先手の歩が toRow=0 の場合: mandatory（境界値）', () => {
    // Given: 先手の歩が SENTE_PAWN_LANCE_MIN_ROW (0) へ移動
    // When: getPromotionStatus を呼ぶ
    // Then: 'mandatory'
    const piece = { type: PieceType.PAWN, player: Player.SENTE };
    expect(getPromotionStatus(piece, 1, BOARD_CONFIG.SENTE_PAWN_LANCE_MIN_ROW)).toBe('mandatory');
  });

  test('先手の香が toRow=0 の場合: mandatory（境界値）', () => {
    // Given: 先手の香が SENTE_PAWN_LANCE_MIN_ROW (0) へ移動
    // When: getPromotionStatus を呼ぶ
    // Then: 'mandatory'
    const piece = { type: PieceType.LANCE, player: Player.SENTE };
    expect(getPromotionStatus(piece, 2, BOARD_CONFIG.SENTE_PAWN_LANCE_MIN_ROW)).toBe('mandatory');
  });

  test('先手の桂が toRow=1 の場合: mandatory（境界値）', () => {
    // Given: 先手の桂が SENTE_KNIGHT_MIN_ROW (1) へ移動
    // When: getPromotionStatus を呼ぶ
    // Then: 'mandatory'
    const piece = { type: PieceType.KNIGHT, player: Player.SENTE };
    expect(getPromotionStatus(piece, 3, BOARD_CONFIG.SENTE_KNIGHT_MIN_ROW)).toBe('mandatory');
  });

  test('先手の桂が toRow=0 の場合: mandatory（境界値）', () => {
    // Given: 先手の桂が MIN_INDEX (0) へ移動
    // When: getPromotionStatus を呼ぶ
    // Then: 'mandatory'（toRow <= SENTE_KNIGHT_MIN_ROW）
    const piece = { type: PieceType.KNIGHT, player: Player.SENTE };
    expect(getPromotionStatus(piece, 2, BOARD_CONFIG.MIN_INDEX)).toBe('mandatory');
  });

  test('後手の歩がゾーン外から成りゾーンへ: optional', () => {
    // Given: 後手の歩が row=5 から row=6 (GOTE_PROMOTION_ZONE に含まれる)
    // When: getPromotionStatus を呼ぶ
    // Then: 'optional'
    const piece = { type: PieceType.PAWN, player: Player.GOTE };
    expect(getPromotionStatus(piece, 5, 6)).toBe('optional');
  });

  test('後手の歩が toRow=8 の場合: mandatory（境界値）', () => {
    // Given: 後手の歩が GOTE_PAWN_LANCE_MAX_ROW (8) へ移動
    // When: getPromotionStatus を呼ぶ
    // Then: 'mandatory'
    const piece = { type: PieceType.PAWN, player: Player.GOTE };
    expect(getPromotionStatus(piece, 7, BOARD_CONFIG.GOTE_PAWN_LANCE_MAX_ROW)).toBe('mandatory');
  });

  test('後手の桂が toRow=7 の場合: mandatory（境界値）', () => {
    // Given: 後手の桂が GOTE_KNIGHT_MAX_ROW (7) へ移動
    // When: getPromotionStatus を呼ぶ
    // Then: 'mandatory'
    const piece = { type: PieceType.KNIGHT, player: Player.GOTE };
    expect(getPromotionStatus(piece, 5, BOARD_CONFIG.GOTE_KNIGHT_MAX_ROW)).toBe('mandatory');
  });

  test('後手の桂が toRow=8 の場合: mandatory（境界値）', () => {
    // Given: 後手の桂が MAX_INDEX (8) へ移動
    // When: getPromotionStatus を呼ぶ
    // Then: 'mandatory'
    const piece = { type: PieceType.KNIGHT, player: Player.GOTE };
    expect(getPromotionStatus(piece, 6, BOARD_CONFIG.MAX_INDEX)).toBe('mandatory');
  });

  test('ゾーン外から外への移動: none', () => {
    // Given: 先手の歩が row=5 から row=4 へ（成りゾーン外）
    // When: getPromotionStatus を呼ぶ
    // Then: 'none'
    const piece = { type: PieceType.PAWN, player: Player.SENTE };
    expect(getPromotionStatus(piece, 5, 4)).toBe('none');
  });

  test('成れない駒（金将）: none', () => {
    // Given: 先手の金将
    // When: getPromotionStatus を呼ぶ
    // Then: 'none'
    const piece = { type: PieceType.GOLD, player: Player.SENTE };
    expect(getPromotionStatus(piece, 3, 2)).toBe('none');
  });

  test('既に成り駒（と金）: none', () => {
    // Given: 先手の成り歩
    // When: getPromotionStatus を呼ぶ
    // Then: 'none'
    const piece = { type: PieceType.PROMOTED_PAWN, player: Player.SENTE };
    expect(getPromotionStatus(piece, 3, 2)).toBe('none');
  });
});

// ============================================================
// getLegalDrops テスト（行き所のない駒のルール）
// ============================================================

describe('getLegalDrops() - 打てるマスの検証', () => {
  // テスト用に盤面を空にして玉だけ残すヘルパー
  function setupMinimalBoard(senteKingRow, goteKingRow) {
    // 全マスをクリア
    for (let r = 0; r < BOARD_CONFIG.SIZE; r++) {
      for (let c = 0; c < BOARD_CONFIG.SIZE; c++) {
        state.board[r][c] = null;
      }
    }
    state.board[senteKingRow][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[goteKingRow][4] = { type: PieceType.KING, player: Player.GOTE };
  }

  test('二歩チェック: 同列に先手の歩がある列には打てない', () => {
    // Given: 先手の歩が (4, 4) にいる、先手の持ち駒に歩がある
    // When: getLegalDrops で歩の打ち場所を取得する
    // Then: col=4 の列は含まれない
    setupMinimalBoard(8, 0);
    state.board[4][4] = { type: PieceType.PAWN, player: Player.SENTE };
    state.hands[Player.SENTE][PieceType.PAWN] = 1;

    const drops = getLegalDrops(state, Player.SENTE, PieceType.PAWN);
    const col4Drops = drops.filter(d => d.col === 4);
    expect(col4Drops).toHaveLength(0);
  });

  test('先手の歩: row=0（SENTE_PAWN_LANCE_MIN_ROW）には打てない（境界値）', () => {
    // Given: 先手の持ち駒に歩がある
    // When: getLegalDrops で歩の打ち場所を取得する
    // Then: row=0 のマスは含まれない
    setupMinimalBoard(8, 0);
    state.hands[Player.SENTE][PieceType.PAWN] = 1;

    const drops = getLegalDrops(state, Player.SENTE, PieceType.PAWN);
    const row0Drops = drops.filter(d => d.row === BOARD_CONFIG.SENTE_PAWN_LANCE_MIN_ROW);
    expect(row0Drops).toHaveLength(0);
  });

  test('先手の香: row=0（SENTE_PAWN_LANCE_MIN_ROW）には打てない（境界値）', () => {
    // Given: 先手の持ち駒に香がある
    // When: getLegalDrops で香の打ち場所を取得する
    // Then: row=0 のマスは含まれない
    setupMinimalBoard(8, 0);
    state.hands[Player.SENTE][PieceType.LANCE] = 1;

    const drops = getLegalDrops(state, Player.SENTE, PieceType.LANCE);
    const row0Drops = drops.filter(d => d.row === BOARD_CONFIG.SENTE_PAWN_LANCE_MIN_ROW);
    expect(row0Drops).toHaveLength(0);
  });

  test('先手の桂: row=0,1（SENTE_KNIGHT_MIN_ROW 以下）には打てない（境界値）', () => {
    // Given: 先手の持ち駒に桂がある
    // When: getLegalDrops で桂の打ち場所を取得する
    // Then: row=0, row=1 のマスは含まれない
    setupMinimalBoard(8, 0);
    state.hands[Player.SENTE][PieceType.KNIGHT] = 1;

    const drops = getLegalDrops(state, Player.SENTE, PieceType.KNIGHT);
    const forbiddenDrops = drops.filter(d => d.row <= BOARD_CONFIG.SENTE_KNIGHT_MIN_ROW);
    expect(forbiddenDrops).toHaveLength(0);
  });

  test('後手の歩: row=8（GOTE_PAWN_LANCE_MAX_ROW）には打てない（境界値）', () => {
    // Given: 後手の持ち駒に歩がある
    // When: getLegalDrops で歩の打ち場所を取得する
    // Then: row=8 のマスは含まれない
    setupMinimalBoard(8, 0);
    state.hands[Player.GOTE][PieceType.PAWN] = 1;

    const drops = getLegalDrops(state, Player.GOTE, PieceType.PAWN);
    const row8Drops = drops.filter(d => d.row === BOARD_CONFIG.GOTE_PAWN_LANCE_MAX_ROW);
    expect(row8Drops).toHaveLength(0);
  });

  test('後手の桂: row=7,8（GOTE_KNIGHT_MAX_ROW 以上）には打てない（境界値）', () => {
    // Given: 後手の持ち駒に桂がある
    // When: getLegalDrops で桂の打ち場所を取得する
    // Then: row=7,8 のマスは含まれない
    setupMinimalBoard(8, 0);
    state.hands[Player.GOTE][PieceType.KNIGHT] = 1;

    const drops = getLegalDrops(state, Player.GOTE, PieceType.KNIGHT);
    const forbiddenDrops = drops.filter(d => d.row >= BOARD_CONFIG.GOTE_KNIGHT_MAX_ROW);
    expect(forbiddenDrops).toHaveLength(0);
  });
});

// ============================================================
// isInCheck テスト
// ============================================================

describe('isInCheck() - 王手判定', () => {
  test('初期配置では先手は王手されていない', () => {
    // Given: 初期盤面
    // When: 先手の王手状態を確認する
    // Then: false
    expect(isInCheck(state, Player.SENTE)).toBe(false);
  });

  test('初期配置では後手は王手されていない', () => {
    // Given: 初期盤面
    // When: 後手の王手状態を確認する
    // Then: false
    expect(isInCheck(state, Player.GOTE)).toBe(false);
  });

  test('敵の飛車が王の正面にいる場合は王手', () => {
    // Given: 全マスクリア後、先手玉と後手飛車を同列に配置
    // When: 先手の王手状態を確認する
    // Then: true
    for (let r = 0; r < BOARD_CONFIG.SIZE; r++) {
      for (let c = 0; c < BOARD_CONFIG.SIZE; c++) {
        state.board[r][c] = null;
      }
    }
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.ROOK, player: Player.GOTE };
    state.board[0][0] = { type: PieceType.KING, player: Player.GOTE };

    expect(isInCheck(state, Player.SENTE)).toBe(true);
  });

  test('駒が遮っている場合は王手ではない', () => {
    // Given: 全マスクリア後、先手玉と後手飛車の間に先手の駒を置く
    // When: 先手の王手状態を確認する
    // Then: false
    for (let r = 0; r < BOARD_CONFIG.SIZE; r++) {
      for (let c = 0; c < BOARD_CONFIG.SIZE; c++) {
        state.board[r][c] = null;
      }
    }
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[4][4] = { type: PieceType.GOLD, player: Player.SENTE }; // 遮断
    state.board[0][4] = { type: PieceType.ROOK, player: Player.GOTE };
    state.board[0][0] = { type: PieceType.KING, player: Player.GOTE };

    expect(isInCheck(state, Player.SENTE)).toBe(false);
  });
});

// ============================================================
// isCheckmate テスト
// ============================================================

describe('isCheckmate() - 詰み判定', () => {
  test('初期配置では詰みではない', () => {
    // Given: 初期盤面、先手のターン
    // When: isCheckmate を呼ぶ
    // Then: false
    expect(isCheckmate(state)).toBe(false);
  });

  test('詰みの局面では true が返る（簡易テスト）', () => {
    // Given: 先手玉が角に追い詰められた詰みの局面を作成
    // 先手玉 (8,8)、後手飛車2枚 + 後手金で完全に詰み
    // When: isCheckmate を呼ぶ
    // Then: true
    for (let r = 0; r < BOARD_CONFIG.SIZE; r++) {
      for (let c = 0; c < BOARD_CONFIG.SIZE; c++) {
        state.board[r][c] = null;
      }
    }
    state.hands = {
      [Player.SENTE]: { rook: 0, bishop: 0, gold: 0, silver: 0, knight: 0, lance: 0, pawn: 0 },
      [Player.GOTE]: { rook: 0, bishop: 0, gold: 0, silver: 0, knight: 0, lance: 0, pawn: 0 },
    };
    // 先手玉を (8,8) に置く
    state.board[8][8] = { type: PieceType.KING, player: Player.SENTE };
    // 後手の飛車で縦横を直接王手・退路遮断
    state.board[8][6] = { type: PieceType.ROOK, player: Player.GOTE };   // 横から王手（col 6）
    state.board[6][8] = { type: PieceType.ROOK, player: Player.GOTE };   // 縦は遮断
    // 後手の金で残りの斜め退路を塞ぐ: (7,7) を金で攻撃
    state.board[6][6] = { type: PieceType.GOLD, player: Player.GOTE };   // (7,7)を利かす
    // 後手玉（必須）
    state.board[0][0] = { type: PieceType.KING, player: Player.GOTE };
    state.currentPlayer = Player.SENTE;

    expect(isCheckmate(state)).toBe(true);
  });
});

// ============================================================
// getRawMoves テスト
// ============================================================

describe('getRawMoves() - 移動可能マスの取得', () => {
  test('先手の歩は1マス前にしか移動できない', () => {
    // Given: 先手の歩が (5, 4) にいる（周囲は空）
    // When: getRawMoves を呼ぶ
    // Then: { row: 4, col: 4 } のみ
    for (let r = 0; r < BOARD_CONFIG.SIZE; r++) {
      for (let c = 0; c < BOARD_CONFIG.SIZE; c++) {
        state.board[r][c] = null;
      }
    }
    state.board[5][4] = { type: PieceType.PAWN, player: Player.SENTE };

    const moves = getRawMoves(state, 5, 4);
    expect(moves).toHaveLength(1);
    expect(moves[0]).toEqual({ row: 4, col: 4 });
  });

  test('盤の端にいる駒は盤外に移動しない（境界値）', () => {
    // Given: 先手の歩が row=0（先手にとって盤端）にいる
    // When: getRawMoves を呼ぶ
    // Then: 空配列（盤外は移動不可）
    for (let r = 0; r < BOARD_CONFIG.SIZE; r++) {
      for (let c = 0; c < BOARD_CONFIG.SIZE; c++) {
        state.board[r][c] = null;
      }
    }
    state.board[BOARD_CONFIG.MIN_INDEX][4] = { type: PieceType.PAWN, player: Player.SENTE };

    const moves = getRawMoves(state, BOARD_CONFIG.MIN_INDEX, 4);
    expect(moves).toHaveLength(0);
  });

  test('飛車の移動: 遮断物がない場合は縦横全て', () => {
    // Given: 飛車が中央 (4, 4) にいる（周囲は空、玉だけ除く）
    // When: getRawMoves を呼ぶ
    // Then: 縦横の移動可能マス（4方向に合計 8*4 マス分...実際は 8+8+8+8 - 4方向の端含む）
    for (let r = 0; r < BOARD_CONFIG.SIZE; r++) {
      for (let c = 0; c < BOARD_CONFIG.SIZE; c++) {
        state.board[r][c] = null;
      }
    }
    state.board[4][4] = { type: PieceType.ROOK, player: Player.SENTE };

    const moves = getRawMoves(state, 4, 4);
    // 縦(8) + 横(8) = 16マス（自分のマスを除く）
    expect(moves.length).toBe(16);
  });

  test('存在しない駒位置: 空配列が返る（異常系）', () => {
    // Given: (4,4) に駒がない
    // When: getRawMoves を呼ぶ
    // Then: 空配列
    state.board[4][4] = null;
    expect(getRawMoves(state, 4, 4)).toHaveLength(0);
  });
});

// ============================================================
// getLegalMoves テスト
// ============================================================

describe('getLegalMoves() - 合法手の取得（自王手防止）', () => {
  test('動かすと自分の王が王手になる駒は移動できない', () => {
    // Given: 先手玉の直前（縦方向）に先手の金がいて、後手の飛車が縦に利いている
    // 金をこの列から外すと玉が王手になるため、同列への移動（col=4 上下）は許可されない
    // When: getLegalMoves で金の合法手を取得する
    // Then: col=4 で row が 6 以下のマス（玉を危険にさらす手）は除外される
    for (let r = 0; r < BOARD_CONFIG.SIZE; r++) {
      for (let c = 0; c < BOARD_CONFIG.SIZE; c++) {
        state.board[r][c] = null;
      }
    }
    // 先手玉 (8,4)、先手金 (7,4)、後手飛車 (0,4) で先手金が縦を遮断している
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[7][4] = { type: PieceType.GOLD, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.ROOK, player: Player.GOTE };
    state.board[0][0] = { type: PieceType.KING, player: Player.GOTE };

    const moves = getLegalMoves(state, 7, 4);
    // col=4 に金が留まることで列を遮断できる手のみ合法
    // col=4 上（row=6）は金が遮断したまま縦に動くため合法
    // col=4 以外への移動は盤を開けて王手になるので不合法
    const nonCol4Moves = moves.filter(m => m.col !== 4);
    expect(nonCol4Moves).toHaveLength(0);
  });
});
