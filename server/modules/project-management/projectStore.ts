import fs from 'fs';
import path from 'path';
import { CONFIG } from '../../config';
import { Project, ProjectSchema, ProjectStatus } from '@/types';

export class ProjectStore {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(CONFIG.STORAGE_DIR, 'projects');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getProjectDir(projectId: string): string {
    const dir = path.join(this.baseDir, projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  getProjectPath(projectId: string): string {
    return path.join(this.getProjectDir(projectId), 'project.json');
  }

  saveProject(project: Project): Project {
    const now = new Date().toISOString();
    project.updatedAt = now;
    if (!project.createdAt) project.createdAt = now;
    const filePath = this.getProjectPath(project.id);
    fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');
    return project;
  }

  getProject(projectId: string): Project | null {
    const filePath = this.getProjectPath(projectId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const now = new Date().toISOString();
      if (!data.createdAt) data.createdAt = now;
      if (!data.updatedAt) data.updatedAt = now;
      return ProjectSchema.parse(data);
    } catch (err) {
      console.error(`Error loading project ${projectId}:`, err);
      return null;
    }
  }

  listProjects(): Project[] {
    if (!fs.existsSync(this.baseDir)) return [];
    const entries = fs.readdirSync(this.baseDir, { withFileTypes: true });
    const projects: Project[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const p = this.getProject(entry.name);
        if (p) projects.push(p);
      }
    }

    return projects.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  updateStatus(projectId: string, status: ProjectStatus, error?: string): Project | null {
    const project = this.getProject(projectId);
    if (!project) return null;
    project.status = status;
    if (error !== undefined) {
      project.error = error;
    } else if (status !== 'FAILED') {
      project.error = undefined;
    }
    return this.saveProject(project);
  }
}

export const projectStore = new ProjectStore();
