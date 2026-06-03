import { motion } from 'framer-motion'
import { Check, Languages, Database, ShoppingCart, Lock, BarChart3 } from 'lucide-react'
import type { StageId } from '../App'
import { STAGE_ORDER } from '../App'

const STATIONS: { id: StageId; label: string; sub: string; Icon: typeof Languages }[] = [
  { id: 'translate', label: '智能转换', sub: '识别 · 翻译 · 归一', Icon: Languages },
  { id: 'database', label: '数据库匹配', sub: '四路语义检索', Icon: Database },
  { id: 'amazon', label: '亚马逊德国搜索', sub: '多策略 · AI 核验', Icon: ShoppingCart },
  { id: 'lock', label: '固化对标', sub: '锁定 · 回写', Icon: Lock },
  { id: 'roi', label: '投资回报', sub: '质检报告', Icon: BarChart3 },
]

export default function PipelineNav({ current, onJump }: { current: StageId; onJump: (s: StageId) => void }) {
  const curIdx = STAGE_ORDER.indexOf(current)

  return (
    <nav className="relative z-20 px-6 pb-2 pt-1">
      <div className="mx-auto flex max-w-6xl items-center">
        {STATIONS.map((st, i) => {
          const stIdx = STAGE_ORDER.indexOf(st.id)
          const isActive = st.id === current
          const isDone = stIdx < curIdx
          const lineDone = stIdx < curIdx

          return (
            <div key={st.id} className="flex flex-1 items-center last:flex-none">
              <button
                onClick={() => onJump(st.id)}
                className="group flex items-center gap-2.5 text-left"
              >
                <div className="relative">
                  {isActive && (
                    <motion.span
                      layoutId="nav-glow"
                      className="absolute -inset-1 rounded-xl bg-cyan/20 blur-md"
                    />
                  )}
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                      isActive
                        ? 'border-cyan bg-cyan/15 text-cyan shadow-glow'
                        : isDone
                          ? 'border-ok/50 bg-ok/10 text-ok'
                          : 'border-bg-line bg-bg-panel text-ink-faint group-hover:border-cyan/40'
                    }`}
                  >
                    {isDone ? <Check size={18} /> : <st.Icon size={18} />}
                    {isActive && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulseDot rounded-full bg-cyan" />
                    )}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div
                    className={`text-xs font-semibold ${
                      isActive ? 'text-ink' : isDone ? 'text-ok' : 'text-ink-faint'
                    }`}
                  >
                    {st.label}
                  </div>
                  <div className="text-[10px] text-ink-faint">{st.sub}</div>
                </div>
              </button>

              {i < STATIONS.length - 1 && (
                <div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-bg-line">
                  {lineDone ? (
                    <div className="absolute inset-0 bg-ok/60" />
                  ) : stIdx === curIdx ? (
                    <div className="absolute inset-0 flow-line animate-flowLine" />
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
