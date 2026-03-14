// Web Audio APIによる効果音生成（外部ファイル不要）
import { SOUND_CONFIG } from './config.js';

let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// ノイズバッファ生成（駒音のベースに使用）
function createNoiseBuffer(ctx, duration) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  return buffer;
}

// 駒を打つ音（パチッ）
export function playMove() {
  const ctx = getContext();
  const now = ctx.currentTime;

  // フィルタ付きノイズで木の衝撃音を再現
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, SOUND_CONFIG.MOVE.noiseDuration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(SOUND_CONFIG.MOVE.filterFreq, now);
  filter.Q.setValueAtTime(SOUND_CONFIG.MOVE.filterQ, now);

  const env = ctx.createGain();
  env.gain.setValueAtTime(SOUND_CONFIG.MOVE.noiseGain, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + SOUND_CONFIG.MOVE.noiseDecay);

  // 低い木の共鳴音
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(SOUND_CONFIG.MOVE.oscFreqStart, now);
  osc.frequency.exponentialRampToValueAtTime(SOUND_CONFIG.MOVE.oscFreqEnd, now + SOUND_CONFIG.MOVE.oscDuration);

  const oscEnv = ctx.createGain();
  oscEnv.gain.setValueAtTime(SOUND_CONFIG.MOVE.oscGain, now);
  oscEnv.gain.exponentialRampToValueAtTime(0.001, now + SOUND_CONFIG.MOVE.oscDuration);

  noise.connect(filter);
  filter.connect(env);
  env.connect(ctx.destination);

  osc.connect(oscEnv);
  oscEnv.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + SOUND_CONFIG.MOVE.noiseDuration);
  osc.start(now);
  osc.stop(now + SOUND_CONFIG.MOVE.oscDuration);
}

// 駒を取る音（パチン - より強め）
export function playCapture() {
  const ctx = getContext();
  const now = ctx.currentTime;

  // 衝撃ノイズ（強め）
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, SOUND_CONFIG.CAPTURE.noiseDuration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(SOUND_CONFIG.CAPTURE.filterFreq, now);
  filter.Q.setValueAtTime(SOUND_CONFIG.CAPTURE.filterQ, now);

  const env = ctx.createGain();
  env.gain.setValueAtTime(SOUND_CONFIG.CAPTURE.noiseGain, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + SOUND_CONFIG.CAPTURE.noiseDecay);

  // 共鳴音（強め）
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(SOUND_CONFIG.CAPTURE.oscFreqStart, now);
  osc.frequency.exponentialRampToValueAtTime(SOUND_CONFIG.CAPTURE.oscFreqEnd, now + SOUND_CONFIG.CAPTURE.oscDuration);

  const oscEnv = ctx.createGain();
  oscEnv.gain.setValueAtTime(SOUND_CONFIG.CAPTURE.oscGain, now);
  oscEnv.gain.exponentialRampToValueAtTime(0.001, now + SOUND_CONFIG.CAPTURE.oscDuration);

  // 高い成分（パチンの鋭さ）
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(SOUND_CONFIG.CAPTURE.highFreqStart, now);
  osc2.frequency.exponentialRampToValueAtTime(SOUND_CONFIG.CAPTURE.highFreqEnd, now + SOUND_CONFIG.CAPTURE.highDuration);

  const osc2Env = ctx.createGain();
  osc2Env.gain.setValueAtTime(SOUND_CONFIG.CAPTURE.highGain, now);
  osc2Env.gain.exponentialRampToValueAtTime(0.001, now + SOUND_CONFIG.CAPTURE.highDuration);

  noise.connect(filter);
  filter.connect(env);
  env.connect(ctx.destination);

  osc.connect(oscEnv);
  oscEnv.connect(ctx.destination);

  osc2.connect(osc2Env);
  osc2Env.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + SOUND_CONFIG.CAPTURE.noiseDuration);
  osc.start(now);
  osc.stop(now + SOUND_CONFIG.CAPTURE.oscDuration);
  osc2.start(now);
  osc2.stop(now + SOUND_CONFIG.CAPTURE.highDuration);
}

// 王手の警告音
export function playCheck() {
  const ctx = getContext();
  const now = ctx.currentTime;

  // 短い警告音
  for (let i = 0; i < SOUND_CONFIG.CHECK.count; i++) {
    const t = now + i * SOUND_CONFIG.CHECK.interval;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(SOUND_CONFIG.CHECK.freq, t);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(SOUND_CONFIG.CHECK.gain, t + SOUND_CONFIG.CHECK.attackTime);
    env.gain.exponentialRampToValueAtTime(0.001, t + SOUND_CONFIG.CHECK.releaseTime);

    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + SOUND_CONFIG.CHECK.releaseTime);
  }
}

// 詰みの音（ゲーム終了）
export function playCheckmate() {
  const ctx = getContext();
  const now = ctx.currentTime;

  SOUND_CONFIG.CHECKMATE.notes.forEach((freq, i) => {
    const t = now + i * SOUND_CONFIG.CHECKMATE.interval;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(SOUND_CONFIG.CHECKMATE.gain, t + SOUND_CONFIG.CHECKMATE.attackTime);
    env.gain.exponentialRampToValueAtTime(0.001, t + SOUND_CONFIG.CHECKMATE.releaseTime);

    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + SOUND_CONFIG.CHECKMATE.releaseTime);
  });
}
