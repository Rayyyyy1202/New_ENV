// 设计风格配置 — 指挥中心暗色科技风
// 这里集中放 Framer Motion 用到的颜色、缓动、节奏常量，
// 保证全程动效与配色统一。

export const colors = {
  bgBase: '#070b18',
  bgPanel: '#0e1530',
  bgPanel2: '#131c3d',
  line: '#1e2a52',
  ink: '#e8ecf8',
  inkDim: '#8a96bf',
  inkFaint: '#566089',
  cyan: '#22d3ee',
  cyanSoft: '#67e8f9',
  cyanDeep: '#0891b2',
  ok: '#34d399',
  warn: '#fbbf24',
  bad: '#f87171',
  amazon: '#ff9900',
} as const

// 统一缓动曲线 — 全程过渡都用它
export const EASE = [0.22, 1, 0.36, 1] as const

export const spring = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 26,
}

// 卡片依次飞入的错落容器/子项动画
export const stagger = {
  container: {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 28, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: EASE },
    },
  },
}

// 自动演示每一站的停留时长（毫秒）
export const AUTOPLAY_MS: Record<string, number> = {
  upload: 2600,
  translate: 8000,
  database: 7000,
  amazon: 13000,
  lock: 6500,
  roi: 9000,
}
