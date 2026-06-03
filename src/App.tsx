import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, FileSpreadsheet, ArrowRight } from 'lucide-react'
import Header from './components/Header'
import CommandBar from './components/CommandBar'
import AgentFeed from './components/AgentFeed'
import ReviewTable from './components/ReviewTable'
import ResultSummary from './components/ResultSummary'
import ComparisonView from './components/ComparisonView'
import InboxPanel from './components/InboxPanel'
import type { OrderOrigin, WorkOrder } from './data/inbox'
import {
  buildReviewItems,
  buildAgentSteps,
  parseCommand,
  matchItemId,
  EXAMPLE_COMMANDS,
  type ReviewItem,
  type AgentStep,
  type ReviewStatus,
} from './engine/review'
import { liveTranslate } from './lib/translate'
import { EASE, fadeUp } from './ui/motion'

type Phase = 'idle' | 'running' | 'review' | 'done' | 'compare'

export default function App() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [instruction, setInstruction] = useState('')
  const [items, setItems] = useState<ReviewItem[]>([])
  const [steps, setSteps] = useState<AgentStep[]>([])
  const [liveModel, setLiveModel] = useState<string | undefined>()
  const [origin, setOrigin] = useState<OrderOrigin | undefined>()
  const [autoAccept, setAutoAccept] = useState(false)
  const [autoRun, setAutoRun] = useState(false)

  const reset = useCallback(() => {
    setPhase('idle')
    setInstruction('')
    setItems([])
    setSteps([])
    setLiveModel(undefined)
    setOrigin(undefined)
    setAutoRun(false)
  }, [])

  const setStatus = useCallback((id: string, status: ReviewStatus) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)))
  }, [])

  // 启动一次对标运行(可来自手动指令,或某渠道工单);auto=AI 自动受理模式
  const startRun = useCallback((text: string, orderOrigin?: OrderOrigin, auto = false) => {
    const cmd = parseCommand(text, 'idle')
    const only = cmd.kind === 'run' ? cmd.only : undefined
    let built = buildReviewItems()
    if (only) built = built.filter((i) => i.id === only)

    setInstruction(text)
    setOrigin(orderOrigin)
    setAutoRun(auto)
    setItems(built)
    setSteps(
      buildAgentSteps(
        text,
        undefined,
        orderOrigin
          ? { channelName: orderOrigin.channelName, sender: orderOrigin.sender, attachment: orderOrigin.attachment }
          : undefined,
      ),
    )
    setLiveModel(undefined)
    setPhase('running')

    // 异步调用真实模型翻译,完成后回填(失败则保持脚本数据)
    liveTranslate(built.map((i) => ({ id: i.id, raw: i.rawName, kind: i.rawKind }))).then((res) => {
      if (!res.ok || !res.results.length) return
      const map = new Map(res.results.map((r) => [r.id, r]))
      setItems((prev) =>
        prev.map((it) => {
          const r = map.get(it.id)
          return r ? { ...it, product: r.enName, buyerTerms: r.buyerTerms?.length ? r.buyerTerms : it.buyerTerms } : it
        }),
      )
      setLiveModel(res.model)
    })
  }, [])

  // 从某渠道工单受理:读取聊天记录里提取的指令并启动
  const pickWorkOrder = useCallback(
    (o: WorkOrder) => {
      startRun(
        o.instruction,
        { channelName: o.channelName, channelEmoji: o.channelEmoji, sender: o.sender, attachment: o.attachment },
        autoAccept,
      )
    },
    [startRun, autoAccept],
  )

  // AI 执行流结束:进入审核;自动受理模式下,高置信项直接通过,只留异常给人工
  const handleRunComplete = useCallback(() => {
    if (autoRun) {
      setItems((prev) => prev.map((it) => (it.needsReview ? it : { ...it, status: 'approved' })))
    }
    setPhase('review')
  }, [autoRun])

  // 审核阶段的自然语言指令
  const handleReviewCommand = useCallback(
    (text: string) => {
      const cmd = parseCommand(text, 'review')
      switch (cmd.kind) {
        case 'reset':
          reset()
          break
        case 'approveAll':
          setItems((prev) => prev.map((it) => (it.status === 'pending' ? { ...it, status: 'approved' } : it)))
          break
        case 'rejectAll':
          setItems((prev) => prev.map((it) => (it.status === 'pending' ? { ...it, status: 'rejected' } : it)))
          break
        case 'approve':
          setStatus(cmd.match, 'approved')
          break
        case 'reject':
          setStatus(cmd.match, 'rejected')
          break
        default: {
          // 兜底:若提到了某商品,默认通过它
          const id = matchItemId(text)
          if (id) setStatus(id, 'approved')
        }
      }
    },
    [reset, setStatus],
  )

  const approveAll = () =>
    setItems((prev) => prev.map((it) => (it.status === 'pending' ? { ...it, status: 'approved' } : it)))

  return (
    <div className="min-h-screen bg-canvas">
      <Header
        onReset={reset}
        showReset={phase !== 'idle'}
        onCompare={() => setPhase('compare')}
        showCompare={phase !== 'compare'}
      />

      <main className="mx-auto max-w-5xl px-5 pb-40 pt-8">
        <AnimatePresence mode="wait">
          {/* ───── 首页:自然语言指令台 ───── */}
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mx-auto mt-[8vh] max-w-2xl text-center"
            >
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accentSoft px-3 py-1 text-[12px] font-medium text-accent">
                <Sparkles size={13} /> AI 自动对标 · 你只需审核
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                用一句话,给装箱单找好亚马逊对标
              </h1>
              <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
                输入指令,AI 自动完成翻译、查库、亚马逊德国搜索与商标/材质/原产地核验,把对标链接<b className="text-ink">填好表</b>交给你审核。
              </p>

              <div className="mt-7 text-left">
                <CommandBar
                  variant="hero"
                  placeholder="例如:给这份装箱单在亚马逊德国找对标链接,品牌商品排除掉…"
                  hint="回车发送 · 这是演示,数据为内置示例装箱单"
                  onSubmit={startRun}
                />
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {EXAMPLE_COMMANDS.map((c) => (
                  <button
                    key={c}
                    onClick={() => startRun(c)}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] text-muted shadow-card transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    {c}
                  </button>
                ))}
              </div>

              <button
                onClick={() => startRun('给这份装箱单在亚马逊德国找对标链接')}
                className="mx-auto mt-5 flex items-center gap-2 text-[13px] font-medium text-accent hover:underline"
              >
                <FileSpreadsheet size={15} /> 或直接加载示例装箱单(12 个商品)
              </button>

              {/* 渠道接入 + 工单收件箱 */}
              <div className="mt-8 flex items-center gap-3 text-[12px] text-faint">
                <span className="h-px flex-1 bg-line" />
                或 · 让 AI 从已接入的渠道自动受理工单
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="mt-4 text-left">
                <InboxPanel
                  onPickup={pickWorkOrder}
                  autoAccept={autoAccept}
                  onToggleAuto={() => setAutoAccept((v) => !v)}
                />
              </div>

              <button
                onClick={() => setPhase('compare')}
                className="mx-auto mt-6 flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
              >
                看看我们比几千块的普通版强在哪 <ArrowRight size={14} />
              </button>
            </motion.div>
          )}

          {/* ───── 运行中:AI 执行流 ───── */}
          {phase === 'running' && (
            <motion.div
              key="running"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="mx-auto max-w-2xl pt-4"
            >
              <Instruction text={instruction} origin={origin} />
              <div className="mt-3">
                <AgentFeed steps={steps} onComplete={handleRunComplete} />
              </div>
            </motion.div>
          )}

          {/* ───── 审核 ───── */}
          {phase === 'review' && (
            <motion.div key="review" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              <Instruction text={instruction} origin={origin} />
              <div className="mt-3">
                <ReviewTable
                  items={items}
                  liveModel={liveModel}
                  autoRun={autoRun}
                  onApprove={(id) => setStatus(id, 'approved')}
                  onReject={(id) => setStatus(id, 'rejected')}
                  onUndo={(id) => setStatus(id, 'pending')}
                  onApproveAll={approveAll}
                  onFinish={() => setPhase('done')}
                />
              </div>
            </motion.div>
          )}

          {/* ───── 汇总 ───── */}
          {phase === 'done' && (
            <motion.div key="done" className="pt-2">
              <ResultSummary items={items} onReset={reset} onCompare={() => setPhase('compare')} />
            </motion.div>
          )}

          {/* ───── 对比:为什么选 AI 版 ───── */}
          {phase === 'compare' && (
            <motion.div key="compare" className="pt-2">
              <ComparisonView onBack={reset} onTry={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 审核阶段:底部常驻自然语言指令栏 */}
      {phase === 'review' && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas/90 px-5 py-3 backdrop-blur">
          <div className="mx-auto max-w-5xl">
            <CommandBar
              variant="docked"
              placeholder='用自然语言审核,例如:"全部通过"、"驳回莲蓬头"、"通过瑜伽垫"…'
              onSubmit={handleReviewCommand}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Instruction({ text, origin }: { text: string; origin?: OrderOrigin }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] text-white">
        {origin ? origin.channelEmoji : <span className="text-[11px] font-semibold">你</span>}
      </div>
      <div className="min-w-0">
        {origin && (
          <div className="mb-0.5 text-[11px] text-faint">
            来自【{origin.channelName}】· {origin.sender}
            {origin.attachment && <span> · 附件 {origin.attachment}</span>}
          </div>
        )}
        <p className="text-[14px] text-ink">{text}</p>
      </div>
    </div>
  )
}
