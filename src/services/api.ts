import { Project, ProjectStatus, SubtitleSettings } from '@/types';

const API_BASE = '/api';

export const api = {
  async listProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to load projects');
    return res.json();
  },

  async createProject(data: {
    topic?: string;
    url?: string;
    targetDuration?: number;
    selectedLanguage?: 'tamil' | 'tanglish' | 'english';
  }): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create project');
    }
    return res.json();
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async runResearch(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/research`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to research topic');
    }
    return res.json();
  },

  async generateScripts(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/scripts/generate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate scripts');
    }
    return res.json();
  },

  async updateScripts(id: string, scripts: any): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/scripts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scripts }),
    });
    if (!res.ok) throw new Error('Failed to update scripts');
    return res.json();
  },

  async approveScript(id: string, language: 'tamil' | 'tanglish' | 'english'): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/scripts/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
    });
    if (!res.ok) throw new Error('Failed to approve script');
    return res.json();
  },

  async uploadAudio(id: string, file: File, normalize: boolean = false): Promise<Project> {
    const formData = new FormData();
    formData.append('audio', file);
    const res = await fetch(`${API_BASE}/projects/${id}/audio/upload?normalize=${normalize}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Audio upload failed');
    }
    return res.json();
  },

  async alignAudio(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/audio/align`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Audio alignment failed');
    }
    return res.json();
  },

  async updateTranscript(id: string, transcript: any[]): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/transcript`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    if (!res.ok) throw new Error('Failed to update transcript');
    return res.json();
  },

  async planScenes(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/scenes/plan`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Scene planning failed');
    }
    return res.json();
  },

  async updateScenesAndSettings(
    id: string,
    data: {
      scenes?: any[];
      themeId?: string;
      subtitleSettings?: SubtitleSettings;
    }
  ): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/scenes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update scenes');
    return res.json();
  },

  async triggerRender(id: string): Promise<{ message: string; projectId: string }> {
    const res = await fetch(`${API_BASE}/projects/${id}/render`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Render trigger failed');
    }
    return res.json();
  },

  async getRenderProgress(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}/render/progress`);
    if (!res.ok) throw new Error('Failed to fetch render progress');
    return res.json();
  },
};
