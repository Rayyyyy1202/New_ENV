import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X, Check, Cpu, MousePointer2, AlertTriangle, Sparkles } from 'lucide-react'
import { hook, ordinaryPath, aiPath, steps, scores, costPoints, type PathNode } from '../data/comparison'
import { fadeUp, listStagger } from '../ui/motion'

export default function ComparisonView({ onBack, onTry }: { onBack: () => void; onTry: () => void }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8 pb-8">
      {/* 钩子 */}
      <div className="text-center">
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
          <ArrowLeft size={14} /> 返回
        </button>
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accentSoft px-3 py-1 text-[12px] font-medium text-accent">
          <Sparkles size={13} /> 为什么我们的 AI 版,比几千块的普通版强
        </div>
        <h1 className="mx-auto max-w-2xl text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">
          {hook.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[14px] text-muted">{hook.sub}</p>
      </div>

      {/* 两条实现路径 */}
      <section>
        <SectionTitle n="01" title="两条实现路径" desc="同一件事,普通脚本 vs AI Agent 怎么跑" />
        <div className="grid gap-4 md:grid-cols-2">
          <PathColumn
            tone="ordinary"
            icon={<MousePointer2 size={16} />}
            title="普通版 · 录制式 RPA + 规则"
            tag="一次性脚本 · 写死规则"
            nodes={ordinaryPath}
          />
          <PathColumn
            tone="ai"
            icon={<Cpu size={16} />}
            title="我们的 AI 版 · Agent + 大模型"
            tag="理解 · 判断 · 自适应"
            nodes={aiPath}
          />
        </div>
      </section>

      {/* 逐环节技术对比 */}
      <section>
        <SectionTitle n="02" title="逐环节技术对比" desc="每一步,普通版怎么做、AI 版怎么做、好在哪" />
        <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-3">
          {steps.map((s) => (
            <motion.div
              key={s.key}
              variants={fadeUp}
              className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
            >
              <div className="border-b border-line bg-canvas/50 px-4 py-2.5 text-[13px] font-semibold text-ink">
                {s.stage}
              </div>
              <div className="grid gap-px bg-line sm:grid-cols-2">
                <div className="bg-surface p-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-dangerSoft text-danger">
                      <X size={11} />
                    </span>
                    普通版
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted">{s.ordinary}</p>
                </div>
                <div className="bg-surface p-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-accent">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accentSoft text-accent">
                      <Check size={11} />
                    </span>
                    AI 版
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink">{s.ai}</p>
                </div>
              </div>
              <div className="flex items-start gap-1.5 border-t border-line bg-okSoft/50 px-4 py-2.5 text-[12px] text-ok">
                <Sparkles size={13} className="mt-0.5 shrink-0" />
                <span className="text-ink">
                  <b className="text-ok">好在哪:</b> {s.win}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 能力评分 */}
      <section>
        <SectionTitle n="03" title="能力对比" desc="同维度打分,差距一目了然" />
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-end gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-muted">
              <span className="h-2 w-2 rounded-full bg-faint" /> 普通版
            </span>
            <span className="flex items-center gap-1 text-accent">
              <span className="h-2 w-2 rounded-full bg-accent" /> AI 版
            </span>
          </div>
          {scores.map((s, i) => (
            <div key={s.dim} className="grid grid-cols-[150px_1fr] items-center gap-3">
              <span className="text-[12px] text-muted">{s.dim}</span>
              <div className="space-y-1">
                <ScoreBar value={s.ordinary} tone="bg-faint" delay={i * 0.05} />
                <ScoreBar value={s.ai} tone="bg-accent" delay={i * 0.05 + 0.08} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 成本视角 */}
      <section>
        <SectionTitle n="04" title="便宜的,其实更贵" desc="几千块脚本的隐性成本" />
        <div className="grid gap-2.5 sm:grid-cols-2">
          {costPoints.map((c, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3.5 shadow-card">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warn" />
              <p className="text-[13px] leading-relaxed text-muted">{c}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          onClick={onTry}
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lift transition-opacity hover:opacity-90"
        >
          看现场演示 <ArrowRight size={16} />
        </button>
        <button onClick={onBack} className="text-[12px] text-faint hover:text-muted">
          返回
        </button>
      </div>
    </motion.div>
  )
}

function SectionTitle({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-2.5">
      <span className="tnum text-[12px] font-semibold text-accent">{n}</span>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <span className="text-[12px] text-faint">{desc}</span>
    </div>
  )
}

function PathColumn({
  tone,
  icon,
  title,
  tag,
  nodes,
}: {
  tone: 'ordinary' | 'ai'
  icon: React.ReactNode
  title: string
  tag: string
  nodes: PathNode[]
}) {
  const ai = tone === 'ai'
  return (
    <div className={`rounded-2xl border bg-surface p-4 shadow-card ${ai ? 'border-accent/40' : 'border-line'}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${ai ? 'bg-accent text-white' : 'bg-canvas text-muted'}`}>
          {icon}
        </span>
        <div>
          <div className="text-[13px] font-semibold text-ink">{title}</div>
          <div className={`text-[11px] ${ai ? 'text-accent' : 'text-faint'}`}>{tag}</div>
        </div>
      </div>
      <div className="space-y-1">
        {nodes.map((nd, i) => (
          <div key={i}>
            <div className="flex items-start gap-2.5">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                    ai ? 'bg-accentSoft text-accent' : 'bg-canvas text-faint'
                  }`}
                >
                  {i + 1}
                </span>
                {i < nodes.length - 1 && <span className={`my-0.5 h-4 w-px ${ai ? 'bg-accent/30' : 'bg-line'}`} />}
              </div>
              <div className="pb-1">
                <div className="text-[13px] font-medium text-ink">{nd.label}</div>
                <div className="text-[11px] text-faint">{nd.tech}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoreBar({ value, tone, delay }: { value: number; tone: string; delay: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
        <motion.div
          className={`h-full rounded-full ${tone}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="tnum w-8 text-right text-[11px] text-faint">{value}</span>
    </div>
  )
}
