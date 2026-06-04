import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { type Requirements, summarizeRequirements } from '../engine/requirements'
import { EASE } from '../ui/motion'

interface Props {
  req: Requirements
  onChange: (r: Requirements) => void
}

// 选品要求面板(user 可自定义):要求 + 条件 + 目标。
export default function RequirementsPanel({ req, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const set = (patch: Partial<Requirements>) => onChange({ ...req, ...patch })

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
          <SlidersHorizontal size={15} className="text-accent" /> 对标要求(可自定义)
        </span>
        <span className="flex items-center gap-2">
          <span className="hidden text-[11px] text-faint sm:inline">{summarizeRequirements(req)}</span>
          <ChevronDown size={15} className={`text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-t border-line"
          >
            <div className="space-y-4 p-4">
              {/* 硬性要求 */}
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">硬性要求</div>
                <div className="flex flex-wrap gap-2">
                  <Toggle label="排除品牌" on={req.excludeBrand} onClick={() => set({ excludeBrand: !req.excludeBrand })} />
                  <Toggle label="原产地中国" on={req.originChina} onClick={() => set({ originChina: !req.originChina })} />
                  <Toggle label="材质匹配" on={req.materialMatch} onClick={() => set({ materialMatch: !req.materialMatch })} />
                </div>
              </div>

              {/* 条件门槛 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
                    最低评论数(销量)
                  </div>
                  <Segmented
                    value={req.minReviews}
                    options={[
                      { v: 0, label: '不限' },
                      { v: 100, label: '100' },
                      { v: 1000, label: '1000' },
                    ]}
                    onPick={(v) => set({ minReviews: v })}
                  />
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">最低评分</div>
                  <Segmented
                    value={req.minStars}
                    options={[
                      { v: 0, label: '不限' },
                      { v: 4.0, label: '4.0★' },
                      { v: 4.5, label: '4.5★' },
                    ]}
                    onPick={(v) => set({ minStars: v })}
                  />
                </div>
              </div>

              {/* 选品目标 */}
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">选品目标</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Segmented
                    value={req.objective}
                    options={[
                      { v: 'cheapest', label: '最便宜' },
                      { v: 'target', label: '目标价' },
                    ]}
                    onPick={(v) => set({ objective: v })}
                  />
                  {req.objective === 'target' && (
                    <label className="flex items-center gap-1.5 text-[12px] text-muted">
                      €
                      <input
                        type="number"
                        min={1}
                        value={req.targetPriceEur}
                        onChange={(e) => set({ targetPriceEur: Number(e.target.value) || 0 })}
                        className="w-20 rounded-lg border border-line bg-canvas px-2 py-1 text-ink focus:border-accent focus:outline-none"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
        on ? 'border-accent/40 bg-accentSoft text-accent' : 'border-line text-muted hover:text-ink'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-accent' : 'bg-faint'}`} />
      {label}
    </button>
  )
}

function Segmented<T extends string | number>({
  value,
  options,
  onPick,
}: {
  value: T
  options: { v: T; label: string }[]
  onPick: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-canvas p-0.5">
      {options.map((o) => (
        <button
          key={String(o.v)}
          onClick={() => onPick(o.v)}
          className={`rounded-md px-2.5 py-1 text-[12px] transition-colors ${
            value === o.v ? 'bg-accent text-white' : 'text-muted hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
