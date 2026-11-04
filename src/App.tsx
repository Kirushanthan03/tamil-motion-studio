import React, { useEffect, useState } from 'react';
import { Project, ProjectStatus, SubtitleSettings, ScriptPackage, TranscriptSegment, SceneDefinition, LanguageType } from '@/types';
import { api } from '@/services/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { WorkflowStepper } from '@/components/WorkflowStepper';
import { Step1Research } from '@/components/Step1Research';
import { Step2Scripts } from '@/components/Step2Scripts';
import { Step3Voiceover } from '@/components/Step3Voiceover';
import { Step4ScenePlanner } from '@/components/Step4ScenePlanner';
import { Step5PreviewStudio } from '@/components/Step5PreviewStudio';
import { Step6RenderExport } from '@/components/Step6RenderExport';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState<any>(null);

  // Load projects on startup
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const list = await api.listProjects();
      setProjects(list);
      if (list.length > 0) {
        selectProject(list[0]);
      } else {
        // Create initial default sample project
        const initial = await api.createProject({
          topic: 'OpenAI launches a new AI model with autonomous reasoning',
          targetDuration: 60,
          selectedLanguage: 'tanglish',
        });
        setProjects([initial]);
        selectProject(initial);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectProject = (project: Project) => {
    setCurrentProject(project);
    setError(null);
    // Determine active step from status
    switch (project.status) {
      case 'DRAFT_TOPIC':
        setActiveStep(0);
        break;
      case 'RESEARCH_READY':
        setActiveStep(project.scripts ? 1 : 0);
        break;
      case 'SCRIPTS_READY':
        setActiveStep(1);
        break;
      case 'SCRIPT_APPROVED':
      case 'WAITING_FOR_VOICEOVER':
      case 'AUDIO_ALIGNED':
        setActiveStep(project.transcript ? 3 : 2);
        break;
      case 'SCENES_GENERATED':
        setActiveStep(3);
        break;
      case 'PREVIEW_READY':
        setActiveStep(4);
        break;
      case 'RENDERING':
      case 'COMPLETED':
        setActiveStep(5);
        break;
      default:
        setActiveStep(0);
    }
  };

  // Poll render progress if rendering
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentProject && (currentProject.status === 'RENDERING' || renderProgress?.status === 'RENDERING' || renderProgress?.status === 'BUNDLING')) {
      interval = setInterval(async () => {
        try {
          const res = await api.getRenderProgress(currentProject.id);
          setRenderProgress(res.progress);
          if (res.project) {
            setCurrentProject(res.project);
          }
          if (res.progress?.status === 'COMPLETED') {
            clearInterval(interval);
          }
        } catch (err) {
          console.warn('Progress poll error:', err);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [currentProject?.id, currentProject?.status, renderProgress?.status]);

  const handleCreateNewProject = async () => {
    try {
      setIsLoading(true);
      const created = await api.createProject({
        topic: 'New Tech Exploration',
        targetDuration: 60,
        selectedLanguage: 'tanglish',
      });
      setProjects([created, ...projects]);
      selectProject(created);
      setActiveStep(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Run Research
  const handleRunResearch = async (data?: { topic?: string; url?: string; targetDuration?: number; aspectRatio?: string }) => {
    if (!currentProject) return;
    try {
      setIsLoading(true);
      setError(null);
      const updated = await api.runResearch(currentProject.id, data);
      setCurrentProject(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Generate Scripts
  const handleGenerateScripts = async () => {
    if (!currentProject) return;
    try {
      setIsLoading(true);
      setError(null);
      const updated = await api.generateScripts(currentProject.id);
      setCurrentProject(updated);
      setActiveStep(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateScripts = async (scripts: ScriptPackage) => {
    if (!currentProject) return;
    try {
      const updated = await api.updateScripts(currentProject.id, scripts);
      setCurrentProject(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApproveScript = async (lang: LanguageType) => {
    if (!currentProject) return;
    try {
      setIsLoading(true);
      const updated = await api.approveScript(currentProject.id, lang);
      setCurrentProject(updated);
      setActiveStep(2); // Go to voiceover
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Audio Upload & Alignment
  const handleUploadAudio = async (file: File, normalize: boolean) => {
    if (!currentProject) return;
    try {
      setIsLoading(true);
      setError(null);
      const updated = await api.uploadAudio(currentProject.id, file, normalize);
      setCurrentProject(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAlignment = async () => {
    if (!currentProject) return;
    try {
      setIsLoading(true);
      setError(null);
      const updated = await api.alignAudio(currentProject.id);
      setCurrentProject(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTranscript = async (transcript: TranscriptSegment[]) => {
    if (!currentProject) return;
    try {
      const updated = await api.updateTranscript(currentProject.id, transcript);
      setCurrentProject(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Step 4: Plan Scenes
  const handlePlanScenes = async () => {
    if (!currentProject) return;
    try {
      setIsLoading(true);
      setError(null);
      const updated = await api.planScenes(currentProject.id);
      setCurrentProject(updated);
      setActiveStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateScenes = async (scenes: SceneDefinition[]) => {
    if (!currentProject) return;
    try {
      const updated = await api.updateScenesAndSettings(currentProject.id, { scenes });
      setCurrentProject(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Step 5: Update Settings & Trigger Render
  const handleUpdateSettings = async (themeId: string, subtitleSettings: SubtitleSettings) => {
    if (!currentProject) return;
    try {
      const updated = await api.updateScenesAndSettings(currentProject.id, { themeId, subtitleSettings });
      setCurrentProject(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTriggerRender = async () => {
    if (!currentProject) return;
    try {
      setIsLoading(true);
      setError(null);
      await api.triggerRender(currentProject.id);
      setActiveStep(5);
      // Trigger immediate progress check
      const res = await api.getRenderProgress(currentProject.id);
      setRenderProgress(res.progress);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      currentProject={currentProject}
      projects={projects}
      onSelectProject={(id) => {
        const found = projects.find((p) => p.id === id);
        if (found) selectProject(found);
      }}
      onNewProject={handleCreateNewProject}
    >
      {/* Workflow Progress Stepper */}
      {currentProject && (
        <div className="-mt-8 -mx-6 mb-8">
          <WorkflowStepper
            currentStatus={currentProject.status}
            activeStepIndex={activeStep}
            onSelectStep={(idx) => setActiveStep(idx)}
          />
        </div>
      )}

      {/* Global Error Alert */}
      {error && (
        <div className="max-w-5xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs font-semibold text-red-700 hover:text-red-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main View Step Switcher */}
      {currentProject && (
        <>
          {activeStep === 0 && (
            <Step1Research
              project={currentProject}
              onUpdateProject={(p) => setCurrentProject(p)}
              onNext={handleGenerateScripts}
              isLoading={isLoading}
              onRunResearch={handleRunResearch}
            />
          )}

          {activeStep === 1 && (
            <Step2Scripts
              project={currentProject}
              onUpdateScripts={handleUpdateScripts}
              onApproveScript={handleApproveScript}
              onRegenerateAll={handleGenerateScripts}
              isLoading={isLoading}
            />
          )}

          {activeStep === 2 && (
            <Step3Voiceover
              project={currentProject}
              onUploadAudio={handleUploadAudio}
              onRunAlignment={handleRunAlignment}
              onUpdateTranscript={handleUpdateTranscript}
              onNext={handlePlanScenes}
              isLoading={isLoading}
            />
          )}

          {activeStep === 3 && (
            <Step4ScenePlanner
              project={currentProject}
              onPlanScenes={handlePlanScenes}
              onUpdateScenes={handleUpdateScenes}
              onProjectRefresh={async () => {
                if (currentProject) {
                  const updated = await api.getProject(currentProject.id);
                  setCurrentProject(updated);
                }
              }}
              onNext={() => setActiveStep(4)}
              isLoading={isLoading}
            />
          )}

          {activeStep === 4 && (
            <Step5PreviewStudio
              project={currentProject}
              onUpdateSettings={handleUpdateSettings}
              onTriggerRender={handleTriggerRender}
              isLoading={isLoading}
            />
          )}

          {activeStep === 5 && (
            <Step6RenderExport
              project={currentProject}
              renderProgress={renderProgress}
              onTriggerRender={handleTriggerRender}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
};
