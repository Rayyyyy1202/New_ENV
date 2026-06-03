import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EASE } from './theme/design'
import PipelineNav from './components/PipelineNav'
import RobotStatusBar from './components/RobotStatusBar'
import SubtitleBar from './components/common/SubtitleBar'
import TopControls from './components/TopControls'
import UploadScreen from './components/UploadScreen'
import Stage1Translate from './components/Stage1Translate'
import Stage2Database from './components/Stage2Database'
import Stage3Amazon from './components/Stage3Amazon'
import Stage4Lock from './components/Stage4Lock'
import Stage5ROI from './components/Stage5ROI'
import { useAutoPlay } from './hooks/useAutoPlay'
import { playChime } from './hooks/useChime'

export type StageId = 'upload' | 'translate' | 'database' | 'amazon' | 'lock' | 'roi'

export const STAGE_ORDER: StageId[] = ['upload', 'translate', 'database', 'amazon', 'lock', 'roi']

export default function App() {
  const [stage, setStage] = useState<StageId>('upload')
  const [autoplay, setAutoplay] = useState(false)
  const [sound, setSound] = useState(false)
  const [robotMsg, setRobotMsg] = useState('待命中 · 等待装箱单')

  const goTo = useCallback(
    (next: StageId) => {
      setStage(next)
      if (sound) playChime()
    },
    [sound],
  )

  const advance = useCallback(() => {
    setStage((cur) => {
      const idx = STAGE_ORDER.indexOf(cur)
      const next = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)]
      if (next !== cur && sound) playChime()
      return next
    })
  }, [sound])

  // 自动演示：到达 roi 后停止
  useAutoPlay(stage, autoplay && stage !== 'roi', advance)

  // 重新演示
  const restart = useCallback(() => {
    setStage('upload')
    setRobotMsg('待命中 · 等待装箱单')
  }, [])

  useEffect(() => {
    if (stage === 'upload') setRobotMsg('待命中 · 等待装箱单')
  }, [stage])

  const showPipeline = stage !== 'upload'

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-base text-ink">
      {/* 背景微动网格 */}
      <div className="pointer-events-none fixed inset-0 cmd-grid animate-gridMove opacity-60" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-cyan/[0.04] via-transparent to-bg-base" />
      {/* 角落辉光 */}
      <div className="pointer-events-none fixed -left-40 -top-40 h-96 w-96 rounded-full bg-cyan/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyanDeep/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <TopControls
          autoplay={autoplay}
          sound={sound}
          onToggleAuto={() => setAutoplay((v) => !v)}
          onToggleSound={() => setSound((v) => !v)}
          onRestart={restart}
          showRestart={stage !== 'upload'}
        />

        {showPipeline && <PipelineNav current={stage} onJump={goTo} />}

        <main className="relative flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="h-full"
            >
              {stage === 'upload' && <UploadScreen onStart={() => goTo('translate')} />}
              {stage === 'translate' && <Stage1Translate autoplay={autoplay} onStatus={setRobotMsg} onDone={advance} />}
              {stage === 'database' && <Stage2Database autoplay={autoplay} onStatus={setRobotMsg} onDone={advance} />}
              {stage === 'amazon' && <Stage3Amazon autoplay={autoplay} onStatus={setRobotMsg} onDone={advance} />}
              {stage === 'lock' && <Stage4Lock autoplay={autoplay} onStatus={setRobotMsg} onDone={advance} />}
              {stage === 'roi' && <Stage5ROI onRestart={restart} onStatus={setRobotMsg} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {showPipeline && <RobotStatusBar message={robotMsg} />}
        {autoplay && <SubtitleBar stage={stage} />}
      </div>
    </div>
  )
}
