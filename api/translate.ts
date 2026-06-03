import type { VercelRequest, VercelResponse } from '@vercel/node'

// Vercel Serverless Function —— OpenAI 翻译代理。
// key 仅存在于服务端环境变量 OPENAI_API_KEY,绝不进前端代码 / 不随响应返回。
// 前端 POST 一批商品原始品名,这里调用一次 OpenAI 批量返回电商语境翻译 + 买家搜索词。

interface InItem {
  id: string
  raw: string
  kind: string
}

interface OutItem {
  id: string
  enName: string
  buyerTerms: string[]
}

const SYSTEM_PROMPT = `你是亚马逊德国站(amazon.de)的资深选品与本地化专家。
给你一批中国出口商品的原始品名(可能是纯中文、中英混排,或只给了材质描述)。
对每个商品输出:
1) enName: 一个简洁、专业的英文商品标题,要贴近亚马逊德国买家真实会搜的电商关键词(不是字典直译)。
2) buyerTerms: 2-3 个买家真实会输入的搜索词变体,优先德语关键词,可混入英文,小写。
只输出 JSON,格式严格为 {"results":[{"id":"...","enName":"...","buyerTerms":["...","..."]}]}。`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // 未配置 key:返回明确信号,前端据此回退到脚本演示数据
    return res.status(503).json({ error: 'not_configured', message: 'OPENAI_API_KEY 未配置' })
  }

  const items: InItem[] = Array.isArray(req.body?.items) ? req.body.items : []
  if (!items.length) {
    return res.status(400).json({ error: 'bad_request', message: '缺少 items' })
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const userPayload = items.map((it) => ({ id: it.id, name: it.raw, type: it.kind }))

  try {
    const ctrl = new AbortController()
    const timeout = setTimeout(() => ctrl.abort(), 25000)

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify({ items: userPayload }) },
        ],
      }),
    })
    clearTimeout(timeout)

    if (!resp.ok) {
      const detail = await resp.text()
      return res.status(502).json({ error: 'upstream_error', status: resp.status, detail: detail.slice(0, 500) })
    }

    const data = await resp.json()
    const content = data?.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content)
    const results: OutItem[] = Array.isArray(parsed?.results) ? parsed.results : []

    return res.status(200).json({ model, results })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown'
    return res.status(500).json({ error: 'proxy_failure', message })
  }
}
