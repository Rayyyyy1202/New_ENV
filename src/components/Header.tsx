import { Sparkles, RotateCcw } from 'lucide-react'

export default function Header({ onReset, showReset }: { onReset: () => void; showReset: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
            <Sparkles size={15} />
          </div>
          <div className="text-[15px] font-semibold tracking-tight text-ink">LinkFinder</div>
          <span className="hidden rounded-full bg-accentSoft px-2 py-0.5 text-[11px] font-medium text-accent sm:inline">
            AI 对标助手
          </span>
        </div>
        {showReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:bg-line/60 hover:text-ink"
          >
            <RotateCcw size={14} /> 重新开始
          </button>
        )}
      </div>
    </header>
  )
}
