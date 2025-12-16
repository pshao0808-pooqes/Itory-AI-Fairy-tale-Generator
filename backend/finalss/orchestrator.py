# ==================================================================================
# orchestrator.py - 새로운 5막 워크플로우 오케스트레이터 (art_style 파라미터 추가)
# ==================================================================================

import os
from typing import List, Optional
from dotenv import load_dotenv
from google import genai

try:
    from elevenlabs.client import ElevenLabs
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False

from managers.subtitle_manager import SubtitleManager
from managers import (
    ConfigManager,
    FileManager,
    StateManager,
    MediaGenerator,
    MergeManager,
    StoryHelper,
    StoryManager,
)
from utils.user_interaction import UserInteraction

from agents import (
    GuardianAgent,
    ScenarioAgent,
    ArtDirectorAgent,
    MotionDirectorAgent,
    EpilogueDirectorAgent,
)


class Orchestrator:
    """
    새로운 5막 워크플로우 오케스트레이터
    - 웹에서 선택한 art_style 동적 적용
    """
    
    def __init__(self, config_path: str = "config/default_config.yaml", art_style: str = "pixar"):
        load_dotenv()
        
        # 웹에서 선택한 스타일 저장
        self.art_style = art_style
        print(f"🎨 선택된 스타일: {art_style}")
        
        # 설정 및 매니저
        self.config = ConfigManager(config_path)
        self.file_mgr = FileManager(self.config)
        self.state = StateManager(
            state_file=self.file_mgr.get_state_file_path(),
            progress_file=self.file_mgr.get_progress_file_path()
        )
        
        # AI 에이전트
        self.guardian = GuardianAgent(self.config)
        self.scenario_agent = ScenarioAgent(self.config)
        self.art_director = ArtDirectorAgent(self.config)
        self.motion_director = MotionDirectorAgent(self.config)
        self.epilogue_director = EpilogueDirectorAgent(self.config)
                
        # MediaGenerator에 art_style 전달
        self.media = MediaGenerator(
            self.config, self.file_mgr, self.state,
            art_style=self.art_style,  # 핵심: 웹에서 선택한 스타일 전달
            art_director=self.art_director,
            motion_director=self.motion_director
        )
        self.merger = MergeManager(self.config, self.file_mgr, self.state)
        self.story_helper = StoryHelper(self.config)
        self.story_manager = StoryManager(self.config, self.state)
        self.ui = UserInteraction(self.config)
        self.subtitle_mgr = SubtitleManager()
        
        print("✅ 5막 워크플로우 오케스트레이터 초기화 완료")
        
        self.stage_stories: List[str] = []
        self.stage_images: List[List[str]] = []
    
    def _init_api_clients(self) -> None:
        """API 클라이언트 초기화 (더 이상 사용 안 함)"""
        pass
    
    def run(self) -> None:
        """전체 파이프라인 실행"""
        try:
            self.file_mgr.ensure_all_directories()
            
            print("\n" + "="*60)
            print("🎬 흥부와 놀부 - AI 동화 생성 시작")
            print(f"🎨 스타일: {self.art_style}")
            print("="*60)
            print("\n📋 워크플로우:")
            print("   - 5개 막 (발단 → 전개 → 위기 → 절정 → 결말)")
            print("   - 각 막: 23초 (8초 영상 x 3 + 페이드)")
            print("   - 총 길이: 약 115초 (2분)")
            print("="*60)
            
            # 5막 순차 실행
            for stage_no in range(1, 6):
                stage_info = self.config.get_stage_info(stage_no)
                
                print(f"\n{'='*60}")
                print(f"📖 {stage_no}막: {stage_info.get('name', '')} - {stage_info.get('description', '')}")
                print(f"{'='*60}")
                
                success = self._run_stage(stage_no)
                
                if not success:
                    print(f"\n❌ {stage_no}막 실패. 중단합니다.")
                    self._save_progress()
                    return
                
                print(f"\n✅ {stage_no}막 완료!")
                self._save_progress()
            
            # 최종 병합
            print("\n" + "="*60)
            print("🎬 최종 마무리")
            print("="*60)
            
            self._finalize()
            
            print("\n" + "="*60)
            print("🎉🎉🎉 전체 동화 생성 완료! 🎉🎉🎉")
            print("="*60)
            print(f"\n📁 최종 영상: {self.file_mgr.get_final_video_path()}")
            
        except KeyboardInterrupt:
            print("\n\n👋 사용자 요청으로 중단합니다.")
            self._save_progress()
        except Exception as e:
            print(f"\n\n❌ 오류 발생: {e}")
            import traceback
            traceback.print_exc()
            self._save_progress()
    
            
            choice = self.ui.get_choice(valid_options=["1", "2", "3", "4"])
            
            if choice == "4":
                print("\n💾 진행 상황을 저장하고 종료합니다...")
                self._save_progress()
                return False
            elif choice == "3":
                custom_text = input("\n✍️ 원하는 전개를 입력하세요: ").strip()
                if not custom_text:
                    story = self.story_helper.generate_stage_story(stage_no, history)
                else:
                    validated_text = self.guardian.validate_and_sanitize(
                        custom_text, stage_no, self.config.get_blocked_words()
                    )
                    story_data = self.scenario_agent.generate_3_scene_story(
                        validated_text, stage_no, history
                    )
                    story = story_data["full_script"]
            else:
                option_idx = int(choice) - 1
                selected_text = options[option_idx]
                print(f"\n📝 선택된 스토리: {selected_text}")
                story_data = self.scenario_agent.generate_3_scene_story(
                    selected_text, stage_no, history
                )
                story = story_data["full_script"]
        
        if not story:
            print("   ❌ 스토리 생성 실패")
            return False
        
        print(f"   📝 스토리 ({len(story)}자): {story[:80]}...")
        self.stage_stories.append(story)
        
        # 나머지 로직 (이미지/영상/TTS 생성)은 그대로...
        print("\n2️⃣ 스토리를 3개 장면으로 분할 중...")
        scene_texts = self.story_helper.split_story_into_scenes(story)
        
        if len(scene_texts) != 3:
            print(f"   ❌ 장면 분할 실패")
            return False
        
        for i, scene in enumerate(scene_texts, 1):
            print(f"   🎬 장면 {i}: {scene[:50]}...")
        
        print("\n3️⃣ 이미지 3개 배치 생성 중...")
        prev_images = self._get_previous_stage_images(stage_no)
        
        if prev_images:
            print(f"   📎 이전 막 이미지 {len(prev_images)}개 레퍼런스로 사용")
        
        images = self.media.generate_stage_images(
            stage_no=stage_no,
            scene_texts=scene_texts,
            prev_stage_images=prev_images
        )
        
        self.stage_images.append(images)
        
        print("\n4️⃣ 영상 3개 생성 중...")
        videos = self.media.generate_stage_videos(
            stage_no=stage_no,
            scene_texts=scene_texts,
            stage_images=images
        )
        
        valid_videos = [v for v in videos if v and os.path.exists(v)]
        if len(valid_videos) < 3:
            print(f"   ❌ 영상 생성 실패 ({len(valid_videos)}/3)")
            return False
        
        print("\n5️⃣ 영상 병합 중...")
        merged_video = self.merger.video.merge_scenes_to_stage(stage_no, videos)
        
        if not merged_video:
            print("   ❌ 영상 병합 실패")
            return False
        
        print("\n6️⃣ TTS 생성 중...")
        tts_path = self.media.generate_stage_tts(story, stage_no)
        
        print("\n7️⃣ 영상+TTS 합성 중...")
        final_path = self.merger.muxer.mux_stage(stage_no)
        
        if not final_path:
            import shutil
            final_path = self.file_mgr.get_stage_final_path(stage_no)
            if merged_video and os.path.exists(merged_video):
                shutil.copy(merged_video, final_path)
        
        self.subtitle_mgr.add_stage_subtitle(story, duration=23.0)
        
        return True
    
    def _get_previous_stage_images(self, stage_no: int) -> List[str]:
        """이전 막의 이미지 반환"""
        if stage_no == 1:
            return []
        
        prev_idx = stage_no - 2
        if prev_idx >= 0 and prev_idx < len(self.stage_images):
            prev_images = self.stage_images[prev_idx]
            valid = [img for img in prev_images if img and os.path.exists(img)]
            if valid:
                return valid
        
        return self.file_mgr.get_stage_images(stage_no - 1)
    
    def _save_progress(self) -> None:
        """진행 상황 저장"""
        self.state.history = " ".join(self.stage_stories)
        self.state.save_progress()
    
    def _finalize(self) -> None:
        """최종 마무리"""
        srt_path = self.subtitle_mgr.save_srt()
        self.merger.process_final(srt_path)
        
        if self.stage_stories:
            full_story = "\n\n".join([
                f"[{i+1}막]\n{story}" 
                for i, story in enumerate(self.stage_stories)
            ])
            
            story_path = self.file_mgr.get_final_story_path()
            try:
                with open(story_path, "w", encoding="utf-8") as f:
                    f.write("=" * 60 + "\n")
                    f.write("흥부와 놀부 - AI 생성 동화\n")
                    f.write("=" * 60 + "\n\n")
                    f.write(full_story)
                    f.write("\n\n" + "=" * 60 + "\n")
                    f.write("끝\n")
                    f.write("=" * 60 + "\n")
                print(f"📖 스토리 저장: {story_path}")
            except Exception as e:
                print(f"⚠️ 스토리 저장 실패: {e}")