import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

// 数字滚动增长动画 — 所有统计数字都用它，避免直接蹦出。
export default function AnimatedNumber({
  value,
  duration = 1300,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: Props) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number>()

  useEffect(() => {
    const start = performance.now()
    const from = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (value - from) * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [value, duration])

  return (
    <span className={`tnum ${className}`}>
      {prefix}
      {display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}
