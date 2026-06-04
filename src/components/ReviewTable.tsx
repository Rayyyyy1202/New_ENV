import { motion } from 'framer-motion'
import { CheckCheck, ArrowRight, Zap, Filter } from 'lucide-react'
import type { ReviewItem } from '../engine/review'
import ReviewRow from './ReviewRow'
import { listStagger, fadeUp } from '../ui/motion'

interface Props {
  items: ReviewItem[]
  liveModel?: string
  autoRun?: boolean
  reqSummary?: string
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onUndo: (id: string) => void
  onApproveAll: () => void
  onFinish: () => void
}

export default function ReviewTable({ items, liveModel, autoRun, reqSummary, onApprove, onReject, onUndo, onApproveAll, onFinish }: Props) {
  const pending = items.filter((i) => i.status === 'pending').length
  const approved = items.filter((i) => i.status === 'approved').length
  const rejected = items.filter((i) => i.status === 'rejected').length
  const allDecided = pending === 0

  return (
    <div className="space-y-3">
      {autoRun && (
        <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accentSoft px-4 py-2.5 text-[13px] text-accent">
          <Zap size={15} className="shrink-0" />
          <span>
            自动受理模式 · AI 已直接通过 <b className="tnum">{approved}</b> 项高置信对标,仅 <b className="tnum">{pending}</b> 项异常需你确认
          </span>
        </div>
      )}
      {/* 审核概览条 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-card">
        <div>
          <div className="text-sm font-semibold text-ink">
            AI 已自动填好 {items.length} 项对标 · 待你审核
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-[12px] text-muted">
            <span>待审 <span className="tnum font-medium text-ink">{pending}</span></span>
            <span className="text-ok">已通过 <span className="tnum font-medium">{approved}</span></span>
            <span className="text-danger">已驳回 <span className="tnum font-medium">{rejected}</span></span>
            {liveModel && <span className="text-faint">· 翻译模型 {liveModel}</span>}
          </div>
          {reqSummary && (
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
              <Filter size={11} className="text-accent" /> 按你的要求:{reqSummary}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!allDecided ? (
            <button
              onClick={onApproveAll}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <CheckCheck size={15} /> 全部通过
            </button>
          ) : (
            <motion.button
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={onFinish}
              className="flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              查看汇总 <ArrowRight size={15} />
            </motion.button>
          )}
        </div>
      </div>

      {/* 审核行 */}
      <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-2.5">
        {items.map((it) => (
          <motion.div key={it.id} variants={fadeUp}>
            <ReviewRow
              item={it}
              live={!!liveModel}
              onApprove={() => onApprove(it.id)}
              onReject={() => onReject(it.id)}
              onUndo={() => onUndo(it.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
