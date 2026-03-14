/**
 * js/pieces.js のテスト
 *
 * テスト観点の表（等価分割・境界値）
 *
 * | #  | 観点                                   | 分類   | 入力値/条件                        | 期待結果                          |
 * |----|----------------------------------------|--------|------------------------------------|-----------------------------------|
 * |  1 | isPromoted: 成り飛車                   | 正常系 | 'prook'                            | true                              |
 * |  2 | isPromoted: 成り角                     | 正常系 | 'pbishop'                          | true                              |
 * |  3 | isPromoted: 成り銀                     | 正常系 | 'psilver'                          | true                              |
 * |  4 | isPromoted: 成り桂                     | 正常系 | 'pknight'                          | true                              |
 * |  5 | isPromoted: 成り香                     | 正常系 | 'plance'                           | true                              |
 * |  6 | isPromoted: と金                       | 正常系 | 'ppawn'                            | true                              |
 * |  7 | isPromoted: 王将                       | 異常系 | 'king'                             | false                             |
 * |  8 | isPromoted: 飛車                       | 異常系 | 'rook'                             | false                             |
 * |  9 | isPromoted: 角行                       | 異常系 | 'bishop'                           | false                             |
 * | 10 | isPromoted: 金将                       | 異常系 | 'gold'                             | false                             |
 * | 11 | isPromoted: 銀将                       | 異常系 | 'silver'                           | false                             |
 * | 12 | isPromoted: 桂馬                       | 異常系 | 'knight'                           | false                             |
 * | 13 | isPromoted: 香車                       | 異常系 | 'lance'                            | false                             |
 * | 14 | isPromoted: 歩兵                       | 異常系 | 'pawn'                             | false                             |
 * | 15 | isPromoted: 未定義型                   | 境界値 | 'unknown'                          | false                             |
 * | 16 | isPromoted: 空文字列                   | 境界値 | ''                                 | false                             |
 * | 17 | isPromoted: undefined                  | 境界値 | undefined                          | false                             |
 * | 18 | canPromote: 飛車                       | 正常系 | 'rook'                             | true                              |
 * | 19 | canPromote: 角行                       | 正常系 | 'bishop'                           | true                              |
 * | 20 | canPromote: 銀将                       | 正常系 | 'silver'                           | true                              |
 * | 21 | canPromote: 桂馬                       | 正常系 | 'knight'                           | true                              |
 * | 22 | canPromote: 香車                       | 正常系 | 'lance'                            | true                              |
 * | 23 | canPromote: 歩兵                       | 正常系 | 'pawn'                             | true                              |
 * | 24 | canPromote: 王将                       | 異常系 | 'king'                             | false                             |
 * | 25 | canPromote: 金将                       | 異常系 | 'gold'                             | false                             |
 * | 26 | canPromote: 成り飛車                   | 異常系 | 'prook'                            | false                             |
 * | 27 | canPromote: 成り角                     | 異常系 | 'pbishop'                          | false                             |
 * | 28 | canPromote: 成り銀                     | 異常系 | 'psilver'                          | false                             |
 * | 29 | canPromote: 成り桂                     | 異常系 | 'pknight'                          | false                             |
 * | 30 | canPromote: 成り香                     | 異常系 | 'plance'                           | false                             |
 * | 31 | canPromote: と金                       | 異常系 | 'ppawn'                            | false                             |
 * | 32 | canPromote: 未定義型                   | 境界値 | 'unknown'                          | false                             |
 * | 33 | unpromote: 成り飛車→飛車              | 正常系 | 'prook'                            | 'rook'                            |
 * | 34 | unpromote: 成り角→角行                | 正常系 | 'pbishop'                          | 'bishop'                          |
 * | 35 | unpromote: 成り銀→銀将               | 正常系 | 'psilver'                          | 'silver'                          |
 * | 36 | unpromote: 成り桂→桂馬               | 正常系 | 'pknight'                          | 'knight'                          |
 * | 37 | unpromote: 成り香→香車               | 正常系 | 'plance'                           | 'lance'                           |
 * | 38 | unpromote: と金→歩兵                 | 正常系 | 'ppawn'                            | 'pawn'                            |
 * | 39 | unpromote: 飛車（非成り）→そのまま   | 異常系 | 'rook'                             | 'rook'                            |
 * | 40 | unpromote: 王将→そのまま             | 異常系 | 'king'                             | 'king'                            |
 * | 41 | unpromote: 金将→そのまま             | 異常系 | 'gold'                             | 'gold'                            |
 * | 42 | unpromote: 未定義型→そのまま         | 境界値 | 'unknown'                          | 'unknown'                         |
 * | 43 | getKanji: 王将・先手                   | 正常系 | 'king', 'sente'                    | '王'                              |
 * | 44 | getKanji: 王将・後手                   | 正常系 | 'king', 'gote'                     | '玉'                              |
 * | 45 | getKanji: 飛車                         | 正常系 | 'rook', any                        | '飛'                              |
 * | 46 | getKanji: 角行                         | 正常系 | 'bishop', any                      | '角'                              |
 * | 47 | getKanji: 金将                         | 正常系 | 'gold', any                        | '金'                              |
 * | 48 | getKanji: 銀将                         | 正常系 | 'silver', any                      | '銀'                              |
 * | 49 | getKanji: 桂馬                         | 正常系 | 'knight', any                      | '桂'                              |
 * | 50 | getKanji: 香車                         | 正常系 | 'lance', any                       | '香'                              |
 * | 51 | getKanji: 歩兵                         | 正常系 | 'pawn', any                        | '歩'                              |
 * | 52 | getKanji: 龍王（成り飛車）             | 正常系 | 'prook', any                       | '龍'                              |
 * | 53 | getKanji: 龍馬（成り角）               | 正常系 | 'pbishop', any                     | '馬'                              |
 * | 54 | getKanji: 成銀                         | 正常系 | 'psilver', any                     | '全'                              |
 * | 55 | getKanji: 成桂                         | 正常系 | 'pknight', any                     | '圭'                              |
 * | 56 | getKanji: 成香                         | 正常系 | 'plance', any                      | '杏'                              |
 * | 57 | getKanji: と金                         | 正常系 | 'ppawn', any                       | 'と'                              |
 * | 58 | getKanji: 未定義型                     | 境界値 | 'unknown', any                     | undefined                         |
 * | 59 | getMovePattern: 王将・先手             | 正常系 | 'king', 'sente'                    | steps 8方向, slides=[]            |
 * | 60 | getMovePattern: 飛車・先手             | 正常系 | 'rook', 'sente'                    | steps=[], slides 4方向            |
 * | 61 | getMovePattern: 角行・先手             | 正常系 | 'bishop', 'sente'                  | steps=[], slides 4斜方向          |
 * | 62 | getMovePattern: 金将・先手             | 正常系 | 'gold', 'sente'                    | steps 6方向, slides=[]            |
 * | 63 | getMovePattern: 銀将・先手             | 正常系 | 'silver', 'sente'                  | steps 5方向, slides=[]            |
 * | 64 | getMovePattern: 桂馬・先手             | 正常系 | 'knight', 'sente'                  | steps=[-2,-1],[-2,1]              |
 * | 65 | getMovePattern: 香車・先手             | 正常系 | 'lance', 'sente'                   | steps=[], slides=[[-1,0]]         |
 * | 66 | getMovePattern: 歩兵・先手             | 正常系 | 'pawn', 'sente'                    | steps=[[-1,0]], slides=[]         |
 * | 67 | getMovePattern: 龍王・先手             | 正常系 | 'prook', 'sente'                   | steps 4斜, slides 4直             |
 * | 68 | getMovePattern: 龍馬・先手             | 正常系 | 'pbishop', 'sente'                 | steps 4直, slides 4斜             |
 * | 69 | getMovePattern: 成銀・先手             | 正常系 | 'psilver', 'sente'                 | 金と同じ6方向                     |
 * | 70 | getMovePattern: 成桂・先手             | 正常系 | 'pknight', 'sente'                 | 金と同じ6方向                     |
 * | 71 | getMovePattern: 成香・先手             | 正常系 | 'plance', 'sente'                  | 金と同じ6方向                     |
 * | 72 | getMovePattern: と金・先手             | 正常系 | 'ppawn', 'sente'                   | 金と同じ6方向                     |
 * | 73 | getMovePattern: 歩兵・後手（反転）     | 正常系 | 'pawn', 'gote'                     | steps=[[1,0]]                     |
 * | 74 | getMovePattern: 桂馬・後手（反転）     | 正常系 | 'knight', 'gote'                   | steps=[2,1],[2,-1]                |
 * | 75 | getMovePattern: 香車・後手（反転）     | 正常系 | 'lance', 'gote'                    | slides=[[1,0]]                    |
 * | 76 | getMovePattern: 飛車・後手（反転）     | 正常系 | 'rook', 'gote'                     | slides 4方向（符号反転）          |
 * | 77 | getMovePattern: 未定義型               | 境界値 | 'unknown', 'sente'                 | {steps:[], slides:[]}             |
 * | 78 | HAND_PIECE_TYPES: 7種                  | 正常系 | 配列の長さ                         | 7                                 |
 * | 79 | HAND_PIECE_TYPES: 王を含まない         | 異常系 | 'king' が含まれないか              | true                              |
 * | 80 | HAND_PIECE_TYPES: 成り駒を含まない     | 異常系 | 成り駒が含まれないか               | true                              |
 * | 81 | HAND_PIECE_TYPES: 必須7駒を含む        | 正常系 | 各駒種の存在確認                   | 全て存在する                      |
 * | 82 | PROMOTION_MAP: エントリ数6             | 正常系 | Object.keys の長さ                 | 6                                 |
 * | 83 | PROMOTION_MAP: 全マッピング正確        | 正常系 | 各エントリの値                     | 対応する成り駒型                  |
 * | 84 | UNPROMOTION_MAP: エントリ数6           | 正常系 | Object.keys の長さ                 | 6                                 |
 * | 85 | UNPROMOTION_MAP: 全マッピング正確      | 正常系 | 各エントリの値                     | 対応する元の駒型                  |
 * | 86 | PROMOTION_MAP と UNPROMOTION_MAP の逆写像 | 異常系 | 往復変換が元に戻るか            | 全て一致                          |
 */

