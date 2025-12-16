import { ArrowLeft, Menu } from 'lucide-react'
import { PageType } from '../../App'
import '../../styles/components/SimpleHeader.css'

interface SimpleHeaderProps {
  onNavigate?: (page: PageType) => void
  onGoBack?: () => void
  onMenuClick?: () => void
  showBackButton?: boolean
  showMenuButton?: boolean
}

export default function SimpleHeader({
  onNavigate,
  onGoBack,
  onMenuClick,
  showBackButton = true,
  showMenuButton = true
}: SimpleHeaderProps) {
  return (
    <header className="simple-header">
      {/* 왼쪽: 뒤로가기 또는 로고 */}
      <div className="simple-header__left">
        {showBackButton && onGoBack ? (
          <button onClick={onGoBack} className="simple-header__back-btn">
            <ArrowLeft size={24} color="#5D4E37" />
          </button>
        ) : (
          <button
            onClick={() => onNavigate?.('home')}
            className="simple-header__logo"
          >
            <img
              src="/src/assets/images/logo.png"
              alt="아이토리"
              className="simple-header__logo-img"
            />
          </button>
        )}
      </div>

      {/* 오른쪽: 메뉴 버튼 */}
      <div className="simple-header__right">
        {showMenuButton && onMenuClick ? (
          <button onClick={onMenuClick} className="simple-header__menu-btn">
            <Menu size={24} color="#5D4E37" />
          </button>
        ) : (
          <div className="simple-header__placeholder" />
        )}
      </div>
    </header>
  )
}