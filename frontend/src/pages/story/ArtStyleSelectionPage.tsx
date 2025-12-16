import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageType, Tale, ArtStyle } from '../../App'
import '../../styles/pages/ArtStyleSelectionPage.css'

import { startStory } from '../../api/storyApi'

interface ArtStyleSelectionPageProps {
  onNavigate: (page: PageType) => void
  selectedTale: Tale | null
  onSelectStyle: (style: ArtStyle) => void
  onGoBack: () => void
  onMenuClick: () => void
}

interface StyleOption {
  id: ArtStyle
  name: string
  description: string
  image: string
  color: string
}

const styleOptions: StyleOption[] = [
  {
    id: 'realistic',
    name: '실사 스타일',
    description: '사진처럼 사실적인 그림체로 생생한 장면을 표현해요',
    image: '/src/assets/images/styles/realistic.png',
    color: '#E91E63'
  },
  {
    id: 'cartoon_2d',
    name: '2D 애니메이션',
    description: '귀여운 2D 만화 스타일로 친근한 느낌을 줘요',
    image: '/src/assets/images/styles/cartoon_2d.png',
    color: '#2196F3'
  },
  {
    id: 'cartoon_3d',
    name: '3D 카툰',
    description: '입체감 있는 3D 캐릭터가 살아 움직여요',
    image: '/src/assets/images/styles/cartoon_3d.png',
    color: '#FF9800'
  },
  {
    id: 'pixar',
    name: '픽사 스타일',
    description: '픽사 애니메이션처럼 감동적인 영상을 만들어요',
    image: '/src/assets/images/styles/pixar.png',
    color: '#4CAF50'
  },
  {
    id: 'watercolor',
    name: '수채화 스타일',
    description: '부드럽고 따뜻한 수채화 느낌으로 표현해요',
    image: '/src/assets/images/styles/watercolor.png',
    color: '#9C27B0'
  }
]