import { describe, it, expect } from '@jest/globals';
import {
  PieceType,
  Player,
  PIECE_KANJI,
  PROMOTION_MAP,
  UNPROMOTION_MAP,
  HAND_PIECE_TYPES,
  isPromoted,
  canPromote,
  unpromote,
  getKanji,
  getMovePattern,
} from '../js/pieces.js';

// ============================================================
// isPromoted() テスト
// ============================================================

describe('isPromoted() - 成り駒判定', () => {
  // --- 正常系: 成り駒6種 → true ---

  it('成り飛車 (prook) は成り駒である', () => {
    // Given: 成り飛車の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: true が返る
    expect(isPromoted(PieceType.PROMOTED_ROOK)).toBe(true);
  });

  it('成り角 (pbishop) は成り駒である', () => {
    // Given: 成り角の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: true が返る
    expect(isPromoted(PieceType.PROMOTED_BISHOP)).toBe(true);
  });

  it('成銀 (psilver) は成り駒である', () => {
    // Given: 成銀の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: true が返る
    expect(isPromoted(PieceType.PROMOTED_SILVER)).toBe(true);
  });

  it('成桂 (pknight) は成り駒である', () => {
    // Given: 成桂の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: true が返る
    expect(isPromoted(PieceType.PROMOTED_KNIGHT)).toBe(true);
  });

  it('成香 (plance) は成り駒である', () => {
    // Given: 成香の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: true が返る
    expect(isPromoted(PieceType.PROMOTED_LANCE)).toBe(true);
  });

  it('と金 (ppawn) は成り駒である', () => {
    // Given: と金の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: true が返る
    expect(isPromoted(PieceType.PROMOTED_PAWN)).toBe(true);
  });

  // --- 異常系: 非成り駒8種 → false ---

  it('王将 (king) は成り駒でない', () => {
    // Given: 王将の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted(PieceType.KING)).toBe(false);
  });

  it('飛車 (rook) は成り駒でない', () => {
    // Given: 飛車の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted(PieceType.ROOK)).toBe(false);
  });

  it('角行 (bishop) は成り駒でない', () => {
    // Given: 角行の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted(PieceType.BISHOP)).toBe(false);
  });

  it('金将 (gold) は成り駒でない', () => {
    // Given: 金将の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted(PieceType.GOLD)).toBe(false);
  });

  it('銀将 (silver) は成り駒でない', () => {
    // Given: 銀将の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted(PieceType.SILVER)).toBe(false);
  });

  it('桂馬 (knight) は成り駒でない', () => {
    // Given: 桂馬の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted(PieceType.KNIGHT)).toBe(false);
  });

  it('香車 (lance) は成り駒でない', () => {
    // Given: 香車の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted(PieceType.LANCE)).toBe(false);
  });

  it('歩兵 (pawn) は成り駒でない', () => {
    // Given: 歩兵の駒タイプ
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted(PieceType.PAWN)).toBe(false);
  });

  // --- 境界値: 未定義・空・undefined → false ---

  it('存在しない駒タイプ文字列は成り駒でない（境界値）', () => {
    // Given: 存在しない駒タイプ 'unknown'
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted('unknown')).toBe(false);
  });

  it('空文字列は成り駒でない（境界値）', () => {
    // Given: 空文字列
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted('')).toBe(false);
  });

  it('undefined は成り駒でない（境界値）', () => {
    // Given: undefined
    // When: isPromoted を呼ぶ
    // Then: false が返る
    expect(isPromoted(undefined)).toBe(false);
  });
});

