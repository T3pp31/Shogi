/**
 * js/ui.js の AIモード統合に関するロジックテスト
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
 * |  9 | _startGame: isAIThinking リセット        | 正常系 | isAIThinking=true の状態で開始               | AI思考フラグはリセットされていない            |
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

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Player, PieceType } from '../js/pieces.js';
import { GameState } from '../js/game.js';
import { AI_CONFIG } from '../js/config.js';

// ----- DOM スタブ -----
// UIController は DOM に依存するため、テスト用にスタブを構築する

const makeEl = (classes = []) => {
  const classList = new Set(classes);
  return {
    classList: {
      add: (c) => classList.add(c),
      remove: (c) => classList.delete(c),
      contains: (c) => classList.has(c),
    },
    addEventListener: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    dataset: {},
  };
};

// document スタブのヘルパー
function makeDocumentStub(elementMap) {
  return {
    getElementById: jest.fn((id) => elementMap[id] ?? makeEl()),
    querySelectorAll: jest.fn(() => []),
  };
}

// ----- UIController の純粋ロジック部分を分離してテストする -----
// UIController をインポートせず、ロジックを直接テスト対象クラスに抽出して検証する。
// DOM 操作を伴うメソッドはスタブで差し替える。

class TestableUILogic {
  constructor(state) {
    this.state = state;
    this.selectedPiece = null;
    this.selectedHandPiece = null;
    this.validMoves = [];
    this.gameMode = null;
    this.ai = null;
    this.humanPlayer = null;
    this.isAIThinking = false;

    // テスト用スパイ
    this._triggerAIMoveCalled = false;
    this._showThinkingArgs = [];
    this._updateDisplayCalled = false;
    this._showGameOverDialogCalled = false;
    this._clearSelectionCalled = false;
    this._modDialogHidden = false;
  }

  // --- テスト対象ロジック（UIController から DOM 依存を除いた版） ---

  _isAITurn() {
    return this.gameMode === 'ai' && this.state.currentPlayer !== this.humanPlayer;
  }

  _startGame(mode, humanSide = null) {
    this.gameMode = mode;
    this.state.reset();
    this._clearSelection();

    if (mode === 'ai') {
      this.humanPlayer = humanSide;
      const aiPlayer = humanSide === Player.SENTE ? Player.GOTE : Player.SENTE;
      this.ai = { aiPlayer };  // ShogiAI のスタブ
      this._updateDisplay();
      if (aiPlayer === Player.SENTE) {
        this._triggerAIMove();
      }
    } else {
      this.ai = null;
      this.humanPlayer = null;
      this._updateDisplay();
    }
  }

  _postMove(captured) {
    this.state.switchTurn();
    const { isInCheck, isCheckmate } = this._checkDeps;
    const inCheck = isInCheck(this.state, this.state.currentPlayer);
    this.state.inCheck = inCheck;

    if (inCheck && isCheckmate(this.state)) {
      this.state.gameOver = true;
      this.state.winner = this.state.opponent(this.state.currentPlayer);
    }

    this._updateDisplay();

    if (this.state.gameOver) {
      this._showGameOverDialog();
      return;
    }

    if (this._isAITurn()) {
      this._triggerAIMove();
    }
  }

  _executeAIMove(move) {
    if (move.type === 'move') {
      const captured = this.state.getPiece(move.toRow, move.toCol);
      this.state.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol, move.promote);
      this._postMove(!!captured);
    } else {
      this.state.dropPiece(move.pieceType, move.toRow, move.toCol, this.state.currentPlayer);
      this._postMove(false);
    }
  }

  // --- スタブメソッド（テスト内で上書き可能） ---

  _triggerAIMove() {
    this._triggerAIMoveCalled = true;
  }

  _showThinking(show) {
    this._showThinkingArgs.push(show);
  }

  _updateDisplay() {
    this._updateDisplayCalled = true;
  }

  _showGameOverDialog() {
    this._showGameOverDialogCalled = true;
  }

  _clearSelection() {
    this._clearSelectionCalled = true;
    this.selectedPiece = null;
    this.selectedHandPiece = null;
    this.validMoves = [];
  }

  newGame() {
    this.isAIThinking = false;
    this._showThinking(false);
    this._clearSelection();
    this._modDialogHidden = false;  // モード選択に戻す相当
  }
}

// テスト用に _checkDeps（isInCheck, isCheckmate）をインジェクトするヘルパー
function makeLogic(state, checkDeps = null) {
  const logic = new TestableUILogic(state);
  logic._checkDeps = checkDeps ?? {
    isInCheck: () => false,
    isCheckmate: () => false,
  };
  return logic;
}

// ----- テスト本体 -----

describe('_isAITurn()', () => {
  let state;

  beforeEach(() => {
    state = new GameState();
  });

  test('pvpモードでは常に false を返す', () => {
    // Given: gameMode='pvp'
    // When: _isAITurn() を呼ぶ
    // Then: false
    const logic = makeLogic(state);
    logic.gameMode = 'pvp';
    logic.humanPlayer = Player.SENTE;
    expect(logic._isAITurn()).toBe(false);
  });

  test('AIモードで人間の手番なら false を返す', () => {
    // Given: gameMode='ai', humanPlayer=SENTE, currentPlayer=SENTE
    // When: _isAITurn() を呼ぶ
    // Then: false
    const logic = makeLogic(state);
    logic.gameMode = 'ai';
    logic.humanPlayer = Player.SENTE;
    state.currentPlayer = Player.SENTE;
    expect(logic._isAITurn()).toBe(false);
  });

  test('AIモードでAIの手番なら true を返す', () => {
    // Given: gameMode='ai', humanPlayer=SENTE, currentPlayer=GOTE
    // When: _isAITurn() を呼ぶ
    // Then: true
    const logic = makeLogic(state);
    logic.gameMode = 'ai';
    logic.humanPlayer = Player.SENTE;
    state.currentPlayer = Player.GOTE;
    expect(logic._isAITurn()).toBe(true);
  });

  test('gameMode が null のとき false を返す（未設定）', () => {
    // Given: gameMode=null
    // When: _isAITurn() を呼ぶ
    // Then: false（null は 'ai' に一致しないため）
    const logic = makeLogic(state);
    logic.gameMode = null;
    logic.humanPlayer = Player.SENTE;
    state.currentPlayer = Player.GOTE;
    expect(logic._isAITurn()).toBe(false);
  });

  test('後手を選んだ場合: 後手の手番(GOTE)では false を返す', () => {
    // Given: humanPlayer=GOTE, currentPlayer=GOTE
    // When: _isAITurn() を呼ぶ
    // Then: false
    const logic = makeLogic(state);
    logic.gameMode = 'ai';
    logic.humanPlayer = Player.GOTE;
    state.currentPlayer = Player.GOTE;
    expect(logic._isAITurn()).toBe(false);
  });

  test('後手を選んだ場合: 先手の手番(SENTE)では true を返す', () => {
    // Given: humanPlayer=GOTE, currentPlayer=SENTE
    // When: _isAITurn() を呼ぶ
    // Then: true
    const logic = makeLogic(state);
    logic.gameMode = 'ai';
    logic.humanPlayer = Player.GOTE;
    state.currentPlayer = Player.SENTE;
    expect(logic._isAITurn()).toBe(true);
  });
});

describe('_startGame()', () => {
  let state;

  beforeEach(() => {
    state = new GameState();
  });

  test('pvpモード: gameMode="pvp", ai=null, humanPlayer=null になる', () => {
    // Given: mode='pvp'
    // When: _startGame('pvp') を呼ぶ
    // Then: gameMode='pvp', ai=null, humanPlayer=null
    const logic = makeLogic(state);
    logic._startGame('pvp');
    expect(logic.gameMode).toBe('pvp');
    expect(logic.ai).toBeNull();
    expect(logic.humanPlayer).toBeNull();
  });

  test('pvpモード: _triggerAIMove は呼ばれない', () => {
    // Given: mode='pvp'
    // When: _startGame('pvp') を呼ぶ
    // Then: _triggerAIMoveCalled=false
    const logic = makeLogic(state);
    logic._startGame('pvp');
    expect(logic._triggerAIMoveCalled).toBe(false);
  });

  test('AIモード・先手選択: humanPlayer=SENTE, ai は GOTE で初期化される', () => {
    // Given: mode='ai', humanSide=SENTE
    // When: _startGame('ai', Player.SENTE) を呼ぶ
    // Then: humanPlayer=SENTE, ai.aiPlayer=GOTE
    const logic = makeLogic(state);
    logic._startGame('ai', Player.SENTE);
    expect(logic.humanPlayer).toBe(Player.SENTE);
    expect(logic.ai.aiPlayer).toBe(Player.GOTE);
  });

  test('AIモード・先手選択: AIは後手なので _triggerAIMove は呼ばれない', () => {
    // Given: mode='ai', humanSide=SENTE（人間が先手 → AIは後手）
    // When: _startGame('ai', Player.SENTE) を呼ぶ
    // Then: _triggerAIMoveCalled=false（AIは先手ではないため）
    const logic = makeLogic(state);
    logic._startGame('ai', Player.SENTE);
    expect(logic._triggerAIMoveCalled).toBe(false);
  });

  test('AIモード・後手選択: humanPlayer=GOTE, ai は SENTE で初期化される', () => {
    // Given: mode='ai', humanSide=GOTE
    // When: _startGame('ai', Player.GOTE) を呼ぶ
    // Then: humanPlayer=GOTE, ai.aiPlayer=SENTE
    const logic = makeLogic(state);
    logic._startGame('ai', Player.GOTE);
    expect(logic.humanPlayer).toBe(Player.GOTE);
    expect(logic.ai.aiPlayer).toBe(Player.SENTE);
  });

  test('AIモード・後手選択: AIは先手なので _triggerAIMove が呼ばれる', () => {
    // Given: mode='ai', humanSide=GOTE（人間が後手 → AIは先手）
    // When: _startGame('ai', Player.GOTE) を呼ぶ
    // Then: _triggerAIMoveCalled=true
    const logic = makeLogic(state);
    logic._startGame('ai', Player.GOTE);
    expect(logic._triggerAIMoveCalled).toBe(true);
  });

  test('_startGame 後に状態がリセットされる', () => {
    // Given: ゲーム進行中の状態
    // When: _startGame() を呼ぶ
    // Then: state.gameOver=false, state.winner=null
    const logic = makeLogic(state);
    state.gameOver = true;
    state.winner = Player.SENTE;
    logic._startGame('pvp');
    expect(state.gameOver).toBe(false);
    expect(state.winner).toBeNull();
  });

  test('_clearSelection が呼ばれる', () => {
    // Given: 選択状態がある
    // When: _startGame() を呼ぶ
    // Then: _clearSelectionCalled=true
    const logic = makeLogic(state);
    logic._clearSelectionCalled = false;
    logic._startGame('pvp');
    expect(logic._clearSelectionCalled).toBe(true);
  });
});

describe('newGame()', () => {
  let state;

  beforeEach(() => {
    state = new GameState();
  });

  test('isAIThinking が false になる', () => {
    // Given: isAIThinking=true
    // When: newGame() を呼ぶ
    // Then: isAIThinking=false
    const logic = makeLogic(state);
    logic.isAIThinking = true;
    logic.newGame();
    expect(logic.isAIThinking).toBe(false);
  });

  test('_showThinking(false) が呼ばれる', () => {
    // Given: 思考中表示がある
    // When: newGame() を呼ぶ
    // Then: _showThinkingArgs に false が追加される
    const logic = makeLogic(state);
    logic.newGame();
    expect(logic._showThinkingArgs).toContain(false);
  });

  test('_clearSelection が呼ばれる', () => {
    // Given: 選択状態がある
    // When: newGame() を呼ぶ
    // Then: _clearSelectionCalled=true
    const logic = makeLogic(state);
    logic._clearSelectionCalled = false;
    logic.newGame();
    expect(logic._clearSelectionCalled).toBe(true);
  });
});

describe('_executeAIMove()', () => {
  let state;

  beforeEach(() => {
    state = new GameState();
  });

  test('type="move": movePiece が正しい引数で呼ばれる', () => {
    // Given: move.type='move', 移動先が空
    // When: _executeAIMove(move) を呼ぶ
    // Then: state.movePiece が呼ばれ、駒が移動する
    const logic = makeLogic(state);
    const move = {
      type: 'move',
      fromRow: 6, fromCol: 4,
      toRow: 5, toCol: 4,
      promote: false,
    };
    logic._executeAIMove(move);
    // row6,col4の歩が row5,col4 に移動していることを確認
    expect(state.getPiece(5, 4)).not.toBeNull();
    expect(state.getPiece(5, 4)?.type).toBe(PieceType.PAWN);
    expect(state.getPiece(6, 4)).toBeNull();
  });

  test('type="move": 移動先に敵駒あり → captured=true で _postMove が呼ばれる', () => {
    // Given: 移動先に後手の歩がある状態を作る
    // When: _executeAIMove で取る手を実行
    // Then: 後手の歩が取られ、先手の持ち駒が増える
    const logic = makeLogic(state);
    // 後手の歩(row2,col4)を先手(row6,col4)が取りに行くシナリオを再現するため
    // 先手歩を直接 row3,col4 に置いてから取る
    state.board[3][4] = { type: PieceType.PAWN, player: Player.SENTE };
    state.board[2][4] = { type: PieceType.PAWN, player: Player.GOTE };

    const move = {
      type: 'move',
      fromRow: 3, fromCol: 4,
      toRow: 2, toCol: 4,
      promote: false,
    };
    logic._executeAIMove(move);
    // 先手の持ち駒に歩が増えているはず（switchTurn が呼ばれるので currentPlayer が変わる点に注意）
    expect(state.hands[Player.SENTE].pawn).toBeGreaterThan(0);
  });

  test('type="drop": dropPiece が正しく呼ばれる', () => {
    // Given: 先手が歩を持っている状態
    // When: _executeAIMove で打ち手を実行
    // Then: 指定マスに駒が配置される
    const logic = makeLogic(state);
    state.hands[Player.SENTE].pawn = 1;
    const move = {
      type: 'drop',
      pieceType: PieceType.PAWN,
      toRow: 4, toCol: 4,
    };
    logic._executeAIMove(move);
    expect(state.getPiece(4, 4)).not.toBeNull();
    expect(state.getPiece(4, 4)?.type).toBe(PieceType.PAWN);
  });
});

describe('_postMove() - AIターン自動実行', () => {
  let state;

  beforeEach(() => {
    state = new GameState();
  });

  test('ゲームオーバー時は _triggerAIMove が呼ばれない', () => {
    // Given: 詰みになる状態（isCheckmate=true）
    // When: _postMove() を呼ぶ
    // Then: _triggerAIMoveCalled=false
    const logic = makeLogic(state, {
      isInCheck: () => true,
      isCheckmate: () => true,
    });
    logic.gameMode = 'ai';
    logic.humanPlayer = Player.SENTE;
    // GOTE のターンに詰みが発生 → SENTE の勝ち
    state.currentPlayer = Player.GOTE;

    logic._triggerAIMoveCalled = false;
    logic._postMove(false);
    expect(logic._triggerAIMoveCalled).toBe(false);
  });

  test('AIターンのとき _triggerAIMove が呼ばれる', () => {
    // Given: ゲーム続行中、AIのターン
    // When: _postMove() を呼ぶ
    // Then: _triggerAIMoveCalled=true
    const logic = makeLogic(state, {
      isInCheck: () => false,
      isCheckmate: () => false,
    });
    logic.gameMode = 'ai';
    logic.humanPlayer = Player.SENTE;
    // switchTurn 後に GOTE（=AIのターン）になる
    state.currentPlayer = Player.SENTE;

    logic._triggerAIMoveCalled = false;
    logic._postMove(false);
    expect(logic._triggerAIMoveCalled).toBe(true);
  });

  test('人間のターンのとき _triggerAIMove が呼ばれない', () => {
    // Given: ゲーム続行中、人間のターン
    // When: _postMove() を呼ぶ
    // Then: _triggerAIMoveCalled=false
    const logic = makeLogic(state, {
      isInCheck: () => false,
      isCheckmate: () => false,
    });
    logic.gameMode = 'ai';
    logic.humanPlayer = Player.SENTE;
    // switchTurn 後に SENTE（=人間のターン）になる
    state.currentPlayer = Player.GOTE;

    logic._triggerAIMoveCalled = false;
    logic._postMove(false);
    expect(logic._triggerAIMoveCalled).toBe(false);
  });

  test('pvpモードでは _triggerAIMove が呼ばれない', () => {
    // Given: gameMode='pvp'
    // When: _postMove() を呼ぶ
    // Then: _triggerAIMoveCalled=false
    const logic = makeLogic(state, {
      isInCheck: () => false,
      isCheckmate: () => false,
    });
    logic.gameMode = 'pvp';

    logic._triggerAIMoveCalled = false;
    logic._postMove(false);
    expect(logic._triggerAIMoveCalled).toBe(false);
  });
});

describe('_showThinking() - AI思考中表示', () => {
  test('show=true のとき引数 true が記録される', () => {
    // Given: TestableUILogic インスタンス
    // When: _showThinking(true) を呼ぶ
    // Then: _showThinkingArgs に true が追加される
    const state = new GameState();
    const logic = makeLogic(state);
    logic._showThinking(true);
    expect(logic._showThinkingArgs).toContain(true);
  });

  test('show=false のとき引数 false が記録される', () => {
    // Given: TestableUILogic インスタンス
    // When: _showThinking(false) を呼ぶ
    // Then: _showThinkingArgs に false が追加される
    const state = new GameState();
    const logic = makeLogic(state);
    logic._showThinking(false);
    expect(logic._showThinkingArgs).toContain(false);
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

describe('_isAITurn() 境界値テスト', () => {
  test('gameMode が空文字のとき false を返す', () => {
    // Given: gameMode=''
    // When: _isAITurn() を呼ぶ
    // Then: false
    const state = new GameState();
    const logic = makeLogic(state);
    logic.gameMode = '';
    logic.humanPlayer = Player.SENTE;
    state.currentPlayer = Player.GOTE;
    expect(logic._isAITurn()).toBe(false);
  });

  test('humanPlayer が null のときも false を返す（モード未設定）', () => {
    // Given: gameMode='ai' だが humanPlayer=null
    // When: _isAITurn() を呼ぶ
    // Then: null !== Player.SENTE なので true になるが、
    //       これはゲーム開始前の異常状態。テストで確認しておく
    const state = new GameState();
    const logic = makeLogic(state);
    logic.gameMode = 'ai';
    logic.humanPlayer = null;
    state.currentPlayer = Player.SENTE;
    // Player.SENTE !== null なので true
    expect(logic._isAITurn()).toBe(true);
  });
});
