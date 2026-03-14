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
};

// UI表示テキスト
export const UI_TEXT = {
  SENTE_NAME: '先手',
  GOTE_NAME: '後手',
  TURN_SUFFIX: 'の番です',
  CHECK_SUFFIX: 'の番です（王手！）',
  WIN_SUFFIX: 'の勝ち！',
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
