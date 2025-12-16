# ==================================================================================
# agents/scenario_agent.py - 3컷 스토리 생성 에이전트
# ==================================================================================

from typing import Dict


class ScenarioAgent:
    """
    3컷 분할 작가
    
    역할:
    - 선택된 의도를 24초 분량 스토리로 확장
    - 3개 장면으로 자동 분할
    - 다음 선택지 추천 (선택적)
    """
    
    def __init__(self, config):
        self.config = config
    
    def generate_3_scene_story(
        self,
        selected_text: str,
        stage_no: int,
        history: str
    ) -> Dict[str, str]:
        """
        선택된 옵션을 3개 장면으로 분할된 스토리로 확장
        
        Args:
            selected_text: 선택된 옵션 또는 사용자 입력
            stage_no: 막 번호
            history: 이전 스토리
        
        Returns:
            {
                "scene_1_text": "장면 1 텍스트",
                "scene_2_text": "장면 2 텍스트",
                "scene_3_text": "장면 3 텍스트",
                "full_script": "전체 스크립트 (TTS용)"
            }
        """
        stage_info = self.config.get_stage_info(stage_no)
        original_ref = self.config.get_original_ref(stage_no)
        
        # TTS 글자수 제한
        tts_config = self.config._config.get("tts", {})
        target_chars = tts_config.get("target_chars", 250)
        min_chars = tts_config.get("min_chars", 200)
        max_chars = tts_config.get("max_chars", 300)
        
        # 이전 막 컨텍스트 표시
        previous_context = f"""\n**이전 막들의 스토리 (반드시 이어서 작성):**\n{history}\n""" if history else "**이것은 첫 번째 막입니다.**"
        
        prompt = f"""
You are a Scenario Agent for "Heungbu and Nolbu" fairytale.

SELECTED OPTION: {selected_text}
STAGE: {stage_info.get('name', '')} ({stage_info.get('description', '')})
ORIGINAL REFERENCE: {original_ref}

{previous_context}

***CRITICAL CONTINUITY REQUIREMENT***:
- This story MUST continue naturally from the previous story shown above
- DO NOT repeat events that already happened
- Build upon the established narrative and character development
- Ensure logical progression from the previous scenes

**YOUR MISSION:**
Expand the selected option into a complete story AND divide it into exactly 3 visual scenes.

**CRITICAL REQUIREMENTS:**

1. **Total Length:** {target_chars} characters (±30)
   - Minimum: {min_chars} characters
   - Maximum: {max_chars} characters
   - This is for 20-second narration

2. **3-Scene Division:**
   - Scene 1: 50-80 characters (Opening/Setup)
   - Scene 2: 50-80 characters (Action/Development)
   - Scene 3: 50-80 characters (Result/Transition)

3. **Scene Content Rules:**
   - Describe ONLY actions, poses, and situations
   - NO character appearance descriptions (handled separately)
   - Use POSITIVE, NEUTRAL tone
   - Avoid: 울다, 고통, 슬픔, 때리다, 쫓아내다

4. **Story Requirements:**
   - Incorporate the selected option's main idea
   - **Continue naturally from the previous story**
   - Fit the {stage_info.get('name', '')} stage
   - Written in Korean only
   - Include brief dialogue (1-2 lines max)

**OUTPUT FORMAT (JSON):**
{{
  "scene_1_text": "장면 1 텍스트 (50-80자)",
  "scene_2_text": "장면 2 텍스트 (50-80자)",
  "scene_3_text": "장면 3 텍스트 (50-80자)",
  "full_script": "전체 스토리 병합본 ({target_chars}자, TTS용)"
}}

**Example:**
{{
  "scene_1_text": "흥부가 가족들과 함께 작은 초가집 앞에 서 있다",
  "scene_2_text": "놀부가 문 앞에서 손을 흔들며 화난 표정을 짓는다",
  "scene_3_text": "흥부 가족이 짐을 들고 천천히 걸어간다",
  "full_script": "옛날 옛날에 흥부와 놀부 형제가 살았어요..."
}}
"""
        
        while True:
            try:
                import json
                from google.genai import types
                
                client = self.config.get_google_client()
                response = client.models.generate_content(
                    model=self.config.get_model("text"),
                    contents=[prompt],
                    config=types.GenerateContentConfig(response_mime_type="application/json")
                )
                
                data = json.loads(response.text)
                
                # 검증
                required_keys = ["scene_1_text", "scene_2_text", "scene_3_text", "full_script"]
                if not all(key in data for key in required_keys):
                    raise ValueError("필수 키 누락")
                
                # 글자수 체크
                full_len = len(data["full_script"])
                if full_len < min_chars or full_len > max_chars:
                    print(f"   ⚠️ Scenario: 글자수 {full_len}자 (목표: {target_chars}자)")
                
                print(f"   ✅ Scenario: 3컷 스토리 생성 완료 ({full_len}자)")
                return data
                
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ Scenario 오류: {error_str}")
                
                # 429 RESOURCE_EXHAUSTED 또는 quota 오류 감지
                is_quota_error = (
                    "429" in error_str or 
                    "RESOURCE_EXHAUSTED" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    print(f"   🔄 Scenario: 할당량 초과, API 키 교체 시도...")
                    if self.config.rotate_google_key():
                        print(f"   ✅ Scenario: 다음 API 키로 재시도")
                        continue
                    else:
                        print(f"   ❌ Scenario: 모든 API 키 소진, 기본 분할 사용")
                        # 폴백: 단순 분할
                        return {
                            "scene_1_text": selected_text[:80],
                            "scene_2_text": selected_text[80:160] if len(selected_text) > 80 else selected_text,
                            "scene_3_text": selected_text[160:240] if len(selected_text) > 160 else selected_text,
                            "full_script": selected_text[:target_chars]
                        }
                else:
                    # 할당량 오류가 아닌 경우 폴백
                    print(f"   ❌ Scenario: 복구 불가능한 오류, 기본 분할 사용")
                    return {
                        "scene_1_text": selected_text[:80],
                        "scene_2_text": selected_text[80:160] if len(selected_text) > 80 else selected_text,
                        "scene_3_text": selected_text[160:240] if len(selected_text) > 160 else selected_text,
                        "full_script": selected_text[:target_chars]
                    }
    
    def expand_story(self, current_text: str, target_chars: int, stage_no: int) -> str:
        """스토리를 목표 글자수까지 확장"""
        current_chars = len(current_text)
        additional_chars = target_chars - current_chars
        
        prompt = f"""
당신은 조선시대 배경의 동화 작가입니다.

현재 스토리 ({current_chars}자):
{current_text}

요구사항:
- 위 스토리를 {target_chars}자 정도로 확장하세요 (약 {additional_chars}자 추가)
- 기존 내용의 핵심은 유지하되, 디테일과 묘사를 추가하세요
- 자연스럽게 이어지도록 작성하세요
- 조선시대 배경에 맞는 표현을 사용하세요

확장된 스토리만 출력하세요:
"""
        
        while True:
            try:
                client = self.config.get_google_client()
                response = client.models.generate_content(
                    model=self.config.get_model("text"),
                    contents=prompt
                )
                
                expanded = response.text.strip()
                print(f"   📝 확장: {current_chars}자 → {len(expanded)}자")
                return expanded
                
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ 확장 실패: {error_str}")
                
                is_quota_error = (
                    "429" in error_str or 
                    "RESOURCE_EXHAUSTED" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    if self.config.rotate_google_key():
                        continue
                
                print(f"   ⚠️ 원본 사용")
                return current_text
    
    def summarize_story(self, current_text: str, target_chars: int, stage_no: int) -> str:
        """스토리를 목표 글자수까지 축약"""
        current_chars = len(current_text)
        reduce_chars = current_chars - target_chars
        
        prompt = f"""
당신은 조선시대 배경의 동화 작가입니다.

현재 스토리 ({current_chars}자):
{current_text}

요구사항:
- 위 스토리를 {target_chars}자 정도로 축약하세요 (약 {reduce_chars}자 제거)
- 핵심 내용과 스토리 흐름은 반드시 유지하세요
- 불필요한 수식어나 부연 설명만 제거하세요
- 자연스럽게 읽히도록 작성하세요

축약된 스토리만 출력하세요:
"""
        
        while True:
            try:
                client = self.config.get_google_client()
                response = client.models.generate_content(
                    model=self.config.get_model("text"),
                    contents=prompt
                )
                
                summarized = response.text.strip()
                print(f"   📝 축약: {current_chars}자 → {len(summarized)}자")
                return summarized
                
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ 축약 실패: {error_str}")
                
                is_quota_error = (
                    "429" in error_str or 
                    "RESOURCE_EXHAUSTED" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    if self.config.rotate_google_key():
                        continue
                
                print(f"   ⚠️ 원본 사용")
                return current_text