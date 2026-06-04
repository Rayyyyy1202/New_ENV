// 生成真实可打开的亚马逊德国链接。
// 演示不抓取(amazon.de 反爬),改用真实搜索链接:点击直达 amazon.de 真实在售结果。

export function amazonSearchUrl(terms: string[], fallback = ''): string {
  const q = (terms.find((t) => t && t.trim()) || fallback).trim()
  return `https://www.amazon.de/s?k=${encodeURIComponent(q)}`
}

// 友好的短展示文案(不展示超长 URL)
export function amazonDisplay(terms: string[], fallback = ''): string {
  const q = (terms.find((t) => t && t.trim()) || fallback).trim()
  return `amazon.de/s?k=${q}`
}
