import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { PageType, Kid } from '../../App'
import '../../styles/pages/ProfileAddPage.css'

interface ProfileAddPageProps {
  onNavigate: (page: PageType) => void
  onAddKid: (kid: Omit<Kid, 'id'>) => void
  onGoBack: () => void
}

// 아바타 이미지 옵션 (실제 이미지 경로로 수정하세요)
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

const interestOptions = [
  { id: 'dinosaur', label: '공룡', emoji: '🦕' },
  { id: 'space', label: '우주', emoji: '🚀' },
  { id: 'animals', label: '동물', emoji: '🐾' },
  { id: 'princess', label: '공주', emoji: '👑' },
  { id: 'robot', label: '로봇', emoji: '🤖' },
  { id: 'adventure', label: '모험', emoji: '⚔️' },
  { id: 'magic', label: '마법', emoji: '✨' },
  { id: 'music', label: '음악', emoji: '🎵' },
  { id: 'sports', label: '운동', emoji: '⚽' },
  { id: 'art', label: '미술', emoji: '🎨' }
]

// 나이로부터 생년월일 계산 (간략화)
function birthDateFromAge(age: number): string {
  const today = new Date()
  const birthYear = today.getFullYear() - age
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${birthYear}-${month}-${day}`
}

export default function ProfileAddPage({ onNavigate, onAddKid, onGoBack }: ProfileAddPageProps) {
  const [formData, setFormData] = useState({
    kid_name: '',
    kid_birth_date: birthDateFromAge(7),
    selectedAge: 7,
    gender: '',
    avatar_url: avatarOptions[0].src,
    interest_tags: [] as string[]
  })

  const [errors, setErrors] = useState({
    kid_name: '',
    gender: ''
  })

  // 아바타 선택
  const handleAvatarSelect = (avatarSrc: string) => {
    setFormData(prev => ({
      ...prev,
      avatar_url: avatarSrc
    }))
  }

  const toggleInterest = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interest_tags: prev.interest_tags.includes(interestId)
        ? prev.interest_tags.filter(i => i !== interestId)
        : [...prev.interest_tags, interestId]
    }))
  }

  const handleAgeSelect = (age: number) => {
    setFormData(prev => ({
      ...prev,
      selectedAge: age,
      kid_birth_date: birthDateFromAge(age)
    }))
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { kid_name: '', gender: '' }

    if (!formData.kid_name.trim()) {
      newErrors.kid_name = '이름을 입력해주세요'
      isValid = false
    }

    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    onAddKid({
      kid_name: formData.kid_name,
      kid_birth_date: formData.kid_birth_date,
      gender: formData.gender,
      avatar_url: formData.avatar_url,
      interest_tags: formData.interest_tags
    })

    // 홈으로 이동
    onNavigate('home')
  }

  return (
    <div className="profile-add-page">
      {/* 배경 구름 */}
      <div className="profile-add-page__bg-decorations">
        <div className="profile-add-page__cloud profile-add-page__cloud--1"></div>
        <div className="profile-add-page__cloud profile-add-page__cloud--2"></div>
        <div className="profile-add-page__cloud profile-add-page__cloud--3"></div>
        <div className="profile-add-page__cloud profile-add-page__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="profile-add-page__header">
        <div className="profile-add-page__header-left">
          <button onClick={onGoBack} className="profile-add-page__back-btn">
            <ChevronLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="profile-add-page__logo-img"
          />
        </div>
        <h1 className="profile-add-page__header-title">아이 프로필 추가</h1>
        <div style={{ width: 120 }} />
      </header>

      <main className="profile-add-page__main">
        <div className="profile-add-page__content">
          {/* 왼쪽: 프로필 아바타 */}
          <div className="profile-add-page__left">
            <div className="profile-add-page__photo-section">
              <h2 className="profile-add-page__section-title">
                프로필 아바타
              </h2>

              {/* 현재 선택된 프로필 미리보기 */}
              <div className="profile-add-page__photo-preview">
                <img
                  src={formData.avatar_url}
                  alt="선택된 아바타"
                  className="profile-add-page__preview-image"
                />
              </div>

              <p className="profile-add-page__avatar-hint">
                마음에 드는 아바타를 선택해주세요!
              </p>

              {/* 아바타 이미지 그리드 */}
              <div className="profile-add-page__avatar-grid">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar.src)}
                    className={`profile-add-page__avatar-btn ${formData.avatar_url === avatar.src ? 'selected' : ''
                      }`}
                  >
                    <img src={avatar.src} alt={avatar.alt} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 기본 정보 */}
          <div className="profile-add-page__right">
            {/* 이름 */}
            <div className="profile-add-page__field">
              <label className="profile-add-page__label">
                이름 <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.kid_name}
                onChange={(e) => setFormData({ ...formData, kid_name: e.target.value })}
                placeholder="아이 이름을 입력하세요"
                className={`profile-add-page__input ${errors.kid_name ? 'error' : ''}`}
              />
              {errors.kid_name && <p className="profile-add-page__error">{errors.kid_name}</p>}
            </div>

            {/* 성별 */}
            <div className="profile-add-page__field">
              <label className="profile-add-page__label">
                성별 <span className="required">*</span>
              </label>
              <div className="profile-add-page__gender-selector">
                <button
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`profile-add-page__gender-btn ${formData.gender === 'male' ? 'selected' : ''}`}
                >
                  <span className="profile-add-page__gender-emoji">👦</span>
                  <span>남자아이</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`profile-add-page__gender-btn ${formData.gender === 'female' ? 'selected' : ''}`}
                >
                  <span className="profile-add-page__gender-emoji">👧</span>
                  <span>여자아이</span>
                </button>
              </div>
              {errors.gender && <p className="profile-add-page__error">{errors.gender}</p>}
            </div>

            {/* 나이 */}
            <div className="profile-add-page__field">
              <label className="profile-add-page__label">나이</label>
              <div className="profile-add-page__age-grid">
                {[5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                  <button
                    key={age}
                    onClick={() => handleAgeSelect(age)}
                    className={`profile-add-page__age-btn ${formData.selectedAge === age ? 'selected' : ''}`}
                  >
                    {age}세
                  </button>
                ))}
              </div>
            </div>

            {/* 관심사 */}
            <div className="profile-add-page__field">
              <label className="profile-add-page__label">
                관심사
                <span className="optional">(선택 - 동화 추천에 활용)</span>
              </label>
              <div className="profile-add-page__interest-grid">
                {interestOptions.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`profile-add-page__interest-btn ${formData.interest_tags.includes(interest.id) ? 'selected' : ''
                      }`}
                  >
                    <span className="profile-add-page__interest-emoji">{interest.emoji}</span>
                    <span>{interest.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="profile-add-page__actions">
          <button onClick={onGoBack} className="profile-add-page__cancel-btn">
            취소
          </button>
          <button onClick={handleSubmit} className="profile-add-page__submit-btn">
            프로필 추가하기 ✨
          </button>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="profile-add-page__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}