import { X, Home, BookOpen, Library, Users, HelpCircle, Settings, LogOut, User } from 'lucide-react'
import { PageType, UserState, calculateAge } from '../../App'
import '../../styles/components/Sidebar.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: PageType) => void
  userState: UserState
  onLogout: () => void
}

// 아바타가 이미지 경로인지 확인
const isImageUrl = (avatar: string | undefined): boolean => {
  if (!avatar) return false
  return avatar.startsWith('/') || avatar.startsWith('http')
}

export default function Sidebar({ isOpen, onClose, onNavigate, userState, onLogout }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: '홈', page: 'home' as PageType },
    { icon: BookOpen, label: '동화 만들기', page: 'fairytale-selection' as PageType },
    { icon: Library, label: '내 책장', page: 'bookshelf' as PageType },
    { icon: Users, label: '북클럽', page: 'bookclub' as PageType },
    { icon: HelpCircle, label: '사용 가이드', page: 'service-guide' as PageType },
  ]

  const handleNavigate = (page: PageType) => {
    onNavigate(page)
    onClose()
  }

  // 아이 나이 계산
  const kidAge = userState.current_child ? calculateAge(userState.current_child.kid_birth_date) : null
  const avatarUrl = userState.current_child?.avatar_url

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* 사이드바 */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* 닫기 버튼 */}
        <button className="sidebar__close" onClick={onClose}>
          <X size={24} />
        </button>

        {/* 프로필 섹션 */}
        <div className="sidebar__profile" onClick={() => handleNavigate('mypage')}>
          <div className="sidebar__avatar">
            {isImageUrl(avatarUrl) ? (
              <img
                src={avatarUrl}
                alt="프로필"
                className="sidebar__avatar-img"
              />
            ) : (
              avatarUrl || '👤'
            )}
          </div>
          <div className="sidebar__profile-info">
            <p className="sidebar__profile-name">
              {userState.current_child?.kid_name || '사용자'}
              {kidAge && <span style={{ fontWeight: 400, fontSize: '14px', marginLeft: '4px' }}>({kidAge}세)</span>}
            </p>
            <p className="sidebar__profile-sub">
              {userState.parent_name}님의 아이
            </p>
          </div>
        </div>

        {/* 사용량 */}
        <div className="sidebar__usage">
          <div className="sidebar__usage-header">
            <span>이번 달 사용량</span>
            <span className="sidebar__usage-count">7/10</span>
          </div>
          <div className="sidebar__usage-bar">
            <div className="sidebar__usage-fill" style={{ width: '70%' }} />
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="sidebar__nav">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="sidebar__nav-item"
              onClick={() => handleNavigate(item.page)}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* 하단 메뉴 */}
        <div className="sidebar__bottom">
          <button
            className="sidebar__nav-item"
            onClick={() => handleNavigate('mypage')}
          >
            <User size={22} />
            <span>마이페이지</span>
          </button>
          <button
            className="sidebar__nav-item"
            onClick={() => handleNavigate('parent-account')}
          >
            <Settings size={22} />
            <span>계정 관리</span>
          </button>
          <button
            className="sidebar__nav-item sidebar__nav-item--logout"
            onClick={onLogout}
          >
            <LogOut size={22} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>
    </>
  )
}