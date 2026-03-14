/**
 * js/game.js のテスト（BOARD_CONFIG 参照の確認を含む）
 *
 * テスト観点の表（等価分割・境界値）
 *
 * | # | 観点                        | 分類   | 入力値/条件                          | 期待結果                           |
 * |---|-----------------------------|--------|--------------------------------------|------------------------------------|
 * | 1 | reset(): 盤面サイズ          | 正常系 | reset() 後                          | board は 9x9                       |
 * | 2 | reset(): 行数               | 正常系 | board.length                         | BOARD_CONFIG.SIZE (9)              |
 * | 3 | reset(): 列数               | 正常系 | board[i].length                      | BOARD_CONFIG.SIZE (9)              |
 * | 4 | reset(): 初期配置後手        | 正常系 | board[0] の内容                      | 後手の1段目が正しく配置される      |
 * | 5 | reset(): 初期配置先手        | 正常系 | board[8] の内容                      | 先手の9段目が正しく配置される      |
 * | 6 | getPiece(): 有効範囲内       | 正常系 | (0,0)〜(8,8)                         | 駒またはnull を返す                |
 * | 7 | getPiece(): 境界値 (0,0)    | 境界値 | row=0, col=0                         | 後手の香車                         |
 * | 8 | getPiece(): 境界値 (8,8)    | 境界値 | row=8, col=8                         | 先手の香車                         |
 * | 9 | getPiece(): 境界外 (-1,0)   | 異常系 | row=-1                               | null                               |
 * |10 | getPiece(): 境界外 (9,0)    | 異常系 | row=9（SIZE）                        | null                               |
 * |11 | getPiece(): 境界外 (0,-1)   | 異常系 | col=-1                               | null                               |
 * |12 | getPiece(): 境界外 (0,9)    | 異常系 | col=9（SIZE）                        | null                               |
 * |13 | findKing(): 先手の玉        | 正常系 | 初期状態                             | (8, 4) に先手の玉                  |
 * |14 | findKing(): 後手の玉        | 正常系 | 初期状態                             | (0, 4) に後手の玉                  |
 * |15 | findKing(): 玉なし          | 異常系 | 玉を除去後                           | null                               |
 * |16 | movePiece(): 正常移動       | 正常系 | 有効な移動                           | true、駒が移動する                 |
 * |17 | movePiece(): 駒なし         | 異常系 | 空マスから移動                       | false                              |
 * |18 | movePiece(): 取り駒         | 正常系 | 敵駒のあるマスへ移動                 | 持ち駒に追加される                 |
 * |19 | movePiece(): 成り           | 正常系 | promote=true                         | 成り駒になる                       |
 * |20 | dropPiece(): 正常打ち       | 正常系 | 空マスに打つ                         | true、駒が配置される               |
 * |21 | dropPiece(): 持ち駒なし     | 異常系 | 枚数0の駒を打つ                      | false                              |
 * |22 | dropPiece(): 既存駒の上     | 異常系 | 駒があるマスに打つ                   | false                              |
 * |23 | switchTurn(): 先手→後手    | 正常系 | 先手のターンから切り替え             | 後手になる                         |
 * |24 | switchTurn(): 後手→先手    | 正常系 | 後手のターンから切り替え             | 先手になる                         |
 * |25 | clone(): 独立性             | 正常系 | clone後に元を変更                    | クローンは変更されない             |
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { GameState } from '../js/game.js';
import { BOARD_CONFIG } from '../js/config.js';
import { PieceType, Player } from '../js/pieces.js';

let state;

beforeEach(() => {
  state = new GameState();
});

describe('GameState.reset() - 盤面初期化', () => {
  test('盤面の行数は BOARD_CONFIG.SIZE である', () => {
    // Given: 初期化後の GameState
    // When: board.length を確認する
    // Then: BOARD_CONFIG.SIZE (9) が返る
    expect(state.board.length).toBe(BOARD_CONFIG.SIZE);
  });

  test('各行の列数は BOARD_CONFIG.SIZE である', () => {
    // Given: 初期化後の GameState
    // When: board[i].length を確認する
    // Then: BOARD_CONFIG.SIZE (9) が返る
    state.board.forEach(row => {
      expect(row.length).toBe(BOARD_CONFIG.SIZE);
    });
  });

  test('初期ターンは先手（SENTE）である', () => {
    // Given: 初期化後の GameState
    // When: currentPlayer を確認する
    // Then: Player.SENTE が返る
    expect(state.currentPlayer).toBe(Player.SENTE);
  });

  test('初期状態で gameOver は false である', () => {
    // Given: 初期化後の GameState
    // When: gameOver を確認する
    // Then: false が返る
    expect(state.gameOver).toBe(false);
  });

  test('後手の1段目（row 0）に8枚の駒が配置される', () => {
    // Given: 初期化後の盤面
    // When: board[0] の駒数を確認する
    // Then: 8枚（全マスに駒）
    const filledCount = state.board[0].filter(cell => cell !== null).length;
    expect(filledCount).toBe(BOARD_CONFIG.SIZE);
  });

  test('先手の9段目（row 8）に8枚の駒が配置される', () => {
    // Given: 初期化後の盤面
    // When: board[8] の駒数を確認する
    // Then: 9枚（全マスに駒）
    const filledCount = state.board[8].filter(cell => cell !== null).length;
    expect(filledCount).toBe(BOARD_CONFIG.SIZE);
  });

  test('後手の3段目（row 2）に歩が9枚配置される', () => {
    // Given: 初期化後の盤面
    // When: board[2] の歩の数を確認する
    // Then: 9枚
    const pawns = state.board[2].filter(
      cell => cell && cell.type === PieceType.PAWN && cell.player === Player.GOTE
    );
    expect(pawns.length).toBe(BOARD_CONFIG.SIZE);
  });

  test('先手の7段目（row 6）に歩が9枚配置される', () => {
    // Given: 初期化後の盤面
    // When: board[6] の歩の数を確認する
    // Then: 9枚
    const pawns = state.board[6].filter(
      cell => cell && cell.type === PieceType.PAWN && cell.player === Player.SENTE
    );
    expect(pawns.length).toBe(BOARD_CONFIG.SIZE);
  });
});

describe('GameState.getPiece() - 境界値テスト', () => {
  test('境界値 (0, 0): 後手の香車が返る', () => {
    // Given: 初期盤面
    // When: (0,0) の駒を取得する
    // Then: 後手の香車
    const piece = state.getPiece(0, 0);
    expect(piece).not.toBeNull();
    expect(piece.type).toBe(PieceType.LANCE);
    expect(piece.player).toBe(Player.GOTE);
  });

  test('境界値 (8, 8): 先手の香車が返る', () => {
    // Given: 初期盤面
    // When: (8,8) の駒を取得する
    // Then: 先手の香車
    const piece = state.getPiece(8, 8);
    expect(piece).not.toBeNull();
    expect(piece.type).toBe(PieceType.LANCE);
    expect(piece.player).toBe(Player.SENTE);
  });

  test('境界外 (-1, 0): null が返る', () => {
    // Given: 盤面外の座標
    // When: (-1,0) の駒を取得する
    // Then: null
    expect(state.getPiece(-1, 0)).toBeNull();
  });

  test('境界外 (9, 0): null が返る（BOARD_CONFIG.SIZE）', () => {
    // Given: 盤面外の座標（SIZE と等しい）
    // When: (9,0) の駒を取得する
    // Then: null
    expect(state.getPiece(BOARD_CONFIG.SIZE, 0)).toBeNull();
  });

  test('境界外 (0, -1): null が返る', () => {
    // Given: 盤面外の座標
    // When: (0,-1) の駒を取得する
    // Then: null
    expect(state.getPiece(0, -1)).toBeNull();
  });

  test('境界外 (0, 9): null が返る（BOARD_CONFIG.SIZE）', () => {
    // Given: 盤面外の座標（SIZE と等しい）
    // When: (0,9) の駒を取得する
    // Then: null
    expect(state.getPiece(0, BOARD_CONFIG.SIZE)).toBeNull();
  });

  test('境界外 (MAX_INDEX + 1, 0): null が返る', () => {
    // Given: MAX_INDEX を 1 超えた座標
    // When: (MAX_INDEX+1, 0) の駒を取得する
    // Then: null
    expect(state.getPiece(BOARD_CONFIG.MAX_INDEX + 1, 0)).toBeNull();
  });

  test('有効範囲内 (4, 4): null が返る（初期配置の中央は空）', () => {
    // Given: 初期盤面の中央マス
    // When: (4,4) の駒を取得する
    // Then: null（駒なし）
    expect(state.getPiece(4, 4)).toBeNull();
  });
});

describe('GameState.findKing() - 玉の位置検索', () => {
  test('先手の玉は (8, 4) に存在する', () => {
    // Given: 初期盤面
    // When: 先手の玉を検索する
    // Then: { row: 8, col: 4 }
    const kingPos = state.findKing(Player.SENTE);
    expect(kingPos).toEqual({ row: 8, col: 4 });
  });

  test('後手の玉は (0, 4) に存在する', () => {
    // Given: 初期盤面
    // When: 後手の玉を検索する
    // Then: { row: 0, col: 4 }
    const kingPos = state.findKing(Player.GOTE);
    expect(kingPos).toEqual({ row: 0, col: 4 });
  });

  test('玉を除去後は null が返る（異常系）', () => {
    // Given: 先手の玉を除去した盤面
    // When: 先手の玉を検索する
    // Then: null
    state.board[8][4] = null;
    expect(state.findKing(Player.SENTE)).toBeNull();
  });
});

describe('GameState.movePiece() - 駒の移動', () => {
  test('正常な移動: true が返り駒が移動する', () => {
    // Given: 先手の歩がいる (6, 4)
    // When: (5, 4) に移動する
    // Then: true が返り、移動が反映される
    const result = state.movePiece(6, 4, 5, 4, false);
    expect(result).toBe(true);
    expect(state.board[6][4]).toBeNull();
    expect(state.board[5][4]).not.toBeNull();
    expect(state.board[5][4].type).toBe(PieceType.PAWN);
  });

  test('空マスから移動: false が返る（異常系）', () => {
    // Given: 空マス (4, 4)
    // When: (4, 4) から (3, 4) に移動しようとする
    // Then: false が返る
    expect(state.movePiece(4, 4, 3, 4, false)).toBe(false);
  });

  test('敵駒を取った場合、持ち駒に追加される', () => {
    // Given: 先手の歩を後手の歩の位置に移動できる設定
    // When: 先手歩を後手歩のマスに配置して移動する
    // Then: 先手の持ち駒に歩が追加される
    state.board[2][4] = { type: PieceType.PAWN, player: Player.GOTE };
    state.board[3][4] = { type: PieceType.PAWN, player: Player.SENTE };
    state.movePiece(3, 4, 2, 4, false);
    expect(state.hands[Player.SENTE][PieceType.PAWN]).toBeGreaterThan(0);
  });

  test('成り移動: 指定した駒が成り駒になる', () => {
    // Given: 成れる位置の先手の歩
    // When: promote=true で移動する
    // Then: 成り歩（と金）になる
    state.board[1][4] = { type: PieceType.PAWN, player: Player.SENTE };
    state.movePiece(1, 4, 0, 4, true);
    expect(state.board[0][4].type).toBe(PieceType.PROMOTED_PAWN);
  });

  test('lastMove が更新される', () => {
    // Given: 先手の歩がいる (6, 4)
    // When: (5, 4) に移動する
    // Then: lastMove が更新される
    state.movePiece(6, 4, 5, 4, false);
    expect(state.lastMove).toEqual({
      fromRow: 6, fromCol: 4, toRow: 5, toCol: 4,
    });
  });
});

describe('GameState.dropPiece() - 持ち駒を打つ', () => {
  test('持ち駒がある場合、正常に打てる', () => {
    // Given: 先手の持ち駒に歩を1枚付与
    // When: 空マスに打つ
    // Then: true が返り、駒が配置される
    state.hands[Player.SENTE][PieceType.PAWN] = 1;
    const result = state.dropPiece(PieceType.PAWN, 5, 4, Player.SENTE);
    expect(result).toBe(true);
    expect(state.board[5][4]).not.toBeNull();
    expect(state.board[5][4].type).toBe(PieceType.PAWN);
    expect(state.hands[Player.SENTE][PieceType.PAWN]).toBe(0);
  });

  test('持ち駒が0枚の場合: false が返る（異常系）', () => {
    // Given: 先手の持ち駒に歩が0枚
    // When: 歩を打とうとする
    // Then: false が返る
    expect(state.dropPiece(PieceType.PAWN, 5, 4, Player.SENTE)).toBe(false);
  });

  test('駒があるマスに打つ: false が返る（異常系）', () => {
    // Given: 先手の持ち駒に歩を1枚付与、(6,4) には既に歩がある
    // When: (6,4) に打とうとする
    // Then: false が返る
    state.hands[Player.SENTE][PieceType.PAWN] = 1;
    expect(state.dropPiece(PieceType.PAWN, 6, 4, Player.SENTE)).toBe(false);
  });
});

describe('GameState.switchTurn() - ターン切り替え', () => {
  test('先手から後手に切り替わる', () => {
    // Given: 先手のターン
    // When: switchTurn() を呼ぶ
    // Then: 後手のターンになる
    expect(state.currentPlayer).toBe(Player.SENTE);
    state.switchTurn();
    expect(state.currentPlayer).toBe(Player.GOTE);
  });

  test('後手から先手に切り替わる', () => {
    // Given: 後手のターン
    // When: switchTurn() を呼ぶ
    // Then: 先手のターンになる
    state.currentPlayer = Player.GOTE;
    state.switchTurn();
    expect(state.currentPlayer).toBe(Player.SENTE);
  });

  test('2回切り替えると元のプレイヤーに戻る', () => {
    // Given: 先手のターン
    // When: switchTurn() を 2 回呼ぶ
    // Then: 先手のターンに戻る
    state.switchTurn();
    state.switchTurn();
    expect(state.currentPlayer).toBe(Player.SENTE);
  });
});

describe('GameState.clone() - 盤面のコピー', () => {
  test('クローンは元と独立している（board の変更が伝播しない）', () => {
    // Given: 初期状態の GameState
    // When: clone() し、クローンの盤面を変更する
    // Then: 元の盤面は変更されない
    const clone = state.clone();
    clone.board[6][4] = null;
    expect(state.board[6][4]).not.toBeNull();
  });

  test('クローンの手駒は元と独立している', () => {
    // Given: 初期状態の GameState
    // When: clone() し、クローンの持ち駒を変更する
    // Then: 元の持ち駒は変更されない
    const clone = state.clone();
    clone.hands[Player.SENTE][PieceType.PAWN] = 99;
    expect(state.hands[Player.SENTE][PieceType.PAWN]).toBe(0);
  });

  test('クローンの currentPlayer は元と同じ', () => {
    // Given: 初期状態の GameState
    // When: clone() する
    // Then: currentPlayer が等しい
    const clone = state.clone();
    expect(clone.currentPlayer).toBe(state.currentPlayer);
  });
});
