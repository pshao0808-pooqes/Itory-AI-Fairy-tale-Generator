# ==================================================================================
# managers/media_generator.py - 미디어 생성 관리 (배치 생성 + 스타일 적용)
# ==================================================================================

import os
import time
from typing import List, Optional
from pathlib import Path

from google.genai import types

from .config_manager import ConfigManager
from .file_manager import FileManager
from .state_manager import StateManager


class MediaGenerator:
    """
    미디어 생성 관리 클래스
    - 배치 이미지 생성 (3개 씬을 같은 스타일로)
    - 스타일 적용 영상 생성 (이미지와 동일한 그림체)
    - 이미지 참조 기반 캐릭터 일관성 유지
    """
    
    # 스타일 매핑
    STYLE_PROMPTS = {
        "realistic": "Photorealistic style, highly detailed textures, natural lighting, cinematic composition, lifelike characters and environments",
        "cartoon_2d": "2D cartoon animation style, vibrant flat colors, hand-drawn aesthetic, expressive characters, clean linework, friendly atmosphere",
        "cartoon_3d": "3D cartoon style, exaggerated proportions, playful character designs, bright colors, soft shadows, family-friendly tone",
        "pixar": "Pixar 3D animation style, cinematic lighting, rich textures, depth of field, emotionally expressive characters, high-quality rendering, warm color palette",
        "watercolor": "Watercolor painting style, soft brush strokes, pastel colors, dreamy atmosphere, artistic texture, gentle color blending, storybook illustration feel"
    }
    
    def __init__(self, config, file_mgr, state, art_style="pixar", 
                 art_director=None, motion_director=None):
        self.config = config
        self.file_mgr = file_mgr
        self.state = state
        self.art_style = art_style
        self.art_director = art_director
        self.motion_director = motion_director
    
    # ============== 배치 이미지 생성 ==============
    
    def generate_stage_images(
        self,
        stage_no: int,
        scene_texts: List[str],
        prev_stage_images: List[str] = None
    ) -> List[str]:
        """이미지 3개를 배치 생성"""
        print(f"\n📸 [{stage_no}막] 이미지 3개 배치 생성 중...")
        
        # 이미 존재하면 스킵
        existing_images = []
        all_exist = True
        for i in range(1, 4):
            path = self.file_mgr.get_stage_image_path(stage_no, i)
            if os.path.exists(path):
                existing_images.append(path)
            else:
                all_exist = False
                break
        
        if all_exist:
            print(f"   ⭐ 이미 모두 존재함, 스킵")
            return existing_images
        
        # 배치 프롬프트 생성
        batch_prompt = self._create_batch_prompt(scene_texts)
        image_refs = prev_stage_images if prev_stage_images else []
        
        # API 호출
        generated_images = self._generate_batch_images(
            prompt=batch_prompt,
            image_refs=image_refs,
            stage_no=stage_no
        )
        
        return generated_images
    
    def _create_batch_prompt(self, scene_texts: List[str]) -> str:
        """3개 씬을 위한 통합 프롬프트"""
        style_desc = self.STYLE_PROMPTS.get(self.art_style, self.STYLE_PROMPTS["pixar"])
        
        prompt = f"""Create 3 sequential story images in {style_desc}.

CRITICAL REQUIREMENTS:
- Use EXACTLY THE SAME visual style, lighting, and rendering quality for all 3 images
- Maintain consistent character appearance across all images (if reference images provided, match them precisely)
- Natural story progression from Scene 1 → Scene 2 → Scene 3
- No text, labels, or subtitles in any image
- Family-friendly, G-rated content only

Scene 1: {scene_texts[0]}

Scene 2: {scene_texts[1]}

Scene 3: {scene_texts[2]}

STYLE CONSISTENCY: All 3 images must look like they belong to the same animation/illustration series. Same art direction, same color palette, same character designs.
"""
        return prompt
    
    def _generate_batch_images(
        self,
        prompt: str,
        image_refs: List[str],
        stage_no: int
    ) -> List[str]:
        """배치 이미지 생성 (같은 프롬프트로 3번 연속)"""
        images = []
        
        for scene_idx in range(1, 4):
            output_path = self.file_mgr.get_stage_image_path(stage_no, scene_idx)
            
            if os.path.exists(output_path):
                print(f"   ⭐ 씬 {scene_idx} 이미 존재함")
                images.append(output_path)
                continue
            
            image_path = self._call_image_api(
                prompt=prompt,
                image_refs=image_refs,
                output_path=output_path,
                scene_idx=scene_idx
            )
            
            if image_path:
                images.append(image_path)
                print(f"   ✅ 씬 {scene_idx} 생성 완료")
            else:
                images.append(None)
                print(f"   ❌ 씬 {scene_idx} 생성 실패")
        
        return images
    
    def _call_image_api(
        self,
        prompt: str,
        image_refs: List[str],
        output_path: str,
        scene_idx: int
    ) -> Optional[str]:
        """단일 이미지 API 호출"""
        while True:
            try:
                client = self.config.get_google_client()
                
                # 이미지 레퍼런스 준비
                contents = [prompt]
                if image_refs:
                    print(f"      📎 이미지 레퍼런스 {len(image_refs)}개 사용")
                    for ref_path in image_refs[:3]:
                        if os.path.exists(ref_path):
                            with open(ref_path, "rb") as f:
                                img_bytes = f.read()
                            mime = "image/png" if ref_path.endswith(".png") else "image/jpeg"
                            img_part = types.Part.from_bytes(data=img_bytes, mime_type=mime)
                            contents.insert(0, img_part)
                
                # API 호출
                response = client.models.generate_content(
                    model=self.config.get_model("image"),
                    contents=contents
                )
                
                if not response.parts:
                    print(f"      ❌ 응답에 parts 없음")
                    return None
                
                for part in response.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        image_obj = part.as_image()
                        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
                        image_obj.save(output_path)
                        return output_path
                
                print(f"      ❌ inline_data 없음")
                return None
                
            except Exception as e:
                error_str = str(e)
                print(f"      ⚠️ 이미지 생성 오류: {error_str}")
                
                is_quota_error = (
                    "429" in error_str or 
                    "RESOURCE_EXHAUSTED" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    print(f"      🔄 할당량 초과, API 키 교체...")
                    if self.config.rotate_google_key():
                        print(f"      ✅ 다음 API 키로 재시도")
                        continue
                    else:
                        print(f"      ❌ 모든 API 키 소진")
                        return None
                else:
                    print(f"      ❌ 복구 불가능한 오류")
                    return None
    
    # ============== 영상 생성 (스타일 적용!) ==============
    
    def generate_stage_videos(
        self,
        stage_no: int,
        scene_texts: List[str],
        stage_images: List[str]
    ) -> List[str]:
        """영상 3개 생성"""
        print(f"\n🎥 [{stage_no}막] 영상 3개 생성 중...")
        videos = []
        for scene_idx in range(3):
            video_path = self._generate_single_video(
                stage_no=stage_no,
                scene_idx=scene_idx + 1,
                scene_text=scene_texts[scene_idx],
                image_path=stage_images[scene_idx]
            )
            videos.append(video_path)
            if video_path:
                print(f"   ✅ 장면 {scene_idx + 1} 영상 완료")
            else:
                print(f"   ❌ 장면 {scene_idx + 1} 영상 실패")
        return videos
    
    def _generate_single_video(
        self,
        stage_no: int,
        scene_idx: int,
        scene_text: str,
        image_path: str
    ) -> Optional[str]:
        """단일 영상 생성 (스타일 적용!)"""
        output_path = self.file_mgr.get_stage_video_path(stage_no, scene_idx)
        
        if os.path.exists(output_path):
            print(f"      ⭐ 이미 존재함, 스킵")
            return output_path
        
        if not image_path or not os.path.exists(image_path):
            print(f"      ❌ 레퍼런스 이미지 없음")
            return None
        
        # 프롬프트 생성 (핵심: art_style 전달!)
        if self.motion_director:
            vid_prompt = self.motion_director.create_motion_prompt(
                scene_text=scene_text,
                art_style=self.art_style,  # 웹에서 선택한 스타일 전달!
                blocked_words=self.config.get_blocked_words()
            )
        else:
            # 폴백: 스타일 직접 적용
            style_prefix = self.STYLE_PROMPTS.get(self.art_style, self.STYLE_PROMPTS["pixar"])
            vid_prompt = f"{style_prefix}\nScene: {scene_text}"
        
        print(f"      🎨 영상 스타일: {self.art_style}")
        
        while True:
            try:
                client = self.config.get_google_client()
                
                # 이미지 레퍼런스
                mime_type = "image/png" if image_path.endswith('.png') else "image/jpeg"
                with open(image_path, "rb") as f:
                    image_bytes = f.read()
                
                ref_image = types.Image(image_bytes=image_bytes, mime_type=mime_type)
                ref_obj = types.VideoGenerationReferenceImage(
                    image=ref_image,
                    reference_type="asset"
                )
                
                # API 호출
                operation = client.models.generate_videos(
                    model=self.config.get_model("video"),
                    prompt=vid_prompt,
                    config=types.GenerateVideosConfig(
                        reference_images=[ref_obj]
                    )
                )
                
                # 폴링
                print(f"      ⏳ 렌더링 시작...")
                wait_count = 0
                while not operation.done:
                    wait_count += 1
                    if wait_count % 6 == 0:
                        print(f"      ⏳ 렌더링 중... ({wait_count * 10}초)")
                    time.sleep(10)
                    operation = client.operations.get(operation)
                
                if operation.response and operation.response.generated_videos:
                    video = operation.response.generated_videos[0]
                    client.files.download(file=video.video)
                    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
                    video.video.save(output_path)
                    return output_path
                else:
                    print(f"      ❌ 영상 생성 실패")
                    return None
                    
            except Exception as e:
                error_str = str(e)
                print(f"      ⚠️ 영상 생성 오류: {error_str}")
                
                is_quota_error = (
                    "429" in error_str or 
                    "RESOURCE_EXHAUSTED" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    print(f"      🔄 할당량 초과, API 키 교체...")
                    if self.config.rotate_google_key():
                        print(f"      ✅ 다음 API 키로 재시도")
                        continue
                    else:
                        print(f"      ❌ 모든 API 키 소진")
                        return None
                else:
                    print(f"      ❌ 복구 불가능한 오류")
                    return None
    
    # ============== TTS 생성 ==============
    
    def generate_stage_tts(self, text: str, stage_no: int) -> Optional[str]:
        """TTS 생성"""
        output_path = self.file_mgr.get_stage_tts_path(stage_no)
        
        if os.path.exists(output_path):
            print(f"   ⭐ TTS 이미 존재함, 스킵")
            return output_path
        
        print(f"\n🔊 [{stage_no}막] TTS 생성 중...")
        
        tts_config = self.config.get_tts_config()
        
        while True:
            client = self.config.get_eleven_client()
            if not client:
                print("   ⚠️ ElevenLabs 클라이언트 없음, TTS 스킵")
                return None

            try:
                audio_generator = client.text_to_speech.convert(
                    voice_id=tts_config.get("voice_id", ""),
                    text=text,
                    model_id=tts_config.get("model_id", "eleven_multilingual_v2")
                )
                
                audio_bytes = b"".join(chunk for chunk in audio_generator)
                
                Path(output_path).parent.mkdir(parents=True, exist_ok=True)
                with open(output_path, "wb") as f:
                    f.write(audio_bytes)
                
                from pydub import AudioSegment
                audio = AudioSegment.from_mp3(output_path)
                tts_duration = len(audio) / 1000.0
                
                print(f"   🎵 TTS {tts_duration:.1f}초 ({len(text)}자)")
                return output_path
                    
            except Exception as e:
                error_str = str(e)
                print(f"   ⚠️ TTS 생성 오류: {error_str}")
                
                is_quota_error = (
                    "429" in error_str or 
                    "quota" in error_str.lower() or
                    "rate" in error_str.lower()
                )
                
                if is_quota_error:
                    print(f"   🔄 할당량 초과, API 키 교체...")
                    if self.config.rotate_eleven_key():
                        print(f"   ✅ 다음 API 키로 재시도")
                        continue
                    else:
                        print(f"   ❌ 모든 API 키 소진")
                        return None
                else:
                    print(f"   ❌ 복구 불가능한 오류")
                    return None