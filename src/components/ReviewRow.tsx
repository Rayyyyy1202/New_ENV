import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  X,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Undo2,
  ExternalLink,
  Database,
  ShoppingCart,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'
import type { ReviewItem } from '../engine/review'
import { amazonSearchUrl } from '../lib/amazon'
import { EASE } from '../ui/motion'

interface Props {
  item: ReviewItem
  live: boolean
  onApprove: () => void
  onReject: () => void
  onUndo: () => void
}

export default function ReviewRow({ item, live, onApprove, onReject, onUndo }: Props) {
  const [open, setOpen] = useState(false)
  const decided = item.status !== 'pending'

  const ring =
    item.status === 'approved'
      ? 'border-ok/40'
      : item.status === 'rejected'
        ? 'border-danger/30'
        : item.needsReview
          ? 'border-warn/40'
          : 'border-line'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: decided && item.status === 'rejected' ? 0.6 : 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={`rounded-xl border bg-surface shadow-card ${ring}`}
    >
      <div className="flex items-start gap-3 p-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-canvas text-xl">
          {item.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-ink">{item.product}</span>
            {live && (
              <span className="rounded bg-accentSoft px-1.5 py-0.5 text-[10px] font-medium text-accent">LIVE</span>
            )}
            <SourceTag source={item.source} />
            {item.needsReview && (
              <span className="flex items-center gap-1 rounded-full bg-warnSoft px-2 py-0.5 text-[10px] font-medium text-warn">
                <AlertTriangle size={10} /> 重点复核
              </span>
            )}
          </div>

          {/* AI 自动填好的对标 */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px]">
            <span className="tnum truncate text-ink">{item.title}</span>
            <span className="tnum text-amazon">€{item.priceEur.toFixed(2)}</span>
            <a
              href={amazonSearchUrl(item.buyerTerms, item.product)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="tnum flex items-center gap-1 text-accent hover:underline"
              title="在 Amazon.de 打开真实搜索结果"
            >
              <ExternalLink size={11} /> 在 Amazon.de 查看
            </a>
          </div>

          {/* AI 理由 + 置信度 */}
          <div className="mt-2 flex items-center gap-2">
            <Sparkles size={12} className="shrink-0 text-accent" />
            <span className="truncate text-[12px] text-muted">{item.reasoning}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-line">
              <div
                className={`h-full rounded-full ${item.confidence >= 80 ? 'bg-ok' : item.confidence >= 60 ? 'bg-warn' : 'bg-danger'}`}
                style={{ width: `${item.confidence}%` }}
              />
            </div>
            <span className="tnum text-[11px] text-faint">AI 置信度 {item.confidence}%</span>
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-1 flex items-center gap-0.5 text-[11px] text-accent hover:underline"
            >
              查看依据 <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* 审核操作 */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {item.status === 'pending' ? (
            <>
              <button
                onClick={onApprove}
                className="flex items-center gap-1 rounded-lg bg-ok px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Check size={13} /> 通过
              </button>
              <button
                onClick={onReject}
                className="flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-danger/40 hover:text-danger"
              >
                <X size={13} /> 驳回
              </button>
            </>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <span
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold ${
                  item.status === 'approved' ? 'bg-okSoft text-ok' : 'bg-dangerSoft text-danger'
                }`}
              >
                {item.status === 'approved' ? <Check size={13} /> : <X size={13} />}
                {item.status === 'approved' ? '已通过' : '已驳回'}
              </span>
              <button onClick={onUndo} className="flex items-center gap-1 text-[11px] text-faint hover:text-muted">
                <Undo2 size={11} /> 撤销
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 审核依据(可展开) */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-t border-line"
          >
            <div className="space-y-3 p-3.5 text-[12px]">
              <Audit label="原始品名">
                <span className="text-muted">
                  {item.rawName} <span className="text-faint">· {item.rawKind}</span>
                </span>
              </Audit>
              <Audit label="AI 翻译 / 买家搜索词">
                <span className="tnum text-muted">{item.buyerTerms.join(' · ')}</span>
              </Audit>
              {item.semantic != null && (
                <Audit label="语义相似度">
                  <span className="tnum text-ink">{item.semantic}%</span>
                </Audit>
              )}
              {item.checks && (
                <Audit label="三重核验">
                  <div className="flex flex-wrap gap-1.5">
                    <CheckChip ok={item.checks.trademark} label="商标(非品牌)" />
                    <CheckChip ok={item.checks.material} label="材质匹配" />
                    <CheckChip ok={item.checks.origin} label="原产地中国" />
                  </div>
                </Audit>
              )}
              {item.rejectedCandidates && item.rejectedCandidates.length > 0 && (
                <Audit label={`AI 已排除 ${item.rejectedCandidates.length} 个候选`}>
                  <ul className="space-y-1">
                    {item.rejectedCandidates.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-muted">
                        <X size={12} className="mt-0.5 shrink-0 text-danger" />
                        <span>
                          <span className="text-ink">{r.title}</span> — {r.reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Audit>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SourceTag({ source }: { source: ReviewItem['source'] }) {
  return source === 'history' ? (
    <span className="flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-[10px] font-medium text-muted">
      <Database size={10} /> 历史复用
    </span>
  ) : (
    <span className="flex items-center gap-1 rounded-full bg-accentSoft px-2 py-0.5 text-[10px] font-medium text-accent">
      <ShoppingCart size={10} /> 亚马逊新对标
    </span>
  )
}

function Audit({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-3">
      <span className="text-faint">{label}</span>
      <div>{children}</div>
    </div>
  )
}

function CheckChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
        ok ? 'bg-okSoft text-ok' : 'bg-dangerSoft text-danger'
      }`}
    >
      {ok ? <ShieldCheck size={11} /> : <ShieldX size={11} />}
      {label}
    </span>
  )
}
