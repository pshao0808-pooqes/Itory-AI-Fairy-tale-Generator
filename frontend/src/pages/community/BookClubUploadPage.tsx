import { useState } from 'react'
import { RefreshCw, Sparkles, BookOpen, Send } from 'lucide-react'
import { PageType } from '../../App'
import SimpleHeader from '../../components/common/SimpleHeader'
import '../../styles/pages/BookClubUploadPage.css'

interface BookClubUploadPageProps {
  onNavigate: (page: PageType) => void
  onGoBack: () => void
  onMenuClick: () => void
}

const hashtagOptions = [
  '#흥부와놀부', '#콩쥐팥쥐', '#토끼와거북이', '#혹부리영감',
  '#해와달', '#금도끼은도끼', '#선녀와나무꾼', '#별주부전',
  '#착한마음', '#용기', '#우정', '#가족사랑', '#해피엔딩', '#모험'
]

const myStories = [
  { id: 1, title: '흥부와 놀부', emoji: '🏠', date: '2024.01.15', style: '수채화' },
  { id: 2, title: '콩쥐와 팥쥐', emoji: '👧', date: '2024.01.10', style: '3D 카툰' },
  { id: 3, title: '토끼와 거북이', emoji: '🐰', date: '2024.01.05', style: '실사' },
]

