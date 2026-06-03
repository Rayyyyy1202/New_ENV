// 渠道接入 + 工单收件箱（演示假数据）。
// 体现:AI agent 可从微信/飞书/企业微信/邮箱自动收取工单、读取聊天记录、提取指令。

export interface Channel {
  id: string
  name: string
  emoji: string
  connected: boolean
}

export const channels: Channel[] = [
  { id: 'feishu', name: '飞书', emoji: '🪶', connected: true },
  { id: 'wecom', name: '企业微信', emoji: '💼', connected: true },
  { id: 'wechat', name: '微信', emoji: '💬', connected: true },
  { id: 'email', name: '邮箱', emoji: '✉️', connected: true },
  { id: 'dingtalk', name: '钉钉', emoji: '🔷', connected: false },
]

export interface OrderOrigin {
  channelName: string
  channelEmoji: string
  sender: string
  attachment?: string
}

export interface ChatLine {
  from: 'them' | 'me'
  text: string
}

export interface WorkOrder {
  id: string
  channelId: string
  channelName: string
  channelEmoji: string
  sender: string
  senderRole: string
  time: string
  chat: ChatLine[]
  attachment?: string
  instruction: string // AI 从聊天记录中提取的指令
  unread?: boolean
}

export const workOrders: WorkOrder[] = [
  {
    id: 'w1',
    channelId: 'feishu',
    channelName: '飞书',
    channelEmoji: '🪶',
    sender: '王经理',
    senderRole: '采购部',
    time: '09:24',
    chat: [
      { from: 'them', text: '新到一批货要报关,麻烦在德国亚马逊上帮我找下对标链接' },
      { from: 'them', text: '装箱单在附件,品牌的别选啊,会有合规问题' },
      { from: 'me', text: '收到,AI 这就处理 👌' },
    ],
    attachment: '装箱单_NB-DE-2406.xlsx',
    instruction: '给这份装箱单在亚马逊德国找对标链接,品牌商品排除掉',
    unread: true,
  },
  {
    id: 'w2',
    channelId: 'wecom',
    channelName: '企业微信',
    channelEmoji: '💼',
    sender: '李工',
    senderRole: '关务',
    time: '昨天',
    chat: [
      { from: 'them', text: '莲蓬头那个上次没找到合适的' },
      { from: 'them', text: '帮忙单独再搜一个,要非品牌、相关性高的' },
    ],
    instruction: '只处理莲蓬头,找个非品牌的高相关款',
  },
  {
    id: 'w3',
    channelId: 'email',
    channelName: '邮箱',
    channelEmoji: '✉️',
    sender: 'Anna (DE Sales)',
    senderRole: 'supplier@nbtrade.de',
    time: '周一',
    chat: [
      { from: 'them', text: 'Hi, könnt ihr für die neue Ladung Amazon.de Vergleichslinks heraussuchen?' },
      { from: 'them', text: 'Markenprodukte bitte ausschließen. Danke!' },
    ],
    attachment: 'packing_list_2406.csv',
    instruction: '给这份装箱单在亚马逊德国找对标链接,品牌商品排除掉',
  },
]

// 用于"实时飘入"演示的新消息工单(初始不在收件箱里,延迟飘入)。
export const incomingOrder: WorkOrder = {
  id: 'w0',
  channelId: 'wechat',
  channelName: '微信',
  channelEmoji: '💬',
  sender: '张总',
  senderRole: '客户',
  time: '刚刚',
  chat: [
    { from: 'them', text: '急!这批样品明天要装柜' },
    { from: 'them', text: '先把德国亚马逊的对标链接整出来,品牌的别要' },
  ],
  attachment: '样品清单_0603.png',
  instruction: '给这份装箱单在亚马逊德国找对标链接,品牌商品排除掉',
  unread: true,
}

