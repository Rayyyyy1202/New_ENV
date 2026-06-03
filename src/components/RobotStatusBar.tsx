import { useEffect, useState } from 'react'
import { Bot } from 'lucide-react'

// 常驻机器人状态条 — 实时打字显示机器人正在做什么，带闪烁光标。
export default function RobotStatusBar({ message }: { message: string }) {
  const [typed, setTyped] = useState('')

  useEffect(() => {
    setTyped('')
    let i = 0
    const id = setInterval(() => {
      i++
      setTyped(message.slice(0, i))
      if (i >= message.length) clearInterval(id)
    }, 22)
    return () => clearInterval(id)
  }, [message])

  return (
    <div className="relative z-20 border-t border-bg-line bg-bg-panel/80 px-6 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-cyan/40 bg-cyan/10">
          <Bot size={16} className="text-cyan" />
        </div>
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-cyan-soft">RPA·AI</span>
        <span className="tnum truncate text-xs text-ink-dim">
          {typed}
          <span className="ml-0.5 inline-block animate-blink text-cyan">▋</span>
        </span>
      </div>
    </div>
  )
}