// ============================================================
// canPromote() テスト
// ============================================================

describe('canPromote() - 成れる駒の判定', () => {
  // --- 正常系: 成れる駒6種 → true ---

  it('飛車 (rook) は成れる', () => {
    // Given: 飛車の駒タイプ
    // When: canPromote を呼ぶ
    // Then: true が返る
    expect(canPromote(PieceType.ROOK)).toBe(true);
  });

  it('角行 (bishop) は成れる', () => {
    // Given: 角行の駒タイプ
    // When: canPromote を呼ぶ
    // Then: true が返る
    expect(canPromote(PieceType.BISHOP)).toBe(true);
  });

  it('銀将 (silver) は成れる', () => {
    // Given: 銀将の駒タイプ
    // When: canPromote を呼ぶ
    // Then: true が返る
    expect(canPromote(PieceType.SILVER)).toBe(true);
  });

  it('桂馬 (knight) は成れる', () => {
    // Given: 桂馬の駒タイプ
    // When: canPromote を呼ぶ
    // Then: true が返る
    expect(canPromote(PieceType.KNIGHT)).toBe(true);
  });

  it('香車 (lance) は成れる', () => {
    // Given: 香車の駒タイプ
    // When: canPromote を呼ぶ
    // Then: true が返る
    expect(canPromote(PieceType.LANCE)).toBe(true);
  });

  it('歩兵 (pawn) は成れる', () => {
    // Given: 歩兵の駒タイプ
    // When: canPromote を呼ぶ
    // Then: true が返る
    expect(canPromote(PieceType.PAWN)).toBe(true);
  });

  // --- 異常系: 成れない駒 → false ---

  it('王将 (king) は成れない', () => {
    // Given: 王将の駒タイプ
    // When: canPromote を呼ぶ
    // Then: false が返る
    expect(canPromote(PieceType.KING)).toBe(false);
  });

  it('金将 (gold) は成れない', () => {
    // Given: 金将の駒タイプ
    // When: canPromote を呼ぶ
    // Then: false が返る
    expect(canPromote(PieceType.GOLD)).toBe(false);
  });

  it('成り飛車 (prook) は既に成り駒のため成れない', () => {
    // Given: 成り飛車の駒タイプ
    // When: canPromote を呼ぶ
    // Then: false が返る
    expect(canPromote(PieceType.PROMOTED_ROOK)).toBe(false);
  });

  it('成り角 (pbishop) は既に成り駒のため成れない', () => {
    // Given: 成り角の駒タイプ
    // When: canPromote を呼ぶ
    // Then: false が返る
    expect(canPromote(PieceType.PROMOTED_BISHOP)).toBe(false);
  });

  it('成銀 (psilver) は既に成り駒のため成れない', () => {
    // Given: 成銀の駒タイプ
    // When: canPromote を呼ぶ
    // Then: false が返る
    expect(canPromote(PieceType.PROMOTED_SILVER)).toBe(false);
  });

  it('成桂 (pknight) は既に成り駒のため成れない', () => {
    // Given: 成桂の駒タイプ
    // When: canPromote を呼ぶ
    // Then: false が返る
    expect(canPromote(PieceType.PROMOTED_KNIGHT)).toBe(false);
  });

  it('成香 (plance) は既に成り駒のため成れない', () => {
    // Given: 成香の駒タイプ
    // When: canPromote を呼ぶ
    // Then: false が返る
    expect(canPromote(PieceType.PROMOTED_LANCE)).toBe(false);
  });

  it('と金 (ppawn) は既に成り駒のため成れない', () => {
    // Given: と金の駒タイプ
    // When: canPromote を呼ぶ
    // Then: false が返る
    expect(canPromote(PieceType.PROMOTED_PAWN)).toBe(false);
  });

  // --- 境界値 ---

  it('存在しない駒タイプは成れない（境界値）', () => {
    // Given: 存在しない駒タイプ 'unknown'
    // When: canPromote を呼ぶ
    // Then: false が返る
    expect(canPromote('unknown')).toBe(false);
  });
});

// ============================================================
// unpromote() テスト
// ============================================================

