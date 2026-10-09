/**
 * js/ui.js（UIController）のテスト
 * 本テストは js/ui.js 本体を import して実行する。
 * DOM 依存はスタブ（withDocumentStub / createRendererStub）、効果音依存は
 * window.AudioContext のモックで置き換える。
 * 対局終了判定（isInCheck / isCheckmate / hasNoLegalMoves）は
 * UIController._checkDeps を差し替えて制御する。
 *
 * テスト観点の表（等価分割・境界値）
 *
 * | #  | 観点                                    | 分類   | 入力値/条件                                   | 期待結果                                      |
 * |----|------------------------------------------|--------|-----------------------------------------------|-----------------------------------------------|
 * |  1 | _isAITurn: pvpモード                    | 正常系 | gameMode='pvp'                               | 常に false を返す                             |
 * |  2 | _isAITurn: AIモード・人間の手番          | 正常系 | gameMode='ai', currentPlayer=humanPlayer      | false を返す                                  |
 * |  3 | _isAITurn: AIモード・AIの手番            | 正常系 | gameMode='ai', currentPlayer!=humanPlayer     | true を返す                                   |
 * |  4 | _isAITurn: モード未設定（null）          | 境界値 | gameMode=null                                | false を返す（nullチェック）                  |
 * |  5 | _startGame('pvp'): モード設定            | 正常系 | mode='pvp'                                   | gameMode='pvp', ai=null, humanPlayer=null     |
 * |  6 | _startGame('ai', SENTE): 先手選択        | 正常系 | mode='ai', humanSide=SENTE                   | ai は GOTE として初期化される                 |
 * |  7 | _startGame('ai', GOTE): 後手選択         | 正常系 | mode='ai', humanSide=GOTE                    | ai は SENTE として初期化される                |
 * |  8 | _startGame: ゲーム状態のリセット         | 正常系 | 対局中にstartGameを呼ぶ                      | state.reset() が呼ばれる                      |
 * |  9 | _startGame: isAIThinking リセット        | 正常系 | isAIThinking=true の状態で開始               | AI思考フラグはリセットされる                  |
 * | 10 | _triggerAIMove: 最善手なし              | 異常系 | getBestMove が null を返す                   | isAIThinking=false, showThinking(false)       |
 * | 11 | _executeAIMove: 移動手の実行            | 正常系 | type='move'                                  | movePiece が呼ばれる                          |
 * | 12 | _executeAIMove: 打ち手の実行            | 正常系 | type='drop'                                  | dropPiece が呼ばれる                          |
 * | 13 | _executeAIMove: 取り駒あり移動          | 正常系 | 移動先に敵駒が存在                           | captured=true で postMove が呼ばれる          |
 * | 14 | _executeAIMove: 取り駒なし移動          | 正常系 | 移動先が空                                   | captured=false で postMove が呼ばれる         |
 * | 15 | newGame: AI思考フラグクリア             | 正常系 | isAIThinking=true                            | isAIThinking=false になる                     |
 * | 16 | _postMove: ゲームオーバー時のAI起動防止 | 正常系 | state.gameOver=true                          | _triggerAIMove は呼ばれない                   |
 * | 17 | _postMove: AIターン時の自動実行          | 正常系 | ゲーム続行中、AIのターン                     | _triggerAIMove が呼ばれる                     |
 * | 18 | _postMove: 人間ターン時はAI非起動        | 正常系 | ゲーム続行中、人間のターン                   | _triggerAIMove は呼ばれない                   |
 * | 19 | _handleBoardClick: AI思考中ガード       | 正常系 | isAIThinking=true                            | 処理を中断する                                |
 * | 20 | _handleBoardClick: AIターン中ガード      | 正常系 | _isAITurn()=true                             | 処理を中断する                                |
 * | 21 | _handleHandClick: AI思考中ガード        | 正常系 | isAIThinking=true                            | 処理を中断する                                |
 * | 22 | _handleHandClick: AIターン中ガード       | 正常系 | _isAITurn()=true                             | 処理を中断する                                |
 * | 23 | _showThinking(true): 表示ON             | 正常系 | show=true                                    | 'hidden' クラスが除去される                   |
 * | 24 | _showThinking(false): 表示OFF           | 正常系 | show=false                                   | 'hidden' クラスが追加される                   |
 * | 25 | _startGame: humanPlayer の設定          | 正常系 | mode='ai', humanSide=GOTE                    | humanPlayer === Player.GOTE                   |
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Player, PieceType } from '../js/pieces.js';
import { GameState } from '../js/game.js';
import { AI_CONFIG, DOM_SELECTORS } from '../js/config.js';
import { UIController } from '../js/ui.js';
import { clearBoard, clearHands } from './helpers/board-test-helpers.js';

// ----- DOM / AudioContext スタブ -----

// 効果音（sound.js）は window.AudioContext に依存するため、node 環境では
// 最小限の AudioContext モックを window に設定して実行する
class MockAudioContextForUI {
  constructor() {
    this.state = 'running';
    this.currentTime = 0.5;
    this.sampleRate = 44100;
    this.destination = {};
    this.resume = () => Promise.resolve();
    this.createBuffer = () => ({ getChannelData: () => new Float32Array(0) });
  }

  createBufferSource() {
    return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} };
  }

  createBiquadFilter() {
    return { type: '', frequency: { setValueAtTime: () => {} }, Q: { setValueAtTime: () => {} }, connect: () => {} };
  }

  createGain() {
    return {
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      connect: () => {},
    };
  }

  createOscillator() {
    return { type: '', frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} };
  }
}

function createRendererStub() {
  return {
    boardEl: { addEventListener: jest.fn() },
    render: jest.fn(),
    renderHands: jest.fn(),
    highlightMoves: jest.fn(),
    highlightSelected: jest.fn(),
    clearHighlights: jest.fn(),
  };
}

// UIController は document / window（効果音）に依存するため、
// ファイル全体でスタブに差し替える。docElements は ID→要素スタブの Map。
let originalWindow;
let originalDocument;
let docElements;

beforeEach(() => {
  originalWindow = globalThis.window;
  globalThis.window = { AudioContext: MockAudioContextForUI };

  originalDocument = globalThis.document;
  docElements = new Map();
  const makeEl = () => ({
    classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    textContent: '',
  });
  globalThis.document = {
    getElementById: jest.fn((id) => {
      if (!docElements.has(id)) docElements.set(id, makeEl());
      return docElements.get(id);
    }),
    querySelectorAll: jest.fn(() => []),
  };
});

afterEach(() => {
  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
  if (originalDocument === undefined) {
    delete globalThis.document;
  } else {
    globalThis.document = originalDocument;
  }
});

// UIController を生成して返す（DOM スタブは beforeEach で設定済み）
function setupController(state, opts = {}) {
  const renderer = createRendererStub();
  const controller = new UIController(state, renderer);
  if (opts.gameMode !== undefined) {
    controller.gameMode = opts.gameMode;
    controller.humanPlayer = opts.humanPlayer ?? null;
  }
  return { controller, renderer };
}

// ステイルメイト相当局面（先手玉が王手されていないが合法手ゼロ）を構築する
function createStalemateState() {
  const state = new GameState();
  clearBoard(state);
  clearHands(state);
  state.board[8][4] = { type: PieceType.KING, player: Player.SENTE };
  state.board[0][0] = { type: PieceType.KING, player: Player.GOTE };
  state.board[7][3] = { type: PieceType.LANCE, player: Player.GOTE };
  state.board[7][5] = { type: PieceType.LANCE, player: Player.GOTE };
  state.board[5][3] = { type: PieceType.KNIGHT, player: Player.GOTE };
  state.board[5][5] = { type: PieceType.KNIGHT, player: Player.GOTE };
  state.board[6][2] = { type: PieceType.SILVER, player: Player.GOTE };
  state.board[6][6] = { type: PieceType.SILVER, player: Player.GOTE };
  return state;
}

describe('_isAITurn()', () => {
  test('pvpモードでは常に false を返す', () => {
    // Given: gameMode='pvp'
    // When: _isAITurn() を呼ぶ
    // Then: false
    const { controller } = setupController(new GameState(), { gameMode: 'pvp', humanPlayer: Player.SENTE });
    expect(controller._isAITurn()).toBe(false);
  });

  test('AIモードで人間の手番なら false を返す', () => {
    // Given: gameMode='ai', humanPlayer=SENTE, currentPlayer=SENTE
    // When: _isAITurn() を呼ぶ
    // Then: false
    const state = new GameState();
    state.currentPlayer = Player.SENTE;
    const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.SENTE });
    expect(controller._isAITurn()).toBe(false);
  });

  test('AIモードでAIの手番なら true を返す', () => {
    // Given: gameMode='ai', humanPlayer=SENTE, currentPlayer=GOTE
    // When: _isAITurn() を呼ぶ
    // Then: true
    const state = new GameState();
    state.currentPlayer = Player.GOTE;
    const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.SENTE });
    expect(controller._isAITurn()).toBe(true);
  });

  test('gameMode が null のとき false を返す（未設定）', () => {
    // Given: gameMode=null
    // When: _isAITurn() を呼ぶ
    // Then: false（null は 'ai' に一致しないため）
    const state = new GameState();
    state.currentPlayer = Player.GOTE;
    const { controller } = setupController(state, { gameMode: null, humanPlayer: Player.SENTE });
    expect(controller._isAITurn()).toBe(false);
  });

  test('後手を選んだ場合: 後手の手番(GOTE)では false を返す', () => {
    // Given: humanPlayer=GOTE, currentPlayer=GOTE
    // When: _isAITurn() を呼ぶ
    // Then: false
    const state = new GameState();
    state.currentPlayer = Player.GOTE;
    const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.GOTE });
    expect(controller._isAITurn()).toBe(false);
  });

  test('後手を選んだ場合: 先手の手番(SENTE)では true を返す', () => {
    // Given: humanPlayer=GOTE, currentPlayer=SENTE
    // When: _isAITurn() を呼ぶ
    // Then: true
    const state = new GameState();
    state.currentPlayer = Player.SENTE;
    const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.GOTE });
    expect(controller._isAITurn()).toBe(true);
  });
});

describe('_startGame()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('pvpモード: gameMode="pvp", ai=null, humanPlayer=null になる', () => {
    // Given: mode='pvp'
    // When: _startGame('pvp') を呼ぶ
    // Then: gameMode='pvp', ai=null, humanPlayer=null
    const { controller } = setupController(new GameState(), { gameMode: 'ai', humanPlayer: Player.SENTE });
    controller._startGame('pvp');
    expect(controller.gameMode).toBe('pvp');
    expect(controller.ai).toBeNull();
    expect(controller.humanPlayer).toBeNull();
  });

  test('pvpモード: _triggerAIMove は呼ばれない', () => {
    // Given: mode='pvp'
    // When: _startGame('pvp') を呼ぶ
    // Then: _triggerAIMove は呼ばれない
    const { controller } = setupController(new GameState(), { gameMode: 'ai', humanPlayer: Player.SENTE });
    const triggerSpy = jest.spyOn(controller, '_triggerAIMove');
    controller._startGame('pvp');
    expect(triggerSpy).not.toHaveBeenCalled();
  });

  test('AIモード・先手選択: humanPlayer=SENTE, ai は GOTE で初期化される', () => {
    // Given: mode='ai', humanSide=SENTE
    // When: _startGame('ai', Player.SENTE) を呼ぶ
    // Then: humanPlayer=SENTE, ai.aiPlayer=GOTE
    const { controller } = setupController(new GameState());
    controller._startGame('ai', Player.SENTE);
    expect(controller.humanPlayer).toBe(Player.SENTE);
    expect(controller.ai.aiPlayer).toBe(Player.GOTE);
  });

  test('AIモード・先手選択: AIは後手なので _triggerAIMove は呼ばれない', () => {
    // Given: mode='ai', humanSide=SENTE（人間が先手 → AIは後手）
    // When: _startGame('ai', Player.SENTE) を呼ぶ
    // Then: _triggerAIMove は呼ばれない（AIは先手ではないため）
    const { controller } = setupController(new GameState());
    const triggerSpy = jest.spyOn(controller, '_triggerAIMove');
    controller._startGame('ai', Player.SENTE);
    expect(triggerSpy).not.toHaveBeenCalled();
  });

  test('AIモード・後手選択: humanPlayer=GOTE, ai は SENTE で初期化される', () => {
    // Given: mode='ai', humanSide=GOTE
    // When: _startGame('ai', Player.GOTE) を呼ぶ
    // Then: humanPlayer=GOTE, ai.aiPlayer=SENTE
    const { controller } = setupController(new GameState());
    controller._startGame('ai', Player.GOTE);
    expect(controller.humanPlayer).toBe(Player.GOTE);
    expect(controller.ai.aiPlayer).toBe(Player.SENTE);
  });

  test('AIモード・後手選択: AIは先手なので _triggerAIMove が呼ばれる', () => {
    // Given: mode='ai', humanSide=GOTE（人間が後手 → AIは先手）
    // When: _startGame('ai', Player.GOTE) を呼ぶ
    // Then: _triggerAIMove が呼ばれる
    const { controller } = setupController(new GameState());
    const triggerSpy = jest.spyOn(controller, '_triggerAIMove').mockImplementation(() => {});
    controller._startGame('ai', Player.GOTE);
    expect(triggerSpy).toHaveBeenCalled();
  });

  test('_startGame 後に状態がリセットされる', () => {
    // Given: ゲーム進行中の状態
    // When: _startGame() を呼ぶ
    // Then: state.gameOver=false, state.winner=null
    const state = new GameState();
    state.gameOver = true;
    state.winner = Player.SENTE;
    const { controller } = setupController(state);
    controller._startGame('pvp');
    expect(state.gameOver).toBe(false);
    expect(state.winner).toBeNull();
  });

  test('state.reset() が呼ばれる', () => {
    // Given: ゲーム進行中の状態
    // When: _startGame() を呼ぶ
    // Then: state.reset() が呼ばれる
    const state = new GameState();
    const resetSpy = jest.spyOn(state, 'reset');
    const { controller } = setupController(state);
    controller._startGame('pvp');
    expect(resetSpy).toHaveBeenCalled();
  });

  test('_clearSelection が呼ばれる', () => {
    // Given: 選択状態がある
    // When: _startGame() を呼ぶ
    // Then: 選択状態がクリアされる
    const state = new GameState();
    const { controller } = setupController(state);
    controller.selectedPiece = { row: 6, col: 4 };
    controller._startGame('pvp');
    expect(controller.selectedPiece).toBeNull();
    expect(controller.validMoves).toEqual([]);
  });

  test('isAIThinking がリセットされる', () => {
    // Given: isAIThinking=true の状態
    // When: _startGame() を呼ぶ
    // Then: isAIThinking=false になる
    const { controller } = setupController(new GameState());
    controller.isAIThinking = true;
    controller._startGame('pvp');
    expect(controller.isAIThinking).toBe(false);
  });
});

describe('newGame()', () => {
  test('isAIThinking が false になる', () => {
    // Given: isAIThinking=true
    // When: newGame() を呼ぶ
    // Then: isAIThinking=false
    const { controller } = setupController(new GameState());
    controller.isAIThinking = true;
    controller.newGame();
    expect(controller.isAIThinking).toBe(false);
  });

  test('_clearSelection が呼ばれ選択状態がクリアされる', () => {
    // Given: 選択状態がある
    // When: newGame() を呼ぶ
    // Then: selectedPiece / selectedHandPiece / validMoves がクリアされる
    const { controller } = setupController(new GameState());
    controller.selectedPiece = { row: 6, col: 4 };
    controller.selectedHandPiece = { type: PieceType.PAWN, player: Player.SENTE };
    controller.newGame();
    expect(controller.selectedPiece).toBeNull();
    expect(controller.selectedHandPiece).toBeNull();
    expect(controller.validMoves).toEqual([]);
  });

  test('AI思考中表示が hidden になる', () => {
    // Given: 思考中表示がある
    // When: newGame() を呼ぶ
    // Then: ai-thinking 要素に hidden クラスが追加される
    const { controller } = setupController(new GameState());
    controller.newGame();
    expect(docElements.get(DOM_SELECTORS.AI_THINKING).classList.add).toHaveBeenCalledWith('hidden');
  });

  test('保留中の AI タイマーがクリアされる', () => {
    // Given: _triggerAIMove でタイマーがセットされている
    // When: newGame() を呼ぶ
    // Then: aiStartTimerId / aiApplyTimerId は null に戻る
    jest.useFakeTimers();
    try {
      const { controller } = setupController(new GameState(), { gameMode: 'ai', humanPlayer: Player.GOTE });
      controller.ai = { getBestMove: () => null };
      controller._triggerAIMove();
      expect(controller.aiStartTimerId).not.toBeNull();
      controller.newGame();
      expect(controller.aiStartTimerId).toBeNull();
      expect(controller.aiApplyTimerId).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('非同期回帰: AI思考中に newGame() を呼んだ場合', () => {
  test('時間経過後も盤面が勝手に更新されない', () => {
    jest.useFakeTimers();
    try {
      const state = new GameState();
      const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.GOTE });
      controller.ai = {
        getBestMove: () => ({
          type: 'move',
          fromRow: 6,
          fromCol: 4,
          toRow: 5,
          toCol: 4,
          promote: false,
        }),
      };

      const beforePiece = state.getPiece(6, 4);
      expect(beforePiece?.type).toBe(PieceType.PAWN);
      expect(state.getPiece(5, 4)).toBeNull();

      controller._triggerAIMove();
      controller.newGame();

      jest.advanceTimersByTime(AI_CONFIG.MOVE_DELAY + AI_CONFIG.MIN_THINK_TIME + 10);

      const afterFrom = state.getPiece(6, 4);
      const afterTo = state.getPiece(5, 4);
      expect(afterFrom?.type).toBe(PieceType.PAWN);
      expect(afterTo).toBeNull();
      expect(controller.isAIThinking).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('_executeAIMove()', () => {
  test('type="move": movePiece が正しい引数で呼ばれる', () => {
    // Given: move.type='move', 移動先が空
    // When: _executeAIMove(move) を呼ぶ
    // Then: state.movePiece が呼ばれ、駒が移動する
    const state = new GameState();
    const { controller } = setupController(state);
    jest.spyOn(controller, '_postMove').mockImplementation(() => {});
    const move = {
      type: 'move',
      fromRow: 6, fromCol: 4,
      toRow: 5, toCol: 4,
      promote: false,
    };
    controller._executeAIMove(move);
    // row6,col4の歩が row5,col4 に移動していることを確認
    expect(state.getPiece(5, 4)).not.toBeNull();
    expect(state.getPiece(5, 4)?.type).toBe(PieceType.PAWN);
    expect(state.getPiece(6, 4)).toBeNull();
    expect(state.lastMove).toEqual({ fromRow: 6, fromCol: 4, toRow: 5, toCol: 4 });
  });

  test('type="move": 移動先に敵駒あり → captured=true で _postMove が呼ばれる', () => {
    // Given: 移動先に後手の歩がある状態を作る
    // When: _executeAIMove で取る手を実行
    // Then: 後手の歩が取られ、captured=true で _postMove が呼ばれる
    const state = new GameState();
    state.board[3][4] = { type: PieceType.PAWN, player: Player.SENTE };
    state.board[2][4] = { type: PieceType.PAWN, player: Player.GOTE };
    const { controller } = setupController(state);
    const postMoveSpy = jest.spyOn(controller, '_postMove').mockImplementation(() => {});
    const move = {
      type: 'move',
      fromRow: 3, fromCol: 4,
      toRow: 2, toCol: 4,
      promote: false,
    };
    controller._executeAIMove(move);
    // 先手の持ち駒に歩が増えているはず
    expect(state.hands[Player.SENTE].pawn).toBeGreaterThan(0);
    expect(postMoveSpy).toHaveBeenCalledWith(true);
  });

  test('type="drop": dropPiece が正しく呼ばれる', () => {
    // Given: 先手が歩を持っている状態
    // When: _executeAIMove で打ち手を実行
    // Then: 指定マスに駒が配置され、captured=false で _postMove が呼ばれる
    const state = new GameState();
    state.hands[Player.SENTE].pawn = 1;
    const { controller } = setupController(state);
    const postMoveSpy = jest.spyOn(controller, '_postMove').mockImplementation(() => {});
    const move = {
      type: 'drop',
      pieceType: PieceType.PAWN,
      toRow: 4, toCol: 4,
    };
    controller._executeAIMove(move);
    expect(state.getPiece(4, 4)).not.toBeNull();
    expect(state.getPiece(4, 4)?.type).toBe(PieceType.PAWN);
    expect(state.hands[Player.SENTE].pawn).toBe(0);
    expect(postMoveSpy).toHaveBeenCalledWith(false);
  });
});

describe('_postMove() - 終了判定とAI自動実行', () => {
  // _checkDeps を差し替えて終了判定を制御する
  const depsContinue = { isInCheck: () => false, isCheckmate: () => false, hasNoLegalMoves: () => false };
  const depsCheckmate = { isInCheck: () => true, isCheckmate: () => true, hasNoLegalMoves: () => true };

  test('ゲームオーバー時は _triggerAIMove が呼ばれない', () => {
    // Given: 詰みになる状態（isCheckmate=true）
    // When: _postMove() を呼ぶ
    // Then: _triggerAIMove は呼ばれない
    const state = new GameState();
    const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.SENTE });
    controller._checkDeps = depsCheckmate;
    const triggerSpy = jest.spyOn(controller, '_triggerAIMove').mockImplementation(() => {});
    // switchTurn 後に SENTE のターン → 詰み → SENTE の負け（GOTE の勝ち）
    state.currentPlayer = Player.GOTE;

    controller._postMove(false);
    expect(state.gameOver).toBe(true);
    expect(state.winner).toBe(Player.GOTE);
    expect(triggerSpy).not.toHaveBeenCalled();
  });

  test('AIターンのとき _triggerAIMove が呼ばれる', () => {
    // Given: ゲーム続行中、AIのターン
    // When: _postMove() を呼ぶ
    // Then: _triggerAIMove が呼ばれる
    const state = new GameState();
    const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.SENTE });
    controller._checkDeps = depsContinue;
    const triggerSpy = jest.spyOn(controller, '_triggerAIMove').mockImplementation(() => {});
    // switchTurn 後に GOTE（=AIのターン）になる
    state.currentPlayer = Player.SENTE;

    controller._postMove(false);
    expect(triggerSpy).toHaveBeenCalled();
  });

  test('人間のターンのとき _triggerAIMove が呼ばれない', () => {
    // Given: ゲーム続行中、人間のターン
    // When: _postMove() を呼ぶ
    // Then: _triggerAIMove は呼ばれない
    const state = new GameState();
    const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.SENTE });
    controller._checkDeps = depsContinue;
    const triggerSpy = jest.spyOn(controller, '_triggerAIMove').mockImplementation(() => {});
    // switchTurn 後に SENTE（=人間のターン）になる
    state.currentPlayer = Player.GOTE;

    controller._postMove(false);
    expect(triggerSpy).not.toHaveBeenCalled();
  });

  test('pvpモードでは _triggerAIMove が呼ばれない', () => {
    // Given: gameMode='pvp'
    // When: _postMove() を呼ぶ
    // Then: _triggerAIMove は呼ばれない
    const state = new GameState();
    const { controller } = setupController(state, { gameMode: 'pvp', humanPlayer: null });
    controller._checkDeps = depsContinue;
    const triggerSpy = jest.spyOn(controller, '_triggerAIMove').mockImplementation(() => {});

    controller._postMove(false);
    expect(triggerSpy).not.toHaveBeenCalled();
  });

  test('王手されていない合法手なしの局面で対局が終了し手番側が負けになる（本体コード・実局面）', () => {
    // Given: 先手玉(8,4)は王手されていないが全ての移動先が後手駒の利きに覆われる
    // When: _postMove(false) を呼ぶ（switchTurn 後に先手の手番になる）
    // Then: gameOver=true, winner=GOTE
    const state = createStalemateState();
    state.currentPlayer = Player.GOTE; // switchTurn 後に先手の手番になる
    const { controller } = setupController(state);
    controller._postMove(false);

    expect(state.gameOver).toBe(true);
    expect(state.winner).toBe(Player.GOTE);
    expect(state.inCheck).toBe(false);
  });

  test('合法手が残っている通常の手では対局は終了しない（本体コード・実局面）', () => {
    // Given: 初期盤面で後手の手番（switchTurn 後に先手）
    // When: _postMove(false) を呼ぶ
    // Then: gameOver=false
    const state = new GameState();
    state.currentPlayer = Player.GOTE;
    const { controller } = setupController(state);
    controller._postMove(false);

    expect(state.gameOver).toBe(false);
    expect(state.winner).toBeNull();
  });

  test('王手されていないが合法手がない局面では AI タイマーは起動しない', () => {
    // Given: ステイルメイト相当局面（AIモード・AIは先手）
    // When: _postMove(false) を呼ぶ
    // Then: gameOver=true になり、_triggerAIMove は呼ばれない
    const state = createStalemateState();
    state.currentPlayer = Player.GOTE;
    const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.GOTE });
    const triggerSpy = jest.spyOn(controller, '_triggerAIMove').mockImplementation(() => {});

    controller._postMove(false);

    expect(state.gameOver).toBe(true);
    expect(triggerSpy).not.toHaveBeenCalled();
  });
});

describe('_handleBoardClick() - ガード条件', () => {
  test('AI思考中は処理を中断する', () => {
    // Given: isAIThinking=true
    // When: _handleBoardClick を呼ぶ
    // Then: _selectBoardPiece は呼ばれない
    const state = new GameState();
    const { controller } = setupController(state);
    const selectSpy = jest.spyOn(controller, '_selectBoardPiece');
    controller.isAIThinking = true;
    controller._handleBoardClick(6, 4);
    expect(selectSpy).not.toHaveBeenCalled();
  });

  test('AIターン中は処理を中断する', () => {
    // Given: gameMode='ai' かつ AIの手番
    // When: _handleBoardClick を呼ぶ
    // Then: _selectBoardPiece は呼ばれない
    const state = new GameState();
    state.currentPlayer = Player.GOTE;
    const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.SENTE });
    const selectSpy = jest.spyOn(controller, '_selectBoardPiece');
    controller._handleBoardClick(2, 4); // 後手の歩
    expect(selectSpy).not.toHaveBeenCalled();
  });

  test('ゲームオーバー時は処理を中断する', () => {
    // Given: state.gameOver=true
    // When: _handleBoardClick を呼ぶ
    // Then: _selectBoardPiece は呼ばれない
    const state = new GameState();
    state.gameOver = true;
    const { controller } = setupController(state);
    const selectSpy = jest.spyOn(controller, '_selectBoardPiece');
    controller._handleBoardClick(6, 4);
    expect(selectSpy).not.toHaveBeenCalled();
  });

  test('人間の手番では自駒を選択できる', () => {
    // Given: 通常の手番
    // When: _handleBoardClick で先手の歩をクリック
    // Then: _selectBoardPiece が呼ばれる
    const state = new GameState();
    const { controller } = setupController(state);
    const selectSpy = jest.spyOn(controller, '_selectBoardPiece');
    controller._handleBoardClick(6, 4);
    expect(selectSpy).toHaveBeenCalledWith(6, 4);
  });
});

describe('_handleHandClick() - ガード条件', () => {
  test('AI思考中は処理を中断する', () => {
    // Given: isAIThinking=true
    // When: _handleHandClick を呼ぶ
    // Then: _clearSelection は呼ばれない
    const state = new GameState();
    const { controller } = setupController(state);
    const clearSpy = jest.spyOn(controller, '_clearSelection');
    controller.isAIThinking = true;
    controller._handleHandClick(PieceType.PAWN, Player.SENTE);
    expect(clearSpy).not.toHaveBeenCalled();
  });

  test('AIターン中は処理を中断する', () => {
    // Given: gameMode='ai' かつ AIの手番
    // When: _handleHandClick を呼ぶ
    // Then: _clearSelection は呼ばれない
    const state = new GameState();
    state.currentPlayer = Player.GOTE;
    const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.SENTE });
    const clearSpy = jest.spyOn(controller, '_clearSelection');
    controller._handleHandClick(PieceType.PAWN, Player.GOTE);
    expect(clearSpy).not.toHaveBeenCalled();
  });

  test('相手プレイヤーの持ち駒は処理を中断する', () => {
    // Given: currentPlayer=SENTE、クリックは GOTE の持ち駒
    // When: _handleHandClick を呼ぶ
    // Then: _clearSelection は呼ばれない
    const state = new GameState();
    const { controller } = setupController(state);
    const clearSpy = jest.spyOn(controller, '_clearSelection');
    controller._handleHandClick(PieceType.PAWN, Player.GOTE);
    expect(clearSpy).not.toHaveBeenCalled();
  });

  test('人間の手番では持ち駒を選択できる', () => {
    // Given: 先手の歩の持ち駒がある
    // When: _handleHandClick を呼ぶ
    // Then: selectedHandPiece に設定される
    const state = new GameState();
    state.hands[Player.SENTE].pawn = 1;
    const { controller } = setupController(state);
    controller._handleHandClick(PieceType.PAWN, Player.SENTE);
    expect(controller.selectedHandPiece).toEqual({ type: PieceType.PAWN, player: Player.SENTE });
  });
});

describe('_showThinking() - AI思考中表示', () => {
  test('show=true のとき hidden クラスが除去される', () => {
    // Given: UIController
    // When: _showThinking(true) を呼ぶ
    // Then: ai-thinking 要素から hidden が除去される
    const { controller } = setupController(new GameState());
    controller._showThinking(true);
    expect(docElements.get(DOM_SELECTORS.AI_THINKING).classList.remove).toHaveBeenCalledWith('hidden');
  });

  test('show=false のとき hidden クラスが追加される', () => {
    // Given: UIController
    // When: _showThinking(false) を呼ぶ
    // Then: ai-thinking 要素に hidden が追加される
    const { controller } = setupController(new GameState());
    controller._showThinking(false);
    expect(docElements.get(DOM_SELECTORS.AI_THINKING).classList.add).toHaveBeenCalledWith('hidden');
  });
});

describe('_triggerAIMove() - 最善手なし', () => {
  test('getBestMove が null を返す場合 isAIThinking が false に戻る', () => {
    // Given: getBestMove が null を返す AI
    // When: _triggerAIMove を呼び MOVE_DELAY 経過させる
    // Then: isAIThinking=false, 思考中表示は hidden
    jest.useFakeTimers();
    try {
      const state = new GameState();
      const { controller } = setupController(state, { gameMode: 'ai', humanPlayer: Player.SENTE });
      controller.ai = { getBestMove: () => null };
      controller._triggerAIMove();
      expect(controller.isAIThinking).toBe(true);
      jest.advanceTimersByTime(AI_CONFIG.MOVE_DELAY);
      expect(controller.isAIThinking).toBe(false);
      expect(docElements.get(DOM_SELECTORS.AI_THINKING).classList.add).toHaveBeenCalledWith('hidden');
    } finally {
      jest.useRealTimers();
    }
  });

  test('AI が未設定の場合は思考フラグが立たない', () => {
    // Given: controller.ai = null
    // When: _triggerAIMove を呼ぶ
    // Then: isAIThinking は false のまま
    const { controller } = setupController(new GameState());
    controller.ai = null;
    controller._triggerAIMove();
    expect(controller.isAIThinking).toBe(false);
  });
});

describe('AI_CONFIG の定数確認', () => {
  test('MIN_THINK_TIME が正の数である', () => {
    // Given: config.js の AI_CONFIG
    // When: MIN_THINK_TIME を参照する
    // Then: 正の数値
    expect(AI_CONFIG.MIN_THINK_TIME).toBeGreaterThan(0);
  });

  test('MOVE_DELAY が 0 以上である', () => {
    // Given: config.js の AI_CONFIG
    // When: MOVE_DELAY を参照する
    // Then: 0 以上
    expect(AI_CONFIG.MOVE_DELAY).toBeGreaterThanOrEqual(0);
  });

  test('DEFAULT_DEPTH が 1 以上である', () => {
    // Given: config.js の AI_CONFIG
    // When: DEFAULT_DEPTH を参照する
    // Then: 1 以上（0 では意味のある探索にならない）
    expect(AI_CONFIG.DEFAULT_DEPTH).toBeGreaterThanOrEqual(1);
  });
});
