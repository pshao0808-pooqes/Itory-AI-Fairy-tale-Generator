import { ChevronLeft, FileText, Shield, Users, AlertTriangle, RefreshCw } from 'lucide-react'
import { PageType } from '../../App'
import '../../styles/pages/TermsPage.css'

interface TermsPageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  onMenuClick: () => void
}

const termsData = [
  {
    icon: FileText,
    title: '제1조 (목적)',
    color: '#FFE4B5',
    content: '본 약관은 아이토리(이하 "회사")가 제공하는 AI 인터랙티브 동화 서비스(이하 "서비스")의 이용에 관한 기본적인 사항을 규정함을 목적으로 합니다.'
  },
  {
    icon: FileText,
    title: '제2조 (서비스의 내용)',
    color: '#B8E0D2',
    content: '회사가 제공하는 서비스의 내용은 다음과 같습니다:',
    list: [
      'AI 기반 인터랙티브 동화 생성 서비스',
      '생성된 동화 콘텐츠의 저장 및 관리',
      '북클럽을 통한 콘텐츠 공유 서비스',
      '기타 회사가 정하는 서비스'
    ]
  },
  {
    icon: Users,
    title: '제3조 (회원가입)',
    color: '#FFD4E5',
    content: '서비스를 이용하고자 하는 자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.'
  },
  {
    icon: Shield,
    title: '제4조 (개인정보 보호)',
    color: '#D4E5FF',
    content: '회사는 회원의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고 이를 준수합니다. 회사의 개인정보처리방침은 서비스 화면에서 확인할 수 있습니다.'
  },
  {
    icon: FileText,
    title: '제5조 (저작권)',
    color: '#E5D4FF',
    content: '서비스를 통해 생성된 동화 콘텐츠의 저작권은 회원에게 귀속됩니다. 단, 회사는 서비스 운영 및 개선을 위해 해당 콘텐츠를 활용할 수 있습니다.'
  },
  {
    icon: AlertTriangle,
    title: '제6조 (금지행위)',
    color: '#FFE4B5',
    content: '회원은 다음 각 호의 행위를 하여서는 안 됩니다:',
    list: [
      '타인의 개인정보를 도용하는 행위',
      '서비스를 이용하여 불법적인 콘텐츠를 생성하는 행위',
      '서비스의 정상적인 운영을 방해하는 행위',
      '기타 법령에 위반되는 행위'
    ]
  },
  {
    icon: RefreshCw,
    title: '제7조 (약관의 개정)',
    color: '#B8E0D2',
    content: '회사는 필요한 경우 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있습니다. 약관이 개정되는 경우 회사는 개정 내용을 서비스 내 공지사항을 통해 공지합니다.'
  }
]

export default function TermsPage({ onNavigate: _onNavigate, onGoBack, onMenuClick: _onMenuClick }: TermsPageProps) {
  return (
    <div className="terms-page">
      {/* 배경 구름 */}
      <div className="terms-page__bg-decorations">
        <div className="terms-page__cloud terms-page__cloud--1"></div>
        <div className="terms-page__cloud terms-page__cloud--2"></div>
        <div className="terms-page__cloud terms-page__cloud--3"></div>
        <div className="terms-page__cloud terms-page__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="terms-page__header">
        <div className="terms-page__header-left">
          <button onClick={onGoBack} className="terms-page__back-btn">
            <ChevronLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="terms-page__logo-img"
          />
        </div>
        <div style={{ width: 48 }} />
      </header>

      <main className="terms-page__main">
        {/* 인트로 */}
        <div className="terms-page__intro">
          <div className="terms-page__intro-icon">
            <FileText size={32} />
          </div>
          <h2 className="terms-page__intro-title">아이토리 서비스 이용약관</h2>
          <div className="terms-page__updated">
            <span>최종 수정일: 2024년 1월 15일</span>
          </div>
        </div>

        {/* 약관 내용 */}
        <div className="terms-page__content">
          {termsData.map((section, index) => {
            const IconComponent = section.icon
            return (
              <div
                key={index}
                className="terms-page__section"
                style={{ '--section-color': section.color } as React.CSSProperties}
              >
                <div className="terms-page__section-header">
                  <div className="terms-page__section-icon">
                    <IconComponent size={20} />
                  </div>
                  <h3 className="terms-page__section-title">{section.title}</h3>
                </div>
                <div className="terms-page__section-body">
                  <p>{section.content}</p>
                  {section.list && (
                    <ul className="terms-page__list">
                      {section.list.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 하단 안내 */}
        <div className="terms-page__bottom-notice">
          <p>아이토리 서비스를 이용해주셔서 감사합니다. 🌳</p>
          <p className="terms-page__bottom-sub">
            본 약관에 대한 문의사항은 고객센터로 연락해주세요.
          </p>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="terms-page__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}