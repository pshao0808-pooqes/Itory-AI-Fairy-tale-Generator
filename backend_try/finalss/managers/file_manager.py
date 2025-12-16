# ==================================================================================
# managers/file_manager.py - 파일 경로 관리 클래스
# ==================================================================================

import os
import shutil
from typing import List
from pathlib import Path

from .config_manager import ConfigManager


class FileManager:
    """파일 경로 통합 관리"""
    
    def __init__(self, config: ConfigManager):
        self.config = config
    
    def ensure_all_directories(self) -> None:
        """필요한 모든 출력 디렉토리 생성"""
        directories = [
            self.config.get_path("output_base"),
            self.config.get_path("stages"),
            self.config.get_path("tts"),
        ]
        
        for dir_path in directories:
            if dir_path:
                Path(dir_path).mkdir(parents=True, exist_ok=True)
        
        print(f"✅ 출력 디렉토리 생성 완료")
    
    def get_stage_image_path(self, stage_no: int, scene: int) -> str:
        """스테이지 이미지 파일 경로"""
        pattern = self.config.get_file_pattern("stage_image")
        filename = pattern.format(stage=stage_no, scene=scene)
        return os.path.join(self.config.get_path("stages"), filename)
    
    def get_stage_video_path(self, stage_no: int, scene: int) -> str:
        """스테이지 개별 영상 파일 경로"""
        pattern = self.config.get_file_pattern("stage_video")
        filename = pattern.format(stage=stage_no, scene=scene)
        return os.path.join(self.config.get_path("stages"), filename)
    
    def get_stage_merged_video_path(self, stage_no: int) -> str:
        """스테이지 병합 영상 파일 경로"""
        pattern = self.config.get_file_pattern("stage_merged_video")
        filename = pattern.format(stage=stage_no)
        return os.path.join(self.config.get_path("stages"), filename)
    
    def get_stage_tts_path(self, stage_no: int) -> str:
        """스테이지 TTS 파일 경로"""
        pattern = self.config.get_file_pattern("stage_tts")
        filename = pattern.format(stage=stage_no)
        return os.path.join(self.config.get_path("tts"), filename)
    
    def get_stage_final_path(self, stage_no: int) -> str:
        """스테이지 최종 파일 경로"""
        pattern = self.config.get_file_pattern("stage_final")
        filename = pattern.format(stage=stage_no)
        return os.path.join(self.config.get_path("stages"), filename)
    
    def get_stage_images(self, stage_no: int) -> List[str]:
        """스테이지의 모든 이미지 경로 (존재하는 파일만)"""
        images = []
        for scene in range(1, 4):
            path = self.get_stage_image_path(stage_no, scene)
            if os.path.exists(path):
                images.append(path)
        return images
    
    def get_final_video_path(self) -> str:
        """최종 완성 영상 파일 경로"""
        return self.config.get_path("final_video_file")
    
    def get_final_story_path(self) -> str:
        """최종 스토리 텍스트 파일 경로"""
        return self.config.get_path("final_story_file")
    
    def get_final_tts_path(self) -> str:
        """최종 TTS 파일 경로"""
        return self.config.get_path("final_tts_file")
    
    def get_state_file_path(self) -> str:
        """상태 저장 파일 경로"""
        return os.path.join(self.config.get_path("output_base"), "state.json")
    
    def get_progress_file_path(self) -> str:
        """진행 상황 파일 경로"""
        return os.path.join(self.config.get_path("output_base"), "progress.json")