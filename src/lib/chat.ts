import { parseCommand, matchItemId } from '../engine/review'

// 前端对话调用 + 本地兜底(后端未配置或失败时仍能"像对话")。

export interface ChatAction {
  type: 'run' | 'approve_all' | 'reject_all' | 'approve' | 'reject' | 'none'
  instruction?: string
  target?: string
}

export interface ChatResult {
  reply: string
  action: ChatAction
  model?: string
  live: boolean // 是否来自真实模型
}

export interface ChatTurn {
  role: 'user' | 'assistant'
  text: string
}

export async function chat(message: string, phase: 'idle' | 'review', history: ChatTurn[]): Promise<ChatResult> {
  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, phase, history }),
    })
    if (!resp.ok) return localReply(message, phase)
    const data = await resp.json()
    return {
      reply: data.reply || '好的。',
      action: data.action ?? { type: 'none' },
      model: data.model,
      live: true,
    }
  } catch {
    return localReply(message, phase)
  }
}

// 本地兜底:用关键词规则模拟对话,绝不因一句提问就擅自开跑。
export function localReply(message: string, phase: 'idle' | 'review'): ChatResult {
  const t = message.trim()
  const isQuestion = /[?？]|吗|嘛|呢|么|能不能|可不可以|可以吗|怎么|如何|是什么|能做什么|支持/.test(t)

  if (phase === 'review') {
    const cmd = parseCommand(t, 'review')
    switch (cmd.kind) {
      case 'approveAll':
        return { reply: '好的,已通过全部待审项。', action: { type: 'approve_all' }, live: false }
      case 'rejectAll':
        return { reply: '已驳回全部待审项。', action: { type: 'reject_all' }, live: false }
      case 'approve':
        return { reply: '已通过该项。', action: { type: 'approve', target: t }, live: false }
      case 'reject':
        return { reply: '已驳回该项,可换个搜索词重试。', action: { type: 'reject', target: t }, live: false }
      case 'reset':
        return { reply: '好的,重新开始。', action: { type: 'none' }, live: false }
      default:
        return {
          reply: '我在审核台,可以说"全部通过""驳回莲蓬头""通过瑜伽垫"等;也可以问我某项为什么这么填。',
          action: { type: 'none' },
          live: false,
        }
    }
  }

  // idle
  if (isQuestion) {
    return {
      reply:
        '可以的 👌 我能把装箱单里每个商品自动在亚马逊德国找好对标:翻译成买家会搜的词、查历史库、多策略搜索、再做商标/材质/原产地核验,AI 填好表你只需审核。要现在开始吗?直接说"开始"就行。',
      action: { type: 'none' },
      live: false,
    }
  }
  // 明确的开始意图 / 提到具体商品 → run
  const startIntent = /开始|找对标|对标|处理|搜|跑一下|来吧|可以了|加载|run|go|start/i.test(t) || !!matchItemId(t)
  if (startIntent) {
    return { reply: '好的,这就开始处理装箱单。', action: { type: 'run', instruction: t }, live: false }
  }
  return {
    reply: '我可以帮你给装箱单在亚马逊德国找对标链接。说一声"开始",或直接告诉我你的需求(比如"品牌的排除掉")。',
    action: { type: 'none' },
    live: false,
  }
}
