import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import { AudioMeta } from '@/types';

const execAsync = util.promisify(exec);

export async function validateAudio(filePath: string): Promise<AudioMeta> {
  const stats = fs.statSync(filePath);
  const probeCmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;

  const { stdout } = await execAsync(probeCmd);
  const info = JSON.parse(stdout);

  const audioStream = info.streams?.find((s: any) => s.codec_type === 'audio');
  const format = info.format || {};

  const duration = parseFloat(format.duration || audioStream?.duration || '0');
  const sampleRate = parseInt(audioStream?.sample_rate || '44100', 10);
  const channels = parseInt(audioStream?.channels || '2', 10);
  const formatName = format.format_name || 'mp3';

  // Generate waveform peaks (100 normalized points)
  const waveformPeaks = await extractWaveformPeaks(filePath, 100);

  return {
    filename: path.basename(filePath),
    originalName: path.basename(filePath),
    path: filePath,
    duration,
    sampleRate,
    channels,
    format: formatName,
    fileSize: stats.size,
    waveformPeaks,
  };
}

export async function normalizeAudio(inputPath: string, outputPath: string): Promise<string> {
  const cmd = `ffmpeg -y -i "${inputPath}" -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 44100 -ac 2 "${outputPath}"`;
  await execAsync(cmd);
  return outputPath;
}

export async function detectSilence(filePath: string): Promise<Array<{ start: number; end: number; duration: number }>> {
  try {
    const cmd = `ffmpeg -i "${filePath}" -af silencedetect=noise=-30dB:d=0.5 -f null - 2>&1`;
    const { stdout, stderr } = await execAsync(cmd);
    const output = stdout + stderr;

    const silences: Array<{ start: number; end: number; duration: number }> = [];
    const startMatches = [...output.matchAll(/silence_start: ([\d.]+)/g)];
    const endMatches = [...output.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)];

    for (let i = 0; i < Math.min(startMatches.length, endMatches.length); i++) {
      silences.push({
        start: parseFloat(startMatches[i][1]),
        end: parseFloat(endMatches[i][1]),
        duration: parseFloat(endMatches[i][2]),
      });
    }

    return silences;
  } catch {
    return [];
  }
}

async function extractWaveformPeaks(filePath: string, numPeaks: number = 100): Promise<number[]> {
  try {
    // Extract raw 8-bit mono samples using ffmpeg
    const cmd = `ffmpeg -i "${filePath}" -ac 1 -filter:a aresample=8000 -map 0:a -c:a pcm_s16le -f data - 2>/dev/null`;
    const { stdout } = await execAsync(cmd, { encoding: 'buffer', maxBuffer: 10 * 1024 * 1024 });

    const buffer = Buffer.from(stdout);
    const samples: number[] = [];

    // Read 16-bit signed PCM samples
    for (let i = 0; i < buffer.length; i += 2) {
      if (i + 1 < buffer.length) {
        samples.push(Math.abs(buffer.readInt16LE(i)));
      }
    }

    if (samples.length === 0) {
      return Array.from({ length: numPeaks }, () => Math.random() * 0.6 + 0.2);
    }

    const blockSize = Math.floor(samples.length / numPeaks);
    const peaks: number[] = [];
    let maxPeak = 1;

    for (let i = 0; i < numPeaks; i++) {
      let sum = 0;
      const start = i * blockSize;
      const end = Math.min(start + blockSize, samples.length);
      for (let j = start; j < end; j++) {
        sum += samples[j];
      }
      const avg = end > start ? sum / (end - start) : 0;
      peaks.push(avg);
      if (avg > maxPeak) maxPeak = avg;
    }

    // Normalize peaks to 0.1 - 1.0 range
    return peaks.map((p) => Math.max(0.1, Math.min(1.0, Number((p / maxPeak).toFixed(3)))));
  } catch (err) {
    console.warn('Waveform extraction failed, using synthesized peak fallback:', err);
    return Array.from({ length: numPeaks }, (_, i) =>
      Number((Math.abs(Math.sin(i * 0.15)) * 0.7 + 0.2).toFixed(3))
    );
  }
}
