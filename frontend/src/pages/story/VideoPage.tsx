import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX, Download, BookOpen, Share2, RotateCcw } from 'lucide-react'
import { PageType, Tale } from '../../App'
import SimpleHeader from '../../components/common/SimpleHeader'
import '../../styles/pages/VideoPage.css'

interface VideoPageProps {
  onNavigate: (page: PageType) => void
  selectedTale: Tale | null
  onGoBack: () => void
  onMenuClick: () => void
}

export default function VideoPage({
  onNavigate,
  selectedTale,
  onGoBack,
  onMenuClick
}: VideoPageProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [activeChapter, setActiveChapter] = useState(0)

  // 최종 영상 관련 상태
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const chapters = ['발단', '전개', '위기', '절정', '결말']

  // 최종 영상 로드 (API 폴링)
  useEffect(() => {
    const jobId = localStorage.getItem('current_job_id')
    if (!jobId) {
      console.error('job_id가 없습니다')
      setIsLoading(false)
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/story/status/${jobId}`)

        if (!response.ok) {
          clearInterval(pollInterval)
          setIsLoading(false)
          return
        }

        const status = await response.json()
        setLoadingProgress(status.progress || 0)

        // 최종 영상 완성됨
        if (status.status === 'complete' && status.final_video_url) {
          clearInterval(pollInterval)
          setFinalVideoUrl(status.final_video_url)
          setIsLoading(false)
          console.log('최종 영상 로드 완료:', status.final_video_url)
        }

        // 에러 발생
        if (status.status === 'error') {
          clearInterval(pollInterval)
          setIsLoading(false)
          alert(`오류 발생: ${status.error}`)
        }
      } catch (error) {
        console.error('폴링 오류:', error)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [])

  const handleSaveToBookshelf = () => {
    setShowCelebration(true)
    setSaved(true)

    // 2초 후 자동으로 책장으로 이동
    setTimeout(() => {
      onNavigate('bookshelf')
    }, 2000)
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className="video-page">
      {/* 배경 구름 */}
      <div className="video-page__bg-decorations">
        <div className="video-page__cloud video-page__cloud--1"></div>
        <div className="video-page__cloud video-page__cloud--2"></div>
        <div className="video-page__cloud video-page__cloud--3"></div>
      </div>

      <SimpleHeader
        onNavigate={onNavigate}
        onGoBack={onGoBack}
        onMenuClick={onMenuClick}
      />

      {/* 축하 팝업 */}
      {showCelebration && (
        <div className="video-page__celebration-overlay">
          <div className="video-page__celebration-modal">
            <div className="video-page__celebration-emoji">🎉</div>
            <h2 className="video-page__celebration-title">동화 완성!</h2>
            <p className="video-page__celebration-subtitle">내 책장으로 이동합니다...</p>
            <div className="video-page__celebration-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      <main className="video-page__main">
        {/* 타이틀 배너 */}
        <div className="video-page__title-banner">
          <div className="video-page__title-icon">🎬</div>
          <div className="video-page__title-content">
            <h1 className="video-page__title">{selectedTale?.title || '나만의 동화'} 완성!</h1>
            <p className="video-page__subtitle">세상에 하나뿐인 나만의 동화가 완성됐어요!</p>
          </div>
        </div>

        {/* 비디오 플레이어 */}
        <div className="video-page__player-wrapper">
          <div className="video-page__player">
            {isLoading ? (
              <div className="video-page__player-content">
                <div className="video-page__player-emoji">🎬</div>
                <p className="video-page__player-text">최종 영상 병합 중...</p>
                <div className="video-page__loading-bar">
                  <div
                    className="video-page__loading-fill"
                    style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                  />
                </div>
                <p className="video-page__loading-percent">
                  {Math.min(Math.round(loadingProgress), 100)}%
                </p>
              </div>
            ) : finalVideoUrl ? (
              <video
                ref={videoRef}
                src={`http://localhost:8000${finalVideoUrl}`}
                className="video-page__video-element"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls
              >
                브라우저가 비디오 재생을 지원하지 않습니다.
              </video>
            ) : (
              <div className="video-page__player-content">
                <div className="video-page__player-emoji">❌</div>
                <p className="video-page__player-text">영상을 불러올 수 없습니다</p>
              </div>
            )}
          </div>

          {/* 컨트롤 바 */}
          {!isLoading && finalVideoUrl && (
            <>
              <div className="video-page__controls">
                <button
                  className="video-page__control-btn"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                </button>

                <button
                  className="video-page__control-btn video-page__control-btn--restart"
                  onClick={handleRestart}
                >
                  <RotateCcw size={18} />
                </button>

                <div className="video-page__progress-wrapper">
                  <span className="video-page__time">전체 영상</span>
                </div>

                <button
                  className="video-page__control-btn"
                  onClick={handleMuteToggle}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>

              {/* 챕터 버튼 */}
              <div className="video-page__chapters">
                {chapters.map((chapter, index) => (
                  <button
                    key={index}
                    className={`video-page__chapter-btn ${activeChapter === index ? 'active' : ''}`}
                    onClick={() => setActiveChapter(index)}
                  >
                    <span className="video-page__chapter-num">{index + 1}</span>
                    <span className="video-page__chapter-name">{chapter}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 액션 버튼들 */}
        {!isLoading && finalVideoUrl && (
          <div className="video-page__actions">
            <button className="video-page__action-btn video-page__action-btn--download">
              <Download size={22} />
              <span>다운로드</span>
            </button>
            <button
              onClick={handleSaveToBookshelf}
              disabled={saved}
              className={`video-page__action-btn video-page__action-btn--save ${saved ? 'saved' : ''}`}
            >
              <BookOpen size={22} />
              <span>{saved ? '저장 완료!' : '내 책장에 저장'}</span>
            </button>
            <button
              onClick={() => onNavigate('bookclub-upload')}
              className="video-page__action-btn video-page__action-btn--share"
            >
              <Share2 size={22} />
              <span>북클럽에 공유</span>
            </button>
          </div>
        )}
      </main>

      {/* 하단 풍경 장식 */}
      <div className="video-page__landscape">
        <div className="video-page__grass"></div>
        <div className="video-page__tree video-page__tree--1"></div>
        <div className="video-page__tree video-page__tree--2"></div>
        <div className="video-page__house">
          <div className="video-page__house-window video-page__house-window--left"></div>
          <div className="video-page__house-window video-page__house-window--right"></div>
        </div>
        <div className="video-page__bush video-page__bush--1"></div>
        <div className="video-page__bush video-page__bush--2"></div>
        <div className="video-page__bush video-page__bush--3"></div>
        <div className="video-page__flower video-page__flower--1"></div>
        <div className="video-page__flower video-page__flower--2"></div>
        <div className="video-page__flower video-page__flower--3"></div>
      </div>
    </div>
  )
}