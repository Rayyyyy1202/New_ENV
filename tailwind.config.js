/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 指挥中心暗色科技风
        bg: {
          base: '#070b18', // 近黑深蓝背景
          panel: '#0e1530', // 稍浅的深蓝面板
          panel2: '#131c3d', // 卡片/二级面板
          line: '#1e2a52', // 边框线
        },
        ink: {
          DEFAULT: '#e8ecf8', // 接近白的主文字
          dim: '#8a96bf', // 中灰次要文字
          faint: '#566089', // 更暗的提示文字
        },
        // 主强调色 青色
        cyan: {
          DEFAULT: '#22d3ee',
          soft: '#67e8f9',
          deep: '#0891b2',
        },
        // 状态色
        ok: '#34d399', // 通过/匹配 绿
        warn: '#fbbf24', // 待确认/中等 琥珀
        bad: '#f87171', // 不通过/品牌命中 红
        // 亚马逊橙 仅用于亚马逊相关元素
        amazon: '#ff9900',
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', 'ui-monospace', 'monospace'],
        display: ['"Orbitron"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.4), 0 0 24px -4px rgba(34,211,238,0.45)',
        'glow-ok': '0 0 0 1px rgba(52,211,153,0.5), 0 0 24px -4px rgba(52,211,153,0.5)',
        'glow-bad': '0 0 0 1px rgba(248,113,113,0.5), 0 0 24px -4px rgba(248,113,113,0.5)',
      },
      transitionTimingFunction: {
        cmd: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.7)' },
        },
        flowLine: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        gridMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '60px 60px' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.2s ease-in-out infinite',
        flowLine: 'flowLine 2.5s linear infinite',
        blink: 'blink 1s step-end infinite',
        gridMove: 'gridMove 14s linear infinite',
      },
    },
  },
  plugins: [],
}
