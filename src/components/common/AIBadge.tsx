import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  label: string
  className?: string
  pulse?: boolean
}

// 青色 AI 小徽章 — 全程标记 AI 注入点。
export default function AIBadge({ label, className = '', pulse = true }: Props) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={`inline-flex items-center gap-1 rounded-full border border-cyan/40 bg-cyan/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-soft ${className}`}
    >
      <Sparkles size={11} className={pulse ? 'animate-pulseDot' : ''} />
      {label}
    </motion.span>
  )
}
