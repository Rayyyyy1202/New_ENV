import type { AmazonCandidate } from '../data/types'

// 选品要求(user 可自定义)。
// 流程:先按"要求/条件"筛掉不合格候选 → 在合格者中按"目标"择优(最便宜 / 最接近目标价)。
export interface Requirements {
  excludeBrand: boolean // 排除注册品牌
  originChina: boolean // 原产地必须中国
  materialMatch: boolean // 材质需与装箱单匹配
  minReviews: number // 最低评论数(销量代理)
  minStars: number // 最低评分
  minRelevance: number // 最低相关性
  objective: 'cheapest' | 'target' // 选品目标
  targetPriceEur: number // 目标价(objective=target 时生效)
}

export const defaultRequirements: Requirements = {
  excludeBrand: true,
  originChina: true,
  materialMatch: true,
  minReviews: 1000,
  minStars: 4.0,
  minRelevance: 60,
  objective: 'cheapest',
  targetPriceEur: 15,
}

export interface Disqualified {
  title: string
  reason: string
}

// 按要求筛选候选,返回合格者 + 不合格者(含具体未达项)
export function evaluateCandidates(
  candidates: AmazonCandidate[],
  req: Requirements,
): { qualifying: AmazonCandidate[]; rejected: Disqualified[] } {
  const qualifying: AmazonCandidate[] = []
  const rejected: Disqualified[] = []
  for (const c of candidates) {
    const fails: string[] = []
    if (req.excludeBrand && c.trademark === 'fail') fails.push(`命中注册商标 ${c.suspectedBrand}`)
    if (req.originChina && c.originCheck === 'fail') fails.push(`原产地非中国(${c.extractedOrigin})`)
    if (req.materialMatch && c.materialCheck === 'fail') fails.push(`材质不符(${c.extractedMaterial})`)
    if (c.relevance < req.minRelevance) fails.push(`相关性 ${c.relevance}% < ${req.minRelevance}%`)
    if (c.reviews < req.minReviews) fails.push(`评论 ${c.reviews} < ${req.minReviews}`)
    if (c.stars < req.minStars) fails.push(`评分 ${c.stars} < ${req.minStars}`)
    if (fails.length) rejected.push({ title: c.title, reason: fails.join(' · ') })
    else qualifying.push(c)
  }
  return { qualifying, rejected }
}

// 在合格候选里按目标择优
export function pickWinner(qualifying: AmazonCandidate[], req: Requirements): AmazonCandidate | undefined {
  if (!qualifying.length) return undefined
  const sorted = [...qualifying]
  if (req.objective === 'target') {
    sorted.sort(
      (a, b) =>
        Math.abs(a.priceEur - req.targetPriceEur) - Math.abs(b.priceEur - req.targetPriceEur) ||
        b.relevance - a.relevance,
    )
  } else {
    sorted.sort((a, b) => a.priceEur - b.priceEur || b.relevance - a.relevance)
  }
  return sorted[0]
}

// 把要求总结成一行(用于展示)
export function summarizeRequirements(req: Requirements): string {
  const parts: string[] = []
  if (req.excludeBrand) parts.push('排除品牌')
  if (req.originChina) parts.push('原产地中国')
  if (req.materialMatch) parts.push('材质匹配')
  if (req.minReviews > 0) parts.push(`评论≥${req.minReviews}`)
  if (req.minStars > 0) parts.push(`评分≥${req.minStars}`)
  parts.push(req.objective === 'cheapest' ? '选最便宜' : `目标价 €${req.targetPriceEur}`)
  return parts.join(' · ')
}

// 达标清单(用于决策报告里的"满足要求")
export function satisfiedChecklist(req: Requirements): string {
  const parts: string[] = []
  if (req.originChina) parts.push('原产地中国 ✓')
  if (req.excludeBrand) parts.push('非品牌 ✓')
  if (req.materialMatch) parts.push('材质匹配 ✓')
  if (req.minReviews > 0) parts.push(`评论≥${req.minReviews} ✓`)
  if (req.minStars > 0) parts.push(`评分≥${req.minStars} ✓`)
  return parts.join(' · ')
}

// 从自然语言里抽取要求(轻量,合并进现有要求)
export function parseNlRequirements(text: string, base: Requirements): Requirements {
  const r = { ...base }
  const t = text.toLowerCase()
  if (/最便宜|便宜点|便宜的|lowest|cheapest|价低/.test(t)) r.objective = 'cheapest'
  // 目标价:"目标价15欧" / "15欧左右" / "€15" / "target 15"
  const price = t.match(/(?:目标价|target|大概|约|左右)?\s*€?\s*(\d{1,4})\s*(?:欧|eur|€)/)
  if (price) {
    r.objective = 'target'
    r.targetPriceEur = parseInt(price[1], 10)
  }
  if (/评论过千|评论上千|reviews?\s*>?\s*1000/.test(t)) r.minReviews = 1000
  else if (/评论过百|reviews?\s*>?\s*100/.test(t)) r.minReviews = 100
  else {
    const rev = t.match(/评论\s*(?:>=?|超过|大于|过)?\s*(\d{2,5})/)
    if (rev) r.minReviews = parseInt(rev[1], 10)
  }
  if (/排除品牌|非品牌|不要品牌|品牌.*(排除|剔除|不要)|无品牌/.test(t)) r.excludeBrand = true
  if (/(允许|可以|包含|含).*品牌|品牌也行/.test(t)) r.excludeBrand = false
  return r
}
