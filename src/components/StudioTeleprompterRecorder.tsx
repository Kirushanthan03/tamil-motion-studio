import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Check,
  Volume2,
  ArrowDown,
  Clock,
  Radio,
  Upload,
  FileAudio,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { ScriptSections } from '@/types';

interface Props {
  scriptText: string;
  sections?: ScriptSections;
  targetDuration?: number;
  estimatedDuration?: number;
  onRecordingComplete: (audioFile: File) => void;
  isLoading: boolean;
}

interface TimedSection {
  id: string;
  badge: string;
  title: string;
  text: string;
  startTime: number;
  endTime: number;
  wordCount: number;
}

const SECTION_CONFIG: { key: keyof ScriptSections; badge: string; title: string }[] = [
  { key: 'hook', badge: '01 // HOOK', title: 'The Hook & Attention Grabber' },
  { key: 'introduction', badge: '02 // INTRO', title: 'Incident Overview & Staging' },
  { key: 'explanation', badge: '03 // EXPLOIT', title: 'Exploit Breakdown & Vector' },
  { key: 'facts', badge: '04 // METRICS & SAFU', title: 'Loss Figures & Fund Recovery' },
  { key: 'impact', badge: '05 // AFTERMATH', title: 'Industry Security Standards' },
  { key: 'conclusion', badge: '06 // CTA', title: 'Conclusion & Audience Prompt' },
];

