import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { PageType } from '../../App'
import '../../styles/pages/LoginPage.css'

interface LoginPageProps {
  onNavigate: (page: PageType) => void
  onLogin: (email: string, parentName: string) => void
  onGoBack: () => void
}

export default function LoginPage({ onNavigate, onLogin, onGoBack }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    let isValid = true
    const newErrors = { email: '', password: '' }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
      isValid = false
    } else if (!emailRegex.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
      isValid = false
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    // API 호출 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)
      onLogin(email, '김교원')
    }, 1000)
  }

  return (
    <div className="login-page">
      {/* 배경 구름 장식 */}
      <div className="login-page__bg-decorations">
        <div className="login-page__cloud login-page__cloud--1"></div>
        <div className="login-page__cloud login-page__cloud--2"></div>
        <div className="login-page__cloud login-page__cloud--3"></div>
        <div className="login-page__cloud login-page__cloud--4"></div>
      </div>

      <div className="login-page__container">
        {/* 헤더 */}
        <header className="login-page__header">
          <button onClick={onGoBack} className="login-page__back-btn">
            <ArrowLeft size={24} color="#5D4E37" />
          </button>
          <div className="login-page__logo">
            <img
              src="/src/assets/images/logo.png"
              alt="아이토리"
              className="login-page__logo-img"
            />
          </div>
          <button
            onClick={() => onNavigate('signup')}
            className="login-page__signup-link"
          >
            회원가입
          </button>
        </header>

        {/* 환영 메시지 */}
        <div className="login-page__welcome">
          <h1 className="login-page__title">다시 만나서 반가워요!</h1>
          <p className="login-page__subtitle">로그인하고 동화 만들기를 계속해보세요</p>
        </div>

        {/* 로그인 폼 */}
        <div className="login-page__form-card">
          <form onSubmit={handleSubmit}>
            <div className="login-page__field">
              <label className="login-page__label">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className={`login-page__input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <p className="login-page__error">{errors.email}</p>}
            </div>

            <div className="login-page__field">
              <label className="login-page__label">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className={`login-page__input ${errors.password ? 'error' : ''}`}
              />
              {errors.password && <p className="login-page__error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-page__submit-btn"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>

            <div className="login-page__links">
              <button type="button" className="login-page__link">
                비밀번호 찾기
              </button>
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="login-page__link login-page__link--bold"
              >
                회원가입하기
              </button>
            </div>
          </form>

          {/* 소셜 로그인 */}
          <div className="login-page__social">
            <div className="login-page__social-divider">
              <span>또는</span>
            </div>
            <div className="login-page__social-btns">
              <button className="login-page__social-btn login-page__social-btn--google">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </button>
              <button className="login-page__social-btn login-page__social-btn--kakao">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#000" d="M12 3c-5.52 0-10 3.58-10 8 0 2.85 1.85 5.36 4.64 6.78-.15.53-.96 3.4-.99 3.64 0 0-.02.13.07.18.09.05.19.01.19.01.25-.04 2.88-1.9 3.34-2.22.9.13 1.83.2 2.75.2 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                </svg>
                <span>Kakao</span>
              </button>
              <button className="login-page__social-btn login-page__social-btn--naver">
                <span className="login-page__naver-icon">N</span>
                <span>Naver</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}