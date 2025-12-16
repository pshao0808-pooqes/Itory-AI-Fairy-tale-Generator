import { useState } from 'react'

// Auth Pages
import LandingPage from './pages/auth/LandingPage'
import SignupPage from './pages/auth/SignupPage'
import LoginPage from './pages/auth/LoginPage'
import ProfileSelectPage from './pages/auth/ProfileSelectPage'
import ProfileAddPage from './pages/auth/ProfileAddPage'

// Home Pages
import HomePage from './pages/home/HomePage'
import ServiceGuidePage from './pages/home/ServiceGuidePage'

// Story Pages
import FairyTaleSelectionPage from './pages/story/FairyTaleSelectionPage'
import ArtStyleSelectionPage from './pages/story/ArtStyleSelectionPage'
import EditStoryPage from './pages/story/EditStoryPage'
import VideoPage from './pages/story/VideoPage'

// Bookshelf Pages
import MyBookshelfPage from './pages/bookshelf/MyBookshelfPage'
import StoryDetailPage from './pages/bookshelf/StoryDetailPage'

// Community Pages
import BookClubPage from './pages/community/BookClubPage'
import BookClubUploadPage from './pages/community/BookClubUploadPage'

// User Pages
import MyPage from './pages/user/MyPage'
import ProfileEditPage from './pages/user/ProfileEditPage'
import ProfileManagePage from './pages/user/ProfileManagePage'
import NotificationSettingsPage from './pages/user/NotificationSettingsPage'
import PasswordChangePage from './pages/user/PasswordChangePage'
import FAQPage from './pages/user/FAQPage'
import TermsPage from './pages/user/TermsPage'
import ParentAccountPage from './pages/user/ParentAccountPage'
import PaymentMethodPage from './pages/user/PaymentMethodPage'
import PaymentHistoryPage from './pages/user/PaymentHistoryPage'
import SubscriptionPlanPage from './pages/user/SubscriptionPlanPage'

// Components
import DecorativeElements from './components/common/DecorativeElements'
import Sidebar from './components/common/Sidebar'

export type PageType =
  | 'landing'
  | 'signup'
  | 'login'
  | 'profile-select'
  | 'profile-add'
  | 'home'
  | 'service-guide'
  | 'fairytale-selection'
  | 'artstyle-selection'
  | 'edit-story'
  | 'video'
  | 'story-detail'
  | 'bookshelf'
  | 'bookclub'
  | 'bookclub-upload'
  | 'mypage'
  | 'profile-edit'
  | 'profile-manage'
  | 'notification-settings'
  | 'password-change'
  | 'faq'
  | 'terms'
  | 'parent-account'
  | 'payment-method'
  | 'payment-history'
  | 'subscription-plan'

// ============================================
// DB 스키마 기준 타입 정의 (snake_case)
// ============================================

// 구독 등급 타입 (DB: USERS.subscription_tier)
export type SubscriptionTier = 'BASIC' | 'PREMIUM'

// 아이 프로필 (DB: KIDS + KID_PROFILES_NS)
export interface Kid {
  id: string                    // kid_id (PK)
  parent_id?: string            // USERS.uid (FK)
  kid_name: string              // 아이 이름
  kid_birth_date: string        // 생년월일 "YYYY-MM-DD"
  gender?: string               // male / female
  avatar_url: string            // 아바타 이미지 URL 또는 이모지
  interest_tags?: string[]      // 관심사 태그
  personality_type?: string     // 성격 유형
  preferences?: Record<string, any>  // 영상 스타일/선호 데이터
}

// 부모/교사 계정 (DB: USERS)
export interface User {
  uid?: string
  email: string
  name: string
  user_type?: 'parent' | 'teacher'
  subscription_tier: SubscriptionTier
  free_trial_used: boolean
  subscription_end_at?: string | null  // ISO date string
  accept_feedback_email?: boolean
}

// 동화 (DB: TALES + TALE_STRUCTURES_NS)
export interface Tale {
  id: string                    // tale_id (PK)
  title: string
  thumbnail_url: string
  canonical_moral?: string      // 원작 교훈
  category?: string
  age_recommendation?: string
}

// 그림체 (DB에 테이블 없음, 문자열로만 관리)
export type ArtStyle = 'watercolor' | 'cartoon_2d' | 'cartoon_3d' | 'realistic' | 'pixar'

