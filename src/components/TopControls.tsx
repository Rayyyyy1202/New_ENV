import { Play, Pause, Volume2, VolumeX, RotateCcw, ScanSearch } from 'lucide-react'

interface Props {
  autoplay: boolean
  sound: boolean
  onToggleAuto: () => void
  onToggleSound: () => void
  onRestart: () => void
  showRestart: boolean
}

export default function TopControls({ autoplay, sound, onToggleAuto, onToggleSound, onRestart, showRestart }: Props) {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan/40 bg-cyan/10">
          <ScanSearch size={18} className="text-cyan" />
        </div>
        <div className="font-display text-sm font-bold tracking-wide text-ink">
          Amazon<span className="text-cyan">LinkFinder</span>
        </div>
        <span className="hidden rounded border border-bg-line px-1.5 py-0.5 text-[10px] text-ink-faint sm:inline">
          AI 对标链接引擎 · DEMO
        </span>
      </div>

      <div className="flex items-center gap-2">
        {showRestart && (
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 rounded-lg border border-bg-line bg-bg-panel px-3 py-1.5 text-xs text-ink-dim transition-colors hover:border-cyan/40 hover:text-ink"
          >
            <RotateCcw size={14} /> 重新演示
          </button>
        )}
        <button
          onClick={onToggleSound}
          title={sound ? '关闭提示音' : '开启提示音'}
          className="flex items-center gap-1.5 rounded-lg border border-bg-line bg-bg-panel px-3 py-1.5 text-xs text-ink-dim transition-colors hover:border-cyan/40 hover:text-ink"
        >
          {sound ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
        <button
          onClick={onToggleAuto}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
            autoplay
              ? 'border-cyan bg-cyan/15 text-cyan-soft shadow-glow'
              : 'border-bg-line bg-bg-panel text-ink-dim hover:border-cyan/40 hover:text-ink'
          }`}
        >
          {autoplay ? <Pause size={14} /> : <Play size={14} />}
          自动演示
        </button>
      </div>
    </header>
  )
}
