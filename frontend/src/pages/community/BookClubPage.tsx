import { useState } from 'react'
import { ArrowLeft, Trophy, Heart, Crown, Medal, Flame, Clock, TrendingUp, Sparkles, PenLine, Eye } from 'lucide-react'
import { PageType } from '../../App'
import '../../styles/pages/BookClubPage.css'

interface BookClubPageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  onMenuClick: () => void
}

// 주간 인기 작가 랭킹
const rankings = [
  { rank: 1, name: '김교원', avatar: '/src/assets/images/avatars/avatar1.png', likes: 124, badge: '🏆' },
  { rank: 2, name: '이수진', avatar: '/src/assets/images/avatars/avatar2.png', likes: 98, badge: '🥈' },
  { rank: 3, name: '박민수', avatar: '/src/assets/images/avatars/avatar3.png', likes: 87, badge: '🥉' },
  { rank: 4, name: '최지은', avatar: '/src/assets/images/avatars/avatar4.png', likes: 76, badge: '' },
  { rank: 5, name: '정하늘', avatar: '/src/assets/images/avatars/avatar5.png', likes: 65, badge: '' }
]

// 게시글 데이터 (동화 이미지 경로 사용)
const posts = [
  {
    id: 1,
    author: '김교원',
    authorAge: 9,
    avatar: '/src/assets/images/avatars/avatar1.png',
    time: '2시간 전',
    title: '나만의 특별한 흥부이야기',
    description: '착한 흥부가 제비를 도와주고 보물을 받는 이야기를 내 마음대로 바꿔봤어요!',
    baseTale: '흥부와 놀부',
    hashtags: ['#흥부와놀부', '#착한마음', '#제비'],
    thumbnail: '/src/assets/images/tales/tale_003.png',
    likes: 124,
    views: 456,
    isHot: true
  },
  {
    id: 2,
    author: '이수진',
    authorAge: 8,
    avatar: '/src/assets/images/avatars/avatar2.png',
    time: '5시간 전',
    title: '마법 같은 콩쥐팥쥐',
    description: '콩쥐가 마법사가 되어서 팥쥐를 도와주는 새로운 엔딩이에요~',
    baseTale: '콩쥐팥쥐',
    hashtags: ['#콩쥐팥쥐', '#해피엔딩', '#마법'],
    thumbnail: '/src/assets/images/tales/tale_005.png',
    likes: 98,
    views: 321,
    isHot: true
  },
  {
    id: 3,
    author: '박민수',
    authorAge: 10,
    avatar: '/src/assets/images/avatars/avatar3.png',
    time: '1일 전',
    title: '용감한 토끼의 모험!',
    description: '토끼가 거북이와 친구가 되어서 함께 모험을 떠나는 이야기예요',
    baseTale: '토끼와 거북이',
    hashtags: ['#토끼와거북이', '#우정', '#모험'],
    thumbnail: '/src/assets/images/tales/tale_001.png',
    likes: 87,
    views: 289,
    isHot: false
  },
  {
    id: 4,
    author: '최지은',
    authorAge: 7,
    avatar: '/src/assets/images/avatars/avatar4.png',
    time: '2일 전',
    title: '금도끼를 찾아서',
    description: '정직한 나무꾼이 금도끼, 은도끼 모두 받고 마을을 도와줘요!',
    baseTale: '금도끼 은도끼',
    hashtags: ['#금도끼은도끼', '#정직', '#나눔'],
    thumbnail: '/src/assets/images/tales/tale_006.png',
    likes: 76,
    views: 198,
    isHot: false
  },
  {
    id: 5,
    author: '정하늘',
    authorAge: 9,
    avatar: '/src/assets/images/avatars/avatar6.png',
    time: '3일 전',
    title: '해와 달이 된 남매의 비밀',
    description: '오누이가 하늘나라에서 겪는 신비로운 이야기를 상상해봤어요',
    baseTale: '해와 달이 된 오누이',
    hashtags: ['#해와달', '#오누이', '#신비'],
    thumbnail: '/src/assets/images/tales/tale_002.png',
    likes: 65,
    views: 176,
    isHot: false
  }
]

type TabType = 'popular' | 'recent' | 'following'

