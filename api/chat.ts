import type { VercelRequest, VercelResponse } from '@vercel/node'

// 对话代理:让 LinkFinder 真正"听懂"自然语言——区分"提问/闲聊"与"下命令",
// 提问就回答,命令才触发动作。key 仅存服务端 OPENAI_API_KEY。

const SYSTEM_PROMPT = `你是 LinkFinder 的 AI 助手(中文)。LinkFinder 能把装箱单里的商品自动在亚马逊德国找对标链接:
自动翻译成电商关键词、查历史库、多策略搜索、做商标/材质/原产地三重核验,AI 自动填好表,人工只需审核。

根据用户消息和当前阶段,你要:① 用中文简洁口语地回复(reply,1-3句);② 决定是否触发一个动作(action)。
阶段 phase=idle 表示还没开始;phase=review 表示 AI 已填好表、正在人工审核。

动作类型 action.type:
- "run":开始处理装箱单。可附 instruction(对任务的简洁中文重述)。仅当用户"明确要开始/找对标/处理/可以了"时用。
- "approve_all":通过全部(仅 review)
- "reject_all":驳回全部(仅 review)
- "approve":通过某商品,附 target=商品关键词(仅 review)
- "reject":驳回某商品,附 target=商品关键词(仅 review)
- "none":只对话不执行

规则:
- 用户提问或闲聊(如"你可以自动填表吗""你能做什么""支持对话吗")→ 用 reply 介绍能力并可邀请开始,action.type="none"。绝不能因为一句提问就擅自开始。
- 只有用户明确表达要开始时才 run。
- approve/reject/approve_all/reject_all 只在 phase=review 使用。
- 不确定就 none 并友好追问。

只输出 JSON:{"reply":"...","action":{"type":"...","instruction":"...","target":"..."}}`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'not_configured' })

  const message: string = req.body?.message ?? ''
  const phase: string = req.body?.phase ?? 'idle'
  const history: { role: string; text: string }[] = Array.isArray(req.body?.history) ? req.body.history : []
  if (!message.trim()) return res.status(400).json({ error: 'bad_request', message: '缺少 message' })

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const historyMsgs = history.slice(-6).map((h) => ({
    role: h.role === 'assistant' ? 'assistant' : 'user',
    content: h.text,
  }))

  try {
    const ctrl = new AbortController()
    const timeout = setTimeout(() => ctrl.abort(), 25000)
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        ...(model.startsWith('gpt-4') ? { temperature: 0.4 } : {}),
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...historyMsgs,
          { role: 'user', content: JSON.stringify({ phase, message }) },
        ],
      }),
    })
    clearTimeout(timeout)
    if (!resp.ok) {
      const detail = await resp.text()
      return res.status(502).json({ error: 'upstream_error', status: resp.status, detail: detail.slice(0, 400) })
    }
    const data = await resp.json()
    const content = data?.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content)
    return res.status(200).json({
      model,
      reply: typeof parsed.reply === 'string' ? parsed.reply : '',
      action: parsed.action ?? { type: 'none' },
    })
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'unknown'
    return res.status(500).json({ error: 'proxy_failure', message: messageText })
  }
}
