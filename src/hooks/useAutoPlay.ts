import { useEffect } from 'react'
import { AUTOPLAY_MS } from '../theme/design'
import type { StageId } from '../App'

// 自动演示计时：当 enabled 时，在当前站停留 AUTOPLAY_MS[stage] 后自动推进。
export function useAutoPlay(stage: StageId, enabled: boolean, advance: () => void) {
  useEffect(() => {
    if (!enabled) return
    const ms = AUTOPLAY_MS[stage] ?? 7000
    const t = setTimeout(advance, ms)
    return () => clearTimeout(t)
  }, [stage, enabled, advance])
}
