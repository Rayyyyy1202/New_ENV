import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Languages, FileWarning, Check } from 'lucide-react'
import { packingList } from '../data/packingList'
import AIBadge from './common/AIBadge'
import PulseDot from './common/PulseDot'
import { EASE } from '../theme/design'

interface Props {
  autoplay: boolean
  onStatus: (s: string) => void
  onDone: () => void
}

const STEPS = [
  '正在识别装箱单类型…',
  '检测到中英混排装箱单（含纯中文 / 仅材质行）',
  '正在调用 AI 电商语境翻译…',
]

export default function Stage1Translate({ onStatus }: Props) {
  const [revealed, setRevealed] = useState(0)
  const [done, setDone] = useState(false)
  const total = packingList.length
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    // 顶部状态条依次播报
    onStatus(STEPS[0])
    const t1 = setTimeout(() => onStatus(STEPS[1]), 900)
    const t2 = setTimeout(() => onStatus(STEPS[2]), 1900)

    // 逐行翻译点亮
    let i = 0
    const start = setTimeout(() => {
      const id = setInterval(() => {
        i++
        setRevealed(i)
        if (i >= total) {
          clearInterval(id)
          const suggested = packingList.filter((p) => p.hsSuggested).length
          onStatus(`已归一 ${total} 个商品 · AI 补全 ${suggested} 个海关编码待人工确认`)
          setDone(true)
        }
      }, 360)
    }, 2300)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(start)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-6 py-4">
      <StageHeader
        title="第一站 · 智能转换"
        desc="自动识别装箱单类型，用 AI 把中文品名翻成亚马逊买家真实会搜的电商词，并归一到标准模板"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 左：原始杂乱装箱单 */}
        <div className="rounded-xl border border-bg-line bg-bg-panel/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-ink-faint">
            <FileWarning size={14} /> 原始装箱单（客户提供 · 中英混杂 · 列名不规整）
          </div>
          <div className="space-y-1.5">
            {packingList.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md bg-bg-base/40 px-3 py-1.5 text-xs text-ink-faint"
              >
                <span className="truncate">
                  <span className="mr-2 text-ink-dim">{p.emoji}</span>
                  {p.rawName}
                </span>
                <span className="ml-2 shrink-0 rounded border border-bg-line px-1.5 py-0.5 text-[10px] text-ink-faint">
                  {p.rawKind}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 右：标准模板表格 */}
        <div
          className={`rounded-xl border bg-bg-panel/60 p-4 transition-all ${
            done ? 'border-cyan/50 shadow-glow' : 'border-bg-line'
          }`}
        >
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-ink-dim">
            <span className="flex items-center gap-2">
              <Languages size={14} className="text-cyan" /> 标准模板（AI 归一后）
            </span>
            {!done ? (
              <span className="flex items-center gap-1.5 text-cyan-soft">
                <PulseDot /> 翻译中 {revealed}/{total}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-ok">
                <Check size={13} /> 完成
              </span>
            )}
          </div>

          <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
            {packingList.slice(0, revealed).map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 14, boxShadow: '0 0 0 1px rgba(34,211,238,0.6)' }}
                animate={{ opacity: 1, x: 0, boxShadow: '0 0 0 1px rgba(30,42,82,1)' }}
                transition={{ duration: 0.5, ease: EASE }}
                className="rounded-lg border border-bg-line bg-bg-base/40 p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span>{p.emoji}</span>
                    <span className="truncate text-sm font-medium text-ink">{p.enName}</span>
                  </div>
                  <AIBadge label="电商翻译" />
                </div>

                {/* 买家搜索词变体 */}
                <div className="mt-1 truncate text-[11px] text-ink-faint">
                  买家搜索词：
                  <span className="tnum text-ink-dim">{p.buyerTerms.join(' · ')}</span>
                </div>

                {/* 标准字段点亮 */}
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] sm:grid-cols-3">
                  <Field label="箱唛" value={p.shippingMark} />
                  <Field label="净重" value={`${p.netWeightKg} kg`} />
                  <Field label="件数" value={`${p.pieces}`} />
                  <Field label="美元单价" value={`$${p.usdUnitPrice}`} />
                  <Field label="体积" value={`${p.volumeM3} m³`} />
                  <Field label="材质" value={p.material} />
                </div>

                {/* 海关编码 — AI 推荐待确认 */}
                <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                  <span className="text-ink-faint">海关编码</span>
                  <span className="tnum text-ink-dim">{p.hsCode}</span>
                  {p.hsSuggested && (
                    <span className="flex items-center gap-1">
                      <AIBadge label="AI 推荐" pulse={false} />
                      <span className="rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 text-[10px] font-semibold text-warn">
                        待确认
                      </span>
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ backgroundColor: 'rgba(34,211,238,0.18)' }}
      animate={{ backgroundColor: 'rgba(7,11,24,0.0)' }}
      transition={{ duration: 0.9 }}
      className="flex items-center justify-between rounded px-1.5 py-0.5"
    >
      <span className="text-ink-faint">{label}</span>
      <span className="tnum truncate text-ink-dim">{value}</span>
    </motion.div>
  )
}

export function StageHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <p className="text-xs text-ink-dim">{desc}</p>
    </div>
  )
}
