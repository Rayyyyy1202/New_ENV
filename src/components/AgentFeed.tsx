import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import type { AgentStep } from '../engine/review'
import { EASE } from '../ui/motion'

interface Props {
  steps: AgentStep[]
  onComplete: () => void
}

// AI 执行流 —— 用自然语言逐条展示机器人正在做什么。
export default function AgentFeed({ steps, onComplete }: Props) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (current >= steps.length) {
      const t = setTimeout(onComplete, 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCurrent((c) => c + 1), steps[current].ms)
    return () => clearTimeout(t)
  }, [current, steps, onComplete])

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-muted">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        AI 正在执行
      </div>
      <div className="space-y-2.5">
        {steps.slice(0, current + 1).map((s, i) => {
          const done = i < current
          const active = i === current
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex items-start gap-3"
            >
              <div className="mt-0.5">
                {done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-okSoft text-ok">
                    <Check size={13} />
                  </span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accentSoft text-accent">
                    <Loader2 size={13} className="animate-spin" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className={`text-sm ${active ? 'font-medium text-ink' : 'text-ink'}`}>{s.text}</div>
                {s.detail && <div className="truncate text-[12px] text-faint">{s.detail}</div>}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
