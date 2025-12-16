export interface StoryStartResponse {
    job_id: string;
    status: string;
}

export interface StoryStatusResponse {
    status: string;
    current_stage: number;
    progress: number;
    video_url?: string;
    story_text?: string;
}

const API_BASE_URL = 'http://localhost:8000';

export const startStory = async (taleTitle: string, artStyle: string): Promise<StoryStartResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/story/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tale_title: taleTitle, art_style: artStyle })
    });
    return response.json();
};

export const getStoryStatus = async (jobId: string): Promise<StoryStatusResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/story/status/${jobId}`);
    return response.json();
};

export const submitChoice = async (jobId: string, stageNo: number, choice: string) => {
    const response = await fetch(`${API_BASE_URL}/api/story/choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, stage_no: stageNo, choice })
    });
    return response.json();
};