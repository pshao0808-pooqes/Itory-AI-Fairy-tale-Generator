import { useState } from 'react'
import { ChevronLeft, ChevronDown, MessageCircle, HelpCircle } from 'lucide-react'
import { PageType } from '../../App'
import '../../styles/pages/FAQPage.css'

interface FAQPageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  onMenuClick: () => void
}

const faqs = [
  {
    category: '동화 만들기',
    icon: '🎨',
    color: '#FFE4B5',
    questions: [
      {
        q: '동화를 만드는 데 얼마나 걸리나요?',
        a: '발단 영상 생성에 약 30초~1분, 전체 동화 완성까지는 약 5~10분 정도 소요됩니다. 선택지를 고르는 시간에 따라 달라질 수 있어요.'
      },
      {
        q: '만든 동화를 수정할 수 있나요?',
        a: '완성된 동화는 수정할 수 없지만, 같은 동화를 다시 만들 때 다른 선택지를 고르면 새로운 버전을 만들 수 있어요!'
      },
      {
        q: '하루에 몇 개의 동화를 만들 수 있나요?',
        a: '무료 플랜은 월 20개의 동화를 만들 수 있어요. 더 많은 동화를 만들고 싶다면 프리미엄 플랜을 이용해주세요.'
      }
    ]
  },
  {
    category: '앱 사용',
    icon: '📱',
    color: '#B8E0D2',
    questions: [
      {
        q: '프로필은 몇 개까지 만들 수 있나요?',
        a: '최대 4개의 프로필을 만들 수 있어요. 각 프로필마다 별도의 책장과 활동 기록이 저장됩니다.'
      },
      {
        q: '동화를 다운로드할 수 있나요?',
        a: '네! 완성된 동화는 MP4 영상 파일로 다운로드할 수 있어요. 다운로드한 파일은 인터넷 없이도 볼 수 있습니다.'
      }
    ]
  },
  {
    category: '북클럽',
    icon: '👥',
    color: '#FFD4E5',
    questions: [
      {
        q: '북클럽에 올린 동화는 누구나 볼 수 있나요?',
        a: '네, 북클럽에 공유된 동화는 모든 아이토리 사용자가 볼 수 있어요. 공유하기 전에 한 번 더 확인해주세요!'
      },
      {
        q: '부적절한 콘텐츠를 발견하면 어떻게 하나요?',
        a: '게시글 우측 상단의 신고 버튼을 눌러 신고해주세요. 검토 후 적절한 조치를 취하겠습니다.'
      }
    ]
  },
  {
    category: '결제 및 구독',
    icon: '💳',
    color: '#D4E5FF',
    questions: [
      {
        q: '구독을 취소하면 만든 동화는 어떻게 되나요?',
        a: '구독을 취소해도 이미 만든 동화는 계속 볼 수 있어요. 다만 새로운 동화 생성은 무료 플랜 한도 내에서만 가능합니다.'
      },
      {
        q: '환불은 어떻게 하나요?',
        a: '결제일로부터 7일 이내에 고객센터로 문의해주시면 환불 처리해드립니다.'
      }
    ]
  }
]

export default function FAQPage({ onNavigate: _onNavigate, onGoBack, onMenuClick: _onMenuClick }: FAQPageProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (key: string) => {
    setOpenItems(prev =>
      prev.includes(key)
        ? prev.filter(item => item !== key)
        : [...prev, key]
    )
  }

  return (
    <div className="faq-page">
      {/* 배경 구름 */}
      <div className="faq-page__bg-decorations">
        <div className="faq-page__cloud faq-page__cloud--1"></div>
        <div className="faq-page__cloud faq-page__cloud--2"></div>
        <div className="faq-page__cloud faq-page__cloud--3"></div>
        <div className="faq-page__cloud faq-page__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="faq-page__header">
        <div className="faq-page__header-left">
          <button onClick={onGoBack} className="faq-page__back-btn">
            <ChevronLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="faq-page__logo-img"
          />
        </div>
        <div style={{ width: 48 }} />
      </header>

      <main className="faq-page__main">
        {/* 인트로 */}
        <div className="faq-page__intro">
          <div className="faq-page__intro-icon">
            <HelpCircle size={32} />
          </div>
          <h2 className="faq-page__intro-title">무엇을 도와드릴까요?</h2>
          <p className="faq-page__intro-desc">궁금한 점을 찾아보세요!</p>
        </div>

        {/* FAQ 목록 */}
        <div className="faq-page__content">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="faq-page__category">
              <div
                className="faq-page__category-header"
                style={{ '--category-color': category.color } as React.CSSProperties}
              >
                <span className="faq-page__category-icon">{category.icon}</span>
                <h3 className="faq-page__category-title">{category.category}</h3>
                <span className="faq-page__category-count">{category.questions.length}개</span>
              </div>

              <div className="faq-page__questions">
                {category.questions.map((faq, qIndex) => {
                  const key = `${catIndex}-${qIndex}`
                  const isOpen = openItems.includes(key)

                  return (
                    <div key={qIndex} className={`faq-page__item ${isOpen ? 'open' : ''}`}>
                      <button
                        className="faq-page__question"
                        onClick={() => toggleItem(key)}
                      >
                        <span className="faq-page__question-text">{faq.q}</span>
                        <ChevronDown
                          size={20}
                          className={`faq-page__arrow ${isOpen ? 'rotated' : ''}`}
                        />
                      </button>
                      <div className={`faq-page__answer ${isOpen ? 'visible' : ''}`}>
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 문의하기 */}
        <div className="faq-page__contact">
          <div className="faq-page__contact-content">
            <MessageCircle size={28} className="faq-page__contact-icon" />
            <div className="faq-page__contact-text">
              <h3>찾는 답변이 없으신가요?</h3>
              <p>언제든 문의해주세요. 빠르게 답변드릴게요!</p>
            </div>
          </div>
          <button className="faq-page__contact-btn">
            문의하기
          </button>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="faq-page__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}