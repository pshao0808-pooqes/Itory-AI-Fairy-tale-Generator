# 🎬 AI 동화 생성 시스템 - 전체 워크플로우

## 📖 프로젝트 개요

이 프로젝트는 **AI를 활용한 인터랙티브 동화 영상 생성 시스템**입니다. 사용자가 동화를 선택하고 그림체를 고른 후, 각 막마다 스토리를 선택하면서 자신만의 동화 영상을 만들 수 있습니다.

---

## 📁 프로젝트 구조

```
workspace/
├── backend/
│   ├── finalss/              # 메인 백엔드 로직
│   │   ├── agents/           # AI 에이전트들
│   │   │   ├── guardian_agent.py
│   │   │   ├── scenario_agent.py
│   │   │   ├── art_director_agent.py
│   │   │   ├── motion_director_agent.py
│   │   │   └── epilogue_director_agent.py
│   │   ├── managers/         # 핵심 관리 모듈
│   │   │   ├── config_manager.py
│   │   │   ├── story_manager.py
│   │   │   ├── media_generator.py
│   │   │   ├── merge_manager.py
│   │   │   ├── state_manager.py
│   │   │   └── subtitle_manager.py
│   │   ├── config/           # 설정 파일
│   │   │   └── default_config.yaml
│   │   ├── orchestrator.py   # CLI용 오케스트레이터
│   │   └── orchestrator_api.py # API용 래퍼
│   └── web_endpoint/         # FastAPI 서버
│       └── main.py           # REST API 엔드포인트
└── frontend/
    └── src/
        ├── pages/            # React 페이지들
        │   ├── story/
        │   │   ├── FairyTaleSelectionPage.tsx
        │   │   ├── ArtStyleSelectionPage.tsx
        │   │   ├── EditStoryPage.tsx
        │   │   └── VideoPage.tsx
        └── App.tsx           # 메인 앱
```

---

## 🔄 전체 워크플로우 (5막 구조)

### Phase 1: 사용자 설정 (Frontend)

#### 1️⃣ 동화 선택
- **파일**: `FairyTaleSelectionPage.tsx`
- **동작**: 사용자가 원하는 동화를 선택 (예: 흥부와 놀부)
- **저장**: `selectedTale` 상태에 저장

#### 2️⃣ 그림체 선택
- **파일**: `ArtStyleSelectionPage.tsx`
- **선택 가능한 스타일**:
  - `realistic` - 실사 스타일
  - `cartoon_2d` - 2D 애니메이션
  - `cartoon_3d` - 3D 카툰
  - `pixar` - 픽사 스타일
  - `watercolor` - 수채화 스타일
- **저장**: `selectedStyle` 상태에 저장

#### 3️⃣ 스토리 편집 시작
- **파일**: `EditStoryPage.tsx`
- **API 호출**: `POST /api/story/start`
- **응답**: `job_id` 받아서 `localStorage`에 저장

---

### Phase 2: 1막 자동 생성 (Backend)

#### 📡 API 엔드포인트
```
POST /api/story/start
Request: { tale_title, art_style }
Response: { job_id, status }
```

#### 🎬 1막 워크플로우 실행

**파일**: `orchestrator_api.py` → `run_stage_1()`

##### Step 1: 스토리 생성 (10%)
- **함수**: `StoryHelper.generate_stage_story(1, "")`
- **모델**: Gemini 2.5 Flash
- **출력**: 150~170자 스토리 (20초 TTS 기준)
- **저장**: `stage_stories` 리스트에 추가

##### Step 2: 스토리 3분할 (25%)
- **함수**: `StoryHelper.split_story_into_scenes(story)`
- **출력**: 3개의 장면 텍스트 (각 8초 분량)

##### Step 3: 이미지 3개 생성 (30-50%)
- **함수**: `MediaGenerator.generate_stage_images()`
- **에이전트**: Art Director Agent
- **모델**: Gemini 2.5 Flash Image
- **특징**:
  - 캐릭터 일관성 유지 (config 파일 참조)
  - 1막은 이전 이미지 레퍼런스 없음
- **출력**: `stage_1_image_1.png`, `stage_1_image_2.png`, `stage_1_image_3.png`

##### Step 4: 영상 3개 생성 (55-70%)
- **함수**: `MediaGenerator.generate_stage_videos()`
- **에이전트**: Motion Director Agent
- **모델**: Veo 3.1 Preview
- **특징**:
  - 각 이미지를 8초 영상으로 변환
  - 카메라 움직임과 동적 요소 추가
