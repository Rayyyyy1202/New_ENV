import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Paperclip, ChevronDown, Sparkles, ArrowRight, Plug } from 'lucide-react'
import { channels, workOrders, type WorkOrder } from '../data/inbox'
import { EASE } from '../ui/motion'

// 渠道接入 + 工单收件箱:展示 AI 从聊天工具自动收取工单、读取聊天记录、提取指令。
export default function InboxPanel({ onPickup }: { onPickup: (o: WorkOrder) => void }) {
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

      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted">工单收件箱</span>
        <span className="text-[11px] text-faint">AI 自动收取 · 读取聊天记录 · 提取指令</span>
      </div>

      <div className="space-y-2">
        {workOrders.map((o) => (
          <OrderCard key={o.id} order={o} onPickup={() => onPickup(o)} />
        ))}
      </div>
    </div>
  )
}

function OrderCard({ order, onPickup }: { order: WorkOrder; onPickup: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-line bg-canvas/60 p-3">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-base shadow-card">
          {order.channelEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="font-semibold text-ink">{order.sender}</span>
            <span className="text-faint">· {order.senderRole}</span>
            {order.unread && (
              <span className="flex items-center gap-1 rounded-full bg-accentSoft px-1.5 py-0.5 text-[10px] font-medium text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 新工单
              </span>
            )}
            <span className="ml-auto text-[11px] text-faint">{order.time}</span>
          </div>
          <div className="mt-0.5 truncate text-[12px] text-muted">{order.chat[0].text}</div>

          {/* AI 提取的指令 */}
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
            <button
              onClick={onPickup}
              className="ml-auto flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              让 AI 受理 <ArrowRight size={13} />
            </button>
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
