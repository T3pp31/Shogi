/**
 * js/sound.js のテスト
 *
 * テスト観点の表（等価分割・境界値）
 *
 * | #  | 観点                                          | 分類   | 入力値/条件                          | 期待結果                                        |
 * |----|-----------------------------------------------|--------|--------------------------------------|-------------------------------------------------|
 * |  1 | AudioContext の遅延生成                        | 正常系 | playMove を初回呼び出し              | AudioContext が 1 つ生成される                  |
 * |  2 | suspended な AudioContext の resume            | 異常系 | state='suspended' で生成             | resume() が呼ばれる                             |
 * |  3 | running な AudioContext は resume しない        | 境界値 | state='running' で生成               | resume() は呼ばれない                           |
 * |  4 | 同一コンテキストの再利用                        | 正常系 | 複数の play 関数を連続呼び出し       | AudioContext は 1 つだけ生成される              |
 * |  5 | 全 play 関数が resume パスを通る                | 正常系 | playMove/playCapture/playCheck/playCheckmate | 各関数とも例外なく動作し resume が呼ばれる |
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { SOUND_CONFIG } from '../js/config.js';

class MockAudioContext {
  constructor() {
    this.state = 'suspended';
    this.currentTime = 0.5;
    this.sampleRate = 44100;
    this.destination = {};
    this.resume = jest.fn(() => {
      this.state = 'running';
      return Promise.resolve();
    });
    this.createBuffer = jest.fn((_channels, length, _sampleRate) => ({
      getChannelData: () => new Float32Array(length),
    }));
  }

  createBufferSource() {
    return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} };
  }

  createBiquadFilter() {
    return {
      type: '',
      frequency: { setValueAtTime: () => {} },
      Q: { setValueAtTime: () => {} },
      connect: () => {},
    };
  }

  createGain() {
    return {
      gain: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
      },
      connect: () => {},
    };
  }

  createOscillator() {
    return {
      type: '',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }
}

// モックの AudioContext を window に設定し、生成インスタンスを記録する
function installWindow(initialState = 'suspended') {
  const created = [];
  class TrackedAudioContext extends MockAudioContext {
    constructor() {
      super();
      this.state = initialState;
      created.push(this);
    }
  }
  globalThis.window = { AudioContext: TrackedAudioContext };
  return created;
}

async function loadSoundModule() {
  return await import('../js/sound.js');
}

describe('sound.js - AudioContext の resume', () => {
  let created;

  beforeEach(() => {
    jest.resetModules();
    created = installWindow();
  });

  afterEach(() => {
    delete globalThis.window;
  });

  test('playMove の初回呼び出しで AudioContext が生成され resume される', async () => {
    // Given: state='suspended' で生成される AudioContext モック
    // When: playMove を呼ぶ
    // Then: AudioContext が 1 つ生成され、resume() が呼ばれる
    const sound = await loadSoundModule();
    sound.playMove();
    expect(created).toHaveLength(1);
    expect(created[0].resume).toHaveBeenCalled();
  });

  test('running 状態の AudioContext に対しては resume を呼ばない', async () => {
    // Given: state='running' で生成される AudioContext モック
    // When: playMove を呼ぶ
    // Then: resume() は呼ばれない
    jest.resetModules();
    created = installWindow('running');
    const sound = await loadSoundModule();
    sound.playMove();
    expect(created).toHaveLength(1);
    expect(created[0].resume).not.toHaveBeenCalled();
  });

  test('複数の play 関数を連続呼び出ししても AudioContext は 1 つだけ生成される', async () => {
    // Given: suspended で生成される AudioContext モック
    // When: playMove / playCapture / playCheck / playCheckmate を連続呼び出し
    // Then: 生成は 1 回、resume は suspended 解消のため 1 回だけ
    const sound = await loadSoundModule();
    sound.playMove();
    sound.playCapture();
    sound.playCheck();
    sound.playCheckmate();
    expect(created).toHaveLength(1);
    expect(created[0].resume).toHaveBeenCalledTimes(1);
  });

  test('後手選択相当: ジェスチャー外の初回再生でも resume が呼ばれる', async () => {
    // Given: 人間が後手 → AIの初手で効果音が鳴る（ジェスチャースタック外）
    // When: playCheckmate（詰み音）を初回に呼ぶ
    // Then: suspended なコンテキストでも resume される
    const sound = await loadSoundModule();
    sound.playCheckmate();
    expect(created[0].resume).toHaveBeenCalled();
  });
});

describe('sound.js - SOUND_CONFIG の整合性', () => {
  test('全 play 関数が参照する設定キーが存在する', () => {
    // Given: SOUND_CONFIG
    // When: play 関数が使用するキーを確認する
    // Then: すべてのキーが数値/配列として存在する
    for (const key of ['noiseDuration', 'filterFreq', 'filterQ', 'noiseGain', 'noiseDecay', 'oscFreqStart', 'oscFreqEnd', 'oscDuration', 'oscGain']) {
      expect(typeof SOUND_CONFIG.MOVE[key]).toBe('number');
    }
    for (const key of ['noiseDuration', 'filterFreq', 'filterQ', 'noiseGain', 'noiseDecay', 'oscFreqStart', 'oscFreqEnd', 'oscDuration', 'oscGain', 'highFreqStart', 'highFreqEnd', 'highDuration', 'highGain']) {
      expect(typeof SOUND_CONFIG.CAPTURE[key]).toBe('number');
    }
    for (const key of ['freq', 'interval', 'gain', 'count', 'attackTime', 'releaseTime']) {
      expect(typeof SOUND_CONFIG.CHECK[key]).toBe('number');
    }
    expect(Array.isArray(SOUND_CONFIG.CHECKMATE.notes)).toBe(true);
  });
});
