# -*- coding: utf-8 -*-
# ==================================================================================
# main.py - 진입점
# ==================================================================================

import os
import sys

# Windows 콘솔 UTF-8 인코딩 설정
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'ignore')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'ignore')

from orchestrator import Orchestrator


def main():
    """
    흥부와 놀부 인터랙티브 스토리 메이커 실행
    """
    orchestrator = Orchestrator()
    orchestrator.run()


if __name__ == "__main__":
    main()