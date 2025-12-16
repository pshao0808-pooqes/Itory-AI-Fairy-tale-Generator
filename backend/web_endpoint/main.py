from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import sys
import os
import traceback
from typing import Optional

# finalss를 import 가능하게 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'finalss'))

app = FastAPI(title="Story Generation API", version="1.0.0")

# CORS 설정 (Frontend에서 접근 가능하도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend 포트
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 작업 상태 저장용 (실제로는 Redis나 DB 사용 권장)
jobs = {}

# Job별 Orchestrator 인스턴스 저장 (스토리 히스토리 유지를 위해)
orchestrators = {}

class StoryStartRequest(BaseModel):
    tale_title: str
    art_style: str

class SelectChoiceRequest(BaseModel):
    choice: str
    text: str

class ChoiceSubmitRequest(BaseModel):
    job_id: str
    stage_no: int
    choice: str

@app.get("/")
async def root():
    return {"message": "Story Generation API is running", "version": "1.0.0"}

@app.post("/api/story/start")
async def start_story(request: StoryStartRequest, background_tasks: BackgroundTasks):
    """스토리 생성 시작 (1막 자동 생성)"""
    job_id = f"job_{len(jobs) + 1}"
    
    # Orchestrator 인스턴스 생성 및 저장 (스토리 히스토리 유지를 위해)
    from orchestrator_api import OrchestratorAPI
    orchestrators[job_id] = OrchestratorAPI(art_style=request.art_style)
    print(f"✅ Job {job_id}: Orchestrator 인스턴스 생성 및 저장")
    
    jobs[job_id] = {
        "status": "started",
        "current_stage": 1,
        "progress": 0,
        "tale_title": request.tale_title,
        "art_style": request.art_style,
        "error": None,
        "current_message": "시작 중..."
    }
    
    # 백그라운드에서 Orchestrator 실행
    background_tasks.add_task(run_orchestrator, job_id, request)
    
    return {"job_id": job_id, "status": "started"}

@app.get("/api/story/status/{job_id}")
async def get_status(job_id: str):
    """작업 진행 상황 조회"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs[job_id]

@app.post("/api/story/choice")
async def submit_choice(request: ChoiceSubmitRequest, background_tasks: BackgroundTasks):
    """사용자 선택 제출 및 다음 막 생성"""
    if request.job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[request.job_id]
    
    # 다음 막 생성 시작
    job["status"] = f"stage{request.stage_no}_processing"
    job["current_stage"] = request.stage_no
    job["progress"] = 0
    job["current_message"] = f"{request.stage_no}막 시작..."
    
    # 백그라운드에서 해당 막 실행
    background_tasks.add_task(
        run_stage, 
        request.job_id, 
        request.stage_no, 
        request.choice
    )
    
    return {"success": True, "status": f"stage{request.stage_no}_processing"}

@app.post("/api/story/select/{job_id}/{stage_no}")
async def select_choice(job_id: str, stage_no: int, request: SelectChoiceRequest, background_tasks: BackgroundTasks):
    """사용자 선택 제출 및 다음 막 생성 (New)"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    # 다음 막 생성 시작
    job["status"] = f"stage{stage_no}_processing"
    job["current_stage"] = stage_no
    job["progress"] = 0
    job["current_message"] = f"{stage_no}막 시작..."
    
    # 백그라운드에서 해당 막 실행
    background_tasks.add_task(
        run_stage, 
        job_id, 
        stage_no, 
        request.text  # 선택한 텍스트를 전달
    )
    
    return {"success": True, "status": f"stage{stage_no}_processing"}

