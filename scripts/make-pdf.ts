// 生成客户对比 PDF —— 内容直接取自 src/data/comparison.ts,保证与应用一致。
// 运行:npx tsx scripts/make-pdf.ts
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { hook, ordinaryPath, aiPath, steps, scores, costPoints } from '../src/data/comparison'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../LinkFinder-为什么选AI版.pdf')

const C = {
  ink: '#16181d',
  muted: '#5b6270',
  faint: '#9aa0ac',
  line: '#e3e6ec',
  accent: '#5b5bd6',
  accentSoft: '#eef0fb',
  ok: '#16a34a',
  okSoft: '#edf7f0',
  danger: '#dc2626',
  dangerSoft: '#fceeee',
  warn: '#c2820a',
  warnSoft: '#fbf4e6',
}

const pathCol = (title: string, tag: string, nodes: typeof ordinaryPath, ai: boolean) => `
  <div class="pathcol ${ai ? 'ai' : ''}">
    <div class="pathhead">
      <div class="pdot">${ai ? 'AI' : 'RPA'}</div>
      <div><div class="ptitle">${title}</div><div class="ptag" style="color:${ai ? C.accent : C.faint}">${tag}</div></div>
    </div>
    ${nodes
      .map(
        (n, i) => `<div class="pnode">
          <span class="pnum ${ai ? 'ai' : ''}">${i + 1}</span>
          <div><div class="pl">${n.label}</div><div class="pt">${n.tech}</div></div>
        </div>`,
      )
      .join('')}
  </div>`

const stepCard = (s: (typeof steps)[number]) => `
  <div class="card">
    <div class="cardhead">${s.stage}</div>
    <div class="cols">
      <div class="col">
        <div class="coltag bad"><span class="ic">✕</span> 普通版</div>
        <p class="muted">${s.ordinary}</p>
      </div>
      <div class="col">
        <div class="coltag ok"><span class="ic acc">✓</span> AI 版</div>
        <p>${s.ai}</p>
      </div>
    </div>
    <div class="win"><b>好在哪:</b> ${s.win}</div>
  </div>`

const scoreRow = (s: (typeof scores)[number]) => `
  <div class="srow">
    <div class="sdim">${s.dim}</div>
    <div class="sbars">
      <div class="sbar"><div class="fill gray" style="width:${s.ordinary}%"></div></div>
      <div class="sval">${s.ordinary}</div>
      <div class="sbar"><div class="fill acc" style="width:${s.ai}%"></div></div>
      <div class="sval acc">${s.ai}</div>
    </div>
  </div>`

