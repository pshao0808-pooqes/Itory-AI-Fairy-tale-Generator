import { useState } from 'react'
import { ChevronRight, CreditCard, Users, Shield, ArrowLeft, Crown, Receipt, X, Lock, Check, Zap, Trash2, UserCog, Bell } from 'lucide-react'
import { PageType, User } from '../../App'
import '../../styles/pages/ParentAccountPage.css'

interface ParentAccountPageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  userInfo: User
  kidsCount: number
  isUnlocked: boolean
  onUnlock: () => void
}

export default function ParentAccountPage({
  onNavigate,
  onGoBack,
  userInfo,
  kidsCount,
  isUnlocked,
  onUnlock
}: ParentAccountPageProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(!isUnlocked)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handlePasswordSubmit = () => {
    if (password === '1234') {
      onUnlock()
      setShowPasswordModal(false)
      setError('')
    } else {
      setError('비밀번호가 틀렸습니다')
      setPassword('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit()
    }
  }

  // 구독 종료일 포맷
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR')
  }

  // 비밀번호 입력 전이면 모달만 표시
  if (!isUnlocked && showPasswordModal) {
    return (
      <div className="parent-account-page">
        {/* 배경 구름 */}
        <div className="parent-account-page__bg-decorations">
          <div className="parent-account-page__cloud parent-account-page__cloud--1"></div>
          <div className="parent-account-page__cloud parent-account-page__cloud--2"></div>
          <div className="parent-account-page__cloud parent-account-page__cloud--3"></div>
        </div>

        <div className="password-modal-overlay">
          <div className="password-modal">
            <button
              className="password-modal__close"
              onClick={onGoBack}
            >
              <X size={24} />
            </button>

            <div className="password-modal__icon">
              <Lock size={32} color="#4CAF50" />
            </div>

            <h2 className="password-modal__title">보호자 인증</h2>
            <p className="password-modal__desc">
              보호자 계정에 접근하려면<br />비밀번호를 입력해주세요
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="비밀번호 입력"
              className="password-modal__input"
              autoFocus
            />

            {error && <p className="password-modal__error">{error}</p>}

            <button
              className="password-modal__submit"
              onClick={handlePasswordSubmit}
            >
              확인
            </button>
          </div>
        </div>

        {/* 하단 풍경 장식 */}
        <div className="parent-account-page__landscape">
          <div className="parent-account-page__grass"></div>
          <div className="parent-account-page__tree parent-account-page__tree--1"></div>
          <div className="parent-account-page__tree parent-account-page__tree--2"></div>
          <div className="parent-account-page__bush parent-account-page__bush--1"></div>
          <div className="parent-account-page__bush parent-account-page__bush--2"></div>
          <div className="parent-account-page__bush parent-account-page__bush--3"></div>
          <div className="parent-account-page__flower parent-account-page__flower--1"></div>
          <div className="parent-account-page__flower parent-account-page__flower--2"></div>
          <div className="parent-account-page__flower parent-account-page__flower--3"></div>
        </div>
      </div>
    )
  }

  // 사용량 계산 (예시)
  const usageCount = 7
  const maxUsage = userInfo.subscription_tier === 'PREMIUM' ? 10 : 1
  const usagePercent = (usageCount / maxUsage) * 100

  return (
    <div className="parent-account-page">
      {/* 배경 구름 */}
      <div className="parent-account-page__bg-decorations">
        <div className="parent-account-page__cloud parent-account-page__cloud--1"></div>
        <div className="parent-account-page__cloud parent-account-page__cloud--2"></div>
        <div className="parent-account-page__cloud parent-account-page__cloud--3"></div>
      </div>

      {/* 헤더 */}
      <header className="parent-account-page__header">
        <button onClick={onGoBack} className="parent-account-page__back-btn">
          <ArrowLeft size={24} />
        </button>
        <h1 className="parent-account-page__header-title">보호자 계정</h1>
        <div style={{ width: 48 }} />
      </header>

      <main className="parent-account-page__content">
        {/* 2열 그리드 레이아웃 */}
        <div className="parent-account-page__grid">
          {/* 왼쪽 컬럼 - 프로필 & 관리 메뉴 */}
          <div className="parent-account-page__grid-left">
            {/* 프로필 카드 */}
            <div className="parent-account-page__profile-card">
              <div className="parent-account-page__profile-header">
                <div className="parent-account-page__avatar">
                  👨‍👩‍👧
                </div>
                <div className="parent-account-page__profile-info">
                  <h2 className="parent-account-page__name">{userInfo.name}</h2>
                  <p className="parent-account-page__email">{userInfo.email}</p>
                </div>
              </div>
              <div className="parent-account-page__profile-footer">
                <span className="parent-account-page__badge">
                  {userInfo.user_type === 'teacher' ? '👩‍🏫 교사 계정' : '👨‍👩‍👧 보호자 계정'}
                </span>
                <span className="parent-account-page__kids-count">
                  자녀 {kidsCount}명
                </span>
              </div>
            </div>

            {/* 자녀 관리 */}
            <div className="parent-account-page__section">
              <h3 className="parent-account-page__section-title">
                <span className="parent-account-page__section-icon parent-account-page__section-icon--green">
                  <Users size={18} />
                </span>
                자녀 프로필 관리
              </h3>
              <p className="parent-account-page__section-desc">
                자녀 프로필을 추가하거나 관리할 수 있어요
              </p>
              <button
                onClick={() => onNavigate('profile-manage')}
                className="parent-account-page__menu-item"
              >
                <div className="parent-account-page__menu-icon parent-account-page__menu-icon--green">
                  <UserCog size={20} />
                </div>
                <div className="parent-account-page__menu-content">
                  <span className="parent-account-page__menu-label">프로필 관리</span>
                  <span className="parent-account-page__menu-sub">등록된 자녀 {kidsCount}명</span>
                </div>
                <ChevronRight size={20} color="#C4B8A8" />
              </button>
            </div>

            {/* 계정 설정 */}
            <div className="parent-account-page__section">
              <h3 className="parent-account-page__section-title">
                <span className="parent-account-page__section-icon parent-account-page__section-icon--orange">
                  <Shield size={18} />
                </span>
                계정 설정
              </h3>
              <button
                onClick={() => onNavigate('password-change')}
                className="parent-account-page__menu-item"
              >
                <div className="parent-account-page__menu-icon parent-account-page__menu-icon--orange">
                  <Lock size={20} />
                </div>
                <div className="parent-account-page__menu-content">
                  <span className="parent-account-page__menu-label">비밀번호 변경</span>
                  <span className="parent-account-page__menu-sub">계정 보안 관리</span>
                </div>
                <ChevronRight size={20} color="#C4B8A8" />
              </button>
              <button
                onClick={() => onNavigate('notification-settings')}
                className="parent-account-page__menu-item"
              >
                <div className="parent-account-page__menu-icon parent-account-page__menu-icon--yellow">
                  <Bell size={20} />
                </div>
                <div className="parent-account-page__menu-content">
                  <span className="parent-account-page__menu-label">알림 설정</span>
                  <span className="parent-account-page__menu-sub">푸시 알림 관리</span>
                </div>
                <ChevronRight size={20} color="#C4B8A8" />
              </button>
            </div>

            {/* 회원 탈퇴 */}
            <button className="parent-account-page__danger-btn">
              <Trash2 size={18} />
              회원 탈퇴
            </button>
          </div>

          {/* 오른쪽 컬럼 - 구독 정보 */}
          <div className="parent-account-page__grid-right">
            <div className="parent-account-page__subscription-section">
              {/* 구독 상태 헤더 */}
              <div className="parent-account-page__subscription-header">
                <div className="parent-account-page__subscription-badge-wrap">
                  {userInfo.subscription_tier === 'PREMIUM' ? (
                    <span className="parent-account-page__subscription-badge parent-account-page__subscription-badge--premium">
                      <Crown size={16} />
                      프리미엄
                    </span>
                  ) : (
                    <span className="parent-account-page__subscription-badge parent-account-page__subscription-badge--basic">
                      베이직
                    </span>
                  )}
                </div>
                <h3 className="parent-account-page__subscription-title">
                  {userInfo.subscription_tier === 'PREMIUM' ? '프리미엄 플랜' : '베이직 플랜'}
                </h3>
                <p className="parent-account-page__subscription-price">
                  {userInfo.subscription_tier === 'PREMIUM' ? (
                    <>월 <strong>19,800</strong>원</>
                  ) : (
                    <strong>무료</strong>
                  )}
                </p>
              </div>

              {/* 사용량 */}
              <div className="parent-account-page__usage-card">
                <div className="parent-account-page__usage-header">
                  <span className="parent-account-page__usage-title">
                    <Zap size={16} color="#F5A623" />
                    이번 달 사용량
                  </span>
                  <span className="parent-account-page__usage-count">
                    {usageCount}/{maxUsage}회
                  </span>
                </div>
                <div className="parent-account-page__usage-bar">
                  <div
                    className="parent-account-page__usage-fill"
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  ></div>
                </div>
                <p className="parent-account-page__usage-remaining">
                  {maxUsage - usageCount > 0
                    ? `${maxUsage - usageCount}회 남음`
                    : '이번 달 사용량을 모두 사용했어요'}
                </p>
              </div>

              {/* 플랜 혜택 */}
              <div className="parent-account-page__benefits">
                <h4 className="parent-account-page__benefits-title">플랜 혜택</h4>
                <ul className="parent-account-page__benefits-list">
                  {userInfo.subscription_tier === 'PREMIUM' ? (
                    <>
                      <li className="parent-account-page__benefit-item">
                        <Check size={16} color="#4CAF50" />
                        월 10회 동화 생성
                      </li>
                      <li className="parent-account-page__benefit-item">
                        <Check size={16} color="#4CAF50" />
                        모든 그림체 사용 가능
                      </li>
                      <li className="parent-account-page__benefit-item">
                        <Check size={16} color="#4CAF50" />
                        1080p HD 화질
                      </li>
                      <li className="parent-account-page__benefit-item">
                        <Check size={16} color="#4CAF50" />
                        피드백 리포트 제공
                      </li>
                      <li className="parent-account-page__benefit-item">
                        <Check size={16} color="#4CAF50" />
                        광고 없는 시청
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="parent-account-page__benefit-item">
                        <Check size={16} color="#4CAF50" />
                        1회 무료 생성 {userInfo.free_trial_used ? '(사용 완료)' : '(사용 가능)'}
                      </li>
                      <li className="parent-account-page__benefit-item">
                        <Check size={16} color="#4CAF50" />
                        기본 그림체 3종
                      </li>
                      <li className="parent-account-page__benefit-item">
                        <Check size={16} color="#4CAF50" />
                        720p 화질
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* 결제일 정보 */}
              {userInfo.subscription_tier === 'PREMIUM' && userInfo.subscription_end_at && (
                <div className="parent-account-page__renewal-info">
                  <span>다음 결제일</span>
                  <strong>{formatDate(userInfo.subscription_end_at)}</strong>
                </div>
              )}

              {/* 구독 관리 버튼들 */}
              <div className="parent-account-page__subscription-actions">
                <button
                  onClick={() => onNavigate('subscription-plan')}
                  className="parent-account-page__action-btn parent-account-page__action-btn--primary"
                >
                  <Crown size={18} />
                  {userInfo.subscription_tier === 'PREMIUM' ? '플랜 변경' : '프리미엄 업그레이드'}
                </button>

                <button
                  onClick={() => onNavigate('payment-method')}
                  className="parent-account-page__action-btn parent-account-page__action-btn--secondary"
                >
                  <CreditCard size={18} />
                  결제수단 관리
                </button>

                <button
                  onClick={() => onNavigate('payment-history')}
                  className="parent-account-page__action-btn parent-account-page__action-btn--secondary"
                >
                  <Receipt size={18} />
                  결제 내역
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 하단 풍경 장식 */}
      <div className="parent-account-page__landscape">
        <div className="parent-account-page__grass"></div>
        <div className="parent-account-page__tree parent-account-page__tree--1"></div>
        <div className="parent-account-page__tree parent-account-page__tree--2"></div>
        <div className="parent-account-page__bush parent-account-page__bush--1"></div>
        <div className="parent-account-page__bush parent-account-page__bush--2"></div>
        <div className="parent-account-page__bush parent-account-page__bush--3"></div>
        <div className="parent-account-page__flower parent-account-page__flower--1"></div>
        <div className="parent-account-page__flower parent-account-page__flower--2"></div>
        <div className="parent-account-page__flower parent-account-page__flower--3"></div>
      </div>
    </div>
  )
}