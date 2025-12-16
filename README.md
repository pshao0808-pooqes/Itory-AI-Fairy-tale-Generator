# 🎬 AI 동화 생성 시스템 (AI Fairy Tale Generator)

> **AI 에이전트 협업을 통한 인터랙티브 동화 영상 생성 플랫폼**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3%2B-61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2%2B-3178C6)](https://www.typescriptlang.org/)

## 📖 프로젝트 소개

이 프로젝트는 **5개의 전문 AI 에이전트**가 협업하여 사용자 맞춤형 인터랙티브 동화 영상을 생성하는 시스템입니다. 사용자는 각 막(Act)마다 스토리를 선택하며 자신만의 동화를 만들어 나갈 수 있습니다.

### ✨ 주요 특징

- 🤖 **5개의 전문 AI 에이전트 협업**
  - Guardian Agent (콘텐츠 안전 검증)
  - Scenario Agent (스토리 생성)
  - Art Director Agent (이미지 생성)
  - Motion Director Agent (영상 생성)
  - Epilogue Director Agent (결말 생성)

- 🎨 **캐릭터 일관성 유지**
  - 나노바나나(Nanobanana) 기법 활용
  - 이전 이미지를 레퍼런스로 사용하여 캐릭터 외모 일관성 보장

- 🎯 **인터랙티브 스토리텔링**
  - 각 막마다 2개의 AI 생성 선택지 + 직접 작성 옵션
  - 사용자의 선택에 따라 스토리가 분기

- 🛡️ **안전한 콘텐츠**
  - Guardian Agent의 실시간 콘텐츠 필터링
  - 연령대에 적합한 표현으로 자동 순화

- 🎬 **고품질 멀티미디어**
  - Google Gemini 2.5 Flash (텍스트/이미지 생성)
  - Google Veo 3.1 (영상 생성)
  - ElevenLabs (한국어 TTS)

## 🏗️ 시스템 구조

### 프로젝트 구조
```
workspace_origin/
├── backend/
│   ├── finalss/                    # 메인 백엔드 로직
│   │   ├── agents/                 # AI 에이전트들
│   │   │   ├── guardian_agent.py
│   │   │   ├── scenario_agent.py
│   │   │   ├── art_director_agent.py
│   │   │   ├── motion_director_agent.py
│   │   │   └── epilogue_director_agent.py
│   │   ├── managers/               # 핵심 관리 모듈
│   │   │   ├── config_manager.py
│   │   │   ├── story_manager.py
│   │   │   ├── media_generator.py
│   │   │   ├── merge_manager.py
│   │   │   └── state_manager.py
│   │   ├── config/                 # 설정 파일
│   │   │   └── default_config.yaml
│   │   ├── orchestrator.py         # CLI 오케스트레이터
│   │   ├── orchestrator_api.py     # API 래퍼
│   │   ├── requirements.txt
│   │   └── .env                    # API 키 설정
│   └── web_endpoint/               # FastAPI 서버
│       └── main.py
├── frontend/                       # React 프론트엔드
│   ├── src/
│   │   ├── pages/
│   │   │   └── story/
│   │   │       ├── FairyTaleSelectionPage.tsx
│   │   │       ├── ArtStyleSelectionPage.tsx
│   │   │       ├── EditStoryPage.tsx
│   │   │       └── VideoPage.tsx
│   │   └── App.tsx
│   └── package.json
└── WORKFLOW.md                     # 상세 워크플로우 문서
```

### 기술 스택

#### Frontend
- **React 18.3+** - UI 프레임워크
- **TypeScript 5.2+** - 타입 안정성
- **Vite** - 빌드 도구
- **Lucide React** - 아이콘

#### Backend
- **Python 3.9+**
- **FastAPI** - REST API 서버
- **FFmpeg** - 영상/오디오 처리
- **Google Gemini 2.5 Flash** - 텍스트/이미지 생성
- **Google Veo 3.1** - 영상 생성
- **ElevenLabs** - TTS (Text-to-Speech)

#### 데이터 관리
- **YAML** - 설정 파일
- **JSON** - 상태 관리
- **localStorage** - 프론트엔드 세션

## 🚀 설치 및 실행 방법

### 사전 요구사항

1. **Python 3.9 이상** 설치
2. **Node.js 18 이상** 및 npm 설치
3. **FFmpeg** 설치
   - Windows: https://ffmpeg.org/download.html
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`

4. **API 키 준비**
   - Google Gemini API Key
   - Google Veo API Key (영상 생성)
   - ElevenLabs API Key (TTS)

### 백엔드 설정

1. **의존성 설치**
```bash
cd backend/finalss
pip install -r requirements.txt
```

2. **환경 변수 설정**

`.env` 파일을 생성하고 API 키를 입력합니다:

```env
# Google Gemini API Keys (최소 1개, 최대 3개 권장)
GOOGLE_API_KEY_1=your_gemini_api_key_1
GOOGLE_API_KEY_2=your_gemini_api_key_2
GOOGLE_API_KEY_3=your_gemini_api_key_3

# ElevenLabs TTS API Keys (최소 1개, 최대 3개 권장)
ELEVENLABS_API_KEY_1=your_elevenlabs_key_1
ELEVENLABS_API_KEY_2=your_elevenlabs_key_2
ELEVENLABS_API_KEY_3=your_elevenlabs_key_3
```

> **참고**: API 키를 여러 개 설정하면 할당량 초과 시 자동으로 로테이션됩니다.

3. **백엔드 서버 실행**
```bash
cd backend/web_endpoint
python main.py
```

서버가 `http://localhost:8000` 에서 실행됩니다.

### 프론트엔드 설정

1. **의존성 설치**
```bash
cd frontend
npm install
```

2. **개발 서버 실행**
```bash
npm run dev
```

프론트엔드가 `http://localhost:5173` 에서 실행됩니다.

### 프로덕션 빌드

```bash
cd frontend
npm run build
```

빌드된 파일은 `frontend/dist` 폴더에 생성됩니다.

## 💡 사용 방법

### 1. 동화 선택
- 웹 페이지에서 원하는 동화를 선택합니다 (예: 흥부와 놀부)

### 2. 그림체 선택
다음 중 하나의 그림체를 선택합니다:
- `realistic` - 실사 스타일
- `cartoon_2d` - 2D 애니메이션
- `cartoon_3d` - 3D 카툰
- `pixar` - 픽사 스타일
- `watercolor` - 수채화

### 3. 인터랙티브 스토리 생성

#### 1막 (발단) - 자동 생성
- 시스템이 자동으로 스토리, 이미지, 영상을 생성합니다
- 약 1-2분 소요

#### 2막 (전개) ~ 4막 (위기) - 사용자 선택
각 막마다:
1. AI가 생성한 2개의 선택지 제시
2. 또는 사용자가 직접 스토리 작성 가능
3. 선택 후 해당 막의 영상 자동 생성 (약 1-2분)

#### 5막 (결말) - 자동 생성
- 이전 선택들을 분석하여 교훈적인 결말 자동 생성
- 교훈 메시지와 함께 영상 제공

### 4. 최종 영상
- 모든 막이 완성되면 전체 영상을 순차적으로 재생
- (선택사항) 5개 막을 하나로 병합한 완전한 동화 영상 생성

## 🔄 주요 워크플로우

```
사용자 설정
   ↓
1막 자동 생성 (발단)
   ↓
2막 선택 → 생성 (전개)
   ↓
3막 선택 → 생성 (위기)
   ↓
4막 선택 → 생성 (절정)
   ↓
5막 자동 생성 (결말 + 교훈)
   ↓
최종 영상 완성
```

각 막 생성 프로세스:
1. **스토리 생성** (Gemini 2.5 Flash)
2. **3컷 분할** (8초씩 3장면)
3. **이미지 3개 생성** (Gemini Image API + 나노바나나 기법)
4. **영상 3개 생성** (Veo 3.1)
5. **영상 병합** (FFmpeg)
6. **TTS 생성** (ElevenLabs)
7. **영상+오디오 합성** (FFmpeg)

**총 소요 시간**: 약 8-15분 (API 응답 속도에 따라 변동)

## 🧠 AI 에이전트 상세

### 1. Guardian Agent
- **역할**: 콘텐츠 안전성 검증
- **기능**:
  - 부적절한 단어 필터링
  - 폭력적 표현 순화 (예: "때리다" → "화난 표정으로 손을 흔들다")
  - 연령대 적합성 확인

### 2. Scenario Agent
- **역할**: 스토리 생성 및 확장
- **기능**:
  - 사용자 선택을 3컷 스토리로 확장
  - 이전 스토리 맥락 유지
  - 글자수 제한 준수 (150-170자)

### 3. Art Director Agent
- **역할**: 이미지 생성 프롬프트 작성
- **기능**:
  - 캐릭터 일관성 유지
  - 장면 구도 및 조명 설정
  - 이전 이미지 레퍼런스 활용

### 4. Motion Director Agent
- **역할**: 영상 모션 프롬프트 작성
- **기능**:
  - 카메라 무빙 설정
  - 동적 요소 추가 (바람, 먼지 등)
  - 8초 영상에 최적화된 모션

### 5. Epilogue Director Agent
- **역할**: 교훈적 결말 생성
- **기능**:
  - 전체 스토리 분석 (1~4막)
  - 사용자 선택 패턴 파악
  - 교훈 메시지 추출

## 🎨 캐릭터 일관성 메커니즘

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

### 캐릭터 고정 프롬프트
`config/default_config.yaml` 파일에서 캐릭터의 외모를 고정값으로 설정:

```yaml
characters:
  heungbu:
    full_prompt: "Pixar 3D style, adult male, head-to-body ratio 1:6, slim build, light blue worn-out hanbok with patches, gentle round eyes, kind warm smile, light brown straw hat"
  
  nolbu:
    full_prompt: "Pixar 3D style, adult male, head-to-body ratio 1:5, stocky chubby build, dark navy expensive silk hanbok, sharp angular eyes, stern frown, tall black traditional hat"
```

## 🔧 API 엔드포인트

### POST `/api/story/start`
스토리 생성 시작

**요청**:
```json
{
  "tale_title": "흥부와 놀부",
  "art_style": "pixar",
  "user_id": "user123",
  "kid_id": "kid456",
  "tale_id": "tale789"
}
```

**응답**:
```json
{
  "job_id": "job_abc123",
  "status": "started"
}
```

### GET `/api/story/status/{job_id}`
진행 상황 조회 (폴링용)

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

### GET `/api/story/options/{job_id}/{stage_no}`
다음 막 선택지 조회

**응답**:
```json
{
  "options": [
    "흥부가 제비를 발견했어요",
    "흥부가 신비한 박씨를 얻었어요"
  ]
}
```

### POST `/api/story/select/{job_id}/{stage_no}`
선택 제출 및 막 생성 시작

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

## 🔐 보안 및 안전성

### API 키 로테이션
- 각 API마다 최대 3개의 키 설정 가능
- 할당량 초과 시 자동으로 다음 키로 전환
- 모든 키 소진 시 적절한 에러 반환

### 재시도 로직
- 최대 3회 재시도
- Exponential backoff (2초, 4초, 8초)
- 429, 500, 503 에러 코드에 대해 자동 재시도

### 세션 복구
- `localStorage`에 진행 상황 자동 저장
- 새로고침 시 상태 복원
- 404 에러 시 세션 초기화

## 📝 설정 파일

주요 설정은 `backend/finalss/config/default_config.yaml`에서 관리됩니다:

```yaml
# TTS 설정
tts:
  voice_id: "21m00Tcm4TlvDq8ikWAM"  # ElevenLabs voice ID
  model_id: "eleven_multilingual_v2"
  stability: 0.5
  similarity_boost: 0.75

# 영상 설정
video:
  scene_duration: 8  # 각 장면 길이 (초)
  crossfade_duration: 0.5  # 크로스페이드 (초)

# 재시도 설정
retry:
  max_attempts: 3
  backoff: "exponential"
  base_delay: 2
```

## 🐛 트러블슈팅

### FFmpeg 관련 오류
```
Error: ffmpeg not found
```
**해결책**: FFmpeg를 시스템에 설치하고 PATH에 추가하세요.

### API 할당량 초과
```
Error: Quota exceeded
```
**해결책**: `.env` 파일에 추가 API 키를 설정하세요.

### 포트 충돌
```
Error: Port 8000 already in use
```
**해결책**: 
```bash
# 다른 포트로 실행 (main.py 수정)
uvicorn.run(app, host="0.0.0.0", port=8001)
```

## 📚 추가 문서

- [WORKFLOW.md](./WORKFLOW.md) - 전체 워크플로우 상세 문서
- [backend/finalss/config/](./backend/finalss/config/) - 설정 파일 예시

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👥 개발팀

- **2nd Team** - AI 동화 생성 시스템 개발

## 🙏 감사의 말

- Google Gemini API
- Google Veo API
- ElevenLabs API
- FFmpeg Project

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 Issue를 생성해주세요.

---

**Made with ❤️ by 2nd Team**
