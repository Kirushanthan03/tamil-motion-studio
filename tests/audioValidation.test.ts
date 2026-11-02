import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { validateAudio, normalizeAudio, detectSilence } from '../server/modules/audio-processing/audioValidator';

export async function testAudioValidation() {
  console.log('🧪 Testing Audio Processing & FFprobe validation...');

  const testAudioPath = path.resolve('/tmp/sample_tone.mp3');
  const normalizedPath = path.resolve('/tmp/sample_normalized.mp3');

  // Generate 4-second synthetic audio using ffmpeg
  execSync(`ffmpeg -y -f lavfi -i "sine=frequency=440:duration=4" -c:a libmp3lame "${testAudioPath}" 2>/dev/null`);

  if (!fs.existsSync(testAudioPath)) {
    throw new Error('Failed to generate test audio file');
  }

  const meta = await validateAudio(testAudioPath);

  if (meta.duration < 3.5 || meta.duration > 4.5) {
    throw new Error(`Audio duration mismatch: expected ~4s, got ${meta.duration}s`);
  }

  if (!meta.waveformPeaks || meta.waveformPeaks.length !== 100) {
    throw new Error(`Expected 100 waveform peak points, got ${meta.waveformPeaks?.length}`);
  }

  // Test normalization
  await normalizeAudio(testAudioPath, normalizedPath);
  if (!fs.existsSync(normalizedPath)) {
    throw new Error('Audio normalization output file not created');
  }

  // Cleanup temporary test files
  if (fs.existsSync(testAudioPath)) fs.unlinkSync(testAudioPath);
  if (fs.existsSync(normalizedPath)) fs.unlinkSync(normalizedPath);

  console.log('✅ Audio ffprobe validation, waveform extraction, and normalization verified');
}
