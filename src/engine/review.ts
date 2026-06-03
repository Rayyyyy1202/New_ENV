import { packingList } from '../data/packingList'
import { showerHeadCandidates, bestCandidate } from '../data/amazonCandidates'
import { exceptions } from '../data/roi'
import type { AmazonCandidate } from '../data/types'

// 一行"AI 自动填好、待人工审核"的对标结果。
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface RejectedCandidate {
  title: string
  reason: string
}

export interface ReviewItem {
  id: string
  emoji: string
  product: string // AI 翻译后的英文品名
  rawName: string
  rawKind: string
  source: 'history' | 'amazon' // 来自历史库复用 / 亚马逊实时搜索
  link: string
  title: string
  priceEur: number
  confidence: number // AI 置信度 0-100
  reasoning: string // AI 为什么这么填(一句话)
  // 审核时可展开的依据
  buyerTerms: string[]
  semantic?: number
  checks?: { trademark: boolean; material: boolean; origin: boolean }
  rejectedCandidates?: RejectedCandidate[]
  needsReview: boolean // 低置信度 / 异常,重点复核
  status: ReviewStatus
}

const exceptionMap = new Map(exceptions.map((e) => [e.id, e]))

function excluded(c: AmazonCandidate) {
  return c.trademark === 'fail' || c.materialCheck === 'fail' || c.originCheck === 'fail' || c.relevance < 60
}

// 由内置数据构建"AI 已自动填表"的审核队列。
export function buildReviewItems(): ReviewItem[] {
  return packingList.map((p) => {
    const base = {
      id: p.id,
      emoji: p.emoji,
      product: p.enName,
      rawName: p.rawName,
      rawKind: p.rawKind,
      buyerTerms: p.buyerTerms,
      status: 'pending' as ReviewStatus,
    }

    // 主演:莲蓬头走亚马逊实时搜索 + 三重核验 + 综合择优
    if (p.db === 'miss') {
      const win = bestCandidate()
      const rejected: RejectedCandidate[] = showerHeadCandidates
        .filter((c) => c.id !== win.id && excluded(c) && c.excludeReason)
        .map((c) => ({ title: c.title, reason: c.excludeReason! }))
      return {
        ...base,
        source: 'amazon',
        link: 'amazon.de/dp/B0CKSHOWER9',
        title: win.title,
        priceEur: win.priceEur,
        confidence: win.relevance,
        reasoning: win.reason ?? '综合相关性、评论与核验结果择优',
        checks: { trademark: true, material: true, origin: true },
        rejectedCandidates: rejected,
        needsReview: false,
      }
    }

    // 异常项:低置信度,AI 给出原因+建议,交人工定夺
    const ex = exceptionMap.get(p.id)
    if (ex) {
      return {
        ...base,
        source: 'history',
        link: p.historyLink ?? '—',
        title: p.historyTitle ?? '—',
        priceEur: p.historyPriceEur ?? 0,
        confidence: p.semantic,
        reasoning: `${ex.reason}；建议：${ex.suggestion}`,
        semantic: p.semantic,
        needsReview: true,
      }
    }

    // 普通命中:历史库语义复用
    return {
      ...base,
      source: 'history',
      link: p.historyLink ?? '—',
      title: p.historyTitle ?? '—',
      priceEur: p.historyPriceEur ?? 0,
      confidence: p.semantic,
      reasoning: `历史库语义命中 ${p.semantic}%,直接复用既有对标`,
      semantic: p.semantic,
      needsReview: false,
    }
  })
}

// ───────── AI 执行流(自然语言进度) ─────────
export interface AgentStep {
  text: string
  detail?: string
  ms: number // 该步停留时长
}

export interface StepOrigin {
  channelName: string
  sender: string
  attachment?: string
}

