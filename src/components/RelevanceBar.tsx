import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

// AI 多模态相关性评分条：先空着 + 比对中脉冲，短暂后数字滚动到位；低于 60 显红。
export default function RelevanceBar({ value, delay = 0 }: { value: number; delay?: number }) {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle')
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('scanning'), delay)
    const t2 = setTimeout(() => {
      setPhase('done')
      // 数字滚动
      const start = performance.now()
      const dur = 700
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur)
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay + 900)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [value, delay])

  const low = value < 60
  const barColor = low ? 'from-bad to-bad' : 'from-cyanDeep to-cyan'

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1 font-semibold text-cyan-soft">
          <Sparkles size={10} className={phase === 'scanning' ? 'animate-pulseDot' : ''} />
          AI 相关性
        </span>
        <span className={`tnum font-bold ${low ? 'text-bad' : 'text-cyan-soft'}`}>
          {phase === 'idle' ? '··' : phase === 'scanning' ? '比对中…' : `${shown}%`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-line">
        {phase === 'scanning' ? (
          <div className="h-full flow-line animate-flowLine" />
        ) : phase === 'done' ? (
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
      </div>
    </div>
  )
}
