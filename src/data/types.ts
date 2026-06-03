// 全局数据类型定义

export type DbStatus = 'hit' | 'miss'

export interface PackingItem {
  id: string
  /** 原始装箱单里的"乱"品名（可能纯中文 / 中英混排 / 只有材质） */
  rawName: string
  /** 原始数据属于哪种情况，用于演示"自动识别" */
  rawKind: '纯中文' | '中英混排' | '仅材质'
  /** AI 电商语境翻译后的英文品名（亚马逊买家会搜的词） */
  enName: string
  /** AI 给出的买家真实搜索词变体 */
  buyerTerms: string[]
  /** 海关编码 */
  hsCode: string
  /** 该编码是否由 AI 推荐、待人工确认 */
  hsSuggested: boolean
  /** 标准模板字段 */
  shippingMark: string
  netWeightKg: number
  pieces: number
  usdUnitPrice: number
  volumeM3: number
  material: string
  emoji: string
  /** 数据库匹配结果 */
  db: DbStatus
  /** 语义相似度（0-100），命中时展示 */
  semantic: number
  /** 命中时的历史对标信息 */
  historyLink?: string
  historyTitle?: string
  historyPriceEur?: number
}

export type StrategyId = 'bestseller' | 'rating' | 'priceAsc' | 'featured' | 'reverseImage'

export interface SearchStrategy {
  id: StrategyId
  label: string
  /** 评论数门槛角标文案 */
  threshold: string
  desc: string
}

export type VerdictState = 'pass' | 'fail'

export interface AmazonCandidate {
  id: string
  title: string
  priceEur: number
  reviews: number
  stars: number
  emoji: string
  /** 角标：畅销 / 亚马逊之选 / 无 */
  badge?: '畅销' | '亚马逊之选'
  /** AI 多模态相关性评分 0-100 */
  relevance: number
  /** AI 从详情页抽取的材质 */
  extractedMaterial: string
  /** AI 抽取的原产地 */
  extractedOrigin: string
  /** AI 识别的疑似品牌词，无则空串 */
  suspectedBrand: string
  /** 三重核验结果 */
  trademark: VerdictState // 商标核验：pass=非注册品牌
  materialCheck: VerdictState // 材质核验
  originCheck: VerdictState // 原产地核验
  /** 被排除时的原因（任一核验 fail 或相关性过低） */
  excludeReason?: string
  /** AI 推荐理由（综合择优时展示） */
  reason?: string
  /** 在每个策略下出现于哪些标签（用于切换洗牌） */
  strategies: StrategyId[]
}