export function buildAgentSteps(instruction: string, liveModel?: string, origin?: StepOrigin): AgentStep[] {
  const translateLine = liveModel
    ? `调用真实模型 ${liveModel} 翻译为亚马逊买家会搜的电商关键词`
    : '把中文品名翻译为亚马逊买家会搜的电商关键词'
  const lead: AgentStep[] = origin
    ? [
        {
          text: `从【${origin.channelName}】读取 ${origin.sender} 的聊天记录`,
          detail: origin.attachment ? `解析附件 ${origin.attachment} · 提取工单指令` : '理解上下文 · 提取工单指令',
          ms: 1000,
        },
        { text: '已提取工单指令', detail: instruction, ms: 700 },
      ]
    : [{ text: `收到指令`, detail: instruction, ms: 700 }]
  return [
    ...lead,
    { text: '识别装箱单 · 12 个商品', detail: '中英混排,含纯中文与"仅材质"行', ms: 900 },
    { text: translateLine, detail: 'AI 电商语境翻译 + 海关编码智能推荐', ms: 1100 },
    { text: '语义向量检索历史对标库', detail: '中文/英文/翻译名映射到同一语义空间', ms: 1000 },
    { text: '10 项命中历史库 · 莲蓬头无对标', detail: '未命中项转亚马逊德国实时搜索', ms: 1000 },
    { text: '亚马逊德国多策略搜索 + 多模态相关性评分', detail: '看图+标题判断是否同款', ms: 1100 },
    { text: '读详情页抽材质/原产地 + 商标库核验', detail: '揪出品牌词送 EUIPO 核验,三重核验逐项判定', ms: 1100 },
    { text: '已自动填好 12 行对标结果', detail: '其中 2 行低置信度,已标注重点复核 → 请审核', ms: 700 },
  ]
}

// ───────── 自然语言指令解析 ─────────
export type Command =
  | { kind: 'run'; only?: string }
  | { kind: 'approveAll' }
  | { kind: 'rejectAll' }
  | { kind: 'approve'; match: string }
  | { kind: 'reject'; match: string }
  | { kind: 'reset' }
  | { kind: 'unknown' }

// 商品关键词 → 便于"驳回莲蓬头""通过瑜伽垫"这类指令匹配
const KEYWORDS: { id: string; words: string[] }[] = [
  { id: 'p01', words: ['电钻', 'drill', 'bohr'] },
  { id: 'p02', words: ['净水', 'water purifier', 'wasserfilter'] },
  { id: 'p03', words: ['瑜伽', 'yoga'] },
  { id: 'p04', words: ['普拉提', 'pilates'] },
  { id: 'p05', words: ['脚踝', '负重', 'ankle'] },
  { id: 'p06', words: ['弹力带', 'band', '阻力'] },
  { id: 'p07', words: ['保温杯', 'bottle', 'flasche'] },
  { id: 'p08', words: ['饭盒', '便当', 'lunch'] },
  { id: 'p09', words: ['莲蓬头', '花洒', 'shower', '喷头'] },
  { id: 'p10', words: ['化妆镜', '镜', 'mirror'] },
  { id: 'p11', words: ['泡沫轴', 'foam', '狼牙'] },
  { id: 'p12', words: ['宠物', '饮水', 'pet'] },
]

export function matchItemId(text: string): string | undefined {
  const low = text.toLowerCase()
  return KEYWORDS.find((k) => k.words.some((w) => low.includes(w.toLowerCase())))?.id
}

export function parseCommand(text: string, phase: 'idle' | 'review'): Command {
  const t = text.trim().toLowerCase()
  if (!t) return { kind: 'unknown' }

  if (/(重新开始|重来|reset|清空|重新演示)/.test(t)) return { kind: 'reset' }
  if (/(全部通过|都通过|全通过|approve all|all good|全部批准)/.test(t)) return { kind: 'approveAll' }
  if (/(全部驳回|都驳回|reject all)/.test(t)) return { kind: 'rejectAll' }

  if (phase === 'review') {
    if (/(通过|批准|approve|确认|ok)/.test(t)) {
      const id = matchItemId(t)
      if (id) return { kind: 'approve', match: id }
    }
    if (/(驳回|拒绝|reject|换|重搜|不要)/.test(t)) {
      const id = matchItemId(t)
      if (id) return { kind: 'reject', match: id }
    }
  }

  // idle 阶段:任何指令都启动;识别"只/仅 + 某商品"
  if (phase === 'idle') {
    const onlyId = /(只|仅|single|just)/.test(t) ? matchItemId(t) : undefined
    return { kind: 'run', only: onlyId }
  }
  return { kind: 'unknown' }
}

// 首页示例指令
export const EXAMPLE_COMMANDS = [
  '给这份装箱单在亚马逊德国找对标链接',
  '帮我对标,品牌商品要排除掉',
  '只处理莲蓬头,找个非品牌的高相关款',
]
