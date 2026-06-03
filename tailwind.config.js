/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f6f7f9', // 应用背景 · 近白浅灰
        surface: '#ffffff', // 卡片/面板
        line: '#e8eaef', // 边框
        ink: '#16181d', // 主文字
        muted: '#5b6270', // 次要文字
        faint: '#9aa0ac', // 提示文字
        // 单一主强调色 · 沉静的靛蓝
        accent: '#5b5bd6',
        accentSoft: '#eef0fb',
        // 语义状态 · 克制使用
        ok: '#16a34a',
        okSoft: '#edf7f0',
        warn: '#c2820a',
        warnSoft: '#fbf4e6',
        danger: '#dc2626',
        dangerSoft: '#fceeee',
        amazon: '#e07b00', // 仅用于欧元价格点睛
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,18,29,0.04), 0 1px 3px rgba(16,18,29,0.06)',
        lift: '0 4px 16px -4px rgba(16,18,29,0.12)',
        focus: '0 0 0 3px rgba(91,91,214,0.16)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