- **출력**: `stage_1_video_1.mp4`, `stage_1_video_2.mp4`, `stage_1_video_3.mp4`

##### Step 5: 영상 병합 (75-85%)
- **함수**: `MergeManager.video.merge_scenes_to_stage()`
- **도구**: FFmpeg
- **특징**:
  - 3개 영상을 크로스페이드(0.5초)로 병합
  - 최종 길이: 약 23초
- **출력**: `stage_1_merged.mp4`

##### Step 6: TTS 생성 (88-90%)
- **함수**: `MediaGenerator.generate_stage_tts()`
- **API**: ElevenLabs Multilingual v2
- **특징**:
  - 한국어 음성 생성
  - 20초 + 3초 무음 = 23초
- **출력**: `stage_1_tts_padded.mp3`

##### Step 7: 영상+TTS 합성 (92-100%)
- **함수**: `MergeManager.muxer.mux_stage()`
- **도구**: FFmpeg
- **특징**:
  - 영상과 오디오 결합
  - 자막 추가 (SubtitleManager)
- **출력**: `stage_1_final.mp4`

#### 📊 진행 상황 업데이트
- 각 단계마다 `progress_callback`을 통해 진행률 전송
- Frontend는 2초마다 `GET /api/story/status/{job_id}` 폴링

---

### Phase 3: 1막 영상 재생 (Frontend)

#### 📺 EditStoryPage - 발단 화면

##### 로딩 화면
- 진행률 바 표시 (0-100%)
- "발단 영상 준비 중..." 메시지

##### 영상 자동 재생
- `status === 'stage1_complete'` 감지
- `video_url`과 `story_text` localStorage에 저장
- 영상 자동 재생 (loop 모드)
- 하단에 스토리 텍스트 표시

##### 다음 단계로 이동
- "전개로 가기 - 선택 시작!" 버튼 클릭
- `currentStage`를 1로 변경

---

### Phase 4: 2~4막 선택 및 생성 (Interactive)

#### 🎯 선택지 로드

**Frontend**: `EditStoryPage.tsx` (line 123-149)
```typescript
useEffect(() => {
  if (currentStage >= 1 && currentStage <= 4) {
    fetchOptions()
  }
}, [currentStage])
```

**API 호출**:
```
GET /api/story/options/{job_id}/{stage_no}
Response: { options: ["옵션1", "옵션2"] }
```

**Backend 처리**:
1. 저장된 `OrchestratorAPI` 인스턴스 재사용 (히스토리 유지!)
2. `StoryManager.get_next_options(stage_no, cumulative_history)`
   - **누적된 스토리 히스토리**를 LLM에 전달
   - Gemini API로 2개의 선택지 생성
3. Frontend에 선택지 반환

#### 👆 사용자 선택

**3가지 선택 옵션**:
1. **AI 생성 선택지 1** - 첫 번째 옵션
2. **AI 생성 선택지 2** - 두 번째 옵션
3. **직접 쓰기** - 사용자가 직접 입력

#### 🎬 선택 후 막 생성

**Frontend**: 선택 전송
```typescript
POST /api/story/select/{job_id}/{stage_no}
Body: { choice: "1", text: "선택한 텍스트" }
```

**Backend**: `run_stage_with_choice(stage_no, user_choice)`

##### 1. Guardian Agent: 입력 검증
- 부적절한 단어 필터링
- 연령대에 맞는 콘텐츠 확인
- 폭력적 표현 순화

##### 2. Scenario Agent: 3컷 스토리 생성
- 사용자 선택을 3개 장면으로 확장
- **이전 막들의 히스토리 포함** (컨텍스트 유지!)
- 160자 내외로 생성

##### 3. 이미지 생성 (나노바나나 기법)
- **이전 막의 이미지 3개를 레퍼런스로 사용**
- 캐릭터 일관성 유지
- Art Director Agent가 프롬프트 생성

##### 4. 영상 생성
- Motion Director Agent가 모션 프롬프트 생성
- Veo 3.1로 8초 영상 3개 생성

##### 5. 병합 → TTS → 합성
- 1막과 동일한 프로세스
- 최종 파일: `stage_{stage_no}_final.mp4`

#### 🔁 반복
- 2막 → 3막 → 4막 동일한 프로세스 반복
- 각 막마다 선택지 제공 → 선택 → 생성

