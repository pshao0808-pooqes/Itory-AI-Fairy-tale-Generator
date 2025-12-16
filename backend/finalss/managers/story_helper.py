# ==================================================================================
# managers/story_helper.py - 새로운 5막 워크플로우 스토리 헬퍼 (수정)
# ==================================================================================

from typing import List, Dict
import json
from google.genai import types


class StoryHelper:
    """
    새로운 5막 워크플로우를 위한 스토리 생성 헬퍼 클래스
    - 글자수 제한 (20초 TTS 기준)
    - 스토리 3분할
    - 필터링 순화
    """
    
    def __init__(self, config):
        self.config = config
    
    def generate_stage_story(self, stage_no: int, history: str = "") -> str:
        """
        막 전체 스토리 생성 (글자수 제한 적용)
        
        Args:
            stage_no: 막 번호 (1~5)
            history: 이전 막들의 스토리
            
        Returns:
            생성된 스토리 텍스트 (약 250자)
        """
        stage_info = self.config.get_stage_info(stage_no)
        original_ref = self.config.get_original_ref(stage_no)
        char_limits = self.config.get_tts_char_limits()
        
        prompt = f"""
You are creating a Korean folktale story for "Heungbu and Nolbu".

STAGE: {stage_info.get('name', '')} ({stage_info.get('description', '')})
ORIGINAL REFERENCE: {original_ref}
PREVIOUS STORY: {history if history else "없음 (첫 번째 막)"}

**CRITICAL CHARACTER LIMIT: Write EXACTLY {char_limits['target']} characters (±30 characters).**
- Minimum: {char_limits['min']} characters
- Maximum: {char_limits['max']} characters
- This is for a 20-second narration.

**STORY REQUIREMENTS:**
1. Focus on Heungbu's actions and emotions
2. Fit the {stage_info.get('name', '')} stage structure
3. Write in Korean only
4. Include brief dialogue (1-2 lines max)
5. Use POSITIVE, NEUTRAL tone - avoid words like "울다", "고통", "슬픔"

**CONTENT GUIDELINES (to avoid video filtering):**
- Instead of "쫓아내다" → use "집을 떠나게 하다"
- Instead of "때리다" → use "화를 내다"
- Instead of "부러지다" → use "다치다"
- Focus on actions and situations, not suffering

Output ONLY the story text in Korean. No JSON, no formatting, no character count.
"""
        
        while True:
            try:
                client = self.config.get_google_client()
                response = client.models.generate_content(
                    model=self.config.get_model("text"),
                    contents=[prompt]
                )
                story = response.text.strip()
                
                # 글자수 체크
                if len(story) < char_limits['min']:
                    print(f"   ⚠️ 스토리가 너무 짧음 ({len(story)}자). 재생성 시도...")
                    return self._regenerate_longer(stage_no, story, char_limits)
                elif len(story) > char_limits['max']:
                    print(f"   ⚠️ 스토리가 너무 김 ({len(story)}자). 축약 시도...")
                    return self._truncate_story(story, char_limits['target'])
                
                print(f"   ✅ 스토리 생성 완료 ({len(story)}자)")
                return story
                
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ 스토리 생성 오류: {error_str}")
                
                is_quota_error = (
                    "429" in error_str or 
                    "RESOURCE_EXHAUSTED" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    if self.config.rotate_google_key():
                        continue
                
                print(f"   ❌ 기본값 사용")
                return original_ref[:char_limits['target']]
    
    def _regenerate_longer(self, stage_no: int, short_story: str, char_limits: Dict) -> str:
        """짧은 스토리를 확장"""
        prompt = f"""
다음 스토리를 {char_limits['target']}자로 확장해주세요.
더 자세한 묘사와 대화를 추가하세요.

원본: {short_story}

{char_limits['target']}자 내외로 작성하세요. 한국어로만 출력하세요.
"""
        while True:
            try:
                client = self.config.get_google_client()
                response = client.models.generate_content(
                    model=self.config.get_model("text"),
                    contents=[prompt]
                )
                return response.text.strip()
            except Exception as e:
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    if self.config.rotate_google_key():
                        continue
                return short_story
    
    def _truncate_story(self, story: str, target: int) -> str:
        """긴 스토리를 축약"""
        if len(story) <= target:
            return story
        
        # 문장 단위로 자르기
        sentences = story.replace('。', '.').split('.')
        result = ""
        for sent in sentences:
            if len(result) + len(sent) + 1 <= target:
                result += sent + "."
            else:
                break
        
        return result.strip() if result else story[:target]
    
    def split_story_into_scenes(self, story_text: str) -> List[str]:
        """
        스토리를 3개 장면으로 분할
        LLM이 행동/상황만 생성하도록 제한
        """
        prompt = f"""
Split the following Korean story into exactly 3 scenes for video generation.

STORY: {story_text}

**CRITICAL RULES FOR EACH SCENE:**
1. Each scene should be 50-80 characters
2. Describe ONLY actions, poses, and situations
3. DO NOT describe character appearance (clothes, body, face) - this is handled separately
4. Use NEUTRAL, POSITIVE language

**FORBIDDEN in scene descriptions:**
- Character clothing descriptions (한복, 모자, etc.)
- Body descriptions (키가 크다, 뚱뚱하다, etc.)
- Emotional suffering words (울다, 고통, 슬픔, 절망)
- Violence words (때리다, 쫓아내다, 부러뜨리다)

**GOOD examples:**
- "흥부가 가족들과 함께 작은 집 앞에 서 있다"
- "놀부가 문 앞에서 손을 흔들며 화난 표정을 짓는다"
- "제비가 흥부의 손 위에 앉아 있다"

**BAD examples (DO NOT USE):**
- "파란 한복을 입은 흥부가..." (clothes description)
- "슬프게 울면서..." (emotional suffering)
- "놀부에게 맞고..." (violence)

Output JSON format: {{"scenes": ["장면1 (행동/상황만)", "장면2 (행동/상황만)", "장면3 (행동/상황만)"]}}
"""
        
        while True:
            try:
                client = self.config.get_google_client()
                response = client.models.generate_content(
                    model=self.config.get_model("text"),
                    contents=[prompt],
                    config=types.GenerateContentConfig(response_mime_type="application/json")
                )
                data = json.loads(response.text)
                
                if "scenes" in data and len(data["scenes"]) == 3:
                    # 추가 필터링: 금지 단어 제거
                    filtered_scenes = [self._sanitize_scene(s) for s in data["scenes"]]
                    print("   ✅ 장면 분할 완료")
                    return filtered_scenes
                else:
                    print("   ⚠️ LLM 응답 형식 오류, 단순 분할 사용")
                    return self._simple_split(story_text)
                    
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ 장면 분할 오류: {error_str}")
                
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    if self.config.rotate_google_key():
                        continue
                
                return self._simple_split(story_text)
    
    def _sanitize_scene(self, scene_text: str) -> str:
        """장면 텍스트에서 금지 표현 순화"""
        sanitize_map = self.config.get_sanitize_mappings()
        
        result = scene_text
        for bad_word, good_word in sanitize_map.items():
            result = result.replace(bad_word, good_word)
        
        return result
    
    def _simple_split(self, text: str) -> List[str]:
        """간단한 텍스트 분할 (폴백)"""
        sentences = text.split('. ')
        if len(sentences) >= 3:
            third = len(sentences) // 3
            return [
                '. '.join(sentences[:third]) + '.',
                '. '.join(sentences[third:third*2]) + '.',
                '. '.join(sentences[third*2:]) + '.'
            ]
        else:
            while len(sentences) < 3:
                sentences.append(sentences[-1] if sentences else "장면")
            return sentences[:3]
    
    def generate_video_motion(self, scene_text: str, main_character: str = "Heungbu") -> str:
        """
        영상용 모션 프롬프트 생성 (필터링 우회)
        """
        blocked_words = self.config.get_blocked_words()
        sanitize_map = self.config.get_sanitize_mappings()
        
        prompt = f"""
Convert this Korean scene description to an English video motion prompt.

SCENE: {scene_text}
MAIN CHARACTER: {main_character}

**RULES:**
1. Describe ONLY physical movements and actions
2. Use slow, gentle, natural movements
3. Keep it G-rated and family-friendly
4. NO emotional suffering, NO violence

**FORBIDDEN WORDS (will cause filtering):**
{', '.join(blocked_words)}

**GOOD motion descriptions:**
- "slowly walking forward with a gentle smile"
- "carefully holding a small bird in both hands"
- "standing proudly with arms crossed"
- "pointing towards the door with stern expression"

Output ONLY the English motion description (1-2 sentences).
"""
        
        while True:
            try:
                client = self.config.get_google_client()
                response = client.models.generate_content(
                    model=self.config.get_model("text"),
                    contents=[prompt]
                )
                motion = response.text.strip()
                
                # 금지 단어 체크
                motion_lower = motion.lower()
                for word in blocked_words:
                    if word.lower() in motion_lower:
                        print(f"   ⚠️ 금지 단어 감지: {word}, 기본값 사용")
                        return f"{main_character} standing calmly with a gentle expression"
                
                return motion
                
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ 모션 생성 오류: {error_str}")
                
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    if self.config.rotate_google_key():
                        continue
                
                return f"{main_character} standing calmly with a gentle expression"