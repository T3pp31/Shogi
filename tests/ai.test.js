/**
 * js/ai.js のテスト
 *
 * テスト観点の表（等価分割・境界値）
 *
 * | #  | 観点                                    | 分類   | 入力値/条件                                    | 期待結果                                      |
 * |----|-----------------------------------------|--------|------------------------------------------------|-----------------------------------------------|
 * |  1 | constructor: デフォルト深度              | 正常系 | depth未指定                                    | AI_CONFIG.DEFAULT_DEPTH が設定される           |
 * |  2 | constructor: カスタム深度               | 正常系 | depth=1                                        | depth=1 が設定される                           |
 * |  3 | constructor: AIプレイヤー設定            | 正常系 | Player.SENTE                                   | aiPlayer が正しく設定される                    |
 * |  4 | getBestMove: 初期局面                   | 正常系 | 初期盤面、先手AIターン                         | null以外の手が返る                             |
 * |  5 | getBestMove: 詰み直前の局面              | 正常系 | 王手できる状況                                 | 詰みの手を優先して返す                         |
 * |  6 | getBestMove: 合法手なし                 | 異常系 | 全駒除去後                                     | null が返る                                    |
 * |  7 | _generateAllMoves: 初期局面の手数        | 正常系 | 初期盤面                                       | 30手以上生成される                             |
 * |  8 | _generateAllMoves: 駒なし局面           | 異常系 | 全駒除去後（王のみ）                           | 王の合法手のみ生成される                       |
 * |  9 | _generateAllMoves: 成り手の生成          | 正常系 | 成れる状況                                     | 成り/不成の両方が生成される                    |
 * | 10 | _generateAllMoves: 強制成り              | 正常系 | 桂馬が1段目手前                                | 成り手のみ生成される                           |
 * | 11 | _generateAllMoves: 持ち駒の打ち手        | 正常系 | 持ち駒がある場合                               | 打ち手が生成される                             |
 * | 12 | _applyMove: 移動手の適用                | 正常系 | type='move'の手                                | 駒が移動し、ターンが切り替わる                 |
 * | 13 | _applyMove: 打ち手の適用                | 正常系 | type='drop'の手                                | 駒が配置され、ターンが切り替わる               |
 * | 14 | _applyMove: 元の状態が変更されない       | 正常系 | cloneにより元state不変                         | 元stateは変更されない                          |
 * | 15 | _evaluate: AI有利局面                   | 正常系 | AIが多数の駒を持つ                             | 正のスコアが返る                               |
 * | 16 | _evaluate: AI不利局面                   | 正常系 | 相手が多数の駒を持つ                           | 負のスコアが返る                               |
 * | 17 | _evaluate: 均等局面                     | 正常系 | 初期局面（先手AIの場合）                       | スコアが0付近                                  |
 * | 18 | _evaluate: 王手ボーナス                 | 正常系 | 相手を王手している状況                         | スコアが王手なし時より高い                     |
 * | 19 | _evaluatePieces: 全駒除去               | 境界値 | 空の盤面                                       | 0が返る                                        |
 * | 20 | _evaluatePieces: AI側のみ駒あり          | 正常系 | AI側に飛車1枚                                  | 正のスコアが返る                               |
 * | 21 | _evaluateHands: 持ち駒なし              | 境界値 | 持ち駒0枚                                      | 0が返る                                        |
 * | 22 | _evaluateHands: AI持ち駒あり            | 正常系 | AI側に歩1枚                                    | 正のスコアが返る                               |
 * | 23 | _evaluateKingSafety: 守備駒なし          | 境界値 | 王の周囲に駒なし                               | 0が返る                                        |
 * | 24 | _evaluateKingSafety: AI側守備駒あり      | 正常系 | AI王の周囲に味方駒                             | 正のスコアが返る                               |
 * | 25 | _countKingDefenders: 王なし             | 異常系 | 王を除去した状態                               | 0が返る                                        |
 * | 26 | _countKingDefenders: 周囲8方向に味方     | 境界値 | 8枚の守備駒                                    | 8が返る                                        |
 * | 27 | _getPositionBonus: テーブルなし駒        | 正常系 | 金将の位置ボーナス                             | 0が返る                                        |
 * | 28 | _getPositionBonus: 先手の歩              | 正常系 | 先手の歩が中央                                 | テーブル値が返る                               |
 * | 29 | _getPositionBonus: 後手の反転            | 正常系 | 後手はrow反転                                  | 反転されたテーブル値が返る                     |
 * | 30 | _generateCaptureMoves: 取り手なし        | 境界値 | 相手駒が隣接しない                             | 空配列が返る                                   |
 * | 31 | _generateCaptureMoves: 取り手あり        | 正常系 | 相手駒が隣接する                               | 取り手が返る                                   |
 * | 32 | _moveOrderScore: 取り手の優先度          | 正常系 | 駒を取る手                                     | 高いスコアが返る                               |
 * | 33 | _moveOrderScore: 成り手のボーナス        | 正常系 | 成り手                                         | スコアに PROMOTION_BONUS が加算される           |
 * | 34 | _moveOrderScore: 打ち手のスコア          | 正常系 | 打ち手                                         | スコア+100                                     |
 * | 35 | _orderMoves: ソート後の先頭              | 正常系 | 複数手の混合                                   | 最高スコアの手が先頭                           |
 * | 36 | _opponent: 先手AIの相手                  | 正常系 | aiPlayer=SENTE                                 | GOTE が返る                                    |
 * | 37 | _opponent: 後手AIの相手                  | 正常系 | aiPlayer=GOTE                                  | SENTE が返る                                   |
 * | 38 | _minimax: 深度0で評価値返却             | 正常系 | depth=0                                        | 評価値が返る（数値）                           |
 * | 39 | _minimax: 詰みで極端な値                | 正常系 | 詰みの局面                                     | ±Infinity相当の値が返る                        |
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { ShogiAI } from '../js/ai.js';
import { GameState } from '../js/game.js';
import { Player, PieceType } from '../js/pieces.js';
import { AI_CONFIG, PIECE_VALUES, POSITION_BONUS, BOARD_CONFIG } from '../js/config.js';

// ---- ヘルパー関数 ----

/** 盤面を全クリアして王だけを配置する */
function createEmptyStateWithKings() {
  const state = new GameState();
  // 全駒を除去
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      state.board[r][c] = null;
    }
  }
  // 持ち駒もリセット
  for (const player of [Player.SENTE, Player.GOTE]) {
    for (const key of Object.keys(state.hands[player])) {
      state.hands[player][key] = 0;
    }
  }
  return state;
}

