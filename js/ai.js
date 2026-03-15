// js/ai.js -- 将棋AIエンジン（ミニマックス + Alpha-Beta枝刈り）

import { Player, HAND_PIECE_TYPES, canPromote, PROMOTION_MAP } from './pieces.js';
import { getLegalMoves, getLegalDrops, getPromotionStatus, isInCheck, isCheckmate } from './moves.js';
import { PIECE_VALUES, POSITION_BONUS, AI_CONFIG, BOARD_CONFIG } from './config.js';

/**
 * @typedef {Object} AIMove
 * @property {'move'|'drop'} type - 手の種類
 * @property {number} [fromRow] - 移動元行（type='move'のみ）
 * @property {number} [fromCol] - 移動元列（type='move'のみ）
 * @property {number} toRow - 移動先行
 * @property {number} toCol - 移動先列
 * @property {boolean} [promote] - 成るかどうか（type='move'のみ）
 * @property {string} [pieceType] - 打つ駒の種類（type='drop'のみ）
 */

/**
 * 将棋AIクラス
 * ミニマックスアルゴリズムとAlpha-Beta枝刈りで最善手を探索する
 */
export class ShogiAI {
  /**
   * @param {string} aiPlayer - AIが操作するプレイヤー (Player.SENTE or Player.GOTE)
   * @param {number} [depth] - 探索深度
   */
  constructor(aiPlayer, depth = AI_CONFIG.DEFAULT_DEPTH) {
    this.aiPlayer = aiPlayer;
    this.depth = depth;
  }

