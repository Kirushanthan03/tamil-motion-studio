import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { Project, SceneDefinition } from '../src/types';

export async function testEndToEndRender() {
  console.log('🧪 Testing End-to-End Remotion 1080x1920 MP4 Video Render...');

  const outputDir = path.resolve('/tmp/remotion_test_output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const testAudioPath = path.join(outputDir, 'test_narration.mp3');
  const outputVideoPath = path.join(outputDir, 'test_render.mp4');
  const outputThumbPath = path.join(outputDir, 'test_thumb.png');

  // Generate 3-second test audio with gentle tone
  execSync(`ffmpeg -y -f lavfi -i "sine=frequency=320:duration=3" -c:a libmp3lame "${testAudioPath}" 2>/dev/null`);

  const audioBase64 = `data:audio/mp3;base64,${fs.readFileSync(testAudioPath).toString('base64')}`;

  const mockScenes: SceneDefinition[] = [
    {
      id: 'sc-1',
      sceneNumber: 1,
      startTime: 0,
      endTime: 1.5,
      duration: 1.5,
      startFrame: 0,
      durationInFrames: 45,
      spokenSegment: 'OpenAI புதிய reasoning model announcement பண்ணிருக்காங்க!',
      visualConcept: 'Editorial Breaking Headline',
      template: 'headline',
      mainText: 'OpenAI Launches New Reasoning Model',
      supportingText: 'Sub-second inference and 10x compute efficiency',
      categoryTag: 'BREAKING TECH',
      sourceAttribution: 'OpenAI Research',
      animationPreset: 'editorial-spring',
      visualData: { badge: 'BREAKING ANNOUNCEMENT' },
    },
    {
      id: 'sc-2',
      sceneNumber: 2,
      startTime: 1.5,
      endTime: 3.0,
      duration: 1.5,
      startFrame: 45,
      durationInFrames: 45,
      spokenSegment: 'Benchmark data படி latency 85% குறைஞ்சிருக்கு!',
      visualConcept: 'Massive Statistic Counter',
      template: 'key-statistic',
      mainText: '10x Faster Inference Latency',
      supportingText: 'Verified on standardized programming benchmarks',
      categoryTag: 'BENCHMARKS',
      sourceAttribution: 'Tech Report',
      animationPreset: 'editorial-spring',
      visualData: { statValue: '10x', delta: '+85% THROUGHPUT' },
    },
  ];

  const mockProject: Project = {
    id: 'test-e2e-project',
    title: 'OpenAI Launches New Reasoning Model',
    topic: 'OpenAI launches a new AI model',
    targetDuration: 3,
    selectedLanguage: 'tanglish',
    status: 'PREVIEW_READY',
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
    scenes: mockScenes,
    transcript: [
      {
        id: 'seg-1',
        text: 'OpenAI புதிய reasoning model announcement பண்ணிருக்காங்க!',
        start: 0,
        end: 1.5,
        words: [
          { word: 'OpenAI', start: 0, end: 0.3 },
          { word: 'புதிய', start: 0.3, end: 0.6 },
          { word: 'reasoning', start: 0.6, end: 0.9 },
          { word: 'model!', start: 0.9, end: 1.5 },
        ],
      },
      {
        id: 'seg-2',
        text: 'Benchmark data படி latency 85% குறைஞ்சிருக்கு!',
        start: 1.5,
        end: 3.0,
        words: [
          { word: 'Benchmark', start: 1.5, end: 1.9 },
          { word: 'latency', start: 1.9, end: 2.3 },
          { word: '85%', start: 2.3, end: 2.6 },
          { word: 'குறைஞ்சிருக்கு!', start: 2.6, end: 3.0 },
        ],
      },
    ],
    audio: {
      filename: 'test_narration.mp3',
      originalName: 'test_narration.mp3',
      path: testAudioPath,
      duration: 3,
      waveformPeaks: Array.from({ length: 100 }, () => 0.5),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const entryPoint = path.resolve(__dirname, '../src/remotion/index.ts');
  console.log('📦 Bundling Remotion composition...');
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...(config.resolve?.alias || {}),
          '@': path.resolve(__dirname, '../src'),
        },
      },
    }),
  });

  const inputProps = {
    project: mockProject,
    scenes: mockScenes,
    audioUrl: audioBase64,
    themeId: 'editorial-crimson',
    subtitleSettings: mockProject.subtitleSettings,
    showSafeZones: false,
  };

  const composition = await selectComposition({
    serveUrl,
    id: 'TamilReel',
    inputProps,
  });

  console.log('🎥 Rendering MP4 (60 frames, 1080x1920)...');
  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: 60,
    },
    serveUrl,
    codec: 'h264',
    outputLocation: outputVideoPath,
    inputProps,
  });

  if (!fs.existsSync(outputVideoPath) || fs.statSync(outputVideoPath).size === 0) {
    throw new Error('Render failed: Output MP4 does not exist or is 0 bytes');
  }

  console.log('📸 Rendering cover still...');
  await renderStill({
    composition: {
      ...composition,
      durationInFrames: 60,
    },
    serveUrl,
    output: outputThumbPath,
    frame: 25,
    inputProps,
  });

  if (!fs.existsSync(outputThumbPath) || fs.statSync(outputThumbPath).size === 0) {
    throw new Error('Cover still thumbnail render failed');
  }

  // Validate output video format with ffprobe
  const probeOutput = execSync(`ffprobe -v quiet -print_format json -show_streams "${outputVideoPath}"`).toString();
  const probeData = JSON.parse(probeOutput);
  const vStream = probeData.streams.find((s: any) => s.codec_type === 'video');

  if (!vStream || vStream.width !== 1080 || vStream.height !== 1920) {
    throw new Error(`Video dimensions invalid: expected 1080x1920, got ${vStream?.width}x${vStream?.height}`);
  }

  console.log(`🎉 End-to-End Render Succeeded!`);
  console.log(`   - Video: ${outputVideoPath} (${(fs.statSync(outputVideoPath).size / 1024).toFixed(1)} KB)`);
  console.log(`   - Resolution: ${vStream.width}x${vStream.height} (9:16 vertical)`);
  console.log(`   - Cover Thumbnail: ${outputThumbPath}`);
}
