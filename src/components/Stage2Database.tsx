import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Radar, ArrowUpRight, ExternalLink, Check } from 'lucide-react'
import { packingList } from '../data/packingList'
import AIBadge from './common/AIBadge'
import PulseDot from './common/PulseDot'
import { StageHeader } from './Stage1Translate'
import { EASE } from '../theme/design'

interface Props {
  autoplay: boolean
  onStatus: (s: string) => void
  onDone: () => void
}

const CHANNELS = ['按中文品名', '按英文品名', '英文品名+材质', '按机器人翻译名']

export default function Stage2Database({ onStatus }: Props) {
  const [processed, setProcessed] = useState(0)
  const [done, setDone] = useState(false)
  const total = packingList.length
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    onStatus('正在四路并行检索历史库 · AI 语义向量匹配…')

    let i = 0
    const start = setTimeout(() => {
      const id = setInterval(() => {
        i++
        setProcessed(i)
        if (i >= total) {
          clearInterval(id)
          const hits = packingList.filter((p) => p.db === 'hit').length
          onStatus(`检索完成 · 库内命中 ${hits} 个 · ${total - hits} 个需上亚马逊德国实时搜索`)
          setDone(true)
        }
      }, 320)
    }, 900)

    return () => clearTimeout(start)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-6 py-4">
      <StageHeader
        title="第二站 · 数据库匹配"
        desc="四路并行检索历史对标库；AI 语义向量匹配将中文 / 英文 / 翻译名映射到同一语义空间，相似即命中"
      />

      {/* 四路检索通道可视化 */}
      <div className="mb-4 rounded-xl border border-bg-line bg-bg-panel/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-ink-dim">
            <Radar size={14} className="text-cyan" /> 四路并行检索通道
          </span>
          <AIBadge label="语义向量检索 · 非字符串精确匹配" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((c, idx) => (
            <div key={c} className="rounded-lg border border-bg-line bg-bg-base/40 p-2.5">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-ink-dim">
                <span>{c}</span>
                {done ? <Check size={12} className="text-ok" /> : <PulseDot />}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-bg-line">
                <motion.div
                  className="h-full flow-line animate-flowLine"
                  initial={{ width: '0%' }}
                  animate={{ width: done ? '100%' : ['10%', '85%', '40%', '95%'] }}
                  transition={{ duration: done ? 0.4 : 2.4, repeat: done ? 0 : Infinity, delay: idx * 0.12 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 检索结果 */}
      <div className="grid gap-2.5 md:grid-cols-2">
        {packingList.slice(0, processed).map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={`rounded-lg border p-3 ${
              p.db === 'hit' ? 'border-ok/30 bg-ok/[0.04]' : 'border-warn/40 bg-warn/[0.05]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span>{p.emoji}</span>
                <span className="truncate text-sm font-medium text-ink">{p.enName}</span>
              </div>
              {p.db === 'hit' ? (
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-ok/40 bg-ok/10 px-2 py-0.5 text-[10px] font-semibold text-ok">
                  <Check size={11} /> 库内命中
                </span>
              ) : (
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-warn/50 bg-warn/10 px-2 py-0.5 text-[10px] font-semibold text-warn">
                  <ArrowUpRight size={11} /> 需上亚马逊搜索
                </span>
              )}
            </div>

            {p.db === 'hit' ? (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-ink-dim">
                    <ExternalLink size={11} className="text-amazon" />
                    <span className="tnum truncate">{p.historyTitle}</span>
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="mb-0.5 flex items-center justify-between text-[10px] text-ink-faint">
                      <span className="flex items-center gap-1">
                        <AIBadge label="语义相似度" pulse={false} />
                      </span>
                      <span className="tnum text-cyan-soft">{p.semantic}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-line">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyanDeep to-cyan"
                        initial={{ width: 0 }}
                        animate={{ width: `${p.semantic}%` }}
                        transition={{ duration: 0.8, ease: EASE }}
                      />
                    </div>
                  </div>
                  <span className="tnum shrink-0 rounded border border-bg-line px-1.5 py-0.5 text-[10px] text-amazon">
                    €{p.historyPriceEur?.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-warn/90">
                历史库无相似对标 · 自动流入第三站亚马逊德国实时搜索
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-dim"
        >
          <Database size={13} className="text-cyan" />
          库内命中直接复用历史对标，越用越快；未命中项已排队进入亚马逊搜索
        </motion.div>
      )}
    </div>
  )
}
