import { Player } from './pieces.js';
import { getLegalMoves, getLegalDrops, getPromotionStatus, isInCheck, isCheckmate } from './moves.js';
import { playMove, playCapture, playCheck, playCheckmate } from './sound.js';
import { DOM_SELECTORS, UI_TEXT } from './config.js';

export class UIController {
  constructor(gameState, renderer) {
    this.state = gameState;
    this.renderer = renderer;

    // 選択状態
    this.selectedPiece = null;      // { row, col }
    this.selectedHandPiece = null;  // { type, player }
    this.validMoves = [];

    this._bindEvents();
  }

  _bindEvents() {
    // 盤面クリック
    this.renderer.boardEl.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (!cell) return;
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      this._handleBoardClick(row, col);
    });

    // 持ち駒クリック
    document.querySelectorAll(DOM_SELECTORS.HAND_PIECES).forEach(container => {
      container.addEventListener('click', (e) => {
        const el = e.target.closest('.hand-piece');
        if (!el) return;
        this._handleHandClick(el.dataset.pieceType, el.dataset.player);
      });
    });

    // 新しい対局ボタン
    document.getElementById(DOM_SELECTORS.NEW_GAME_BTN).addEventListener('click', () => this.newGame());
    document.getElementById(DOM_SELECTORS.GAMEOVER_NEW_GAME).addEventListener('click', () => {
      document.getElementById(DOM_SELECTORS.GAMEOVER_DIALOG).classList.add('hidden');
      this.newGame();
    });
  }

  _handleBoardClick(row, col) {
    if (this.state.gameOver) return;

    const piece = this.state.getPiece(row, col);

    // 持ち駒が選択されている場合
    if (this.selectedHandPiece) {
      if (!piece && this.validMoves.some(m => m.row === row && m.col === col)) {
        this._executeDrop(this.selectedHandPiece.type, row, col);
      } else {
        this._clearSelection();
        if (piece && piece.player === this.state.currentPlayer) {
          this._selectBoardPiece(row, col);
        }
      }
      return;
    }

    // 盤上の駒が選択されている場合
    if (this.selectedPiece) {
      if (this.validMoves.some(m => m.row === row && m.col === col)) {
        this._executeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
        return;
      }
      if (piece && piece.player === this.state.currentPlayer) {
        this._clearSelection();
        this._selectBoardPiece(row, col);
        return;
      }
      this._clearSelection();
      return;
    }

    // 何も選択されていない場合
    if (piece && piece.player === this.state.currentPlayer) {
      this._selectBoardPiece(row, col);
    }
  }

  _handleHandClick(pieceType, player) {
    if (this.state.gameOver) return;
    if (player !== this.state.currentPlayer) return;

    this._clearSelection();
    this.selectedHandPiece = { type: pieceType, player };
    this.validMoves = getLegalDrops(this.state, player, pieceType);

    // 持ち駒のハイライト
    document.querySelectorAll(DOM_SELECTORS.HAND_PIECE).forEach(el => el.classList.remove('selected'));
    const handPieces = document.querySelectorAll(`${DOM_SELECTORS.HAND_PIECE}[data-piece-type="${pieceType}"][data-player="${player}"]`);
    handPieces.forEach(el => el.classList.add('selected'));

    this.renderer.highlightMoves(this.validMoves, this.state);
  }

  _selectBoardPiece(row, col) {
    this.selectedPiece = { row, col };
    this.validMoves = getLegalMoves(this.state, row, col);
    this.renderer.highlightSelected(row, col);
    this.renderer.highlightMoves(this.validMoves, this.state);
  }

  _executeMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.state.getPiece(fromRow, fromCol);
    const captured = this.state.getPiece(toRow, toCol);
    const promoStatus = getPromotionStatus(piece, fromRow, toRow);

    if (promoStatus === 'mandatory') {
      this.state.movePiece(fromRow, fromCol, toRow, toCol, true);
      this._clearSelection();
      this._postMove(!!captured);
    } else if (promoStatus === 'optional') {
      this._showPromotionDialog((promote) => {
        this.state.movePiece(fromRow, fromCol, toRow, toCol, promote);
        this._clearSelection();
        this._postMove(!!captured);
      });
    } else {
      this.state.movePiece(fromRow, fromCol, toRow, toCol, false);
      this._clearSelection();
      this._postMove(!!captured);
    }
  }

  _executeDrop(pieceType, toRow, toCol) {
    this.state.dropPiece(pieceType, toRow, toCol, this.state.currentPlayer);
    this._clearSelection();
    this._postMove(false);
  }

  _postMove(captured) {
    this.state.switchTurn();

    // 王手チェック
    const inCheck = isInCheck(this.state, this.state.currentPlayer);
    this.state.inCheck = inCheck;

    // 詰みチェック
    if (inCheck && isCheckmate(this.state)) {
      this.state.gameOver = true;
      this.state.winner = this.state.opponent(this.state.currentPlayer);
    }

    // 効果音
    if (this.state.gameOver) {
      playCheckmate();
    } else if (inCheck) {
      playCheck();
    } else if (captured) {
      playCapture();
    } else {
      playMove();
    }

    this._updateDisplay();

    if (this.state.gameOver) {
      this._showGameOverDialog();
    }
  }

  _updateDisplay() {
    this.renderer.render(this.state);
    this.renderer.renderHands(this.state);

    // ステータス更新
    const statusEl = document.getElementById(DOM_SELECTORS.STATUS);
    const playerName = this.state.currentPlayer === Player.SENTE ? UI_TEXT.SENTE_NAME : UI_TEXT.GOTE_NAME;

    if (this.state.gameOver) {
      const winnerName = this.state.winner === Player.SENTE ? UI_TEXT.SENTE_NAME : UI_TEXT.GOTE_NAME;
      statusEl.textContent = `${winnerName}${UI_TEXT.WIN_SUFFIX}`;
      statusEl.classList.remove('check');
    } else if (this.state.inCheck) {
      statusEl.textContent = `${playerName}${UI_TEXT.CHECK_SUFFIX}`;
      statusEl.classList.add('check');
    } else {
      statusEl.textContent = `${playerName}${UI_TEXT.TURN_SUFFIX}`;
      statusEl.classList.remove('check');
    }
  }

  _showPromotionDialog(callback) {
    const dialog = document.getElementById(DOM_SELECTORS.PROMOTION_DIALOG);
    dialog.classList.remove('hidden');

    const yesBtn = document.getElementById(DOM_SELECTORS.PROMOTE_YES);
    const noBtn = document.getElementById(DOM_SELECTORS.PROMOTE_NO);

    const onYes = () => {
      cleanup();
      callback(true);
    };
    const onNo = () => {
      cleanup();
      callback(false);
    };
    const cleanup = () => {
      dialog.classList.add('hidden');
      yesBtn.removeEventListener('click', onYes);
      noBtn.removeEventListener('click', onNo);
    };

    yesBtn.addEventListener('click', onYes);
    noBtn.addEventListener('click', onNo);
  }

  _showGameOverDialog() {
    const winnerName = this.state.winner === Player.SENTE ? UI_TEXT.SENTE_NAME : UI_TEXT.GOTE_NAME;
    document.getElementById(DOM_SELECTORS.GAMEOVER_MESSAGE).textContent = `${winnerName}${UI_TEXT.WIN_SUFFIX}`;
    document.getElementById(DOM_SELECTORS.GAMEOVER_DIALOG).classList.remove('hidden');
  }

  _clearSelection() {
    this.selectedPiece = null;
    this.selectedHandPiece = null;
    this.validMoves = [];
    this.renderer.clearHighlights();
    document.querySelectorAll(DOM_SELECTORS.HAND_PIECE).forEach(el => el.classList.remove('selected'));
  }

  newGame() {
    this.state.reset();
    this._clearSelection();
    this._updateDisplay();
  }

  init() {
    this._updateDisplay();
  }
}
