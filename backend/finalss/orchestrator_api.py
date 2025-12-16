# -*- coding: utf-8 -*-
# ==================================================================================
# orchestrator_api.py - API용 Orchestrator 래퍼
# ==================================================================================

import os
from typing import Optional, Callable
from orchestrator import Orchestrator


class OrchestratorAPI:
    """
    웹 API에서 사용할 수 있도록 수정된 Orchestrator 래퍼
    - 사용자 입력을 파라미터로 받음
    - 진행 상황 콜백 지원
    """
    
    def __init__(self, config_path: str = "config/default_config.yaml", art_style: str = "pixar"):
        # 절대 경로로 변환 (현재 파일 위치 기준)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        abs_config_path = os.path.join(script_dir, config_path)
        
        if not os.path.exists(abs_config_path):
            raise FileNotFoundError(f"설정 파일을 찾을 수 없습니다: {abs_config_path}")
        
        # Orchestrator에 art_style 전달
        self.orch = Orchestrator(abs_config_path, art_style=art_style)
        # 상태 로드 (이전 스토리 히스토리 복원)
        self.orch.state.load_progress()
        self.progress_callback: Optional[Callable] = None
    
    def get_stage_options(self, stage_no: int) -> list:
        """
        다음 단계 선택지 생성
        - 5막: Epilogue Director (결말 선택지)
        - 2~4막: Story Manager (일반 선택지)
        
        Args:
            stage_no: 옵션을 생성할 막 번호
        
        Returns:
            2개의 옵션 리스트
        """
        try:
            # 🎬 핵심: 5막 선택지는 Epilogue Director 사용!
            if stage_no == 5:
                print(f"\n🎬 Epilogue Director: 5막 결말 선택지 생성 중...")
                epilogue_data = self.orch.epilogue_director.generate_ending_options(
                    all_stories=self.orch.stage_stories,  # 1~4막 스토리
                    user_choices=[]
                )
                options = epilogue_data["options"]
                print(f"   ✅ 결말 선택지 생성 완료")
                print(f"   📖 교훈: {epilogue_data.get('moral_lesson', '')}")
                return options
            
            # 2~4막: 기존 StoryManager 사용
            cumulative_history = " ".join(self.orch.stage_stories) if self.orch.stage_stories else ""
            all_options = self.orch.story_manager.get_next_options(stage_no, cumulative_history)
            return all_options[:2]
            
        except Exception as e:
            print(f"Error generating options: {e}")
            import traceback
            traceback.print_exc()
            return [
                "옵션 생성 실패 (기본값 1)",
                "옵션 생성 실패 (기본값 2)"
            ]
    
    def set_progress_callback(self, callback: Callable[[str, int], None]):
        """
        진행 상황 콜백 설정
        callback(message: str, progress: int)
        """
        self.progress_callback = callback
    
    def _update_progress(self, message: str, progress: int):
        """진행 상황 업데이트"""
        if self.progress_callback:
            self.progress_callback(message, progress)
        print(f"[{progress}%] {message}")
    
    def run_stage_1(self) -> dict:
        """
        1막 실행 (자동 생성, 사용자 입력 불필요)
        
        Returns:
            {
                'success': bool,
                'story_text': str,
                'video_path': str,
                'images': list[str]
            }
        """
        try:
            self._update_progress("1막 디렉토리 생성 중...", 5)
            self.orch.file_mgr.ensure_all_directories()
            
            self._update_progress("1막 스토리 생성 중...", 10)
            history = ""
            story = self.orch.story_helper.generate_stage_story(1, history)
            
            if not story:
                return {'success': False, 'error': '스토리 생성 실패'}
            
            self.orch.stage_stories.append(story)
            self._update_progress(f"스토리 생성 완료: {story[:50]}...", 20)
            
            # 2. 스토리 3분할
            self._update_progress("스토리를 3개 장면으로 분할 중...", 25)
            scene_texts = self.orch.story_helper.split_story_into_scenes(story)
            
            if len(scene_texts) != 3:
                return {'success': False, 'error': f'장면 분할 실패 (3개 필요, {len(scene_texts)}개 생성)'}
            
            # 3. 이미지 3개 생성
            self._update_progress("이미지 3개 생성 중...", 30)
            images = self.orch.media.generate_stage_images(
                stage_no=1,
                scene_texts=scene_texts,
                prev_stage_images=[]
            )
            
            if not all(images):
                self._update_progress("일부 이미지 생성 실패, 계속 진행...", 50)
            else:
                self._update_progress("이미지 생성 완료", 50)
            
            self.orch.stage_images.append(images)
            
            # 4. 영상 3개 생성
            self._update_progress("영상 3개 생성 중...", 55)
            videos = self.orch.media.generate_stage_videos(
                stage_no=1,
                scene_texts=scene_texts,
                stage_images=images
            )
            
            valid_videos = [v for v in videos if v and os.path.exists(v)]
            if len(valid_videos) < 3:
                return {'success': False, 'error': f'영상 생성 실패 ({len(valid_videos)}/3)'}
            
            self._update_progress("영상 생성 완료", 70)
            
            # 5. 영상 병합 (23초)
            self._update_progress("영상 병합 중...", 75)
            merged_video = self.orch.merger.video.merge_scenes_to_stage(1, videos)
            
            if not merged_video:
                return {'success': False, 'error': '영상 병합 실패'}
            
            self._update_progress("영상 병합 완료", 85)
            
            # 6. TTS 생성
            self._update_progress("TTS 생성 중...", 88)
            tts_path = self.orch.media.generate_stage_tts(story, 1)
            
            if not tts_path:
                self._update_progress("TTS 생성 실패 (영상만 계속)", 90)
            else:
                self._update_progress("TTS 생성 완료", 90)
            
            # 7. 영상+TTS 합성
            self._update_progress("영상+TTS 합성 중...", 92)
            final_path = self.orch.merger.muxer.mux_stage(1)
            
            if not final_path:
                self._update_progress("합성 실패, 영상만 저장", 95)
                import shutil
                final_path = self.orch.file_mgr.get_stage_final_path(1)
                if merged_video and os.path.exists(merged_video):
                    shutil.copy(merged_video, final_path)
            
            # 자막 추가
            self.orch.subtitle_mgr.add_stage_subtitle(story, duration=23.0)
            
            self._update_progress("1막 완료!", 100)
            
            return {
                'success': True,
                'story_text': story,
                'video_path': final_path,
                'images': images
            }
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Error in run_stage_1: {e}")
            print(error_trace)
            return {
                'success': False,
                'error': str(e),
                'error_trace': error_trace
            }
    
    def run_stage_with_choice(self, stage_no: int, user_choice: str) -> dict:
        """
        2~5막 실행 (사용자 선택 반영)
        
        Args:
            stage_no: 막 번호 (2~5)
            user_choice: 사용자가 선택한 텍스트
        
        Returns:
            {
                'success': bool,
                'story_text': str,
                'video_path': str,
                'images': list[str]
            }
        """
        try:
            self._update_progress(f"{stage_no}막 스토리 생성 중...", 10)
            
            history = " ".join(self.orch.stage_stories) if self.orch.stage_stories else ""
            
            # Guardian: 입력 검증
            validated_text = self.orch.guardian.validate_and_sanitize(
                user_choice, stage_no, self.orch.config.get_blocked_words()
            )
            
            # Scenario: 3컷 스토리 생성
            story_data = self.orch.scenario_agent.generate_3_scene_story(
                validated_text, stage_no, history
            )
            story = story_data["full_script"]
            
            if not story:
                return {'success': False, 'error': '스토리 생성 실패'}
            
            self.orch.stage_stories.append(story)
            self._update_progress(f"스토리 생성 완료", 20)
            
            # 2. 스토리 3분할
            self._update_progress("스토리 3분할 중...", 25)
            scene_texts = self.orch.story_helper.split_story_into_scenes(story)
            
            if len(scene_texts) != 3:
                return {'success': False, 'error': f'장면 분할 실패'}
            
            # 3. 이미지 생성
            self._update_progress("이미지 생성 중...", 30)
            prev_images = self._get_previous_stage_images(stage_no)
            
            images = self.orch.media.generate_stage_images(
                stage_no=stage_no,
                scene_texts=scene_texts,
                prev_stage_images=prev_images
            )
            
            self.orch.stage_images.append(images)
            self._update_progress("이미지 생성 완료", 50)
            
            # 4. 영상 생성
            self._update_progress("영상 생성 중...", 55)
            videos = self.orch.media.generate_stage_videos(
                stage_no=stage_no,
                scene_texts=scene_texts,
                stage_images=images
            )
            
            valid_videos = [v for v in videos if v and os.path.exists(v)]
            if len(valid_videos) < 3:
                return {'success': False, 'error': '영상 생성 실패'}
            
            self._update_progress("영상 생성 완료", 70)
            
            # 5. 영상 병합
            self._update_progress("영상 병합 중...", 75)
            merged_video = self.orch.merger.video.merge_scenes_to_stage(stage_no, videos)
            
            if not merged_video:
                return {'success': False, 'error': '영상 병합 실패'}
            
            self._update_progress("영상 병합 완료", 85)
            
            # 6. TTS 생성
            self._update_progress("TTS 생성 중...", 88)
            tts_path = self.orch.media.generate_stage_tts(story, stage_no)
            
            # 7. 영상+TTS 합성
            self._update_progress("영상+TTS 합성 중...", 92)
            final_path = self.orch.merger.muxer.mux_stage(stage_no)
            
            if not final_path:
                import shutil
                final_path = self.orch.file_mgr.get_stage_final_path(stage_no)
                if merged_video and os.path.exists(merged_video):
                    shutil.copy(merged_video, final_path)
            
            self.orch.subtitle_mgr.add_stage_subtitle(story, duration=23.0)
            
            self._update_progress(f"{stage_no}막 완료!", 100)
            
            return {
                'success': True,
                'story_text': story,
                'video_path': final_path,
                'images': images
            }
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Error in run_stage_with_choice: {e}")
            print(error_trace)
            return {
                'success': False,
                'error': str(e),
                'error_trace': error_trace
            }
    
    def run_stage_5(self, user_choice: str = "") -> dict:
        """
        5막 실행 (결말 생성)
        
        Args:
            user_choice: 사용자가 선택한 결말 옵션
            
        Returns:
            {
                'success': bool,
                'story_text': str,
                'video_path': str,
                'images': list[str],
                'moral_lesson': str
            }
        """
        try:
            self._update_progress("5막(결말) 스토리 생성 중...", 10)
            
            # 1. Epilogue Director로 결말 생성
            epilogue_data = self.orch.epilogue_director.generate_ending(
                all_stories=self.orch.stage_stories,
                user_choices=[user_choice] if user_choice else []
            )
            
            story = epilogue_data["ending_story"]
            moral_lesson = epilogue_data.get("moral_lesson", "")
            
            if not story:
                return {'success': False, 'error': '결말 스토리 생성 실패'}
            
            self.orch.stage_stories.append(story)
            self._update_progress(f"결말 생성 완료: {moral_lesson}", 20)
            
            # 2. 스토리 3분할
            self._update_progress("결말 스토리 3분할 중...", 25)
            scene_texts = self.orch.story_helper.split_story_into_scenes(story)
            
            if len(scene_texts) != 3:
                # 분할 실패 시 강제로 3등분 시도
                lines = story.split('.')
                chunk_size = max(1, len(lines) // 3)
                scene_texts = [
                    '.'.join(lines[i:i+chunk_size]) + '.' 
                    for i in range(0, len(lines), chunk_size)
                ][:3]
                # 부족하면 마지막 것 복사
                while len(scene_texts) < 3:
                     scene_texts.append(scene_texts[-1])
            
            # 3. 이미지 생성
            self._update_progress("결말 이미지 생성 중...", 30)
            prev_images = self._get_previous_stage_images(5)
            
            images = self.orch.media.generate_stage_images(
                stage_no=5,
                scene_texts=scene_texts,
                prev_stage_images=prev_images
            )
            
            self.orch.stage_images.append(images)
            self._update_progress("이미지 생성 완료", 50)
            
            # 4. 영상 생성
            self._update_progress("결말 영상 생성 중...", 55)
            videos = self.orch.media.generate_stage_videos(
                stage_no=5,
                scene_texts=scene_texts,
                stage_images=images
            )
            
            valid_videos = [v for v in videos if v and os.path.exists(v)]
            if len(valid_videos) < 3:
                return {'success': False, 'error': '영상 생성 실패'}
            
            self._update_progress("영상 생성 완료", 70)
            
            # 5. 영상 병합
            self._update_progress("영상 병합 중...", 75)
            merged_video = self.orch.merger.video.merge_scenes_to_stage(5, videos)
            
            if not merged_video:
                return {'success': False, 'error': '영상 병합 실패'}
            
            self._update_progress("영상 병합 완료", 85)
            
            # 6. TTS 생성
            self._update_progress("TTS 생성 중...", 88)
            tts_path = self.orch.media.generate_stage_tts(story, 5)
            
            # 7. 영상+TTS 합성
            self._update_progress("영상+TTS 합성 중...", 92)
            final_path = self.orch.merger.muxer.mux_stage(5)
            
            if not final_path:
                import shutil
                final_path = self.orch.file_mgr.get_stage_final_path(5)
                if merged_video and os.path.exists(merged_video):
                    shutil.copy(merged_video, final_path)
            
            # 자막 및 교훈 저장
            self.orch.subtitle_mgr.add_stage_subtitle(story, duration=23.0)
            
            self._update_progress("5막 완료!", 100)
            
            return {
                'success': True,
                'story_text': story,
                'video_path': final_path,
                'images': images,
                'moral_lesson': moral_lesson
            }
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Error in run_stage_5: {e}")
            print(error_trace)
            return {
                'success': False,
                'error': str(e),
                'error_trace': error_trace
            }
    
    def _get_previous_stage_images(self, stage_no: int) -> list:
        """이전 막의 이미지 반환"""
        if stage_no == 1:
            return []
        
        prev_idx = stage_no - 2
        if prev_idx >= 0 and prev_idx < len(self.orch.stage_images):
            prev_images = self.orch.stage_images[prev_idx]
            valid = [img for img in prev_images if img and os.path.exists(img)]
            if valid:
                return valid
        
        return self.orch.file_mgr.get_stage_images(stage_no - 1)
    
    def finalize_complete_video(self) -> dict:
        """
        5개 막을 하나의 최종 영상으로 병합
        
        Returns:
            {
                'success': bool,
                'final_video_path': str,
                'final_video_url': str,
                'total_duration': float
            }
        """
        try:
            self._update_progress("최종 영상 병합 준비 중...", 5)
            
            # 자막 없이 병합 (사용자 요청)
            srt_path = None
            
            self._update_progress("5개 막 영상 병합 중...", 20)
            
            # 최종 병합 실행 (MergeManager.process_final 호출)
            result = self.orch.merger.process_final(srt_path=srt_path)
            
            if result:
                final_video_path = self.orch.file_mgr.get_final_video_path()
                
                # 영상 길이 확인
                try:
                    duration = self.orch.merger.muxer._get_duration(final_video_path)
                except:
                    duration = 0.0
                
                self._update_progress("최종 영상 완성!", 100)
                
                print(f"\n{'='*60}")
                print(f"🎉 최종 영상 병합 완료!")
                print(f"   경로: {final_video_path}")
                print(f"   길이: {duration:.2f}초")
                print(f"{'='*60}\n")
                
                return {
                    'success': True,
                    'final_video_path': final_video_path,
                    'final_video_url': f"/final/{os.path.basename(final_video_path)}",
                    'total_duration': duration,
                    'message': '전체 영상 병합 완료'
                }
            else:
                return {
                    'success': False,
                    'error': '최종 병합 실패'
                }
                
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"❌ 최종 병합 오류: {e}")
            print(error_trace)
            return {
                'success': False,
                'error': str(e),
                'error_trace': error_trace
            }
