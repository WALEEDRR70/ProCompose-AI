export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface PromptRequest {
  referenceImage: ImageFile | null;
  productImage: ImageFile | null;
  styleNotes: string;
}

export interface VeoPromptRequest {
  firstFrame: ImageFile | null;
  lastFrame: ImageFile | null;
  description: string;
  voiceInstructions?: {
    text: string;
    gender: 'Male' | 'Female';
    tone: string;
  };
}

export interface ConceptRequest {
  productImage: ImageFile;
  description: string;
  conceptCount: 1 | 2 | 3;
}

export interface GenerationResult {
  prompt: string;
  error?: string;
}