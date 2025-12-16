import { Plus, LogOut, Settings } from 'lucide-react'
import { PageType, Kid, calculateAge } from '../../App'
import '../../styles/pages/ProfileSelectPage.css'

interface ProfileSelectPageProps {
  onNavigate: (page: PageType) => void
  kids: Kid[]
  onSelectKid: (kid: Kid) => void
  onLogout: () => void
}

// 아바타 배경색 배열 (파스텔톤)
const avatarColors = [
  '#FFE4B5', // 살구
  '#B8E0D2', // 민트
  '#FFD4E5', // 핑크
  '#D4E5FF', // 하늘
  '#E5D4FF', // 라벤더
  '#D4FFE5', // 연두
]

export default function ProfileSelectPage({
  onNavigate,
  kids,
  onSelectKid,
  onLogout
}: ProfileSelectPageProps) {
  return (
    <div className="profile-select-page">
      {/* 배경 구름 장식 */}
      <div className="profile-select-page__bg-decorations">
        <div className="profile-select-page__cloud profile-select-page__cloud--1"></div>
        <div className="profile-select-page__cloud profile-select-page__cloud--2"></div>
        <div className="profile-select-page__cloud profile-select-page__cloud--3"></div>
        <div className="profile-select-page__cloud profile-select-page__cloud--4"></div>
      </div>

      {/* 상단 헤더 */}
      <header className="profile-select-page__header">
        {/* 로고 */}
        <div className="profile-select-page__logo">
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="profile-select-page__logo-img"
          />
        </div>

        {/* 상단 버튼들 */}
        <div className="profile-select-page__top-buttons">
          <button
            onClick={() => onNavigate('parent-account')}
            className="profile-select-page__parent-btn"
          >
            <Settings size={18} />
            <span>보호자</span>
          </button>

          <button onClick={onLogout} className="profile-select-page__logout">
            <LogOut size={18} />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="profile-select-page__content">
        <h1 className="profile-select-page__title">
          누가 동화를 만들까요?
        </h1>
        <p className="profile-select-page__subtitle">
          프로필을 선택해주세요
        </p>

        {/* 프로필 그리드 */}
        <div className="profile-select-page__grid">
          {kids.map((kid, index) => (
            <button
              key={kid.id}
              onClick={() => onSelectKid(kid)}
              className="profile-select-page__profile"
            >
              <div
                className="profile-select-page__avatar"
                style={{ backgroundColor: avatarColors[index % avatarColors.length] }}
              >
                {kid.avatar_url}
              </div>
              <div className="profile-select-page__info">
                <p className="profile-select-page__name">{kid.kid_name}</p>
                <p className="profile-select-page__age">{calculateAge(kid.kid_birth_date)}세</p>
              </div>
            </button>
          ))}

          {/* 프로필 추가 버튼 */}
          <button
            onClick={() => onNavigate('profile-add')}
            className="profile-select-page__add"
          >
            <div className="profile-select-page__add-icon">
              <Plus size={48} strokeWidth={2} />
            </div>
            <div className="profile-select-page__info">
              <p className="profile-select-page__add-text">프로필 추가</p>
            </div>
          </button>
        </div>

        {/* 프로필 관리 링크 */}
        <button
          onClick={() => onNavigate('profile-manage')}
          className="profile-select-page__manage"
        >
          프로필 관리
        </button>
      </main>

      {/* 하단 풍경 장식 */}
      <div className="profile-select-page__landscape">
        {/* 잔디 언덕 */}
        <div className="profile-select-page__grass"></div>

        {/* 나무들 */}
        <div className="profile-select-page__tree profile-select-page__tree--1">
          <div className="profile-select-page__tree-top"></div>
          <div className="profile-select-page__tree-trunk"></div>
        </div>
        <div className="profile-select-page__tree profile-select-page__tree--2">
          <div className="profile-select-page__tree-top"></div>
          <div className="profile-select-page__tree-trunk"></div>
        </div>
        <div className="profile-select-page__tree profile-select-page__tree--3">
          <div className="profile-select-page__tree-top"></div>
          <div className="profile-select-page__tree-trunk"></div>
        </div>
        <div className="profile-select-page__tree profile-select-page__tree--4">
          <div className="profile-select-page__tree-top"></div>
          <div className="profile-select-page__tree-trunk"></div>
        </div>

        {/* 집 */}
        <div className="profile-select-page__house profile-select-page__house--1">
          <div className="profile-select-page__house-roof"></div>
          <div className="profile-select-page__house-body">
            <div className="profile-select-page__house-window"></div>
            <div className="profile-select-page__house-door"></div>
          </div>
        </div>
        <div className="profile-select-page__house profile-select-page__house--2">
          <div className="profile-select-page__house-roof"></div>
          <div className="profile-select-page__house-body">
            <div className="profile-select-page__house-window"></div>
            <div className="profile-select-page__house-door"></div>
          </div>
        </div>

        {/* 작은 덤불들 */}
        <div className="profile-select-page__bush profile-select-page__bush--1"></div>
        <div className="profile-select-page__bush profile-select-page__bush--2"></div>
        <div className="profile-select-page__bush profile-select-page__bush--3"></div>
        <div className="profile-select-page__bush profile-select-page__bush--4"></div>
        <div className="profile-select-page__bush profile-select-page__bush--5"></div>
      </div>
    </div>
  )
}