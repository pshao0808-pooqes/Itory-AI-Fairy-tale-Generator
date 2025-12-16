# ==================================================================================
# managers/story_manager.py - LLM 스토리 생성 관리 클래스
# ==================================================================================

import json
from typing import Any, Dict, List, Optional

from google.genai import types
from google.genai import errors

from .config_manager import ConfigManager
from .state_manager import StateManager


class StoryManager:
    """
    LLM을 사용한 스토리 생성 관리 클래스.
    - 옵션 3개 생성 (get_next_options)
    - 씬 프롬프트 변환 (generate_scene_prompts)
    - 최종 스토리 생성 (generate_full_story)
    """
    
    def __init__(self, config: ConfigManager, state: StateManager, gemini_client=None):
        self.config = config
        self.state = state
    
    # ============== 옵션 생성 ==============
    
    def get_next_options(self, stage_no: int, history: str = "") -> List[str]:
        """
        다음 막의 옵션을 생성합니다.
        
        Args:
            stage_no: 현재 막 번호
            history: 이전 막들의 누적된 스토리 텍스트
        
        Returns:
            3개의 옵션 리스트
        """
        stage_info = self.config.get_stage_info(stage_no)
        original_ref = self.config.get_original_ref(stage_no)
        
        if not history:
            history = self.state.get_history()
        
        print(f"\n🤔 AI가 다음 이야기 후보를 생각하고 있습니다... [현재 단계: {stage_info.get('name', '')}]")
        
        # 이전 스토리 컨텍스트
        previous_context = f"""
**이전 막들의 스토리:**
{history}
""" if history else "**이것은 첫 번째 막입니다.**"
        
        prompt = f"""
You are an AI Interactive Storyteller for "Heungbu and Nolbu".

ORIGINAL STORY TEXT (Reference): {original_ref}

{previous_context}

***CURRENT STAGE***:
{stage_info.get('name', '')} ({stage_info.get('description', '')})

Task: Suggest 3 options for the next scene that:
1. Continue from the previous story
2. Fit the current stage theme
3. Focus on Heungbu's actions

***LANGUAGE: ALL options in KOREAN***

Each option should include:
- Character's action
- Character's dialogue (in quotes "")
- Character's emotion

Constraints:
- Option 1: A creative twist
- Option 2: A different approach
- Option 3: A creative twist

Output JSON format: {{"options": ["옵션 1", "옵션 2", "옵션 3"]}}
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
                
                if isinstance(data, dict) and "options" in data and len(data["options"]) >= 3:
                    return data["options"]
                else:
                    raise ValueError("Invalid options returned")
                    
            except (errors.APIError, Exception) as e:
                print(f"   ⚠️ API 호출 오류: {e}")
                if self.config.rotate_google_key():
                    continue
                else:
                    print("   ❌ 모든 키 소진")
                    return [
                        "흥부가 쌀을 구하러 놀부를 찾아간다.",
                        "흥부가 산에서 나무를 해 온다.",
                        "흥부가 새끼 제비를 발견한다."
                    ]
    
    # ============== 씬 프롬프트 변환 ==============
    
    def generate_scene_prompts(self, selected_text: str) -> Dict[str, str]:
        prompt = f"""
Story Segment (Korean): "{selected_text}"

Create visual prompts for Korean traditional fairy tale animation.

Instructions:
1. Translate to English visual descriptions
2. Capture emotional core and key actions
3. Keep family-friendly

