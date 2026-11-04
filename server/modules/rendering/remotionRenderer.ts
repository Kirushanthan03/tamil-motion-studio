import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { Project } from '@/types';
import { projectStore } from '../project-management/projectStore';
import { CONFIG } from '../../config';

let bundleLocationPromise: Promise<string> | null = null;

async function getOrBuildBundle(): Promise<string> {
  if (!bundleLocationPromise) {
    const entryPoint = path.resolve(__dirname, '../../../src/remotion/index.ts');
    console.log('Bundling Remotion project from entrypoint:', entryPoint);
    bundleLocationPromise = bundle({
      entryPoint,
      webpackOverride: (config) => {
        return {
          ...config,
          resolve: {
            ...config.resolve,
            alias: {
              ...(config.resolve?.alias || {}),
              '@': path.resolve(__dirname, '../../../src'),
            },
          },
        };
      },
    });
  }
  return bundleLocationPromise;
}

export interface RenderJobProgress {
  projectId: string;
  status: 'QUEUED' | 'BUNDLING' | 'RENDERING' | 'COMPLETED' | 'FAILED';
  progress: number; // 0 to 1
  renderedFrames: number;
  totalFrames: number;
  outputVideoUrl?: string;
  outputThumbnailUrl?: string;
  error?: string;
}

const activeJobs = new Map<string, RenderJobProgress>();

export function getRenderProgress(projectId: string): RenderJobProgress | undefined {
  return activeJobs.get(projectId);
}

