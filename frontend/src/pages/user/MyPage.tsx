import { ChevronLeft, ChevronRight, Bell, HelpCircle, FileText, LogOut, User as UserIcon, Users, Settings } from 'lucide-react'
import { PageType, Kid, User, calculateAge } from '../../App'
import '../../styles/pages/MyPage.css'

interface MyPageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  onMenuClick: () => void
  currentKid: Kid | null
  userInfo: User
}

// 아바타가 이미지 경로인지 확인
const isImageUrl = (avatar: string | undefined): boolean => {
  if (!avatar) return false
  return avatar.startsWith('/') || avatar.startsWith('http')
}

export default function MyPage({ onNavigate, onGoBack, onMenuClick: _onMenuClick, currentKid, userInfo }: MyPageProps) {
  // 아이 나이 계산
  const kidAge = currentKid ? calculateAge(currentKid.kid_birth_date) : null
  const avatarUrl = currentKid?.avatar_url

  return (
    <div className="mypage">
      {/* 배경 구름 */}
      <div className="mypage__bg-decorations">
        <div className="mypage__cloud mypage__cloud--1"></div>
        <div className="mypage__cloud mypage__cloud--2"></div>
        <div className="mypage__cloud mypage__cloud--3"></div>
        <div className="mypage__cloud mypage__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="mypage__header">
        <div className="mypage__header-left">
          <button onClick={onGoBack} className="mypage__back-btn">
            <ChevronLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="mypage__logo-img"
          />
        </div>
        <div style={{ width: 48 }} />
      </header>

      <main className="mypage__main">
        {/* 인트로 */}
        <div className="mypage__intro">
          <div className="mypage__intro-icon">
            <Settings size={32} />
          </div>
          <h1 className="mypage__intro-title">마이페이지</h1>
          <p className="mypage__intro-desc">내 정보와 설정을 관리해요</p>
        </div>

        {/* 콘텐츠 */}
        <div className="mypage__content">
          {/* 왼쪽 컬럼 */}
          <div className="mypage__column mypage__column--left">
            {/* 현재 프로필 카드 */}
            <div className="mypage__profile-card">
              <div className="mypage__profile-avatar">
                {isImageUrl(avatarUrl) ? (
                  <img
                    src={avatarUrl}
                    alt="프로필"
                    className="mypage__profile-avatar-img"
                  />
                ) : (
                  avatarUrl || '👧'
                )}
              </div>
              <div className="mypage__profile-info">
                <span className="mypage__profile-badge">현재 프로필</span>
                <h3 className="mypage__profile-name">{currentKid?.kid_name || '사용자'}</h3>
                <p className="mypage__profile-age">{kidAge || 7}세</p>
              </div>
              <button
                onClick={() => onNavigate('profile-edit')}
                className="mypage__profile-edit-btn"
              >
                수정
              </button>
            </div>

            {/* 통계 카드 */}
            <div className="mypage__stats-card">
              <div className="mypage__stat-item">
                <span className="mypage__stat-icon">📚</span>
                <span className="mypage__stat-value">12</span>
                <span className="mypage__stat-label">만든 동화</span>
              </div>
              <div className="mypage__stat-divider"></div>
              <div className="mypage__stat-item">
                <span className="mypage__stat-icon">🎯</span>
                <span className="mypage__stat-value">7/10</span>
                <span className="mypage__stat-label">이번 달</span>
              </div>
              <div className="mypage__stat-divider"></div>
              <div className="mypage__stat-item">
                <span className="mypage__stat-icon">❤️</span>
                <span className="mypage__stat-value">48</span>
                <span className="mypage__stat-label">좋아요</span>
              </div>
            </div>

            {/* 보호자 계정 */}
            <div className="mypage__parent-card">
              <div className="mypage__parent-icon">
                <UserIcon size={24} />
              </div>
              <div className="mypage__parent-info">
                <span className="mypage__parent-label">보호자 계정</span>
                <h3 className="mypage__parent-name">{userInfo.name}</h3>
                <p className="mypage__parent-email">{userInfo.email}</p>
              </div>
              <button
                onClick={() => onNavigate('parent-account')}
                className="mypage__parent-btn"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* 로그아웃 - PC에서는 왼쪽 하단 */}
            <button
              onClick={() => onNavigate('landing')}
              className="mypage__logout-btn"
            >
              <LogOut size={20} />
              로그아웃
            </button>
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="mypage__column mypage__column--right">
            {/* 프로필 관리 */}
            <div className="mypage__menu-section">
              <h4 className="mypage__menu-title">
                <Users size={18} />
                프로필 관리
              </h4>
              <button
                onClick={() => onNavigate('profile-manage')}
                className="mypage__menu-item"
              >
                <span>프로필 관리</span>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* 설정 */}
            <div className="mypage__menu-section">
              <h4 className="mypage__menu-title">
                <Settings size={18} />
                설정
              </h4>
              <button
                onClick={() => onNavigate('notification-settings')}
                className="mypage__menu-item"
              >
                <div className="mypage__menu-icon mypage__menu-icon--yellow">
                  <Bell size={18} />
                </div>
                <span>알림 설정</span>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* 고객 지원 */}
            <div className="mypage__menu-section">
              <h4 className="mypage__menu-title">
                <HelpCircle size={18} />
                고객 지원
              </h4>
              <button
                onClick={() => onNavigate('faq')}
                className="mypage__menu-item"
              >
                <div className="mypage__menu-icon mypage__menu-icon--mint">
                  <HelpCircle size={18} />
                </div>
                <span>자주 묻는 질문 (FAQ)</span>
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => onNavigate('terms')}
                className="mypage__menu-item"
              >
                <div className="mypage__menu-icon mypage__menu-icon--blue">
                  <FileText size={18} />
                </div>
                <span>이용약관</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 앱 버전 */}
        <p className="mypage__version">앱 버전 1.0.0</p>
      </main>

      {/* 푸터 */}
      <footer className="mypage__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}