describe('unpromote() - 成り駒を元の駒に戻す', () => {
  // --- 正常系: 成り駒6種 → 元の駒 ---

  it('成り飛車 (prook) → 飛車 (rook)', () => {
    // Given: 成り飛車の駒タイプ
    // When: unpromote を呼ぶ
    // Then: 'rook' が返る
    expect(unpromote(PieceType.PROMOTED_ROOK)).toBe(PieceType.ROOK);
  });

  it('成り角 (pbishop) → 角行 (bishop)', () => {
    // Given: 成り角の駒タイプ
    // When: unpromote を呼ぶ
    // Then: 'bishop' が返る
    expect(unpromote(PieceType.PROMOTED_BISHOP)).toBe(PieceType.BISHOP);
  });

  it('成銀 (psilver) → 銀将 (silver)', () => {
    // Given: 成銀の駒タイプ
    // When: unpromote を呼ぶ
    // Then: 'silver' が返る
    expect(unpromote(PieceType.PROMOTED_SILVER)).toBe(PieceType.SILVER);
  });

  it('成桂 (pknight) → 桂馬 (knight)', () => {
    // Given: 成桂の駒タイプ
    // When: unpromote を呼ぶ
    // Then: 'knight' が返る
    expect(unpromote(PieceType.PROMOTED_KNIGHT)).toBe(PieceType.KNIGHT);
  });

  it('成香 (plance) → 香車 (lance)', () => {
    // Given: 成香の駒タイプ
    // When: unpromote を呼ぶ
    // Then: 'lance' が返る
    expect(unpromote(PieceType.PROMOTED_LANCE)).toBe(PieceType.LANCE);
  });

  it('と金 (ppawn) → 歩兵 (pawn)', () => {
    // Given: と金の駒タイプ
    // When: unpromote を呼ぶ
    // Then: 'pawn' が返る
    expect(unpromote(PieceType.PROMOTED_PAWN)).toBe(PieceType.PAWN);
  });

  // --- 異常系: 非成り駒はそのまま返る ---

  it('飛車 (rook) は非成り駒なのでそのまま返る', () => {
    // Given: 飛車の駒タイプ（非成り駒）
    // When: unpromote を呼ぶ
    // Then: 'rook' がそのまま返る
    expect(unpromote(PieceType.ROOK)).toBe(PieceType.ROOK);
  });

  it('王将 (king) は非成り駒なのでそのまま返る', () => {
    // Given: 王将の駒タイプ（非成り駒）
    // When: unpromote を呼ぶ
    // Then: 'king' がそのまま返る
    expect(unpromote(PieceType.KING)).toBe(PieceType.KING);
  });

  it('金将 (gold) は非成り駒なのでそのまま返る', () => {
    // Given: 金将の駒タイプ（非成り駒）
    // When: unpromote を呼ぶ
    // Then: 'gold' がそのまま返る
    expect(unpromote(PieceType.GOLD)).toBe(PieceType.GOLD);
  });

  it('銀将 (silver) は非成り駒なのでそのまま返る', () => {
    // Given: 銀将の駒タイプ（非成り駒）
    // When: unpromote を呼ぶ
    // Then: 'silver' がそのまま返る
    expect(unpromote(PieceType.SILVER)).toBe(PieceType.SILVER);
  });

  // --- 境界値 ---

  it('存在しない駒タイプはそのまま返る（境界値）', () => {
    // Given: 存在しない駒タイプ 'unknown'
    // When: unpromote を呼ぶ
    // Then: 'unknown' がそのまま返る
    expect(unpromote('unknown')).toBe('unknown');
  });

  it('空文字列はそのまま返る（境界値）', () => {
    // Given: 空文字列
    // When: unpromote を呼ぶ
    // Then: '' がそのまま返る
    // 注: '' は falsy なので || 演算子により '' 自身が返る
    expect(unpromote('')).toBe('');
  });
});

// ============================================================
// getKanji() テスト
// ============================================================

describe('getKanji() - 漢字表示の取得', () => {
  // --- 正常系: 王将（プレイヤー依存） ---

  it('王将・先手は "王" を返す', () => {
    // Given: 王将の駒タイプ、プレイヤーは先手
    // When: getKanji を呼ぶ
    // Then: '王' が返る
    expect(getKanji(PieceType.KING, Player.SENTE)).toBe('王');
  });

  it('王将・後手は "玉" を返す', () => {
    // Given: 王将の駒タイプ、プレイヤーは後手
    // When: getKanji を呼ぶ
    // Then: '玉' が返る
    expect(getKanji(PieceType.KING, Player.GOTE)).toBe('玉');
  });

  // --- 正常系: 通常駒（プレイヤー非依存） ---

  it('飛車 (rook) は "飛" を返す', () => {
    // Given: 飛車の駒タイプ
    // When: getKanji を呼ぶ（プレイヤーはどちらでもよい）
    // Then: '飛' が返る
    expect(getKanji(PieceType.ROOK, Player.SENTE)).toBe('飛');
  });

  it('角行 (bishop) は "角" を返す', () => {
    // Given: 角行の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '角' が返る
    expect(getKanji(PieceType.BISHOP, Player.SENTE)).toBe('角');
  });

  it('金将 (gold) は "金" を返す', () => {
    // Given: 金将の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '金' が返る
    expect(getKanji(PieceType.GOLD, Player.SENTE)).toBe('金');
  });

  it('銀将 (silver) は "銀" を返す', () => {
    // Given: 銀将の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '銀' が返る
    expect(getKanji(PieceType.SILVER, Player.SENTE)).toBe('銀');
  });

  it('桂馬 (knight) は "桂" を返す', () => {
    // Given: 桂馬の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '桂' が返る
    expect(getKanji(PieceType.KNIGHT, Player.SENTE)).toBe('桂');
  });

  it('香車 (lance) は "香" を返す', () => {
    // Given: 香車の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '香' が返る
    expect(getKanji(PieceType.LANCE, Player.SENTE)).toBe('香');
  });

  it('歩兵 (pawn) は "歩" を返す', () => {
    // Given: 歩兵の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '歩' が返る
    expect(getKanji(PieceType.PAWN, Player.SENTE)).toBe('歩');
  });

  // --- 正常系: 成り駒 ---

  it('龍王 (prook) は "龍" を返す', () => {
    // Given: 成り飛車の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '龍' が返る
    expect(getKanji(PieceType.PROMOTED_ROOK, Player.SENTE)).toBe('龍');
  });

  it('龍馬 (pbishop) は "馬" を返す', () => {
    // Given: 成り角の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '馬' が返る
    expect(getKanji(PieceType.PROMOTED_BISHOP, Player.SENTE)).toBe('馬');
  });

  it('成銀 (psilver) は "全" を返す', () => {
    // Given: 成銀の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '全' が返る
    expect(getKanji(PieceType.PROMOTED_SILVER, Player.SENTE)).toBe('全');
  });

  it('成桂 (pknight) は "圭" を返す', () => {
    // Given: 成桂の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '圭' が返る
    expect(getKanji(PieceType.PROMOTED_KNIGHT, Player.SENTE)).toBe('圭');
  });

  it('成香 (plance) は "杏" を返す', () => {
    // Given: 成香の駒タイプ
    // When: getKanji を呼ぶ
    // Then: '杏' が返る
    expect(getKanji(PieceType.PROMOTED_LANCE, Player.SENTE)).toBe('杏');
  });

  it('と金 (ppawn) は "と" を返す', () => {
    // Given: と金の駒タイプ
    // When: getKanji を呼ぶ
    // Then: 'と' が返る
    expect(getKanji(PieceType.PROMOTED_PAWN, Player.SENTE)).toBe('と');
  });

  // --- 異常系: プレイヤーが異なっても文字列駒は同じ漢字を返す ---

  it('飛車は後手でも "飛" を返す（プレイヤー非依存）', () => {
    // Given: 飛車の駒タイプ、プレイヤーは後手
    // When: getKanji を呼ぶ
    // Then: '飛' が返る
    expect(getKanji(PieceType.ROOK, Player.GOTE)).toBe('飛');
  });

  // --- 境界値: 未定義の駒タイプ ---

  it('存在しない駒タイプは undefined を返す（境界値）', () => {
    // Given: 存在しない駒タイプ 'unknown'
    // When: getKanji を呼ぶ
    // Then: undefined が返る
    expect(getKanji('unknown', Player.SENTE)).toBeUndefined();
  });
});

