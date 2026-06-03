import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Boxes, Bot, Clock, RotateCcw, ShieldCheck, Sparkles, TrendingUp, Ban } from 'lucide-react'
import AnimatedNumber from './common/AnimatedNumber'
import AIBadge from './common/AIBadge'
import { StageHeader } from './Stage1Translate'
import { roi, compareData, qualityReport } from '../data/roi'
import { EASE } from '../theme/design'

interface Props {
  onRestart: () => void
  onStatus: (s: string) => void
}

export default function Stage5ROI({ onRestart, onStatus }: Props) {
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    onStatus('本批处理完成 · 正在生成 AI 质检报告与投资回报摘要…')
  }, [onStatus])

  return (
    <div className="mx-auto max-w-6xl px-6 py-4">
      <StageHeader title="投资回报总结" desc="RPA + AI 一次跑完，效率提升约八十倍，全天候不间断、零漏检核验" />

      {/* 三个大数字 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <BigStat Icon={Boxes} color="#22d3ee" label="本次处理商品" value={roi.itemCount} suffix=" 个" />
        <BigStat Icon={Bot} color="#34d399" label="RPA 机器人用时" value={3} suffix=" 分钟" sub={`${roi.robotSeconds} 秒`} />
        <BigStat Icon={Clock} color="#fbbf24" label="人工预估用时" value={4} suffix=" 小时" sub={`约 ${roi.humanMinutesTotal} 分钟`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* 对比条形图 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="rounded-xl border border-bg-line bg-bg-panel/60 p-4 lg:col-span-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-ink">
              <TrendingUp size={15} className="text-cyan" /> 人工 vs RPA 耗时对比
            </span>
            <span className="flex items-center gap-1 rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-1 text-xs font-bold text-cyan-soft">
              效率提升 ≈ <AnimatedNumber value={roi.speedupX} duration={1600} suffix="×" />
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: '#8a96bf', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  cursor={{ fill: 'rgba(34,211,238,0.06)' }}
                  contentStyle={{ background: '#0e1530', border: '1px solid #1e2a52', borderRadius: 8, fontSize: 12, color: '#e8ecf8' }}
                  formatter={(v: number) => [`${v} 分钟`, '耗时']}
                />
                <Bar dataKey="分钟" radius={[0, 6, 6, 0]} animationDuration={1400}>
                  {compareData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 text-center text-[11px] text-ink-faint">
            一个商品人工约 20 分钟，机器人十几秒——商标、材质、原产地一个都不会漏查
          </div>
        </motion.div>

        {/* AI 质检报告卡 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="rounded-xl border border-cyan/40 bg-bg-panel/60 p-4 shadow-glow lg:col-span-2"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <ShieldCheck size={15} className="text-cyan" /> AI 质检报告
            <AIBadge label="自动生成" pulse={false} />
          </div>
          <div className="space-y-2.5 text-sm">
            <ReportRow label="成功对标" value={qualityReport.matched} color="#34d399" />
            <ReportRow label="平均相关性" value={`${qualityReport.avgRelevance}%`} color="#22d3ee" />
            <ReportRow label="排除品牌候选" value={`${qualityReport.brandExcluded} 个`} color="#f87171" icon={<Ban size={12} />} />
            <ReportRow label="待人工复核" value={`${qualityReport.needReview} 个`} color="#fbbf24" />
            <ReportRow label="核验漏检" value={qualityReport.zeroMiss ? '0 · 零漏检' : '—'} color="#34d399" />
          </div>
        </motion.div>
      </div>

      {/* 结论 + 重新演示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-5 flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-2 rounded-full border border-ok/40 bg-ok/10 px-4 py-2 text-sm font-semibold text-ok">
          <Sparkles size={15} /> 效率提升约 80 倍 · 全天候不间断 · 零漏检核验
        </div>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 rounded-xl border border-cyan bg-cyan/15 px-6 py-3 text-sm font-bold text-cyan-soft shadow-glow transition-all hover:bg-cyan/25"
        >
          <RotateCcw size={16} /> 重新演示
        </button>
      </motion.div>
    </div>
  )
}

function BigStat({
  Icon,
  color,
  label,
  value,
  suffix,
  sub,
}: {
  Icon: typeof Boxes
  color: string
  label: string
  value: number
  suffix: string
  sub?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-xl border border-bg-line bg-bg-panel/60 p-4"
    >
      <div className="mb-2 flex items-center gap-2 text-xs text-ink-dim">
        <Icon size={15} style={{ color }} /> {label}
      </div>
      <div className="font-display text-4xl font-extrabold" style={{ color }}>
        <AnimatedNumber value={value} duration={1500} suffix={suffix} />
      </div>
      {sub && <div className="tnum mt-1 text-[11px] text-ink-faint">{sub}</div>}
    </motion.div>
  )
}

function ReportRow({ label, value, color, icon }: { label: string; value: string; color: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-bg-line/50 pb-2 last:border-0">
      <span className="flex items-center gap-1.5 text-ink-dim">
        {icon}
        {label}
      </span>
      <span className="tnum font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  )
}
