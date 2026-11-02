import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, Sparkles, Volume2, ArrowDown } from 'lucide-react';

interface Props {
  scriptText: string;
  onRecordingComplete: (audioFile: File) => void;
  isLoading: boolean;
}

export const StudioTeleprompterRecorder: React.FC<Props> = ({
  scriptText,
  onRecordingComplete,
  isLoading,
}) => {
  // Recorder states: 'idle' | 'countdown' | 'recording' | 'paused' | 'review'
  const [recorderState, setRecorderState] = useState<'idle' | 'countdown' | 'recording' | 'paused' | 'review'>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingReview, setIsPlayingReview] = useState<boolean>(false);
  
  // Teleprompter settings
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [scrollSpeed, setScrollSpeed] = useState<number>(1); // pixels per frame or factor
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);

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

  // Start recording workflow with 3s countdown
  const handleStartCountdown = async () => {
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

      // Reset scroll to top
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

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
      alert(`Microphone access error: ${err.message || 'Please grant microphone permissions in your browser.'}`);
      setRecorderState('idle');
    }
  };

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

      // Start VU meter and auto-scroll loop
      runActiveRecordingLoop();
    } catch (err: any) {
      alert(`Could not start MediaRecorder: ${err.message}`);
      setRecorderState('idle');
      cleanupStreams();
    }
  };

  const runActiveRecordingLoop = () => {
    const updateLoop = () => {
      // 1. Update VU Meter volume
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

      // 2. Smooth teleprompter auto-scroll
      if (isAutoScroll && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += scrollSpeed * 0.75;
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;
    if (recorderState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecorderState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else if (recorderState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecorderState('recording');
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      runActiveRecordingLoop();
    }
  };

  const handleStopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRetake = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecorderState('idle');
    setElapsedSeconds(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleConfirmAndUpload = () => {
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

  return (
    <div className="bg-paper-pure rounded-2xl border border-paper-border overflow-hidden shadow-editorial">
      {/* Teleprompter Pro Header Toolbar */}
      <div className="bg-paper border-b border-paper-border px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-crimson-accent text-white flex items-center justify-center font-bold">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-charcoal">
              In-Browser Studio Teleprompter
            </h2>
            <span className="text-xs text-charcoal-muted">
              Read comfortably on screen with auto-scroll while recording crisp voiceover
            </span>
          </div>
        </div>

        {/* Teleprompter controls: Font size, Speed, Auto-scroll */}
        <div className="flex items-center gap-3 bg-paper-pure px-3 py-1.5 rounded-xl border border-paper-border text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-charcoal-muted font-medium">Text:</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded font-semibold ${fontSize === 'normal' ? 'bg-charcoal text-white' : 'text-charcoal hover:bg-paper-subtle'}`}
            >
              M
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded font-semibold ${fontSize === 'large' ? 'bg-charcoal text-white' : 'text-charcoal hover:bg-paper-subtle'}`}
            >
              L
            </button>
            <button
              onClick={() => setFontSize('huge')}
              className={`px-2 py-1 rounded font-semibold ${fontSize === 'huge' ? 'bg-charcoal text-white' : 'text-charcoal hover:bg-paper-subtle'}`}
            >
              XL
            </button>
          </div>

          <div className="h-4 w-[1px] bg-paper-border mx-1" />

          <div className="flex items-center gap-1.5">
            <span className="text-charcoal-muted font-medium">Speed:</span>
            {[0.75, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setScrollSpeed(s)}
                className={`px-2 py-1 rounded font-semibold ${scrollSpeed === s ? 'bg-crimson-accent text-white' : 'text-charcoal hover:bg-paper-subtle'}`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-paper-border mx-1" />

          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 ${
              isAutoScroll ? 'bg-crimson-50 text-crimson-accent border border-crimson-200' : 'text-charcoal-muted hover:bg-paper-subtle'
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            <span>Auto-Scroll {isAutoScroll ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Teleprompter Screen Container */}
      <div className="relative bg-[#0F172A] text-slate-100 h-[380px] overflow-hidden flex flex-col justify-between">
        {/* Visual Focus Horizon Bar */}
        <div className="absolute top-[35%] left-0 right-0 h-[64px] bg-crimson-500/10 border-y border-crimson-500/30 pointer-events-none z-10 flex items-center px-4">
          <span className="text-[10px] font-mono tracking-widest text-crimson-400 uppercase opacity-70">
            ▶ READ FOCUS LINE
          </span>
        </div>

        {/* Scrollable Teleprompter Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-12 pt-32 pb-48 select-text"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className={`max-w-2xl mx-auto font-serif tracking-wide text-center space-y-8 ${fontSizeClass}`}>
            {scriptText.split('\n\n').map((paragraph, idx) => (
              <p
                key={idx}
                className="transition-colors hover:text-white text-slate-200"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Live Countdown Overlay */}
        {recorderState === 'countdown' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4">
            <span className="text-8xl font-serif font-black text-crimson-accent animate-ping">
              {countdown}
            </span>
            <span className="text-sm font-sans tracking-widest uppercase text-white font-semibold">
              Get Ready to Read...
            </span>
          </div>
        )}

        {/* Bottom Teleprompter Status HUD */}
        <div className="relative z-20 bg-slate-900/90 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            {recorderState === 'recording' ? (
              <span className="flex items-center gap-2 text-crimson-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-crimson-500 animate-pulse" />
                RECORDING LIVE
              </span>
            ) : recorderState === 'paused' ? (
              <span className="flex items-center gap-2 text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                PAUSED
              </span>
            ) : recorderState === 'review' ? (
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5" />
                TAKE CAPTURED
              </span>
            ) : (
              <span className="text-slate-400">STANDBY // READY</span>
            )}

            <span className="text-slate-400">|</span>
            <span className="text-white font-bold text-sm">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          {/* Realtime VU Meter Bar */}
          {(recorderState === 'recording' || recorderState === 'paused') && (
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden flex">
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

      {/* Action Footer & Control Buttons */}
      <div className="bg-paper p-6 flex flex-wrap items-center justify-between gap-4">
        {/* Idle State: Start Button */}
        {recorderState === 'idle' && (
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-charcoal-muted">
              Press record, wait for the 3-second countdown, and read along with the screen.
            </span>
            <button
              onClick={handleStartCountdown}
              disabled={isLoading}
              className="bg-crimson-accent hover:bg-crimson-deep text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-crimson-glow transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Record Voiceover</span>
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
              <span>Finish & Review Take</span>
            </button>
          </div>
        )}

        {/* Review State */}
        {recorderState === 'review' && audioUrl && (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between bg-paper-pure p-3.5 rounded-xl border border-paper-border">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleReviewPlay}
                  className="w-10 h-10 rounded-full bg-crimson-accent text-white flex items-center justify-center shadow"
                >
                  {isPlayingReview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <span className="text-xs font-bold text-charcoal block">
                    Recorded Take ({elapsedSeconds}s)
                  </span>
                  <span className="text-[11px] text-charcoal-muted">
                    Audio preview ready. Verify clear pronunciation before speech alignment.
                  </span>
                </div>
                <audio
                  ref={reviewAudioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlayingReview(false)}
                  className="hidden"
                />
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
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept & Align Speech</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