export default function ArtStyleSelectionPage({
  onNavigate,
  selectedTale,
  onSelectStyle,
  onGoBack,
  onMenuClick: _onMenuClick
}: ArtStyleSelectionPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? styleOptions.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === styleOptions.length - 1 ? 0 : prev + 1))
  }

  const handleConfirm = async () => {
    if (isLoading) return

    const selected = styleOptions[currentIndex]
    onSelectStyle(selected.id)

    setIsLoading(true)
    try {
      // 백엔드에 스토리 시작 요청
      const taleTitle = selectedTale?.title || '흥부와 놀부' // 기본값
      const response = await startStory(taleTitle, selected.id)

      if (response.job_id) {
        localStorage.setItem('current_job_id', response.job_id)
        // 상태 초기화
        localStorage.removeItem('itory_edit_story_state')
        onNavigate('edit-story')
      } else {
        alert('스토리 생성을 시작할 수 없습니다. (Job ID 누락)')
      }
    } catch (error) {
      console.error('스토리 시작 실패:', error)
      alert('서버 연결에 실패했습니다. 백엔드가 실행 중인지 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  // 보이는 카드들의 인덱스 계산
  const getVisibleCards = () => {
    const total = styleOptions.length
    return {
      left: (currentIndex - 1 + total) % total,
      center: currentIndex,
      right: (currentIndex + 1) % total
    }
  }

  const visibleCards = getVisibleCards()
  const currentStyle = styleOptions[currentIndex]

  return (
    <div className="artstyle-page">
      {/* 배경 구름 */}
      <div className="artstyle-page__bg-decorations">
        <div className="artstyle-page__cloud artstyle-page__cloud--1"></div>
        <div className="artstyle-page__cloud artstyle-page__cloud--2"></div>
        <div className="artstyle-page__cloud artstyle-page__cloud--3"></div>
        <div className="artstyle-page__cloud artstyle-page__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="artstyle-page__header">
        <div className="artstyle-page__header-left">
          <button onClick={onGoBack} className="artstyle-page__back-btn">
            <ChevronLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="artstyle-page__logo-img"
          />
        </div>
        <div style={{ width: 48 }} />
      </header>

      {/* 선택된 동화 표시 */}
      {selectedTale && (
        <div className="artstyle-page__selected-tale">
          <span className="artstyle-page__tale-label">선택한 동화</span>
          <span className="artstyle-page__tale-title">{selectedTale.title}</span>
        </div>
      )}

      {/* 타이틀 */}
      <div className="artstyle-page__title-section">
        <h1 className="artstyle-page__title">어떤 그림체로 만들까요?</h1>
        <p className="artstyle-page__subtitle">원하는 스타일을 골라주세요!</p>
      </div>

      {/* 카드 캐러셀 */}
      <div className="artstyle-page__carousel">
        {/* 왼쪽 화살표 */}
        <button onClick={handlePrev} className="artstyle-page__nav-btn artstyle-page__nav-btn--left">
          <ChevronLeft size={32} />
        </button>

        {/* 카드들 */}
        <div className="artstyle-page__cards">
          {/* 왼쪽 카드 */}
          <div
            className="artstyle-page__card artstyle-page__card--left"
            onClick={() => setCurrentIndex(visibleCards.left)}
          >
            <div
              className="artstyle-page__card-image"
              style={{ backgroundColor: styleOptions[visibleCards.left].color + '33' }}
            >
              <img src={styleOptions[visibleCards.left].image} alt="" />
            </div>
          </div>

          {/* 센터 카드 */}
          <div
            className="artstyle-page__card artstyle-page__card--center"
            style={{ '--card-color': currentStyle.color } as React.CSSProperties}
          >
            <div
              className="artstyle-page__card-image"
              style={{ backgroundColor: currentStyle.color + '22' }}
            >
              <img
                src={currentStyle.image}
                alt={currentStyle.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              <div className="artstyle-page__image-placeholder">🎨</div>
            </div>
            <div className="artstyle-page__card-info">
              <span className="artstyle-page__card-label">ART STYLE</span>
              <h3 className="artstyle-page__card-name">{currentStyle.name}</h3>
              <p className="artstyle-page__card-desc">{currentStyle.description}</p>
            </div>
          </div>

          {/* 오른쪽 카드 */}
          <div
            className="artstyle-page__card artstyle-page__card--right"
            onClick={() => setCurrentIndex(visibleCards.right)}
          >
            <div
              className="artstyle-page__card-image"
              style={{ backgroundColor: styleOptions[visibleCards.right].color + '33' }}
            >
              <img src={styleOptions[visibleCards.right].image} alt="" />
            </div>
          </div>
        </div>

        {/* 오른쪽 화살표 */}
        <button onClick={handleNext} className="artstyle-page__nav-btn artstyle-page__nav-btn--right">
          <ChevronRight size={32} />
        </button>
      </div>

      {/* 페이지 인디케이터 */}
      <div className="artstyle-page__indicators">
        <div className="artstyle-page__indicator-dots">
          {styleOptions.map((style, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`artstyle-page__indicator ${currentIndex === index ? 'active' : ''}`}
              style={{ '--dot-color': style.color } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* 선택 버튼 */}
      <div className="artstyle-page__cta">
        <button
          onClick={handleConfirm}
          className="artstyle-page__cta-btn"
          style={{
            background: `linear-gradient(180deg, ${currentStyle.color} 0%, ${currentStyle.color}dd 100%)`,
            boxShadow: `0 6px 0 ${currentStyle.color}99, 0 10px 32px ${currentStyle.color}66`
          }}
        >
          <span className="artstyle-page__cta-text">
            "{currentStyle.name}" 선택하기
          </span>
          <span className="artstyle-page__cta-icon">🎨</span>
        </button>
      </div>

      {/* 푸터 */}
      <footer className="artstyle-page__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}