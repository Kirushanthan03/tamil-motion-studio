import React, { useState, useRef, useEffect } from 'react';
import { Project, TranscriptSegment } from '@/types';
import { AlignmentEditor } from './AlignmentEditor';
import { StudioTeleprompterRecorder } from './StudioTeleprompterRecorder';
import {
  Upload,
  Mic,
  Play,
  Pause,
  RefreshCw,
  ArrowRight,
  FileAudio,
  Sparkles,
  Scissors,
  Bot,
  RotateCcw,
  Check,
  Clock,
  Volume2,
} from 'lucide-react';

interface Props {
  project: Project;
  onUploadAudio: (file: File, normalize: boolean) => void;
  onGenerateTTS?: (voice?: string, speed?: string) => void;
  onTrimAudio?: (start: number, end: number) => void;
  onRunAlignment: () => void;
  onUpdateTranscript: (transcript: TranscriptSegment[]) => void;
  onNext: () => void;
  isLoading: boolean;
}

const TTS_VOICE_OPTIONS = [
  { id: 'ta-IN-ValluvarNeural', label: 'Valluvar', desc: 'Tamil Male (Natural, Authoritative)', lang: 'tamil' },
  { id: 'ta-IN-PallaviNeural', label: 'Pallavi', desc: 'Tamil Female (Clear, Engaging)', lang: 'tamil' },
  { id: 'en-IN-PrabhatNeural', label: 'Prabhat', desc: 'Indian English Male (Best for Tanglish / Tech)', lang: 'tanglish' },
  { id: 'en-IN-NeerjaNeural', label: 'Neerja', desc: 'Indian English Female (Professional)', lang: 'tanglish' },
  { id: 'en-US-ChristopherNeural', label: 'Christopher', desc: 'US English Male (Documentary / Studio)', lang: 'english' },
];

