import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export interface TTSVoiceOption {
  id: string;
  name: string;
  lang: 'tamil' | 'tanglish' | 'english';
  gender: string;
}

export const SUPPORTED_TTS_VOICES: TTSVoiceOption[] = [
  { id: 'ta-IN-ValluvarNeural', name: 'Valluvar (Tamil - Male)', lang: 'tamil', gender: 'Male' },
  { id: 'ta-IN-PallaviNeural', name: 'Pallavi (Tamil - Female)', lang: 'tamil', gender: 'Female' },
  { id: 'en-IN-PrabhatNeural', name: 'Prabhat (Indian English - Male)', lang: 'tanglish', gender: 'Male' },
  { id: 'en-IN-NeerjaNeural', name: 'Neerja (Indian English - Female)', lang: 'tanglish', gender: 'Female' },
  { id: 'en-US-ChristopherNeural', name: 'Christopher (US English - Male)', lang: 'english', gender: 'Male' },
];

export async function generateTTS(
  text: string,
  outputPath: string,
  options?: { voice?: string; rate?: string }
): Promise<void> {
  const voice = options?.voice || 'ta-IN-ValluvarNeural';
  const rateFlag = options?.rate ? `--rate=${options.rate}` : '';

  // Write text to temp file to preserve unicode Tamil formatting and avoid shell escaping issues
  const tempTextFile = path.join(os.tmpdir(), `tts_input_${Date.now()}.txt`);
  fs.writeFileSync(tempTextFile, text, 'utf-8');

  try {
    const cmd = `/home/ravichandran/.local/bin/edge-tts --voice "${voice}" --file "${tempTextFile}" --write-media "${outputPath}" ${rateFlag}`.trim();
    await execPromise(cmd);
  } finally {
    if (fs.existsSync(tempTextFile)) {
      try {
        fs.unlinkSync(tempTextFile);
      } catch {}
    }
  }
}

export async function trimAudioFile(
  inputPath: string,
  outputPath: string,
  startSec: number,
  endSec: number
): Promise<void> {
  const safeStart = Math.max(0, startSec);
  const duration = Math.max(0.5, endSec - safeStart);

  // Re-encode cleanly so timing headers and waveforms remain strictly deterministic
  const cmd = `ffmpeg -y -ss ${safeStart} -t ${duration} -i "${inputPath}" -c:a libmp3lame -q:a 2 "${outputPath}"`;
  await execPromise(cmd);
}
