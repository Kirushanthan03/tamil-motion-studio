import React, { useState, useRef } from 'react';
import { Project, TranscriptSegment } from '@/types';
import { AlignmentEditor } from './AlignmentEditor';
import { StudioTeleprompterRecorder } from './StudioTeleprompterRecorder';
import { Upload, Mic, Play, Pause, Volume2, CheckCircle, RefreshCw, ArrowRight, ShieldCheck, FileAudio, Video } from 'lucide-react';

interface Props {
  project: Project;
  onUploadAudio: (file: File, normalize: boolean) => void;
  onRunAlignment: () => void;
  onUpdateTranscript: (transcript: TranscriptSegment[]) => void;
  onNext: () => void;
  isLoading: boolean;
}

export const Step3Voiceover: React.FC<Props> = ({
  project,
  onUploadAudio,
  onRunAlignment,
  onUpdateTranscript,
  onNext,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'teleprompter' | 'upload'>('teleprompter');
  const [isPlaying, setIsPlaying] = useState(false);
  const [normalize, setNormalize] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const audio = project.audio;
  const transcript = project.transcript;

  const scriptText =
    project.scripts?.approvedScript?.text ||
    project.scripts?.[project.selectedLanguage]?.fullText ||
    project.topic;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadAudio(e.target.files[0], normalize);
    }
  };

  const handleTeleprompterComplete = (audioFile: File) => {
    onUploadAudio(audioFile, normalize);
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const audioUrl = audio ? `/storage/projects/${project.id}/${audio.filename}` : '';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="bg-paper-pure rounded-2xl border border-paper-border p-8 shadow-editorial">
        <div className="flex items-center justify-between pb-6 border-b border-paper-border">
          <div>
            <span className="text-xs font-bold tracking-widest text-crimson-accent uppercase bg-crimson-50 px-3 py-1 rounded">
              STEP 03 // MASTER TIMING REFERENCE
            </span>
            <h1 className="text-3xl font-serif font-bold text-charcoal mt-2">
              Voiceover Recording & Speech Alignment
            </h1>
            <p className="text-charcoal-muted text-sm mt-1">
              Your voiceover audio is the authoritative timing reference. Record directly using the studio teleprompter or upload an existing file.
            </p>
          </div>

          {transcript && transcript.length > 0 && (
            <button
              onClick={onNext}
              className="bg-charcoal hover:bg-black text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
            >
              <span>Advance to Scene Planner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Input Method Switcher */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-paper p-1 rounded-xl border border-paper-border">
            <button
              onClick={() => setActiveTab('teleprompter')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'teleprompter'
                  ? 'bg-crimson-accent text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>In-Browser Teleprompter</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'upload'
                  ? 'bg-crimson-accent text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Audio File</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="normToggle"
              checked={normalize}
              onChange={(e) => setNormalize(e.target.checked)}
              className="rounded text-crimson-accent focus:ring-crimson-accent"
            />
            <label htmlFor="normToggle" className="text-xs text-charcoal-muted cursor-pointer">
              Auto-normalize volume (EBU R128)
            </label>
          </div>
        </div>

        {/* Tab 1: Studio Teleprompter */}
        {activeTab === 'teleprompter' && (
          <div className="mt-6">
            <StudioTeleprompterRecorder
              scriptText={scriptText}
              onRecordingComplete={handleTeleprompterComplete}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Tab 2: File Upload Zone */}
        {activeTab === 'upload' && (
          <div className="mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!audio ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-paper-border hover:border-crimson-accent bg-paper hover:bg-crimson-50/20 rounded-2xl p-12 text-center cursor-pointer transition-all space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-crimson-50 text-crimson-accent flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal">
                    Upload Recorded Voiceover
                  </h3>
                  <p className="text-charcoal-muted text-sm mt-1">
                    Supports MP3, WAV, M4A, AAC, and WebM (up to 100MB)
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Audio Active Card (Shown whenever audio is loaded) */}
        {audio && (
          <div className="mt-6 bg-paper rounded-2xl border border-paper-border p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-crimson-accent text-white flex items-center justify-center shadow">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-charcoal text-base block">
                    {audio.originalName}
                  </span>
                  <span className="text-xs text-charcoal-muted font-mono">
                    {audio.duration.toFixed(1)}s • {audio.sampleRate}Hz • {audio.format}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-charcoal-muted hover:text-charcoal px-3 py-1.5 rounded-lg border border-paper-border"
                >
                  Replace File
                </button>

                <button
                  onClick={onRunAlignment}
                  disabled={isLoading}
                  className="bg-crimson-accent hover:bg-crimson-deep text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-crimson-glow"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{transcript ? 'Re-align Speech' : 'Transcribe & Align Speech'}</span>
                </button>
              </div>
            </div>

            {/* Waveform Visualization */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 bg-paper-pure p-4 rounded-xl border border-paper-border">
                <button
                  onClick={togglePlayAudio}
                  className="w-12 h-12 rounded-full bg-crimson-accent text-white flex items-center justify-center shadow-md flex-shrink-0"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <div className="flex-1 h-14 flex items-center gap-1 overflow-hidden px-2">
                  {audio.waveformPeaks?.map((peak, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-charcoal-muted hover:bg-crimson-accent transition-all rounded-full"
                      style={{ height: `${Math.max(12, peak * 100)}%` }}
                    />
                  ))}
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Aligned Transcript Editor */}
        {transcript && transcript.length > 0 && (
          <div className="mt-8 pt-8 border-t border-paper-border">
            <AlignmentEditor
              transcript={transcript}
              onUpdateTranscript={onUpdateTranscript}
            />
          </div>
        )}
      </div>
    </div>
  );
};
