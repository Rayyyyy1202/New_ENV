// 前端调用后端翻译代理。失败时返回 null，由调用方回退到脚本演示数据。

export interface LiveTranslation {
  id: string
  enName: string
  buyerTerms: string[]
}

export interface LiveResult {
  ok: boolean
  /** 是否因后端未配置 key 而不可用（用于提示用户去 Vercel 配置） */
  notConfigured?: boolean
  model?: string
  results: LiveTranslation[]
}

export async function liveTranslate(
  items: { id: string; raw: string; kind: string }[],
): Promise<LiveResult> {
  try {
    const resp = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })

    if (resp.status === 503) {
      return { ok: false, notConfigured: true, results: [] }
    }
    if (!resp.ok) {
      return { ok: false, results: [] }
    }

    const data = await resp.json()
    return { ok: true, model: data.model, results: data.results ?? [] }
  } catch {
    return { ok: false, results: [] }
  }
}
