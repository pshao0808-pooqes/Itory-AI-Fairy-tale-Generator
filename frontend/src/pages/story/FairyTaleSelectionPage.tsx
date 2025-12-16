import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageType, Tale } from '../../App'
import '../../styles/pages/FairyTaleSelectionPage.css'

interface FairyTaleSelectionPageProps {
  onNavigate: (page: PageType) => void
  onSelectTale: (tale: Tale) => void
  onGoBack: () => void
  onMenuClick: () => void
}

// 동화 20개 (DB: TALES + TALE_STRUCTURES_NS 기준)
// thumbnail_url: 실제 이미지 경로로 변경
const tales: (Tale & { theme: string; color: string })[] = [
  { id: 'tale_001', title: '토끼와 거북이', thumbnail_url: '/src/assets/images/tales/tale_001.png', theme: '끈기와 노력', color: '#4CAF50' },
  { id: 'tale_002', title: '해와 달이 된 오누이', thumbnail_url: '/src/assets/images/tales/tale_002.png', theme: '용기와 지혜', color: '#AB47BC' },
  { id: 'tale_003', title: '흥부와 놀부', thumbnail_url: '/src/assets/images/tales/tale_003.png', theme: '착한 마음', color: '#42A5F5' },
  { id: 'tale_004', title: '선녀와 나무꾼', thumbnail_url: '/src/assets/images/tales/tale_004.png', theme: '사랑', color: '#EC407A' },
  { id: 'tale_005', title: '콩쥐팥쥐', thumbnail_url: '/src/assets/images/tales/tale_005.png', theme: '선한 마음', color: '#FFB300' },
  { id: 'tale_006', title: '금도끼 은도끼', thumbnail_url: '/src/assets/images/tales/tale_006.png', theme: '정직함', color: '#FF7043' },
  { id: 'tale_007', title: '별주부전', thumbnail_url: '/src/assets/images/tales/tale_007.png', theme: '지혜', color: '#26A69A' },
  { id: 'tale_008', title: '방귀쟁이 며느리', thumbnail_url: '/src/assets/images/tales/tale_008.png', theme: '유머', color: '#8D6E63' },
  { id: 'tale_009', title: '여우와 두루미', thumbnail_url: '/src/assets/images/tales/tale_009.png', theme: '배려', color: '#FF8A65' },
  { id: 'tale_010', title: '잭과 콩나무', thumbnail_url: '/src/assets/images/tales/tale_010.png', theme: '모험', color: '#66BB6A' },
  { id: 'tale_011', title: '도깨비 감투', thumbnail_url: '/src/assets/images/tales/tale_011.png', theme: '정직', color: '#7E57C2' },
  { id: 'tale_012', title: '혹부리 영감', thumbnail_url: '/src/assets/images/tales/tale_012.png', theme: '욕심 버리기', color: '#5C6BC0' },
  { id: 'tale_013', title: '빨간 부채 파란 부채', thumbnail_url: '/src/assets/images/tales/tale_013.png', theme: '교훈', color: '#EF5350' },
  { id: 'tale_014', title: '고양이와 쥐', thumbnail_url: '/src/assets/images/tales/tale_014.png', theme: '지혜', color: '#FFCA28' },
  { id: 'tale_015', title: '방귀쟁이 거인을 쫓아내다', thumbnail_url: '/src/assets/images/tales/tale_015.png', theme: '용기', color: '#78909C' },
  { id: 'tale_016', title: '호랑이와 곶감', thumbnail_url: '/src/assets/images/tales/tale_016.png', theme: '유머', color: '#FFA726' },
  { id: 'tale_017', title: '임금님 귀는 당나귀 귀', thumbnail_url: '/src/assets/images/tales/tale_017.png', theme: '진실', color: '#FFD54F' },
  { id: 'tale_018', title: '도깨비가 데려간 세 딸', thumbnail_url: '/src/assets/images/tales/tale_018.png', theme: '가족 사랑', color: '#F48FB1' },
  { id: 'tale_019', title: '젊어지는 샘물', thumbnail_url: '/src/assets/images/tales/tale_019.png', theme: '욕심', color: '#4FC3F7' },
  { id: 'tale_020', title: '도깨비 방망이', thumbnail_url: '/src/assets/images/tales/tale_020.png', theme: '나눔', color: '#9575CD' }
]