---

### Phase 5: 5막 결말 생성 (Automatic)

#### 🎓 교훈적 결말 자동 생성

**Backend**: `run_stage_5()`

##### 1. Epilogue Director Agent: 결말 생성
- 1~4막의 **모든 스토리 히스토리** 분석
- 사용자의 선택 패턴 고려
- 교훈적인 결말 자동 생성
- `moral_lesson` (교훈) 추출

##### 2. 나머지 프로세스
- 이미지 생성 (4막 이미지 레퍼런스)
- 영상 생성
- 병합 → TTS → 합성

##### 3. Frontend 표시
- 교훈 메시지 표시
- 최종 영상 재생

---

### Phase 6: 최종 영상 완성 (Optional)

#### 🎉 전체 영상 병합

**Backend**: `orchestrator.py` → `_finalize()`

##### 1. 5개 막 영상 병합
- `stage_1_final.mp4` ~ `stage_5_final.mp4`
- 크로스페이드로 연결
- 총 길이: 약 115초 (2분)

##### 2. 자막 통합
- SRT 파일 생성
- 각 막의 타이밍에 맞춰 자막 추가

##### 3. 최종 파일 생성
- `output/final/heungbu_complete.mp4`
- 전체 스토리 텍스트: `complete_story.txt`

---

## 🧠 핵심 AI 에이전트 역할

### 1. Guardian Agent
**파일**: `guardian_agent.py`

**역할**: 콘텐츠 검열 및 안전성 확보

**기능**:
- 부적절한 단어 필터링
- 폭력적 표현 순화
  - 예: "때리다" → "화난 표정으로 손을 흔들다"
- 연령대 적합성 검증

### 2. Scenario Agent
**파일**: `scenario_agent.py`

**역할**: 스토리 생성 및 확장

**기능**:
- 사용자 선택을 3컷 스토리로 확장
- 이전 스토리 히스토리 반영
- 글자수 제한 준수 (150-170자)

### 3. Art Director Agent
**파일**: `art_director_agent.py`

**역할**: 이미지 생성 프롬프트 작성

**기능**:
- 캐릭터 일관성 유지 (config 파일 참조)
- 장면 구도 및 조명 설정
- 이전 이미지 레퍼런스 활용

### 4. Motion Director Agent
**파일**: `motion_director_agent.py`

**역할**: 영상 모션 프롬프트 작성

**기능**:
- 카메라 움직임 설정
- 동적 요소 추가 (바람, 먼지 등)
- 폭력적 표현 필터링

### 5. Epilogue Director Agent
**파일**: `epilogue_director_agent.py`

**역할**: 교훈적 결말 생성

**기능**:
- 전체 스토리 분석
- 사용자 선택 패턴 파악
- 교훈 메시지 추출

---

## 🔧 핵심 매니저 모듈

### 1. ConfigManager
**파일**: `config_manager.py`

**기능**:
- API 키 관리 (Google, ElevenLabs)
- API 키 로테이션 (할당량 초과 시)
- 설정 파일 로드

### 2. StoryManager
**파일**: `story_manager.py`

**기능**:
- 스토리 생성 및 옵션 제공
- LLM 호출 및 재시도 로직
- 히스토리 관리

### 3. MediaGenerator
**파일**: `media_generator.py`

**기능**:
- 이미지 생성 (Gemini Image API)
- 영상 생성 (Veo 3.1 API)
- TTS 생성 (ElevenLabs API)
- 이미지 전처리 (리사이징, 포맷 변환)

### 4. MergeManager
**파일**: `merge_manager.py`

**기능**:
- 영상 병합 (FFmpeg)
- 오디오 합성
- 자막 추가

### 5. StateManager
**파일**: `state_manager.py`

**기능**:
- 진행 상황 저장/로드
- 세션 관리
- 복구 기능

---

## 🌐 API 엔드포인트

### POST `/api/story/start`
**요청**:
```json
{
  "tale_title": "흥부와 놀부",
  "art_style": "pixar"
}
```

**응답**:
```json
{
  "job_id": "job_1",
  "status": "started"
}
```

**기능**: 1막 생성 시작

---

### GET `/api/story/status/{job_id}`
**응답**:
```json
{
  "status": "stage1_complete",
  "progress": 100,
  "current_message": "1막 완료!",
  "video_url": "/stages/stage_1_final.mp4",
  "story_text": "옛날 옛날에..."
}
```