// ============================================================
// getMovePattern() テスト
// ============================================================

describe('getMovePattern() - 移動パターンの取得', () => {
  // --- 先手の各駒パターン確認 ---

  it('王将・先手: steps 8方向、slides 空', () => {
    // Given: 王将の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: steps が 8 要素、slides が空
    const pattern = getMovePattern(PieceType.KING, Player.SENTE);
    expect(pattern.steps).toHaveLength(8);
    expect(pattern.slides).toHaveLength(0);
  });

  it('王将・先手: steps に全8方向が含まれる', () => {
    // Given: 王将の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: 上下左右と斜め4方向の合計8方向が含まれる
    const pattern = getMovePattern(PieceType.KING, Player.SENTE);
    const expectedDirs = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];
    expectedDirs.forEach(dir => {
      const found = pattern.steps.some(s => s[0] === dir[0] && s[1] === dir[1]);
      expect(found).toBe(true);
    });
  });

  it('飛車・先手: steps 空、slides 4方向（縦横）', () => {
    // Given: 飛車の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: steps が空、slides が 4 要素（上下左右）
    const pattern = getMovePattern(PieceType.ROOK, Player.SENTE);
    expect(pattern.steps).toHaveLength(0);
    expect(pattern.slides).toHaveLength(4);
    const expectedSlides = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    expectedSlides.forEach(dir => {
      const found = pattern.slides.some(s => s[0] === dir[0] && s[1] === dir[1]);
      expect(found).toBe(true);
    });
  });

  it('角行・先手: steps 空、slides 4方向（斜め）', () => {
    // Given: 角行の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: steps が空、slides が 4 要素（斜め4方向）
    const pattern = getMovePattern(PieceType.BISHOP, Player.SENTE);
    expect(pattern.steps).toHaveLength(0);
    expect(pattern.slides).toHaveLength(4);
    const expectedSlides = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    expectedSlides.forEach(dir => {
      const found = pattern.slides.some(s => s[0] === dir[0] && s[1] === dir[1]);
      expect(found).toBe(true);
    });
  });

  it('金将・先手: steps 6方向（上下左右・斜め前2方向）、slides 空', () => {
    // Given: 金将の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: steps が 6 要素（上・下・左・右・左前・右前）、slides が空
    const pattern = getMovePattern(PieceType.GOLD, Player.SENTE);
    expect(pattern.steps).toHaveLength(6);
    expect(pattern.slides).toHaveLength(0);
    // 先手の金は後ろ斜め（DL, DR）に動けない
    const hasDL = pattern.steps.some(s => s[0] === 1 && s[1] === -1);
    const hasDR = pattern.steps.some(s => s[0] === 1 && s[1] === 1);
    expect(hasDL).toBe(false);
    expect(hasDR).toBe(false);
  });

  it('銀将・先手: steps 5方向（前・斜め4方向）、slides 空', () => {
    // Given: 銀将の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: steps が 5 要素（上と斜め4方向）、slides が空
    const pattern = getMovePattern(PieceType.SILVER, Player.SENTE);
    expect(pattern.steps).toHaveLength(5);
    expect(pattern.slides).toHaveLength(0);
    // 先手の銀は真横（LEFT, RIGHT）と真後ろ（DOWN）に動けない
    const hasDown = pattern.steps.some(s => s[0] === 1 && s[1] === 0);
    const hasLeft = pattern.steps.some(s => s[0] === 0 && s[1] === -1);
    const hasRight = pattern.steps.some(s => s[0] === 0 && s[1] === 1);
    expect(hasDown).toBe(false);
    expect(hasLeft).toBe(false);
    expect(hasRight).toBe(false);
  });

  it('桂馬・先手: steps は [-2,-1], [-2,1] の2マス', () => {
    // Given: 桂馬の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: steps が 2 要素（飛び越し2マス先の左右）、slides が空
    const pattern = getMovePattern(PieceType.KNIGHT, Player.SENTE);
    expect(pattern.steps).toHaveLength(2);
    expect(pattern.slides).toHaveLength(0);
    const hasKnightL = pattern.steps.some(s => s[0] === -2 && s[1] === -1);
    const hasKnightR = pattern.steps.some(s => s[0] === -2 && s[1] === 1);
    expect(hasKnightL).toBe(true);
    expect(hasKnightR).toBe(true);
  });

  it('香車・先手: steps 空、slides は上方向 [[-1,0]] のみ', () => {
    // Given: 香車の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: steps が空、slides が 1 要素（上方向のみ）
    const pattern = getMovePattern(PieceType.LANCE, Player.SENTE);
    expect(pattern.steps).toHaveLength(0);
    expect(pattern.slides).toHaveLength(1);
    expect(pattern.slides[0]).toEqual([-1, 0]);
  });

  it('歩兵・先手: steps は上 [[-1,0]] のみ、slides 空', () => {
    // Given: 歩兵の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: steps が 1 要素（上方向）、slides が空
    const pattern = getMovePattern(PieceType.PAWN, Player.SENTE);
    expect(pattern.steps).toHaveLength(1);
    expect(pattern.slides).toHaveLength(0);
    expect(pattern.steps[0]).toEqual([-1, 0]);
  });

  it('龍王・先手: steps 4方向（斜め）、slides 4方向（縦横）', () => {
    // Given: 成り飛車の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: steps が 4 要素（斜め4方向）、slides が 4 要素（縦横4方向）
    const pattern = getMovePattern(PieceType.PROMOTED_ROOK, Player.SENTE);
    expect(pattern.steps).toHaveLength(4);
    expect(pattern.slides).toHaveLength(4);
    // steps は斜め4方向
    const expectedSteps = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    expectedSteps.forEach(dir => {
      const found = pattern.steps.some(s => s[0] === dir[0] && s[1] === dir[1]);
      expect(found).toBe(true);
    });
  });

  it('龍馬・先手: steps 4方向（縦横）、slides 4方向（斜め）', () => {
    // Given: 成り角の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: steps が 4 要素（縦横4方向）、slides が 4 要素（斜め4方向）
    const pattern = getMovePattern(PieceType.PROMOTED_BISHOP, Player.SENTE);
    expect(pattern.steps).toHaveLength(4);
    expect(pattern.slides).toHaveLength(4);
    // steps は縦横4方向
    const expectedSteps = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    expectedSteps.forEach(dir => {
      const found = pattern.steps.some(s => s[0] === dir[0] && s[1] === dir[1]);
      expect(found).toBe(true);
    });
  });

  it('成銀・先手: 金と同じ 6 方向の steps', () => {
    // Given: 成銀の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: 金将と同一パターン（steps 6, slides 0）
    const psilverPattern = getMovePattern(PieceType.PROMOTED_SILVER, Player.SENTE);
    const goldPattern = getMovePattern(PieceType.GOLD, Player.SENTE);
    expect(psilverPattern.steps).toHaveLength(goldPattern.steps.length);
    expect(psilverPattern.slides).toHaveLength(0);
  });

  it('成桂・先手: 金と同じ 6 方向の steps', () => {
    // Given: 成桂の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: 金将と同一パターン（steps 6, slides 0）
    const pknightPattern = getMovePattern(PieceType.PROMOTED_KNIGHT, Player.SENTE);
    const goldPattern = getMovePattern(PieceType.GOLD, Player.SENTE);
    expect(pknightPattern.steps).toHaveLength(goldPattern.steps.length);
    expect(pknightPattern.slides).toHaveLength(0);
  });

  it('成香・先手: 金と同じ 6 方向の steps', () => {
    // Given: 成香の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: 金将と同一パターン（steps 6, slides 0）
    const plancePattern = getMovePattern(PieceType.PROMOTED_LANCE, Player.SENTE);
    const goldPattern = getMovePattern(PieceType.GOLD, Player.SENTE);
    expect(plancePattern.steps).toHaveLength(goldPattern.steps.length);
    expect(plancePattern.slides).toHaveLength(0);
  });

  it('と金・先手: 金と同じ 6 方向の steps', () => {
    // Given: と金の駒タイプ、プレイヤーは先手
    // When: getMovePattern を呼ぶ
    // Then: 金将と同一パターン（steps 6, slides 0）
    const ppawnPattern = getMovePattern(PieceType.PROMOTED_PAWN, Player.SENTE);
    const goldPattern = getMovePattern(PieceType.GOLD, Player.SENTE);
    expect(ppawnPattern.steps).toHaveLength(goldPattern.steps.length);
    expect(ppawnPattern.slides).toHaveLength(0);
  });

  // --- 後手で方向が反転されているか ---

  it('歩兵・後手: steps は下方向のみ（先手と反転）', () => {
    // Given: 歩兵の駒タイプ、プレイヤーは後手
    // When: getMovePattern を呼ぶ
    // Then: steps の row が正値（下方向）、col が 0 方向であること
    // 注: JavaScript の -(0) = -0 のため、col は Math.abs で絶対値検証する
    const pattern = getMovePattern(PieceType.PAWN, Player.GOTE);
    expect(pattern.steps).toHaveLength(1);
    expect(pattern.steps[0][0]).toBe(1);
    expect(Math.abs(pattern.steps[0][1])).toBe(0);
  });

  it('桂馬・後手: steps は [2,-1], [2,1]（先手と反転）', () => {
    // Given: 桂馬の駒タイプ、プレイヤーは後手
    // When: getMovePattern を呼ぶ
    // Then: steps が [2,-1],[2,1]（先手の[-2,-1],[-2,1]を反転）
    const pattern = getMovePattern(PieceType.KNIGHT, Player.GOTE);
    expect(pattern.steps).toHaveLength(2);
    const hasKnightL = pattern.steps.some(s => s[0] === 2 && s[1] === -1);
    const hasKnightR = pattern.steps.some(s => s[0] === 2 && s[1] === 1);
    expect(hasKnightL).toBe(true);
    expect(hasKnightR).toBe(true);
  });

  it('香車・後手: slides は下方向のみ（先手と反転）', () => {
    // Given: 香車の駒タイプ、プレイヤーは後手
    // When: getMovePattern を呼ぶ
    // Then: slides の row が正値（下方向）、col が 0 方向であること
    // 注: JavaScript の -(0) = -0 のため、col は Math.abs で絶対値検証する
    const pattern = getMovePattern(PieceType.LANCE, Player.GOTE);
    expect(pattern.steps).toHaveLength(0);
    expect(pattern.slides).toHaveLength(1);
    expect(pattern.slides[0][0]).toBe(1);
    expect(Math.abs(pattern.slides[0][1])).toBe(0);
  });

  it('飛車・後手: slides は縦横4方向（符号反転されても同一集合）', () => {
    // Given: 飛車の駒タイプ、プレイヤーは後手
    // When: getMovePattern を呼ぶ
    // Then: slides が 4 要素（縦横方向 - 飛車は点対称のため先手と同じ集合）
    const pattern = getMovePattern(PieceType.ROOK, Player.GOTE);
    expect(pattern.steps).toHaveLength(0);
    expect(pattern.slides).toHaveLength(4);
  });

  it('銀将・後手: steps が 5 要素で先手と方向が反転', () => {
    // Given: 銀将の駒タイプ、プレイヤーは後手
    // When: getMovePattern を呼ぶ
    // Then: steps が 5 要素（後手視点の前方と斜め4方向）
    const pattern = getMovePattern(PieceType.SILVER, Player.GOTE);
    expect(pattern.steps).toHaveLength(5);
    expect(pattern.slides).toHaveLength(0);
    // 後手の銀は下方向（[1,0]）を持つ（先手の上方向の反転）
    const hasDown = pattern.steps.some(s => s[0] === 1 && s[1] === 0);
    expect(hasDown).toBe(true);
  });

  it('金将・後手: steps が 6 要素で先手と方向が反転', () => {
    // Given: 金将の駒タイプ、プレイヤーは後手
    // When: getMovePattern を呼ぶ
    // Then: steps が 6 要素（後手視点の前方5方向 + 後ろ）
    const pattern = getMovePattern(PieceType.GOLD, Player.GOTE);
    expect(pattern.steps).toHaveLength(6);
    expect(pattern.slides).toHaveLength(0);
    // 後手の金は下（[1,0]）を持つ（先手の上方向の反転）
    const hasDown = pattern.steps.some(s => s[0] === 1 && s[1] === 0);
    expect(hasDown).toBe(true);
  });

  // --- 境界値: 未定義型 ---

  it('存在しない駒タイプは {steps:[], slides:[]} を返す（境界値）', () => {
    // Given: 存在しない駒タイプ 'unknown'
    // When: getMovePattern を呼ぶ
    // Then: {steps:[], slides:[]} が返る
    const pattern = getMovePattern('unknown', Player.SENTE);
    expect(pattern).toEqual({ steps: [], slides: [] });
  });

  it('null の駒タイプは {steps:[], slides:[]} を返す（境界値）', () => {
    // Given: null の駒タイプ
    // When: getMovePattern を呼ぶ
    // Then: {steps:[], slides:[]} が返る
    const pattern = getMovePattern(null, Player.SENTE);
    expect(pattern).toEqual({ steps: [], slides: [] });
  });

  it('undefined の駒タイプは {steps:[], slides:[]} を返す（境界値）', () => {
    // Given: undefined の駒タイプ
    // When: getMovePattern を呼ぶ
    // Then: {steps:[], slides:[]} が返る
    const pattern = getMovePattern(undefined, Player.SENTE);
    expect(pattern).toEqual({ steps: [], slides: [] });
  });
});

