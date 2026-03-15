// js/config.js -- アプリケーション設定

// 盤面設定
export const BOARD_CONFIG = {
  SIZE: 9,
  MAX_INDEX: 8,
  MIN_INDEX: 0,
  SENTE_PROMOTION_ZONE: [0, 1, 2],
  GOTE_PROMOTION_ZONE: [6, 7, 8],
  STAR_POINTS: [
    { row: 3, col: 3 },
    { row: 3, col: 6 },
    { row: 6, col: 3 },
    { row: 6, col: 6 },
  ],
  // 行き所のない駒の制約
  SENTE_PAWN_LANCE_MIN_ROW: 0,
  SENTE_KNIGHT_MIN_ROW: 1,
  GOTE_PAWN_LANCE_MAX_ROW: 8,
  GOTE_KNIGHT_MAX_ROW: 7,
};

// DOM要素セレクタ
export const DOM_SELECTORS = {
  BOARD: 'board',
  STATUS: 'status',
  NEW_GAME_BTN: 'new-game-btn',
  GAMEOVER_NEW_GAME: 'gameover-new-game',
  GAMEOVER_DIALOG: 'gameover-dialog',
  GAMEOVER_MESSAGE: 'gameover-message',
  PROMOTION_DIALOG: 'promotion-dialog',
  PROMOTE_YES: 'promote-yes',
  PROMOTE_NO: 'promote-no',
  HAND_PIECES: '.hand-pieces',
  HAND_PIECE: '.hand-piece',
  MODE_DIALOG: 'mode-dialog',
  MODE_AI: 'mode-ai',
  MODE_PVP: 'mode-pvp',
  SIDE_DIALOG: 'side-dialog',
  SIDE_SENTE: 'side-sente',
  SIDE_GOTE: 'side-gote',
  AI_THINKING: 'ai-thinking',
};

// UI表示テキスト
export const UI_TEXT = {
  SENTE_NAME: '先手',
  GOTE_NAME: '後手',
  TURN_SUFFIX: 'の番です',
  CHECK_SUFFIX: 'の番です（王手！）',
  WIN_SUFFIX: 'の勝ち！',
  AI_THINKING: 'AI思考中...',
  MODE_AI: 'AI対戦',
  MODE_PVP: '2人対戦',
  SIDE_SENTE_LABEL: '先手（あなたが先に指す）',
  SIDE_GOTE_LABEL: '後手（AIが先に指す）',
};

// 駒の価値（AI評価関数用）
export const PIECE_VALUES = {
  king: 15000,
  rook: 1000,
  bishop: 800,
  gold: 550,
  silver: 500,
  knight: 350,
  lance: 300,
  pawn: 100,
  prook: 1300,
  pbishop: 1100,
  psilver: 420,
  pknight: 420,
  plance: 420,
  ppawn: 420,
};

// 位置ボーナス（先手視点: row=0が上, row=8が下）
// 後手の場合は row を (8 - row) に反転して使用
// テーブルがない駒タイプはボーナス0
export const POSITION_BONUS = {
  pawn: [
    [  0,   0,   0,   0,   0,   0,   0,   0,   0],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0],
    [  5,   5,  10,  15,  15,  15,  10,   5,   5],
    [  5,   5,  10,  15,  20,  15,  10,   5,   5],
    [ 10,  10,  15,  20,  25,  20,  15,  10,  10],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0],
  ],
  king: [
    [-30, -30, -30, -30, -30, -30, -30, -30, -30],
    [-20, -20, -20, -20, -20, -20, -20, -20, -20],
    [-10, -10, -10, -10, -10, -10, -10, -10, -10],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0],
    [  5,   5,   5,   5,   0,   5,   5,   5,   5],
    [ 10,  15,  15,   5,   0,   5,  15,  15,  10],
    [ 15,  20,  20,  10,   5,  10,  20,  20,  15],
  ],
};

// AI設定
export const AI_CONFIG = {
  DEFAULT_DEPTH: 3,
  QUIESCENCE_MAX_DEPTH: 2,
  MIN_THINK_TIME: 500,
  MOVE_DELAY: 100,
  HAND_PIECE_MULTIPLIER: 1.15,
  KING_SAFETY_BONUS: 30,
  CHECK_BONUS: 50,
  PROMOTION_BONUS: 40,
};

// 音声パラメータ
export const SOUND_CONFIG = {
  MOVE: {
    noiseDuration: 0.08,
    filterFreq: 3000,
    filterQ: 1.2,
    noiseGain: 0.3,
    noiseDecay: 0.08,
    oscFreqStart: 180,
    oscFreqEnd: 80,
    oscDuration: 0.06,
    oscGain: 0.15,
  },
  CAPTURE: {
    noiseDuration: 0.12,
    filterFreq: 3500,
    filterQ: 0.8,
    noiseGain: 0.45,
    noiseDecay: 0.12,
    oscFreqStart: 220,
    oscFreqEnd: 60,
    oscDuration: 0.10,
    oscGain: 0.2,
    highFreqStart: 800,
    highFreqEnd: 200,
    highDuration: 0.04,
    highGain: 0.12,
  },
  CHECK: {
    freq: 880,
    interval: 0.12,
    gain: 0.2,
    count: 2,
    attackTime: 0.02,
    releaseTime: 0.1,
  },
  CHECKMATE: {
    notes: [523.25, 659.25, 783.99, 1046.50],
    interval: 0.15,
    gain: 0.18,
    attackTime: 0.03,
    releaseTime: 0.4,
  },
};