const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; }
  html,body { margin:0; padding:0; }
  body { font-family:"WenQuanYi Zen Hei","Noto Sans CJK SC",sans-serif; color:${C.ink}; font-size:11px; line-height:1.55; }
  .page { padding: 0; }
  h1 { font-size:21px; margin:0 0 6px; letter-spacing:-.3px; }
  .sub { color:${C.muted}; font-size:12px; max-width:640px; }
  .banner { background:linear-gradient(120deg,${C.accent},#7a7ae6); color:#fff; padding:22px 24px; border-radius:14px; margin-bottom:18px; }
  .banner .kicker { display:inline-block; background:rgba(255,255,255,.18); padding:3px 10px; border-radius:20px; font-size:11px; margin-bottom:10px; }
  .banner .sub { color:#eef0fb; }
  .sec { margin: 16px 0; }
  .sectitle { display:flex; align-items:baseline; gap:8px; margin-bottom:10px; }
  .sectitle .n { color:${C.accent}; font-weight:700; font-size:12px; }
  .sectitle h2 { font-size:14px; margin:0; }
  .sectitle .d { color:${C.faint}; font-size:11px; }

  .paths { display:flex; gap:12px; }
  .pathcol { flex:1; border:1px solid ${C.line}; border-radius:12px; padding:14px; }
  .pathcol.ai { border-color:${C.accent}; }
  .pathhead { display:flex; align-items:center; gap:9px; margin-bottom:10px; }
  .pdot { width:30px; height:30px; border-radius:8px; background:${C.accentSoft}; color:${C.accent}; font-weight:700; font-size:11px; display:flex; align-items:center; justify-content:center; }
  .pathcol:not(.ai) .pdot { background:#f1f2f5; color:${C.muted}; }
  .ptitle { font-weight:600; font-size:12px; }
  .ptag { font-size:10px; }
  .pnode { display:flex; gap:9px; padding:3px 0; }
  .pnum { width:18px; height:18px; flex:none; border-radius:50%; background:#f1f2f5; color:${C.faint}; font-size:10px; font-weight:600; display:flex; align-items:center; justify-content:center; }
  .pnum.ai { background:${C.accentSoft}; color:${C.accent}; }
  .pl { font-weight:600; font-size:11.5px; }
  .pt { color:${C.faint}; font-size:10px; }

  .card { border:1px solid ${C.line}; border-radius:12px; overflow:hidden; margin-bottom:9px; page-break-inside:avoid; }
  .cardhead { background:#f7f8fa; padding:7px 14px; font-weight:700; font-size:12px; border-bottom:1px solid ${C.line}; }
  .cols { display:flex; }
  .col { flex:1; padding:11px 14px; }
  .col:first-child { border-right:1px solid ${C.line}; }
  .coltag { display:flex; align-items:center; gap:6px; font-size:10.5px; font-weight:600; margin-bottom:5px; }
  .coltag.bad { color:${C.muted}; }
  .coltag.ok { color:${C.accent}; }
  .ic { width:15px; height:15px; border-radius:50%; background:${C.dangerSoft}; color:${C.danger}; display:flex; align-items:center; justify-content:center; font-size:9px; }
  .ic.acc { background:${C.accentSoft}; color:${C.accent}; }
  .muted { color:${C.muted}; margin:0; }
  .col p { margin:0; }
  .win { background:${C.okSoft}; color:${C.ink}; padding:7px 14px; font-size:11px; border-top:1px solid ${C.line}; }
  .win b { color:${C.ok}; }

  .scores { border:1px solid ${C.line}; border-radius:12px; padding:14px 16px; }
  .legend { text-align:right; font-size:10px; color:${C.muted}; margin-bottom:8px; }
  .legend .acc { color:${C.accent}; margin-left:12px; }
  .srow { display:flex; align-items:center; gap:12px; padding:4px 0; }
  .sdim { width:170px; flex:none; color:${C.muted}; font-size:11px; }
  .sbars { flex:1; }
  .sbar { display:inline-block; width:calc(100% - 30px); height:7px; background:#f1f2f5; border-radius:5px; overflow:hidden; vertical-align:middle; }
  .fill { height:100%; border-radius:5px; }
  .fill.gray { background:${C.faint}; }
  .fill.acc { background:${C.accent}; }
  .sval { display:inline-block; width:24px; text-align:right; font-size:10px; color:${C.faint}; vertical-align:middle; }
  .sval.acc { color:${C.accent}; font-weight:600; }
  .srow .sbars > .sbar:first-of-type { margin-bottom:4px; }

  .cost { display:flex; flex-wrap:wrap; gap:8px; }
  .cost .item { width:calc(50% - 4px); border:1px solid ${C.line}; border-radius:10px; padding:10px 12px; display:flex; gap:8px; }
  .cost .warn { color:${C.warn}; font-weight:700; }
  .cost .item p { margin:0; color:${C.muted}; font-size:11px; }

  .foot { margin-top:18px; border-top:1px solid ${C.line}; padding-top:10px; color:${C.faint}; font-size:10px; display:flex; justify-content:space-between; }
  .foot a { color:${C.accent}; text-decoration:none; }
</style></head><body><div class="page">

  <div class="banner">
    <span class="kicker">为什么我们的 AI 版,比几千块的普通版强</span>
    <h1>${hook.title}</h1>
    <div class="sub">${hook.sub}</div>
  </div>

  <div class="sec">
    <div class="sectitle"><span class="n">01</span><h2>两条实现路径</h2><span class="d">同一件事,普通脚本 vs AI Agent 怎么跑</span></div>
    <div class="paths">
      ${pathCol('普通版 · 录制式 RPA + 规则', '一次性脚本 · 写死规则', ordinaryPath, false)}
      ${pathCol('我们的 AI 版 · Agent + 大模型', '理解 · 判断 · 自适应', aiPath, true)}
    </div>
  </div>

  <div class="sec">
    <div class="sectitle"><span class="n">02</span><h2>逐环节技术对比</h2><span class="d">每一步:普通版怎么做、AI 版怎么做、好在哪</span></div>
    ${steps.map(stepCard).join('')}
  </div>

  <div class="sec">
    <div class="sectitle"><span class="n">03</span><h2>能力对比</h2><span class="d">同维度打分,差距一目了然</span></div>
    <div class="scores">
      <div class="legend"><span>■ 普通版</span><span class="acc">■ AI 版</span></div>
      ${scores.map(scoreRow).join('')}
    </div>
  </div>

  <div class="sec">
    <div class="sectitle"><span class="n">04</span><h2>便宜的,其实更贵</h2><span class="d">几千块脚本的隐性成本</span></div>
    <div class="cost">
      ${costPoints.map((c) => `<div class="item"><span class="warn">!</span><p>${c}</p></div>`).join('')}
    </div>
  </div>

  <div class="foot">
    <span>LinkFinder · AI 对标助手 — 现场演示:<a>https://amazon-linkfinder-demo.vercel.app</a></span>
    <span>${new Date().toLocaleDateString('zh-CN')}</span>
  </div>

</div></body></html>`

const run = async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
  })
  await browser.close()
  console.log('PDF 生成:', OUT)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
