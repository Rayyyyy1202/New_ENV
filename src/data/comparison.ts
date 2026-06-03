// 销售对比内容:普通版(几千块的录制式 RPA/脚本) vs 我们的 AI Agent 版。
// 从技术实现路径上讲透差距。数据可直接编辑。

// 一句话钩子
export const hook = {
  title: '别人卖你一个会点鼠标的脚本,我们给你一个会判断的 AI 同事',
  sub: '同样一件事,普通脚本靠"写死的规则 + 录制的点击",AI 版靠"理解 + 判断 + 自适应"。下面从技术路径讲透差距。',
}

// 两条实现路径(架构对比)
export interface PathNode {
  label: string
  tech: string
}

export const ordinaryPath: PathNode[] = [
  { label: '人工导入表格', tech: '手动整理 Excel,列名必须对齐模板' },
  { label: '词典/翻译API直译', tech: '逐词翻译,固定词表' },
  { label: 'Excel/SQL 精确匹配', tech: 'VLOOKUP / LIKE 字符串比对' },
  { label: '录制式点击抓取', tech: '按钮坐标 / 固定 XPath,单一排序' },
  { label: '关键词撞上即选', tech: '取第一个 / 简单规则排序' },
  { label: '人工肉眼审查', tech: '逐个点开看图、查商标、核材质' },
]

export const aiPath: PathNode[] = [
  { label: '工单自动受理', tech: '微信/飞书消息+附件,LLM 提取指令' },
  { label: 'LLM 电商语境翻译', tech: '输出买家真实搜索词,容忍乱表' },
  { label: '语义向量检索', tech: 'Embedding 近义匹配,越用越准' },
  { label: '多策略 + 抗变化定位', tech: '5 种排序,语义定位抗改版' },
  { label: '多模态相关性评分', tech: '图+标题判断是否同款' },
  { label: 'AI 三重核验 + 择优', tech: 'NER 品牌词→EUIPO,材质/原产地抽取' },
  { label: '高置信自动过 · 异常转人工', tech: '可解释 + 失败归因 + 建议' },
]

// 逐环节技术对比
export interface CompareStep {
  key: string
  stage: string
  ordinary: string // 普通版怎么做(技术)
  ai: string // AI 版怎么做(技术)
  win: string // 好在哪 / 普通版的风险
}

export const steps: CompareStep[] = [
  {
    key: 'translate',
    stage: '看懂装箱单 · 翻译',
    ordinary: '固定词典逐词直译;列名写死,换个客户模板就崩。"莲蓬头"可能译成 lotus head。',
    ai: 'LLM 电商语境翻译,输出亚马逊买家真实会搜的德语/英文关键词;中英混排、只给材质、乱列名都能读懂。',
    win: '普通版翻译生硬、模板一变就失败;AI 自适应、贴近真实搜索词,搜得到、搜得准。',
  },
  {
    key: 'db',
    stage: '查历史对标库',
    ordinary: 'Excel/SQL 精确匹配(VLOOKUP/LIKE),字面不一样就查不到——yoga mat ≠ 瑜伽垫。',
    ai: '语义向量检索(Embedding),近义即命中,把中文/英文/翻译名映射到同一语义空间。',
    win: '普通版命中率低、天天重复劳动;AI 复用率高,越用越快、越省。',
  },
  {
    key: 'search',
    stage: '上亚马逊搜索',
    ordinary: '录制坐标/固定 XPath 的点击脚本;页面一改版、弹窗、验证码就挂;只跑单一排序。',
    ai: '多策略检索 + 语义定位,抗页面改版;覆盖畅销/评分/价格/精选/反向图搜 5 种排序。',
    win: '普通版脆、三天两头要人修,维护成本高;AI 稳、覆盖广。',
  },
  {
    key: 'relevance',
    stage: '判断是不是同款',
    ordinary: '关键词撞上就算同款,或干脆让员工一个个点开肉眼比对。',
    ai: '多模态 AI 同时看商品图和标题打相关性分,自动排掉"浴室置物架"这种撞词不同款。',
    win: '普通版要么误选、要么慢;AI 又准又快,替代最耗时的肉眼比对。',
  },
  {
    key: 'trademark',
    stage: '商标合规',
    ordinary: '多数不查;或维护一份静态品牌黑名单;或人工去 EUIPO 一个个查。',
    ai: 'NER 自动抽出疑似品牌词 → 实时查欧盟商标库(EUIPO)→ 命中注册商标即排除。',
    win: '普通版漏检品牌=报关/合规风险(罚款、扣货);AI 零漏检,先判断再查。',
  },
  {
    key: 'material',
    stage: '材质 / 原产地核验',
    ordinary: '基本不做,或人工逐条点开详情页读。',
    ai: 'AI 读详情页抽取材质与原产地,和装箱单比对(材质须匹配、原产地须中国)。',
    win: '普通版要么漏、要么慢;AI 自动核验,合规口径稳。',
  },
  {
    key: 'exception',
    stage: '择优 · 异常处理',
    ordinary: '取第一个或简单规则;失败就空着/报错,黑箱,不告诉你为什么,得人去收拾。',
    ai: '综合相关性/评论/价格择优;失败自动归因并给下一步建议;低置信自动转人工。',
    win: '普通版黑箱、出错要人善后;AI 可解释、可控、自己兜底。',
  },
  {
    key: 'trigger',
    stage: '任务怎么进来',
    ordinary: '人工导表、手动点、定时批跑——始终要人驱动。',
    ai: '从微信/飞书工单自动受理,读聊天记录+附件,自动开跑,跑完回写并回群。',
    win: '普通版人是发动机;AI 端到端自动,人只在异常时介入。',
  },
]

// 能力评分(0-100),用于对比条
export interface ScoreRow {
  dim: string
  ordinary: number
  ai: number
}

export const scores: ScoreRow[] = [
  { dim: '翻译/搜词质量', ordinary: 35, ai: 92 },
  { dim: '模板/改版适应性', ordinary: 25, ai: 90 },
  { dim: '历史库命中率', ordinary: 40, ai: 88 },
  { dim: '同款判断准确度', ordinary: 45, ai: 91 },
  { dim: '商标合规零漏检', ordinary: 20, ai: 98 },
  { dim: '异常可解释性', ordinary: 30, ai: 90 },
  { dim: '端到端自动化', ordinary: 35, ai: 95 },
  { dim: '长期维护成本(越高越省)', ordinary: 30, ai: 85 },
]

// 成本视角:便宜的其实更贵
export const costPoints = [
  '脚本按坐标/XPath 点击,亚马逊一改版就失效,每月都要花钱请人维护。',
  '不查商标 / 漏检品牌,一旦报关合规出问题,罚款扣货的代价远超脚本省下的钱。',
  '不会判断,误选对标 → 估价失真、退货纠纷,隐性损失高。',
  '只会按固定流程跑,换平台、换模板要重做脚本;AI 改一句指令就行。',
]
