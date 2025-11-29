// Window augmentation for AI Studio specific features
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

export interface VideoGenerationConfig {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  image?: string; // base64
}

export interface AnalysisResult {
  text: string;
}

export enum ModelType {
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  GEMINI_PRO_VISION = 'gemini-3-pro-preview',
  GEMINI_FLASH = 'gemini-2.5-flash',
  GEMINI_PRO = 'gemini-3-pro-preview'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}