# ==================================================================================
# utils/retry_handler.py - 재시도 처리 클래스
# ==================================================================================

import time
from typing import Any, Callable, List, Optional


class MaxRetriesExceeded(Exception):
    """최대 재시도 횟수 초과 예외"""
    pass


class RetryHandler:
    """
    API 호출 등에 대한 재시도 로직을 처리하는 클래스.
    - 고정 대기 / 지수 백오프 지원
    - 재시도 가능한 에러 코드 지정
    - 폴백 함수 지원
    """
    
    def __init__(self, max_attempts: int = 3, backoff: str = "exponential",
                 base_delay: float = 2.0, retryable_codes: List[int] = None):
        """
        Args:
            max_attempts: 최대 시도 횟수
            backoff: "fixed" (고정 대기) | "exponential" (지수 백오프)
            base_delay: 기본 대기 시간 (초)
            retryable_codes: 재시도 가능한 HTTP 에러 코드 목록
        """
        self.max_attempts = max_attempts
        self.backoff = backoff
        self.base_delay = base_delay
        self.retryable_codes = retryable_codes or [429, 500, 503]
    
    @classmethod
    def from_config(cls, config_dict: dict) -> "RetryHandler":
        """ConfigManager의 retry 설정으로부터 생성"""
        return cls(
            max_attempts=config_dict.get("max_attempts", 3),
            backoff=config_dict.get("backoff", "exponential"),
            base_delay=config_dict.get("base_delay", 2.0),
            retryable_codes=config_dict.get("retryable_codes", [429, 500, 503])
        )
    
    def _calculate_delay(self, attempt: int) -> float:
        """
        대기 시간 계산
        attempt: 0부터 시작하는 시도 횟수
        """
        if self.backoff == "exponential":
            # 지수 백오프: 2, 4, 8, 16, ...
            return self.base_delay * (2 ** attempt)
        else:
            # 고정 대기
            return self.base_delay
    
    def _is_retryable(self, error: Exception) -> bool:
        """에러가 재시도 가능한지 확인"""
        # API 에러 코드 확인
        if hasattr(error, 'code'):
            return error.code in self.retryable_codes
        
        # HTTP 상태 코드 확인 (requests 등)
        if hasattr(error, 'status_code'):
            return error.status_code in self.retryable_codes
        
        # 일반적인 네트워크 에러는 재시도
        retryable_types = (
            ConnectionError,
            TimeoutError,
        )
        return isinstance(error, retryable_types)
    
    def execute(self, func: Callable, *args, **kwargs) -> Any:
        """
        재시도 로직으로 함수 실행
        
        Args:
            func: 실행할 함수
            *args, **kwargs: 함수에 전달할 인자
            
        Returns:
            함수 실행 결과
            
        Raises:
            MaxRetriesExceeded: 최대 재시도 횟수 초과 시
            Exception: 재시도 불가능한 에러 발생 시
        """
        last_error = None
        
        for attempt in range(self.max_attempts):
            try:
                return func(*args, **kwargs)
                
            except Exception as e:
                last_error = e
                
                # 재시도 불가능한 에러면 바로 raise
                if not self._is_retryable(e):
                    raise
                
                # 마지막 시도였으면 예외 발생
                if attempt >= self.max_attempts - 1:
                    break
                
                # 대기 시간 계산 및 로그
                delay = self._calculate_delay(attempt)
                print(f"      ⚠️ 시도 {attempt + 1}/{self.max_attempts} 실패. {delay:.1f}초 후 재시도...")
                print(f"         에러: {e}")
                time.sleep(delay)
        
        # 모든 시도 실패
        raise MaxRetriesExceeded(
            f"{self.max_attempts}번 시도 후 실패. 마지막 에러: {last_error}"
        )
    
    def execute_with_fallback(self, func: Callable, fallback_func: Callable,
                               *args, **kwargs) -> Any:
        """
        재시도 실패 시 폴백 함수 실행
        
        Args:
            func: 실행할 함수
            fallback_func: 실패 시 실행할 대체 함수
            *args, **kwargs: 함수에 전달할 인자
            
        Returns:
            func 또는 fallback_func의 실행 결과
        """
        try:
            return self.execute(func, *args, **kwargs)
        except (MaxRetriesExceeded, Exception) as e:
            print(f"      ⚠️ 원본 함수 실패, 폴백 실행: {e}")
            return fallback_func(*args, **kwargs)
    
    def execute_with_default(self, func: Callable, default_value: Any,
                              *args, **kwargs) -> Any:
        """
        재시도 실패 시 기본값 반환
        
        Args:
            func: 실행할 함수
            default_value: 실패 시 반환할 기본값
            *args, **kwargs: 함수에 전달할 인자
            
        Returns:
            func 실행 결과 또는 default_value
        """
        try:
            return self.execute(func, *args, **kwargs)
        except (MaxRetriesExceeded, Exception) as e:
            print(f"      ⚠️ 함수 실패, 기본값 반환: {e}")
            return default_value