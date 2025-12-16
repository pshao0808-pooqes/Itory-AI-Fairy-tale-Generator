# ==================================================================================
# agents/epilogue_director_agent.py - 5막 교훈 생성 에이전트
# ==================================================================================

from typing import List, Dict


class EpilogueDirectorAgent:
    """
    에필로그 디렉터
    
    역할:
    - 1~4막 스토리 분석
    - 사용자 선택 기반 맞춤형 교훈 도출
    - 교육적 가치 검증
    """
    
    def __init__(self, config):
        self.config = config
    
    def generate_ending(
        self,
        all_stories: List[str],
        user_choices: List[str] = None
    ) -> Dict[str, str]:
        """
        1~4막 스토리를 분석하여 교훈적인 결말 생성
        
        Args:
            all_stories: 1~4막 스토리 리스트
            user_choices: 사용자가 선택한 옵션 리스트 (선택적)
        
        Returns:
            {
                "ending_story": "결말 스토리",
                "moral_lesson": "교훈",
                "user_journey_summary": "사용자 여정 요약"
            }
        """
        # 1~4막 스토리 병합
        story_summary = "\n\n".join([
            f"[{i+1}막] {story}"
            for i, story in enumerate(all_stories[:4])
        ])
        
        # 원작 5막 참조
        original_ref = self.config.get_original_ref(5)
        
        # TTS 글자수 제한
        tts_config = self.config._config.get("tts", {})
        target_chars = tts_config.get("target_chars", 250)
        
        prompt = f"""
You are an Epilogue Director for "Heungbu and Nolbu" fairytale.

**STORY SO FAR (Acts 1-4):**
{story_summary}

**ORIGINAL REFERENCE:**
{original_ref}

**MISSION:**
Create a meaningful, educational ending for Act 5 that:
1. Concludes the story from Acts 1-4
2. Delivers a clear moral lesson
3. Positive, uplifting tone

**REQUIREMENTS:**

1. **Length:** {target_chars} characters (±30) for 20-second narration

2. **Educational Value:**
   - Emphasize: kindness, hard work, family love
   - Avoid: revenge, violence, negative emotions

3. **Story Closure:**
   - Resolve major plot points
   - Show Heungbu's happiness
   - Contrast with Nolbu (if relevant)

4. **Moral Lesson:**
   - Clear and simple for children
   - Positive reinforcement

**OUTPUT (JSON):**
{{
  "ending_story": "결말 스토리 ({target_chars}자, 한국어)",
  "moral_lesson": "교훈 (1-2 문장, 한국어)",
  "user_journey_summary": "사용자 여정 요약 (한국어)"
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
                
                if "ending_story" not in data:
                    raise ValueError("ending_story 키 누락")
                
                ending_len = len(data["ending_story"])
                print(f"   ✅ Epilogue: 교훈적 결말 생성 완료 ({ending_len}자)")
                print(f"   📖 교훈: {data.get('moral_lesson', 'N/A')}")
                
                return data
                
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ Epilogue 오류: {error_str}")
                
                is_quota_error = (
                    "429" in error_str or 
                    "RESOURCE_EXHAUSTED" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    if self.config.rotate_google_key():
                        continue
                    else:
                        return {
                            "ending_story": original_ref[:target_chars],
                            "moral_lesson": "착하고 부지런하면 복이 온다는 교훈을 담고 있습니다.",
                            "user_journey_summary": "흥부의 행복한 결말"
                        }
                else:
                    return {
                        "ending_story": original_ref[:target_chars],
                        "moral_lesson": "착하고 부지런하면 복이 온다는 교훈을 담고 있습니다.",
                        "user_journey_summary": "흥부의 행복한 결말"
                    }
    
    def generate_ending_options(
        self,
        all_stories: List[str],
        user_choices: List[str] = None
    ) -> Dict[str, any]:
        """
        5막 선택지 생성 - 이야기를 마무리하는 2개 옵션
        
        Args:
            all_stories: 1~4막 스토리 리스트
            user_choices: 사용자가 선택한 옵션 리스트 (선택적)
        
        Returns:
            {
                "options": ["선택지 1", "선택지 2"],
                "moral_lesson": "교훈"
            }
        """
        # 1~4막 스토리 병합
        story_summary = "\n\n".join([
            f"[{i+1}막] {story}"
            for i, story in enumerate(all_stories[:4])
        ])
        
        # 원작 5막 참조
        original_ref = self.config.get_original_ref(5)
        
        prompt = f"""
You are creating ENDING OPTIONS for "Heungbu and Nolbu" Act 5.

**STORY SO FAR (Acts 1-4):**
{story_summary}

**ORIGINAL REFERENCE:**
{original_ref}

**MISSION:**
Create 2 meaningful ending options that:
1. Conclude the story from Acts 1-4
2. Both lead to positive endings
3. Give choice in HOW the story ends
4. Deliver clear moral lessons

**REQUIREMENTS:**

1. **Both options MUST:**
   - Lead to happy ending for Heungbu
   - Teach valuable lessons
   - Be appropriate for children
   - CONCLUDE the story

2. **Options should differ in:**
   - HOW Heungbu finds happiness
   - Nolbu's fate
   - Ending tone

3. **Length:** 30-50 characters each (Korean)

**OUTPUT (JSON):**
{{
  "option_1": "결말 선택지 1 (30-50자, 한국어)",
  "option_2": "결말 선택지 2 (30-50자, 한국어)",
  "moral_lesson": "교훈 (1-2 문장, 한국어)"
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
                
                if "option_1" not in data or "option_2" not in data:
                    raise ValueError("옵션 키 누락")
                
                result = {
                    "options": [data["option_1"], data["option_2"]],
                    "moral_lesson": data.get("moral_lesson", "착한 마음과 부지런함은 반드시 보상받습니다.")
                }
                
                print(f"   ✅ Epilogue: 결말 선택지 생성 완료")
                print(f"   📖 교훈: {result['moral_lesson']}")
                
                return result
                
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ Epilogue 선택지 오류: {error_str}")
                
                is_quota_error = (
                    "429" in error_str or 
                    "RESOURCE_EXHAUSTED" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    if self.config.rotate_google_key():
                        continue
                    else:
                        return {
                            "options": [
                                "흥부가 박에서 나온 보물로 가족과 행복하게 살다",
                                "흥부와 놀부가 화해하고 함께 행복하게 살다"
                            ],
                            "moral_lesson": "착한 마음과 부지런함은 반드시 보상받습니다."
                        }
                else:
                    return {
                        "options": [
                            "흥부가 박에서 나온 보물로 가족과 행복하게 살다",
                            "흥부와 놀부가 화해하고 함께 행복하게 살다"
                        ],
                        "moral_lesson": "착한 마음과 부지런함은 반드시 보상받습니다."
                    }
