# Tamil & English Motion Graphics Reel Studio 🎬

An AI-powered, semi-automated vertical video production studio built for Tamil and English tech content creators. Produces polished 9:16 editorial motion graphics (1080x1920) for Instagram Reels, YouTube Shorts, and TikTok powered by **React**, **TypeScript**, **Remotion**, **Zod**, and **Speech-to-Text alignment**.

---

## 🌟 Key Highlights

- **Semi-Automated Reel Production Pipeline**:
  - Input a headline, trending tech subject, or article URL.
  - Generates 3 fact-based spoken scripts:
    1. **Conversational Tamil** (natural Tamil script with English technical terms).
    2. **Casual Tanglish** (Tamil tech-creator spoken flow with English terminology).
    3. **Conversational English** (clear editorial explainer).
  - 6-part narrative structure: *3-second hook, intro, architecture explanation, benchmark facts, developer impact, conclusion*.
- **Authoritative Voiceover Alignment**:
  - Upload your own voiceover audio (`.mp3`, `.wav`, `.m4a`, `.aac`).
  - Automated `ffprobe` duration detection and 100-point normalized waveform rendering.
  - Optional EBU R128 volume normalization and silence detection.
  - Synchronizes narration timestamps against the approved script and provides an editable transcript alignment interface.
- **Editorial Motion Graphics Visual System**:
  - Warm off-white paper texture (`#FAF8F5`) and pure minimal white backgrounds.
  - Deep crimson accent (`#C8102E` / `#9E1B32`) and rich charcoal typography (`#18181B`).
  - Editorial serif headlines (`Playfair Display`, `Noto Serif Tamil`) paired with modern sans-serif body text (`Inter`, `Noto Sans Tamil`).
  - 12 semantic visual presets:
    - `headline`: Big breaking news headline card with animated badge and accent bar.
    - `key-statistic`: Massive animated metric counter with delta percentage badge.
    - `quote`: Editorial quotation card with speaker attribution.
    - `timeline`: Chronological evolution milestones with pulsing status dots.
    - `comparison`: Side-by-side versus cards with pros and cons.
    - `process-flow`: Three-stage numbered workflow diagram with active highlight.
    - `network-nodes`: AI architecture neural graph with animated SVG paths and pulsing data packets.
    - `architecture`: Layered system architecture stack.
    - `device-mockup`: Smartphone frame mockup with animated chat UI.
    - `article-highlight`: Article publication card with kinetic marker sweep.
    - `code-snippet`: Dark terminal panel with syntax styling.
    - `conclusion`: Final checklist card with pulsing follow CTA button.
- **Kinetic Subtitles & Reels Safe Zones**:
  - Subtitle word highlighting in crimson accent.
  - Safe margin overlays: safeguards Instagram Reels / TikTok overlay areas (bottom caption bar: 320px, top status bar, right action icons).
- **H.264 MP4 Export**:
  - Deterministic Remotion rendering engine producing high-bitrate 1080x1920 MP4 video and cover thumbnail still.
  - Exports social media package with ready-to-post captions and hashtags.

---

## 🏗️ Architecture

