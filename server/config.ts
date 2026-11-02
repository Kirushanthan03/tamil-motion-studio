import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3100', 10),
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  STORAGE_DIR: path.resolve(process.env.STORAGE_DIR || './storage'),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'auto',
  ASR_PROVIDER: process.env.ASR_PROVIDER || 'auto',
  SEARCH_PROVIDER: process.env.SEARCH_PROVIDER || 'duckduckgo',
};
