import { useEffect, useRef, useState } from 'react'
import { ArrowUp, CornerDownLeft } from 'lucide-react'

interface Props {
  variant: 'hero' | 'docked'
  placeholder: string
  hint?: string
  disabled?: boolean
  onSubmit: (text: string) => void
}

// 自然语言指令输入框。hero=首页居中大输入;docked=审核页底部对话式输入。
export default function CommandBar({ variant, placeholder, hint, disabled, onSubmit }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (variant === 'hero') ref.current?.focus()
  }, [variant])

  function submit() {
    const t = text.trim()
    if (!t || disabled) return
    onSubmit(t)
    setText('')
  }

  return (
    <div
      className={
        variant === 'hero'
          ? 'rounded-2xl border border-line bg-surface p-2 shadow-lift transition-shadow focus-within:shadow-focus'
          : 'rounded-xl border border-line bg-surface p-1.5 shadow-card transition-shadow focus-within:shadow-focus'
      }
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          rows={variant === 'hero' ? 2 : 1}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={placeholder}
          className={`flex-1 resize-none bg-transparent px-3 py-2 text-ink placeholder:text-faint focus:outline-none ${
            variant === 'hero' ? 'text-[15px]' : 'text-sm'
          }`}
        />
        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          className={`flex shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-all hover:opacity-90 disabled:opacity-30 ${
            variant === 'hero' ? 'h-10 w-10' : 'h-9 w-9'
          }`}
        >
          <ArrowUp size={18} />
        </button>
      </div>
      {hint && (
        <div className="flex items-center gap-1 px-3 pb-1 pt-0.5 text-[11px] text-faint">
          <CornerDownLeft size={11} /> {hint}
        </div>
      )}
    </div>
  )
}
