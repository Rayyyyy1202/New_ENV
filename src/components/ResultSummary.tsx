import { motion } from 'framer-motion'
import { CheckCircle2, RotateCcw, Gauge, Clock, ShieldCheck, Swords, Download, Copy, ExternalLink, Table2 } from 'lucide-react'
import { useState } from 'react'
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
  const approvedItems = items.filter((i) => i.status === 'approved')
  const approved = approvedItems.length
  const rejected = items.filter((i) => i.status === 'rejected').length
  const avgConf = Math.round(items.reduce((s, i) => s + i.confidence, 0) / Math.max(items.length, 1))
  const [copied, setCopied] = useState(false)

  const headers = ['商品', '对标亚马逊链接', '亚马逊品名', '欧元售价', '来源', 'AI置信度', '状态']
  const rows = approvedItems.map((i) => [
    i.product,
    i.link,
    i.title,
    `€${i.priceEur.toFixed(2)}`,
    i.source === 'amazon' ? '亚马逊新对标' : '历史复用',
    `${i.confidence}%`,
    '已通过',
  ])

  function downloadCsv() {
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }) // BOM 兼容 Excel 中文
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `对标结果_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyTable() {
    const tsv = [headers, ...rows].map((r) => r.join('\t')).join('\n')
    try {
      await navigator.clipboard.writeText(tsv)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* 忽略 */
    }
  }

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

      {/* 最终对标表(AI 填好、你已通过的结果) */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Table2 size={15} className="text-accent" /> 最终对标表 · {approved} 条(已回写数据库)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={copyTable}
              className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Copy size={13} /> {copied ? '已复制' : '复制'}
            </button>
            <button
              onClick={downloadCsv}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Download size={13} /> 下载 CSV
            </button>
          </div>
        </div>
        <div className="max-h-[320px] overflow-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 bg-canvas/95 text-[11px] text-faint">
              <tr>
                <th className="px-4 py-2 font-medium">商品</th>
                <th className="px-3 py-2 font-medium">对标链接 / 品名</th>
                <th className="px-3 py-2 text-right font-medium">欧元价</th>
                <th className="px-3 py-2 font-medium">来源</th>
                <th className="px-3 py-2 text-right font-medium">置信度</th>
              </tr>
            </thead>
            <tbody>
              {approvedItems.map((i) => (
                <tr key={i.id} className="border-t border-line/70">
                  <td className="px-4 py-2 text-ink">
                    <span className="mr-1">{i.emoji}</span>
                    {i.product}
                  </td>
                  <td className="px-3 py-2">
                    <span className="tnum flex items-center gap-1 text-accent">
                      <ExternalLink size={11} /> {i.link}
                    </span>
                    <span className="block truncate text-faint">{i.title}</span>
                  </td>
                  <td className="tnum px-3 py-2 text-right text-amazon">€{i.priceEur.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        i.source === 'amazon' ? 'bg-accentSoft text-accent' : 'bg-canvas text-muted'
                      }`}
                    >
                      {i.source === 'amazon' ? '亚马逊新对标' : '历史复用'}
                    </span>
                  </td>
                  <td className="tnum px-3 py-2 text-right text-muted">{i.confidence}%</td>
                </tr>
              ))}
              {approvedItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-faint">
                    本次没有通过的对标项
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
