/**
 * js/config.js のテスト
 *
 * テスト観点の表（等価分割・境界値）
 *
 * | # | 観点                       | 分類   | 入力値/条件                          | 期待結果                        |
 * |---|---------------------------|--------|--------------------------------------|---------------------------------|
 * | 1 | BOARD_CONFIG.SIZE         | 正常系 | 値の確認                             | 9                               |
 * | 2 | BOARD_CONFIG.MAX_INDEX    | 正常系 | 値の確認                             | 8（SIZE - 1）                   |
 * | 3 | BOARD_CONFIG.MIN_INDEX    | 正常系 | 値の確認                             | 0                               |
 * | 4 | BOARD_CONFIG.STAR_POINTS  | 正常系 | 配列の要素数と各座標                 | 4点、row/col 3または6           |
 * | 5 | SENTE_PROMOTION_ZONE      | 正常系 | 配列の内容                           | [0,1,2]                         |
 * | 6 | GOTE_PROMOTION_ZONE       | 正常系 | 配列の内容                           | [6,7,8]                         |
 * | 7 | SENTE_PAWN_LANCE_MIN_ROW  | 正常系 | 値の確認（境界値）                   | 0（盤面の最小インデックス）     |
 * | 8 | SENTE_KNIGHT_MIN_ROW      | 正常系 | 値の確認（境界値）                   | 1                               |
 * | 9 | GOTE_PAWN_LANCE_MAX_ROW   | 正常系 | 値の確認（境界値）                   | 8（盤面の最大インデックス）     |
 * |10 | GOTE_KNIGHT_MAX_ROW       | 正常系 | 値の確認（境界値）                   | 7                               |
 * |11 | DOM_SELECTORS 全キー       | 正常系 | 文字列であること                     | 全て string 型                  |
 * |12 | DOM_SELECTORS.HAND_PIECES | 正常系 | CSSセレクタ形式                      | '.' で始まる                    |
 * |13 | DOM_SELECTORS.HAND_PIECE  | 正常系 | CSSセレクタ形式                      | '.' で始まる                    |
 * |14 | DOM_SELECTORS.BOARD       | 正常系 | ID文字列                             | 'board'                         |
 * |15 | UI_TEXT.SENTE_NAME        | 正常系 | 先手名                               | '先手'                          |
 * |16 | UI_TEXT.GOTE_NAME         | 正常系 | 後手名                               | '後手'                          |
 * |17 | UI_TEXT.WIN_SUFFIX        | 正常系 | 勝利メッセージ接尾辞                 | 'の勝ち！'                      |
 * |18 | UI_TEXT.TURN_SUFFIX       | 正常系 | ターン表示接尾辞                     | 'の番です'                      |
 * |19 | UI_TEXT.CHECK_SUFFIX      | 正常系 | 王手表示接尾辞                       | '王手' を含む                   |
 * |20 | SOUND_CONFIG.MOVE         | 正常系 | 全キーが数値                         | 全て number 型                  |
 * |21 | SOUND_CONFIG.CAPTURE      | 正常系 | 全キーが数値                         | 全て number 型                  |
 * |22 | SOUND_CONFIG.CHECK        | 正常系 | 全キーが数値                         | 全て number 型                  |
 * |23 | SOUND_CONFIG.CHECKMATE    | 正常系 | notes は配列、他は数値              | notes は Array                  |
 * |24 | SOUND_CONFIG.CHECK.count  | 正常系 | 整数であること                       | 2                               |
 * |25 | PROMOTION_ZONE 整合性      | 異常系 | SENTE と GOTE が重複しないか         | 共通要素なし                    |
 * |26 | BOARD_CONFIG 不変性        | 異常系 | 値が変更されないこと（const）        | 再import後も同値                |
 * |27 | STAR_POINTS 座標の重複     | 異常系 | 重複する座標がないか                 | 全座標がユニーク                |
 * |28 | SIZE と INDEX の整合性     | 境界値 | MAX_INDEX = SIZE - 1                 | true                            |
 */

import { describe, test, expect } from '@jest/globals';
import {
  BOARD_CONFIG,
  DOM_SELECTORS,
  UI_TEXT,
  SOUND_CONFIG,
} from '../js/config.js';

// ============================================================
// BOARD_CONFIG テスト
// ============================================================