// 스토리 세션 (DB: STORY_SESSIONS + STORY_SESSION_DATA)
export interface StorySession {
  session_id: string
  user_id: string
  kid_id: string
  tale_id: string
  selected_style: ArtStyle
  session_status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
  current_act: number
}

// 사이드바용 유저 상태
export interface UserState {
  is_logged_in: boolean
  parent_name: string
  current_child: Kid | null
}

// ============================================
// 헬퍼 함수: 생년월일 → 나이 계산
// ============================================
export function calculateAge(birth_date: string): number {
  const today = new Date()
  const birth = new Date(birth_date)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// ============================================
// App Component
// ============================================
function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing')
  const [pageHistory, setPageHistory] = useState<PageType[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 부모 프로필 잠금 해제 상태
  const [isParentUnlocked, setIsParentUnlocked] = useState(false)

  // 선택된 동화 & 스타일 상태 (DB 기준)
  const [selectedTale, setSelectedTale] = useState<Tale | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle | null>(null)

  // 부모님 계정 정보 (DB: USERS)
  const [userInfo, setUserInfo] = useState<User>({
    uid: 'user_001',
    email: 'parent@example.com',
    name: '김교원',
    user_type: 'parent',
    subscription_tier: 'PREMIUM',
    free_trial_used: true,
    subscription_end_at: '2025-01-15',
    accept_feedback_email: true
  })

  // 자녀 프로필 관리 (DB: KIDS + KID_PROFILES_NS)
  const [kids, setKids] = useState<Kid[]>([
    {
      id: 'kid_001',
      parent_id: 'user_001',
      kid_name: '민준이',
      kid_birth_date: '2017-03-15',  // 8세
      avatar_url: '👦',
      gender: 'male',
      interest_tags: ['공룡', '우주']
    },
    {
      id: 'kid_002',
      parent_id: 'user_001',
      kid_name: '서연이',
      kid_birth_date: '2019-07-22',  // 6세
      avatar_url: '👧',
      gender: 'female',
      interest_tags: ['공주', '동물']
    }
  ])
  const [currentKidId, setCurrentKidId] = useState<string | null>('kid_001')

  const currentKid = kids.find(k => k.id === currentKidId) || null

  // 부모 프로필 관련 페이지 목록
  const parentPages: PageType[] = ['parent-account', 'payment-method', 'payment-history', 'subscription-plan', 'password-change', 'notification-settings', 'profile-manage', 'profile-add']

  // 네비게이션 함수
  const navigate = (page: PageType) => {
    if (isParentUnlocked && !parentPages.includes(page)) {
      setIsParentUnlocked(false)
    }
    setPageHistory(prev => [...prev, currentPage])
    setCurrentPage(page)
  }

  // 뒤로가기 함수
  const goBack = () => {
    if (pageHistory.length > 0) {
      const prevPage = pageHistory[pageHistory.length - 1]
      if (isParentUnlocked && !parentPages.includes(prevPage)) {
        setIsParentUnlocked(false)
      }
      setPageHistory(prev => prev.slice(0, -1))
      setCurrentPage(prevPage)
    }
  }

  // 사이드바 열기/닫기
  const openSidebar = () => setSidebarOpen(true)
  const closeSidebar = () => setSidebarOpen(false)

  // 자녀 추가
  const addKid = (kid: Omit<Kid, 'id'>) => {
    const newId = `kid_${Date.now()}`
    const newKid = { ...kid, id: newId }
    setKids(prev => [...prev, newKid])
    setCurrentKidId(newId)
  }

  // 자녀 업데이트
  const updateKid = (updatedKid: { kid_name: string; kid_birth_date: string; avatar_url: string; gender?: string; interest_tags?: string[] }) => {
    if (!currentKidId) return
    setKids(prev => prev.map(k =>
      k.id === currentKidId ? { ...k, ...updatedKid } : k
    ))
  }

  // 자녀 삭제
  const deleteKid = (id: string) => {
    setKids(prev => prev.filter(k => k.id !== id))
    if (currentKidId === id) {
      const remaining = kids.filter(k => k.id !== id)
      setCurrentKidId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  // 자녀 선택
  const selectKid = (id: string) => {
    setCurrentKidId(id)
  }

  const renderPage = () => {
    switch (currentPage) {
      // Auth
      case 'landing':
        return <LandingPage onNavigate={navigate} />
      case 'signup':
        return <SignupPage onNavigate={navigate} onGoBack={goBack} />
      case 'login':
        return <LoginPage
          onNavigate={navigate}
          onGoBack={goBack}
          onLogin={(email, name) => {
            setUserInfo(prev => ({ ...prev, name, email }))
            navigate('profile-select')
          }}
        />
      case 'profile-select':
        return (
          <ProfileSelectPage
            onNavigate={navigate}
            kids={kids}
            onSelectKid={(kid) => {
              selectKid(kid.id)
              navigate('home')
            }}
            onLogout={() => navigate('landing')}
          />
        )
      case 'profile-add':
        return (
          <ProfileAddPage
            onNavigate={navigate}
            onGoBack={goBack}
            onAddKid={addKid}
          />
        )

      // Home
      case 'home':
        return (
          <HomePage
            onNavigate={navigate}
            onMenuClick={openSidebar}
            currentKid={currentKid}
            userInfo={userInfo}
          />
        )
      case 'service-guide':
        return (
          <ServiceGuidePage
            onNavigate={navigate}
            onGoBack={goBack}
          />
        )

      // Story
      case 'fairytale-selection':
        return (
          <FairyTaleSelectionPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
            onSelectTale={setSelectedTale}
          />
        )
      case 'artstyle-selection':
        return (
          <ArtStyleSelectionPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
            selectedTale={selectedTale}
            onSelectStyle={setSelectedStyle}
          />
        )
      case 'edit-story':
        return (
          <EditStoryPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
            selectedTale={selectedTale}
            selectedStyle={selectedStyle}
          />
        )
      case 'video':
        return (
          <VideoPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
            selectedTale={selectedTale}
          />
        )

      // Bookshelf
      case 'story-detail':
        return (
          <StoryDetailPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
          />
        )
      case 'bookshelf':
        return (
          <MyBookshelfPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
          />
        )

      // Community
      case 'bookclub':
        return (
          <BookClubPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
          />
        )
      case 'bookclub-upload':
        return (
          <BookClubUploadPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
          />
        )

      // User
      case 'mypage':
        return (
          <MyPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
            currentKid={currentKid}
            userInfo={userInfo}
          />
        )
      case 'profile-edit':
        return (
          <ProfileEditPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
            currentKid={currentKid}
            onUpdateKid={updateKid}
          />
        )
      case 'profile-manage':
        return (
          <ProfileManagePage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
            kids={kids}
            currentKidId={currentKidId}
            onSelectKid={selectKid}
            onDeleteKid={deleteKid}
          />
        )
      case 'notification-settings':
        return (
          <NotificationSettingsPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
          />
        )
      case 'password-change':
        return (
          <PasswordChangePage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
          />
        )
      case 'faq':
        return (
          <FAQPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
          />
        )
      case 'terms':
        return (
          <TermsPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
          />
        )
      case 'parent-account':
        return (
          <ParentAccountPage
            onNavigate={navigate}
            onGoBack={goBack}
            userInfo={userInfo}
            kidsCount={kids.length}
            isUnlocked={isParentUnlocked}
            onUnlock={() => setIsParentUnlocked(true)}
          />
        )
      case 'payment-method':
        return (
          <PaymentMethodPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
          />
        )
      case 'payment-history':
        return (
          <PaymentHistoryPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
          />
        )
      case 'subscription-plan':
        return (
          <SubscriptionPlanPage
            onNavigate={navigate}
            onGoBack={goBack}
            onMenuClick={openSidebar}
            userInfo={userInfo}
          />
        )

      default:
        return <HomePage onNavigate={navigate} onMenuClick={openSidebar} currentKid={currentKid} userInfo={userInfo} />
    }
  }

  // 배경 장식이 필요한 페이지인지 확인
  const needsDecorations = !['landing', 'fairytale-selection', 'profile-select', 'profile-add'].includes(currentPage)

  return (
    <div className="page-wrapper">
      {needsDecorations && <DecorativeElements />}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {renderPage()}
      </div>

      {/* 사이드바 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onNavigate={(page) => {
          navigate(page)
          closeSidebar()
        }}
        userState={{
          is_logged_in: true,
          parent_name: userInfo.name,
          current_child: currentKid
        }}
        onLogout={() => {
          navigate('landing')
          closeSidebar()
        }}
      />
    </div>
  )
}

export default App