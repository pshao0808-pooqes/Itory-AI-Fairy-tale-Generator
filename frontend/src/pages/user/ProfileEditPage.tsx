import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { PageType, Kid, calculateAge } from '../../App'
import '../../styles/pages/ProfileEditPage.css'

interface ProfileEditPageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  onMenuClick: () => void
  currentKid: Kid | null
  onUpdateKid: (kid: { kid_name: string; kid_birth_date: string; avatar_url: string; gender?: string; interest_tags?: string[] }) => void
}

// 아바타가 이미지 경로인지 확인
const isImageUrl = (avatar: string | undefined): boolean => {
  if (!avatar) return false
  return avatar.startsWith('/') || avatar.startsWith('http')
}

// 아바타 이미지 옵션 (ProfileAddPage와 동일)
const avatarOptions = [
  { id: 'avatar1', src: '/src/assets/images/avatars/avatar1.png', alt: '아바타 1' },
  { id: 'avatar2', src: '/src/assets/images/avatars/avatar2.png', alt: '아바타 2' },
  { id: 'avatar3', src: '/src/assets/images/avatars/avatar3.png', alt: '아바타 3' },
  { id: 'avatar4', src: '/src/assets/images/avatars/avatar4.png', alt: '아바타 4' },
  { id: 'avatar5', src: '/src/assets/images/avatars/avatar5.png', alt: '아바타 5' },
  { id: 'avatar6', src: '/src/assets/images/avatars/avatar6.png', alt: '아바타 6' },
  { id: 'avatar7', src: '/src/assets/images/avatars/avatar7.png', alt: '아바타 7' },
  { id: 'avatar8', src: '/src/assets/images/avatars/avatar8.png', alt: '아바타 8' },
  { id: 'avatar9', src: '/src/assets/images/avatars/avatar9.png', alt: '아바타 9' },
  { id: 'avatar10', src: '/src/assets/images/avatars/avatar10.png', alt: '아바타 10' },
  { id: 'avatar11', src: '/src/assets/images/avatars/avatar11.png', alt: '아바타 11' },
  { id: 'avatar12', src: '/src/assets/images/avatars/avatar12.png', alt: '아바타 12' },
]

// 현재 아바타가 이미지면 그대로, 이모지면 기본 이미지로
const getInitialAvatar = (avatar: string | undefined): string => {
  if (isImageUrl(avatar)) return avatar!
  return avatarOptions[0].src
}

// 나이로부터 생년월일 계산 (간략화)
function birthDateFromAge(age: number): string {
  const today = new Date()
  const birthYear = today.getFullYear() - age
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${birthYear}-${month}-${day}`
}

export default function ProfileEditPage({
  onNavigate: _onNavigate,
  onGoBack,
  onMenuClick: _onMenuClick,
  currentKid,
  onUpdateKid
}: ProfileEditPageProps) {
  // 현재 아이의 나이 계산
  const currentAge = currentKid ? calculateAge(currentKid.kid_birth_date) : 7

  const [selectedAvatar, setSelectedAvatar] = useState(getInitialAvatar(currentKid?.avatar_url))
  const [name, setName] = useState(currentKid?.kid_name || '')
  const [selectedAge, setSelectedAge] = useState(currentAge)
  const [nameError, setNameError] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('이름을 입력해주세요')
      return
    }

    onUpdateKid({
      kid_name: name.trim(),
      kid_birth_date: birthDateFromAge(selectedAge),
      avatar_url: selectedAvatar
    })

    onGoBack()
  }

  return (
    <div className="profile-edit-page">
      {/* 배경 구름 */}
      <div className="profile-edit-page__bg-decorations">
        <div className="profile-edit-page__cloud profile-edit-page__cloud--1"></div>
        <div className="profile-edit-page__cloud profile-edit-page__cloud--2"></div>
        <div className="profile-edit-page__cloud profile-edit-page__cloud--3"></div>
        <div className="profile-edit-page__cloud profile-edit-page__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="profile-edit-page__header">
        <div className="profile-edit-page__header-left">
          <button onClick={onGoBack} className="profile-edit-page__back-btn">
            <ChevronLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="profile-edit-page__logo-img"
          />
        </div>
        <h1 className="profile-edit-page__header-title">프로필 수정</h1>
        <div style={{ width: 120 }} />
      </header>

      <main className="profile-edit-page__main">
        <div className="profile-edit-page__content">
          {/* 왼쪽: 프로필 아바타 */}
          <div className="profile-edit-page__left">
            <div className="profile-edit-page__photo-section">
              <h2 className="profile-edit-page__section-title">
                프로필 아바타
              </h2>

              {/* 현재 선택된 프로필 미리보기 */}
              <div className="profile-edit-page__photo-preview">
                <img
                  src={selectedAvatar}
                  alt="선택된 아바타"
                  className="profile-edit-page__preview-image"
                />
              </div>

              <p className="profile-edit-page__avatar-hint">
                새로운 아바타를 선택해보세요!
              </p>

              {/* 아바타 이미지 그리드 */}
              <div className="profile-edit-page__avatar-grid">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.src)}
                    className={`profile-edit-page__avatar-btn ${selectedAvatar === avatar.src ? 'selected' : ''
                      }`}
                  >
                    <img src={avatar.src} alt={avatar.alt} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 기본 정보 */}
          <div className="profile-edit-page__right">
            <div className="profile-edit-page__info-section">
              <h2 className="profile-edit-page__section-title">
                기본 정보
              </h2>

              {/* 이름 입력 */}
              <div className="profile-edit-page__field">
                <label className="profile-edit-page__label">
                  이름 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameError('')
                  }}
                  placeholder="이름을 입력하세요"
                  className={`profile-edit-page__input ${nameError ? 'error' : ''}`}
                />
                {nameError && <p className="profile-edit-page__error">{nameError}</p>}
              </div>

              {/* 나이 선택 */}
              <div className="profile-edit-page__field">
                <label className="profile-edit-page__label">나이</label>
                <div className="profile-edit-page__age-grid">
                  {[5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setSelectedAge(age)}
                      className={`profile-edit-page__age-btn ${selectedAge === age ? 'selected' : ''}`}
                    >
                      {age}세
                    </button>
                  ))}
                </div>
              </div>

              {/* 현재 프로필 정보 */}
              {currentKid && (
                <div className="profile-edit-page__current-info">
                  <div className="profile-edit-page__info-badge">
                    현재 프로필
                  </div>
                  <div className="profile-edit-page__info-details">
                    <span>👤 {currentKid.kid_name}</span>
                    <span>🎂 {currentAge}세</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="profile-edit-page__actions">
          <button onClick={onGoBack} className="profile-edit-page__cancel-btn">
            취소
          </button>
          <button onClick={handleSubmit} className="profile-edit-page__submit-btn">
            변경사항 저장하기 ✨
          </button>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="profile-edit-page__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}