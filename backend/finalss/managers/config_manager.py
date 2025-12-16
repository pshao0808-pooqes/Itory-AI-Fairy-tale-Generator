# ==================================================================================
# managers/config_manager.py - 설정 관리 클래스 (간소화: 캐릭터 고정값 제거)
# ==================================================================================

import os
import yaml
from typing import Any, Dict, List
from pathlib import Path


class ConfigManager:
    """YAML 설정 파일 관리"""
    
    def __init__(self, config_path: str = r"C:\Users\Admin\Desktop\2ndTeamWork\workspace\backend\finalss\config\default_config.yaml"):
        self.config_path = Path(config_path)
        self._config: Dict[str, Any] = {}
        
        # .env 파일 명시적 로드
        from dotenv import load_dotenv
        env_path = Path(r"C:\Users\Admin\Desktop\2ndTeamWork\workspace\backend\finalss\.env")
        load_dotenv(dotenv_path=env_path)
        
        self._load_config()
        self._load_api_keys()
    
    def _load_config(self) -> None:
        """메인 설정 파일 로드"""
        if not self.config_path.exists():
            raise FileNotFoundError(f"설정 파일을 찾을 수 없습니다: {self.config_path}")
## 
        with open(self.config_path, "r", encoding="utf-8") as f:
            self._config = yaml.safe_load(f)
        
        print(f"✅ 설정 로드 완료: {self.config_path}")
    
    # ==============스토리 설정 ==============
    
    def get_initial_context(self) -> str:
        return self._config.get("story", {}).get("initial_context", "")
    
    def get_story_structure(self) -> Dict[int, Dict[str, Any]]:
        structure = self._config.get("story", {}).get("structure", {})
        return {int(k): v for k, v in structure.items()}
    
    def get_stage_info(self, stage_no: int) -> Dict[str, Any]:
        return self.get_story_structure().get(stage_no, {})
    
    def get_original_ref(self, stage_no: int) -> str:
        refs = self._config.get("story", {}).get("original_refs", {})
        return refs.get(stage_no, refs.get(str(stage_no), ""))
    
    # ============== TTS 설정 ==============
    
    def get_tts_target_duration(self) -> int:
        """TTS 목표 길이 (초)"""
        return self._config.get("tts", {}).get("target_duration", 20)
    
    def get_tts_silence_padding(self) -> int:
        """TTS 뒤에 추가할 무음 길이 (초)"""
        return self._config.get("tts", {}).get("silence_padding", 3)
    
    def get_tts_target_chars(self) -> int:
        """TTS 목표 글자수"""
        return self._config.get("tts", {}).get("target_chars", 250)
    
    def get_tts_char_limits(self) -> Dict[str, int]:
        """TTS 글자수 제한 반환"""
        tts = self._config.get("tts", {})
        return {
            "min": tts.get("min_chars", 200),
            "max": tts.get("max_chars", 300),
            "target": tts.get("target_chars", 250)
        }
    
    # ============== 필터링 설정 ==============
    
    def get_sanitize_mappings(self) -> Dict[str, str]:
        """폭력적 표현 → 순화 표현 매핑"""
        return self._config.get("content_filter", {}).get("sanitize_mappings", {})
    
    def get_blocked_words(self) -> List[str]:
        """금지 단어 목록"""
        return self._config.get("content_filter", {}).get("blocked_words", [])
    
    # ============== 미디어 설정 ==============
    
    def get_art_style(self) -> str:
        return self._config.get("media", {}).get("art_style", "")
    
    def get_model(self, media_type: str) -> str:
        models = self._config.get("media", {}).get("models", {})
        return models.get(media_type, "")
    
    def get_tts_config(self) -> Dict[str, str]:
        return self._config.get("media", {}).get("tts", {})
    
    def get_video_config(self) -> Dict[str, Any]:
        return self._config.get("media", {}).get("video", {})
    
    # ============== 경로 설정 ==============
    
    def get_path(self, key: str) -> str:
        """경로 반환 (상대 경로를 절대 경로로 변환)"""
        path_str = self._config.get("paths", {}).get(key, "")
        
        if not path_str:
            return ""
        
        # 이미 절대 경로인 경우 그대로 반환
        if os.path.isabs(path_str):
            return path_str
        
        # 상대 경로를 config 파일 위치 기준 절대 경로로 변환
        config_dir = self.config_path.parent
        abs_path = (config_dir.parent / path_str).resolve()  # parent: finalss 폴더
        return str(abs_path)
    
    # ============== 파일명 패턴 ==============
    
    def get_file_pattern(self, pattern_name: str) -> str:
        return self._config.get("file_patterns", {}).get(pattern_name, "")
    
    # ============== 재시도 설정 ==============
    
    def get_retry_config(self) -> Dict[str, int]:
        """재시도 설정 반환"""
        return self._config.get("retry", {})
    
    # ============== API Key 관리 ==============
    
    def _load_api_keys(self) -> None:
        """환경 변수에서 API 키들 로드"""
        # Google API Keys
        g_keys = os.getenv("GOOGLE_API_KEYS", "")
        if not g_keys:
            g_keys = os.getenv("GOOGLE_API_KEY", "")
        
        self.google_keys = [k.strip() for k in g_keys.split(",") if k.strip()]
        self.current_google_idx = 0
        
        # ElevenLabs API Keys
        e_keys = os.getenv("ELEVENLABS_API_KEYS", "")
        if not e_keys:
            e_keys = os.getenv("ELEVENLABS_API_KEY", "")
        
        self.eleven_keys = [k.strip() for k in e_keys.split(",") if k.strip()]
        self.current_eleven_idx = 0
        
        print(f"🔑 Google API Keys: {len(self.google_keys)}개 로드됨")
        print(f"🔑 ElevenLabs Keys: {len(self.eleven_keys)}개 로드됨")

    def get_google_client(self):
        """현재 Google 키로 클라이언트 반환"""
        if not hasattr(self, 'google_keys'):
            self._load_api_keys()
            
        if not self.google_keys:
            raise ValueError("Google API Key가 설정되지 않았습니다.")
            
        from google import genai
        current_key = self.google_keys[self.current_google_idx]
        return genai.Client(api_key=current_key)

    def rotate_google_key(self) -> bool:
        """Google 키 교체. 다음 키가 있으면 True, 없으면 False"""
        if not hasattr(self, 'google_keys'):
            self._load_api_keys()

        if self.current_google_idx + 1 < len(self.google_keys):
            self.current_google_idx += 1
            print(f"🔄 Google API Key 교체 ({self.current_google_idx + 1}/{len(self.google_keys)})")
            return True
        print("❌ 모든 Google API Key 한도 초과/소진")
        return False

    def get_eleven_client(self):
        """현재 ElevenLabs 키로 클라이언트 반환"""
        if not hasattr(self, 'eleven_keys'):
            self._load_api_keys()
            
        if not self.eleven_keys:
            return None
            
        try:
            from elevenlabs.client import ElevenLabs
            current_key = self.eleven_keys[self.current_eleven_idx]
            return ElevenLabs(api_key=current_key)
        except ImportError:
            return None

    def rotate_eleven_key(self) -> bool:
        """ElevenLabs 키 교체. 다음 키가 있으면 True, 없으면 False"""
        if not hasattr(self, 'eleven_keys'):
            self._load_api_keys()

        if self.current_eleven_idx + 1 < len(self.eleven_keys):
            self.current_eleven_idx += 1
            print(f"🔄 ElevenLabs API Key 교체 ({self.current_eleven_idx + 1}/{len(self.eleven_keys)})")
            return True
        print("❌ 모든 ElevenLabs API Key 한도 초과/소진")
        return False