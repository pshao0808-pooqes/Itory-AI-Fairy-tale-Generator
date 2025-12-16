import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageType } from '../../App'
import SimpleHeader from '../../components/common/SimpleHeader'
import '../../styles/pages/MyBookshelfPage.css'

interface MyBookshelfPageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  onMenuClick: () => void
}

const myStories = [
  { id: 1, title: '흥부와 놀부', style: '수채화', thumbnail: '🏠', color: '#FFB3D9', spineColor: '#FF8BBD' },
  { id: 2, title: '콩쥐와 팥쥐', style: '3D 카툰', thumbnail: '👧', color: '#B3E0FF', spineColor: '#8BC8FF' },
  { id: 3, title: '토끼와 거북이', style: '실사', thumbnail: '🐰', color: '#FFF4B3', spineColor: '#FFE87C' },
  { id: 4, title: '혹부리 영감', style: '2D 애니', thumbnail: '👴', color: '#FFB3D9', spineColor: '#FF8BBD' },
  { id: 5, title: '해와 달', style: '픽사', thumbnail: '🌙', color: '#FFCFA3', spineColor: '#FFB87C' },
  { id: 6, title: '금도끼 은도끼', style: '수채화', thumbnail: '🪓', color: '#E0CFFF', spineColor: '#C8A8FF' },
  { id: 7, title: '선녀와 나무꾼', style: '2D 애니', thumbnail: '👰', color: '#FFB3D9', spineColor: '#FF8BBD' },
  { id: 8, title: '별주부전', style: '픽사', thumbnail: '🐢', color: '#B3F5E6', spineColor: '#8BE5D0' },
  { id: 9, title: '잭과 콩나무', style: '3D 카툰', thumbnail: '🌱', color: '#B3E0FF', spineColor: '#8BC8FF' },
  { id: 10, title: '호랑이와 곶감', style: '실사', thumbnail: '🐯', color: '#FFF4B3', spineColor: '#FFE87C' },
  { id: 11, title: '도깨비 방망이', style: '수채화', thumbnail: '🔨', color: '#E0CFFF', spineColor: '#C8A8FF' },
  { id: 12, title: '젊어지는 샘물', style: '픽사', thumbnail: '💧', color: '#B3F5E6', spineColor: '#8BE5D0' }
]

export default function MyBookshelfPage({ onNavigate, onGoBack, onMenuClick }: MyBookshelfPageProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="bookshelf-page">
      {/* 배경 구름 */}
      <div className="bookshelf-page__bg-decorations">
        <div className="bookshelf-page__cloud bookshelf-page__cloud--1"></div>
        <div className="bookshelf-page__cloud bookshelf-page__cloud--2"></div>
        <div className="bookshelf-page__cloud bookshelf-page__cloud--3"></div>
      </div>

      <SimpleHeader
        onNavigate={onNavigate}
        onGoBack={onGoBack}
        onMenuClick={onMenuClick}
      />

      <main className="bookshelf-page__main">
        {/* 타이틀 */}
        <div className="bookshelf-page__header">
          <div className="bookshelf-page__title-icon">📚</div>
          <div className="bookshelf-page__title-content">
            <h1 className="bookshelf-page__title">내 책장</h1>
            <p className="bookshelf-page__subtitle">
              총 <strong>{myStories.length}권</strong>의 동화를 만들었어요!
            </p>
          </div>
        </div>

        {/* 책장 */}
        <div className="bookshelf-page__bookcase">
          {/* 책장 프레임 상단 */}
          <div className="bookshelf-page__frame-top">
            <div className="bookshelf-page__frame-decor bookshelf-page__frame-decor--left">🌟</div>
            <div className="bookshelf-page__frame-title">나만의 동화 컬렉션</div>
            <div className="bookshelf-page__frame-decor bookshelf-page__frame-decor--right">🌟</div>
          </div>

          {/* 책장 내부 */}
          <div className="bookshelf-page__shelf-area">
            {/* 네비게이션 버튼 */}
            <button
              onClick={() => scroll('left')}
              className="bookshelf-page__nav-btn bookshelf-page__nav-btn--left"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={() => scroll('right')}
              className="bookshelf-page__nav-btn bookshelf-page__nav-btn--right"
            >
              <ChevronRight size={28} />
            </button>

            {/* 책들 스크롤 컨테이너 */}
            <div ref={scrollRef} className="bookshelf-page__books hide-scrollbar">
              {myStories.map((story) => (
                <div
                  key={story.id}
                  onMouseEnter={() => setHoveredId(story.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onNavigate('story-detail')}
                  className={`bookshelf-page__book ${hoveredId === story.id ? 'hovered' : ''}`}
                >
                  {/* 책등 */}
                  <div
                    className="bookshelf-page__book-spine"
                    style={{
                      background: `linear-gradient(135deg, ${story.spineColor} 0%, ${story.color} 100%)`
                    }}
                  >
                    {/* 책 반사 효과 */}
                    <div className="bookshelf-page__book-shine" />

                    {/* 스타일 뱃지 */}
                    <div className="bookshelf-page__book-badge">{story.style}</div>

                    {/* 제목 (세로) */}
                    <div className="bookshelf-page__book-title">{story.title}</div>

                    {/* 아이콘 */}
                    <div className="bookshelf-page__book-emoji">{story.thumbnail}</div>

                    {/* 책 페이지 효과 */}
                    <div className="bookshelf-page__book-pages"></div>
                  </div>

                  {/* 호버시 나타나는 정보 */}
                  {hoveredId === story.id && (
                    <div className="bookshelf-page__book-info animate-fade-in">
                      <p className="bookshelf-page__book-info-title">{story.title}</p>
                      <p className="bookshelf-page__book-info-style">{story.style}</p>
                      <p className="bookshelf-page__book-info-action">📖 클릭하여 보기</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 책장 선반 */}
            <div className="bookshelf-page__shelf-board"></div>
          </div>

          {/* 책장 프레임 하단 */}
          <div className="bookshelf-page__frame-bottom"></div>
        </div>

        {/* 안내 팁 */}
        <div className="bookshelf-page__tip">
          <div className="bookshelf-page__tip-icon">💡</div>
          <div className="bookshelf-page__tip-content">
            <p className="bookshelf-page__tip-main">책 위에 마우스를 올려보세요!</p>
            <p className="bookshelf-page__tip-sub">좌우 화살표로 더 많은 책을 볼 수 있어요</p>
          </div>
        </div>
      </main>

      {/* 하단 풍경 장식 */}
      <div className="bookshelf-page__landscape">
        <div className="bookshelf-page__grass"></div>
        <div className="bookshelf-page__tree bookshelf-page__tree--1"></div>
        <div className="bookshelf-page__tree bookshelf-page__tree--2"></div>
        <div className="bookshelf-page__bush bookshelf-page__bush--1"></div>
        <div className="bookshelf-page__bush bookshelf-page__bush--2"></div>
        <div className="bookshelf-page__bush bookshelf-page__bush--3"></div>
        <div className="bookshelf-page__flower bookshelf-page__flower--1"></div>
        <div className="bookshelf-page__flower bookshelf-page__flower--2"></div>
        <div className="bookshelf-page__flower bookshelf-page__flower--3"></div>
      </div>
    </div>
  )
}