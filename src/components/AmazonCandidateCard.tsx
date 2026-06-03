import { motion } from 'framer-motion'
import { Star, Ban, Sparkles, MousePointerClick } from 'lucide-react'
import type { AmazonCandidate } from '../data/types'
import RelevanceBar from './RelevanceBar'
import VerificationBadge from './VerificationBadge'
import { stagger } from '../theme/design'

interface Props {
  candidate: AmazonCandidate
  index: number
  isBest: boolean
  selected: boolean
  verdictsActive: boolean
  onSelect: () => void
  onConfirm: () => void
}

export function isExcluded(c: AmazonCandidate) {
  return c.trademark === 'fail' || c.materialCheck === 'fail' || c.originCheck === 'fail' || c.relevance < 60
}

export default function AmazonCandidateCard({
  candidate: c,
  index,
  isBest,
  selected,
  verdictsActive,
  onSelect,
  onConfirm,
}: Props) {
  const excluded = isExcluded(c)
  const baseDelay = 0.2 + index * 0.15

  return (
    <motion.div
      variants={stagger.item}
      layout
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl border p-3 transition-all ${
        isBest
          ? 'border-ok bg-ok/[0.06] shadow-glow-ok'
          : excluded
            ? 'border-bg-line bg-bg-panel/40 opacity-60'
            : selected
              ? 'border-cyan bg-bg-panel/70 shadow-glow'
              : 'border-bg-line bg-bg-panel/60 hover:border-cyan/40'
      }`}
    >
      {/* AI 推荐角标 */}
      {isBest && (
        <div className="absolute -top-2.5 left-3 flex items-center gap-1 rounded-full border border-ok/50 bg-ok/15 px-2 py-0.5 text-[10px] font-bold text-ok">
          <Sparkles size={11} /> AI 推荐
        </div>
      )}

      {/* 排除原因横幅 */}
      {excluded && c.excludeReason && (
        <div className="mb-2 flex items-center gap-1 rounded-md border border-bad/40 bg-bad/10 px-2 py-1 text-[10px] font-semibold text-bad">
          <Ban size={11} className="shrink-0" /> {c.excludeReason}
        </div>
      )}

      {/* 相关性评分条 */}
      <div className="mb-2">
        <RelevanceBar value={c.relevance} delay={baseDelay * 1000} />
      </div>

      <div className="flex gap-3">
        {/* 商品图占位 */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-bg-line bg-bg-base/50 text-3xl">
          {c.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-xs font-medium leading-snug text-ink">{c.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="tnum text-sm font-bold text-amazon">€{c.priceEur.toFixed(2)}</span>
            <span className="flex items-center gap-0.5 text-[10px] text-warn">
              <Star size={10} fill="currentColor" /> {c.stars}
            </span>
            <span className="tnum text-[10px] text-ink-faint">{c.reviews.toLocaleString()} 条评论</span>
            {c.badge && (
              <span className="rounded border border-amazon/40 bg-amazon/10 px-1 py-0.5 text-[9px] font-semibold text-amazon">
                {c.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 三重核验徽章 */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <VerificationBadge label="商标核验" result={c.trademark} delay={baseDelay + 0.0} active={verdictsActive} />
        <VerificationBadge label="材质核验" result={c.materialCheck} delay={baseDelay + 0.3} active={verdictsActive} />
        <VerificationBadge label="原产地核验" result={c.originCheck} delay={baseDelay + 0.6} active={verdictsActive} />
      </div>

      {/* AI 推荐理由 + 人工确认 */}
      {isBest && c.reason && (
        <div className="mt-2.5 border-t border-ok/20 pt-2">
          <div className="flex items-start gap-1 text-[10px] text-ink-dim">
            <Sparkles size={11} className="mt-0.5 shrink-0 text-ok" />
            <span>{c.reason}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onConfirm()
            }}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-ok bg-ok/15 py-1.5 text-xs font-bold text-ok transition-all hover:bg-ok/25"
          >
            <MousePointerClick size={13} /> 人工确认（Yes）→ 固化
          </button>
        </div>
      )}
    </motion.div>
  )
}
