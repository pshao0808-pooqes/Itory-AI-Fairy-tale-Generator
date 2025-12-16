# ==================================================================================
# managers/merge_manager.py - 영상/오디오 병합 관리 (수정: 길이 동기화)
# ==================================================================================

import os
import subprocess
import shutil
from io import BytesIO
from typing import List, Optional

from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.video.fx.all import speedx
from .config_manager import ConfigManager
from .file_manager import FileManager
from .state_manager import StateManager


class VideoMerger:
    """영상 병합 전담 클래스 (FFmpeg 사용)"""
    
    def __init__(self, config: ConfigManager, file_mgr: FileManager):
        self.config = config
        self.file_mgr = file_mgr
    
    def merge_scenes_to_stage(self, stage_no: int, scene_files: List[str]) -> Optional[str]:
        """
        3개 씬 영상을 하나로 합침 (FFmpeg xfade)
        8초 x 3 = 24초 → crossfade 적용 → 23초
        """
        output_path = self.file_mgr.get_stage_merged_video_path(stage_no)
        video_config = self.config.get_video_config()
        crossfade = video_config.get("crossfade_duration", 0.5)
        
        print(f"\n🎞️ [FFmpeg] Stage {stage_no} 영상 병합 중...")
        
        # 파일 검증
        valid_files = [f for f in scene_files if f and os.path.exists(f)]
        if len(valid_files) != 3:
            print(f"      ⚠️ 유효한 파일 {len(valid_files)}개 (3개 필요)")
            return None
        
        try:
            # 각 영상 길이 확인
            durations = []
            for vf in valid_files:
                dur = self._get_video_duration(vf)
                durations.append(dur)
                print(f"      📹 {os.path.basename(vf)}: {dur:.2f}초")
            
            # xfade offset 계산 (각 영상 길이 기반)
            offset1 = durations[0] - crossfade
            offset2 = offset1 + durations[1] - crossfade
            
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", valid_files[0],
                "-i", valid_files[1],
                "-i", valid_files[2],
                "-filter_complex",
                f"[0:v][1:v]xfade=transition=fade:duration={crossfade}:offset={offset1:.2f}[v01];"
                f"[v01][2:v]xfade=transition=fade:duration={crossfade}:offset={offset2:.2f}[vout]",
                "-map", "[vout]",
                "-c:v", video_config.get("codec", "libx264"),
                "-preset", video_config.get("preset", "medium"),
                "-crf", str(video_config.get("crf", 23)),
                output_path
            ]
            
            result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
            
            if os.path.exists(output_path):
                final_dur = self._get_video_duration(output_path)
                print(f"      ✅ 병합 완료: {final_dur:.2f}초")
                return output_path
            else:
                print(f"      ❌ 병합 실패: {result.stderr[:200] if result.stderr else 'Unknown error'}")
                return None
                
        except Exception as e:
            print(f"   ❌ 병합 오류: {e}")
            return None
    
    def _get_video_duration(self, video_path: str) -> float:
        """FFprobe로 영상 길이 확인"""
        try:
            cmd = [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                video_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return float(result.stdout.strip())
        except:
            return 8.0  # 기본값


class AudioMerger:
    """오디오 병합 전담 클래스"""
    
    def __init__(self, config: ConfigManager, file_mgr: FileManager):
        self.config = config
        self.file_mgr = file_mgr
    
    def merge_stages_to_final(self, num_stages: int = 5) -> Optional[str]:
        """5개 stage TTS를 하나로 병합"""
        output_path = self.file_mgr.get_final_tts_path()
        
        print("\n🎧 [TTS] 전체 TTS 병합 중...")
        
        combined = BytesIO()
        for stage_no in range(1, num_stages + 1):
            path = self.file_mgr.get_stage_tts_path(stage_no)
            if not os.path.exists(path):
                print(f"   ⚠️ Stage {stage_no} TTS 없음")
                continue
            with open(path, "rb") as f:
                combined.write(f.read())
        
        if combined.tell() == 0:
            print("   ⚠️ 병합할 TTS 없음")
            return None
        
        with open(output_path, "wb") as f:
            f.write(combined.getvalue())
        
        print(f"   ✅ 전체 TTS 완료: {output_path}")
        return output_path


class AVMuxer:
    """영상+오디오 합성 전담 클래스 (길이 동기화 포함)"""
    
    def __init__(self, config: ConfigManager, file_mgr: FileManager):
        self.config = config
        self.file_mgr = file_mgr
    
    def mux_stage(self, stage_no: int) -> Optional[str]:
        """
        stage 영상 + TTS 합성 (길이 동기화)
        """
        video_path = self.file_mgr.get_stage_merged_video_path(stage_no)
        audio_path = self.file_mgr.get_stage_tts_path(stage_no)
        output_path = self.file_mgr.get_stage_final_path(stage_no)
        
        if not os.path.exists(video_path):
            print(f"❌ Stage {stage_no}: 영상 없음")
            return None
        if not os.path.exists(audio_path):
            print(f"⚠️ Stage {stage_no}: 오디오 없음, 영상만 사용")
            # 오디오 없으면 영상만 복사 (Windows 호환)
            shutil.copy(video_path, output_path)
            return output_path if os.path.exists(output_path) else None
        
        print(f"\n🎧 Stage {stage_no}: 영상+오디오 합성 중...")
        
        try:
            video_clip = VideoFileClip(video_path)
            audio_clip = AudioFileClip(audio_path)
            
            video_dur = video_clip.duration
            audio_dur = audio_clip.duration
            
            print(f"   📹 영상: {video_dur:.2f}초")
            print(f"   🔊 오디오: {audio_dur:.2f}초")
            
            # 길이 동기화
            if abs(video_dur - audio_dur) > 0.5:
                if audio_dur > video_dur:
                    # 오디오가 길면 자르기
                    print(f"   ✂️ 오디오 {audio_dur:.2f}초 → {video_dur:.2f}초로 자름")
                    audio_clip = audio_clip.subclip(0, video_dur)
                else:
                    # 오디오가 짧으면 영상 속도 조절
                    speed_factor = video_dur / audio_dur
                    if speed_factor <= 1.15:  # 15% 이내만 조절
                        print(f"   🔄 영상 속도 {speed_factor:.2f}배로 조절")
                        video_clip = video_clip.fx(speedx, 1/speed_factor)
                    else:
                        print(f"   ⚠️ 속도 차이 과다, 오디오 끝에서 자름")
            
            # 합성
            final_clip = video_clip.set_audio(audio_clip)
            
            video_config = self.config.get_video_config()
            final_clip.write_videofile(
                output_path, 
                fps=video_config.get("fps", 24),
                logger=None  # 로그 숨김
            )
            
            # 정리
            video_clip.close()
            audio_clip.close()
            final_clip.close()
            
            print(f"   ✅ Stage {stage_no}: 완료")
            return output_path
            
        except Exception as e:
            print(f"   ❌ Stage {stage_no}: 합성 실패: {e}")
            return None
    
    def build_final_video(self, num_stages: int = 5, srt_path: str = None) -> Optional[str]:  # <-- 인자 추가
        """5개 stage 최종 영상을 하나로 병합 (FFmpeg concat + 자막)"""
        output_path = self.file_mgr.get_final_video_path()
        list_filename = "inputs.txt"
        
        print("\n🎬 최종 영상 병합 중...")
        
        try:            
            # 파일 리스트 생성
            valid_count = 0
            with open(list_filename, "w", encoding="utf-8") as f:
                for stage_no in range(1, num_stages + 1):
                    path = self.file_mgr.get_stage_final_path(stage_no)
                    if os.path.exists(path):
                        f.write(f"file '{path}'\n")
                        valid_count += 1
                    else:
                        print(f"   ⚠️ Stage {stage_no} 최종 영상 없음")
            
            if valid_count == 0:
                print("   ❌ 병합할 영상 없음")
                return None
            
            # FFmpeg 명령어 구성
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", list_filename,
            ]

            # [추가] 자막이 있으면 필터 적용
            if srt_path and os.path.exists(srt_path):
                # 윈도우 경로 역슬래시(\)를 슬래시(/)로 변경해야 FFmpeg가 인식함
                clean_srt_path = srt_path.replace("\\", "/").replace(":", "\\:")
                
                # 자막 스타일 설정 (맑은고딕, 노란색, 검은테두리)
                style = "FontName=Malgun Gothic,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0,MarginV=30"
                
                ffmpeg_cmd.extend([
                    "-vf", f"subtitles='{clean_srt_path}':force_style='{style}'",
                    "-c:v", "libx264",  # 자막을 구우려면 재인코딩 필수
                    "-c:a", "copy",
                    "-preset", "fast",
                    "-crf", "23"
                ])
            else:
                # 자막 없으면 그냥 복사 (기존 방식)
                ffmpeg_cmd.extend(["-c", "copy"])

            ffmpeg_cmd.append(output_path)
            
            # 실행
            subprocess.run(ffmpeg_cmd, capture_output=True)
            
            # 정리
            if os.path.exists(list_filename):
                os.remove(list_filename)
            
            if os.path.exists(output_path):
                # 최종 길이 확인
                dur = self._get_duration(output_path)
                print(f"   🎉 최종 완성: {output_path} ({dur:.2f}초)")
                return output_path
            
            return None
            
        except Exception as e:
            print(f"   ❌ 최종 병합 오류: {e}")
            return None
    
    def _get_duration(self, file_path: str) -> float:
        """파일 길이 확인"""
        try:
            cmd = [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                file_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return float(result.stdout.strip())
        except:
            return 0.0


class MergeManager:
    """병합 작업 통합 인터페이스"""
    
    def __init__(self, config: ConfigManager, file_mgr: FileManager, state: StateManager):
        self.config = config
        self.file_mgr = file_mgr
        self.state = state
        
        self.video = VideoMerger(config, file_mgr)
        self.audio = AudioMerger(config, file_mgr)
        self.muxer = AVMuxer(config, file_mgr)
    
    def process_final(self, srt_path: str = None) -> bool:  # <-- 인자 추가
        """전체 완료 시 호출: 최종 영상 빌드"""
        print(f"\n{'='*60}")
        print(f"🎬 최종 영상 생성")
        print(f"{'='*60}")
        
        # 전체 TTS 병합
        self.audio.merge_stages_to_final()
        
        # 전체 영상 빌드 (자막 경로 전달)
        result = self.muxer.build_final_video(srt_path=srt_path)  # <-- 인자 전달
        return result is not None