import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Boxes, Layers } from 'lucide-react'
import { packingList, HERO_ITEM_ID } from '../data/packingList'
import { strategies, candidatesForStrategy } from '../data/amazonCandidates'
import type { StrategyId } from '../data/types'
import AmazonCandidateCard, { isExcluded } from './AmazonCandidateCard'
import AIExtractPanel from './AIExtractPanel'
import AIBadge from './common/AIBadge'
import { StageHeader } from './Stage1Translate'
import { stagger } from '../theme/design'

interface Props {
  autoplay: boolean
  onStatus: (s: string) => void
  onDone: () => void
}

const hero = packingList.find((p) => p.id === HERO_ITEM_ID)!

export default function Stage3Amazon({ onStatus, onDone }: Props) {
  const [strategy, setStrategy] = useState<StrategyId>('bestseller')
  const [verdictsActive, setVerdictsActive] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 当前策略下的候选，按相关性降序（低分自动沉底）
  const cards = useMemo(() => {
    return [...candidatesForStrategy(strategy)].sort((a, b) => b.relevance - a.relevance)
  }, [strategy])

  // 当前策略下的最佳：全核验通过且相关性最高
  const bestId = useMemo(() => {
    const passing = cards.filter((c) => !isExcluded(c))
    return passing.length ? passing.sort((a, b) => b.relevance - a.relevance)[0].id : null
  }, [cards])

  const selected = cards.find((c) => c.id === selectedId) ?? cards.find((c) => c.id === bestId) ?? cards[0]

  // 策略切换：重置核验、洗牌、默认选中最佳
  const switchTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    setVerdictsActive(false)
    setSelectedId(null)
    const label = strategies.find((s) => s.id === strategy)?.label
    onStatus(`亚马逊德国搜索 · 策略「${label}」· 多模态 AI 相关性评分中…`)
    switchTimer.current = setTimeout(() => {
      setVerdictsActive(true)
      onStatus('AI 读取详情页 · 抽取材质 / 原产地 · 揪出品牌词送 EUIPO 商标库核验…')
    }, 1600)
    const t2 = setTimeout(() => {
      onStatus('AI 综合择优完成 · 已高亮推荐卡，等待人工确认（Yes）')
    }, 4200)
    return () => {
      clearTimeout(switchTimer.current)
      clearTimeout(t2)
    }
  }, [strategy, onStatus])

  return (
    <div className="mx-auto max-w-7xl px-6 py-4">
      <StageHeader
        title="第三站 · 亚马逊德国实时搜索"
        desc="五种搜索策略 + 多模态相关性评分 + AI 详情页抽取 + 商标/材质/原产地三重核验 + 综合择优"
      />

      {/* 策略标签 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {strategies.map((s) => (
          <button
            key={s.id}
            onClick={() => setStrategy(s.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
              strategy === s.id
                ? 'border-amazon bg-amazon/15 text-amazon'
                : 'border-bg-line bg-bg-panel text-ink-dim hover:border-amazon/40'
            }`}
          >
            <span className="font-semibold">{s.label}</span>
            <span className="rounded bg-bg-base/60 px-1 py-0.5 text-[9px] text-ink-faint">{s.threshold}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* 左：当前处理商品 + AI 抽取面板 */}
        <div className="space-y-3 lg:col-span-4">
          <div className="rounded-xl border border-cyan/30 bg-bg-panel/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink-dim">
              <Boxes size={14} className="text-cyan" /> 当前处理商品
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-bg-line bg-bg-base/50 text-3xl">
                {hero.emoji}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-ink">{hero.enName}</div>
                <div className="truncate text-[11px] text-ink-faint">原始：{hero.rawName}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
              <Meta label="材质" value={hero.material} />
              <Meta label="海关编码" value={hero.hsCode} />
              <Meta label="单价" value={`$${hero.usdUnitPrice}`} />
              <Meta label="件数" value={`${hero.pieces}`} />
            </div>
            <div className="mt-2 text-[10px] text-ink-faint">
              核验基准：材质须含「塑料+金属」· 原产地须为「中国」· 须为非注册品牌
            </div>
          </div>

          <AnimatePresence mode="wait">
            {verdictsActive && selected && <AIExtractPanel key={selected.id} candidate={selected} />}
          </AnimatePresence>
        </div>

        {/* 右：候选结果 */}
        <div className="lg:col-span-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-ink-dim">
              <Layers size={14} className="text-amazon" /> 亚马逊德国候选（{cards.length}）
            </span>
            <AIBadge label="多模态相关性评分 · 看图+标题判断同款" />
          </div>

          <motion.div
            key={strategy}
            variants={stagger.container}
            initial="hidden"
            animate="show"
            className="grid gap-3 sm:grid-cols-2"
          >
            {cards.map((c, i) => (
              <AmazonCandidateCard
                key={c.id}
                candidate={c}
                index={i}
                isBest={c.id === bestId}
                selected={selected?.id === c.id}
                verdictsActive={verdictsActive}
                onSelect={() => setSelectedId(c.id)}
                onConfirm={onDone}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded bg-bg-base/40 px-2 py-1">
      <span className="text-ink-faint">{label}</span>
      <span className="tnum truncate text-ink-dim">{value}</span>
    </div>
  )
}
