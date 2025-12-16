# ==================================================================================
# utils/user_interaction.py - 사용자 인터페이스 클래스
# ==================================================================================

from typing import Any, Dict, List, Optional


class UserInteraction:
    """
    사용자 입력/출력을 담당하는 클래스.
    - 콘솔 UI 분리
    - 나중에 GUI/웹으로 교체 가능
    """
    
    def __init__(self, config=None):
        self.config = config
    
    # ============== 시작 화면 ==============
    
    def show_welcome(self) -> None:
        """프로그램 시작 화면 표시"""
        print("\n" + "=" * 60)
        print("🎬 흥부와 놀부 인터랙티브 스토리 메이커")
        print("=" * 60)
        print("이 프로그램은 5단계 구성(총 15씬)을 순차적으로 진행합니다.")
        print("각 단계에서 3번의 스토리 선택 및 미디어 생성이 필요합니다.")
    
    def wait_for_start(self) -> bool:
        """사용자가 시작할 때까지 대기"""
        try:
            input("\n▶️ 시작하려면 Enter 키를 누르세요...")
            return True
        except KeyboardInterrupt:
            print("\n\n👋 사용자가 취소했습니다.")
            return False
    
    # ============== 스테이지 표시 ==============
    
    def show_stage_start(self, stage_no: int, stage_info: Dict[str, Any]) -> None:
        """스테이지 시작 표시"""
        name = stage_info.get("name", f"Stage {stage_no}")
        description = stage_info.get("description", "")
        turns = stage_info.get("turns", [])
        
        turn_range = f"턴 {turns[0]}~{turns[-1]}" if turns else ""
        
        print(f"\n\n{'='*60}")
        print(f"🚀 Stage {stage_no}: {name} ({description}) - {turn_range} 시작")
        print(f"{'='*60}")
    
    def show_stage_complete(self, stage_no: int) -> None:
        """스테이지 완료 표시"""
        stage_names = {1: "발단", 2: "전개", 3: "위기", 4: "절정", 5: "결말"}
        name = stage_names.get(stage_no, f"Stage {stage_no}")
        print(f"\n🎉 Stage {stage_no} ({name}) 완료! 다음 단계로 넘어갈 준비가 되었습니다.")
    
    # ============== 진행 상황 표시 ==============
    
    def show_progress(self, current_turn: int, end_turn: int, stage_name: str) -> None:
        """현재 진행 상황 표시"""
        print(f"\n📄 **[현재 턴] {current_turn} / {end_turn} ({stage_name})**")
    
    def show_history_preview(self, history: str, max_chars: int = 150) -> None:
        """현재 스토리 히스토리 미리보기"""
        preview = history[-max_chars:] if len(history) > max_chars else history
        if len(history) > max_chars:
            preview = "..." + preview
        print(f"\n📜 [현재 스토리] {preview}")
    
    # ============== 옵션 표시 및 선택 ==============
    
    def display_options(self, options: List[str], stage_info: Dict[str, Any], 
                        turn: int) -> None:
        """선택지 표시"""
        stage_name = stage_info.get("name", "")
        
        print(f"\n👇 다음 장면을 선택하세요 [{stage_name} 단계, {turn}번째 씬]:")
        
        if len(options) < 3:
            print("   ⚠️ 옵션 생성 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 5를 입력해 종료하세요.")
            return
        
        for i, opt in enumerate(options):
            print(f"   {i+1}. {opt}")
        print("   5. 🛑 저장 후 종료")
    
    def get_choice(self, valid_options: List[str] = None) -> str:
        """
        사용자 선택 입력 받기
        반환: 선택된 값 (문자열)
        """
        if valid_options is None:
            valid_options = ["1", "2", "3", "5"]
        
        while True:
            try:
                choice = input("\n번호 입력 >> ").strip()
                
                if choice in valid_options:
                    return choice
                else:
                    print(f"⚠️ {', '.join(valid_options)} 중 숫자를 입력해주세요.")
                    
            except KeyboardInterrupt:
                print("\n\n👋 사용자가 취소했습니다.")
                return "4"  # 저장 후 종료로 처리
    
    def get_choice_with_auto(self, valid_options: List[str] = None,
                              auto_choice: str = None) -> str:
        """
        자동 모드 지원 선택
        auto_choice가 지정되면 자동으로 해당 값 반환
        """
        if auto_choice and auto_choice in (valid_options or ["1", "2", "3", "5"]):
            print(f"\n번호 입력 >> {auto_choice} (자동 선택)")
            return auto_choice
        return self.get_choice(valid_options)
    
    # ============== 확인 프롬프트 ==============
    
    def confirm_proceed(self, message: str) -> bool:
        """Y/N 확인"""
        try:
            response = input(f"\n{message} (Y/n): ").strip().lower()
            return response != 'n'
        except KeyboardInterrupt:
            return False
    
    def wait_for_next_stage(self, current_stage: int, next_stage: int) -> bool:
        """다음 스테이지 진행 대기"""
        try:
            input(f"\n[다음 단계 준비] Stage {current_stage} 완료. Stage {next_stage}로 넘어가려면 Enter 키를 누르세요.")
            return True
        except KeyboardInterrupt:
            return False
    
    # ============== 메시지 표시 ==============
    
    def show_success(self, message: str) -> None:
        """성공 메시지"""
        print(f"\n✅ {message}")
    
    def show_error(self, message: str) -> None:
        """에러 메시지"""
        print(f"\n❌ {message}")
    
    def show_warning(self, message: str) -> None:
        """경고 메시지"""
        print(f"\n⚠️ {message}")
    
    def show_info(self, message: str) -> None:
        """정보 메시지"""
        print(f"\n💡 {message}")
    
    def show_selected(self, selected_text: str) -> None:
        """선택된 스토리 표시"""
        print(f"\n📝 선택된 스토리: {selected_text}")
    
    # ============== 완료 화면 ==============
    
    def show_final_complete(self, video_path: str = None, story_path: str = None) -> None:
        """최종 완료 화면"""
        print("\n" + "=" * 60)
        print("🌟🌟🌟 프로젝트 완료! 🌟🌟🌟")
        print("=" * 60)
        
        if video_path:
            print(f"🎬 최종 영상: {video_path}")
        if story_path:
            print(f"📖 완성된 이야기: {story_path}")
        
        print("\n감사합니다! 🎉")
    
    def show_partial_complete(self, completed_stages: int, total_stages: int = 5) -> None:
        """부분 완료 화면 (중간에 종료 시)"""
        print(f"\n📊 진행 상황: {completed_stages}/{total_stages} 스테이지 완료")
        print("💾 현재까지의 진행 상황이 저장되었습니다.")
        print("다음에 다시 실행하면 이어서 진행할 수 있습니다.")