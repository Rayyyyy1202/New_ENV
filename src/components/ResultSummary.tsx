import { motion } from 'framer-motion'
import { CheckCircle2, RotateCcw, Gauge, Clock, ShieldCheck, Swords } from 'lucide-react'
import AnimatedNumber from './common/AnimatedNumber'
import type { ReviewItem } from '../engine/review'
import { roi } from '../data/roi'
import { fadeUp } from '../ui/motion'

export default function ResultSummary({
  items,
  onReset,
  onCompare,
}: {
  items: ReviewItem[]
  onReset: () => void
  onCompare: () => void
}) {
  const approved = items.filter((i) => i.status === 'approved').length
  const rejected = items.filter((i) => i.status === 'rejected').length
  const avgConf = Math.round(items.reduce((s, i) => s + i.confidence, 0) / Math.max(items.length, 1))

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-okSoft text-ok">
          <CheckCircle2 size={26} />
        </div>
        <h2 className="text-xl font-semibold text-ink">审核完成</h2>
        <p className="mt-1 text-[13px] text-muted">
          AI 自动填好 {items.length} 项,你通过 {approved} 项、驳回 {rejected} 项,已回写数据库
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat Icon={CheckCircle2} tone="ok" label="本次通过对标" value={approved} suffix=" 项" />
        <Stat Icon={Clock} tone="accent" label="机器人用时" value={3} suffix=" 分钟" sub="人工预估 ≈ 4 小时" />
        <Stat Icon={Gauge} tone="accent" label="效率提升" value={roi.speedupX} suffix="×" sub="全天候 · 零漏检" />
      </div>

      {/* 极简耗时对比 */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <div className="mb-3 text-[13px] font-medium text-muted">人工 vs AI 耗时</div>
        <Bar label="人工流程" minutes={240} max={240} tone="bg-faint" valueText="240 分钟" />
        <div className="h-2" />
        <Bar label="AI + 人工审核" minutes={3} max={240} tone="bg-accent" valueText="3 分钟" />
      </div>

      {/* AI 质检 mini */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line bg-surface p-5 shadow-card text-[13px]">
        <span className="flex items-center gap-1.5 font-medium text-ink">
          <ShieldCheck size={15} className="text-accent" /> AI 质检
        </span>
        <span className="text-muted">平均置信度 <b className="tnum text-ink">{avgConf}%</b></span>
        <span className="text-muted">排除品牌候选 <b className="tnum text-ink">3</b></span>
        <span className="text-muted">核验漏检 <b className="tnum text-ok">0</b></span>
      </div>

      <div className="flex flex-wrap justify-center gap-2 pt-1">
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink shadow-card transition-colors hover:bg-canvas"
        >
          <RotateCcw size={15} /> 再演示一次
        </button>
        <button
          onClick={onCompare}
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
        >
          <Swords size={15} /> 为什么比普通版强
        </button>
      </div>
    </motion.div>
  )
}

function Stat({
  Icon,
  tone,
  label,
  value,
  suffix,
  sub,
}: {
  Icon: typeof Gauge
  tone: 'ok' | 'accent'
  label: string
  value: number
  suffix: string
  sub?: string
}) {
  const color = tone === 'ok' ? 'text-ok' : 'text-accent'
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="mb-1.5 flex items-center gap-1.5 text-[12px] text-muted">
        <Icon size={14} className={color} /> {label}
      </div>
      <div className={`text-3xl font-bold ${color}`}>
        <AnimatedNumber value={value} duration={1300} suffix={suffix} />
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-faint">{sub}</div>}
    </div>
  )
}

function Bar({ label, minutes, max, tone, valueText }: { label: string; minutes: number; max: number; tone: string; valueText: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-[12px] text-muted">{label}</span>
      <div className="h-6 flex-1 overflow-hidden rounded-md bg-canvas">
        <motion.div
          className={`h-full rounded-md ${tone}`}
          initial={{ width: 0 }}
          animate={{ width: `${(minutes / max) * 100}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="tnum w-20 shrink-0 text-right text-[12px] text-ink">{valueText}</span>
    </div>
  )
}
