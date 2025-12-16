import { useState } from 'react'
import { ChevronLeft, Eye, EyeOff, Lock, Shield } from 'lucide-react'
import { PageType } from '../../App'
import '../../styles/pages/PasswordChangePage.css'

interface PasswordChangePageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  onMenuClick: () => void
}

export default function PasswordChangePage({ onNavigate: _onNavigate, onGoBack, onMenuClick: _onMenuClick }: PasswordChangePageProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const validateForm = () => {
    const newErrors = { current: '', new: '', confirm: '' }
    let isValid = true

    if (!currentPassword) {
      newErrors.current = '현재 비밀번호를 입력해주세요'
      isValid = false
    }

    if (!newPassword) {
      newErrors.new = '새 비밀번호를 입력해주세요'
      isValid = false
    } else if (newPassword.length < 8) {
      newErrors.new = '비밀번호는 8자 이상이어야 합니다'
      isValid = false
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = '비밀번호가 일치하지 않습니다'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    alert('비밀번호가 변경되었습니다')
    onGoBack()
  }

  // 비밀번호 강도 체크
  const getPasswordStrength = () => {
    if (!newPassword) return { level: 0, text: '', color: '' }
    if (newPassword.length < 6) return { level: 1, text: '약함', color: '#E53935' }
    if (newPassword.length < 8) return { level: 2, text: '보통', color: '#FFB300' }
    if (newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) {
      return { level: 4, text: '강함', color: '#4CAF50' }
    }
    return { level: 3, text: '양호', color: '#66BB6A' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="password-change-page">
      {/* 배경 구름 */}
      <div className="password-change-page__bg-decorations">
        <div className="password-change-page__cloud password-change-page__cloud--1"></div>
        <div className="password-change-page__cloud password-change-page__cloud--2"></div>
        <div className="password-change-page__cloud password-change-page__cloud--3"></div>
        <div className="password-change-page__cloud password-change-page__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="password-change-page__header">
        <div className="password-change-page__header-left">
          <button onClick={onGoBack} className="password-change-page__back-btn">
            <ChevronLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="password-change-page__logo-img"
          />
        </div>
        <div style={{ width: 48 }} />
      </header>

      <main className="password-change-page__main">
        {/* 인트로 */}
        <div className="password-change-page__intro">
          <div className="password-change-page__intro-icon">
            <Lock size={32} />
          </div>
          <h2 className="password-change-page__intro-title">비밀번호 변경</h2>
          <p className="password-change-page__intro-desc">안전한 비밀번호로 계정을 보호하세요</p>
        </div>

        {/* 폼 */}
        <div className="password-change-page__content">
          <form onSubmit={handleSubmit} className="password-change-page__form">
            {/* 현재 비밀번호 */}
            <div className="password-change-page__field">
              <label className="password-change-page__label">
                현재 비밀번호 <span className="required">*</span>
              </label>
              <div className="password-change-page__input-wrapper">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호를 입력하세요"
                  className={`password-change-page__input ${errors.current ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="password-change-page__toggle-btn"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.current && <p className="password-change-page__error">{errors.current}</p>}
            </div>

            {/* 새 비밀번호 */}
            <div className="password-change-page__field">
              <label className="password-change-page__label">
                새 비밀번호 <span className="required">*</span>
              </label>
              <div className="password-change-page__input-wrapper">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                  className={`password-change-page__input ${errors.new ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="password-change-page__toggle-btn"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.new && <p className="password-change-page__error">{errors.new}</p>}

              {/* 비밀번호 강도 표시 */}
              {newPassword && (
                <div className="password-change-page__strength">
                  <div className="password-change-page__strength-bars">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`password-change-page__strength-bar ${passwordStrength.level >= level ? 'active' : ''}`}
                        style={{ backgroundColor: passwordStrength.level >= level ? passwordStrength.color : undefined }}
                      />
                    ))}
                  </div>
                  <span
                    className="password-change-page__strength-text"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            {/* 새 비밀번호 확인 */}
            <div className="password-change-page__field">
              <label className="password-change-page__label">
                새 비밀번호 확인 <span className="required">*</span>
              </label>
              <div className="password-change-page__input-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  className={`password-change-page__input ${errors.confirm ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="password-change-page__toggle-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirm && <p className="password-change-page__error">{errors.confirm}</p>}
              {confirmPassword && newPassword === confirmPassword && !errors.confirm && (
                <p className="password-change-page__match">✓ 비밀번호가 일치합니다</p>
              )}
            </div>

            {/* 보안 팁 */}
            <div className="password-change-page__tips">
              <div className="password-change-page__tips-header">
                <Shield size={18} />
                <span>안전한 비밀번호 팁</span>
              </div>
              <ul className="password-change-page__tips-list">
                <li>8자 이상으로 설정해주세요</li>
                <li>대문자, 소문자, 숫자를 섞어주세요</li>
                <li>개인정보와 관련없는 비밀번호를 사용해주세요</li>
              </ul>
            </div>

            {/* 버튼 */}
            <div className="password-change-page__actions">
              <button type="button" onClick={onGoBack} className="password-change-page__cancel-btn">
                취소
              </button>
              <button type="submit" className="password-change-page__submit-btn">
                비밀번호 변경 🔐
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="password-change-page__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}