describe('BOARD_CONFIG', () => {
  // 正常系: 盤面サイズ
  test('SIZE は 9 である', () => {
    // Given: 将棋盤の定義
    // When: SIZE を参照する
    // Then: 9 が返る
    expect(BOARD_CONFIG.SIZE).toBe(9);
  });

  test('MAX_INDEX は SIZE - 1 と等しい（境界値）', () => {
    // Given: SIZE と MAX_INDEX の定義
    // When: 両者を比較する
    // Then: MAX_INDEX = SIZE - 1
    expect(BOARD_CONFIG.MAX_INDEX).toBe(BOARD_CONFIG.SIZE - 1);
  });

  test('MIN_INDEX は 0 である（境界値）', () => {
    // Given: 盤面の最小インデックス定義
    // When: MIN_INDEX を参照する
    // Then: 0 が返る
    expect(BOARD_CONFIG.MIN_INDEX).toBe(0);
  });

  test('MAX_INDEX は 8 である', () => {
    // Given: 9x9盤面の最大インデックス
    // When: MAX_INDEX を参照する
    // Then: 8 が返る
    expect(BOARD_CONFIG.MAX_INDEX).toBe(8);
  });

  // 正常系: 星点
  test('STAR_POINTS は 4 点である', () => {
    // Given: 将棋盤の星点定義
    // When: 配列の長さを確認する
    // Then: 4 点が返る
    expect(BOARD_CONFIG.STAR_POINTS).toHaveLength(4);
  });

  test('STAR_POINTS の各点は row と col を持つ', () => {
    // Given: 星点の配列
    // When: 各要素のプロパティを確認する
    // Then: row と col が存在する
    BOARD_CONFIG.STAR_POINTS.forEach(point => {
      expect(point).toHaveProperty('row');
      expect(point).toHaveProperty('col');
    });
  });

  test('STAR_POINTS の全座標がユニークである（重複なし）', () => {
    // Given: 星点の配列
    // When: キー文字列に変換してSetで重複チェック
    // Then: 重複がない
    const keys = BOARD_CONFIG.STAR_POINTS.map(p => `${p.row},${p.col}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  test('STAR_POINTS は (3,3), (3,6), (6,3), (6,6) を含む', () => {
    // Given: 将棋盤の標準的な星点座標
    // When: 配列に期待座標が含まれるか確認
    // Then: 4座標全て含まれる
    const expected = [
      { row: 3, col: 3 },
      { row: 3, col: 6 },
      { row: 6, col: 3 },
      { row: 6, col: 6 },
    ];
    expected.forEach(pt => {
      const found = BOARD_CONFIG.STAR_POINTS.some(
        p => p.row === pt.row && p.col === pt.col
      );
      expect(found).toBe(true);
    });
  });

  // 正常系: 成りゾーン
  test('SENTE_PROMOTION_ZONE は [0, 1, 2] である', () => {
    // Given: 先手の成りゾーン定義
    // When: 配列を確認する
    // Then: [0,1,2] が返る
    expect(BOARD_CONFIG.SENTE_PROMOTION_ZONE).toEqual([0, 1, 2]);
  });

  test('GOTE_PROMOTION_ZONE は [6, 7, 8] である', () => {
    // Given: 後手の成りゾーン定義
    // When: 配列を確認する
    // Then: [6,7,8] が返る
    expect(BOARD_CONFIG.GOTE_PROMOTION_ZONE).toEqual([6, 7, 8]);
  });

  // 異常系: 成りゾーンの重複
  test('SENTE と GOTE の成りゾーンに重複する行がない', () => {
    // Given: 先手・後手の成りゾーン
    // When: 共通要素を確認する
    // Then: 共通要素は存在しない
    const overlap = BOARD_CONFIG.SENTE_PROMOTION_ZONE.filter(r =>
      BOARD_CONFIG.GOTE_PROMOTION_ZONE.includes(r)
    );
    expect(overlap).toHaveLength(0);
  });

  // 正常系: 行き所のない駒の制約
  test('SENTE_PAWN_LANCE_MIN_ROW は 0 である（境界値）', () => {
    // Given: 先手の歩・香の最小行
    // When: 値を確認する
    // Then: 0 が返る
    expect(BOARD_CONFIG.SENTE_PAWN_LANCE_MIN_ROW).toBe(0);
  });

  test('SENTE_KNIGHT_MIN_ROW は 1 である（境界値）', () => {
    // Given: 先手の桂の最小行
    // When: 値を確認する
    // Then: 1 が返る
    expect(BOARD_CONFIG.SENTE_KNIGHT_MIN_ROW).toBe(1);
  });

  test('GOTE_PAWN_LANCE_MAX_ROW は 8 である（境界値）', () => {
    // Given: 後手の歩・香の最大行
    // When: 値を確認する
    // Then: 8 が返る
    expect(BOARD_CONFIG.GOTE_PAWN_LANCE_MAX_ROW).toBe(8);
  });

  test('GOTE_KNIGHT_MAX_ROW は 7 である（境界値）', () => {
    // Given: 後手の桂の最大行
    // When: 値を確認する
    // Then: 7 が返る
    expect(BOARD_CONFIG.GOTE_KNIGHT_MAX_ROW).toBe(7);
  });

  test('GOTE_PAWN_LANCE_MAX_ROW は MAX_INDEX と等しい（境界値の整合性）', () => {
    // Given: 後手歩・香の最大行と盤面の最大インデックス
    // When: 両者を比較する
    // Then: 等しい
    expect(BOARD_CONFIG.GOTE_PAWN_LANCE_MAX_ROW).toBe(BOARD_CONFIG.MAX_INDEX);
  });

  test('SENTE_PAWN_LANCE_MIN_ROW は MIN_INDEX と等しい（境界値の整合性）', () => {
    // Given: 先手歩・香の最小行と盤面の最小インデックス
    // When: 両者を比較する
    // Then: 等しい
    expect(BOARD_CONFIG.SENTE_PAWN_LANCE_MIN_ROW).toBe(BOARD_CONFIG.MIN_INDEX);
  });
});

// ============================================================
// DOM_SELECTORS テスト
// ============================================================

describe('DOM_SELECTORS', () => {
  // 正常系: 全キーが文字列
  test('全てのセレクタが string 型である', () => {
    // Given: DOM_SELECTORS オブジェクト
    // When: 全プロパティの型を確認する
    // Then: 全て string 型
    Object.values(DOM_SELECTORS).forEach(value => {
      expect(typeof value).toBe('string');
    });
  });

  test('BOARD は "board" である', () => {
    // Given: ボードのID定義
    // When: 値を確認する
    // Then: 'board' が返る
    expect(DOM_SELECTORS.BOARD).toBe('board');
  });

  test('STATUS は "status" である', () => {
    // Given: ステータスのID定義
    // When: 値を確認する
    // Then: 'status' が返る
    expect(DOM_SELECTORS.STATUS).toBe('status');
  });

  test('HAND_PIECES は CSSクラスセレクタ形式（.で始まる）', () => {
    // Given: 持ち駒エリアのCSSセレクタ
    // When: 先頭文字を確認する
    // Then: '.' で始まる
    expect(DOM_SELECTORS.HAND_PIECES.startsWith('.')).toBe(true);
  });

  test('HAND_PIECE は CSSクラスセレクタ形式（.で始まる）', () => {
    // Given: 持ち駒要素のCSSセレクタ
    // When: 先頭文字を確認する
    // Then: '.' で始まる
    expect(DOM_SELECTORS.HAND_PIECE.startsWith('.')).toBe(true);
  });

  // 異常系: 存在すべきキーの確認
  test('必須キーが全て存在する', () => {
    // Given: DOM_SELECTORS に必要なキーの一覧
    // When: 各キーの存在を確認する
    // Then: 全キーが存在する
    const requiredKeys = [
      'BOARD', 'STATUS', 'NEW_GAME_BTN', 'GAMEOVER_NEW_GAME',
      'GAMEOVER_DIALOG', 'GAMEOVER_MESSAGE', 'PROMOTION_DIALOG',
      'PROMOTE_YES', 'PROMOTE_NO', 'HAND_PIECES', 'HAND_PIECE',
    ];
    requiredKeys.forEach(key => {
      expect(DOM_SELECTORS).toHaveProperty(key);
    });
  });

  test('空文字列のセレクタが存在しない', () => {
    // Given: DOM_SELECTORS オブジェクト
    // When: 空文字列のプロパティを探す
    // Then: 空文字列は存在しない
    Object.values(DOM_SELECTORS).forEach(value => {
      expect(value).not.toBe('');
    });
  });
});

// ============================================================
// UI_TEXT テスト
// ============================================================

describe('UI_TEXT', () => {
  test('SENTE_NAME は "先手" である', () => {
    // Given: 先手の名前定義
    // When: 値を確認する
    // Then: '先手' が返る
    expect(UI_TEXT.SENTE_NAME).toBe('先手');
  });

  test('GOTE_NAME は "後手" である', () => {
    // Given: 後手の名前定義
    // When: 値を確認する
    // Then: '後手' が返る
    expect(UI_TEXT.GOTE_NAME).toBe('後手');
  });

  test('WIN_SUFFIX は "の勝ち！" である', () => {
    // Given: 勝利メッセージ接尾辞定義
    // When: 値を確認する
    // Then: 'の勝ち！' が返る
    expect(UI_TEXT.WIN_SUFFIX).toBe('の勝ち！');
  });

  test('TURN_SUFFIX は "の番です" である', () => {
    // Given: ターン表示接尾辞定義
    // When: 値を確認する
    // Then: 'の番です' が返る
    expect(UI_TEXT.TURN_SUFFIX).toBe('の番です');
  });

  test('CHECK_SUFFIX は "王手" を含む', () => {
    // Given: 王手表示接尾辞定義
    // When: 文字列に "王手" が含まれるか確認する
    // Then: 含まれる
    expect(UI_TEXT.CHECK_SUFFIX).toContain('王手');
  });

  test('全ての UI_TEXT 値が string 型である', () => {
    // Given: UI_TEXT オブジェクト
    // When: 全プロパティの型を確認する
    // Then: 全て string 型
    Object.values(UI_TEXT).forEach(value => {
      expect(typeof value).toBe('string');
    });
  });

  test('SENTE_NAME と GOTE_NAME は異なる文字列である', () => {
    // Given: 先手・後手の名前定義
    // When: 両者を比較する
    // Then: 異なる文字列
    expect(UI_TEXT.SENTE_NAME).not.toBe(UI_TEXT.GOTE_NAME);
  });

  test('必須キーが全て存在する', () => {
    // Given: UI_TEXT に必要なキーの一覧
    // When: 各キーの存在を確認する
    // Then: 全キーが存在する
    const requiredKeys = [
      'SENTE_NAME', 'GOTE_NAME', 'TURN_SUFFIX', 'CHECK_SUFFIX', 'WIN_SUFFIX',
    ];
    requiredKeys.forEach(key => {
      expect(UI_TEXT).toHaveProperty(key);
    });
  });
});

// ============================================================
// SOUND_CONFIG テスト
// ============================================================

describe('SOUND_CONFIG', () => {
  // 正常系: MOVE
  test('SOUND_CONFIG.MOVE の全パラメータが number 型である', () => {
    // Given: MOVE の音声パラメータ
    // When: 全プロパティの型を確認する
    // Then: 全て number 型
    Object.values(SOUND_CONFIG.MOVE).forEach(value => {
      expect(typeof value).toBe('number');
    });
  });

  test('SOUND_CONFIG.MOVE の必須キーが存在する', () => {
    // Given: MOVE に必要なキーの一覧
    // When: 各キーの存在を確認する
    // Then: 全キーが存在する
    const requiredKeys = [
      'noiseDuration', 'filterFreq', 'filterQ',
      'noiseGain', 'noiseDecay', 'oscFreqStart',
      'oscFreqEnd', 'oscDuration', 'oscGain',
    ];
    requiredKeys.forEach(key => {
      expect(SOUND_CONFIG.MOVE).toHaveProperty(key);
    });
  });

  test('SOUND_CONFIG.MOVE の値が正の数である', () => {
    // Given: MOVE の音声パラメータ
    // When: 全プロパティが正の値か確認する
    // Then: 全て 0 より大きい
    Object.values(SOUND_CONFIG.MOVE).forEach(value => {
      expect(value).toBeGreaterThan(0);
    });
  });

  // 正常系: CAPTURE
  test('SOUND_CONFIG.CAPTURE の全パラメータが number 型である', () => {
    // Given: CAPTURE の音声パラメータ
    // When: 全プロパティの型を確認する
    // Then: 全て number 型
    Object.values(SOUND_CONFIG.CAPTURE).forEach(value => {
      expect(typeof value).toBe('number');
    });
  });

  test('SOUND_CONFIG.CAPTURE の必須キーが存在する（highFreq系含む）', () => {
    // Given: CAPTURE に必要なキーの一覧
    // When: 各キーの存在を確認する
    // Then: 全キーが存在する
    const requiredKeys = [
      'noiseDuration', 'filterFreq', 'filterQ',
      'noiseGain', 'noiseDecay', 'oscFreqStart',
      'oscFreqEnd', 'oscDuration', 'oscGain',
      'highFreqStart', 'highFreqEnd', 'highDuration', 'highGain',
    ];
    requiredKeys.forEach(key => {
      expect(SOUND_CONFIG.CAPTURE).toHaveProperty(key);
    });
  });

  test('SOUND_CONFIG.CAPTURE は MOVE より noiseGain が大きい（より強い音）', () => {
    // Given: MOVE と CAPTURE の noiseGain
    // When: 両者を比較する
    // Then: CAPTURE の方が大きい
    expect(SOUND_CONFIG.CAPTURE.noiseGain).toBeGreaterThan(SOUND_CONFIG.MOVE.noiseGain);
  });

  // 正常系: CHECK
  test('SOUND_CONFIG.CHECK の全パラメータが number 型である', () => {
    // Given: CHECK の音声パラメータ
    // When: 全プロパティの型を確認する
    // Then: 全て number 型
    Object.values(SOUND_CONFIG.CHECK).forEach(value => {
      expect(typeof value).toBe('number');
    });
  });

  test('SOUND_CONFIG.CHECK.count は整数の 2 である', () => {
    // Given: CHECK の警告音回数定義
    // When: 値を確認する
    // Then: 2 が返る
    expect(SOUND_CONFIG.CHECK.count).toBe(2);
    expect(Number.isInteger(SOUND_CONFIG.CHECK.count)).toBe(true);
  });

  test('SOUND_CONFIG.CHECK の必須キーが存在する', () => {
    // Given: CHECK に必要なキーの一覧
    // When: 各キーの存在を確認する
    // Then: 全キーが存在する
    const requiredKeys = ['freq', 'interval', 'gain', 'count', 'attackTime', 'releaseTime'];
    requiredKeys.forEach(key => {
      expect(SOUND_CONFIG.CHECK).toHaveProperty(key);
    });
  });

  // 正常系: CHECKMATE
  test('SOUND_CONFIG.CHECKMATE.notes は Array である', () => {
    // Given: CHECKMATE の音符配列
    // When: 型を確認する
    // Then: Array が返る
    expect(Array.isArray(SOUND_CONFIG.CHECKMATE.notes)).toBe(true);
  });

  test('SOUND_CONFIG.CHECKMATE.notes は 4 音である', () => {
    // Given: CHECKMATE の音符配列
    // When: 配列の長さを確認する
    // Then: 4 が返る
    expect(SOUND_CONFIG.CHECKMATE.notes).toHaveLength(4);
  });

  test('SOUND_CONFIG.CHECKMATE.notes の全要素が正の数値である', () => {
    // Given: CHECKMATE の音符周波数配列
    // When: 各要素の型と値を確認する
    // Then: 全て正の number 型
    SOUND_CONFIG.CHECKMATE.notes.forEach(freq => {
      expect(typeof freq).toBe('number');
      expect(freq).toBeGreaterThan(0);
    });
  });

  test('SOUND_CONFIG.CHECKMATE の数値パラメータが number 型である', () => {
    // Given: CHECKMATE の interval, gain, attackTime, releaseTime
    // When: 型を確認する
    // Then: 全て number 型
    const numericKeys = ['interval', 'gain', 'attackTime', 'releaseTime'];
    numericKeys.forEach(key => {
      expect(typeof SOUND_CONFIG.CHECKMATE[key]).toBe('number');
    });
  });

  test('SOUND_CONFIG.CHECKMATE の必須キーが存在する', () => {
    // Given: CHECKMATE に必要なキーの一覧
    // When: 各キーの存在を確認する
    // Then: 全キーが存在する
    const requiredKeys = ['notes', 'interval', 'gain', 'attackTime', 'releaseTime'];
    requiredKeys.forEach(key => {
      expect(SOUND_CONFIG.CHECKMATE).toHaveProperty(key);
    });
  });

  // 異常系: SOUND_CONFIG 全体の構造
  test('SOUND_CONFIG は MOVE, CAPTURE, CHECK, CHECKMATE の 4 セクションを持つ', () => {
    // Given: SOUND_CONFIG オブジェクト
    // When: トップレベルのキーを確認する
    // Then: 4 セクションが存在する
    const requiredSections = ['MOVE', 'CAPTURE', 'CHECK', 'CHECKMATE'];
    requiredSections.forEach(section => {
      expect(SOUND_CONFIG).toHaveProperty(section);
    });
  });
});