  /**
   * 最善手を取得する
   * @param {import('./game.js').GameState} state - 現在の盤面状態
   * @returns {AIMove|null} 最善手、または合法手がない場合はnull
   */
  getBestMove(state) {
    const moves = this._generateAllMoves(state, this.aiPlayer);
    if (moves.length === 0) return null;

    this._orderMoves(moves, state);

    let bestMove = null;
    let bestScore = -Infinity;
    const alpha = -Infinity;
    const beta = Infinity;

    for (const move of moves) {
      const newState = this._applyMove(state, move);
      // 詰みの手は即座に返す
      if (isCheckmate(newState)) {
        return move;
      }
      const score = this._minimax(newState, this.depth - 1, alpha, beta, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * 全合法手を生成する
   * @param {import('./game.js').GameState} state - 盤面状態
   * @param {string} player - 対象プレイヤー
   * @returns {AIMove[]} 合法手のリスト
   */
  _generateAllMoves(state, player) {
    const moves = [];

    // 盤上の駒の合法手を生成
    for (let row = 0; row < BOARD_CONFIG.SIZE; row++) {
      for (let col = 0; col < BOARD_CONFIG.SIZE; col++) {
        const piece = state.getPiece(row, col);
        if (!piece || piece.player !== player) continue;

        const legalMoves = getLegalMoves(state, row, col);
        for (const dest of legalMoves) {
          const promoStatus = getPromotionStatus(piece, row, dest.row);

          if (promoStatus === 'mandatory') {
            // 強制成りのみ
            moves.push({
              type: 'move',
              fromRow: row,
              fromCol: col,
              toRow: dest.row,
              toCol: dest.col,
              promote: true,
            });
          } else if (promoStatus === 'optional') {
            // 成りと不成の両方を生成
            moves.push({
              type: 'move',
              fromRow: row,
              fromCol: col,
              toRow: dest.row,
              toCol: dest.col,
              promote: true,
            });
            moves.push({
              type: 'move',
              fromRow: row,
              fromCol: col,
              toRow: dest.row,
              toCol: dest.col,
              promote: false,
            });
          } else {
            moves.push({
              type: 'move',
              fromRow: row,
              fromCol: col,
              toRow: dest.row,
              toCol: dest.col,
              promote: false,
            });
          }
        }
      }
    }

    // 持ち駒の打ち手を生成
    const hand = state.hands[player];
    for (const pieceType of HAND_PIECE_TYPES) {
      if (hand[pieceType] <= 0) continue;
      const drops = getLegalDrops(state, player, pieceType);
      for (const dest of drops) {
        moves.push({
          type: 'drop',
          toRow: dest.row,
          toCol: dest.col,
          pieceType,
        });
      }
    }

    return moves;
  }

  /**
   * 手を盤面に適用して新しい状態を返す
   * @param {import('./game.js').GameState} state - 現在の盤面状態
   * @param {AIMove} move - 適用する手
   * @returns {import('./game.js').GameState} 新しい盤面状態
   */
  _applyMove(state, move) {
    const newState = state.clone();
    if (move.type === 'move') {
      newState.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol, move.promote);
    } else {
      newState.dropPiece(move.pieceType, move.toRow, move.toCol, newState.currentPlayer);
    }
    newState.switchTurn();
    return newState;
  }

  /**
   * ミニマックス探索（Alpha-Beta枝刈り付き）
   * @param {import('./game.js').GameState} state - 盤面状態
   * @param {number} depth - 残り探索深度
   * @param {number} alpha - アルファ値
   * @param {number} beta - ベータ値
   * @param {boolean} isMaximizing - 最大化プレイヤーのターンか
   * @returns {number} 評価スコア
   */
  _minimax(state, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return this._quiescenceSearch(state, AI_CONFIG.QUIESCENCE_MAX_DEPTH, alpha, beta, isMaximizing);
    }

    const currentPlayer = isMaximizing ? this.aiPlayer : this._opponent();
    const moves = this._generateAllMoves(state, currentPlayer);

    // 合法手がない場合（詰み or 千日手相当）
    if (moves.length === 0) {
      // 詰みの場合は極端な評価値を返す
      if (isInCheck(state, currentPlayer)) {
        return isMaximizing ? -Infinity : Infinity;
      }
      return 0;
    }

    this._orderMoves(moves, state);

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        const newState = this._applyMove(state, move);
        const score = this._minimax(newState, depth - 1, alpha, beta, false);
        if (score > maxScore) maxScore = score;
        if (maxScore > alpha) alpha = maxScore;
        if (beta <= alpha) break; // Beta枝刈り
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        const newState = this._applyMove(state, move);
        const score = this._minimax(newState, depth - 1, alpha, beta, true);
        if (score < minScore) minScore = score;
        if (minScore < beta) beta = minScore;
        if (beta <= alpha) break; // Alpha枝刈り
      }
      return minScore;
    }
  }

  /**
   * 静止探索（水平線効果を緩和）
   * 取り手のみを追加探索する
   * @param {import('./game.js').GameState} state - 盤面状態
   * @param {number} depth - 残り探索深度
   * @param {number} alpha - アルファ値
   * @param {number} beta - ベータ値
   * @param {boolean} isMaximizing - 最大化プレイヤーのターンか
   * @returns {number} 評価スコア
   */
  _quiescenceSearch(state, depth, alpha, beta, isMaximizing) {
    const standPat = this._evaluate(state);

    if (depth === 0) return standPat;

    if (isMaximizing) {
      if (standPat >= beta) return beta;
      if (standPat > alpha) alpha = standPat;

      const currentPlayer = this.aiPlayer;
      const captureMoves = this._generateCaptureMoves(state, currentPlayer);
      if (captureMoves.length === 0) return standPat;

      let maxScore = standPat;
      for (const move of captureMoves) {
        const newState = this._applyMove(state, move);
        const score = this._quiescenceSearch(newState, depth - 1, alpha, beta, false);
        if (score > maxScore) maxScore = score;
        if (maxScore > alpha) alpha = maxScore;
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      if (standPat <= alpha) return alpha;
      if (standPat < beta) beta = standPat;

      const currentPlayer = this._opponent();
      const captureMoves = this._generateCaptureMoves(state, currentPlayer);
      if (captureMoves.length === 0) return standPat;

      let minScore = standPat;
      for (const move of captureMoves) {
        const newState = this._applyMove(state, move);
        const score = this._quiescenceSearch(newState, depth - 1, alpha, beta, true);
        if (score < minScore) minScore = score;
        if (minScore < beta) beta = minScore;
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  /**
   * 盤面を評価する（AIプレイヤー視点）
   * @param {import('./game.js').GameState} state - 盤面状態
   * @returns {number} 評価スコア（正=AI有利、負=相手有利）
   */
  _evaluate(state) {
    let score = 0;

    // 駒の価値 + 位置ボーナス
    score += this._evaluatePieces(state);

    // 持ち駒の価値
    score += this._evaluateHands(state);

    // 王の安全性
    score += this._evaluateKingSafety(state);

    // 王手ボーナス
    const opponent = this._opponent();
    if (isInCheck(state, opponent)) {
      score += AI_CONFIG.CHECK_BONUS;
    }
    if (isInCheck(state, this.aiPlayer)) {
      score -= AI_CONFIG.CHECK_BONUS;
    }

    return score;
  }

  /**
   * 盤上の駒を評価する
   * @param {import('./game.js').GameState} state - 盤面状態
   * @returns {number} 評価スコア
   */
  _evaluatePieces(state) {
    let score = 0;
    for (let row = 0; row < BOARD_CONFIG.SIZE; row++) {
      for (let col = 0; col < BOARD_CONFIG.SIZE; col++) {
        const piece = state.getPiece(row, col);
        if (!piece) continue;

        const value = (PIECE_VALUES[piece.type] ?? 0) + this._getPositionBonus(piece.type, piece.player, row, col);

        if (piece.player === this.aiPlayer) {
          score += value;
        } else {
          score -= value;
        }
      }
    }
    return score;
  }

  /**
   * 持ち駒を評価する
   * @param {import('./game.js').GameState} state - 盤面状態
   * @returns {number} 評価スコア
   */
  _evaluateHands(state) {
    let score = 0;
    const multiplier = AI_CONFIG.HAND_PIECE_MULTIPLIER;

    for (const pieceType of HAND_PIECE_TYPES) {
      const aiCount = state.hands[this.aiPlayer][pieceType] ?? 0;
      const opponentCount = state.hands[this._opponent()][pieceType] ?? 0;
      const value = (PIECE_VALUES[pieceType] ?? 0) * multiplier;

      score += aiCount * value;
      score -= opponentCount * value;
    }

    return score;
  }

  /**
   * 王の安全性を評価する
   * @param {import('./game.js').GameState} state - 盤面状態
   * @returns {number} 評価スコア
   */
  _evaluateKingSafety(state) {
    const aiDefenders = this._countKingDefenders(state, this.aiPlayer);
    const opponentDefenders = this._countKingDefenders(state, this._opponent());
    return (aiDefenders - opponentDefenders) * AI_CONFIG.KING_SAFETY_BONUS;
  }

  /**
   * 王の周囲にいる味方駒の数を数える
   * @param {import('./game.js').GameState} state - 盤面状態
   * @param {string} player - 対象プレイヤー
   * @returns {number} 守備駒の数
   */
  _countKingDefenders(state, player) {
    const kingPos = state.findKing(player);
    if (!kingPos) return 0;

    let count = 0;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [ 0, -1],           [ 0, 1],
      [ 1, -1], [ 1, 0], [ 1, 1],
    ];

    for (const [dr, dc] of directions) {
      const nr = kingPos.row + dr;
      const nc = kingPos.col + dc;
      if (nr < BOARD_CONFIG.MIN_INDEX || nr > BOARD_CONFIG.MAX_INDEX) continue;
      if (nc < BOARD_CONFIG.MIN_INDEX || nc > BOARD_CONFIG.MAX_INDEX) continue;
      const piece = state.getPiece(nr, nc);
      if (piece && piece.player === player) {
        count++;
      }
    }

    return count;
  }

  /**
   * 位置ボーナスを取得する（プレイヤーに応じて反転）
   * @param {string} type - 駒の種類
   * @param {string} player - プレイヤー
   * @param {number} row - 行インデックス
   * @param {number} col - 列インデックス
   * @returns {number} 位置ボーナス
   */
  _getPositionBonus(type, player, row, col) {
    const table = POSITION_BONUS[type];
    if (!table) return 0;

    // 後手の場合は行を反転
    const effectiveRow = player === Player.GOTE ? (BOARD_CONFIG.MAX_INDEX - row) : row;
    return table[effectiveRow]?.[col] ?? 0;
  }

  /**
   * 取り手のみを生成する（静止探索用）
   * @param {import('./game.js').GameState} state - 盤面状態
   * @param {string} player - 対象プレイヤー
   * @returns {AIMove[]} 取り手のリスト
   */
  _generateCaptureMoves(state, player) {
    const moves = [];

    for (let row = 0; row < BOARD_CONFIG.SIZE; row++) {
      for (let col = 0; col < BOARD_CONFIG.SIZE; col++) {
        const piece = state.getPiece(row, col);
        if (!piece || piece.player !== player) continue;

        const legalMoves = getLegalMoves(state, row, col);
        for (const dest of legalMoves) {
          // 取り手のみ（移動先に相手の駒がある場合）
          const target = state.getPiece(dest.row, dest.col);
          if (!target) continue;

          const promoStatus = getPromotionStatus(piece, row, dest.row);
          const shouldPromote = promoStatus === 'mandatory' || promoStatus === 'optional';

          moves.push({
            type: 'move',
            fromRow: row,
            fromCol: col,
            toRow: dest.row,
            toCol: dest.col,
            promote: shouldPromote,
          });
        }
      }
    }

    return moves;
  }

  /**
   * 手をスコアで並べ替える（探索効率化のため良い手を優先）
   * @param {AIMove[]} moves - 手のリスト
   * @param {import('./game.js').GameState} state - 盤面状態
   */
  _orderMoves(moves, state) {
    // スコアを計算してキャッシュし、降順ソート
    moves.sort((a, b) => this._moveOrderScore(b, state) - this._moveOrderScore(a, state));
  }

  /**
   * 手の優先度スコアを計算する
   * @param {AIMove} move - 手
   * @param {import('./game.js').GameState} state - 盤面状態
   * @returns {number} 優先度スコア
   */
  _moveOrderScore(move, state) {
    let score = 0;

    if (move.type === 'move') {
      const target = state.getPiece(move.toRow, move.toCol);
      if (target) {
        // MVV-LVA: 価値の高い駒を取る手を優先
        const attackerPiece = state.getPiece(move.fromRow, move.fromCol);
        const targetValue = PIECE_VALUES[target.type] ?? 0;
        const attackerValue = PIECE_VALUES[attackerPiece?.type] ?? 0;
        score += targetValue * 10 - attackerValue;
      }
      // 成り手にボーナス
      if (move.promote) {
        score += AI_CONFIG.PROMOTION_BONUS;
      }
    } else {
      // 打ち手は中程度の優先度
      score += 100;
    }

    return score;
  }

  /**
   * AIの相手プレイヤーを返す
   * @returns {string} 相手プレイヤー
   */
  _opponent() {
    return this.aiPlayer === Player.SENTE ? Player.GOTE : Player.SENTE;
  }
}
