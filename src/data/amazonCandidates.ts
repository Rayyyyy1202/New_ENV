import type { AmazonCandidate, SearchStrategy } from './types'

// 模拟亚马逊德国的五种搜索/排序策略
export const strategies: SearchStrategy[] = [
  { id: 'bestseller', label: '畅销榜', threshold: '评论 > 1000', desc: 'Bestseller · Rezensionen > 1000' },
  { id: 'rating', label: '平均评分', threshold: '评论 > 1000', desc: 'Ø-Bewertung · Rezensionen > 1000' },
  { id: 'priceAsc', label: '价格从低到高', threshold: '评论 > 100', desc: 'Preis aufsteigend · > 100' },
  { id: 'featured', label: '精选推荐', threshold: '评论 > 1000', desc: 'Empfohlen · Rezensionen > 1000' },
  { id: 'reverseImage', label: '谷歌反向图搜', threshold: '图像匹配', desc: 'Reverse Image Search' },
]

// 莲蓬头（主演商品）在各策略下的候选卡。
// 剧情设计：品牌命中被排除、材质不符被排除、原产地非中国被排除、
// 相关性过低沉底、以及全部通过且综合分最高的 AI 推荐卡。
export const showerHeadCandidates: AmazonCandidate[] = [
  {
    id: 'c1',
    title: 'Wassersparende Handbrause, 5 Strahlarten, Hochdruck',
    priceEur: 16.99,
    reviews: 2317,
    stars: 4.6,
    emoji: '🚿',
    badge: '亚马逊之选',
    relevance: 91,
    extractedMaterial: '塑料 + 金属（Kunststoff + Metall）',
    extractedOrigin: '中国 (China)',
    suspectedBrand: '',
    trademark: 'pass',
    materialCheck: 'pass',
    originCheck: 'pass',
    reason: '相关性 91% · 评论 2317 · 非品牌 · 材质与原产地全部匹配',
    strategies: ['bestseller', 'rating', 'featured', 'reverseImage'],
  },
  {
    id: 'c2',
    title: 'Hansgrohe Crometta Vario Handbrause Chrom',
    priceEur: 32.5,
    reviews: 5840,
    stars: 4.8,
    emoji: '🚿',
    badge: '畅销',
    relevance: 88,
    extractedMaterial: '塑料 + 金属',
    extractedOrigin: '德国 (DE)',
    suspectedBrand: 'Hansgrohe',
    trademark: 'fail', // 命中欧盟注册商标 → 排除
    materialCheck: 'pass',
    originCheck: 'fail',
    excludeReason: '命中注册商标 Hansgrohe（EUIPO）· 已排除',
    strategies: ['bestseller', 'rating', 'featured'],
  },
  {
    id: 'c3',
    title: 'Duschkopf Vollkunststoff, leicht, 3 Funktionen',
    priceEur: 8.99,
    reviews: 412,
    stars: 4.1,
    emoji: '🚿',
    relevance: 76,
    extractedMaterial: '纯 ABS 塑料',
    extractedOrigin: '中国 (China)',
    suspectedBrand: '',
    trademark: 'pass',
    materialCheck: 'fail', // 装箱单为 塑料+金属，详情页仅塑料 → 不符
    originCheck: 'pass',
    excludeReason: '材质不符：详情页为纯塑料，装箱单为塑料+金属 · 已排除',
    strategies: ['priceAsc', 'bestseller', 'reverseImage'],
  },
  {
    id: 'c4',
    title: 'Edelstahl Duschablage Regal ohne Bohren',
    priceEur: 14.49,
    reviews: 1903,
    stars: 4.5,
    emoji: '🧺',
    relevance: 41, // 其实是浴室置物架，不是莲蓬头 → 沉底
    extractedMaterial: '不锈钢',
    extractedOrigin: '中国 (China)',
    suspectedBrand: '',
    trademark: 'pass',
    materialCheck: 'fail',
    originCheck: 'pass',
    excludeReason: '相关性过低（41%）：识别为浴室置物架，非同款 · 沉底',
    strategies: ['bestseller', 'rating', 'featured', 'priceAsc'],
  },
  {
    id: 'c5',
    title: 'Handbrause Hochdruck Chrom, universal, wassersparend',
    priceEur: 13.9,
    reviews: 1488,
    stars: 4.4,
    emoji: '🚿',
    relevance: 84,
    extractedMaterial: '塑料 + 金属',
    extractedOrigin: '中国 (China)',
    suspectedBrand: '',
    trademark: 'pass',
    materialCheck: 'pass',
    originCheck: 'pass',
    reason: '相关性 84% · 评论 1488 · 非品牌 · 材质与原产地匹配',
    strategies: ['rating', 'featured', 'reverseImage'],
  },
  {
    id: 'c6',
    title: 'Premium Regendusche-Brause, Made in Germany',
    priceEur: 24.95,
    reviews: 1126,
    stars: 4.7,
    emoji: '🚿',
    relevance: 79,
    extractedMaterial: '塑料 + 金属',
    extractedOrigin: '德国 (Made in Germany)',
    suspectedBrand: '',
    trademark: 'pass',
    materialCheck: 'pass',
    originCheck: 'fail', // 原产地非中国 → 排除
    excludeReason: '原产地非中国（Made in Germany）· 已排除',
    strategies: ['rating', 'featured', 'priceAsc'],
  },
  {
    id: 'c7',
    title: 'Handbrause mit Filter, 7 Modi, Anti-Kalk',
    priceEur: 12.49,
    reviews: 967,
    stars: 4.3,
    emoji: '🚿',
    relevance: 82,
    extractedMaterial: '塑料 + 金属',
    extractedOrigin: '中国 (China)',
    suspectedBrand: '',
    trademark: 'pass',
    materialCheck: 'pass',
    originCheck: 'pass',
    reason: '相关性 82% · 评论 967 · 非品牌 · 材质与原产地匹配',
    strategies: ['priceAsc', 'bestseller', 'reverseImage'],
  },
  {
    id: 'c8',
    title: 'GROHE Tempesta 100 Handbrause 4 Strahlarten',
    priceEur: 28.99,
    reviews: 7321,
    stars: 4.9,
    emoji: '🚿',
    badge: '畅销',
    relevance: 86,
    extractedMaterial: '塑料 + 金属',
    extractedOrigin: '德国 (DE)',
    suspectedBrand: 'GROHE',
    trademark: 'fail', // 又一个注册商标 → 排除
    materialCheck: 'pass',
    originCheck: 'fail',
    excludeReason: '命中注册商标 GROHE（EUIPO）· 已排除',
    strategies: ['bestseller', 'rating'],
  },
]

/** 获取某策略下的候选卡（保持原始顺序，沉底逻辑在组件里按相关性处理） */
export function candidatesForStrategy(stratId: string): AmazonCandidate[] {
  return showerHeadCandidates.filter((c) => c.strategies.includes(stratId as never))
}

/** 综合择优：全核验通过中相关性最高者 */
export function bestCandidate(): AmazonCandidate {
  const passing = showerHeadCandidates.filter(
    (c) => c.trademark === 'pass' && c.materialCheck === 'pass' && c.originCheck === 'pass' && c.relevance >= 60,
  )
  return passing.sort((a, b) => b.relevance - a.relevance)[0]
}