@app.get("/api/story/options/{job_id}/{stage_no}")
async def get_stage_options(job_id: str, stage_no: int):
    """다음 단계 선택지 조회"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # 저장된 Orchestrator 인스턴스 확인
    if job_id not in orchestrators:
        raise HTTPException(status_code=404, detail="Orchestrator not found for this job")
    
    try:
        # 기존 Orchestrator 인스턴스 재사용 (스토리 히스토리 유지)
        orch_api = orchestrators[job_id]
        
        print(f"\n{'='*60}")
        print(f"📝 Job {job_id}: {stage_no}막 선택지 생성")
        print(f"   현재 누적 스토리 수: {len(orch_api.orch.stage_stories)}")
        if orch_api.orch.stage_stories:
            print(f"   최근 스토리 미리보기: {orch_api.orch.stage_stories[-1][:100]}...")
        print(f"{'='*60}\n")
        
        # 옵션 생성 (누적된 히스토리 포함)
        options = orch_api.get_stage_options(stage_no)
        
        print(f"✅ Job {job_id}: 선택지 생성 완료")
        for i, opt in enumerate(options, 1):
            opt_text = opt if isinstance(opt, str) else str(opt)
            print(f"   옵션 {i}: {opt_text[:80]}...")
        
        return {"options": options}
        
    except Exception as e:
        print(f"❌ Error getting options: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

def run_orchestrator(job_id: str, request: StoryStartRequest):
    """1막 실행 - 실제 Orchestrator 호출"""
    try:
        jobs[job_id]["status"] = "stage1_processing"
        jobs[job_id]["progress"] = 5
        jobs[job_id]["current_message"] = "1막 생성 중..."
        
        print(f"\n{'='*60}")
        print(f"🎬 Job {job_id}: 1막 생성 시작")
        print(f"   동화: {request.tale_title}")
        print(f"   스타일: {request.art_style}")
        print(f"{'='*60}\n")
        
        # 저장된 Orchestrator 인스턴스 사용
        if job_id not in orchestrators:
            raise Exception(f"Orchestrator not found for job {job_id}")
        
        orch_api = orchestrators[job_id]
        
        # 진행 상황 콜백 설정
        def progress_callback(message: str, progress: int):
            jobs[job_id]["progress"] = progress
            jobs[job_id]["current_message"] = message
            print(f"[Job {job_id}] {progress}% - {message}")
        
        orch_api.set_progress_callback(progress_callback)
        
        # 1막 실행
        print(f"🚀 1막 워크플로우 실행 중...")
        result = orch_api.run_stage_1()
        
        if result['success']:
            # 성공: 영상 경로 및 텍스트 저장
            video_path = result['video_path']
            video_filename = os.path.basename(video_path)
            
            jobs[job_id]["status"] = "stage1_complete"
            jobs[job_id]["progress"] = 100
            jobs[job_id]["video_url"] = f"/stages/{video_filename}"
            jobs[job_id]["story_text"] = result['story_text']
            jobs[job_id]["video_file_path"] = video_path
            jobs[job_id]["current_message"] = "1막 완료!"
            
            print(f"\n{'='*60}")
            print(f"✅ Job {job_id}: 1막 완료!")
            print(f"   영상: {video_path}")
            print(f"   URL: /stages/{video_filename}")
            print(f"   스토리: {result['story_text'][:100]}...")
            print(f"   누적 스토리 수: {len(orch_api.orch.stage_stories)}")
            print(f"{'='*60}\n")
        else:
            # 실패
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = result.get('error', '알 수 없는 오류')
            jobs[job_id]["current_message"] = f"오류: {result.get('error')}"
            
            if 'error_trace' in result:
                jobs[job_id]["error_trace"] = result['error_trace']
            
            print(f"\n{'='*60}")
            print(f"❌ Job {job_id}: 1막 실패")
            print(f"   오류: {result.get('error')}")
            print(f"{'='*60}\n")
        
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
        jobs[job_id]["error_trace"] = traceback.format_exc()
        jobs[job_id]["current_message"] = f"시스템 오류: {str(e)}"
        
        print(f"\n{'='*60}")
        print(f"❌ Job {job_id}: 시스템 오류")
        print(f"   {str(e)}")
        print(f"{'='*60}\n")
        traceback.print_exc()

def run_stage(job_id: str, stage_no: int, user_choice: str):
    """특정 막 실행 (사용자 선택 반영) - 실제 Orchestrator 호출"""
    try:
        jobs[job_id]["progress"] = 5
        jobs[job_id]["status"] = f"stage{stage_no}_processing"
        jobs[job_id]["current_message"] = f"{stage_no}막 시작..."
        
        print(f"\n{'='*60}")
        print(f"🎬 Job {job_id}: {stage_no}막 생성 시작")
        print(f"   사용자 선택: {user_choice}")
        print(f"   현재 누적 스토리 수: {len(orchestrators[job_id].orch.stage_stories) if job_id in orchestrators else 0}")
        print(f"{'='*60}\n")
        
        # 저장된 Orchestrator 인스턴스 사용
        if job_id not in orchestrators:
            raise Exception(f"Orchestrator not found for job {job_id}")
        
        orch_api = orchestrators[job_id]
        
        # 진행 상황 콜백
        def progress_callback(message: str, progress: int):
            jobs[job_id]["progress"] = progress
            jobs[job_id]["current_message"] = message
            print(f"[Job {job_id}] {progress}% - {message}")
        
        orch_api.set_progress_callback(progress_callback)
        
        # 막 실행
        if stage_no == 5:
            result = orch_api.run_stage_5(user_choice)
        else:
            result = orch_api.run_stage_with_choice(stage_no, user_choice)
        
        if result['success']:
            video_path = result['video_path']
            video_filename = os.path.basename(video_path)
            
            jobs[job_id]["status"] = f"stage{stage_no}_complete"
            jobs[job_id]["progress"] = 100
            jobs[job_id]["video_url"] = f"/stages/{video_filename}"
            jobs[job_id]["story_text"] = result['story_text']
            jobs[job_id]["video_file_path"] = video_path
            jobs[job_id]["current_message"] = f"{stage_no}막 완료!"
            
            if 'moral_lesson' in result:
                jobs[job_id]["moral_lesson"] = result['moral_lesson']
            
            print(f"\n{'='*60}")
            print(f"✅ Job {job_id}: {stage_no}막 완료!")
            print(f"   영상: {video_path}")
            print(f"   누적 스토리 수: {len(orch_api.orch.stage_stories)}")
            print(f"{'='*60}\n")
        else:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = result.get('error', '알 수 없는 오류')
            jobs[job_id]["current_message"] = f"오류: {result.get('error')}"
            
            if 'error_trace' in result:
                jobs[job_id]["error_trace"] = result['error_trace']
            
            print(f"\n{'='*60}")
            print(f"❌ Job {job_id}: {stage_no}막 실패")
            print(f"{'='*60}\n")
        
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
        jobs[job_id]["current_message"] = f"시스템 오류: {str(e)}"
        
        print(f"\n{'='*60}")
        print(f"❌ Job {job_id}: {stage_no}막 시스템 오류")
        print(f"   {str(e)}")
        print(f"{'='*60}\n")
        traceback.print_exc()

@app.post("/api/story/finalize/{job_id}")
async def finalize_story(job_id: str, background_tasks: BackgroundTasks):
    """5개 막을 하나의 최종 영상으로 병합"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job_id not in orchestrators:
        raise HTTPException(status_code=404, detail="Orchestrator not found")
    
    job = jobs[job_id]
    
    # 5막이 완료되었는지 확인
    if job["status"] != "stage5_complete":
        raise HTTPException(status_code=400, detail="Stage 5 not completed yet")
    
    # 최종 병합 시작
    job["status"] = "finalizing"
    job["progress"] = 0
    job["current_message"] = "최종 영상 병합 중..."
    
    # 백그라운드에서 최종 병합 실행
    background_tasks.add_task(run_finalize, job_id)
    
    return {"success": True, "status": "finalizing"}