export default function BookClubUploadPage({ onNavigate, onGoBack, onMenuClick }: BookClubUploadPageProps) {
  const [title, setTitle] = useState('나만의 특별한 흥부이야기')
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(['#흥부와놀부', '#착한마음'])
  const [selectedStory, setSelectedStory] = useState(myStories[0])
  const [showPicker, setShowPicker] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const toggleHashtag = (tag: string) => {
    if (selectedHashtags.includes(tag)) {
      setSelectedHashtags(selectedHashtags.filter(t => t !== tag))
    } else if (selectedHashtags.length < 5) {
      setSelectedHashtags([...selectedHashtags, tag])
    }
  }

  const handleRegenerate = () => {
    setIsRegenerating(true)
    setTimeout(() => {
      const titles = [
        '마음 따뜻한 흥부의 하루',
        '제비가 가져다 준 행복',
        '착한 마음의 보물이야기',
        '흥부네 박에서 생긴 일'
      ]
      setTitle(titles[Math.floor(Math.random() * titles.length)])
      setIsRegenerating(false)
    }, 800)
  }

  const handleSubmit = () => {
    // 게시 완료 후 북클럽으로 이동
    onNavigate('bookclub')
  }

  return (
    <div className="bookclub-upload-page">
      {/* 배경 구름 */}
      <div className="bookclub-upload-page__bg-decorations">
        <div className="bookclub-upload-page__cloud bookclub-upload-page__cloud--1"></div>
        <div className="bookclub-upload-page__cloud bookclub-upload-page__cloud--2"></div>
        <div className="bookclub-upload-page__cloud bookclub-upload-page__cloud--3"></div>
      </div>

      <SimpleHeader
        onNavigate={onNavigate}
        onGoBack={onGoBack}
        onMenuClick={onMenuClick}
      />

      <main className="bookclub-upload-page__main">
        {/* 타이틀 */}
        <div className="bookclub-upload-page__header">
          <div className="bookclub-upload-page__title-icon">✏️</div>
          <div className="bookclub-upload-page__title-content">
            <h1 className="bookclub-upload-page__title">글쓰기</h1>
            <p className="bookclub-upload-page__subtitle">나만의 동화를 친구들과 공유해요!</p>
          </div>
        </div>

        {/* 폼 카드 */}
        <div className="bookclub-upload-page__form">
          {/* 제목 입력 */}
          <div className="bookclub-upload-page__field">
            <label>
              <Sparkles size={18} />
              제목
              <span className="bookclub-upload-page__ai-badge">AI 자동생성</span>
              <span className="bookclub-upload-page__count">{title.length}/30</span>
            </label>
            <div className="bookclub-upload-page__title-input-wrapper">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 30))}
                placeholder="제목을 입력해주세요"
              />
              <button
                className={`bookclub-upload-page__regenerate-btn ${isRegenerating ? 'spinning' : ''}`}
                onClick={handleRegenerate}
              >
                <RefreshCw size={18} />
                다시 생성
              </button>
            </div>
          </div>

          {/* 해시태그 */}
          <div className="bookclub-upload-page__field">
            <label>
              #️⃣ 해시태그
              <span className="bookclub-upload-page__count">{selectedHashtags.length}/5</span>
            </label>
            <div className="bookclub-upload-page__hashtag-grid">
              {hashtagOptions.map((tag) => (
                <button
                  key={tag}
                  className={`bookclub-upload-page__hashtag-btn ${selectedHashtags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => toggleHashtag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 동화 첨부 */}
          <div className="bookclub-upload-page__field">
            <label>
              <BookOpen size={18} />
              동화 첨부
            </label>

            {selectedStory ? (
              <div className="bookclub-upload-page__selected-story">
                <div className="bookclub-upload-page__story-preview">
                  <span className="bookclub-upload-page__story-emoji">{selectedStory.emoji}</span>
                  <div>
                    <p className="bookclub-upload-page__story-title">{selectedStory.title}</p>
                    <p className="bookclub-upload-page__story-meta">{selectedStory.style} · {selectedStory.date}</p>
                  </div>
                </div>
                <button
                  className="bookclub-upload-page__change-btn"
                  onClick={() => setShowPicker(!showPicker)}
                >
                  변경
                </button>
              </div>
            ) : (
              <button
                className="bookclub-upload-page__attach-btn"
                onClick={() => setShowPicker(true)}
              >
                📚 내 책장에서 동화 선택하기
              </button>
            )}

            {/* 동화 선택 피커 */}
            {showPicker && (
              <div className="bookclub-upload-page__story-picker">
                <div className="bookclub-upload-page__story-picker-header">
                  <h4>📖 내 동화 선택</h4>
                  <button onClick={() => setShowPicker(false)}>✕</button>
                </div>
                <div className="bookclub-upload-page__story-list">
                  {myStories.map((story) => (
                    <button
                      key={story.id}
                      className={`bookclub-upload-page__story-item ${selectedStory?.id === story.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedStory(story)
                        setShowPicker(false)
                      }}
                    >
                      <span className="bookclub-upload-page__story-emoji">{story.emoji}</span>
                      <div>
                        <p className="bookclub-upload-page__story-title">{story.title}</p>
                        <p className="bookclub-upload-page__story-meta">{story.style} · {story.date}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 게시하기 버튼 */}
          <button
            className="bookclub-upload-page__submit-btn"
            onClick={handleSubmit}
            disabled={!title.trim() || !selectedStory}
          >
            <Send size={22} />
            게시하기
          </button>
        </div>
      </main>

      {/* 하단 풍경 장식 */}
      <div className="bookclub-upload-page__landscape">
        <div className="bookclub-upload-page__grass"></div>
        <div className="bookclub-upload-page__tree bookclub-upload-page__tree--1"></div>
        <div className="bookclub-upload-page__tree bookclub-upload-page__tree--2"></div>
        <div className="bookclub-upload-page__bush bookclub-upload-page__bush--1"></div>
        <div className="bookclub-upload-page__bush bookclub-upload-page__bush--2"></div>
        <div className="bookclub-upload-page__bush bookclub-upload-page__bush--3"></div>
        <div className="bookclub-upload-page__flower bookclub-upload-page__flower--1"></div>
        <div className="bookclub-upload-page__flower bookclub-upload-page__flower--2"></div>
        <div className="bookclub-upload-page__flower bookclub-upload-page__flower--3"></div>
      </div>
    </div>
  )
}