import { PieceType, Player, getMovePattern, canPromote, PROMOTION_MAP, isPromoted } from './pieces.js';

function inBounds(row, col) {
  return row >= 0 && row < 9 && col >= 0 && col < 9;
}

// 駒の到達可能なマスを取得（王手無視 = 疑似合法手）
export function getRawMoves(state, row, col) {
  const piece = state.getPiece(row, col);
  if (!piece) return [];

  const pattern = getMovePattern(piece.type, piece.player);
  const moves = [];

  // 1マス移動
  for (const [dr, dc] of pattern.steps) {
    const nr = row + dr;
    const nc = col + dc;
    if (!inBounds(nr, nc)) continue;
    const target = state.getPiece(nr, nc);
    if (!target || target.player !== piece.player) {
      moves.push({ row: nr, col: nc });
    }
  }

  // 複数マス移動（飛車、角行、香車など）
  for (const [dr, dc] of pattern.slides) {
    let nr = row + dr;
    let nc = col + dc;
    while (inBounds(nr, nc)) {
      const target = state.getPiece(nr, nc);
      if (target) {
        if (target.player !== piece.player) {
          moves.push({ row: nr, col: nc }); // 取れる
        }
        break; // 遮断
      }
      moves.push({ row: nr, col: nc });
      nr += dr;
      nc += dc;
    }
  }

  return moves;
}

// 指定プレイヤーの王が攻撃されているか
export function isInCheck(state, player) {
  const kingPos = state.findKing(player);
  if (!kingPos) return false;

  const opponent = state.opponent(player);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const p = state.getPiece(r, c);
      if (p && p.player === opponent) {
        const moves = getRawMoves(state, r, c);
        if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

// 合法手を取得（自玉が王手にならない手のみ）
export function getLegalMoves(state, row, col) {
  const piece = state.getPiece(row, col);
  if (!piece) return [];

  const rawMoves = getRawMoves(state, row, col);
  return rawMoves.filter(move => {
    const clone = state.clone();
    clone.board[move.row][move.col] = { ...piece };
    clone.board[row][col] = null;
    return !isInCheck(clone, piece.player);
  });
}

// 成りの判定
// 戻り値: 'mandatory' | 'optional' | 'none'
export function getPromotionStatus(piece, fromRow, toRow) {
  if (!canPromote(piece.type)) return 'none';
  if (isPromoted(piece.type)) return 'none';

  const isSente = piece.player === Player.SENTE;
  const promoZone = isSente ? [0, 1, 2] : [6, 7, 8];
  const inZoneFrom = promoZone.includes(fromRow);
  const inZoneTo = promoZone.includes(toRow);

  if (!inZoneFrom && !inZoneTo) return 'none';

  // 強制成り
  if (isSente) {
    if ((piece.type === PieceType.PAWN || piece.type === PieceType.LANCE) && toRow === 0) return 'mandatory';
    if (piece.type === PieceType.KNIGHT && toRow <= 1) return 'mandatory';
  } else {
    if ((piece.type === PieceType.PAWN || piece.type === PieceType.LANCE) && toRow === 8) return 'mandatory';
    if (piece.type === PieceType.KNIGHT && toRow >= 7) return 'mandatory';
  }

  return 'optional';
}

// 持ち駒が打てるマスを取得
export function getLegalDrops(state, player, pieceType) {
  return _getLegalDropsImpl(state, player, pieceType, true);
}

// 持ち駒が打てるマスを取得（内部用、打ち歩詰めチェックの有無を制御）
function _getLegalDropsImpl(state, player, pieceType, checkUchifuzume) {
  const drops = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (state.getPiece(r, c) !== null) continue;
      if (!_isDropLegal(state, player, pieceType, r, c, checkUchifuzume)) continue;

      // 自玉が王手にならないか確認
      const clone = state.clone();
      clone.board[r][c] = { type: pieceType, player };
      if (!isInCheck(clone, player)) {
        drops.push({ row: r, col: c });
      }
    }
  }
  return drops;
}

// 駒を打つことが合法かチェック（自王手以外のルール）
function _isDropLegal(state, player, pieceType, row, col, checkUchifuzume) {
  // 二歩チェック
  if (pieceType === PieceType.PAWN) {
    for (let r = 0; r < 9; r++) {
      const p = state.getPiece(r, col);
      if (p && p.player === player && p.type === PieceType.PAWN) {
        return false;
      }
    }
  }

  // 行き所のない駒のチェック
  if (player === Player.SENTE) {
    if (pieceType === PieceType.PAWN && row === 0) return false;
    if (pieceType === PieceType.LANCE && row === 0) return false;
    if (pieceType === PieceType.KNIGHT && row <= 1) return false;
  } else {
    if (pieceType === PieceType.PAWN && row === 8) return false;
    if (pieceType === PieceType.LANCE && row === 8) return false;
    if (pieceType === PieceType.KNIGHT && row >= 7) return false;
  }

  // 打ち歩詰めチェック（循環防止: isCheckmate内から呼ばれた場合はスキップ）
  if (checkUchifuzume && pieceType === PieceType.PAWN) {
    const clone = state.clone();
    clone.board[row][col] = { type: PieceType.PAWN, player };
    clone.currentPlayer = state.opponent(player);
    if (isInCheck(clone, clone.currentPlayer) && _isCheckmateSimple(clone)) {
      return false;
    }
  }

  return true;
}

// 詰みかどうかの判定
export function isCheckmate(state) {
  const player = state.currentPlayer;
  if (!isInCheck(state, player)) return false;
  return _hasNoLegalMoves(state, player, true);
}

// 簡易詰み判定（打ち歩詰めチェックなし - 循環防止用）
function _isCheckmateSimple(state) {
  const player = state.currentPlayer;
  if (!isInCheck(state, player)) return false;
  return _hasNoLegalMoves(state, player, false);
}

// 合法手が一つもないかチェック
function _hasNoLegalMoves(state, player, checkUchifuzume) {
  // 盤上の駒で逃げられるか
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = state.getPiece(r, c);
      if (piece && piece.player === player) {
        if (getLegalMoves(state, r, c).length > 0) return false;
      }
    }
  }

  // 持ち駒を打って逃げられるか
  const hand = state.hands[player];
  for (const pieceType of Object.keys(hand)) {
    if (hand[pieceType] > 0) {
      if (_getLegalDropsImpl(state, player, pieceType, checkUchifuzume).length > 0) return false;
    }
  }

  return true;
}
