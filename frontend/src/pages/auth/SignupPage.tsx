import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { PageType } from '../../App'
import '../../styles/pages/SignupPage.css'

interface SignupPageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
}

export default function SignupPage({ onNavigate, onGoBack }: SignupPageProps) {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    password: '',
    passwordConfirm: ''
  })

  const [errors, setErrors] = useState({
    parentName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    terms: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      parentName: '',
      email: '',
      password: '',
      passwordConfirm: '',
      terms: ''
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = '이름을 입력해주세요'
      isValid = false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
      isValid = false
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다'
      isValid = false
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'
      isValid = false
    }

    if (!termsAgreed) {
      newErrors.terms = '이용약관에 동의해주세요'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onNavigate('login')
    }, 1000)
  }

  return (
    <div className="signup-page">
      {/* 배경 구름 장식 */}
      <div className="signup-page__bg-decorations">
        <div className="signup-page__cloud signup-page__cloud--1"></div>
        <div className="signup-page__cloud signup-page__cloud--2"></div>
        <div className="signup-page__cloud signup-page__cloud--3"></div>
        <div className="signup-page__cloud signup-page__cloud--4"></div>
      </div>

      <div className="signup-page__container">
        {/* 헤더 */}
        <header className="signup-page__header">
          <button onClick={onGoBack} className="signup-page__back-btn">
            <ArrowLeft size={24} color="#5D4E37" />
          </button>
          <div className="signup-page__logo">
            <img
              src="/src/assets/images/logo.png"
              alt="아이토리"
              className="signup-page__logo-img"
            />
          </div>
          <button
            onClick={() => onNavigate('login')}
            className="signup-page__login-link"
          >
            로그인
          </button>
        </header>

        {/* 폼 카드 */}
        <div className="signup-page__form-card">
          <h2 className="signup-page__title">아이토리 시작하기</h2>
          <p className="signup-page__subtitle">무료로 첫 동화를 만들어보세요</p>

          <form onSubmit={handleSubmit}>
            <div className="signup-page__field">
              <label>이름</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="홍길동"
                className={errors.parentName ? 'error' : ''}
              />
              {errors.parentName && <p className="signup-page__error">{errors.parentName}</p>}
            </div>

            <div className="signup-page__field">
              <label>이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <p className="signup-page__error">{errors.email}</p>}
            </div>

            <div className="signup-page__field">
              <label>비밀번호</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="8자 이상"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <p className="signup-page__error">{errors.password}</p>}
            </div>

            <div className="signup-page__field">
              <label>비밀번호 확인</label>
              <input
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                placeholder="비밀번호 재입력"
                className={errors.passwordConfirm ? 'error' : ''}
              />
              {errors.passwordConfirm && <p className="signup-page__error">{errors.passwordConfirm}</p>}
            </div>

            {/* 약관 동의 */}
            <div className="signup-page__terms">
              <label className="signup-page__checkbox">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                />
                <span className="signup-page__checkmark"></span>
                <span className="signup-page__checkbox-text">이용약관 및 개인정보 처리방침에 동의합니다 (필수)</span>
              </label>
              {errors.terms && <p className="signup-page__error">{errors.terms}</p>}

              <label className="signup-page__checkbox">
                <input type="checkbox" />
                <span className="signup-page__checkmark"></span>
                <span className="signup-page__checkbox-text">마케팅 정보 수신에 동의합니다 (선택)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="signup-page__submit-btn"
            >
              {isLoading ? '가입 처리중...' : '가입하기'}
            </button>
          </form>

          {/* 소셜 가입 */}
          <div className="signup-page__social">
            <div className="signup-page__social-divider">
              <span>또는</span>
            </div>
            <div className="signup-page__social-btns">
              <button className="signup-page__social-btn signup-page__social-btn--google">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </button>
              <button className="signup-page__social-btn signup-page__social-btn--kakao">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#000" d="M12 3c-5.52 0-10 3.58-10 8 0 2.85 1.85 5.36 4.64 6.78-.15.53-.96 3.4-.99 3.64 0 0-.02.13.07.18.09.05.19.01.19.01.25-.04 2.88-1.9 3.34-2.22.9.13 1.83.2 2.75.2 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                </svg>
                <span>Kakao</span>
              </button>
              <button className="signup-page__social-btn signup-page__social-btn--naver">
                <span className="signup-page__naver-icon">N</span>
                <span>Naver</span>
              </button>
            </div>
          </div>

          <div className="signup-page__footer">
            <p>
              이미 계정이 있으신가요?{' '}
              <button onClick={() => onNavigate('login')}>로그인하기</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}