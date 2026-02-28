// Web Audio APIによる効果音生成（外部ファイル不要）
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
  noise.buffer = createNoiseBuffer(ctx, 0.08);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3000, now);
  filter.Q.setValueAtTime(1.2, now);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.3, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  // 低い木の共鳴音
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

  const oscEnv = ctx.createGain();
  oscEnv.gain.setValueAtTime(0.15, now);
  oscEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  noise.connect(filter);
  filter.connect(env);
  env.connect(ctx.destination);

  osc.connect(oscEnv);
  oscEnv.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.08);
  osc.start(now);
  osc.stop(now + 0.06);
}

// 駒を取る音（パチン - より強め）
export function playCapture() {
  const ctx = getContext();
  const now = ctx.currentTime;

  // 衝撃ノイズ（強め）
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 0.12);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3500, now);
  filter.Q.setValueAtTime(0.8, now);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.45, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  // 共鳴音（強め）
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

  const oscEnv = ctx.createGain();
  oscEnv.gain.setValueAtTime(0.2, now);
  oscEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  // 高い成分（パチンの鋭さ）
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(800, now);
  osc2.frequency.exponentialRampToValueAtTime(200, now + 0.04);

  const osc2Env = ctx.createGain();
  osc2Env.gain.setValueAtTime(0.12, now);
  osc2Env.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  noise.connect(filter);
  filter.connect(env);
  env.connect(ctx.destination);

  osc.connect(oscEnv);
  oscEnv.connect(ctx.destination);

  osc2.connect(osc2Env);
  osc2Env.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.12);
  osc.start(now);
  osc.stop(now + 0.1);
  osc2.start(now);
  osc2.stop(now + 0.04);
}

// 王手の警告音
export function playCheck() {
  const ctx = getContext();
  const now = ctx.currentTime;

  // 短い2音の警告
  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.12;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.2, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }
}

// 詰みの音（ゲーム終了）
export function playCheckmate() {
  const ctx = getContext();
  const now = ctx.currentTime;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const t = now + i * 0.15;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.18, t + 0.03);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}