export async function renderProjectVideo(project: Project): Promise<{ videoPath: string; videoUrl: string; thumbnailUrl: string }> {
  const projectDir = projectStore.getProjectDir(project.id);
  const outputVideoPath = path.join(projectDir, 'render.mp4');
  const outputThumbPath = path.join(projectDir, 'thumbnail.png');

  const totalFrames = Math.max(90, Math.round((project.audio?.duration || 30) * 30));

  const job: RenderJobProgress = {
    projectId: project.id,
    status: 'BUNDLING',
    progress: 0.05,
    renderedFrames: 0,
    totalFrames,
  };
  activeJobs.set(project.id, job);

  try {
    const serveUrl = await getOrBuildBundle();

    job.status = 'RENDERING';
    job.progress = 0.15;
    activeJobs.set(project.id, job);

    // Convert audio to data URI for self-contained headless Chrome playback
    let audioDataUri: string | undefined = undefined;
    if (project.audio?.path && fs.existsSync(project.audio.path)) {
      const buffer = fs.readFileSync(project.audio.path);
      audioDataUri = `data:audio/mp3;base64,${buffer.toString('base64')}`;
    }

    // Convert any scene images to base64 data URIs for deterministic headless Chrome rendering
    const processedScenes = (project.scenes || []).map((scene) => {
      if (scene.visualData?.imageUrl && scene.visualData.imageUrl.startsWith('/storage/')) {
        const localRelPath = scene.visualData.imageUrl.replace(/^\/storage\//, '');
        const absoluteImagePath = path.join(CONFIG.STORAGE_DIR, localRelPath);
        if (fs.existsSync(absoluteImagePath)) {
          const imgBuffer = fs.readFileSync(absoluteImagePath);
          const ext = path.extname(absoluteImagePath).replace('.', '') || 'png';
          return {
            ...scene,
            visualData: {
              ...scene.visualData,
              imageUrl: `data:image/${ext};base64,${imgBuffer.toString('base64')}`,
            },
          };
        }
      }
      return scene;
    });

    // Prepare composition inputProps
    const inputProps = {
      project,
      scenes: processedScenes,
      audioUrl: audioDataUri,
      themeId: project.themeId,
      subtitleSettings: project.subtitleSettings,
      showSafeZones: false,
      enableBgm: true,
      enableSfx: true,
    };

    const isLandscape = project.aspectRatio === '16:9';
    const compId = isLandscape ? 'TamilLandscape' : 'TamilReel';
    const compWidth = isLandscape ? 1920 : 1080;
    const compHeight = isLandscape ? 1080 : 1920;

    const composition = await selectComposition({
      serveUrl,
      id: compId,
      inputProps,
    });

    console.log(`Starting media render for project ${project.id} (${totalFrames} frames, ${compWidth}x${compHeight}) -> ${outputVideoPath}`);

    // Render MP4 video
    await renderMedia({
      composition: {
        ...composition,
        width: compWidth,
        height: compHeight,
        durationInFrames: totalFrames,
      },
      serveUrl,
      codec: 'h264',
      outputLocation: outputVideoPath,
      inputProps,
      concurrency: 4,
      onProgress: ({ renderedFrames, progress }) => {
        job.renderedFrames = renderedFrames;
        job.progress = Number((0.15 + progress * 0.8).toFixed(2));
        activeJobs.set(project.id, { ...job });
      },
    });

    // Render cover thumbnail at frame 45 (1.5 seconds in)
    console.log(`Rendering cover still to ${outputThumbPath}`);
    await renderStill({
      composition: {
        ...composition,
        width: compWidth,
        height: compHeight,
        durationInFrames: totalFrames,
      },
      serveUrl,
      output: outputThumbPath,
      frame: Math.min(45, Math.floor(totalFrames / 2)),
      inputProps,
    });

    job.status = 'COMPLETED';
    job.progress = 1.0;
    job.outputVideoUrl = `/storage/projects/${project.id}/render.mp4`;
    job.outputThumbnailUrl = `/storage/projects/${project.id}/thumbnail.png`;
    activeJobs.set(project.id, job);

    // Generate social captions package
    const socialPackage = generateSocialPackage(project);

    // Save final metadata
    project.status = 'COMPLETED';
    project.socialPackage = socialPackage;
    project.renderOutput = {
      videoPath: outputVideoPath,
      videoUrl: `/storage/projects/${project.id}/render.mp4`,
      thumbnailUrl: `/storage/projects/${project.id}/thumbnail.png`,
      renderedAt: new Date().toISOString(),
      fileSize: fs.existsSync(outputVideoPath) ? fs.statSync(outputVideoPath).size : 0,
    };
    projectStore.saveProject(project);

    return {
      videoPath: outputVideoPath,
      videoUrl: `/storage/projects/${project.id}/render.mp4`,
      thumbnailUrl: `/storage/projects/${project.id}/thumbnail.png`,
    };
  } catch (error: any) {
    console.error(`Render failed for project ${project.id}:`, error);
    job.status = 'FAILED';
    job.error = error.message;
    activeJobs.set(project.id, job);
    projectStore.updateStatus(project.id, 'FAILED', error.message);
    throw error;
  }
}

function generateSocialPackage(project: Project) {
  const topic = project.topic;
  const isLandscape = project.aspectRatio === '16:9';

  // Format chapters for YouTube timestamps (00:00 - Intro, 01:20 - System Architecture, etc.)
  const chapters = (project.scenes || []).map((s) => {
    const mins = Math.floor(s.startTime / 60);
    const secs = Math.floor(s.startTime % 60);
    const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return {
      time: timeFormatted,
      title: s.mainText || s.categoryTag || `Chapter ${s.sceneNumber}`,
    };
  });

  const chapterText = chapters.length > 0
    ? `\n\n📌 VIDEO CHAPTERS / TIMESTAMPS:\n` + chapters.map(c => `${c.time} - ${c.title}`).join('\n')
    : '';

  if (isLandscape) {
    return {
      caption: `🔥 ${topic} — Comprehensive 16:9 Technical Deep Dive.\n\nIn this complete masterclass, we break down the architecture, engineering principles, benchmarks, and real-world system implications.${chapterText}\n\n#TechExplainer #SystemArchitecture #AI #TamilTech #DeepDive #YouTubeEngineering`,
      hashtags: ['#TechExplainer', '#SystemArchitecture', '#AI', '#Engineering', '#TamilTech', '#SoftwareArchitecture'],
      description: `Complete 16:9 technical deep dive into ${topic}.${chapterText}`,
      chapters,
    };
  }

  return {
    caption: `🔥 ${topic}! Here's everything you need to know in under 60 seconds. What do you think about this breakthrough? Let us know in the comments! 👇\n\n#TamilTech #TechReels #AI #Innovation #TamilCreators #Remotion #Shorts`,
    hashtags: ['#TamilTech', '#AIArchitecture', '#InstagramReels', '#YouTubeShorts', '#TechNews', '#TamilCreators'],
    description: `Full video analysis and motion graphics breakdown of ${topic}. Created with Tamil & English Motion Graphics Reel Studio.`,
  };
}

export async function exportCarouselSlides(project: Project): Promise<string[]> {
  const serveUrl = await getOrBuildBundle();
  const projectDir = projectStore.getProjectDir(project.id);
  const carouselDir = path.join(projectDir, 'carousel');
  if (!fs.existsSync(carouselDir)) {
    fs.mkdirSync(carouselDir, { recursive: true });
  }

  const processedScenes = (project.scenes || []).map((scene) => {
    if (scene.visualData?.imageUrl && scene.visualData.imageUrl.startsWith('/storage/')) {
      const localRelPath = scene.visualData.imageUrl.replace(/^\/storage\//, '');
      const absoluteImagePath = path.join(CONFIG.STORAGE_DIR, localRelPath);
      if (fs.existsSync(absoluteImagePath)) {
        const imgBuffer = fs.readFileSync(absoluteImagePath);
        const ext = path.extname(absoluteImagePath).replace('.', '') || 'png';
        return {
          ...scene,
          visualData: {
            ...scene.visualData,
            imageUrl: `data:image/${ext};base64,${imgBuffer.toString('base64')}`,
          },
        };
      }
    }
    return scene;
  });

  const totalFrames = Math.max(90, Math.round((project.audio?.duration || 30) * 30));
  const inputProps = {
    project,
    scenes: processedScenes,
    themeId: project.themeId,
    subtitleSettings: project.subtitleSettings,
    showSafeZones: false,
  };

  const composition = await selectComposition({
    serveUrl,
    id: 'TamilReel',
    inputProps,
  });

  const slideUrls: string[] = [];
  for (let i = 0; i < processedScenes.length; i++) {
    const s = processedScenes[i];
    const frame = Math.round(s.startFrame + Math.min(30, s.durationInFrames / 2));
    const filename = `slide_${String(i + 1).padStart(2, '0')}.png`;
    const slidePath = path.join(carouselDir, filename);

    await renderStill({
      composition: {
        ...composition,
        durationInFrames: totalFrames,
      },
      serveUrl,
      output: slidePath,
      frame,
      inputProps,
    });
    slideUrls.push(`/storage/projects/${project.id}/carousel/${filename}`);
  }

  return slideUrls;
}
