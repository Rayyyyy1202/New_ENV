import { AnimatePresence, motion } from 'framer-motion'
import { Radio } from 'lucide-react'
import type { StageId } from '../../App'
import { narration } from '../../data/narration'

// 自动演示旁白字幕条 — 固定在底部，方便销售照着讲。
export default function SubtitleBar({ stage }: { stage: StageId }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-12 z-30 flex justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="flex max-w-3xl items-start gap-3 rounded-xl border border-cyan/30 bg-bg-panel/90 px-5 py-3 text-sm leading-relaxed text-ink shadow-glow backdrop-blur"
        >
          <Radio size={16} className="mt-0.5 shrink-0 animate-pulseDot text-cyan" />
          <span>{narration[stage]}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
