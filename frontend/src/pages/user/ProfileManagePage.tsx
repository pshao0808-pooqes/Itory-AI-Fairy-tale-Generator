import { ChevronLeft, Plus, Edit2, Trash2, Users } from 'lucide-react'
import { PageType, Kid, calculateAge } from '../../App'
import '../../styles/pages/ProfileManagePage.css'

interface ProfileManagePageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  onMenuClick: () => void
  kids: Kid[]
  currentKidId: string | null
  onSelectKid: (id: string) => void
  onDeleteKid: (id: string) => void
}

export default function ProfileManagePage({
  onNavigate,
  onGoBack,
  onMenuClick: _onMenuClick,
  kids,
  currentKidId,
  onSelectKid,
  onDeleteKid
}: ProfileManagePageProps) {
  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" 프로필을 삭제하시겠습니까?`)) {
      onDeleteKid(id)
    }
  }

  return (
    <div className="profile-manage-page">
      {/* 배경 구름 */}
      <div className="profile-manage-page__bg-decorations">
        <div className="profile-manage-page__cloud profile-manage-page__cloud--1"></div>
        <div className="profile-manage-page__cloud profile-manage-page__cloud--2"></div>
        <div className="profile-manage-page__cloud profile-manage-page__cloud--3"></div>
        <div className="profile-manage-page__cloud profile-manage-page__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="profile-manage-page__header">
        <div className="profile-manage-page__header-left">
          <button onClick={onGoBack} className="profile-manage-page__back-btn">
            <ChevronLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="profile-manage-page__logo-img"
          />
        </div>
        <div style={{ width: 48 }} />
      </header>

      <main className="profile-manage-page__main">
        {/* 인트로 */}
        <div className="profile-manage-page__intro">
          <div className="profile-manage-page__intro-icon">
            <Users size={32} />
          </div>
          <h2 className="profile-manage-page__intro-title">프로필 관리</h2>
          <p className="profile-manage-page__intro-desc">최대 4개의 프로필을 만들 수 있어요</p>
          <div className="profile-manage-page__count-badge">
            {kids.length} / 4
          </div>
        </div>

        {/* 프로필 목록 */}
        <div className="profile-manage-page__content">
          <div className="profile-manage-page__list">
            {kids.map((kid) => (
              <div
                key={kid.id}
                className={`profile-manage-page__item ${currentKidId === kid.id ? 'active' : ''}`}
              >
                <div
                  className="profile-manage-page__item-main"
                  onClick={() => onSelectKid(kid.id)}
                >
                  <div className="profile-manage-page__avatar">
                    {kid.avatar_url.startsWith('/') || kid.avatar_url.startsWith('http') ? (
                      <img src={kid.avatar_url} alt={kid.kid_name} />
                    ) : (
                      <span>{kid.avatar_url}</span>
                    )}
                  </div>
                  <div className="profile-manage-page__info">
                    <h3 className="profile-manage-page__name">{kid.kid_name}</h3>
                    <p className="profile-manage-page__age">{calculateAge(kid.kid_birth_date)}세</p>
                  </div>
                  {currentKidId === kid.id && (
                    <span className="profile-manage-page__current-badge">현재 사용 중</span>
                  )}
                </div>
                <div className="profile-manage-page__actions">
                  <button
                    className="profile-manage-page__action-btn profile-manage-page__action-btn--edit"
                    onClick={() => {
                      onSelectKid(kid.id)
                      onNavigate('profile-edit')
                    }}
                    title="수정"
                  >
                    <Edit2 size={18} />
                  </button>
                  {kids.length > 1 && (
                    <button
                      className="profile-manage-page__action-btn profile-manage-page__action-btn--delete"
                      onClick={() => handleDelete(kid.id, kid.kid_name)}
                      title="삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 프로필 추가 버튼 */}
            {kids.length < 4 && (
              <button
                onClick={() => onNavigate('profile-add')}
                className="profile-manage-page__add-btn"
              >
                <div className="profile-manage-page__add-icon">
                  <Plus size={32} />
                </div>
                <span>새 프로필 추가</span>
              </button>
            )}
          </div>

          {/* 팁 */}
          <div className="profile-manage-page__tip">
            <span className="profile-manage-page__tip-icon">💡</span>
            <p>프로필을 선택하면 해당 프로필로 전환됩니다</p>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="profile-manage-page__footer">
        <p>© 2025 아이토리. 모든 아이들의 상상력을 응원합니다.</p>
      </footer>
    </div>
  )
}