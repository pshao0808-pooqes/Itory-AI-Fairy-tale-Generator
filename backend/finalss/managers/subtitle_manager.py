import os

class SubtitleManager:
    def __init__(self, output_path: str = "output/final/subtitles.srt"):
        self.output_path = output_path
        self.subtitles = []  # (start_time, end_time, text)
        self.current_time = 0.0

    def add_stage_subtitle(self, text: str, duration: float = 23.0):
        """
        한 막(Stage)의 자막을 추가합니다.
        text: 자막 내용 (스토리)
        duration: 해당 막의 길이 (초, 기본값 23초)
        """
        start = self.current_time
        end = start + duration
        
        # 텍스트 정리 (줄바꿈 등)
        clean_text = text.replace("\n", " ").strip()
        
        self.subtitles.append({
            "start": start,
            "end": end,
            "text": clean_text
        })
        
        # 다음 막 시작 시간 갱신
        self.current_time = end

    def save_srt(self):
        """SRT 파일로 저장"""
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        
        with open(self.output_path, "w", encoding="utf-8") as f:
            for i, sub in enumerate(self.subtitles, 1):
                # 시간 포맷 변환 (초 -> 00:00:00,000)
                start_str = self._format_time(sub["start"])
                end_str = self._format_time(sub["end"])
                
                f.write(f"{i}\n")
                f.write(f"{start_str} --> {end_str}\n")
                f.write(f"{sub['text']}\n\n")
        
        print(f"📝 자막 파일 생성 완료: {self.output_path}")
        return self.output_path

    def get_srt_path(self) -> str:
        """현재까지의 자막을 저장하고 경로 반환"""
        return self.save_srt()

    def _format_time(self, seconds: float) -> str:
        """초를 SRT 시간 형식으로 변환"""
        # 예: 125.5 -> 00:02:05,500
        millis = int((seconds % 1) * 1000)
        seconds = int(seconds)
        mins, secs = divmod(seconds, 60)
        hours, mins = divmod(mins, 60)
        return f"{hours:02}:{mins:02}:{secs:02},{millis:03}"