export default function FairyTaleSelectionPage({
  onNavigate,
  onSelectTale,
  onGoBack,
  onMenuClick: _onMenuClick
}: FairyTaleSelectionPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? tales.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === tales.length - 1 ? 0 : prev + 1))
  }

  const handleSelect = (index: number) => {
    if (index === currentIndex) {
      const selected = tales[currentIndex]
      onSelectTale({
        id: selected.id,
        title: selected.title,
        thumbnail_url: selected.thumbnail_url
      })
      onNavigate('artstyle-selection')
    } else {
      setCurrentIndex(index)
    }
  }

  // 보이는 책들의 인덱스 계산
  const getVisibleBooks = () => {
    const total = tales.length
    return {
      leftFar: (currentIndex - 2 + total) % total,
      left: (currentIndex - 1 + total) % total,
      center: currentIndex,
      right: (currentIndex + 1) % total,
      rightFar: (currentIndex + 2) % total
    }
  }

  const visibleBooks = getVisibleBooks()

  // 책 렌더링
  const renderBook = (index: number, position: 'leftFar' | 'left' | 'center' | 'right' | 'rightFar') => {
    const book = tales[index]
    const isCenter = position === 'center'

    return (
      <div
        key={`${book.id}-${position}`}
        className={`fairytale-page__book fairytale-page__book--${position}`}
        onClick={() => handleSelect(index)}
        style={{ '--book-color': book.color } as React.CSSProperties}
      >
        <div className="fairytale-page__book-3d">
          {/* 책등 (Spine) */}
          <div
            className="fairytale-page__book-spine"
            style={{ background: `linear-gradient(180deg, ${book.color} 0%, ${book.color}dd 100%)` }}
          >
            <span className="fairytale-page__spine-title">{book.title}</span>
          </div>

          {/* 페이지 두께 */}
          <div className="fairytale-page__book-pages">
            <div className="fairytale-page__page-line"></div>
            <div className="fairytale-page__page-line"></div>
            <div className="fairytale-page__page-line"></div>
            <div className="fairytale-page__page-line"></div>
            <div className="fairytale-page__page-line"></div>
          </div>

          {/* 책 표지 */}
          <div className="fairytale-page__book-cover">
            {/* 표지 테두리 장식 */}
            <div className="fairytale-page__cover-border">
              {/* 이미지 영역 */}
              <div className="fairytale-page__cover-image">
                <img
                  src={book.thumbnail_url}
                  alt={book.title}
                  onError={(e) => {
                    // 이미지 로드 실패시 플레이스홀더
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.classList.add('no-image')
                  }}
                />
                <div className="fairytale-page__image-placeholder">📚</div>
              </div>

              {/* 제목 영역 */}
              <div className="fairytale-page__cover-info">
                <span className="fairytale-page__book-label">전래동화</span>
                <h3 className="fairytale-page__book-title">{book.title}</h3>
                <p className="fairytale-page__book-theme">#{book.theme}</p>
              </div>

              {/* 로고 */}
              {isCenter && (
                <div className="fairytale-page__book-logo">
                  <img src="/src/assets/images/logo.png" alt="아이토리" />
                </div>
              )}
            </div>

            {/* 책 광택 효과 */}
            <div className="fairytale-page__cover-shine"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fairytale-page">
      {/* 배경 구름 */}
      <div className="fairytale-page__bg-decorations">
        <div className="fairytale-page__cloud fairytale-page__cloud--1"></div>
        <div className="fairytale-page__cloud fairytale-page__cloud--2"></div>
        <div className="fairytale-page__cloud fairytale-page__cloud--3"></div>
        <div className="fairytale-page__cloud fairytale-page__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="fairytale-page__header">
        <div className="fairytale-page__header-left">
          <button onClick={onGoBack} className="fairytale-page__back-btn">
            <ChevronLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="fairytale-page__logo-img"
          />
        </div>
        <div style={{ width: 48 }} />
      </header>

      {/* 타이틀 */}
      <div className="fairytale-page__title-section">
        <h1 className="fairytale-page__title">어떤 동화를 만들까요?</h1>
        <p className="fairytale-page__subtitle">마음에 드는 동화책을 골라주세요!</p>
      </div>

      {/* 3D 책 캐러셀 */}
      <div className="fairytale-page__carousel">
        {/* 왼쪽 화살표 */}
        <button onClick={handlePrev} className="fairytale-page__nav-btn fairytale-page__nav-btn--left">
          <ChevronLeft size={32} />
        </button>

        {/* 책들 */}
        <div className="fairytale-page__books">
          {renderBook(visibleBooks.leftFar, 'leftFar')}
          {renderBook(visibleBooks.left, 'left')}
          {renderBook(visibleBooks.center, 'center')}
          {renderBook(visibleBooks.right, 'right')}
          {renderBook(visibleBooks.rightFar, 'rightFar')}
        </div>

        {/* 오른쪽 화살표 */}
        <button onClick={handleNext} className="fairytale-page__nav-btn fairytale-page__nav-btn--right">
          <ChevronRight size={32} />
        </button>
      </div>

      {/* 페이지 인디케이터 */}
      <div className="fairytale-page__indicators">
        <span className="fairytale-page__indicator-count">
          {currentIndex + 1} / {tales.length}
        </span>
        <div className="fairytale-page__indicator-dots">
          {tales.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`fairytale-page__indicator ${currentIndex === index ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* 선택 버튼 */}
      <div className="fairytale-page__cta">
        <button
          onClick={() => {
            const selected = tales[currentIndex]
            onSelectTale({
              id: selected.id,
              title: selected.title,
              thumbnail_url: selected.thumbnail_url
            })
            onNavigate('artstyle-selection')
          }}
          className="fairytale-page__cta-btn"
        >
          <span className="fairytale-page__cta-text">
            "{tales[currentIndex].title}" 선택하기
          </span>
          <span className="fairytale-page__cta-icon">📖</span>
        </button>
      </div>

      {/* 푸터 */}
      <footer className="fairytale-page__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}