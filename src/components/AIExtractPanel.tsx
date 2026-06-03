import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, Check, ShieldQuestion } from 'lucide-react'
import type { AmazonCandidate } from '../data/types'

// AI 详情页抽取面板 — 选中候选卡时滑出，逐行打字出抽取信息。
export default function AIExtractPanel({ candidate }: { candidate: AmazonCandidate }) {
  const lines = buildLines(candidate)
  const [visible, setVisible] = useState(0)
  const [typed, setTyped] = useState('')

  // 逐行揭示 + 当前行打字
  useEffect(() => {
    setVisible(0)
    setTyped('')
  }, [candidate.id])

  useEffect(() => {
    if (visible >= lines.length) return
    const text = lines[visible].text
    let i = 0
    setTyped('')
    const id = setInterval(() => {
      i++
      setTyped(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setTimeout(() => setVisible((v) => v + 1), 280)
      }
    }, 22)
    return () => clearInterval(id)
  }, [visible, lines])

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-cyan/40 bg-bg-panel/80 p-3 shadow-glow"
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-cyan-soft">
        <FileSearch size={14} className="animate-pulseDot" /> AI 正在读取商品详情页…
      </div>
      <div className="space-y-1.5 text-[11px]">
        {lines.slice(0, visible + 1).map((ln, i) => {
          const isCurrent = i === visible
          return (
            <div key={i} className="flex items-start gap-1.5">
              {ln.icon === 'check' ? (
                <Check size={12} className="mt-0.5 shrink-0 text-ok" />
              ) : (
                <ShieldQuestion size={12} className="mt-0.5 shrink-0 text-cyan" />
              )}
              <span className="tnum text-ink-dim">
                {isCurrent ? typed : ln.text}
                {isCurrent && visible < lines.length && (
                  <span className="ml-0.5 inline-block animate-blink text-cyan">▋</span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function buildLines(c: AmazonCandidate): { text: string; icon: 'check' | 'q' }[] {
  const brandLine = c.suspectedBrand
    ? `识别疑似品牌词「${c.suspectedBrand}」→ 送 EUIPO 欧盟商标库核验`
    : '未识别到品牌词 → 判定为非注册品牌'
  return [
    { text: `抽取材质：${c.extractedMaterial}`, icon: 'check' },
    { text: `抽取原产地：${c.extractedOrigin}`, icon: 'check' },
    { text: brandLine, icon: 'q' },
  ]
}