// ============================================================
// HAND_PIECE_TYPES テスト
// ============================================================

describe('HAND_PIECE_TYPES - 持ち駒として打てる駒の種類', () => {
  it('HAND_PIECE_TYPES は 7 種類である', () => {
    // Given: 持ち駒として打てる駒の配列
    // When: 配列の長さを確認する
    // Then: 7 が返る
    expect(HAND_PIECE_TYPES).toHaveLength(7);
  });

  it('HAND_PIECE_TYPES に王将 (king) が含まれない', () => {
    // Given: 持ち駒として打てる駒の配列
    // When: 王将が含まれているか確認する
    // Then: 含まれない
    expect(HAND_PIECE_TYPES).not.toContain(PieceType.KING);
  });

  it('HAND_PIECE_TYPES に成り駒が含まれない', () => {
    // Given: 持ち駒として打てる駒の配列と成り駒の一覧
    // When: 成り駒が含まれているか確認する
    // Then: どの成り駒も含まれない
    const promotedTypes = [
      PieceType.PROMOTED_ROOK,
      PieceType.PROMOTED_BISHOP,
      PieceType.PROMOTED_SILVER,
      PieceType.PROMOTED_KNIGHT,
      PieceType.PROMOTED_LANCE,
      PieceType.PROMOTED_PAWN,
    ];
    promotedTypes.forEach(type => {
      expect(HAND_PIECE_TYPES).not.toContain(type);
    });
  });

  it('HAND_PIECE_TYPES に飛車・角・金・銀・桂・香・歩の7種が含まれる', () => {
    // Given: 持ち駒として打てる駒の配列
    // When: 各基本駒の存在を確認する
    // Then: 全7種が含まれる
    const expectedTypes = [
      PieceType.ROOK,
      PieceType.BISHOP,
      PieceType.GOLD,
      PieceType.SILVER,
      PieceType.KNIGHT,
      PieceType.LANCE,
      PieceType.PAWN,
    ];
    expectedTypes.forEach(type => {
      expect(HAND_PIECE_TYPES).toContain(type);
    });
  });

  it('HAND_PIECE_TYPES に重複する駒タイプが存在しない', () => {
    // Given: 持ち駒として打てる駒の配列
    // When: Setで重複チェックする
    // Then: 重複がない
    const uniqueTypes = new Set(HAND_PIECE_TYPES);
    expect(uniqueTypes.size).toBe(HAND_PIECE_TYPES.length);
  });
});

