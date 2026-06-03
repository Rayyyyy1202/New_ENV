interface Props {
  color?: string
  className?: string
}

// 进行中状态的脉冲点
export default function PulseDot({ color = '#22d3ee', className = '' }: Props) {
  return (
    <span className={`relative inline-flex h-2.5 w-2.5 ${className}`}>
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
        style={{ backgroundColor: color }}
      />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    </span>
  )
}
