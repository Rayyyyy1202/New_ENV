// 投资回报与质检报告假数据 — 全部可调

export const roi = {
  itemCount: 12,
  // 机器人本次用时（秒）
  robotSeconds: 182, // ≈ 3 分钟
  // 人工预估用时（分钟/每个商品）
  humanMinutesPerItem: 20,
  get humanMinutesTotal() {
    return this.itemCount * this.humanMinutesPerItem // 240 分钟 ≈ 4 小时
  },
  get speedupX() {
    return Math.round((this.humanMinutesTotal * 60) / this.robotSeconds)
  },
}

// 人工 vs 机器人耗时对比（分钟）
export const compareData = [
  { name: '人工流程', 分钟: 240, fill: '#8a96bf' },
  { name: 'RPA + AI', 分钟: 3, fill: '#22d3ee' },
]

// AI 质检报告卡
export const qualityReport = {
  matched: '10 / 12',
  avgRelevance: 88,
  brandExcluded: 3,
  needReview: 2,
  zeroMiss: true,
}

// 第四站 AI 异常归类：未找到合格对标 / 需人工复核的商品及 AI 给出的原因与建议
export const exceptions: { id: string; reason: string; suggestion: string }[] = [
  {
    id: 'p06',
    reason: '历史对标语义相似度偏低（79%），候选乳胶材质与装箱单存在差异',
    suggestion: '建议人工复核材质口径后确认',
  },
  {
    id: 'p11',
    reason: '库内对标为品牌款（BLACKROLL），亚马逊候选多命中注册商标',
    suggestion: '建议换「faszienrolle 非品牌」搜索词上亚马逊重试',
  },
]