**기능**: 진행 상황 조회 (폴링용)

---

### GET `/api/story/options/{job_id}/{stage_no}`
**응답**:
```json
{
  "options": [
    "흥부가 제비를 발견했어요",
    "흥부가 신비한 박씨를 얻었어요"
  ]
}
```

**기능**: 다음 막 선택지 조회

---

### POST `/api/story/select/{job_id}/{stage_no}`
**요청**:
```json
{
  "choice": "1",
  "text": "흥부가 제비를 발견했어요"
}
```

**응답**:
```json
{
  "success": true,
  "status": "stage2_processing"
}
```

**기능**: 선택 제출 및 막 생성 시작

---

## 💾 데이터 흐름

### 스토리 히스토리 유지 메커니즘

```
1막 생성
  ↓
stage_stories = ["1막 스토리"]
  ↓
2막 선택지 요청 → cumulative_history = "1막 스토리"
  ↓
2막 생성 → stage_stories = ["1막", "2막"]
  ↓
3막 선택지 요청 → cumulative_history = "1막 스토리 2막 스토리"
  ↓
4막 생성 → stage_stories = ["1막", "2막", "3막", "4막"]
  ↓
5막 생성 → 전체 히스토리 분석
```

**핵심**: `OrchestratorAPI` 인스턴스를 `job_id`별로 메모리에 저장하여 히스토리 유지!

**코드 위치**: `web_endpoint/main.py` (line 27-28)
```python
# Job별 Orchestrator 인스턴스 저장 (스토리 히스토리 유지를 위해)
orchestrators = {}
```

---

## 🎨 캐릭터 일관성 유지

### 나노바나나 기법 (Image-to-Image Reference)

```
1막: 이미지 3개 생성 (레퍼런스 없음)
  ↓
2막: 1막 이미지 3개를 레퍼런스로 사용
  ↓
3막: 2막 이미지 3개를 레퍼런스로 사용
  ↓
4막: 3막 이미지 3개를 레퍼런스로 사용
  ↓
5막: 4막 이미지 3개를 레퍼런스로 사용
```

### 캐릭터 고정값 (config/default_config.yaml)

```yaml
characters:
  heungbu:
    full_prompt: "Pixar 3D style, adult male, head-to-body ratio 1:6, 
                  slim build, light blue worn-out hanbok with patches, 
                  gentle round eyes, kind warm smile, light brown straw hat"
  
  nolbu:
    full_prompt: "Pixar 3D style, adult male, head-to-body ratio 1:5, 
                  stocky chubby build, dark navy expensive silk hanbok, 
                  sharp angular eyes, stern frown, tall black traditional hat"
```

**모든 이미지 프롬프트에 캐릭터 정보 포함**

---

## 🔄 에러 처리 및 재시도

### API 키 로테이션
- Google API 키 3개, ElevenLabs API 키 3개
- 할당량 초과 시 자동으로 다음 키로 전환
- 모든 키 소진 시 에러 반환

**코드 위치**: `config_manager.py`
```python
def rotate_google_key(self):
    """Google API 키 로테이션"""
    self.current_google_key_index = (self.current_google_key_index + 1) % len(self.google_api_keys)
```

### 재시도 로직
- 최대 3회 재시도
- Exponential backoff (2초, 4초, 8초)
- 429, 500, 503 에러 코드에 대해 재시도

**설정**: `config/default_config.yaml`
```yaml
retry:
  max_attempts: 3
  backoff: "exponential"
  base_delay: 2
  retryable_codes: [429, 500, 503]
```

### 세션 복구
- `localStorage`에 진행 상황 저장
- 새로고침 시 상태 복원
- 404 에러 시 세션 초기화

**코드 위치**: `EditStoryPage.tsx` (line 152-171)
```typescript
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const state = JSON.parse(saved)
    setCurrentStage(state.currentStage || 0)
    setSelections(state.selections || {})
  }
}, [])
```

---

## 📊 타임라인 예시

```
00:00 - 사용자가 동화 선택
00:05 - 그림체 선택
00:10 - 1막 생성 시작 (백엔드)
01:30 - 1막 영상 완성 (23초)
01:35 - 사용자가 1막 영상 시청
02:00 - 2막 선택지 로드 (AI 생성)
02:05 - 사용자가 선택
02:10 - 2막 생성 시작
03:30 - 2막 영상 완성
03:35 - 3막 선택지 로드
03:40 - 사용자가 선택
03:45 - 3막 생성 시작
05:05 - 3막 영상 완성
05:10 - 4막 선택지 로드
05:15 - 사용자가 선택
05:20 - 4막 생성 시작
06:40 - 4막 영상 완성
06:45 - 5막 자동 생성 시작
08:05 - 5막 영상 완성
08:10 - 최종 영상 병합 (선택사항)
08:40 - 완성!
```

