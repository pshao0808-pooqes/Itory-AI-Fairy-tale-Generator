import { useState, useEffect } from 'react'
import { Play, ChevronRight, Check, Edit3 } from 'lucide-react'
import { PageType, Tale, ArtStyle } from '../../App'
import SimpleHeader from '../../components/common/SimpleHeader'
import '../../styles/pages/EditStoryPage.css'

interface EditStoryPageProps {
  onNavigate: (page: PageType) => void
  selectedTale: Tale | null
  selectedStyle: ArtStyle | null
  onGoBack: () => void
  onMenuClick: () => void
}

// 단계 정의
const STAGES = [
  { id: 'intro', name: '발단', step: 1, hasChoices: false },
  { id: 'development', name: '전개', step: 2, hasChoices: true },
  { id: 'crisis', name: '위기', step: 3, hasChoices: true },
  { id: 'climax', name: '절정', step: 4, hasChoices: true },
  { id: 'ending', name: '결말', step: 5, hasChoices: true }
]

// 발단 영상 텍스트
const introVideo = {
  title: '이야기의 시작',
  text: '옛날 옛날 어느 마을에 착하고 성실한 주인공이 살았어요. 어느 날, 평화롭던 마을에 신비로운 일이 일어나기 시작했답니다...'
}

// 전개~결말 선택지 데이터 (각 단계당 1번 선택) - 폴백용
const stageChoices: { [key: string]: { question: string; choices: { id: string; icon: string; title: string; desc: string }[] }[] } = {
  development: [
    {
      question: '주인공에게 어떤 일이 일어났나요?',
      choices: [
        { id: 'A', icon: '🌟', title: '신비한 것을 발견했어요', desc: '반짝이는 무언가를 찾았어요' },
        { id: 'B', icon: '🤝', title: '새로운 친구를 만났어요', desc: '특별한 만남이 시작됐어요' }
      ]
    }
  ],
  crisis: [
    {
      question: '어떤 위기가 찾아왔나요?',
      choices: [
        { id: 'A', icon: '😤', title: '나쁜 사람이 나타났어요', desc: '욕심쟁이가 나타났어요' },
        { id: 'B', icon: '🌪️', title: '어려운 상황이 생겼어요', desc: '예상치 못한 문제 발생' }
      ]
    }
  ],
  climax: [
    {
      question: '결정적인 순간! 어떻게 해결했나요?',
      choices: [
        { id: 'A', icon: '💪', title: '용기를 내서 해결했어요', desc: '두려움을 이겨냈어요' },
        { id: 'B', icon: '🤝', title: '함께 힘을 모았어요', desc: '친구들과 협력했어요' }
      ]
    }
  ],
  ending: [
    {
      question: '이야기는 어떻게 끝이 났나요?',
      choices: [
        { id: 'A', icon: '👨‍👩‍👧‍👦', title: '모두 행복해졌어요', desc: '해피엔딩!' },
        { id: 'B', icon: '🌈', title: '더 좋은 세상이 됐어요', desc: '모두가 웃는 결말' }
      ]
    }
  ]
}

// 스타일 이름 매핑
const styleNames: { [key in ArtStyle]: string } = {
  realistic: '실사 스타일',
  cartoon_2d: '2D 애니메이션',
  cartoon_3d: '3D 카툰',
  pixar: '픽사 스타일',
  watercolor: '수채화 스타일'
}

// localStorage 키
const STORAGE_KEY = 'itory_edit_story_state'

