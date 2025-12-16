import { PageType } from '../../App'
import '../../styles/pages/LandingPage.css'

interface LandingPageProps {
  onNavigate: (page: PageType) => void
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="landing-page">
      {/* 배경 장식 요소들 - 구름만 */}
      <div className="landing-page__bg-decorations">
        <div className="landing-page__cloud landing-page__cloud--1"></div>
        <div className="landing-page__cloud landing-page__cloud--2"></div>
        <div className="landing-page__cloud landing-page__cloud--3"></div>
        <div className="landing-page__cloud landing-page__cloud--4"></div>
        <div className="landing-page__cloud landing-page__cloud--5"></div>
        <div className="landing-page__cloud landing-page__cloud--6"></div>
      </div>

      {/* 헤더 */}
      <header className="landing-page__header">
        <div className="landing-page__logo">
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="landing-page__logo-img"
          />
        </div>

        <div className="landing-page__header-btns">
          <button
            onClick={() => onNavigate('login')}
            className="landing-page__login-btn"
          >
            로그인
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="landing-page__signup-btn"
          >
            무료시작
          </button>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <main className="landing-page__main">
        <div className="landing-page__hero">
          {/* 왼쪽: 텍스트 콘텐츠 */}
          <div className="landing-page__hero-content">
            <div className="landing-page__hero-badge">
              7-11세 맞춤형 AI 동화
            </div>
            <h1 className="landing-page__hero-title">
              아이의 상상이<br />
              <span className="landing-page__hero-title--highlight">동화가 되는</span> 순간
            </h1>
            <p className="landing-page__hero-subtitle">
              우리 아이만의 특별한 이야기를 만들어보세요.<br />
              선택하고, 꾸미고, 영상으로 감상해요!
            </p>
            <div className="landing-page__cta-group">
              <button
                onClick={() => onNavigate('signup')}
                className="landing-page__cta-btn"
              >
                <span>무료로 시작하기</span>
                <span className="landing-page__cta-icon">→</span>
              </button>
              <button
                onClick={() => onNavigate('service-guide')}
                className="landing-page__secondary-btn"
              >
                서비스 둘러보기
              </button>
            </div>
          </div>

          {/* 오른쪽: 히어로 이미지 */}
          <div className="landing-page__hero-visual">
            <img
              src="/src/assets/images/landing-hero.png"
              alt="아이토리 메인 이미지"
              className="landing-page__hero-img"
            />
          </div>
        </div>

        {/* 통계 */}
        <div className="landing-page__stats">
          <div className="landing-page__stat">
            <div className="landing-page__stat-content">
              <strong>10,000+</strong>
              <span>가정이 선택했어요</span>
            </div>
          </div>
          <div className="landing-page__stat">
            <div className="landing-page__stat-content">
              <strong>4.8/5.0</strong>
              <span>부모님 만족도</span>
            </div>
          </div>
          <div className="landing-page__stat">
            <div className="landing-page__stat-content">
              <strong>50,000+</strong>
              <span>동화가 만들어졌어요</span>
            </div>
          </div>
        </div>

        {/* 주요 기능 */}
        <section className="landing-page__features">
          <h2 className="landing-page__section-title">
            이런 특별한 경험을 할 수 있어요
          </h2>
          <div className="landing-page__feature-grid">
            {[
              {
                title: '20가지 전래동화',
                desc: '토끼와 거북이부터 해와 달이 된 오누이까지',
                color: '#FFE4B5'
              },
              {
                title: '5가지 그림체',
                desc: '수채화, 3D, 픽사 스타일 등 취향대로',
                color: '#B8E0D2'
              },
              {
                title: '나만의 스토리',
                desc: '선택에 따라 달라지는 이야기 전개',
                color: '#FFD4E5'
              },
              {
                title: 'AI 영상 생성',
                desc: '완성된 동화를 영상으로 감상해요',
                color: '#D4E5FF'
              },
              {
                title: 'AI 내레이션',
                desc: '따뜻한 목소리로 읽어주는 동화',
                color: '#E5D4FF'
              },
              {
                title: '저장 & 공유',
                desc: 'MP4로 다운로드하고 가족과 함께',
                color: '#D4FFE5'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="landing-page__feature-card"
                style={{
                  '--card-color': feature.color
                } as React.CSSProperties}
              >
                <h3 className="landing-page__feature-title">{feature.title}</h3>
                <p className="landing-page__feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 작동 방식 */}
        <section className="landing-page__how-it-works">
          <h2 className="landing-page__section-title">
            이렇게 쉽게 만들어요
          </h2>
          <div className="landing-page__steps">
            <div className="landing-page__step">
              <div className="landing-page__step-number">1</div>
              <div className="landing-page__step-text">동화 선택</div>
            </div>
            <div className="landing-page__step-connector">
              <div className="landing-page__step-line"></div>
            </div>
            <div className="landing-page__step">
              <div className="landing-page__step-number">2</div>
              <div className="landing-page__step-text">그림체 선택</div>
            </div>
            <div className="landing-page__step-connector">
              <div className="landing-page__step-line"></div>
            </div>
            <div className="landing-page__step">
              <div className="landing-page__step-number">3</div>
              <div className="landing-page__step-text">이야기 꾸미기</div>
            </div>
            <div className="landing-page__step-connector">
              <div className="landing-page__step-line"></div>
            </div>
            <div className="landing-page__step landing-page__step--final">
              <div className="landing-page__step-number">4</div>
              <div className="landing-page__step-text">영상 완성!</div>
            </div>
          </div>
        </section>

        {/* 최종 CTA */}
        <section className="landing-page__final-cta">
          <div className="landing-page__final-cta-content">
            <h2 className="landing-page__final-cta-title">
              지금 바로 시작해보세요!
            </h2>
            <p className="landing-page__final-cta-desc">
              첫 동화는 무료로 만들 수 있어요
            </p>
            <button
              onClick={() => onNavigate('signup')}
              className="landing-page__final-cta-btn"
            >
              무료로 동화 만들기
            </button>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="landing-page__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}