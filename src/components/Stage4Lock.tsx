import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Database, ExternalLink, Check, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react'
import { packingList, HERO_ITEM_ID } from '../data/packingList'
import { bestCandidate } from '../data/amazonCandidates'
import { exceptions } from '../data/roi'
import AIBadge from './common/AIBadge'
import AnimatedNumber from './common/AnimatedNumber'
import { StageHeader } from './Stage1Translate'
import { EASE } from '../theme/design'

interface Props {
  autoplay: boolean
  onStatus: (s: string) => void
  onDone: () => void
}

const hero = packingList.find((p) => p.id === HERO_ITEM_ID)!
const winner = bestCandidate()
const exceptionIds = exceptions.map((e) => e.id)

interface FinalRow {
  id: string
  emoji: string
  product: string
  link: string
  amazonTitle: string
  priceEur: number
  status: 'locked-new' | 'locked-reuse' | 'review'
}

const rows: FinalRow[] = packingList.map((p) => {
  if (p.id === HERO_ITEM_ID) {
    return {
      id: p.id,
      emoji: p.emoji,
      product: p.enName,
      link: 'amazon.de/dp/B0CKSHOWER9',
      amazonTitle: winner.title,
      priceEur: winner.priceEur,
      status: 'locked-new',
    }
  }
  return {
    id: p.id,
    emoji: p.emoji,
    product: p.enName,
    link: p.historyLink ?? '—',
    amazonTitle: p.historyTitle ?? '—',
    priceEur: p.historyPriceEur ?? 0,
    status: exceptionIds.includes(p.id) ? 'review' : 'locked-reuse',
  }
})

export default function Stage4Lock({ onStatus }: Props) {
  const [locked, setLocked] = useState(false)
  const [revealed, setRevealed] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    onStatus('正在锁定最佳对标链接 · 回写数据库…')

    const t0 = setTimeout(() => setLocked(true), 1100)
    const startList = setTimeout(() => {
      let i = 0
      const id = setInterval(() => {
        i++
        setRevealed(i)
        if (i >= rows.length) {
          clearInterval(id)
          onStatus('已写入数据库 · 下次同类商品将秒级命中 · 2 个待人工复核已归类')
        }
      }, 140)
    }, 1500)

    return () => {
      clearTimeout(t0)
      clearTimeout(startList)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-6 py-4">
      <StageHeader
        title="第四站 · 固化对标"
        desc="锁定 AI 推荐的最佳链接并回写数据库；未找到合格对标的，AI 自动归类原因并给出下一步建议"
      />

      {/* 锁定动画 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className={`mb-4 flex items-center gap-4 rounded-xl border p-4 transition-all ${
          locked ? 'border-ok/60 shadow-glow-ok' : 'border-cyan/40'
        }`}
      >
        <motion.div
          animate={locked ? { rotate: [0, -10, 0], scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.5 }}
          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
            locked ? 'border-ok bg-ok/15 text-ok' : 'border-cyan bg-cyan/15 text-cyan'
          }`}
        >
          <Lock size={22} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-bold text-ink">
            {hero.emoji} {hero.enName}
            <AIBadge label="AI 推荐" pulse={false} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-ink-dim">
            <ExternalLink size={11} className="text-amazon" />
            <span className="tnum truncate">{winner.title}</span>
            <span className="tnum shrink-0 text-amazon">€{winner.priceEur.toFixed(2)}</span>
          </div>
        </div>
        {locked && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex shrink-0 items-center gap-1 rounded-full border border-ok/40 bg-ok/10 px-2.5 py-1 text-[11px] font-bold text-ok"
          >
            <Check size={12} /> 已锁定
          </motion.span>
        )}
      </motion.div>

      {/* 最终合并表 */}
      <div className="overflow-hidden rounded-xl border border-bg-line bg-bg-panel/60">
        <div className="grid grid-cols-[1.4fr_2fr_0.8fr_0.9fr] gap-2 border-b border-bg-line bg-bg-base/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
          <span>商品</span>
          <span>对标亚马逊链接 / 品名</span>
          <span className="text-right">欧元售价</span>
          <span className="text-right">状态</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {rows.slice(0, revealed).map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-[1.4fr_2fr_0.8fr_0.9fr] items-center gap-2 border-b border-bg-line/50 px-4 py-2 text-[11px] last:border-0"
            >
              <span className="flex items-center gap-1.5 truncate text-ink">
                <span>{r.emoji}</span>
                <span className="truncate">{r.product}</span>
              </span>
              <span className="min-w-0">
                <span className="tnum block truncate text-cyan-soft">{r.link}</span>
                <span className="block truncate text-ink-faint">{r.amazonTitle}</span>
              </span>
              <span className="tnum text-right text-amazon">
                {r.priceEur ? `€${r.priceEur.toFixed(2)}` : '—'}
              </span>
              <span className="text-right">
                <StatusPill status={r.status} />
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI 异常归类 */}
      {revealed >= rows.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-warn/40 bg-warn/[0.05] p-4"
        >
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-warn">
            <AlertTriangle size={14} /> AI 异常归类 · 待人工复核（{exceptions.length}）
            <AIBadge label="自动归因 + 建议" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {exceptions.map((e) => {
              const item = packingList.find((p) => p.id === e.id)!
              return (
                <div key={e.id} className="rounded-lg border border-bg-line bg-bg-base/40 p-2.5 text-[11px]">
                  <div className="mb-1 flex items-center gap-1.5 font-medium text-ink">
                    <span>{item.emoji}</span> {item.enName}
                  </div>
                  <div className="text-ink-dim">
                    <span className="text-bad">原因：</span>
                    {e.reason}
                  </div>
                  <div className="mt-1 flex items-start gap-1 text-cyan-soft">
                    <Sparkles size={11} className="mt-0.5 shrink-0" />
                    <span>
                      <span className="font-semibold">AI 建议：</span>
                      {e.suggestion}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* 数据库 +1 */}
      {revealed >= rows.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-dim"
        >
          <Database size={14} className="text-cyan" />
          已写入历史对标库
          <span className="flex items-center gap-1 rounded-full border border-cyan/40 bg-cyan/10 px-2 py-0.5 font-bold text-cyan-soft">
            <ArrowRight size={11} />
            +<AnimatedNumber value={10} duration={800} /> 条
          </span>
          下次同类商品将秒级命中
        </motion.div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: FinalRow['status'] }) {
  if (status === 'review') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-warn/50 bg-warn/10 px-2 py-0.5 text-[10px] font-semibold text-warn">
        <AlertTriangle size={10} /> 待复核
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-ok/40 bg-ok/10 px-2 py-0.5 text-[10px] font-semibold text-ok">
      <Check size={10} /> {status === 'locked-new' ? '已锁定' : '库内复用'}
    </span>
  )
}
