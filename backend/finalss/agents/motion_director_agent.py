# ==================================================================================
# agents/motion_director_agent.py - 영상 모션 프롬프트 생성 에이전트
# ==================================================================================

from typing import List


class MotionDirectorAgent:
    """
    카메라 감독 - 영상 모션 프롬프트 생성
    
    역할:
    - 장면별 카메라 무빙 생성
    - 자연스러운 움직임 묘사
    - 웹에서 선택한 아트 스타일 반영 (NEW!)
    - 필터링 우회 표현 사용
    """
    
    def __init__(self, config):
        self.config = config
    
    def create_motion_prompt(
        self,
        scene_text: str,
        art_style: str = "pixar",  # 웹에서 선택한 스타일
        blocked_words: List[str] = None
    ) -> str:
        """
        장면 텍스트를 영상 모션 프롬프트로 변환 (스타일 반영)
        
        Args:
            scene_text: 장면 텍스트
            art_style: 웹에서 선택한 아트 스타일 (중요!)
            blocked_words: 금지어 리스트
        
        Returns:
            영상 모션 프롬프트 (영문, 스타일 포함)
        """
        if blocked_words is None:
            blocked_words = self.config.get_blocked_words()
        
        # 스타일별 키워드 매핑
        style_keywords = {
            "realistic": "Photorealistic style, natural lighting, realistic textures",
            "cartoon_2d": "2D cartoon animation style, hand-drawn aesthetic, vibrant flat colors",
            "cartoon_3d": "3D cartoon style, exaggerated features, playful rendering",
            "pixar": "Pixar 3D animation style, cinematic lighting, high-quality rendering",
            "watercolor": "Watercolor painting style, soft artistic brushstrokes, pastel colors"
        }
        
        style_keyword = style_keywords.get(art_style, style_keywords["pixar"])
        
        prompt = f"""
Convert this Korean scene description to an English video motion prompt.

**CRITICAL: The video MUST use {style_keyword}!**

SCENE: {scene_text}

**RULES:**
1. Start with "{style_keyword}" in your description
2. Describe physical movements AND environmental atmosphere (wind, light, dust)
3. ALWAYS include Camera Movement (Slow Pan, Zoom In/Out, Tracking Shot)
4. Make the scene DYNAMIC: Hair/Clothes must move with wind, Background must be alive
5. Keep consistent with the reference image's art style
6. Keep it G-rated (Avoid direct violence, use "intense atmosphere" instead)
7. NO emotional suffering, NO gore

**FORBIDDEN WORDS (will cause filtering):**
{', '.join(blocked_words)}

**Output format:**
"{style_keyword}, [camera movement], [character action], [environmental details]"

**Example:**
"{style_keyword}, low angle tracking shot, character walking forward, leaves swirling in wind"

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
                        print(f"   ⚠️ Motion Director: 금지어 '{word}' 감지, 기본값 사용")
                        return f"{style_keyword}, character standing calmly with a gentle expression, camera slowly zooming in"
                
                print(f"   ✅ Motion Director: 모션 프롬프트 생성 완료 ({art_style} 스타일)")
                return motion
                
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ Motion Director 오류: {error_str}")
                
                is_quota_error = (
                    "429" in error_str or 
                    "RESOURCE_EXHAUSTED" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    if self.config.rotate_google_key():
                        continue
                
                print(f"   ⚠️ 기본값 사용")
                return f"{style_keyword}, character standing calmly with a gentle expression, camera slowly zooming in"
