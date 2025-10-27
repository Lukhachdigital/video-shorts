export interface ImageData {
  file: File;
  previewUrl: string;
  base64: string;
}

export interface AnimationPrompt {
  sceneDescription: string;
  characterAction: string;
  cameraMovement: string;
  lighting: string;
  facialExpression: string;
  videoDuration: string;
  audioDescription: string;
}

export interface PromptSet {
  description: string;
  animationPrompt: AnimationPrompt;
}

export interface GeneratedResult {
    id: string;
    imageUrl: string;
    promptSets: PromptSet[];
}
