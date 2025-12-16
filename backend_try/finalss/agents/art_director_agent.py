# ==================================================================================
# agents/art_director_agent.py - 이미지 프롬프트 생성 에이전트
# ==================================================================================

from typing import List, Dict


class ArtDirectorAgent:
    """
    일관성 있는 삽화가
    
    역할:
    - 캐릭터 고정값 강제 포함
    - 3개 장면별 이미지 프롬프트 생성
    - 나노바나나 레퍼런스 관리
    """
    
    def __init__(self, config):
        self.config = config
    
    def create_image_prompt(
        self,
        scene_text: str,
        main_character: str,
        char_prompts: Dict[str, str],
        art_style: str,
        image_refs: List[str] = None
    ) -> str:
        """
        장면 텍스트를 이미지 생성 프롬프트로 변환
        
        Args:
            scene_text: 장면 텍스트
            main_character: 메인 캐릭터 이름
            char_prompts: 캐릭터 고정 프롬프트 딕셔너리
            art_style: 아트 스타일
            image_refs: 레퍼런스 이미지 경로 리스트
        
        Returns:
            이미지 생성용 프롬프트
        """
        # 캐릭터 고정값 가져오기
        char_fixed = char_prompts.get(main_character.lower(), char_prompts.get("heungbu", ""))
        
        # 기본 프롬프트 구성 (기존 로직 유지)
        prompt = f"""
{art_style}

CHARACTER (MUST follow exactly):
{char_fixed}

SCENE ACTION (focus on this):
{scene_text}

IMPORTANT:
- Use EXACT character appearance as specified above
- Character proportions: Adults should be 1.5-2x taller than children
- Maintain realistic size ratios between characters
- Background: simple, clean, contextually appropriate
- NO text or labels in image
- G-rated, family-friendly content only
"""       
        # 레퍼런스가 있으면 일관성 강조
        if image_refs and len(image_refs) > 0:
            prompt += f"""
- CRITICAL: Maintain character consistency with reference images
- Keep the same character design, proportions, and style
"""
        
        return prompt.strip()
    
    def enhance_prompt_for_consistency(
        self,
        base_prompt: str,
        character_db: Dict[str, any]
    ) -> str:
        """
        캐릭터 일관성을 위한 프롬프트 강화 (선택적 사용)
        
        Args:
            base_prompt: 기본 프롬프트
            character_db: 캐릭터 데이터베이스
        
        Returns:
            강화된 프롬프트
        """
        # 현재는 기본 프롬프트 그대로 반환
        # 필요시 추가 강화 로직 구현 가능
        return base_prompt
