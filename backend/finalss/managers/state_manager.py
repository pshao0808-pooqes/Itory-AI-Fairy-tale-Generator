# ==================================================================================
# managers/state_manager.py - 상태/진행 관리 클래스
# ==================================================================================

import os
import json
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field, asdict
from pathlib import Path


@dataclass
class SceneState:
    """씬별 미디어 생성 상태"""
    image: str = "pending"      # "pending" | "done" | "failed"
    video: str = "pending"
    tts: str = "pending"
    error_message: str = ""


@dataclass
class StageState:
    """스테이지별 병합 상태"""
    scenes_merged: str = "pending"   # "pending" | "done" | "failed"
    tts_merged: str = "pending"
    final_muxed: str = "pending"


class StateManager:
    """
    스토리 진행 상황 및 미디어 생성 상태를 관리하는 클래스.
    - 기존 save_progress / load_progress 기능 포함
    - 씬별, 스테이지별 세부 상태 추적 추가
    """
    
    def __init__(self, state_file: str = "output/state.json", 
                 progress_file: str = "output/story_progress.json"):
        self.state_file = state_file
        self.progress_file = progress_file  # 기존 호환용
        
        # 스토리 상태
        self.history: str = ""
        self.selected_choices: List[str] = []
        self.current_turn: int = 1
        self.stage_stories: List[str] = []  # 스테이지별 스토리 리스트 추가

        
        # 미디어 상태 (씬별, 스테이지별)
        self.scene_states: Dict[int, SceneState] = {}
        self.stage_states: Dict[int, StageState] = {}
        
        # 초기 로드 시도
        self._ensure_directory()
    
    def _ensure_directory(self) -> None:
        """상태 파일 저장할 디렉토리 확인"""
        for file_path in [self.state_file, self.progress_file]:
            dir_path = Path(file_path).parent
            if dir_path and not dir_path.exists():
                dir_path.mkdir(parents=True, exist_ok=True)
    
    # ============== 기존 호환: save_progress / load_progress ==============
    
    def save_progress(self) -> None:
        """
        현재 진행 상황을 JSON 파일로 저장 (기존 함수 대체)
        - progress_file: 기존 호환용 (history, choices, turn)
        - state_file: 확장된 상태 (씬별, 스테이지별)
        """
        # 1) 기존 형식 저장 (호환용)
        progress_data = {
            "history": self.history,
            "selected_choices": self.selected_choices,
            "current_turn": self.current_turn
        }
        try:
            with open(self.progress_file, "w", encoding="utf-8") as f:
                json.dump(progress_data, f, ensure_ascii=False, indent=4)
            print(f"💾 진행 상황 저장 완료: {self.progress_file} (턴: {self.current_turn})")
        except Exception as e:
            print(f"❌ 진행 상황 저장 실패: {e}")
        
        # 2) 확장된 상태 저장
        self._save_full_state()
    
    def load_progress(self, initial_turn: int = 1) -> Tuple[str, List[str], int]:
        """
        JSON 파일에서 진행 상황 로드 (기존 함수 대체)
        반환: (history, selected_choices, current_turn)
        """
        # 먼저 확장된 상태 로드 시도
        if os.path.exists(self.state_file):
            self._load_full_state()
        
        # 기존 형식 파일도 확인 (호환용)
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.history = data.get("history", self.history or "")
                self.selected_choices = data.get("selected_choices", self.selected_choices or [])
                self.current_turn = data.get("current_turn", self.current_turn or initial_turn)
                print(f"✅ 진행 상황 로드 완료 (시작 턴: {self.current_turn})")
            except Exception as e:
                print(f"❌ 진행 상황 로드 실패 ({e}). 초기값으로 시작합니다.")
                self._set_initial_state(initial_turn)
        else:
            print("💡 저장된 진행 상황 파일이 없습니다. 초기값으로 시작합니다.")
            self._set_initial_state(initial_turn)
        
        return self.history, self.selected_choices, self.current_turn
    
    def _set_initial_state(self, initial_turn: int) -> None:
        """초기 상태 설정"""
        self.history = ""
        self.selected_choices = []
        self.current_turn = initial_turn
    
    # ============== 확장된 상태 저장/로드 ==============
    
    def _save_full_state(self) -> None:
        """전체 상태 저장 (씬별, 스테이지별 포함)"""
        state_data = {
            "story": {
                "history": self.history,
                "selected_choices": self.selected_choices,
                "current_turn": self.current_turn
            },
            "scenes": {
                str(k): asdict(v) for k, v in self.scene_states.items()
            },
            "stages": {
                str(k): asdict(v) for k, v in self.stage_states.items()
            }
        }
        try:
            with open(self.state_file, "w", encoding="utf-8") as f:
                json.dump(state_data, f, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"⚠️ 전체 상태 저장 실패: {e}")
    
    def _load_full_state(self) -> None:
        """전체 상태 로드"""
        try:
            with open(self.state_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # 스토리 상태
            story = data.get("story", {})
            self.history = story.get("history", "")
            self.selected_choices = story.get("selected_choices", [])
            self.current_turn = story.get("current_turn", 1)
            
            # 씬 상태
            scenes = data.get("scenes", {})
            for k, v in scenes.items():
                self.scene_states[int(k)] = SceneState(**v)
            
            # 스테이지 상태
            stages = data.get("stages", {})
            for k, v in stages.items():
                self.stage_states[int(k)] = StageState(**v)
            
            print(f"✅ 전체 상태 로드 완료")
        except Exception as e:
            print(f"⚠️ 전체 상태 로드 실패: {e}")
    
    # ============== 씬 상태 관리 ==============
    
    def get_scene_state(self, scene_idx: int) -> SceneState:
        """씬 상태 조회 (없으면 생성)"""
        if scene_idx not in self.scene_states:
            self.scene_states[scene_idx] = SceneState()
        return self.scene_states[scene_idx]
    
    def mark_scene_complete(self, scene_idx: int, media_type: str) -> None:
        """
        씬 미디어 생성 완료 표시
        media_type: "image" | "video" | "tts" | "all"
        """
        state = self.get_scene_state(scene_idx)
        if media_type == "all":
            state.image = "done"
            state.video = "done"
            state.tts = "done"
        elif media_type == "image":
            state.image = "done"
        elif media_type == "video":
            state.video = "done"
        elif media_type == "tts":
            state.tts = "done"
        self._save_full_state()
    
    def mark_scene_failed(self, scene_idx: int, media_type: str, error: str = "") -> None:
        """씬 미디어 생성 실패 표시"""
        state = self.get_scene_state(scene_idx)
        if media_type == "image":
            state.image = "failed"
        elif media_type == "video":
            state.video = "failed"
        elif media_type == "tts":
            state.tts = "failed"
        state.error_message = error
        self._save_full_state()
    
    def is_scene_complete(self, scene_idx: int) -> bool:
        """씬의 모든 미디어가 완료되었는지 확인"""
        state = self.get_scene_state(scene_idx)
        return state.image == "done" and state.video == "done" and state.tts == "done"
    
    def get_pending_scenes(self) -> List[int]:
        """아직 완료되지 않은 씬 목록"""
        pending = []
        for idx, state in self.scene_states.items():
            if state.image != "done" or state.video != "done" or state.tts != "done":
                pending.append(idx)
        return sorted(pending)
    
    def get_failed_scenes(self) -> List[int]:
        """실패한 씬 목록"""
        failed = []
        for idx, state in self.scene_states.items():
            if "failed" in [state.image, state.video, state.tts]:
                failed.append(idx)
        return sorted(failed)
    
    # ============== 스테이지 상태 관리 ==============
    
    def get_stage_state(self, stage_no: int) -> StageState:
        """스테이지 상태 조회 (없으면 생성)"""
        if stage_no not in self.stage_states:
            self.stage_states[stage_no] = StageState()
        return self.stage_states[stage_no]
    
    def mark_stage_complete(self, stage_no: int, merge_type: str) -> None:
        """
        스테이지 병합 완료 표시
        merge_type: "scenes" | "tts" | "final"
        """
        state = self.get_stage_state(stage_no)
        if merge_type == "scenes":
            state.scenes_merged = "done"
        elif merge_type == "tts":
            state.tts_merged = "done"
        elif merge_type == "final":
            state.final_muxed = "done"
        self._save_full_state()
    
    def can_merge_stage(self, stage_no: int, start_turn: int, end_turn: int) -> bool:
        """스테이지 병합 가능 여부 (모든 씬 완료 확인)"""
        for turn in range(start_turn, end_turn + 1):
            if not self.is_scene_complete(turn):
                return False
        return True
    
    def can_mux_stage(self, stage_no: int) -> bool:
        """스테이지 영상+오디오 믹싱 가능 여부"""
        state = self.get_stage_state(stage_no)
        return state.scenes_merged == "done" and state.tts_merged == "done"
    
    # ============== 히스토리 관리 ==============
    
    def set_initial_context(self, context: str) -> None:
        """초기 컨텍스트 설정"""
        if not self.history:
            self.history = context
    
    def append_to_history(self, text: str) -> None:
        """히스토리에 텍스트 추가"""
        self.history += f" {text}"
    
    def add_choice(self, choice: str) -> None:
        """선택 기록 추가"""
        self.selected_choices.append(choice)
    
    def get_history(self) -> str:
        """현재 히스토리 반환"""
        return self.history
    
    def get_choices(self) -> List[str]:
        """선택 기록 반환"""
        return self.selected_choices
    
    def increment_turn(self) -> int:
        """턴 증가 후 현재 턴 반환"""
        self.current_turn += 1
        return self.current_turn
    
    # ============== 초기화 ==============
    
    def reset(self) -> None:
        """모든 상태 초기화"""
        self.history = ""
        self.selected_choices = []
        self.current_turn = 1
        self.scene_states = {}
        self.stage_states = {}
        
        # 파일도 삭제
        for file_path in [self.state_file, self.progress_file]:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"🗑️ 상태 파일 삭제: {file_path}")