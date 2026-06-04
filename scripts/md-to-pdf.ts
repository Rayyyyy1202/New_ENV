// 通用 Markdown → PDF(中文字体 + 打印排版)。
// 用法:npx tsx scripts/md-to-pdf.ts <input.md> <output.pdf>
// 需要:npm i -D marked puppeteer
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { marked } from 'marked'
import puppeteer from 'puppeteer'

const [, , inArg, outArg] = process.argv
if (!inArg) {
  console.error('用法: npx tsx scripts/md-to-pdf.ts <input.md> [output.pdf]')
  process.exit(1)
}
const inPath = resolve(inArg)
const outPath = resolve(outArg || inPath.replace(/\.md$/i, '.pdf'))

const body = marked.parse(readFileSync(inPath, 'utf8')) as string

const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}
  body{font-family:"WenQuanYi Zen Hei","Noto Sans CJK SC",sans-serif;color:#16181d;font-size:12px;line-height:1.65;margin:0;padding:0}
  h1{font-size:22px;margin:0 0 4px;letter-spacing:-.3px}
  h1+p{color:#5b6270;margin:0 0 6px}
  h2{font-size:16px;margin:22px 0 8px;padding-bottom:5px;border-bottom:2px solid #eef0fb;color:#16181d}
  h3{font-size:13px;margin:14px 0 4px;color:#5b5bd6}
  p{margin:6px 0}
  ul{margin:6px 0;padding-left:18px}
  li{margin:3px 0}
  strong{color:#16181d}
  hr{border:none;border-top:1px solid #e8eaef;margin:16px 0}
  blockquote{margin:10px 0;padding:8px 12px;background:#f6f7f9;border-left:3px solid #5b5bd6;color:#5b6270}
  code{background:#f1f2f5;padding:1px 4px;border-radius:4px;font-family:"JetBrains Mono",monospace;font-size:11px}
  table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11px}
  th,td{border:1px solid #e8eaef;padding:6px 8px;text-align:left;vertical-align:top}
  th{background:#eef0fb;color:#16181d;font-weight:600}
  tr:nth-child(even) td{background:#fafbfc}
</style></head><body>${body}</body></html>`

const run = async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' },
  })
  await browser.close()
  console.log('PDF 生成:', outPath)
}
run().catch((e) => {
  console.error(e)
  process.exit(1)
})
