# LinkFinder · AI 对标助手（销售演示）

> 把"装箱单 → 翻译 → 查历史库 → 亚马逊德国搜索 → 商标/材质/原产地核验 → 固化对标链接"
> 这套繁琐的人工流程,收敛成一句话:**你下指令,AI 自动填表,你只管审核。**
> 极简浅色界面,内置假数据,本地即可运行;第一站翻译已接通真实 OpenAI 模型(可选)。

线上演示:**https://amazon-linkfinder-demo.vercel.app**

---

## 一、核心交互(本次重构后)

不再是点来点去的五个站点,而是一条**对话式**主线:

1. **下指令** —— 首页一个自然语言输入框。输入"给这份装箱单在亚马逊德国找对标链接",
   或点示例指令 / "加载示例装箱单"。
2. **AI 自动执行** —— 屏幕显示 AI 用自然语言播报它在做什么(识别 → 翻译 → 语义查库 →
   亚马逊多策略搜索 → 三重核验)。
3. **AI 自动填表,你来审核** —— AI 把 12 行对标结果**填好**:对标标题、链接、欧元价、
   置信度、以及"为什么这么填"的理由。你逐行 **通过 / 驳回**,或点 **查看依据** 审计 AI 的判断
   (翻译、语义相似度、三重核验、已排除的候选)。低置信度行自动标 **重点复核**。
4. **自然语言审核** —— 底部输入框支持"全部通过""驳回莲蓬头""通过瑜伽垫"等口语指令。
5. **汇总** —— 通过数、耗时对比、效率提升、AI 质检。

## 二、本地运行

```bash
npm install
npm run dev        # 打开终端给出的地址(默认 http://localhost:5173)

npm run build      # 生产构建 + 类型检查
npm run preview    # 本地预览构建产物
npx tsx scripts/selftest.ts   # 数据层 + 引擎自检(对照验收标准)
```

### 生成客户对比 PDF

`docs` 之外另有一份可直接发客户的对比一页纸(普通版 vs AI 版),内容取自 `src/data/comparison.ts`:

```bash
npm i -D puppeteer    # 仅生成 PDF 时需要(会下载 Chromium;故不放进默认依赖)
npm run pdf           # 生成 LinkFinder-为什么选AI版.pdf
```

> Puppeteer 刻意不写进 `package.json` 默认依赖,避免拖慢 / 影响 Vercel 构建。

## 三、真实模型接入(可选)

第一站翻译可调用真实 OpenAI,key 只存服务端、绝不进前端:

- 后端代理:`api/translate.ts`(Vercel Serverless Function),读取环境变量
  `OPENAI_API_KEY`,模型由 `OPENAI_MODEL` 控制(当前线上为 `gpt-5.4`)。
- 运行时若未配置 key 或调用失败,**自动回退到内置脚本数据**,演示不会翻车。
- 在 Vercel 项目 Settings → Environment Variables 配置 `OPENAI_API_KEY` 即可启用。

## 四、技术栈

Vite · React · TypeScript · Tailwind(浅色极简,单一靛蓝强调色)· Framer Motion(克制动效)· lucide-react。
无登录、无数据库;数据走 `src/data/` 内置假数据。

## 五、项目结构

```
api/translate.ts            OpenAI 翻译代理(Serverless,key 在服务端)
src/
├─ App.tsx                  指令 → 执行 → 审核 → 汇总 状态机
├─ engine/review.ts         AI 自动填表(审核队列)+ AI 执行流 + 自然语言指令解析
├─ lib/translate.ts         前端调用代理(失败回退脚本)
├─ ui/motion.ts             统一动效常量
├─ data/                    packingList / amazonCandidates / roi / types
└─ components/
   ├─ Header.tsx            极简顶栏
   ├─ CommandBar.tsx        自然语言指令输入(首页大输入 / 审核页底部)
   ├─ AgentFeed.tsx         AI 执行流(自然语言进度)
   ├─ ReviewTable.tsx       审核概览 + 队列
   ├─ ReviewRow.tsx         单行:AI 填好的对标 + 通过/驳回 + 可展开依据
   ├─ ResultSummary.tsx     汇总(耗时对比 / 质检)
   └─ common/AnimatedNumber.tsx
scripts/selftest.ts         自检脚本
```

## 六、改数据

- 增删商品 → `src/data/packingList.ts`
- 调整亚马逊候选剧情(品牌/材质/原产地/相关性) → `src/data/amazonCandidates.ts`
- 改 ROI / 质检 / 异常归类 → `src/data/roi.ts`
- 改 AI 自动填表逻辑、执行流文案、指令关键词 → `src/engine/review.ts`

## 七、范围说明

这是**销售演示**:不接真实亚马逊 / 商标库 / 谷歌,审核动作只改本地状态。
唯一接了真实接口的是第一站翻译(可选,且有回退)。客户签约后再按真实需求做生产版。
