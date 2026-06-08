import { AnimatePresence, motion } from 'framer-motion'
import { X, Plug } from 'lucide-react'
import InboxPanel from './InboxPanel'
import type { WorkOrder } from '../data/inbox'
import { EASE } from '../ui/motion'

interface Props {
  open: boolean
  onClose: () => void
  onPickup: (o: WorkOrder) => void
  autoAccept: boolean
  onToggleAuto: () => void
}

// 右侧滑出的「渠道接入 + 工单收件箱」侧边栏。
export default function ChannelSidebar({ open, onClose, onPickup, autoAccept, onToggleAuto }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-canvas shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-line bg-surface px-5 py-3.5">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Plug size={16} className="text-accent" /> 渠道接入 · 工单收件箱
              </span>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-line/60 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <InboxPanel onPickup={onPickup} autoAccept={autoAccept} onToggleAuto={onToggleAuto} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
