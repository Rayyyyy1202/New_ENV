import { useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, FileSpreadsheet, Sparkles } from 'lucide-react'
import { EASE } from '../theme/design'

const sellingPoints = ['支持中英混合装箱单', '五种亚马逊搜索策略', 'AI 自动商标核验']

export default function UploadScreen({ onStart }: { onStart: () => void }) {
  const [drag, setDrag] = useState(false)

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs text-cyan-soft">
          <Sparkles size={13} /> AI 驱动 · RPA 自动化流水线
        </div>
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
          Amazon <span className="text-cyan">LinkFinder</span>
        </h1>
        <p className="mt-3 text-lg text-ink-dim">AI 驱动的出口商品对标链接引擎</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        className="mt-10 w-full max-w-xl"
      >
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            onStart()
          }}
          className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed bg-bg-panel/50 px-8 py-12 transition-all ${
            drag ? 'border-cyan shadow-glow' : 'border-bg-line hover:border-cyan/50'
          }`}
        >
          <UploadCloud size={42} className={drag ? 'text-cyan' : 'text-ink-faint'} />
          <div className="text-sm text-ink-dim">
            将装箱单拖拽到此处<span className="text-ink-faint">（.xlsx / .pdf / .csv）</span>
          </div>
          <div className="text-xs text-ink-faint">演示模式 · 上传仅触发动画，数据走内置示例</div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="group flex items-center gap-2 rounded-xl border border-cyan bg-cyan/15 px-6 py-3 text-sm font-bold text-cyan-soft shadow-glow transition-all hover:bg-cyan/25"
          >
            <FileSpreadsheet size={18} />
            加载示例装箱单
            <motion.span
              className="inline-block"
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            >
              →
            </motion.span>
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-faint"
      >
        {sellingPoints.map((p) => (
          <span key={p} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> {p}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