Output JSON format: {{"main_character": "Heungbu or Nolbu", "image_description": "...", "video_motion": "..."}}
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
                
                if isinstance(data, list) and data and isinstance(data[0], dict):
                    data = data[0]
                
                if not isinstance(data, dict):
                    raise TypeError("Invalid response format")
                
                required_keys = ["main_character", "image_description", "video_motion"]
                if not all(key in data for key in required_keys):
                    raise KeyError("Missing required keys")
                
                return data

            except (errors.APIError, Exception) as e:
                print(f"   ⚠️ 콘티 생성 오류: {e}")
                if self.config.rotate_google_key():
                    continue
                else:
                    return {
                        "main_character": "Heungbu",
                        "image_description": "Heungbu gently patting his children's heads.",
                        "video_motion": "Heungbu slowly smiling with determination."
                    }
    
    # ============== 선택 처리 ==============
    
    def select_option(self, option_idx: int, options: List[str]) -> str:
        """사용자가 선택한 옵션을 처리하고 상태에 기록"""
        if option_idx < 0 or option_idx >= len(options):
            raise IndexError(f"Invalid option index: {option_idx}")
        
        selected_text = options[option_idx]
        self.state.add_choice(selected_text)
        self.state.append_to_history(selected_text)
        
        return selected_text

    def expand_selected_to_story(self, selected_text: str, stage_no: int, history: str) -> str:
        """선택된 옵션을 전체 스토리로 확장"""
        stage_info = self.config.get_stage_info(stage_no)
        original_ref = self.config.get_original_ref(stage_no)
        
        # TTS 글자수 제한
        tts_config = self.config._config.get("tts", {})
        target_chars = tts_config.get("target_chars", 160)
        min_chars = tts_config.get("min_chars", 150)
        max_chars = tts_config.get("max_chars", 170)
        
        previous_context = f"""
**이전 막들의 스토리:**
{history}
""" if history else "**첫 번째 막입니다.**"
        
        prompt = f"""
Expand this story selection for "Heungbu and Nolbu".

SELECTED: {selected_text}
STAGE: {stage_info.get('name', '')}
REFERENCE: {original_ref}

{previous_context}

**TARGET LENGTH: {target_chars} characters (±30)**

Task:
1. Continue from previous story
2. Incorporate selected option
3. Korean only
4. Brief dialogue (1-2 lines)
5. Positive tone

Output ONLY the expanded story text in Korean.
"""
        
        while True:
            try:
                client = self.config.get_google_client()
                response = client.models.generate_content(
                    model=self.config.get_model("text"),
                    contents=[prompt]
                )
                story = response.text.strip()
                
                if len(story) < min_chars:
                    return selected_text[:target_chars]
                elif len(story) > max_chars:
                    return story[:target_chars]
                
                print(f"   ✅ 스토리 확장 완료 ({len(story)}자)")
                return story
                
            except (errors.APIError, Exception) as e:
                print(f"   ⚠️ 스토리 확장 오류: {e}")
                if self.config.rotate_google_key():
                    continue
                else:
                    return selected_text[:target_chars]
    
    # ============== 최종 스토리 생성 ==============
    
    def generate_full_story(self) -> Optional[str]:
        """전체 스토리 생성"""
        selected_choices = self.state.get_choices()
        
        if not selected_choices:
            print("⚠️ 선택된 스토리가 없습니다.")
            return None
        
        print("\n📖 완전한 전래동화를 생성하고 있습니다...")
        
        story_structure = self.config.get_story_structure()
        choices_text = "\n".join([
            f"{i+1}. [{story_structure.get((i//3) + 1, {}).get('name', '')}] {choice}"
            for i, choice in enumerate(selected_choices)
        ])
        
        original_ref = self.config.get_original_ref(5)
        
        prompt = f"""
You are a professional Korean fairy tale writer.

ORIGINAL REFERENCE: {original_ref}

USER'S SELECTED CHOICES:
{choices_text}

Task: Write a COMPLETE Korean fairy tale based on these choices.

Requirements:
1. Beautiful Korean prose for children
2. Follow 5-stage structure
3. 1000-1500 words total
4. Include moral lesson

Output the complete story in Korean.
"""
        
        while True:
            try:
                client = self.config.get_google_client()
                response = client.models.generate_content(
                    model=self.config.get_model("text"),
                    contents=[prompt],
                )
                return response.text
                
            except (errors.APIError, Exception) as e:
                print(f"   ⚠️ 스토리 생성 오류: {e}")
                if self.config.rotate_google_key():
                    continue
                else:
                    return None

    def save_story_to_file(self, story_text: str, filename: str = None) -> bool:
        """최종 스토리를 파일로 저장"""
        if filename is None:
            filename = self.config.get_path("final_story_file")
        
        try:
            from pathlib import Path
            Path(filename).parent.mkdir(parents=True, exist_ok=True)
            
            with open(filename, "w", encoding="utf-8") as f:
                f.write("=" * 60 + "\n")
                f.write("흥부와 놀부 - 완성된 이야기\n")
                f.write("=" * 60 + "\n\n")
                f.write(story_text)
                f.write("\n\n" + "=" * 60 + "\n")
                f.write("이야기 끝\n")
                f.write("=" * 60 + "\n")
            
            print(f"\n✅ '{filename}' 저장 완료!")
            return True
            
        except Exception as e:
            print(f"\n❌ 파일 저장 실패: {e}")
            return False