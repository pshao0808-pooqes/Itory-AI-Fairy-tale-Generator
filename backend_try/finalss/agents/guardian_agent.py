# ==================================================================================
# agents/guardian_agent.py - 입력 검증 및 순화 에이전트
# ==================================================================================

from typing import List, Dict


class GuardianAgent:
    """
    사용자 입력의 문지기
    
    역할:
    - 폭력적/선정적 내용 순화
    - 현대어 → 조선시대 용어 변환
    - 금지어 필터링
    """
    
    def __init__(self, config):
        self.config = config
    
    def validate_and_sanitize(
        self, 
        user_input: str, 
        stage_no: int,
        blocked_words: List[str]
    ) -> str:
        """
        사용자 입력을 검증하고 전래동화 톤으로 변환
        
        Args:
            user_input: 사용자 원본 입력
            stage_no: 현재 막 번호
            blocked_words: 금지어 리스트
        
        Returns:
            정제된 입력 텍스트
        """
        # 빈 입력 처리
        if not user_input or not user_input.strip():
            return user_input
        
        stage_info = self.config.get_stage_info(stage_no)
        
        prompt = f"""
You are a Guardian Agent for a Korean traditional fairytale generator.

USER INPUT: {user_input}
CURRENT STAGE: {stage_info.get('name', '')} ({stage_info.get('description', '')})

**YOUR MISSION:**
Transform the user's input into a family-friendly, traditional Korean fairytale tone.

**RULES:**
1. **Violence/Adult Content → Sanitize**
   - "때리다" → "화를 내다"
   - "죽이다" → "떠나보내다"
   - "피" → "상처"

2. **Modern Terms → Joseon Era Terms**
   - "스마트폰" → "전서구 (편지)"
   - "아파트" → "기와집" or "초가집"
   - "자동차" → "가마" or "말"
   - "경찰" → "포졸"

3. **Forbidden Words (MUST REMOVE):**
   {', '.join(blocked_words)}

4. **Keep the Core Intent**
   - Don't change the user's main idea
   - Just make it appropriate for children

**OUTPUT:**
- Write ONLY the sanitized Korean text
- NO explanations, NO JSON
- Keep it concise (1-2 sentences max)

Example:
Input: "흥부가 스마트폰으로 놀부한테 전화해서 돈 좀 빌려달라고 했어"
Output: "흥부가 전서구를 보내 놀부에게 양식을 빌려달라고 부탁했습니다"
"""
        
        while True:
            try:
                client = self.config.get_google_client()
                response = client.models.generate_content(
                    model=self.config.get_model("text"),
                    contents=[prompt]
                )
                
                sanitized = response.text.strip()
                
                # 금지어 2차 체크
                sanitized_lower = sanitized.lower()
                for word in blocked_words:
                    if word.lower() in sanitized_lower:
                        print(f"   ⚠️ Guardian: 금지어 '{word}' 감지, 재처리")
                        # 금지어가 있으면 원본 반환 (다음 단계에서 처리)
                        return user_input
                
                print(f"   ✅ Guardian: 입력 검증 완료")
                return sanitized
                
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ Guardian 오류: {error_str}")
                
                # 429 RESOURCE_EXHAUSTED 또는 quota 오류 감지
                is_quota_error = (
                    "429" in error_str or 
                    "RESOURCE_EXHAUSTED" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    print(f"   🔄 Guardian: 할당량 초과, API 키 교체 시도...")
                    if self.config.rotate_google_key():
                        print(f"   ✅ Guardian: 다음 API 키로 재시도")
                        continue
                    else:
                        print(f"   ❌ Guardian: 모든 API 키 소진, 원본 사용")
                        return user_input
                else:
                    # 할당량 오류가 아닌 경우 원본 반환
                    print(f"   ❌ Guardian: 복구 불가능한 오류, 원본 사용")
                    return user_input