// ============================================================
// PROMOTION_MAP テスト
// ============================================================

describe('PROMOTION_MAP - 駒の成り対応', () => {
  it('PROMOTION_MAP は 6 エントリを持つ', () => {
    // Given: 成り対応マップ
    // When: エントリ数を確認する
    // Then: 6 が返る
    expect(Object.keys(PROMOTION_MAP)).toHaveLength(6);
  });

  it('飛車 → 成り飛車のマッピングが正しい', () => {
    // Given: 飛車の駒タイプ
    // When: PROMOTION_MAP を参照する
    // Then: PieceType.PROMOTED_ROOK が返る
    expect(PROMOTION_MAP[PieceType.ROOK]).toBe(PieceType.PROMOTED_ROOK);
  });

  it('角行 → 成り角のマッピングが正しい', () => {
    // Given: 角行の駒タイプ
    // When: PROMOTION_MAP を参照する
    // Then: PieceType.PROMOTED_BISHOP が返る
    expect(PROMOTION_MAP[PieceType.BISHOP]).toBe(PieceType.PROMOTED_BISHOP);
  });

  it('銀将 → 成銀のマッピングが正しい', () => {
    // Given: 銀将の駒タイプ
    // When: PROMOTION_MAP を参照する
    // Then: PieceType.PROMOTED_SILVER が返る
    expect(PROMOTION_MAP[PieceType.SILVER]).toBe(PieceType.PROMOTED_SILVER);
  });

  it('桂馬 → 成桂のマッピングが正しい', () => {
    // Given: 桂馬の駒タイプ
    // When: PROMOTION_MAP を参照する
    // Then: PieceType.PROMOTED_KNIGHT が返る
    expect(PROMOTION_MAP[PieceType.KNIGHT]).toBe(PieceType.PROMOTED_KNIGHT);
  });

  it('香車 → 成香のマッピングが正しい', () => {
    // Given: 香車の駒タイプ
    // When: PROMOTION_MAP を参照する
    // Then: PieceType.PROMOTED_LANCE が返る
    expect(PROMOTION_MAP[PieceType.LANCE]).toBe(PieceType.PROMOTED_LANCE);
  });

  it('歩兵 → と金のマッピングが正しい', () => {
    // Given: 歩兵の駒タイプ
    // When: PROMOTION_MAP を参照する
    // Then: PieceType.PROMOTED_PAWN が返る
    expect(PROMOTION_MAP[PieceType.PAWN]).toBe(PieceType.PROMOTED_PAWN);
  });

  it('王将は PROMOTION_MAP に含まれない（成れない駒）', () => {
    // Given: 王将の駒タイプ
    // When: PROMOTION_MAP に含まれるか確認する
    // Then: undefined が返る（含まれない）
    expect(PROMOTION_MAP[PieceType.KING]).toBeUndefined();
  });

  it('金将は PROMOTION_MAP に含まれない（成れない駒）', () => {
    // Given: 金将の駒タイプ
    // When: PROMOTION_MAP に含まれるか確認する
    // Then: undefined が返る（含まれない）
    expect(PROMOTION_MAP[PieceType.GOLD]).toBeUndefined();
  });
});

