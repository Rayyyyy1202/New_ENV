// 统一动效常量 —— 克制、顺滑。
export const EASE = [0.22, 1, 0.36, 1] as const

export const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
}

export const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
