import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Paperclip, ChevronDown, Sparkles, ArrowRight, Plug, Zap, Loader2 } from 'lucide-react'
import { channels, workOrders, incomingOrder, type WorkOrder } from '../data/inbox'
import { EASE } from '../ui/motion'

interface Props {
  onPickup: (o: WorkOrder) => void
  autoAccept: boolean
  onToggleAuto: () => void
}

// 渠道接入 + 工单收件箱:AI 从聊天工具自动收取工单、读取聊天记录、提取指令。
export default function InboxPanel({ onPickup, autoAccept, onToggleAuto }: Props) {
  const [arrived, setArrived] = useState(false) // 新工单是否已飘入
  const [autoPicking, setAutoPicking] = useState(false)
  const pickedRef = useRef(false)

  // 模拟实时收到新消息:延迟飘入
  useEffect(() => {
    const t = setTimeout(() => setArrived(true), 3200)
    return () => clearTimeout(t)
  }, [])

  // 自动受理:新工单飘入且开关打开时,AI 直接开跑
  useEffect(() => {
    if (!arrived || !autoAccept || pickedRef.current) return
    pickedRef.current = true
    setAutoPicking(true)
    const t = setTimeout(() => onPickup(incomingOrder), 1700)
    return () => clearTimeout(t)
  }, [arrived, autoAccept, onPickup])

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      {/* 已接入渠道 */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1.5 text-[12px] font-medium text-muted">
          <Plug size={13} className="text-accent" /> 已接入
        </span>
        {channels.map((c) => (
          <span
            key={c.id}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
              c.connected ? 'border-line text-ink' : 'border-dashed border-line text-faint'
            }`}
          >
            <span>{c.emoji}</span>
            {c.name}
            {c.connected ? (
              <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-ok" />
            ) : (
              <span className="ml-0.5 text-[10px] text-faint">未接</span>
            )}
          </span>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-muted">工单收件箱</span>
        {/* 自动受理开关 */}
        <button
          onClick={onToggleAuto}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
            autoAccept ? 'border-accent/40 bg-accentSoft text-accent' : 'border-line text-muted hover:text-ink'
          }`}
          title="开启后,新工单 AI 直接开跑,只在异常时找人"
        >
          <Zap size={12} className={autoAccept ? '' : 'text-faint'} />
          自动受理
          <span className={`relative h-3.5 w-6 rounded-full transition-colors ${autoAccept ? 'bg-accent' : 'bg-line'}`}>
            <span
              className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${
                autoAccept ? 'left-3' : 'left-0.5'
              }`}
            />
          </span>
        </button>
      </div>
      <div className="mb-2 text-[11px] text-faint">
        {autoAccept ? 'AI 自动收取并开跑 · 高置信直接通过 · 仅异常找你确认' : 'AI 自动收取 · 读取聊天记录 · 提取指令'}
      </div>

      <div className="space-y-2">
        {/* 实时飘入的新工单 */}
        <AnimatePresence>
          {arrived && (
            <motion.div
              key="incoming"
              initial={{ opacity: 0, y: -16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <OrderCard
                order={incomingOrder}
                onPickup={() => onPickup(incomingOrder)}
                fresh
                autoPicking={autoPicking}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {workOrders.map((o) => (
          <OrderCard key={o.id} order={o} onPickup={() => onPickup(o)} />
        ))}
      </div>
    </div>
  )
}

function OrderCard({
  order,
  onPickup,
  fresh,
  autoPicking,
}: {
  order: WorkOrder
  onPickup: () => void
  fresh?: boolean
  autoPicking?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`rounded-xl border p-3 transition-shadow ${
        fresh ? 'border-accent/50 bg-accentSoft/40 shadow-focus' : 'border-line bg-canvas/60'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-base shadow-card">
          {order.channelEmoji}
          {fresh && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="font-semibold text-ink">{order.sender}</span>
            <span className="text-faint">· {order.senderRole}</span>
            {fresh ? (
              <span className="flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
                刚刚收到
              </span>
            ) : (
              order.unread && (
                <span className="flex items-center gap-1 rounded-full bg-accentSoft px-1.5 py-0.5 text-[10px] font-medium text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 新工单
                </span>
              )
            )}
            <span className="ml-auto text-[11px] text-faint">{order.time}</span>
          </div>
          <div className="mt-0.5 truncate text-[12px] text-muted">{order.chat[0].text}</div>

          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-accentSoft/70 px-2.5 py-1.5 text-[12px]">
            <Sparkles size={13} className="mt-0.5 shrink-0 text-accent" />
            <span className="text-ink">
              <span className="text-accent">AI 提取指令:</span> {order.instruction}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            {order.attachment && (
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <Paperclip size={11} /> {order.attachment}
              </span>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-0.5 text-[11px] text-faint hover:text-muted"
            >
              聊天记录 <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {autoPicking ? (
              <span className="ml-auto flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-[12px] font-semibold text-white">
                <Loader2 size={13} className="animate-spin" /> AI 自动受理中…
              </span>
            ) : (
              <button
                onClick={onPickup}
                className="ml-auto flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                让 AI 受理 <ArrowRight size={13} />
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5 border-t border-line pt-2">
                  {order.chat.map((m, i) => (
                    <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <span
                        className={`max-w-[80%] rounded-lg px-2.5 py-1.5 text-[12px] ${
                          m.from === 'me' ? 'bg-accent text-white' : 'bg-surface text-ink shadow-card'
                        }`}
                      >
                        {m.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