export default function BookClubPage({ onNavigate, onGoBack, onMenuClick: _onMenuClick }: BookClubPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('popular')
  const [likedPosts, setLikedPosts] = useState<number[]>([])

  const handleLike = (postId: number) => {
    setLikedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  // 아바타가 이미지 경로인지 확인
  const isImageUrl = (avatar: string | undefined): boolean => {
    if (!avatar) return false
    return avatar.startsWith('/') || avatar.startsWith('http')
  }

  return (
    <div className="bookclub">
      {/* 배경 장식 */}
      <div className="bookclub__bg-decorations">
        <div className="bookclub__cloud bookclub__cloud--1"></div>
        <div className="bookclub__cloud bookclub__cloud--2"></div>
        <div className="bookclub__cloud bookclub__cloud--3"></div>
        <div className="bookclub__cloud bookclub__cloud--4"></div>
      </div>

      {/* 헤더 */}
      <header className="bookclub__header">
        <div className="bookclub__header-left">
          <button onClick={onGoBack} className="bookclub__back-btn">
            <ArrowLeft size={24} />
          </button>
          <img
            src="/src/assets/images/logo.png"
            alt="아이토리"
            className="bookclub__logo-img"
            onClick={() => onNavigate('home')}
          />
        </div>
        <div className="bookclub__header-spacer"></div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="bookclub__main">
        {/* 인트로 섹션 */}
        <div className="bookclub__intro">
          <div className="bookclub__intro-icon">
            <Sparkles size={36} />
          </div>
          <h1 className="bookclub__title">북클럽</h1>
          <p className="bookclub__subtitle">친구들의 멋진 동화를 구경하고 응원해요!</p>
        </div>

        {/* 주간 인기 작가 */}
        <section className="bookclub__ranking-section">
          <div className="bookclub__ranking-header">
            <div className="bookclub__ranking-title-wrap">
              <Trophy size={24} />
              <h2 className="bookclub__ranking-title">이번 주 인기 작가</h2>
            </div>
            <span className="bookclub__ranking-badge">TOP 5</span>
          </div>

          <div className="bookclub__ranking-list">
            {rankings.map((author) => (
              <div
                key={author.rank}
                className={`bookclub__ranking-card bookclub__ranking-card--${author.rank}`}
              >
                <div className="bookclub__ranking-medal">
                  {author.rank === 1 && <Crown size={20} className="bookclub__crown" />}
                  {author.rank === 2 && <Medal size={18} className="bookclub__medal-silver" />}
                  {author.rank === 3 && <Medal size={18} className="bookclub__medal-bronze" />}
                  {author.rank > 3 && <span className="bookclub__ranking-num">{author.rank}</span>}
                </div>
                <div className="bookclub__ranking-avatar">
                  {isImageUrl(author.avatar) ? (
                    <img src={author.avatar} alt={author.name} className="bookclub__ranking-avatar-img" />
                  ) : (
                    '👤'
                  )}
                </div>
                <p className="bookclub__ranking-name">{author.name}</p>
                <div className="bookclub__ranking-likes">
                  <Heart size={12} fill="#FF6B6B" color="#FF6B6B" />
                  <span>{author.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 탭 네비게이션 */}
        <div className="bookclub__tabs">
          <button
            className={`bookclub__tab ${activeTab === 'popular' ? 'bookclub__tab--active' : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            <Flame size={18} />
            <span>인기</span>
          </button>
          <button
            className={`bookclub__tab ${activeTab === 'recent' ? 'bookclub__tab--active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            <Clock size={18} />
            <span>최신</span>
          </button>
          <button
            className={`bookclub__tab ${activeTab === 'following' ? 'bookclub__tab--active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            <TrendingUp size={18} />
            <span>팔로잉</span>
          </button>
        </div>

        {/* 게시글 피드 */}
        <section className="bookclub__feed">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className="bookclub__post"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* HOT 배지 */}
              {post.isHot && (
                <div className="bookclub__post-hot">
                  <Flame size={14} />
                  HOT
                </div>
              )}

              {/* 게시글 헤더 */}
              <div className="bookclub__post-header">
                <div className="bookclub__post-avatar">
                  {isImageUrl(post.avatar) ? (
                    <img src={post.avatar} alt={post.author} className="bookclub__post-avatar-img" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="bookclub__post-author-info">
                  <p className="bookclub__post-author">
                    {post.author}
                    <span className="bookclub__post-age">{post.authorAge}세</span>
                  </p>
                  <p className="bookclub__post-time">{post.time}</p>
                </div>
                <div className="bookclub__post-base-tale">
                  원작: {post.baseTale}
                </div>
              </div>

              {/* 썸네일 + 컨텐츠 영역 */}
              <div className="bookclub__post-content">
                <div className="bookclub__post-thumbnail">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="bookclub__post-thumbnail-img"
                  />
                  <div className="bookclub__post-thumbnail-overlay">
                    <Eye size={20} />
                    <span>보러가기</span>
                  </div>
                </div>

                <div className="bookclub__post-text">
                  <h3 className="bookclub__post-title">{post.title}</h3>
                  <p className="bookclub__post-description">{post.description}</p>

                  {/* 해시태그 */}
                  <div className="bookclub__post-hashtags">
                    {post.hashtags.map((tag, idx) => (
                      <span key={idx} className="bookclub__post-hashtag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 액션 바 */}
              <div className="bookclub__post-actions">
                <button
                  className={`bookclub__action-btn bookclub__action-btn--like ${likedPosts.includes(post.id) ? 'bookclub__action-btn--liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  <Heart size={18} fill={likedPosts.includes(post.id) ? '#FF6B6B' : 'none'} />
                  <span>{likedPosts.includes(post.id) ? post.likes + 1 : post.likes}</span>
                </button>
                <button className="bookclub__action-btn">
                  <Eye size={18} />
                  <span>{post.views}</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* 글쓰기 플로팅 버튼 */}
      <button
        onClick={() => onNavigate('bookclub-upload')}
        className="bookclub__write-btn"
      >
        <PenLine size={24} />
        <span>내 동화 공유하기</span>
      </button>

      {/* 하단 풍경 */}
      <div className="bookclub__landscape">
        <div className="bookclub__grass"></div>
        <div className="bookclub__tree bookclub__tree--1">
          <div className="bookclub__tree-top"></div>
          <div className="bookclub__tree-trunk"></div>
        </div>
        <div className="bookclub__tree bookclub__tree--2">
          <div className="bookclub__tree-top"></div>
          <div className="bookclub__tree-trunk"></div>
        </div>
        <div className="bookclub__bush bookclub__bush--1"></div>
        <div className="bookclub__bush bookclub__bush--2"></div>
      </div>
    </div>
  )
}