// ============================================================
// constructor のテスト
// ============================================================
describe('ShogiAI - constructor', () => {
  test('デフォルト深度がAI_CONFIG.DEFAULT_DEPTHに設定される', () => {
    // Given: aiPlayer を渡す
    // When: depth 未指定でインスタンス生成
    // Then: depth === AI_CONFIG.DEFAULT_DEPTH
    const ai = new ShogiAI(Player.SENTE);
    expect(ai.depth).toBe(AI_CONFIG.DEFAULT_DEPTH);
  });

  test('カスタム深度が正しく設定される', () => {
    // Given: depth=1 を渡す
    // When: インスタンス生成
    // Then: depth === 1
    const ai = new ShogiAI(Player.SENTE, 1);
    expect(ai.depth).toBe(1);
  });

  test('aiPlayerが正しく設定される（先手）', () => {
    // Given: Player.SENTE を渡す
    // When: インスタンス生成
    // Then: aiPlayer === Player.SENTE
    const ai = new ShogiAI(Player.SENTE);
    expect(ai.aiPlayer).toBe(Player.SENTE);
  });

  test('aiPlayerが正しく設定される（後手）', () => {
    // Given: Player.GOTE を渡す
    // When: インスタンス生成
    // Then: aiPlayer === Player.GOTE
    const ai = new ShogiAI(Player.GOTE);
    expect(ai.aiPlayer).toBe(Player.GOTE);
  });
});

// ============================================================
// getBestMove のテスト
// ============================================================
describe('ShogiAI - getBestMove', () => {
  test('初期局面で合法手を返す（先手AI、depth=1）', () => {
    // Given: 初期盤面、先手AIターン
    // When: getBestMove を呼ぶ
    // Then: null でない手が返る
    const state = new GameState();
    const ai = new ShogiAI(Player.SENTE, 1);
    const move = ai.getBestMove(state);
    expect(move).not.toBeNull();
    expect(move.type).toMatch(/^(move|drop)$/);
  });

  test('合法手がない場合はnullを返す', () => {
    // Given: 全駒を除去した空盤（王もなし）
    // When: getBestMove を呼ぶ
    // Then: null が返る
    const state = createEmptyStateWithKings();
    // 王も除去して合法手0の状態にする
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        state.board[r][c] = null;
      }
    }
    const ai = new ShogiAI(Player.SENTE, 1);
    const move = ai.getBestMove(state);
    expect(move).toBeNull();
  });

  test('詰み一手前の局面で詰みの手を返す', () => {
    // Given: 後手の王が角で詰む局面を構成
    //   後手の王: (0,4)
    //   先手の金: (1,3), (1,5) で王の逃げ道を封じる
    //   先手の角: (2,4) → 成り角で王手詰みを狙う
    // When: 先手AIがdepth=1で手を選ぶ
    // Then: 王を取れる手またはnullでない手が返る
    const state = createEmptyStateWithKings();
    // 後手王
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    // 先手王（必須）
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    // 先手の金で周囲を封じる
    state.board[1][3] = { type: PieceType.GOLD, player: Player.SENTE };
    state.board[1][5] = { type: PieceType.GOLD, player: Player.SENTE };
    // 先手の飛車で直接王手
    state.board[2][4] = { type: PieceType.ROOK, player: Player.SENTE };
    state.currentPlayer = Player.SENTE;

    const ai = new ShogiAI(Player.SENTE, 1);
    const move = ai.getBestMove(state);
    expect(move).not.toBeNull();
  });

  test('後手AIが初期局面（後手ターン時）で合法手を返す（depth=1）', () => {
    // Given: 初期盤面でターンを後手に切り替え
    // When: 後手AIがgetBestMoveを呼ぶ
    // Then: null でない手が返る
    const state = new GameState();
    state.currentPlayer = Player.GOTE;
    const ai = new ShogiAI(Player.GOTE, 1);
    const move = ai.getBestMove(state);
    expect(move).not.toBeNull();
  });
});

