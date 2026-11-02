import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { CONFIG } from './config';
import { projectStore } from './modules/project-management/projectStore';
import { extractFromUrl } from './modules/research/urlExtractor';
import { searchTopic } from './modules/research/webSearch';
import { llmService } from './modules/script-generation/llmProvider';
import { validateAudio, normalizeAudio } from './modules/audio-processing/audioValidator';
import { transcribeAndAlign } from './modules/transcription/speechAlignment';
import { scenePlanner } from './modules/scene-planning/scenePlanner';
import { renderProjectVideo, getRenderProgress, exportCarouselSlides } from './modules/rendering/remotionRenderer';
import { Project, ProjectSchema } from '../src/types';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static storage files (audio, videos, thumbnails)
app.use('/storage', express.static(CONFIG.STORAGE_DIR));

// Configure multer storage for audio uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const projectId = req.params.id as string;
      const dir = projectStore.getProjectDir(projectId);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.mp3';
      cb(null, `voiceover${ext}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Configure multer storage for scene image uploads (diagrams, mockups, screenshots)
const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const projectId = req.params.id as string;
      const assetsDir = path.join(projectStore.getProjectDir(projectId), 'assets');
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      cb(null, assetsDir);
    },
    filename: (req, file, cb) => {
      const sceneId = (req.params.sceneId as string) || 'scene';
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `${sceneId}_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// --- API ROUTES ---

// 1. List Projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = projectStore.listProjects();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Project
app.post('/api/projects', (req, res) => {
  try {
    const { topic, url, targetDuration = 60, selectedLanguage = 'tanglish' } = req.body;
    if (!topic && !url) {
      return res.status(400).json({ error: 'Either topic or url is required' });
    }

    const projectId = `proj-${Date.now()}`;
    const project: Project = {
      id: projectId,
      title: topic || (url ? `Web: ${new URL(url).hostname}` : 'New Video Project'),
      topic: topic || url,
      url,
      targetDuration,
      selectedLanguage,
      status: 'DRAFT_TOPIC',
      themeId: 'editorial-crimson',
      subtitleSettings: {
        enabled: true,
        fontSize: 48,
        bottomMargin: 320,
        highlightColor: '#C8102E',
        textColor: '#18181B',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        style: 'editorial',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projectStore.saveProject(project);
    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Project by ID
app.get('/api/projects/:id', (req, res) => {
  const project = projectStore.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// 4. Research Topic / URL
app.post('/api/projects/:id/research', async (req, res) => {
  try {
    const project = projectStore.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    let researchResult;
    if (project.url) {
      researchResult = await extractFromUrl(project.url);
    } else {
      researchResult = await searchTopic(project.topic);
    }

    project.research = researchResult;
    project.status = 'RESEARCH_READY';
    projectStore.saveProject(project);

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Generate 3 Scripts (Tamil, Tanglish, English)
app.post('/api/projects/:id/scripts/generate', async (req, res) => {
  try {
    const project = projectStore.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!project.research) return res.status(400).json({ error: 'Research must be completed before script generation' });

    const scripts = await llmService.generateScripts(project.research, project.targetDuration);
    project.scripts = scripts;
    project.status = 'SCRIPTS_READY';
    projectStore.saveProject(project);

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update Scripts (User edits)
app.put('/api/projects/:id/scripts', (req, res) => {
  try {
    const project = projectStore.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const { scripts } = req.body;
    project.scripts = { ...project.scripts, ...scripts };
    projectStore.saveProject(project);
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Approve Final Script
app.post('/api/projects/:id/scripts/approve', (req, res) => {
  try {
    const project = projectStore.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const { language = project.selectedLanguage } = req.body;

    const chosenScript = project.scripts?.[language as 'tamil' | 'tanglish' | 'english'];
    if (!chosenScript) return res.status(400).json({ error: 'Invalid script language selected' });

    project.selectedLanguage = language;
    if (!project.scripts) {
      return res.status(400).json({ error: 'No scripts generated' });
    }

    project.scripts.approvedScript = {
      language,
      text: chosenScript.fullText,
      sections: chosenScript.sections,
      approvedAt: new Date().toISOString(),
    };

    project.status = 'WAITING_FOR_VOICEOVER';
    projectStore.saveProject(project);
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Upload Voiceover Audio
app.post('/api/projects/:id/audio/upload', upload.single('audio'), async (req, res) => {
  try {
    const projectId = req.params.id as string;
    const project = projectStore.getProject(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });

    let finalAudioPath = req.file.path;

    // Optional audio normalization query flag
    if (req.query.normalize === 'true') {
      const normalizedPath = path.join(path.dirname(finalAudioPath), `normalized_${path.basename(finalAudioPath)}`);
      await normalizeAudio(finalAudioPath, normalizedPath);
      finalAudioPath = normalizedPath;
    }

    const audioMeta = await validateAudio(finalAudioPath);
    project.audio = audioMeta;
    projectStore.saveProject(project);

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Transcribe and Align Speech Timestamps
app.post('/api/projects/:id/audio/align', async (req, res) => {
  try {
    const projectId = req.params.id as string;
    const project = projectStore.getProject(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!project.audio) return res.status(400).json({ error: 'Audio file must be uploaded before alignment' });

    // The user requirement: on-screen visuals and kinetic subtitles must always show the English version
    // while the spoken voiceover audio remains in natural Tamil or Tanglish.
    const englishText = project.scripts?.english?.fullText;
    const textToAlign = englishText ||
      project.scripts?.approvedScript?.text ||
      project.scripts?.[project.selectedLanguage]?.fullText ||
      project.topic;

    const transcript = await transcribeAndAlign(
      project.audio.path,
      textToAlign,
      'english', // Align English words so on-screen captions are 100% English
      project.audio.duration
    );

    project.transcript = transcript;
    project.status = 'AUDIO_ALIGNED';
    projectStore.saveProject(project);

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Update Aligned Transcript
app.put('/api/projects/:id/transcript', (req, res) => {
  try {
    const project = projectStore.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const { transcript } = req.body;
    project.transcript = transcript;
    projectStore.saveProject(project);
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Plan Scenes
app.post('/api/projects/:id/scenes/plan', (req, res) => {
  try {
    const project = projectStore.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const scenes = scenePlanner.planScenes(project);
    project.scenes = scenes;
    project.status = 'PREVIEW_READY';
    projectStore.saveProject(project);

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Update Scenes or Settings (Theme, Subtitles, Scene Edits)
app.put('/api/projects/:id/scenes', (req, res) => {
  try {
    const project = projectStore.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { scenes, themeId, subtitleSettings } = req.body;
    if (scenes) project.scenes = scenes;
    if (themeId) project.themeId = themeId;
    if (subtitleSettings) project.subtitleSettings = subtitleSettings;

    projectStore.saveProject(project);
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12b. Upload Scene Frame Image / Diagram / Screenshot
app.post('/api/projects/:id/scenes/:sceneId/image', imageUpload.single('image'), (req, res) => {
  try {
    const projectId = req.params.id as string;
    const sceneId = req.params.sceneId as string;
    const project = projectStore.getProject(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const imageUrl = `/storage/projects/${projectId}/assets/${req.file.filename}`;
    if (project.scenes) {
      project.scenes = project.scenes.map((s) => {
        if (s.id === sceneId) {
          return {
            ...s,
            visualData: {
              ...(s.visualData || {}),
              imageUrl,
            },
          };
        }
        return s;
      });
      projectStore.saveProject(project);
    }

    res.json({ project, imageUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12c. Remove Scene Frame Image
app.delete('/api/projects/:id/scenes/:sceneId/image', (req, res) => {
  try {
    const projectId = req.params.id as string;
    const sceneId = req.params.sceneId as string;
    const project = projectStore.getProject(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.scenes) {
      project.scenes = project.scenes.map((s) => {
        if (s.id === sceneId && s.visualData) {
          const { imageUrl, ...restVisualData } = s.visualData;
          return {
            ...s,
            visualData: restVisualData,
          };
        }
        return s;
      });
      projectStore.saveProject(project);
    }

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Trigger Remotion Video Render
app.post('/api/projects/:id/render', async (req, res) => {
  try {
    const project = projectStore.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!project.scenes || project.scenes.length === 0) {
      return res.status(400).json({ error: 'Scenes must be planned before rendering' });
    }

    project.status = 'RENDERING';
    projectStore.saveProject(project);

    // Asynchronously kick off video rendering
    renderProjectVideo(project).catch((err) => {
      console.error(`Background render error for project ${project.id}:`, err);
    });

    res.json({ message: 'Render started', projectId: project.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Render Progress Polling
app.get('/api/projects/:id/render/progress', (req, res) => {
  const progress = getRenderProgress(req.params.id);
  const project = projectStore.getProject(req.params.id);
  res.json({
    progress: progress || {
      projectId: req.params.id,
      status: project?.status === 'COMPLETED' ? 'COMPLETED' : 'IDLE',
      progress: project?.status === 'COMPLETED' ? 1.0 : 0.0,
      renderedFrames: 0,
      totalFrames: 0,
      outputVideoUrl: project?.renderOutput?.videoUrl,
      outputThumbnailUrl: project?.renderOutput?.thumbnailUrl,
    },
    project,
  });
});

// 15. Export Carousel Slides for Instagram & LinkedIn
app.post('/api/projects/:id/export/carousel', async (req, res) => {
  try {
    const project = projectStore.getProject(req.params.id as string);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!project.scenes || project.scenes.length === 0) {
      return res.status(400).json({ error: 'Scenes must be planned before exporting carousel' });
    }

    const slideUrls = await exportCarouselSlides(project);
    res.json({ slideUrls, count: slideUrls.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(CONFIG.PORT, CONFIG.HOST, () => {
  console.log(`🎬 Reel Studio Backend running on http://${CONFIG.HOST}:${CONFIG.PORT}`);
  console.log(`📂 Storage directory: ${CONFIG.STORAGE_DIR}`);
});
