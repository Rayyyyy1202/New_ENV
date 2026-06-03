// 极轻的提示音（可选，默认关闭）。用 WebAudio 合成，无需音频文件。
let ctx: AudioContext | null = null

export function playChime() {
  try {
    ctx = ctx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.26)
  } catch {
    /* 忽略：演示环境无音频时静默 */
  }
}
