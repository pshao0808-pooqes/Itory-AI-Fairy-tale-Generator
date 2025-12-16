import { PageType, Kid, User } from '../../App'
import SimpleHeader from '../../components/common/SimpleHeader'
import '../../styles/pages/HomePage.css'

interface HomePageProps {
  onNavigate: (page: PageType) => void
  onMenuClick: () => void
  currentKid: Kid | null
  userInfo: User
}

// 아바타가 이미지 경로인지 확인
const isImageUrl = (avatar: string | undefined): boolean => {
  if (!avatar) return false
  return avatar.startsWith('/') || avatar.startsWith('http')
}

export default function HomePage({ onNavigate, onMenuClick, currentKid, userInfo }: HomePageProps) {
  // 사용량 계산 (PREMIUM: 10회, BASIC: 무료체험 1회)
  const maxUsage = userInfo.subscription_tier === 'PREMIUM' ? 10 : 1
  const currentUsage = 7 // TODO: API에서 가져올 값

  const cards = [
    {
      image: '/src/assets/images/home-fairytale.png',
      title: '동화 만들기',
      description: '나만의 동화를 만들어요',
      page: 'fairytale-selection' as PageType
    },
    {
      image: '/src/assets/images/home-bookclub.png',
      title: '북클럽 보기',
      description: '친구들과 이야기 나누기',
      page: 'bookclub' as PageType
    },
    {
      image: '/src/assets/images/home-bookshelf.png',
      title: '내 책장',
      description: '내가 만든 동화 모음',
      count: '총 12권',
      page: 'bookshelf' as PageType
    }
  ]

  // 아이 나이 계산
  const avatarUrl = currentKid?.avatar_url

  return (
    <div className="home-page">
      {/* 배경 구름 장식 */}
      <div className="home-page__bg-decorations">
        <div className="home-page__cloud home-page__cloud--1"></div>
        <div className="home-page__cloud home-page__cloud--2"></div>
        <div className="home-page__cloud home-page__cloud--3"></div>
        <div className="home-page__cloud home-page__cloud--4"></div>
      </div>

      <SimpleHeader
        onNavigate={onNavigate}
        onMenuClick={onMenuClick}
        showBackButton={false}
      />

      <main className="home-page__main">
        {/* 상단 섹션: 환영 + 사용량 */}
        <div className="home-page__top-section">
          <div className="home-page__welcome-card">
            <div className="home-page__avatar">
              {isImageUrl(avatarUrl) ? (
                <img
                  src={avatarUrl}
                  alt="프로필"
                  className="home-page__avatar-img"
                />
              ) : (
                avatarUrl || '👦'
              )}
            </div>
            <div className="home-page__welcome-text">
              <h2 className="home-page__greeting">
                {currentKid?.kid_name || '친구'}님, 반가워요!
              </h2>
              <p className="home-page__sub-greeting">
                오늘은 어떤 동화를 만들어볼까요?
              </p>
            </div>
          </div>

          <div className="home-page__usage-card">
            <p className="home-page__usage-label">이번 달 사용량</p>
            <div className="home-page__usage-bar">
              <div
                className="home-page__usage-fill"
                style={{ width: `${(currentUsage / maxUsage) * 100}%` }}
              ></div>
            </div>
            <p className="home-page__usage-text">
              <strong>{currentUsage}</strong> / {maxUsage}회
            </p>
          </div>
        </div>

        {/* 카드 그리드 - 이미지 위, 텍스트 아래 연결 */}
        <div className="home-page__cards">
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={() => onNavigate(card.page)}
              className="home-page__card"
            >
              {/* 상단: 이미지 영역 */}
              <div className="home-page__card-image-area">
                <img
                  src={card.image}
                  alt={card.title}
                  className="home-page__card-image"
                />
              </div>

              {/* 하단: 텍스트 영역 */}
              <div className="home-page__card-text-area">
                <h3 className="home-page__card-title">{card.title}</h3>
                <p className="home-page__card-desc">{card.description}</p>
                {card.count && (
                  <span className="home-page__card-count">{card.count}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 사용자 가이드 버튼 */}
        <div className="home-page__guide-section">
          <button
            onClick={() => onNavigate('service-guide')}
            className="home-page__guide-btn"
          >
            <span>처음이신가요?</span>
            <span className="home-page__guide-arrow">→</span>
            <span>사용자 가이드 보기</span>
          </button>
        </div>
      </main>

      {/* 하단 풍경 장식 */}
      <div className="home-page__landscape">
        <div className="home-page__grass"></div>

        <div className="home-page__tree home-page__tree--1">
          <div className="home-page__tree-top"></div>
          <div className="home-page__tree-trunk"></div>
        </div>
        <div className="home-page__tree home-page__tree--2">
          <div className="home-page__tree-top"></div>
          <div className="home-page__tree-trunk"></div>
        </div>
        <div className="home-page__tree home-page__tree--3">
          <div className="home-page__tree-top"></div>
          <div className="home-page__tree-trunk"></div>
        </div>
        <div className="home-page__tree home-page__tree--4">
          <div className="home-page__tree-top"></div>
          <div className="home-page__tree-trunk"></div>
        </div>

        <div className="home-page__house home-page__house--1">
          <div className="home-page__house-roof"></div>
          <div className="home-page__house-body">
            <div className="home-page__house-window"></div>
            <div className="home-page__house-door"></div>
          </div>
        </div>

        <div className="home-page__bush home-page__bush--1"></div>
        <div className="home-page__bush home-page__bush--2"></div>
        <div className="home-page__bush home-page__bush--3"></div>
        <div className="home-page__bush home-page__bush--4"></div>
      </div>
    </div>
  )
}