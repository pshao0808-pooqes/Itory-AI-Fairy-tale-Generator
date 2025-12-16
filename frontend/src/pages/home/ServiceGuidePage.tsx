import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageType } from '../../App'
import '../../styles/pages/ServiceGuidePage.css'

interface ServiceGuidePageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
}

export default function ServiceGuidePage({ onNavigate, onGoBack }: ServiceGuidePageProps) {
  // 동화 목록 예시
  const fairytales = [
    { title: '토끼와 거북이', emoji: '🐢' },
    { title: '콩쥐팥쥐', emoji: '👧' },
    { title: '해와 달이 된 오누이', emoji: '🌙' },
    { title: '흥부와 놀부', emoji: '🐦' },
    { title: '선녀와 나무꾼', emoji: '🧚' },
    { title: '금도끼 은도끼', emoji: '🪓' },
  ]

  // 그림체 스타일
  const artStyles = [
    { name: '실사풍', desc: '사진처럼 생생하게', color: '#FFE4B5', emoji: '📷' },
    { name: '2D 애니메이션', desc: '만화처럼 귀엽게', color: '#B8E0D2', emoji: '✏️' },
    { name: '3D 카툰', desc: '입체적이고 생동감있게', color: '#FFD4E5', emoji: '🎮' },
    { name: '픽사 스타일', desc: '영화처럼 감성적으로', color: '#D4E5FF', emoji: '🎬' },
    { name: '수채화', desc: '따뜻하고 부드럽게', color: '#E5D4FF', emoji: '🎨' },
  ]

  // 스토리 5단계
  const storyStages = [
    { stage: '발단', desc: '이야기의 시작', example: '옛날 옛적에...' },
    { stage: '전개', desc: '사건이 펼쳐져요', example: '그러던 어느 날...' },
    { stage: '위기', desc: '문제가 생겨요', example: '큰일이에요!' },
    { stage: '절정', desc: '가장 긴장되는 순간', example: '과연 어떻게 될까요?' },
    { stage: '결말', desc: '이야기의 마무리', example: '행복하게 살았답니다' },
  ]

  return (
    <div className="service-guide-page">
      {/* 배경 구름 */}
      <div className="service-guide-page__bg-decorations">
        <div className="service-guide-page__cloud service-guide-page__cloud--1"></div>
        <div className="service-guide-page__cloud service-guide-page__cloud--2"></div>
        <div className="service-guide-page__cloud service-guide-page__cloud--3"></div>
        <div className="service-guide-page__cloud service-guide-page__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="service-guide-page__header">
        <div className="service-guide-page__header-left">
          <button onClick={onGoBack} className="service-guide-page__back-btn">
            <ChevronLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="service-guide-page__logo-img"
          />
        </div>
        <button
          onClick={() => onNavigate('fairytale-selection')}
          className="service-guide-page__start-btn"
        >
          바로 시작하기
        </button>
      </header>

      <main className="service-guide-page__main">
        {/* 인트로 */}
        <section className="service-guide-page__intro">
          <h1 className="service-guide-page__intro-title">
            🎯 아이토리 사용법
          </h1>
          <p className="service-guide-page__intro-desc">
            4단계만 따라하면 나만의 동화 영상이 완성돼요!
          </p>
        </section>

        {/* Step 1: 동화 선택 */}
        <section className="service-guide-page__step-section">
          <div className="service-guide-page__step-header">
            <div className="service-guide-page__step-badge">STEP 1</div>
            <h2 className="service-guide-page__step-title">📚 동화를 선택해요</h2>
          </div>
          <p className="service-guide-page__step-desc">
            20가지 전래동화 중에서 만들고 싶은 이야기를 골라요
          </p>
          <div className="service-guide-page__fairytale-grid">
            {fairytales.map((tale, index) => (
              <div key={index} className="service-guide-page__fairytale-item">
                <span className="service-guide-page__fairytale-emoji">{tale.emoji}</span>
                <span className="service-guide-page__fairytale-title">{tale.title}</span>
              </div>
            ))}
            <div className="service-guide-page__fairytale-more">
              +14개 더...
            </div>
          </div>
        </section>

        {/* Step 2: 그림체 선택 */}
        <section className="service-guide-page__step-section">
          <div className="service-guide-page__step-header">
            <div className="service-guide-page__step-badge">STEP 2</div>
            <h2 className="service-guide-page__step-title">🎨 그림체를 선택해요</h2>
          </div>
          <p className="service-guide-page__step-desc">
            5가지 스타일 중 마음에 드는 그림체로 동화를 꾸며요
          </p>
          <div className="service-guide-page__art-grid">
            {artStyles.map((style, index) => (
              <div
                key={index}
                className="service-guide-page__art-item"
                style={{ '--art-color': style.color } as React.CSSProperties}
              >
                <span className="service-guide-page__art-emoji">{style.emoji}</span>
                <div className="service-guide-page__art-info">
                  <span className="service-guide-page__art-name">{style.name}</span>
                  <span className="service-guide-page__art-desc">{style.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 3: 스토리 만들기 */}
        <section className="service-guide-page__step-section">
          <div className="service-guide-page__step-header">
            <div className="service-guide-page__step-badge">STEP 3</div>
            <h2 className="service-guide-page__step-title">✨ 스토리를 만들어요</h2>
          </div>
          <p className="service-guide-page__step-desc">
            5단계로 나눠서 이야기를 만들어요. 각 단계마다 2가지 선택지 중 하나를 골라요!
          </p>
          <div className="service-guide-page__story-flow">
            {storyStages.map((item, index) => (
              <div key={index} className="service-guide-page__story-stage">
                <div className="service-guide-page__story-stage-header">
                  <span className="service-guide-page__story-stage-num">{index + 1}</span>
                  <span className="service-guide-page__story-stage-name">{item.stage}</span>
                </div>
                <p className="service-guide-page__story-stage-desc">{item.desc}</p>
                <p className="service-guide-page__story-stage-example">"{item.example}"</p>
                {index < storyStages.length - 1 && (
                  <div className="service-guide-page__story-arrow">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="service-guide-page__story-tip">
            💡 <strong>팁:</strong> 선택에 따라 이야기가 달라져요! 같은 동화도 매번 새로운 결말이 가능해요
          </div>
        </section>

        {/* Step 4: 영상 완성 */}
        <section className="service-guide-page__step-section">
          <div className="service-guide-page__step-header">
            <div className="service-guide-page__step-badge service-guide-page__step-badge--final">STEP 4</div>
            <h2 className="service-guide-page__step-title">🎬 영상이 완성돼요!</h2>
          </div>
          <p className="service-guide-page__step-desc">
            AI가 선택한 그림체와 스토리로 동화 영상을 만들어요
          </p>
          <div className="service-guide-page__result-features">
            <div className="service-guide-page__result-item">
              <span className="service-guide-page__result-icon">🎙️</span>
              <div className="service-guide-page__result-content">
                <strong>AI 내레이션</strong>
                <span>따뜻한 목소리로 읽어줘요</span>
              </div>
            </div>
            <div className="service-guide-page__result-item">
              <span className="service-guide-page__result-icon">💾</span>
              <div className="service-guide-page__result-content">
                <strong>MP4 다운로드</strong>
                <span>영상을 저장할 수 있어요</span>
              </div>
            </div>
            <div className="service-guide-page__result-item">
              <span className="service-guide-page__result-icon">📚</span>
              <div className="service-guide-page__result-content">
                <strong>내 책장에 저장</strong>
                <span>만든 동화를 모아볼 수 있어요</span>
              </div>
            </div>
            <div className="service-guide-page__result-item">
              <span className="service-guide-page__result-icon">👨‍👩‍👧‍👦</span>
              <div className="service-guide-page__result-content">
                <strong>북클럽 공유</strong>
                <span>친구들과 함께 볼 수 있어요</span>
              </div>
            </div>
          </div>
        </section>

        {/* 최종 CTA */}
        <section className="service-guide-page__final-cta">
          <h2 className="service-guide-page__final-cta-title">
            준비됐나요? 🚀
          </h2>
          <p className="service-guide-page__final-cta-desc">
            지금 바로 나만의 동화를 만들어보세요!
          </p>
          <button
            onClick={() => onNavigate('fairytale-selection')}
            className="service-guide-page__final-cta-btn"
          >
            동화 만들기 시작 →
          </button>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="service-guide-page__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}