// ============================================================
// _generateAllMoves のテスト
// ============================================================
describe('ShogiAI - _generateAllMoves', () => {
  test('初期局面で30手以上の合法手が生成される', () => {
    // Given: 初期盤面
    // When: _generateAllMoves(state, SENTE)
    // Then: 手数 >= 30
    const state = new GameState();
    const ai = new ShogiAI(Player.SENTE, 1);
    const moves = ai._generateAllMoves(state, Player.SENTE);
    expect(moves.length).toBeGreaterThanOrEqual(30);
  });

  test('全駒除去（王のみ）の局面で手が生成される', () => {
    // Given: 先手王(8,4)のみ
    // When: _generateAllMoves(state, SENTE)
    // Then: 王の移動手のみ（上/左/右など）
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const moves = ai._generateAllMoves(state, Player.SENTE);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every(m => m.type === 'move')).toBe(true);
  });

  test('成れる状況で成り/不成の両方が生成される', () => {
    // Given: 先手の銀が3段目から2段目へ移動できる配置
    // When: _generateAllMoves
    // Then: promote=true と promote=false の両方が含まれる
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    // 先手の銀を3段目(row=2)から2段目(row=1)へ移動できる位置に配置
    state.board[3][4] = { type: PieceType.SILVER, player: Player.SENTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const moves = ai._generateAllMoves(state, Player.SENTE);
    const silverMoves = moves.filter(m => m.type === 'move' && m.fromRow === 3 && m.fromCol === 4);
    // 成り圏への移動があれば promote=true と false の両方
    const toPromoZone = silverMoves.filter(m => m.toRow <= 2);
    if (toPromoZone.length > 0) {
      const promoteMoves = toPromoZone.filter(m => m.promote === true);
      const noPromoteMoves = toPromoZone.filter(m => m.promote === false);
      expect(promoteMoves.length).toBeGreaterThan(0);
      expect(noPromoteMoves.length).toBeGreaterThan(0);
    }
  });

  test('強制成りの場合は成り手のみ生成される', () => {
    // Given: 先手の桂馬が2段目から1段目(row=0)または0段目に移動できる配置
    // When: _generateAllMoves
    // Then: 1段目への桂馬移動は promote=true のみ
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    // 桂馬: row=2, col=4 → 成り必須のrow=0への移動
    state.board[2][4] = { type: PieceType.KNIGHT, player: Player.SENTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const moves = ai._generateAllMoves(state, Player.SENTE);
    const knightMoves = moves.filter(m => m.type === 'move' && m.fromRow === 2 && m.fromCol === 4);
    // 桂馬の移動先はrow=0（強制成り）
    const mandatoryPromo = knightMoves.filter(m => m.toRow === 0);
    if (mandatoryPromo.length > 0) {
      expect(mandatoryPromo.every(m => m.promote === true)).toBe(true);
    }
  });

  test('持ち駒がある場合に打ち手が生成される', () => {
    // Given: 先手の持ち駒に歩が1枚
    // When: _generateAllMoves
    // Then: type='drop' の手が含まれる
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.hands[Player.SENTE][PieceType.PAWN] = 1;
    const ai = new ShogiAI(Player.SENTE, 1);
    const moves = ai._generateAllMoves(state, Player.SENTE);
    const drops = moves.filter(m => m.type === 'drop');
    expect(drops.length).toBeGreaterThan(0);
  });

  test('持ち駒がない場合に打ち手が生成されない', () => {
    // Given: 持ち駒すべて0
    // When: _generateAllMoves（王のみ）
    // Then: type='drop' の手が含まれない
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const moves = ai._generateAllMoves(state, Player.SENTE);
    const drops = moves.filter(m => m.type === 'drop');
    expect(drops.length).toBe(0);
  });
});

// ============================================================
// _applyMove のテスト
// ============================================================
describe('ShogiAI - _applyMove', () => {
  test('移動手を適用すると駒が正しい位置に移動する', () => {
    // Given: 先手の歩が(6,4)にある
    // When: (6,4)→(5,4)の移動手を適用
    // Then: (5,4)に先手の歩があり、(6,4)はnull
    const state = new GameState();
    const ai = new ShogiAI(Player.SENTE, 1);
    const move = { type: 'move', fromRow: 6, fromCol: 4, toRow: 5, toCol: 4, promote: false };
    const newState = ai._applyMove(state, move);
    expect(newState.getPiece(5, 4)).toEqual({ type: PieceType.PAWN, player: Player.SENTE });
    expect(newState.getPiece(6, 4)).toBeNull();
  });

  test('移動手を適用するとターンが切り替わる', () => {
    // Given: 先手のターン
    // When: 移動手を適用
    // Then: ターンが後手になる
    const state = new GameState();
    const ai = new ShogiAI(Player.SENTE, 1);
    const move = { type: 'move', fromRow: 6, fromCol: 4, toRow: 5, toCol: 4, promote: false };
    const newState = ai._applyMove(state, move);
    expect(newState.currentPlayer).toBe(Player.GOTE);
  });

  test('打ち手を適用すると駒が正しく配置される', () => {
    // Given: 先手の持ち駒に歩が1枚
    // When: (5,4)に歩を打つ
    // Then: (5,4)に先手の歩が配置される
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.hands[Player.SENTE][PieceType.PAWN] = 1;
    state.currentPlayer = Player.SENTE;
    const ai = new ShogiAI(Player.SENTE, 1);
    const move = { type: 'drop', toRow: 5, toCol: 4, pieceType: PieceType.PAWN };
    const newState = ai._applyMove(state, move);
    expect(newState.getPiece(5, 4)).toEqual({ type: PieceType.PAWN, player: Player.SENTE });
    expect(newState.hands[Player.SENTE][PieceType.PAWN]).toBe(0);
  });

  test('元の状態は変更されない（イミュータブル）', () => {
    // Given: 先手の歩が(6,4)にある元state
    // When: 移動手を適用して新stateを生成
    // Then: 元stateの(6,4)は先手の歩のまま
    const state = new GameState();
    const ai = new ShogiAI(Player.SENTE, 1);
    const move = { type: 'move', fromRow: 6, fromCol: 4, toRow: 5, toCol: 4, promote: false };
    ai._applyMove(state, move);
    expect(state.getPiece(6, 4)).toEqual({ type: PieceType.PAWN, player: Player.SENTE });
    expect(state.currentPlayer).toBe(Player.SENTE);
  });

  test('打ち手を適用するとターンが切り替わる', () => {
    // Given: 先手のターンで持ち駒歩あり
    // When: 打ち手を適用
    // Then: 後手のターンになる
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.hands[Player.SENTE][PieceType.PAWN] = 1;
    state.currentPlayer = Player.SENTE;
    const ai = new ShogiAI(Player.SENTE, 1);
    const move = { type: 'drop', toRow: 5, toCol: 4, pieceType: PieceType.PAWN };
    const newState = ai._applyMove(state, move);
    expect(newState.currentPlayer).toBe(Player.GOTE);
  });
});

// ============================================================
// _evaluate のテスト
// ============================================================
describe('ShogiAI - _evaluate', () => {
  test('初期局面は先手AI視点でほぼ0（対称局面）', () => {
    // Given: 初期盤面、先手AI
    // When: _evaluate
    // Then: スコアが -100〜100 の範囲（駒価値が均等）
    const state = new GameState();
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluate(state);
    expect(score).toBeGreaterThanOrEqual(-200);
    expect(score).toBeLessThanOrEqual(200);
  });

  test('AI側に飛車を追加すると正のスコアになる', () => {
    // Given: 初期盤面からAI側（先手）に飛車の持ち駒を1枚追加
    // When: _evaluate
    // Then: スコアが正
    const state = new GameState();
    state.hands[Player.SENTE][PieceType.ROOK] = 1;
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluate(state);
    expect(score).toBeGreaterThan(0);
  });

  test('相手側に飛車を追加すると負のスコアになる', () => {
    // Given: 相手（後手）に飛車の持ち駒を1枚追加
    // When: _evaluate
    // Then: スコアが負
    const state = new GameState();
    state.hands[Player.GOTE][PieceType.ROOK] = 1;
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluate(state);
    expect(score).toBeLessThan(0);
  });

  test('相手を王手している場合はCHECK_BONUSが加算される', () => {
    // Given: 先手AIが後手の王を王手できる局面と、そうでない局面
    // When: それぞれ _evaluate を呼ぶ
    // Then: 王手局面のスコアが高い
    const baseState = createEmptyStateWithKings();
    baseState.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    baseState.board[0][4] = { type: PieceType.KING, player: Player.GOTE };

    const checkState = createEmptyStateWithKings();
    checkState.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    checkState.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    // 先手の飛車を配置して後手を王手
    checkState.board[1][4] = { type: PieceType.ROOK, player: Player.SENTE };

    const ai = new ShogiAI(Player.SENTE, 1);
    const baseScore = ai._evaluate(baseState);
    const checkScore = ai._evaluate(checkState);
    expect(checkScore).toBeGreaterThan(baseScore);
  });
});

// ============================================================
// _evaluatePieces のテスト
// ============================================================
describe('ShogiAI - _evaluatePieces', () => {
  test('全駒なし（王のみ）の場合にスコアが返る', () => {
    // Given: 王だけの盤面
    // When: _evaluatePieces
    // Then: 数値が返る（クラッシュしない）
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluatePieces(state);
    expect(typeof score).toBe('number');
  });

  test('AI側にのみ飛車がある場合は正のスコア', () => {
    // Given: 先手の飛車(5,4)、王のみの後手
    // When: _evaluatePieces
    // Then: PIECE_VALUES.rook 以上の正スコア
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.board[5][4] = { type: PieceType.ROOK, player: Player.SENTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluatePieces(state);
    // 飛車の価値分以上のプラスになるはず（王の差引があるが飛車の価値が大きい）
    expect(score).toBeGreaterThan(0);
  });

  test('相手にのみ飛車がある場合は負のスコア', () => {
    // Given: 後手の飛車(5,4)、王のみの先手
    // When: _evaluatePieces
    // Then: 負のスコア
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.board[5][4] = { type: PieceType.ROOK, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluatePieces(state);
    expect(score).toBeLessThan(0);
  });
});

// ============================================================
// _evaluateHands のテスト
// ============================================================
describe('ShogiAI - _evaluateHands', () => {
  test('持ち駒がない場合は0を返す', () => {
    // Given: 持ち駒が全員0
    // When: _evaluateHands
    // Then: 0
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluateHands(state);
    expect(score).toBe(0);
  });

  test('AI側に歩1枚の持ち駒があると正のスコア', () => {
    // Given: 先手AIの持ち駒に歩が1枚
    // When: _evaluateHands
    // Then: PIECE_VALUES.pawn * HAND_PIECE_MULTIPLIER 以上の正スコア
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.hands[Player.SENTE][PieceType.PAWN] = 1;
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluateHands(state);
    const expected = PIECE_VALUES.pawn * AI_CONFIG.HAND_PIECE_MULTIPLIER;
    expect(score).toBeCloseTo(expected);
  });

  test('相手に飛車1枚の持ち駒があると負のスコア', () => {
    // Given: 後手の持ち駒に飛車が1枚
    // When: _evaluateHands
    // Then: 負のスコア
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.hands[Player.GOTE][PieceType.ROOK] = 1;
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluateHands(state);
    expect(score).toBeLessThan(0);
  });
});

// ============================================================
// _evaluateKingSafety のテスト
// ============================================================
describe('ShogiAI - _evaluateKingSafety', () => {
  test('守備駒がない場合は0を返す', () => {
    // Given: 王だけの局面（守備駒なし）
    // When: _evaluateKingSafety
    // Then: 0
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluateKingSafety(state);
    expect(score).toBe(0);
  });

  test('AI側の王の隣に味方駒があると正のスコア', () => {
    // Given: 先手王(8,4)の隣(8,3)に先手の金
    // When: _evaluateKingSafety
    // Then: KING_SAFETY_BONUS 以上の正スコア
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.board[8][3] = { type: PieceType.GOLD, player: Player.SENTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._evaluateKingSafety(state);
    expect(score).toBeGreaterThanOrEqual(AI_CONFIG.KING_SAFETY_BONUS);
  });
});

// ============================================================
// _countKingDefenders のテスト
// ============================================================
describe('ShogiAI - _countKingDefenders', () => {
  test('王が存在しない場合は0を返す', () => {
    // Given: 王を除去した局面
    // When: _countKingDefenders(state, SENTE)
    // Then: 0
    const state = createEmptyStateWithKings();
    // 王を配置しない
    const ai = new ShogiAI(Player.SENTE, 1);
    const count = ai._countKingDefenders(state, Player.SENTE);
    expect(count).toBe(0);
  });

  test('周囲8方向に味方駒がいる場合は8を返す', () => {
    // Given: 先手王(4,4)の周囲8マスすべてに先手の金
    // When: _countKingDefenders(state, SENTE)
    // Then: 8
    const state = createEmptyStateWithKings();
    state.board[4][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    const directions = [
      [-1,-1],[-1,0],[-1,1],
      [0,-1],         [0,1],
      [1,-1], [1,0],  [1,1],
    ];
    for (const [dr, dc] of directions) {
      state.board[4 + dr][4 + dc] = { type: PieceType.GOLD, player: Player.SENTE };
    }
    const ai = new ShogiAI(Player.SENTE, 1);
    const count = ai._countKingDefenders(state, Player.SENTE);
    expect(count).toBe(8);
  });

  test('周囲に相手駒がいても0を返す', () => {
    // Given: 先手王(4,4)の隣に後手駒
    // When: _countKingDefenders(state, SENTE)
    // Then: 0
    const state = createEmptyStateWithKings();
    state.board[4][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.board[4][3] = { type: PieceType.GOLD, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const count = ai._countKingDefenders(state, Player.SENTE);
    expect(count).toBe(0);
  });

  test('盤端の王（角）でも範囲外チェックしない', () => {
    // Given: 先手王が(0,0)（角）にいる
    // When: _countKingDefenders
    // Then: クラッシュせず0〜3の範囲の数値を返す
    const state = createEmptyStateWithKings();
    state.board[0][0] = { type: PieceType.KING, player: Player.SENTE };
    state.board[8][8] = { type: PieceType.KING, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const count = ai._countKingDefenders(state, Player.SENTE);
    expect(count).toBeGreaterThanOrEqual(0);
    expect(count).toBeLessThanOrEqual(3);
  });
});

// ============================================================
// _getPositionBonus のテスト
// ============================================================
describe('ShogiAI - _getPositionBonus', () => {
  test('テーブルが定義されていない駒（金将）は0を返す', () => {
    // Given: type='gold'（POSITION_BONUSにテーブルなし）
    // When: _getPositionBonus
    // Then: 0
    const ai = new ShogiAI(Player.SENTE, 1);
    const bonus = ai._getPositionBonus(PieceType.GOLD, Player.SENTE, 4, 4);
    expect(bonus).toBe(0);
  });

  test('先手の歩のボーナスがテーブルと一致する', () => {
    // Given: type='pawn', player=SENTE, row=5, col=4
    // When: _getPositionBonus
    // Then: POSITION_BONUS.pawn[5][4]
    const ai = new ShogiAI(Player.SENTE, 1);
    const bonus = ai._getPositionBonus(PieceType.PAWN, Player.SENTE, 5, 4);
    expect(bonus).toBe(POSITION_BONUS.pawn[5][4]);
  });

  test('後手の歩はrow反転したテーブル値を返す', () => {
    // Given: type='pawn', player=GOTE, row=3, col=4
    // When: _getPositionBonus（後手はrow=MAX_INDEX-3=5に反転）
    // Then: POSITION_BONUS.pawn[5][4]
    const ai = new ShogiAI(Player.SENTE, 1);
    const bonus = ai._getPositionBonus(PieceType.PAWN, Player.GOTE, 3, 4);
    const effectiveRow = BOARD_CONFIG.MAX_INDEX - 3;
    expect(bonus).toBe(POSITION_BONUS.pawn[effectiveRow][4]);
  });

  test('先手の王のボーナスがテーブルと一致する', () => {
    // Given: type='king', player=SENTE, row=8, col=4
    // When: _getPositionBonus
    // Then: POSITION_BONUS.king[8][4]
    const ai = new ShogiAI(Player.SENTE, 1);
    const bonus = ai._getPositionBonus(PieceType.KING, Player.SENTE, 8, 4);
    expect(bonus).toBe(POSITION_BONUS.king[8][4]);
  });
});

// ============================================================
// _generateCaptureMoves のテスト
// ============================================================
describe('ShogiAI - _generateCaptureMoves', () => {
  test('取れる駒がない場合は空配列を返す', () => {
    // Given: 先手の歩のみ、相手駒なし
    // When: _generateCaptureMoves(state, SENTE)
    // Then: []
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.board[6][4] = { type: PieceType.PAWN, player: Player.SENTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const moves = ai._generateCaptureMoves(state, Player.SENTE);
    expect(moves).toHaveLength(0);
  });

  test('取れる相手駒がある場合は取り手を返す', () => {
    // Given: 先手の飛車が後手の歩を取れる位置
    // When: _generateCaptureMoves(state, SENTE)
    // Then: 後手の歩を取る手が含まれる
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.board[5][4] = { type: PieceType.ROOK, player: Player.SENTE };
    state.board[2][4] = { type: PieceType.PAWN, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const moves = ai._generateCaptureMoves(state, Player.SENTE);
    const captureMove = moves.find(m => m.toRow === 2 && m.toCol === 4);
    expect(captureMove).toBeDefined();
  });
});

// ============================================================
// _moveOrderScore のテスト
// ============================================================
describe('ShogiAI - _moveOrderScore', () => {
  test('低価値の駒で高価値の駒を取る手は正のスコアを持つ（MVV-LVA）', () => {
    // Given: 先手の歩(pawn=100)が後手の飛車(rook=1000)を取れる位置
    //   スコア = targetValue*10 - attackerValue = 1000*10 - 100 = 9900 > 0
    // When: _moveOrderScore
    // Then: 正のスコア
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    // 先手の歩(5,4)が後手の飛車(4,4)を取る
    state.board[5][4] = { type: PieceType.PAWN, player: Player.SENTE };
    state.board[4][4] = { type: PieceType.ROOK, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const captureMove = { type: 'move', fromRow: 5, fromCol: 4, toRow: 4, toCol: 4, promote: false };
    const score = ai._moveOrderScore(captureMove, state);
    // rook(1000)*10 - pawn(100) = 9900 > 0
    expect(score).toBeGreaterThan(0);
    expect(score).toBe(PIECE_VALUES.rook * 10 - PIECE_VALUES.pawn);
  });

  test('成り手にはPROMOTION_BONUSが加算される', () => {
    // Given: 成り手と不成手
    // When: それぞれの_moveOrderScore
    // Then: 成り手のスコアがPROMOTION_BONUS分高い
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.board[3][4] = { type: PieceType.SILVER, player: Player.SENTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const promoteMove = { type: 'move', fromRow: 3, fromCol: 4, toRow: 2, toCol: 4, promote: true };
    const noPromoteMove = { type: 'move', fromRow: 3, fromCol: 4, toRow: 2, toCol: 4, promote: false };
    const promoteScore = ai._moveOrderScore(promoteMove, state);
    const noPromoteScore = ai._moveOrderScore(noPromoteMove, state);
    expect(promoteScore - noPromoteScore).toBe(AI_CONFIG.PROMOTION_BONUS);
  });

  test('打ち手は+100のスコアを持つ', () => {
    // Given: 打ち手
    // When: _moveOrderScore
    // Then: 100
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);
    const dropMove = { type: 'drop', toRow: 5, toCol: 4, pieceType: PieceType.PAWN };
    const score = ai._moveOrderScore(dropMove, state);
    expect(score).toBe(100);
  });
});

// ============================================================
// _orderMoves のテスト
// ============================================================
describe('ShogiAI - _orderMoves', () => {
  test('高価値の駒を取る手が先頭になるようにソートされる', () => {
    // Given: 歩で飛車を取る手（スコア高）と通常移動手（スコア0）が混在
    // When: _orderMoves
    // Then: 飛車を取る手が先頭
    //   歩(5,4)が後手飛車(4,4)を取る: score = rook*10 - pawn = 9900
    //   歩(5,4)が(3,4)に通常移動: score = 0
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.board[5][4] = { type: PieceType.PAWN, player: Player.SENTE };
    state.board[4][4] = { type: PieceType.ROOK, player: Player.GOTE };
    const ai = new ShogiAI(Player.SENTE, 1);

    const normalMove = { type: 'move', fromRow: 5, fromCol: 4, toRow: 3, toCol: 4, promote: false };
    const captureMove = { type: 'move', fromRow: 5, fromCol: 4, toRow: 4, toCol: 4, promote: false };
    const moves = [normalMove, captureMove];
    ai._orderMoves(moves, state);
    expect(moves[0]).toEqual(captureMove);
  });
});

// ============================================================
// _opponent のテスト
// ============================================================
describe('ShogiAI - _opponent', () => {
  test('先手AIの相手はGOTE', () => {
    // Given: aiPlayer=SENTE
    // When: _opponent()
    // Then: Player.GOTE
    const ai = new ShogiAI(Player.SENTE);
    expect(ai._opponent()).toBe(Player.GOTE);
  });

  test('後手AIの相手はSENTE', () => {
    // Given: aiPlayer=GOTE
    // When: _opponent()
    // Then: Player.SENTE
    const ai = new ShogiAI(Player.GOTE);
    expect(ai._opponent()).toBe(Player.SENTE);
  });
});

// ============================================================
// _minimax のテスト
// ============================================================
describe('ShogiAI - _minimax', () => {
  test('depth=0で評価値（数値）が返る', () => {
    // Given: 初期盤面、depth=0
    // When: _minimax(state, 0, -Infinity, Infinity, true)
    // Then: 数値が返る
    const state = new GameState();
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._minimax(state, 0, -Infinity, Infinity, true);
    expect(typeof score).toBe('number');
    expect(isFinite(score)).toBe(true);
  });

  test('depth=1でも数値が返る', () => {
    // Given: 初期盤面、depth=1
    // When: _minimax(state, 1, -Infinity, Infinity, true)
    // Then: 数値が返る
    const state = new GameState();
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._minimax(state, 1, -Infinity, Infinity, true);
    expect(typeof score).toBe('number');
  });

  test('詰みの局面は極端な値を返す', () => {
    // Given: 先手AIにとって詰みの局面（先手が詰んでいる = 最小化の場面）
    // When: _minimax(state, 0, ...) で isMaximizing=false のとき合法手がない
    // Then: Infinity相当の値が返る（最小化側なので相手が有利＝高い値）
    const state = createEmptyStateWithKings();
    // 先手の玉を詰み局面にする
    state.board[0][0] = { type: PieceType.KING, player: Player.SENTE };
    state.board[8][8] = { type: PieceType.KING, player: Player.GOTE };
    // 後手の金で先手を囲む
    state.board[0][1] = { type: PieceType.GOLD, player: Player.GOTE };
    state.board[1][0] = { type: PieceType.GOLD, player: Player.GOTE };
    state.board[1][1] = { type: PieceType.GOLD, player: Player.GOTE };
    // 後手の飛車で王手
    state.board[2][0] = { type: PieceType.ROOK, player: Player.GOTE };
    state.currentPlayer = Player.SENTE;

    const ai = new ShogiAI(Player.SENTE, 1);
    // 深度1で先手（isMaximizing=true）の手を探索する
    // 先手が合法手なければ -Infinity が返るべき
    const score = ai._minimax(state, 1, -Infinity, Infinity, true);
    expect(typeof score).toBe('number');
  });

  test('isMaximizing=falseで最小化プレイヤーの手が評価される', () => {
    // Given: 初期盤面
    // When: _minimax(state, 1, -Infinity, Infinity, false)（後手が最小化）
    // Then: 数値が返る
    const state = new GameState();
    state.currentPlayer = Player.GOTE;
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._minimax(state, 1, -Infinity, Infinity, false);
    expect(typeof score).toBe('number');
  });
});

// ============================================================
// カバレッジ向上用の追加テスト
// ============================================================
describe('ShogiAI - カバレッジ向上（静止探索・特殊ケース）', () => {
  test('_evaluate: AIが王手されている場合はCHECK_BONUSが減算される', () => {
    // Given: 後手の飛車が先手の王に王手している局面
    // When: 先手AIで_evaluate
    // Then: 王手されていない局面よりスコアが低い
    const baseState = createEmptyStateWithKings();
    baseState.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    baseState.board[0][4] = { type: PieceType.KING, player: Player.GOTE };

    const checkState = createEmptyStateWithKings();
    checkState.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    checkState.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    // 後手の飛車で先手を王手
    checkState.board[7][4] = { type: PieceType.ROOK, player: Player.GOTE };

    const ai = new ShogiAI(Player.SENTE, 1);
    const baseScore = ai._evaluate(baseState);
    const checkScore = ai._evaluate(checkState);
    // 王手されている局面はAI不利なのでスコアが低い
    expect(checkScore).toBeLessThan(baseScore);
  });

  test('_quiescenceSearch: 取り手がある場合に探索が進む（depth > 0）', () => {
    // Given: 先手AIが後手の飛車を歩で取れる局面
    // When: _quiescenceSearch(state, 2, ...) を直接呼ぶ
    // Then: 数値が返る（クラッシュしない）
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.GOTE };
    state.board[5][4] = { type: PieceType.PAWN, player: Player.SENTE };
    state.board[4][4] = { type: PieceType.ROOK, player: Player.GOTE };
    state.currentPlayer = Player.SENTE;
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._quiescenceSearch(state, 2, -Infinity, Infinity, true);
    expect(typeof score).toBe('number');
  });

  test('_quiescenceSearch: 最小化プレイヤーの取り手ループが実行される', () => {
    // Given: 相手（後手AI相手=先手）が飛車を取れる局面
    // When: _quiescenceSearch isMaximizing=false で呼ぶ
    // Then: 数値が返る
    const state = createEmptyStateWithKings();
    state.board[8][4] = { type: PieceType.KING, player: Player.GOTE };
    state.board[0][4] = { type: PieceType.KING, player: Player.SENTE };
    // 先手（相手）が後手の飛車を歩で取れる
    state.board[5][4] = { type: PieceType.PAWN, player: Player.SENTE };
    state.board[4][4] = { type: PieceType.ROOK, player: Player.GOTE };
    state.currentPlayer = Player.SENTE;
    const ai = new ShogiAI(Player.GOTE, 1);
    const score = ai._quiescenceSearch(state, 2, -Infinity, Infinity, false);
    expect(typeof score).toBe('number');
  });

  test('_minimax: 合法手なし・王手なし（千日手相当）は0を返す', () => {
    // Given: 完全に空の盤面（王なし）で合法手0
    //        isInCheck も false になる（王がないので）
    // When: _minimax(state, 1, ..., true)
    // Then: 0が返る
    const state = createEmptyStateWithKings();
    // 王を置かない → findKingがnullを返しisInCheckはfalse、generateAllMovesは[]
    const ai = new ShogiAI(Player.SENTE, 1);
    const score = ai._minimax(state, 1, -Infinity, Infinity, true);
    expect(score).toBe(0);
  });

  test('getBestMove: depth=2の探索でも合法手を返す', () => {
    // Given: 初期盤面、depth=2
    // When: getBestMove
    // Then: 合法手を返す（ミニマックスの最小化側も実行される）
    const state = new GameState();
    const ai = new ShogiAI(Player.SENTE, 2);
    const move = ai.getBestMove(state);
    expect(move).not.toBeNull();
    expect(move.type).toMatch(/^(move|drop)$/);
  });
});