```
tamil-motion-studio/
├── src/
│   ├── remotion/
│   │   ├── Root.tsx               # Remotion Composition Root (1080x1920, 30fps)
│   │   ├── ReelComposition.tsx    # Vertical Composition coordinating audio, scenes & subtitles
│   │   ├── SceneRenderer.tsx      # Semantic scene template dispatcher
│   │   ├── components/            # EditorialHeader, SubtitleOverlay, BackgroundTexture
│   │   ├── templates/             # 12 Motion Graphic Scene Templates
│   │   └── styles/theme.ts        # Editorial themes (Crimson, Pure White, Parchment, Midnight)
│   ├── components/
│   │   ├── WorkflowStepper.tsx    # State machine step progress tracker
│   │   ├── Step1Research.tsx      # Topic/URL input, fact extraction & verified sources
│   │   ├── Step2Scripts.tsx       # 3-tab editable script studio & duration estimator
│   │   ├── Step3Voiceover.tsx     # Audio upload, waveform preview & speech alignment editor
│   │   ├── Step4ScenePlanner.tsx  # Semantic scene planning & template variety engine
│   │   ├── Step5PreviewStudio.tsx # Remotion Player preview, theme switcher, safe-zone guide
│   │   └── Step6RenderExport.tsx  # MP4 video renderer, progress tracker & social package
│   ├── types/index.ts             # Zod validation schemas & project state definitions
│   └── App.tsx                    # Main dashboard orchestrator
├── server/
│   ├── index.ts                   # Express REST API orchestration server
│   ├── config.ts                  # Environment configuration
│   └── modules/
│       ├── project-management/    # File-system JSON project store
│       ├── research/              # DuckDuckGo search & Cheerio URL extractor
│       ├── script-generation/     # LLM provider (OpenAI / Groq / Gemini / Smart Script Engine)
│       ├── audio-processing/      # FFprobe validator, EBU R128 normalizer, waveform extractor
│       ├── transcription/         # Whisper & acoustic speech alignment engine
│       ├── scene-planning/        # Semantic scene planner & template variety engine
│       └── rendering/             # Remotion bundler & headless MP4 renderer
└── tests/                         # Automated test suite (State machine, schemas, audio, render)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20+
- **FFmpeg & FFprobe**: installed and available in `PATH`

### 2. Installation
```bash
cd /home/ravichandran/tamil-motion-studio
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configuration variables:
```env
PORT=3100
HOST=0.0.0.0
NODE_ENV=development
STORAGE_DIR=./storage

# Optional API Keys for Live Cloud Models (Offline Smart Engine works out-of-the-box):
OPENAI_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
LLM_PROVIDER=auto
ASR_PROVIDER=auto
```

### 4. Running the Application

Start the backend API server:
```bash
npm run server
```
*Backend runs on `http://localhost:3100`*

In a separate terminal, start the Vite frontend dashboard:
```bash
npm run client
```
*Frontend runs on `http://localhost:5173`*

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

Run the full end-to-end test suite:
```bash
npm test
```

This verifies:
1. **Workflow State Machine**: Transitions from `DRAFT_TOPIC` through `COMPLETED` and failure recovery.
2. **Scene Zod Schemas**: Validates structured data for all 12 scene templates.
3. **Script Generation**: Verifies Tamil Unicode rendering, English technical terms, and 6-section structure.
4. **Audio Processing**: Verifies `ffprobe` format inspection, loudness normalization, and 100 waveform peaks.
5. **End-to-End Remotion Render**: Bundles the composition, renders an actual 1080x1920 H.264 MP4 video and cover thumbnail still, and validates dimensions with `ffprobe`.

---

## 📱 Production Workflow

1. **Step 1: Topic Input & Research**
   - Enter your headline (e.g. `"OpenAI launches a new AI model"`) or paste an article URL.
   - Click **Research Source**. Verified citations and key metrics appear with clickable links.
2. **Step 2: Script Studio**
   - Review 3 generated scripts across **Tanglish**, **Tamil**, and **English**.
   - Edit any phrase or section. Reading duration is estimated automatically.
   - Click **Approve Script**.
3. **Step 3: Voiceover Recording & Timing**
   - Record your voiceover and drag & drop the audio file (`MP3`, `WAV`, `M4A`, `AAC`).
   - Listen to the audio preview with the interactive waveform player.
   - Click **Transcribe & Align Speech** to synchronize word timestamps with the audio.
   - Edit any slight spoken deviations directly in the Alignment Editor.
4. **Step 4: Semantic Scene Planning**
   - Click **Auto-Plan Motion Scenes**. The AI engine divides the timeline into varied scenes.
   - Switch any scene's template (Statistic, Architecture, Comparison, Workflow, etc.) or refine headlines.
5. **Step 5: Remotion Preview Studio**
   - Play the interactive 9:16 vertical video in the Remotion Player.
   - Toggle **Reels Safe Zone Guides** to verify safe margins.
   - Choose an editorial theme (Crimson, Pure White, Tech Gazette Parchment, Midnight Dark).
   - Customize kinetic subtitle font size, style, and bottom safe margin.
6. **Step 6: Final Render & Export**
   - Click **Render Final MP4**.
   - Remotion renders the complete 1080x1920 H.264 MP4 with synchronized voiceover.
   - Download your ready-to-post video, cover thumbnail, and copy your social caption and hashtags!
