import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import type { VerdictState } from '../data/types'

interface Props {
  label: string
  result: VerdictState
  /** 启动核验的延迟（秒）— 三个徽章逐个判定制造紧张感 */
  delay: number
  active: boolean
}

// 核验徽章：从"扫描中"到打勾 / 打叉。
export default function VerificationBadge({ label, result, delay, active }: Props) {
  const [state, setState] = useState<'idle' | 'scanning' | 'resolved'>('idle')

  useEffect(() => {
    if (!active) {
      setState('idle')
      return
    }
    const t1 = setTimeout(() => setState('scanning'), delay * 1000)
    const t2 = setTimeout(() => setState('resolved'), delay * 1000 + 600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [active, delay])

  const resolved = state === 'resolved'
  const pass = result === 'pass'

  const cls = !resolved
    ? 'border-bg-line bg-bg-base/40 text-ink-faint'
    : pass
      ? 'border-ok/40 bg-ok/10 text-ok'
      : 'border-bad/50 bg-bad/10 text-bad'

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0.6 }}
      animate={resolved ? { scale: [1.08, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-1 rounded-md border px-1.5 py-1 text-[10px] font-semibold ${cls}`}
    >
      {state === 'scanning' ? (
        <Loader2 size={11} className="animate-spin" />
      ) : resolved ? (
        pass ? (
          <Check size={11} />
        ) : (
          <X size={11} />
        )
      ) : (
        <span className="h-2.5 w-2.5 rounded-full border border-ink-faint" />
      )}
      {label}
    </motion.div>
  )
}