export default function EditStoryPage({
  onNavigate,
  selectedTale,
  selectedStyle,
  onGoBack,
  onMenuClick
}: EditStoryPageProps) {
  // 현재 단계 (0: 발단, 1~4: 전개~결말)
  const [currentStage, setCurrentStage] = useState(0)
  // 각 단계별 선택 저장
  const [selections, setSelections] = useState<{ [key: string]: { id: string; text: string }[] }>({})
  // 직접 쓰기 입력값
  const [customInput, setCustomInput] = useState('')
  // 직접 쓰기 모드
  const [isCustomMode, setIsCustomMode] = useState(false)

  // 발단 관련 상태
  const [introLoading, setIntroLoading] = useState(true)
  const [introLoadingProgress, setIntroLoadingProgress] = useState(0)
  const [introVideoReady, setIntroVideoReady] = useState(false)
  const [introVideoPlaying, setIntroVideoPlaying] = useState(false)
  const [introVideoCompleted, setIntroVideoCompleted] = useState(false)

  // 단계 완료 후 통합 영상 + 줄거리 보기 모드
  const [showStageResult, setShowStageResult] = useState(false)
  const [stageLoading, setStageLoading] = useState(false)
  const [stageLoadingProgress, setStageLoadingProgress] = useState(0)
  const [currentStageVideoUrl, setCurrentStageVideoUrl] = useState<string | null>(null)
  const [stageVideoPlaying, setStageVideoPlaying] = useState(false)
  const [stageVideoCompleted, setStageVideoCompleted] = useState(false)

  const currentStageData = STAGES[currentStage]
  const currentStageId = currentStageData?.id
  const currentChoiceData = stageChoices[currentStageId]?.[0]
  const currentSelections = selections[currentStageId] || []

  // 동적 선택지 상태 (백엔드에서 로드)
  const [dynamicChoices, setDynamicChoices] = useState<string[]>([])
  const [isChoicesLoading, setIsChoicesLoading] = useState(false)

  // 선택지 로드 (2막 이상일 때) - 백엔드 API
  useEffect(() => {
    if (currentStage >= 1 && currentStage <= 4) {
      const fetchOptions = async () => {
        setIsChoicesLoading(true)
        try {
          const jobId = localStorage.getItem('current_job_id')
          if (!jobId) return

          const stageNo = currentStage + 1
          const response = await fetch(`http://localhost:8000/api/story/options/${jobId}/${stageNo}`)

          if (response.ok) {
            const data = await response.json()
            if (data.options && Array.isArray(data.options)) {
              setDynamicChoices(data.options)
            }
          }
        } catch (error) {
          console.error("옵션 로드 실패:", error)
        } finally {
          setIsChoicesLoading(false)
        }
      }

      fetchOptions()
    }
  }, [currentStage])

  // 새로고침 시 상태 복원
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const state = JSON.parse(saved)
        setCurrentStage(state.currentStage || 0)
        setSelections(state.selections || {})
        setShowStageResult(state.showStageResult || false)

        // 발단 이후 단계면 발단 완료 상태로 설정
        if (state.currentStage > 0) {
          setIntroLoading(false)
          setIntroVideoReady(true)
          setIntroVideoCompleted(true)
        }
      } catch (e) {
        console.error('상태 복원 실패:', e)
      }
    }
  }, [])

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    const state = {
      currentStage,
      selections,
      showStageResult
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [currentStage, selections, showStageResult])

  // 발단 로딩 - 실제 API 폴링
  useEffect(() => {
    if (currentStage === 0 && introLoading) {
      const jobId = localStorage.getItem('current_job_id')

      if (!jobId) {
        console.error('job_id가 없습니다')
        alert('잘못된 접근입니다. 처음부터 다시 시작해주세요.')
        onGoBack()
        return
      }

      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/story/status/${jobId}`)

          if (response.status === 404) {
            clearInterval(pollInterval)
            setIntroLoading(false)
            alert('세션이 만료되었습니다. 처음부터 다시 시작해주세요.')
            localStorage.removeItem('current_job_id')
            localStorage.removeItem(STORAGE_KEY)
            onGoBack()
            return
          }

          if (!response.ok) {
            throw new Error('상태 조회 실패')
          }

          const status = await response.json()
          setIntroLoadingProgress(status.progress || 0)

          if (status.status === 'stage1_complete') {
            clearInterval(pollInterval)
            setIntroLoading(false)
            setIntroVideoReady(true)

            if (status.video_url) {
              localStorage.setItem('stage1_video', status.video_url)
            }
            if (status.story_text) {
              localStorage.setItem('stage1_text', status.story_text)
            }
          }

          if (status.status === 'error') {
            clearInterval(pollInterval)
            setIntroLoading(false)
            alert(`오류가 발생했습니다: ${status.error || '알 수 없는 오류'}`)
          }
        } catch (error) {
          console.error('API 폴링 오류:', error)
        }
      }, 2000)

      return () => clearInterval(pollInterval)
    }
  }, [currentStage, introLoading])

  // 단계별 로딩 폴링 (2막 이상) - 백엔드 API
  useEffect(() => {
    if (showStageResult && stageLoading && currentStage >= 1) {
      const jobId = localStorage.getItem('current_job_id')
      if (!jobId) return

      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/story/status/${jobId}`)

          if (response.status === 404) {
            clearInterval(pollInterval)
            setStageLoading(false)
            alert('세션이 만료되었습니다. 처음부터 다시 시작해주세요.')
            localStorage.removeItem('current_job_id')
            localStorage.removeItem(STORAGE_KEY)
            onGoBack()
            return
          }

          if (!response.ok) throw new Error('상태 조회 실패')

          const status = await response.json()
          setStageLoadingProgress(status.progress || 0)

          const targetStatus = `stage${currentStage + 1}_complete`

          if (status.status === targetStatus || status.status === 'complete') {
            clearInterval(pollInterval)
            setStageLoading(false)
            if (status.video_url) {
              setCurrentStageVideoUrl(status.video_url)
            }
          }

          if (status.status === 'error') {
            clearInterval(pollInterval)
            setStageLoading(false)
            alert(`오류 발생: ${status.error}`)
          }
        } catch (error) {
          console.error('폴링 오류:', error)
        }
      }, 2000)

      return () => clearInterval(pollInterval)
    }
  }, [showStageResult, stageLoading, currentStage])

  // 영상 준비 완료 시 자동 재생 (발단)
  useEffect(() => {
    if (introVideoReady && !introVideoPlaying && !introVideoCompleted) {
      const timer = setTimeout(() => {
        setIntroVideoPlaying(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [introVideoReady, introVideoPlaying, introVideoCompleted])

  // 영상 준비 완료 시 자동 재생 (단계별)
  useEffect(() => {
    if (showStageResult && !stageLoading && !stageVideoPlaying && !stageVideoCompleted) {
      const timer = setTimeout(() => {
        setStageVideoPlaying(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [showStageResult, stageLoading, stageVideoPlaying, stageVideoCompleted])

  // 5막 완료 후 자동으로 최종 병합 시작
  useEffect(() => {
    const checkAndFinalize = async () => {
      const jobId = localStorage.getItem('current_job_id')
      if (!jobId) return

      try {
        const response = await fetch(`http://localhost:8000/api/story/status/${jobId}`)
        if (!response.ok) return

        const status = await response.json()

        // 5막이 완료되고 아직 최종 병합이 시작되지 않았으면
        if (status.status === 'stage5_complete') {
          console.log('5막 완료 감지! 최종 병합 시작...')

          // 최종 병합 API 호출
          const finalizeResponse = await fetch(`http://localhost:8000/api/story/finalize/${jobId}`, {
            method: 'POST'
          })

          if (finalizeResponse.ok) {
            console.log('최종 병합 시작됨')
          }
        }
      } catch (error) {
        console.error('최종 병합 확인 오류:', error)
      }
    }

    // 5막 결과 화면에서만 체크
    if (currentStage === 4 && showStageResult && !stageLoading) {
      checkAndFinalize()
    }
  }, [currentStage, showStageResult, stageLoading])

  // 발단 영상 후 전개로 이동
  const handleGoToDevelopment = () => {
    setCurrentStage(1)
  }

  // 뒤로 가기 핸들러 (단계별)
  const handleGoBack = () => {
    if (showStageResult) {
      setShowStageResult(false)
      setStageVideoPlaying(false)
      setStageVideoCompleted(false)
      setStageLoading(false)
      setStageLoadingProgress(0)
      setCurrentStageVideoUrl(null)
      setSelections(prev => {
        const newSelections = { ...prev }
        delete newSelections[currentStageId]
        return newSelections
      })
    } else if (currentStage > 0) {
      const prevStage = currentStage - 1
      setCurrentStage(prevStage)

      if (prevStage === 0) {
        setIntroVideoCompleted(true)
      } else {
        setShowStageResult(true)
        setStageVideoCompleted(true)
      }
    } else {
      localStorage.removeItem(STORAGE_KEY)
      onGoBack()
    }
  }

  // 선택지 선택 - 백엔드 API 호출
  const handleChoiceSelect = async (choiceId: string, choiceText: string) => {
    setSelections(prev => ({
      ...prev,
      [currentStageId]: [{ id: choiceId, text: choiceText }]
    }))
    setShowStageResult(true)
    setStageLoading(true)
    setStageLoadingProgress(0)

    // 백엔드에 선택 전송
    try {
      const jobId = localStorage.getItem('current_job_id')
      if (jobId) {
        const stageNo = currentStage + 1
        await fetch(`http://localhost:8000/api/story/select/${jobId}/${stageNo}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice: choiceId, text: choiceText })
        })
      }
    } catch (error) {
      console.error('선택 전송 실패:', error)
    }
  }

  // 직접 쓰기 제출
  const handleCustomSubmit = async () => {
    if (!customInput.trim()) return

    setSelections(prev => ({
      ...prev,
      [currentStageId]: [{ id: 'custom', text: customInput.trim() }]
    }))

    const customText = customInput.trim()
    setCustomInput('')
    setIsCustomMode(false)
    setShowStageResult(true)
    setStageLoading(true)
    setStageLoadingProgress(0)

    // 백엔드에 직접 쓰기 전송
    try {
      const jobId = localStorage.getItem('current_job_id')
      if (jobId) {
        const stageNo = currentStage + 1
        await fetch(`http://localhost:8000/api/story/select/${jobId}/${stageNo}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice: 'custom', text: customText })
        })
      }
    } catch (error) {
      console.error('직접 쓰기 전송 실패:', error)
    }
  }

  // 다음 단계로 이동
  const handleNextStage = () => {
    if (currentStage === STAGES.length - 1) {
      localStorage.removeItem(STORAGE_KEY)
      onNavigate('video')
    } else {
      setCurrentStage(prev => prev + 1)
      setShowStageResult(false)
      setStageVideoPlaying(false)
      setStageVideoCompleted(false)
      setStageLoading(false)
      setStageLoadingProgress(0)
      setCurrentStageVideoUrl(null)
    }
  }

  // ============================================
  // 1. 발단 화면 (로딩 → 영상 자동재생)
  // ============================================
  if (currentStage === 0) {
    return (
      <div className="edit-story-page">
        {/* 배경 구름 */}
        <div className="edit-story-page__bg-decorations">
          <div className="edit-story-page__cloud edit-story-page__cloud--1"></div>
          <div className="edit-story-page__cloud edit-story-page__cloud--2"></div>
          <div className="edit-story-page__cloud edit-story-page__cloud--3"></div>
          <div className="edit-story-page__cloud edit-story-page__cloud--4"></div>
        </div>

        <SimpleHeader
          onNavigate={onNavigate}
          onGoBack={handleGoBack}
          onMenuClick={onMenuClick}
        />

        <main className="edit-story-page__main edit-story-page__main--fullscreen">
          {/* 미니 진행 표시 - 상단 */}
          <div className="edit-story-page__mini-progress">
            {STAGES.map((s, index) => (
              <div key={index} className={`edit-story-page__mini-step ${index === 0 ? 'active' : ''}`}>
                <div className="edit-story-page__mini-dot"></div>
                <span className="edit-story-page__mini-label">{s.name}</span>
              </div>
            ))}
          </div>

          {/* 영상 영역 - 전체 폭 */}
          <div className="edit-story-page__fullscreen-video">
            <div className="edit-story-page__video-container">
              {introLoading ? (
                <div className="edit-story-page__loading">
                  <div className="edit-story-page__loading-emoji">🎬</div>
                  <p className="edit-story-page__loading-title">발단 영상 준비 중...</p>
                  <p className="edit-story-page__loading-subtitle">잠시만 기다려주세요</p>
                  <div className="edit-story-page__loading-bar">
                    <div
                      className="edit-story-page__loading-fill"
                      style={{ width: `${Math.min(introLoadingProgress, 100)}%` }}
                    />
                  </div>
                  <p className="edit-story-page__loading-percent">
                    {Math.min(Math.round(introLoadingProgress), 100)}%
                  </p>
                </div>
              ) : introVideoPlaying ? (
                (() => {
                  const videoUrl = localStorage.getItem('stage1_video') || '/stages/stage_1_final.mp4'
                  return (
                    <div className="edit-story-page__video-player-wrapper">
                      <video
                        src={`http://localhost:8000${videoUrl}`}
                        className="edit-story-page__video-player"
                        controls
                        autoPlay
                        loop
                      >
                        브라우저가 비디오 재생을 지원하지 않습니다.
                      </video>
                    </div>
                  )
                })()
              ) : (
                <div className="edit-story-page__video-ready">
                  <div className="edit-story-page__video-emoji">🎥</div>
                  <p className="edit-story-page__video-ready-title">영상 준비 완료!</p>
                  <p className="edit-story-page__video-status">곧 자동 재생됩니다...</p>
                </div>
              )}
            </div>
          </div>

          {/* 줄거리 - 영상 재생 중일 때 */}
          {introVideoPlaying && (
            <div className="edit-story-page__story-text">
              <span className="edit-story-page__story-label">📖 발단</span>
              <p>{localStorage.getItem('stage1_text') || introVideo.text}</p>
            </div>
          )}

          {/* 다음 버튼 - 하단 고정 */}
          {introVideoPlaying && (
            <div className="edit-story-page__bottom-action">
              <button onClick={handleGoToDevelopment} className="edit-story-page__big-btn">
                전개로 가기 - 선택 시작!
                <ChevronRight size={28} />
              </button>
            </div>
          )}

          {/* 안내 팁 */}
          {!introVideoCompleted && !introVideoPlaying && !introLoading && (
            <div className="edit-story-page__hint">
              <p>💡 발단 영상을 본 후, 전개부터 결말까지 선택을 하게 돼요!</p>
            </div>
          )}
        </main>

        {/* 하단 풍경 장식 */}
        <div className="edit-story-page__landscape">
          <div className="edit-story-page__grass"></div>
          <div className="edit-story-page__tree edit-story-page__tree--1"></div>
          <div className="edit-story-page__tree edit-story-page__tree--2"></div>
          <div className="edit-story-page__tree edit-story-page__tree--3"></div>
          <div className="edit-story-page__house">
            <div className="edit-story-page__house-window edit-story-page__house-window--left"></div>
            <div className="edit-story-page__house-window edit-story-page__house-window--right"></div>
          </div>
          <div className="edit-story-page__bush edit-story-page__bush--1"></div>
          <div className="edit-story-page__bush edit-story-page__bush--2"></div>
          <div className="edit-story-page__bush edit-story-page__bush--3"></div>
          <div className="edit-story-page__bush edit-story-page__bush--4"></div>
          <div className="edit-story-page__flower edit-story-page__flower--1"></div>
          <div className="edit-story-page__flower edit-story-page__flower--2"></div>
          <div className="edit-story-page__flower edit-story-page__flower--3"></div>
          <div className="edit-story-page__flower edit-story-page__flower--4"></div>
        </div>
      </div>
    )
  }

  // ============================================
  // 2. 단계 결과 화면 (1번 선택 완료 후 통합 영상 + 줄거리)
  // ============================================
  if (showStageResult) {
    const stageColors: { [key: string]: string } = {
      development: 'linear-gradient(135deg, #FFF5E1 0%, #FFE4C4 100%)',
      crisis: 'linear-gradient(135deg, #FFE4E4 0%, #FFD4D4 100%)',
      climax: 'linear-gradient(135deg, #E8F0FF 0%, #D4E4FF 100%)',
      ending: 'linear-gradient(135deg, #E4F8EE 0%, #D4F0E4 100%)'
    }

    return (
      <div className="edit-story-page">
        {/* 배경 구름 */}
        <div className="edit-story-page__bg-decorations">
          <div className="edit-story-page__cloud edit-story-page__cloud--1"></div>
          <div className="edit-story-page__cloud edit-story-page__cloud--2"></div>
          <div className="edit-story-page__cloud edit-story-page__cloud--3"></div>
          <div className="edit-story-page__cloud edit-story-page__cloud--4"></div>
        </div>

        <SimpleHeader
          onNavigate={onNavigate}
          onGoBack={handleGoBack}
          onMenuClick={onMenuClick}
        />

        <main className="edit-story-page__main edit-story-page__main--fullscreen">
          {/* 미니 진행 표시 - 상단 */}
          <div className="edit-story-page__mini-progress">
            {STAGES.map((s, index) => (
              <div key={index} className={`edit-story-page__mini-step ${index === currentStage ? 'active' : index < currentStage ? 'completed' : ''}`}>
                <div className="edit-story-page__mini-dot">
                  {index < currentStage && <Check size={12} />}
                </div>
                <span className="edit-story-page__mini-label">{s.name}</span>
              </div>
            ))}
          </div>

          {/* 영상 영역 - 전체 폭 */}
          <div className="edit-story-page__fullscreen-video">
            <div
              className="edit-story-page__video-container"
              style={{ background: stageColors[currentStageId] || '#F5F0E8' }}
            >
              {stageLoading ? (
                <div className="edit-story-page__loading">
                  <div className="edit-story-page__loading-emoji">🎨</div>
                  <p className="edit-story-page__loading-title">{currentStageData.name} 이야기를 만들고 있어요...</p>
                  <p className="edit-story-page__loading-subtitle">잠시만 기다려주세요</p>
                  <div className="edit-story-page__loading-bar">
                    <div
                      className="edit-story-page__loading-fill"
                      style={{ width: `${Math.min(stageLoadingProgress, 100)}%` }}
                    />
                  </div>
                  <p className="edit-story-page__loading-percent">
                    {Math.min(Math.round(stageLoadingProgress), 100)}%
                  </p>
                </div>
              ) : stageVideoPlaying ? (
                currentStageVideoUrl ? (
                  <div className="edit-story-page__video-player-wrapper">
                    <video
                      src={`http://localhost:8000${currentStageVideoUrl}`}
                      className="edit-story-page__video-player"
                      controls
                      autoPlay
                      loop
                    >
                      브라우저가 비디오 재생을 지원하지 않습니다.
                    </video>
                  </div>
                ) : (
                  <div className="edit-story-page__video-playing">
                    <div className="edit-story-page__video-emoji">🎬</div>
                    <div className="edit-story-page__video-status">{currentStageData.name} 영상 준비 중...</div>
                  </div>
                )
              ) : (
                <div className="edit-story-page__video-ready">
                  <div className="edit-story-page__video-emoji">🎥</div>
                  <p className="edit-story-page__video-ready-title">{currentStageData.name} 영상 준비 완료!</p>
                  {currentStageVideoUrl ? (
                    <button onClick={() => setStageVideoPlaying(true)} className="edit-story-page__play-btn">
                      <Play size={24} />
                      영상 보기
                    </button>
                  ) : (
                    <p className="edit-story-page__video-status">곧 자동 재생됩니다...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 줄거리 */}
          <div className="edit-story-page__story-text">
            <span className="edit-story-page__story-label">📖 {currentStageData.name}</span>
            <p>{currentSelections[0]?.text || '선택한 내용이 반영된 이야기입니다.'}</p>
          </div>

          {/* 다음 버튼 - 하단 */}
          {(stageVideoPlaying || currentStageVideoUrl) && (
            <div className="edit-story-page__bottom-action">
              <button onClick={handleNextStage} className="edit-story-page__big-btn">
                {currentStage === STAGES.length - 1 ? '동화 영상 보기 🎉' : `${STAGES[currentStage + 1].name}으로 가기`}
                <ChevronRight size={28} />
              </button>
            </div>
          )}
        </main>

        {/* 하단 풍경 장식 */}
        <div className="edit-story-page__landscape">
          <div className="edit-story-page__grass"></div>
          <div className="edit-story-page__tree edit-story-page__tree--1"></div>
          <div className="edit-story-page__tree edit-story-page__tree--2"></div>
          <div className="edit-story-page__tree edit-story-page__tree--3"></div>
          <div className="edit-story-page__house">
            <div className="edit-story-page__house-window edit-story-page__house-window--left"></div>
            <div className="edit-story-page__house-window edit-story-page__house-window--right"></div>
          </div>
          <div className="edit-story-page__bush edit-story-page__bush--1"></div>
          <div className="edit-story-page__bush edit-story-page__bush--2"></div>
          <div className="edit-story-page__bush edit-story-page__bush--3"></div>
          <div className="edit-story-page__bush edit-story-page__bush--4"></div>
          <div className="edit-story-page__flower edit-story-page__flower--1"></div>
          <div className="edit-story-page__flower edit-story-page__flower--2"></div>
          <div className="edit-story-page__flower edit-story-page__flower--3"></div>
          <div className="edit-story-page__flower edit-story-page__flower--4"></div>
        </div>
      </div>
    )
  }

  // ============================================
  // 3. 선택지 화면 (전개~결말)
  // ============================================
  return (
    <div className="edit-story-page">
      {/* 배경 구름 */}
      <div className="edit-story-page__bg-decorations">
        <div className="edit-story-page__cloud edit-story-page__cloud--1"></div>
        <div className="edit-story-page__cloud edit-story-page__cloud--2"></div>
        <div className="edit-story-page__cloud edit-story-page__cloud--3"></div>
        <div className="edit-story-page__cloud edit-story-page__cloud--4"></div>
      </div>

      <SimpleHeader
        onNavigate={onNavigate}
        onGoBack={handleGoBack}
        onMenuClick={onMenuClick}
      />

      <main className="edit-story-page__main edit-story-page__main--fullscreen">
        {/* 미니 진행 표시 - 상단 */}
        <div className="edit-story-page__mini-progress">
          {STAGES.map((s, index) => (
            <div key={index} className={`edit-story-page__mini-step ${index === currentStage ? 'active' : index < currentStage ? 'completed' : ''}`}>
              <div className="edit-story-page__mini-dot">
                {index < currentStage && <Check size={12} />}
              </div>
              <span className="edit-story-page__mini-label">{s.name}</span>
            </div>
          ))}
        </div>

        {/* 질문 카드 */}
        <div className="edit-story-page__question-card">
          <h2 className="edit-story-page__stage-title">{currentStageData.name}</h2>
          <p className="edit-story-page__question-text">💭 {currentChoiceData?.question || '다음 이야기를 선택해주세요:'}</p>
        </div>

        {/* 선택지 (동적 또는 폴백) */}
        {!isCustomMode ? (
          <div className="edit-story-page__choice-area">
            {isChoicesLoading ? (
              <div className="edit-story-page__loading-choices">
                <p>AI가 선택지를 고민하고 있어요... 🤔</p>
              </div>
            ) : (
              <div className="edit-story-page__choice-grid">
                {/* 동적 선택지가 있으면 사용, 없으면 폴백 */}
                {(dynamicChoices.length > 0 ? dynamicChoices : currentChoiceData?.choices.map(c => c.title) || []).map((choiceText, index) => {
                  const fallbackChoice = currentChoiceData?.choices[index]
                  return (
                    <button
                      key={index}
                      onClick={() => handleChoiceSelect(String(index + 1), choiceText)}
                      className="edit-story-page__choice-card"
                    >
                      <div className="edit-story-page__choice-icon">
                        {dynamicChoices.length > 0 ? (index === 0 ? '1️⃣' : '2️⃣') : fallbackChoice?.icon}
                      </div>
                      <h3 className="edit-story-page__choice-title">{choiceText}</h3>
                      {dynamicChoices.length === 0 && fallbackChoice?.desc && (
                        <p className="edit-story-page__choice-desc">{fallbackChoice.desc}</p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* 직접 쓰기 버튼 */}
            <button onClick={() => setIsCustomMode(true)} className="edit-story-page__custom-btn">
              <Edit3 size={20} />
              <span>직접 쓰기</span>
            </button>
          </div>
        ) : (
          /* 직접 쓰기 모드 */
          <div className="edit-story-page__custom-area">
            <div className="edit-story-page__custom-card">
              <h3 className="edit-story-page__custom-title">
                <Edit3 size={20} />
                직접 쓰기
              </h3>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="나만의 이야기를 적어보세요! (예: 마법의 꽃이 피었어요)"
                className="edit-story-page__custom-input"
              />
              <div className="edit-story-page__custom-actions">
                <button
                  onClick={() => { setIsCustomMode(false); setCustomInput('') }}
                  className="edit-story-page__custom-cancel"
                >
                  취소
                </button>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customInput.trim()}
                  className="edit-story-page__custom-submit"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 하단 풍경 장식 */}
      <div className="edit-story-page__landscape">
        <div className="edit-story-page__grass"></div>
        <div className="edit-story-page__tree edit-story-page__tree--1"></div>
        <div className="edit-story-page__tree edit-story-page__tree--2"></div>
        <div className="edit-story-page__tree edit-story-page__tree--3"></div>
        <div className="edit-story-page__house">
          <div className="edit-story-page__house-window edit-story-page__house-window--left"></div>
          <div className="edit-story-page__house-window edit-story-page__house-window--right"></div>
        </div>
        <div className="edit-story-page__bush edit-story-page__bush--1"></div>
        <div className="edit-story-page__bush edit-story-page__bush--2"></div>
        <div className="edit-story-page__bush edit-story-page__bush--3"></div>
        <div className="edit-story-page__bush edit-story-page__bush--4"></div>
        <div className="edit-story-page__flower edit-story-page__flower--1"></div>
        <div className="edit-story-page__flower edit-story-page__flower--2"></div>
        <div className="edit-story-page__flower edit-story-page__flower--3"></div>
        <div className="edit-story-page__flower edit-story-page__flower--4"></div>
      </div>
    </div>
  )
}