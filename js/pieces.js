// 駒の種類
export const PieceType = {
  KING: 'king',
  ROOK: 'rook',
  BISHOP: 'bishop',
  GOLD: 'gold',
  SILVER: 'silver',
  KNIGHT: 'knight',
  LANCE: 'lance',
  PAWN: 'pawn',
  // 成り駒
  PROMOTED_ROOK: 'prook',
  PROMOTED_BISHOP: 'pbishop',
  PROMOTED_SILVER: 'psilver',
  PROMOTED_KNIGHT: 'pknight',
  PROMOTED_LANCE: 'plance',
  PROMOTED_PAWN: 'ppawn',
};

// プレイヤー
export const Player = {
  SENTE: 'sente', // 先手（下側）
  GOTE: 'gote',   // 後手（上側）
};

// 駒の漢字表示
export const PIECE_KANJI = {
  [PieceType.KING]: { sente: '王', gote: '玉' },
  [PieceType.ROOK]: '飛',
  [PieceType.BISHOP]: '角',
  [PieceType.GOLD]: '金',
  [PieceType.SILVER]: '銀',
  [PieceType.KNIGHT]: '桂',
  [PieceType.LANCE]: '香',
  [PieceType.PAWN]: '歩',
  [PieceType.PROMOTED_ROOK]: '龍',
  [PieceType.PROMOTED_BISHOP]: '馬',
  [PieceType.PROMOTED_SILVER]: '全',
  [PieceType.PROMOTED_KNIGHT]: '圭',
  [PieceType.PROMOTED_LANCE]: '杏',
  [PieceType.PROMOTED_PAWN]: 'と',
};

// 成りの対応
export const PROMOTION_MAP = {
  [PieceType.ROOK]: PieceType.PROMOTED_ROOK,
  [PieceType.BISHOP]: PieceType.PROMOTED_BISHOP,
  [PieceType.SILVER]: PieceType.PROMOTED_SILVER,
  [PieceType.KNIGHT]: PieceType.PROMOTED_KNIGHT,
  [PieceType.LANCE]: PieceType.PROMOTED_LANCE,
  [PieceType.PAWN]: PieceType.PROMOTED_PAWN,
};

// 成り駒から元の駒への対応
export const UNPROMOTION_MAP = {
  [PieceType.PROMOTED_ROOK]: PieceType.ROOK,
  [PieceType.PROMOTED_BISHOP]: PieceType.BISHOP,
  [PieceType.PROMOTED_SILVER]: PieceType.SILVER,
  [PieceType.PROMOTED_KNIGHT]: PieceType.KNIGHT,
  [PieceType.PROMOTED_LANCE]: PieceType.LANCE,
  [PieceType.PROMOTED_PAWN]: PieceType.PAWN,
};

// 成り駒かどうか
export function isPromoted(type) {
  return type in UNPROMOTION_MAP;
}

// 成れるかどうか
export function canPromote(type) {
  return type in PROMOTION_MAP;
}

// 持ち駒として使う場合の駒タイプ（成り駒は元に戻す）
export function unpromote(type) {
  return UNPROMOTION_MAP[type] || type;
}

// 漢字を取得
export function getKanji(type, player) {
  const kanji = PIECE_KANJI[type];
  if (typeof kanji === 'object') {
    return kanji[player];
  }
  return kanji;
}

// 方向ベクトル（先手視点：上が前方）
// [row差, col差] - 先手の場合 row が減る方向が前
const DIR = {
  UP:    [-1,  0],
  DOWN:  [ 1,  0],
  LEFT:  [ 0, -1],
  RIGHT: [ 0,  1],
  UL:    [-1, -1],
  UR:    [-1,  1],
  DL:    [ 1, -1],
  DR:    [ 1,  1],
  // 桂馬の移動
  KNIGHT_L: [-2, -1],
  KNIGHT_R: [-2,  1],
};

// 各駒の移動パターン
// steps: 1マスだけ移動できる方向
// slides: 複数マス移動できる方向（飛車、角など）
const MOVE_PATTERNS = {
  [PieceType.KING]: {
    steps: [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT, DIR.UL, DIR.UR, DIR.DL, DIR.DR],
    slides: [],
  },
  [PieceType.ROOK]: {
    steps: [],
    slides: [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT],
  },
  [PieceType.BISHOP]: {
    steps: [],
    slides: [DIR.UL, DIR.UR, DIR.DL, DIR.DR],
  },
  [PieceType.GOLD]: {
    steps: [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT, DIR.UL, DIR.UR],
    slides: [],
  },
  [PieceType.SILVER]: {
    steps: [DIR.UP, DIR.UL, DIR.UR, DIR.DL, DIR.DR],
    slides: [],
  },
  [PieceType.KNIGHT]: {
    steps: [DIR.KNIGHT_L, DIR.KNIGHT_R],
    slides: [],
  },
  [PieceType.LANCE]: {
    steps: [],
    slides: [DIR.UP],
  },
  [PieceType.PAWN]: {
    steps: [DIR.UP],
    slides: [],
  },
  // 成り駒
  [PieceType.PROMOTED_ROOK]: {
    steps: [DIR.UL, DIR.UR, DIR.DL, DIR.DR],
    slides: [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT],
  },
  [PieceType.PROMOTED_BISHOP]: {
    steps: [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT],
    slides: [DIR.UL, DIR.UR, DIR.DL, DIR.DR],
  },
  // 成銀・成桂・成香・と金は金と同じ動き
  [PieceType.PROMOTED_SILVER]: {
    steps: [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT, DIR.UL, DIR.UR],
    slides: [],
  },
  [PieceType.PROMOTED_KNIGHT]: {
    steps: [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT, DIR.UL, DIR.UR],
    slides: [],
  },
  [PieceType.PROMOTED_LANCE]: {
    steps: [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT, DIR.UL, DIR.UR],
    slides: [],
  },
  [PieceType.PROMOTED_PAWN]: {
    steps: [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT, DIR.UL, DIR.UR],
    slides: [],
  },
};

// 後手の場合は方向を反転
function flipDirection(dir) {
  return [-dir[0], -dir[1]];
}

// 駒の移動パターンを取得（プレイヤー考慮）
export function getMovePattern(type, player) {
  const pattern = MOVE_PATTERNS[type];
  if (!pattern) return { steps: [], slides: [] };

  if (player === Player.SENTE) {
    return pattern;
  }

  // 後手は全方向を反転
  return {
    steps: pattern.steps.map(flipDirection),
    slides: pattern.slides.map(flipDirection),
  };
}

// 持ち駒として打てる駒の種類（成り駒以外の基本駒、王以外）
export const HAND_PIECE_TYPES = [
  PieceType.ROOK,
  PieceType.BISHOP,
  PieceType.GOLD,
  PieceType.SILVER,
  PieceType.KNIGHT,
  PieceType.LANCE,
  PieceType.PAWN,
];