def run_finalize(job_id: str):
    """최종 영상 병합 실행"""
    try:
        jobs[job_id]["progress"] = 10
        jobs[job_id]["current_message"] = "5개 막 병합 중..."
        
        print(f"\n{'='*60}")
        print(f"🎬 Job {job_id}: 최종 영상 병합 시작")
        print(f"{'='*60}\n")
        
        # 저장된 Orchestrator 인스턴스 사용
        orch_api = orchestrators[job_id]
        
        # 진행 상황 콜백
        def progress_callback(message: str, progress: int):
            jobs[job_id]["progress"] = progress
            jobs[job_id]["current_message"] = message
            print(f"[Job {job_id}] {progress}% - {message}")
        
        orch_api.set_progress_callback(progress_callback)
        
        # 최종 병합 실행
        result = orch_api.finalize_complete_video()
        
        if result['success']:
            final_video_path = result['final_video_path']
            final_video_filename = os.path.basename(final_video_path)
            
            jobs[job_id]["status"] = "complete"
            jobs[job_id]["progress"] = 100
            jobs[job_id]["final_video_url"] = f"/final/{final_video_filename}"
            jobs[job_id]["final_video_path"] = final_video_path
            jobs[job_id]["total_duration"] = result.get('total_duration', 0.0)
            jobs[job_id]["current_message"] = "전체 영상 완성!"
            
            print(f"\n{'='*60}")
            print(f"✅ Job {job_id}: 최종 영상 완성!")
            print(f"   경로: {final_video_path}")
            print(f"   URL: /final/{final_video_filename}")
            print(f"{'='*60}\n")
        else:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = result.get('error', '최종 병합 실패')
            jobs[job_id]["current_message"] = f"오류: {result.get('error')}"
            
            if 'error_trace' in result:
                jobs[job_id]["error_trace"] = result['error_trace']
            
            print(f"\n{'='*60}")
            print(f"❌ Job {job_id}: 최종 병합 실패")
            print(f"   오류: {result.get('error')}")
            print(f"{'='*60}\n")
            
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
        jobs[job_id]["current_message"] = f"시스템 오류: {str(e)}"
        
        print(f"\n{'='*60}")
        print(f"❌ Job {job_id}: 최종 병합 시스템 오류")
        print(f"   {str(e)}")
        print(f"{'='*60}\n")
        traceback.print_exc()


# 정적 파일 제공 (생성된 영상 파일용)
output_path = os.path.join(os.path.dirname(__file__), '..', 'finalss', 'output','stages')
if os.path.exists(output_path):
    app.mount("/stages", StaticFiles(directory=output_path), name="stages")
    print(f"✅ 영상 파일 서빙 경로: {output_path}")
else:
    print(f"⚠️ 영상 출력 폴더가 없습니다: {output_path}")

# 최종 영상 파일 제공
final_output_path = os.path.join(os.path.dirname(__file__), '..', 'finalss', 'output', 'final')
if os.path.exists(final_output_path):
    app.mount("/final", StaticFiles(directory=final_output_path), name="final")
    print(f"✅ 최종 영상 서빙 경로: {final_output_path}")
else:
    print(f"⚠️ 최종 영상 출력 폴더가 없습니다: {final_output_path}")

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🎬 Story Generation API Server")
    print("="*60)
    print("Listening on: http://127.0.0.1:8000")
    print("API Docs: http://127.0.0.1:8000/docs")
    print("="*60 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)