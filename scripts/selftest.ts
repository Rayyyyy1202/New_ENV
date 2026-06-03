// 数据层自检 —— 对照文档第十节验收标准校验内置数据与逻辑。
// 运行：npx tsx scripts/selftest.ts
import { packingList, HERO_ITEM_ID } from '../src/data/packingList'
import { strategies, candidatesForStrategy, bestCandidate, showerHeadCandidates } from '../src/data/amazonCandidates'
import { roi, qualityReport, exceptions, compareData } from '../src/data/roi'
import { buildReviewItems, parseCommand, matchItemId } from '../src/engine/review'
import { channels, workOrders } from '../src/data/inbox'
import { steps as compareSteps, scores as compareScores, ordinaryPath, aiPath } from '../src/data/comparison'
import type { AmazonCandidate } from '../src/data/types'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    pass++
    console.log(`  ✅ ${name}`)
  } else {
    fail++
    console.log(`  ❌ ${name} ${detail}`)
  }
}

// 与 UI 一致的排除判定
const isExcluded = (c: AmazonCandidate) =>
  c.trademark === 'fail' || c.materialCheck === 'fail' || c.originCheck === 'fail' || c.relevance < 60

console.log('\n【装箱单数据】')
check('商品数量为 12', packingList.length === 12, `实际 ${packingList.length}`)
const kinds = new Set(packingList.map((p) => p.rawKind))
check('覆盖三种原始情况(纯中文/中英混排/仅材质)', kinds.size === 3, `实际 ${[...kinds]}`)
check('恰有 1 个数据库未命中(主演莲蓬头)', packingList.filter((p) => p.db === 'miss').length === 1)
check('主演商品 p09 未命中', packingList.find((p) => p.id === HERO_ITEM_ID)?.db === 'miss')
check('存在 AI 推荐海关编码(待确认)', packingList.some((p) => p.hsSuggested))
check('每个商品都有英文译名与买家搜索词', packingList.every((p) => p.enName && p.buyerTerms.length >= 1))
check('命中项均带语义相似度与历史对标', packingList.filter((p) => p.db === 'hit').every((p) => p.semantic > 0 && p.historyLink))

console.log('\n【亚马逊候选 · 戏剧性剧情】')
check('存在品牌命中被排除(trademark fail)', showerHeadCandidates.some((c) => c.trademark === 'fail'))
check('存在材质不符被排除(material fail)', showerHeadCandidates.some((c) => c.materialCheck === 'fail'))
check('存在原产地非中国被排除(origin fail)', showerHeadCandidates.some((c) => c.originCheck === 'fail'))
check('存在相关性过低沉底(<60)', showerHeadCandidates.some((c) => c.relevance < 60))
const passing = showerHeadCandidates.filter((c) => !isExcluded(c))
check('存在全核验通过的候选', passing.length > 0)
const best = bestCandidate()
check('综合择优=全通过中相关性最高', best && best.relevance === Math.max(...passing.map((c) => c.relevance)))
check('推荐卡带推荐理由', !!best?.reason)
check('被排除卡均有排除原因', showerHeadCandidates.filter(isExcluded).every((c) => !!c.excludeReason))

console.log('\n【五种搜索策略】')
check('恰好 5 种策略', strategies.length === 5, `实际 ${strategies.length}`)
strategies.forEach((s) => {
  const n = candidatesForStrategy(s.id).length
  check(`策略「${s.label}」候选 4-6 张`, n >= 4 && n <= 6, `实际 ${n}`)
})

console.log('\n【审核引擎 · AI 自动填表】')
const review = buildReviewItems()
check('审核队列 12 行', review.length === 12)
check('每行均由 AI 填好对标(标题+链接+置信度)', review.every((r) => r.title && r.link && r.confidence > 0))
check('每行均带 AI 理由', review.every((r) => !!r.reasoning))
check('莲蓬头来自亚马逊新对标且含三重核验', review.some((r) => r.source === 'amazon' && r.checks))
check('恰有 2 行低置信度需重点复核', review.filter((r) => r.needsReview).length === 2)
check('被推荐行附带已排除候选清单', review.some((r) => (r.rejectedCandidates?.length ?? 0) > 0))
check('初始状态均为待审核', review.every((r) => r.status === 'pending'))

console.log('\n【自然语言指令解析】')
check('"全部通过" → approveAll', parseCommand('全部通过', 'review').kind === 'approveAll')
check('"驳回莲蓬头" → reject p09', JSON.stringify(parseCommand('驳回莲蓬头', 'review')) === JSON.stringify({ kind: 'reject', match: 'p09' }))
check('"通过瑜伽垫" → approve p03', JSON.stringify(parseCommand('通过瑜伽垫', 'review')) === JSON.stringify({ kind: 'approve', match: 'p03' }))
check('"只处理莲蓬头" → run only p09', JSON.stringify(parseCommand('只处理莲蓬头', 'idle')) === JSON.stringify({ kind: 'run', only: 'p09' }))
check('关键词匹配 shower → p09', matchItemId('帮我看看 shower head') === 'p09')

console.log('\n【渠道接入 / 工单收件箱】')
check('已接入渠道含飞书/企业微信/微信/邮箱', ['feishu', 'wecom', 'wechat', 'email'].every((id) => channels.some((c) => c.id === id && c.connected)))
check('工单 >= 2 条', workOrders.length >= 2)
check('每条工单都有聊天记录与提取指令', workOrders.every((o) => o.chat.length >= 1 && o.instruction))
check('工单指令可被解析为有效运行', workOrders.every((o) => parseCommand(o.instruction, 'idle').kind === 'run'))

console.log('\n【对比 · 为什么选 AI 版】')
check('逐环节对比 >= 6 条', compareSteps.length >= 6)
check('每条含 普通版/AI版/好在哪', compareSteps.every((s) => s.ordinary && s.ai && s.win))
check('两条实现路径均非空', ordinaryPath.length > 0 && aiPath.length > 0)
check('能力评分 AI 全面高于普通版', compareScores.every((s) => s.ai > s.ordinary))

console.log('\n【投资回报 / 质检报告 / 异常归类】')
check('ROI 商品数=12', roi.itemCount === 12)
check('ROI 提速倍数已计算', roi.speedupX > 1, `实际 ${roi.speedupX}×`)
check('对比图含人工与RPA两条', compareData.length === 2)
check('质检报告字段完整', !!qualityReport.matched && qualityReport.brandExcluded >= 0)
check('AI 异常归类有原因+建议', exceptions.length >= 1 && exceptions.every((e) => e.reason && e.suggestion))

console.log(`\n========= 结果：${pass} 通过 / ${fail} 失败 =========`)
if (fail > 0) process.exit(1)
