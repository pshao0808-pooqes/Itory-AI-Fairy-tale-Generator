import { Play, Download, Share2, Clock, Palette, Calendar, Star } from 'lucide-react'
import { PageType } from '../../App'
import SimpleHeader from '../../components/common/SimpleHeader'
import '../../styles/pages/StoryDetailPage.css'

interface StoryDetailPageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  onMenuClick: () => void
}

export default function StoryDetailPage({ onNavigate, onGoBack, onMenuClick }: StoryDetailPageProps) {
  return (
    <div className="story-detail-page">
      {/* 배경 구름 */}
      <div className="story-detail-page__bg-decorations">
        <div className="story-detail-page__cloud story-detail-page__cloud--1"></div>
        <div className="story-detail-page__cloud story-detail-page__cloud--2"></div>
        <div className="story-detail-page__cloud story-detail-page__cloud--3"></div>
      </div>

      <SimpleHeader
        onNavigate={onNavigate}
        onGoBack={onGoBack}
        onMenuClick={onMenuClick}
      />

      <main className="story-detail-page__main">
        <div className="story-detail-page__container">
          {/* 책 표지 카드 */}
          <div className="story-detail-page__book-card">
            {/* 책 표지 */}
            <div className="story-detail-page__cover">
              <div className="story-detail-page__cover-inner">
                <div className="story-detail-page__cover-badge">수채화</div>
                <div className="story-detail-page__cover-emoji">🏠</div>
                <h2 className="story-detail-page__cover-title">흥부와 놀부</h2>
                <div className="story-detail-page__cover-decoration">
                  <span>✨</span>
                  <span>📖</span>
                  <span>✨</span>
                </div>
              </div>
              {/* 책 측면 */}
              <div className="story-detail-page__cover-spine"></div>
            </div>

            {/* 별점 */}
            <div className="story-detail-page__rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={24} fill="#FFD54F" color="#FFD54F" />
              ))}
            </div>
          </div>

          {/* 정보 영역 */}
          <div className="story-detail-page__info">
            {/* 제목 */}
            <div className="story-detail-page__title-section">
              <h1 className="story-detail-page__title">흥부와 놀부</h1>
              <p className="story-detail-page__subtitle">나만의 특별한 이야기</p>
            </div>

            {/* 메타 정보 */}
            <div className="story-detail-page__meta">
              <div className="story-detail-page__meta-item">
                <Calendar size={18} />
                <span>2024.01.15</span>
              </div>
              <div className="story-detail-page__meta-item">
                <Palette size={18} />
                <span>수채화 스타일</span>
              </div>
              <div className="story-detail-page__meta-item">
                <Clock size={18} />
                <span>6분 15초</span>
              </div>
            </div>

            {/* 선택한 여정 */}
            <div className="story-detail-page__journey">
              <h3 className="story-detail-page__journey-title">
                <span className="story-detail-page__journey-icon">✨</span>
                내가 선택한 여정
              </h3>
              <div className="story-detail-page__journey-list">
                <div className="story-detail-page__journey-item">
                  <span className="story-detail-page__journey-step">1</span>
                  <span className="story-detail-page__journey-label">발단</span>
                  <span className="story-detail-page__journey-text">🦅 제비를 만났어요</span>
                </div>
                <div className="story-detail-page__journey-item">
                  <span className="story-detail-page__journey-step">2</span>
                  <span className="story-detail-page__journey-label">전개</span>
                  <span className="story-detail-page__journey-text">🌰 박씨를 가져왔어요</span>
                </div>
                <div className="story-detail-page__journey-item">
                  <span className="story-detail-page__journey-step">3</span>
                  <span className="story-detail-page__journey-label">위기</span>
                  <span className="story-detail-page__journey-text">🌱 박을 심었어요</span>
                </div>
                <div className="story-detail-page__journey-item">
                  <span className="story-detail-page__journey-step">4</span>
                  <span className="story-detail-page__journey-label">절정</span>
                  <span className="story-detail-page__journey-text">💰 보물이 나왔어요</span>
                </div>
                <div className="story-detail-page__journey-item">
                  <span className="story-detail-page__journey-step">5</span>
                  <span className="story-detail-page__journey-label">결말</span>
                  <span className="story-detail-page__journey-text">🌟 전통 결말</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="story-detail-page__actions">
              <button
                onClick={() => onNavigate('video')}
                className="story-detail-page__btn story-detail-page__btn--play"
              >
                <Play size={22} />
                <span>영상 보기</span>
              </button>
              <button className="story-detail-page__btn story-detail-page__btn--download">
                <Download size={22} />
                <span>다운로드</span>
              </button>
              <button
                onClick={() => onNavigate('bookclub-upload')}
                className="story-detail-page__btn story-detail-page__btn--share"
              >
                <Share2 size={22} />
                <span>공유하기</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 하단 풍경 장식 */}
      <div className="story-detail-page__landscape">
        <div className="story-detail-page__grass"></div>
        <div className="story-detail-page__tree story-detail-page__tree--1"></div>
        <div className="story-detail-page__tree story-detail-page__tree--2"></div>
        <div className="story-detail-page__bush story-detail-page__bush--1"></div>
        <div className="story-detail-page__bush story-detail-page__bush--2"></div>
        <div className="story-detail-page__bush story-detail-page__bush--3"></div>
        <div className="story-detail-page__flower story-detail-page__flower--1"></div>
        <div className="story-detail-page__flower story-detail-page__flower--2"></div>
        <div className="story-detail-page__flower story-detail-page__flower--3"></div>
      </div>
    </div>
  )
}