**총 소요 시간**: 약 8-15분 (API 속도에 따라 변동)

---

## 🎯 주요 특징

### 1. 인터랙티브
- 사용자가 각 막마다 스토리 선택
- 3가지 선택 옵션 (AI 2개 + 직접 쓰기)

### 2. AI 기반
- 5개의 전문 AI 에이전트 협업
- Gemini 2.5 Flash (텍스트/이미지)
- Veo 3.1 (영상)
- ElevenLabs (TTS)

### 3. 일관성
- 캐릭터 외모 유지 (나노바나나 + 고정값)
- 스토리 맥락 유지 (히스토리 누적)

### 4. 안전성
- Guardian Agent의 콘텐츠 필터링
- 폭력적 표현 순화
- 연령대 적합성 검증

### 5. 확장성
- 다른 동화로 쉽게 확장 가능
- YAML 설정 파일로 관리

### 6. 복구 가능
- 세션 저장 및 복원 기능
- 새로고침 시 상태 유지

---

## 🛠️ 기술 스택

### Frontend
- **React** + TypeScript
- **Vite** (빌드 도구)
- **CSS** (스타일링)

### Backend
- **Python 3.x**
- **FastAPI** (웹 프레임워크)
- **FFmpeg** (영상 처리)

### AI/ML
- **Google Gemini 2.5 Flash** (텍스트/이미지)
- **Google Veo 3.1** (영상 생성)
- **ElevenLabs** (TTS)

### 데이터 저장
- **JSON** (상태 관리)
- **YAML** (설정 파일)
- **localStorage** (Frontend 세션)

---

## 📝 주요 파일 설명

### Backend

#### `orchestrator.py`
- CLI용 오케스트레이터
- 5막 순차 실행
- 사용자 입력 처리 (콘솔)

#### `orchestrator_api.py`
- API용 래퍼
- 웹 요청 처리
- 진행 상황 콜백 지원

#### `web_endpoint/main.py`
- FastAPI 서버
- REST API 엔드포인트
- Job 관리 및 폴링

#### `config/default_config.yaml`
- 전체 설정 파일
- 캐릭터 고정값
- TTS/영상 설정

### Frontend

#### `EditStoryPage.tsx`
- 메인 스토리 편집 페이지
- 3가지 화면 모드:
  1. 발단 (자동 재생)
  2. 선택지 (2~4막)
  3. 결과 (영상 재생)

#### `App.tsx`
- 메인 앱 컴포넌트
- 라우팅 및 상태 관리

---

## 🚀 실행 방법

### Backend 실행
```bash
cd backend/web_endpoint
python main.py
# 서버: http://localhost:8000
```

### Frontend 실행
```bash
cd frontend
npm install
npm run dev
# 서버: http://localhost:5173
```

---

## 📌 중요 포인트

### 1. 히스토리 유지가 핵심
- `OrchestratorAPI` 인스턴스를 `job_id`별로 메모리에 저장
- 각 막 생성 시 이전 스토리 누적 전달

### 2. 캐릭터 일관성
- 나노바나나 기법 (이전 이미지 레퍼런스)
- 캐릭터 고정값 (YAML 설정)

### 3. 콘텐츠 안전성
- Guardian Agent의 필터링
- 폭력적 표현 순화 매핑

### 4. 에러 처리
- API 키 로테이션
- 재시도 로직
- 세션 복구

---

## 🎉 결론

이 시스템은 **사용자 경험(UX)**과 **AI 기술**을 결합하여, 아이들이 자신만의 동화를 만들 수 있는 혁신적인 플랫폼입니다!

**핵심 가치**:
- 🎨 창의성: 사용자가 스토리를 직접 선택
- 🤖 AI 협업: 5개의 전문 에이전트가 협력
- 🎬 고품질: Gemini + Veo + ElevenLabs
- 👶 안전성: 연령대 적합 콘텐츠
- 🔄 일관성: 캐릭터 및 스토리 맥락 유지

---

**작성일**: 2025-12-03  
**버전**: 1.0