export const Step3Voiceover: React.FC<Props> = ({
  project,
  onUploadAudio,
  onGenerateTTS,
  onTrimAudio,
  onRunAlignment,
  onUpdateTranscript,
  onNext,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'teleprompter' | 'upload' | 'tts'>('teleprompter');
  const [isPlaying, setIsPlaying] = useState(false);
  const [normalize, setNormalize] = useState(true);

  // TTS State
  const defaultTtsVoice =
    project.selectedLanguage === 'tamil'
      ? 'ta-IN-ValluvarNeural'
      : project.selectedLanguage === 'tanglish'
      ? 'en-IN-PrabhatNeural'
      : 'en-US-ChristopherNeural';
  const [selectedTtsVoice, setSelectedTtsVoice] = useState(defaultTtsVoice);
  const [ttsSpeed, setTtsSpeed] = useState<string>('+0%');

  // Trimmer State
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [isPlayingTrimPreview, setIsPlayingTrimPreview] = useState(false);
  const trimIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const audio = project.audio;
  const transcript = project.transcript;

  const scriptVariant = project.scripts?.[project.selectedLanguage];
  const approved = project.scripts?.approvedScript;
  const scriptText =
    approved?.text ||
    scriptVariant?.fullText ||
    project.topic;

  const sections = approved?.sections || scriptVariant?.sections;
  const targetDuration = project.targetDuration || scriptVariant?.estimatedDuration || 60;
  const estimatedDuration = scriptVariant?.estimatedDuration || targetDuration;

  // Initialize trimEnd when audio changes
  useEffect(() => {
    if (audio) {
      setTrimStart(0);
      setTrimEnd(Number(audio.duration.toFixed(2)));
    }
  }, [audio?.duration]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadAudio(e.target.files[0], normalize);
    }
  };

  const handleTeleprompterComplete = (audioFile: File) => {
    onUploadAudio(audioFile, normalize);
  };

  const handleTriggerTTS = () => {
    if (onGenerateTTS) {
      onGenerateTTS(selectedTtsVoice, ttsSpeed);
    }
  };

  const handleApplyTrim = () => {
    if (onTrimAudio && audio) {
      if (trimEnd <= trimStart) {
        alert('Trim end time must be greater than trim start time.');
        return;
      }
      onTrimAudio(Number(trimStart.toFixed(2)), Number(trimEnd.toFixed(2)));
      setShowTrimmer(false);
    }
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

  // Play preview only within the trim window
  const togglePlayTrimRange = () => {
    if (!audioRef.current) return;
    if (isPlayingTrimPreview) {
      audioRef.current.pause();
      setIsPlayingTrimPreview(false);
      if (trimIntervalRef.current) clearInterval(trimIntervalRef.current);
      return;
    }

    audioRef.current.currentTime = trimStart;
    audioRef.current.play();
    setIsPlayingTrimPreview(true);

    if (trimIntervalRef.current) clearInterval(trimIntervalRef.current);
    trimIntervalRef.current = setInterval(() => {
      if (audioRef.current && audioRef.current.currentTime >= trimEnd) {
        audioRef.current.pause();
        audioRef.current.currentTime = trimStart;
        setIsPlayingTrimPreview(false);
        if (trimIntervalRef.current) clearInterval(trimIntervalRef.current);
      }
    }, 50);
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
              Your voiceover audio is the authoritative timing reference. Record directly using the studio teleprompter, upload an existing file, or use AI Neural TTS for instant testing.
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
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
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
              <span>Studio Teleprompter</span>
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
              <span>Upload Audio</span>
            </button>

            <button
              onClick={() => setActiveTab('tts')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'tts'
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Neural TTS (Instant Test)</span>
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
              sections={sections}
              targetDuration={targetDuration}
              estimatedDuration={estimatedDuration}
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
            ) : (
              <div className="p-4 bg-paper rounded-xl border border-paper-border text-xs text-charcoal-muted text-center">
                Audio is currently loaded below. You can trim it or upload a replacement file.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Neural TTS (Instant Testing) */}
        {activeTab === 'tts' && (
          <div className="mt-6 bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Automated Neural TTS Engine
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      FOR TESTING & FAST PROTOTYPING
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Instantly synthesize your approved script into studio audio and advance directly to scene alignment.
                  </p>
                </div>
              </div>
            </div>

            {/* Voice & Speed Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select AI Neural Voice:
                </label>
                <select
                  value={selectedTtsVoice}
                  onChange={(e) => setSelectedTtsVoice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                >
                  {TTS_VOICE_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} — {v.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Speech Delivery Rate:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '0.9x', val: '-10%' },
                    { label: '1.0x (Natural)', val: '+0%' },
                    { label: '1.1x (Brisk)', val: '+10%' },
                    { label: '1.2x (Fast)', val: '+20%' },
                  ].map((rate) => (
                    <button
                      key={rate.val}
                      type="button"
                      onClick={() => setTtsSpeed(rate.val)}
                      className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        ttsSpeed === rate.val
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {rate.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Script Text Preview */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>SCRIPT TO BE VOICED ({project.selectedLanguage.toUpperCase()}):</span>
                <span>~{targetDuration}s Target</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2">
                {scriptText}
              </p>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Synthesizes audio, runs speech alignment, and plans scenes in ~2 seconds.
              </span>

              <button
                type="button"
                onClick={handleTriggerTTS}
                disabled={isLoading}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing TTS Audio & Aligning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate TTS Audio & Auto-Align Reel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Audio Active Card & Trimmer (Shown whenever audio is loaded) */}
        {audio && (
          <div className="mt-8 bg-paper rounded-2xl border border-paper-border p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-crimson-accent text-white flex items-center justify-center shadow">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal text-base">
                      {audio.originalName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      ACTIVE AUDIO
                    </span>
                  </div>
                  <span className="text-xs text-charcoal-muted font-mono block mt-0.5">
                    {audio.duration.toFixed(2)}s • {audio.sampleRate}Hz • {audio.format}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Trimmer Toggle Button */}
                <button
                  onClick={() => setShowTrimmer(!showTrimmer)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all ${
                    showTrimmer
                      ? 'bg-charcoal text-white border-charcoal shadow-sm'
                      : 'bg-paper-pure text-charcoal border-paper-border hover:bg-paper'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{showTrimmer ? 'Close Trimmer' : 'Trim Audio'}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-charcoal-muted hover:text-charcoal px-3 py-1.5 rounded-xl border border-paper-border bg-paper-pure"
                >
                  Replace File
                </button>

                <button
                  onClick={onRunAlignment}
                  disabled={isLoading}
                  className="bg-crimson-accent hover:bg-crimson-deep text-white px-5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-crimson-glow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{transcript ? 'Re-align Speech' : 'Transcribe & Align'}</span>
                </button>
              </div>
            </div>

            {/* Audio Trimmer Subpanel */}
            {showTrimmer && (
              <div className="bg-paper-pure p-5 rounded-xl border border-charcoal/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-crimson-accent" />
                    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      Audio Range Trimmer
                    </span>
                  </div>
                  <span className="text-xs font-mono text-charcoal-muted">
                    Selection: {(trimEnd - trimStart).toFixed(2)}s (Original: {audio.duration.toFixed(2)}s)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-charcoal-muted font-medium flex justify-between">
                      <span>Start Offset (seconds):</span>
                      <span className="font-mono font-bold text-charcoal">{trimStart.toFixed(2)}s</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={audio.duration - 0.5}
                      step={0.1}
                      value={trimStart}
                      onChange={(e) => setTrimStart(Math.min(Number(e.target.value), trimEnd - 0.5))}
                      className="w-full accent-crimson-accent cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-charcoal-muted font-medium flex justify-between">
                      <span>End Cutoff (seconds):</span>
                      <span className="font-mono font-bold text-charcoal">{trimEnd.toFixed(2)}s</span>
                    </label>
                    <input
                      type="range"
                      min={0.5}
                      max={audio.duration}
                      step={0.1}
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(Math.max(Number(e.target.value), trimStart + 0.5))}
                      className="w-full accent-crimson-accent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Trimmer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-paper-border">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTrimStart(Math.min(0.5, audio.duration));
                      }}
                      className="text-[11px] bg-paper hover:bg-paper-border px-2.5 py-1 rounded border border-paper-border text-charcoal"
                    >
                      Cut start 0.5s silence
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTrimEnd(Math.max(0.5, audio.duration - 0.5));
                      }}
                      className="text-[11px] bg-paper hover:bg-paper-border px-2.5 py-1 rounded border border-paper-border text-charcoal"
                    >
                      Cut end 0.5s silence
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlayTrimRange}
                      className="bg-paper hover:bg-paper-border text-charcoal border border-paper-border px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      {isPlayingTrimPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlayingTrimPreview ? 'Stop Preview' : 'Preview Trim'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyTrim}
                      disabled={isLoading}
                      className="bg-charcoal hover:bg-black text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Trim & Re-align</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

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