export const StudioTeleprompterRecorder: React.FC<Props> = ({
  scriptText,
  sections,
  targetDuration = 60,
  estimatedDuration = 60,
  onRecordingComplete,
  isLoading,
}) => {
  // Mic Source: 'browser' (in-browser mic) vs 'external' (Audacity, Shure, Rode, Phone)
  const [micSource, setMicSource] = useState<'browser' | 'external'>('browser');

  // Recorder states: 'idle' | 'countdown' | 'recording' | 'paused' | 'review'
  const [recorderState, setRecorderState] = useState<'idle' | 'countdown' | 'recording' | 'paused' | 'review'>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingReview, setIsPlayingReview] = useState<boolean>(false);

  // External audio file state
  const [externalAudioFile, setExternalAudioFile] = useState<File | null>(null);
  const [externalAudioDuration, setExternalAudioDuration] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Teleprompter settings
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [scrollSpeedMultiplier, setScrollSpeedMultiplier] = useState<number>(1.0); // 0.8x, 1.0x, 1.2x, 1.5x
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [scrollProgressPct, setScrollProgressPct] = useState<number>(0);

  // Effective target duration
  const effectiveDuration = targetDuration || estimatedDuration || 60;

  // Build proportionally timed sections
  const timedSections = useMemo<TimedSection[]>(() => {
    let items: { id: string; badge: string; title: string; text: string }[] = [];

    if (sections && Object.keys(sections).length > 0) {
      items = SECTION_CONFIG.map((cfg) => ({
        id: cfg.key,
        badge: cfg.badge,
        title: cfg.title,
        text: sections[cfg.key] || '',
      })).filter((item) => item.text.trim().length > 0);
    }

    // Fallback: split scriptText by double newlines
    if (items.length === 0) {
      const paragraphs = scriptText
        .split('\n\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      items = paragraphs.map((p, idx) => ({
        id: `sec-${idx}`,
        badge: `0${idx + 1} // SECTION`,
        title: `Script Section ${idx + 1}`,
        text: p,
      }));
    }

    if (items.length === 0) {
      items = [
        {
          id: 'sec-0',
          badge: '01 // FULL SCRIPT',
          title: 'Main Narration',
          text: scriptText || 'No script text available.',
        },
      ];
    }

    // Calculate word counts
    const withWordCounts = items.map((it) => {
      const words = it.text.trim().split(/\s+/).filter(Boolean).length;
      return { ...it, wordCount: Math.max(1, words) };
    });

    const totalWords = withWordCounts.reduce((acc, it) => acc + it.wordCount, 0);

    // Distribute time proportionally across effectiveDuration
    let runningTime = 0;
    return withWordCounts.map((it, idx) => {
      const sectionDuration =
        totalWords > 0 ? (it.wordCount / totalWords) * effectiveDuration : effectiveDuration / items.length;
      const startTime = Math.round(runningTime);
      const endTime = idx === withWordCounts.length - 1 ? effectiveDuration : Math.round(runningTime + sectionDuration);
      runningTime += sectionDuration;

      return {
        ...it,
        startTime,
        endTime,
      };
    });
  }, [sections, scriptText, effectiveDuration]);

  // Overall word count and target speaking rate (WPM)
  const totalScriptWords = useMemo(() => {
    return timedSections.reduce((acc, s) => acc + s.wordCount, 0);
  }, [timedSections]);

  const targetWPM = useMemo(() => {
    return Math.round((totalScriptWords / effectiveDuration) * 60);
  }, [totalScriptWords, effectiveDuration]);

  // Identify active section based on elapsedSeconds
  const activeSection = useMemo(() => {
    return (
      timedSections.find((s) => elapsedSeconds >= s.startTime && elapsedSeconds < s.endTime) ||
      (elapsedSeconds >= effectiveDuration ? timedSections[timedSections.length - 1] : timedSections[0])
    );
  }, [timedSections, elapsedSeconds, effectiveDuration]);

  // Pacing status calculation
  const pacingStatus = useMemo(() => {
    if (recorderState === 'idle') {
      return { label: 'STANDBY', color: 'text-slate-400 bg-slate-800/50 border-slate-700' };
    }
    if (elapsedSeconds > effectiveDuration + 3) {
      return { label: 'OVER DURATION', color: 'text-rose-400 bg-rose-950/40 border-rose-500/40' };
    }

    const timePct = Math.min(100, (elapsedSeconds / effectiveDuration) * 100);
    const diff = timePct - scrollProgressPct;

    if (Math.abs(diff) <= 12) {
      return { label: 'PERFECT SYNC', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40' };
    }
    if (diff > 12) {
      return { label: 'PACE UP', color: 'text-amber-400 bg-amber-950/40 border-amber-500/40' };
    }
    return { label: 'EASE UP', color: 'text-blue-400 bg-blue-950/40 border-blue-500/40' };
  }, [recorderState, elapsedSeconds, effectiveDuration, scrollProgressPct]);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const externalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStreams();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const cleanupStreams = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Switch mic source cleanly
  const handleSelectMicSource = (source: 'browser' | 'external') => {
    if (recorderState === 'recording' || recorderState === 'paused') {
      handleStopRecording();
    }
    cleanupStreams();
    setMicSource(source);
  };

  // Start recording workflow with 3s countdown
  const handleStartCountdown = async () => {
    // Reset scroll to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setScrollProgressPct(0);

    if (micSource === 'external') {
      // External Mic Mode: No browser getUserMedia needed!
      setRecorderState('countdown');
      setCountdown(3);

      let count = 3;
      const countTimer = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(countTimer);
          beginPrompterRun();
        }
      }, 1000);
      return;
    }

    // Browser Mic Mode
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Setup Web Audio Analyser for VU Meter
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      setRecorderState('countdown');
      setCountdown(3);

      let count = 3;
      const countTimer = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(countTimer);
          beginActualRecording(stream);
        }
      }, 1000);
    } catch (err: any) {
      alert(`Microphone access error: ${err.message || 'Please grant microphone permissions in your browser or switch to External Studio Mic mode.'}`);
      setRecorderState('idle');
    }
  };

  // Begin teleprompter run for External Mic (Prompter guidance only)
  const beginPrompterRun = () => {
    setRecorderState('recording');
    setElapsedSeconds(0);

    // Start elapsed timer
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Start calibrated auto-scroll loop
    runActiveRecordingLoop();
  };

  // Begin browser microphone recording
  const beginActualRecording = (stream: MediaStream) => {
    try {
      audioChunksRef.current = [];
      const options = { mimeType: 'audio/webm' };
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setAudioUrl(url);
        setRecorderState('review');
        cleanupStreams();
      };

      recorder.start(100);
      setRecorderState('recording');
      setElapsedSeconds(0);

      // Start elapsed timer
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Start delta-calibrated auto-scroll loop
      runActiveRecordingLoop();
    } catch (err: any) {
      alert(`Could not start MediaRecorder: ${err.message}`);
      setRecorderState('idle');
      cleanupStreams();
    }
  };

  const runActiveRecordingLoop = () => {
    lastTimeRef.current = performance.now();

    const updateLoop = (now: number) => {
      const last = lastTimeRef.current || now;
      const dt = Math.min(0.1, (now - last) / 1000); // delta in seconds
      lastTimeRef.current = now;

      // 1. Update VU Meter volume if browser analyser is present
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
      }

      // 2. Smooth, duration-calibrated teleprompter auto-scroll
      if (isAutoScroll && scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;

        if (maxScroll > 0) {
          // Exact pixels/second required to complete scroll over effectiveDuration
          const basePixelsPerSec = maxScroll / Math.max(10, effectiveDuration);
          el.scrollTop += basePixelsPerSec * scrollSpeedMultiplier * dt;

          // Track scroll progress percentage
          const currentPct = Math.min(100, Math.round((el.scrollTop / maxScroll) * 100));
          setScrollProgressPct(currentPct);
        }
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
  };

  const handlePauseResume = () => {
    if (recorderState === 'recording') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
      }
      setRecorderState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
    } else if (recorderState === 'paused') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      setRecorderState('recording');
      lastTimeRef.current = performance.now();
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      runActiveRecordingLoop();
    }
  };

  const handleStopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    lastTimeRef.current = null;

    if (micSource === 'browser' && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // In external mode, proceed directly to review/upload state
      setRecorderState('review');
      cleanupStreams();
    }
  };

  const handleRetake = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setExternalAudioFile(null);
    setExternalAudioDuration(null);
    setRecorderState('idle');
    setElapsedSeconds(0);
    setScrollProgressPct(0);
    lastTimeRef.current = null;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // External audio file selection & drag-and-drop
  const handleProcessExternalFile = (file: File) => {
    setExternalAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // Read audio duration
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      if (!isNaN(tempAudio.duration) && isFinite(tempAudio.duration)) {
        setExternalAudioDuration(Math.round(tempAudio.duration));
      }
    };
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessExternalFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessExternalFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmAndUpload = () => {
    if (micSource === 'external') {
      if (!externalAudioFile) return;
      onRecordingComplete(externalAudioFile);
      return;
    }

    if (!audioBlob) return;
    const file = new File([audioBlob], `teleprompter_take_${Date.now()}.webm`, {
      type: 'audio/webm',
    });
    onRecordingComplete(file);
  };

  const toggleReviewPlay = () => {
    if (!reviewAudioRef.current) return;
    if (isPlayingReview) {
      reviewAudioRef.current.pause();
      setIsPlayingReview(false);
    } else {
      reviewAudioRef.current.play();
      setIsPlayingReview(true);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const fontSizeClass =
    fontSize === 'normal'
      ? 'text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-2xl leading-loose font-medium'
      : 'text-3xl leading-loose font-bold';

  const timeProgressPct = Math.min(100, Math.round((elapsedSeconds / effectiveDuration) * 100));

  return (
    <div className="bg-paper-pure rounded-2xl border border-paper-border overflow-hidden shadow-editorial">
      {/* Teleprompter Pro Header Toolbar */}
      <div className="bg-paper border-b border-paper-border px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-crimson-accent text-white flex items-center justify-center font-bold">
            {micSource === 'browser' ? <Mic className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-charcoal">
                Studio Teleprompter
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-charcoal text-white tracking-widest uppercase">
                CALIBRATED {effectiveDuration}S
              </span>
            </div>
            <span className="text-xs text-charcoal-muted">
              Auto-scroll calibrated for {totalScriptWords} words • Target speed ~{targetWPM} WPM
            </span>
          </div>
        </div>

        {/* Source Mode Toggle & Prompter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Recording Mode Selector */}
          <div className="flex items-center bg-paper-pure p-1 rounded-xl border border-paper-border text-xs">
            <button
              onClick={() => handleSelectMicSource('browser')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                micSource === 'browser'
                  ? 'bg-crimson-accent text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
              title="Record directly using your web browser microphone"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>In-Browser Mic</span>
            </button>

            <button
              onClick={() => handleSelectMicSource('external')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                micSource === 'external'
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
              title="Use prompter on screen with Audacity, Rode, Shure, or your phone, then upload the file"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>External Recorder</span>
            </button>
          </div>

          {/* Teleprompter Display Controls: Font size, Speed Multiplier, Auto-scroll */}
          <div className="flex items-center gap-3 bg-paper-pure px-3 py-1.5 rounded-xl border border-paper-border text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-charcoal-muted font-medium">Text:</span>
              {(['normal', 'large', 'huge'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`px-2 py-1 rounded font-semibold transition-all ${
                    fontSize === s ? 'bg-charcoal text-white' : 'text-charcoal hover:bg-paper-subtle'
                  }`}
                >
                  {s === 'normal' ? 'M' : s === 'large' ? 'L' : 'XL'}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-paper-border mx-1" />

            <div className="flex items-center gap-1.5">
              <span className="text-charcoal-muted font-medium">Speed:</span>
              {[
                { val: 0.8, label: '0.8x' },
                { val: 1.0, label: '1.0x' },
                { val: 1.2, label: '1.2x' },
                { val: 1.5, label: '1.5x' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setScrollSpeedMultiplier(val)}
                  className={`px-2 py-1 rounded font-semibold transition-all ${
                    scrollSpeedMultiplier === val
                      ? 'bg-crimson-accent text-white'
                      : 'text-charcoal hover:bg-paper-subtle'
                  }`}
                  title={val === 1.0 ? 'Calibrated exactly to target duration' : `${val}x speed`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-paper-border mx-1" />

            <button
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                isAutoScroll
                  ? 'bg-crimson-50 text-crimson-accent border border-crimson-200'
                  : 'text-charcoal-muted hover:bg-paper-subtle'
              }`}
            >
              <ArrowDown className="w-3 h-3" />
              <span>Auto-Scroll {isAutoScroll ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* External Mic Mode Banner (when active) */}
      {micSource === 'external' && recorderState === 'idle' && (
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">External Studio Recorder Mode:</span>
            <span>Prompter guides your reading without asking for browser mic access. Record on your phone, Audacity, or Rode mic, then upload your audio.</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            Prompter Guided • Upload on Finish
          </span>
        </div>
      )}

      {/* Teleprompter Screen Container */}
      <div className="relative bg-[#0F172A] text-slate-100 h-[420px] overflow-hidden flex flex-col justify-between">
        {/* Visual Focus Horizon Bar */}
        <div className="absolute top-[32%] left-0 right-0 h-[68px] bg-crimson-500/10 border-y border-crimson-500/30 pointer-events-none z-10 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-crimson-500 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-crimson-400 uppercase font-bold">
              READ FOCUS LINE
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
            {activeSection ? activeSection.badge : 'ACTIVE SECTION'}
          </span>
        </div>

        {/* Scrollable Teleprompter Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-8 sm:px-16 pt-32 pb-64 select-text"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className={`max-w-2xl mx-auto font-serif tracking-wide space-y-8 ${fontSizeClass}`}>
            {timedSections.map((sec) => {
              const isActive = activeSection?.id === sec.id;
              return (
                <div
                  key={sec.id}
                  className={`rounded-2xl p-6 transition-all duration-300 border ${
                    isActive
                      ? 'bg-crimson-950/20 border-crimson-500/70 shadow-[0_0_25px_rgba(225,29,72,0.15)] ring-1 ring-crimson-500/30'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-60 hover:opacity-90'
                  }`}
                >
                  {/* Section Meta Bar */}
                  <div className="flex items-center justify-between mb-3 text-xs font-mono">
                    <span
                      className={`font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                        isActive
                          ? 'bg-crimson-500 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sec.badge}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>
                        {formatTimer(sec.startTime)} → {formatTimer(sec.endTime)} ({sec.endTime - sec.startTime}s)
                      </span>
                      <span>•</span>
                      <span>{sec.wordCount} words</span>
                    </div>
                  </div>

                  {/* Section Spoken Script */}
                  <p
                    className={`text-center leading-relaxed font-sans transition-colors ${
                      isActive ? 'text-white font-medium drop-shadow-sm' : 'text-slate-300'
                    }`}
                  >
                    {sec.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Countdown Overlay */}
        {recorderState === 'countdown' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4">
            <span className="text-8xl font-serif font-black text-crimson-accent animate-ping">
              {countdown}
            </span>
            <span className="text-sm font-sans tracking-widest uppercase text-white font-semibold">
              Get Ready to Read...
            </span>
            <span className="text-xs font-mono text-slate-400">
              {micSource === 'external' ? 'External recorder active' : 'Calibrated pacing'}: {formatTimer(effectiveDuration)}
            </span>
          </div>
        )}

        {/* Bottom Teleprompter Status HUD */}
        <div className="relative z-20 bg-slate-900/95 border-t border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            {recorderState === 'recording' ? (
              <span className="flex items-center gap-2 text-crimson-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-crimson-500 animate-pulse" />
                {micSource === 'external' ? 'PROMPTER RUNNING // RECORDING EXTERNALLY' : 'RECORDING LIVE (IN-BROWSER)'}
              </span>
            ) : recorderState === 'paused' ? (
              <span className="flex items-center gap-2 text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                PAUSED
              </span>
            ) : recorderState === 'review' ? (
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5" />
                {micSource === 'external' ? 'PROMPTER RUN FINISHED' : 'TAKE CAPTURED'}
              </span>
            ) : (
              <span className="text-slate-400">
                STANDBY // {micSource === 'external' ? 'EXTERNAL MIC READY' : 'BROWSER MIC READY'}
              </span>
            )}

            <span className="text-slate-600">|</span>

            {/* Timer: Elapsed vs Target */}
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-sm">
                {formatTimer(elapsedSeconds)}
              </span>
              <span className="text-slate-500 text-xs">/</span>
              <span className="text-slate-400 text-xs">
                {formatTimer(effectiveDuration)}
              </span>
            </div>

            {/* Sync Badge */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${pacingStatus.color}`}
            >
              {pacingStatus.label}
            </span>
          </div>

          {/* Dual Progress: Time vs Scroll */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
              <span>Time: {timeProgressPct}%</span>
              <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-crimson-500 h-full transition-all duration-300"
                  style={{ width: `${timeProgressPct}%` }}
                />
              </div>
            </div>

            {/* Realtime VU Meter Bar (Browser mic only) */}
            {micSource === 'browser' && (recorderState === 'recording' || recorderState === 'paused') && (
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                <div className="w-28 bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-75"
                    style={{ width: `${Math.min(70, micVolumeLevel)}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all duration-75"
                    style={{ width: `${Math.max(0, Math.min(20, micVolumeLevel - 70))}%` }}
                  />
                  <div
                    className="bg-crimson-500 h-full transition-all duration-75"
                    style={{ width: `${Math.max(0, micVolumeLevel - 90)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer & Control Buttons */}
      <div className="bg-paper p-6 flex flex-wrap items-center justify-between gap-4">
        {/* Hidden File Input for External Audio */}
        <input
          ref={externalFileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/webm,audio/flac,audio/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Idle State: Start Button */}
        {recorderState === 'idle' && (
          <div className="w-full flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-charcoal block">
                {micSource === 'external'
                  ? 'External Recorder Prompter Guidance Ready'
                  : 'Synchronized Voiceover Prompter Ready'}
              </span>
              <span className="text-[11px] text-charcoal-muted">
                {micSource === 'external'
                  ? `Press start, start your external recorder, and read along with the auto-scroll. Target: ~${targetWPM} WPM.`
                  : `Press record, wait for the 3-second countdown, and read comfortably at ~${targetWPM} WPM.`}
              </span>
            </div>

            <button
              onClick={handleStartCountdown}
              disabled={isLoading}
              className={`${
                micSource === 'external' ? 'bg-charcoal hover:bg-black' : 'bg-crimson-accent hover:bg-crimson-deep shadow-crimson-glow'
              } text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all`}
            >
              {micSource === 'external' ? (
                <>
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Start Prompter (External Mic)</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Record Voiceover</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Recording or Paused State */}
        {(recorderState === 'recording' || recorderState === 'paused') && (
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePauseResume}
                className="bg-paper-pure hover:bg-paper-border text-charcoal border border-paper-border px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                {recorderState === 'recording' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{recorderState === 'recording' ? 'Pause' : 'Resume'}</span>
              </button>
            </div>

            <button
              onClick={handleStopRecording}
              className="bg-charcoal hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>{micSource === 'external' ? 'Finish Prompter Run & Upload Audio' : 'Finish & Review Take'}</span>
            </button>
          </div>
        )}

        {/* Review State */}
        {recorderState === 'review' && (
          <div className="w-full space-y-4">
            {/* If External Mic Mode & No Audio File Attached Yet */}
            {micSource === 'external' && !externalAudioFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => externalFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-crimson-accent bg-crimson-50/40 ring-2 ring-crimson-accent/20'
                    : 'border-paper-border hover:border-charcoal bg-paper-pure hover:bg-paper'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-crimson-50 text-crimson-accent flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-charcoal">
                  Drop Your External Audio Recording Here
                </h3>
                <p className="text-xs text-charcoal-muted mt-1 max-w-md mx-auto">
                  Your teleprompter narration run took <span className="font-semibold text-charcoal">{elapsedSeconds}s</span> (Target: {effectiveDuration}s).
                  Select the .wav, .mp3, or .m4a file recorded on your external mic or phone.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    className="bg-charcoal hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Browse Audio File
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetake();
                    }}
                    className="bg-paper hover:bg-paper-border text-charcoal border border-paper-border px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Retake Prompter
                  </button>
                </div>
              </div>
            ) : (
              /* Audio Preview & Confirmation Bar (Both Browser & Attached External) */
              <div className="flex flex-wrap items-center justify-between bg-paper-pure p-4 rounded-xl border border-paper-border gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleReviewPlay}
                    className="w-10 h-10 rounded-full bg-crimson-accent text-white flex items-center justify-center shadow"
                  >
                    {isPlayingReview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-charcoal">
                        {externalAudioFile ? externalAudioFile.name : `Recorded Take (${elapsedSeconds}s)`}
                      </span>
                      {externalAudioDuration !== null && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {externalAudioDuration}s AUDIO
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-charcoal-muted block mt-0.5">
                      {micSource === 'external' ? (
                        externalAudioDuration && Math.abs(externalAudioDuration - effectiveDuration) <= 4
                          ? `🎯 Perfect match! External audio (${externalAudioDuration}s) matches target (${effectiveDuration}s).`
                          : `External audio loaded. Prompter took ${elapsedSeconds}s.`
                      ) : (
                        Math.abs(elapsedSeconds - effectiveDuration) <= 4
                          ? '🎯 Perfect pacing! Audio closely matches target duration.'
                          : elapsedSeconds > effectiveDuration
                          ? `⚠️ Audio is ${elapsedSeconds - effectiveDuration}s longer than target.`
                          : `ℹ️ Audio is ${effectiveDuration - elapsedSeconds}s shorter than target.`
                      )}
                    </span>
                  </div>
                  {audioUrl && (
                    <audio
                      ref={reviewAudioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlayingReview(false)}
                      className="hidden"
                    />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRetake}
                    className="bg-paper hover:bg-paper-border text-charcoal border border-paper-border px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>

                  <button
                    onClick={handleConfirmAndUpload}
                    disabled={isLoading || (micSource === 'external' && !externalAudioFile)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept & Align Speech</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