// ============================================================
// UNPROMOTION_MAP テスト
// ============================================================

describe('UNPROMOTION_MAP - 成り駒から元の駒への対応', () => {
  it('UNPROMOTION_MAP は 6 エントリを持つ', () => {
    // Given: 成り解除対応マップ
    // When: エントリ数を確認する
    // Then: 6 が返る
    expect(Object.keys(UNPROMOTION_MAP)).toHaveLength(6);
  });

  it('成り飛車 → 飛車のマッピングが正しい', () => {
    // Given: 成り飛車の駒タイプ
    // When: UNPROMOTION_MAP を参照する
    // Then: PieceType.ROOK が返る
    expect(UNPROMOTION_MAP[PieceType.PROMOTED_ROOK]).toBe(PieceType.ROOK);
  });

  it('成り角 → 角行のマッピングが正しい', () => {
    // Given: 成り角の駒タイプ
    // When: UNPROMOTION_MAP を参照する
    // Then: PieceType.BISHOP が返る
    expect(UNPROMOTION_MAP[PieceType.PROMOTED_BISHOP]).toBe(PieceType.BISHOP);
  });

  it('成銀 → 銀将のマッピングが正しい', () => {
    // Given: 成銀の駒タイプ
    // When: UNPROMOTION_MAP を参照する
    // Then: PieceType.SILVER が返る
    expect(UNPROMOTION_MAP[PieceType.PROMOTED_SILVER]).toBe(PieceType.SILVER);
  });

  it('成桂 → 桂馬のマッピングが正しい', () => {
    // Given: 成桂の駒タイプ
    // When: UNPROMOTION_MAP を参照する
    // Then: PieceType.KNIGHT が返る
    expect(UNPROMOTION_MAP[PieceType.PROMOTED_KNIGHT]).toBe(PieceType.KNIGHT);
  });

  it('成香 → 香車のマッピングが正しい', () => {
    // Given: 成香の駒タイプ
    // When: UNPROMOTION_MAP を参照する
    // Then: PieceType.LANCE が返る
    expect(UNPROMOTION_MAP[PieceType.PROMOTED_LANCE]).toBe(PieceType.LANCE);
  });

  it('と金 → 歩兵のマッピングが正しい', () => {
    // Given: と金の駒タイプ
    // When: UNPROMOTION_MAP を参照する
    // Then: PieceType.PAWN が返る
    expect(UNPROMOTION_MAP[PieceType.PROMOTED_PAWN]).toBe(PieceType.PAWN);
  });

  it('王将は UNPROMOTION_MAP に含まれない', () => {
    // Given: 王将の駒タイプ
    // When: UNPROMOTION_MAP に含まれるか確認する
    // Then: undefined が返る（含まれない）
    expect(UNPROMOTION_MAP[PieceType.KING]).toBeUndefined();
  });

  it('PROMOTION_MAP と UNPROMOTION_MAP は逆写像の関係にある', () => {
    // Given: PROMOTION_MAP の全エントリ
    // When: PROMOTION_MAP で成り駒に変換し、UNPROMOTION_MAP で元に戻す
    // Then: 元の駒タイプに一致する
    Object.entries(PROMOTION_MAP).forEach(([original, promoted]) => {
      expect(UNPROMOTION_MAP[promoted]).toBe(original);
    });
  });
});

// ============================================================
// PieceType 定数テスト
// ============================================================

describe('PieceType - 駒の種類定数', () => {
  it('PieceType は 14 種類の駒タイプを持つ', () => {
    // Given: PieceType の定義
    // When: エントリ数を確認する
    // Then: 14 が返る（基本8種 + 成り6種）
    expect(Object.keys(PieceType)).toHaveLength(14);
  });

  it('全ての PieceType の値が文字列型である', () => {
    // Given: PieceType の全エントリ
    // When: 各値の型を確認する
    // Then: 全て string 型
    Object.values(PieceType).forEach(value => {
      expect(typeof value).toBe('string');
    });
  });

  it('全ての PieceType の値が重複しない', () => {
    // Given: PieceType の全値
    // When: Setで重複チェックする
    // Then: 重複がない
    const values = Object.values(PieceType);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});

// ============================================================
// Player 定数テスト
// ============================================================

describe('Player - プレイヤー定数', () => {
  it('Player.SENTE は "sente" である', () => {
    // Given: Player の定義
    // When: SENTE の値を確認する
    // Then: 'sente' が返る
    expect(Player.SENTE).toBe('sente');
  });

  it('Player.GOTE は "gote" である', () => {
    // Given: Player の定義
    // When: GOTE の値を確認する
    // Then: 'gote' が返る
    expect(Player.GOTE).toBe('gote');
  });

  it('SENTE と GOTE は異なる値である', () => {
    // Given: 両プレイヤーの定義
    // When: 値を比較する
    // Then: 異なる
    expect(Player.SENTE).not.toBe(Player.GOTE);
  });
});

/*
 * 実行コマンド:
 *   npm test -- --testPathPattern=pieces
 *
 * カバレッジ取得:
 *   npm test -- --testPathPattern=pieces --coverage
 *
 * 目標: pieces.js の分岐網羅 100%
 *
 * カバレッジ対象関数:
 *   - isPromoted(): UNPROMOTION_MAP の in 演算子 (true/false 両分岐)
 *   - canPromote(): PROMOTION_MAP の in 演算子 (true/false 両分岐)
 *   - unpromote(): UNPROMOTION_MAP[type] の || 演算子 (truthy/falsy 両分岐)
 *   - getKanji(): typeof kanji === 'object' の条件分岐 (object/string 両分岐)
 *   - getMovePattern(): pattern の存在チェック + player === Player.SENTE 分岐
 */
