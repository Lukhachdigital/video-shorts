import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { AnimationPrompt, PromptSet } from "../types.ts";

// FIX: The API key must be obtained from `process.env.API_KEY`. `window.aistudio.getApiKey()` is not a valid method. The function is now synchronous.
// Helper function to get the AI client with the correct API key
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};


interface SingleResult {
  imageUrl: string;
  promptSets: PromptSet[];
}

const generateTextAndPromptSet = async (
    productImageBase64: string,
    generatedImageBase64: string,
    voice: 'male' | 'female',
    region: 'south' | 'north',
    productInfo: string,
    seed: number // For variation
): Promise<PromptSet> => {
  const ai = getAiClient();
  const voiceDescription = voice === 'male' ? 'a male' : 'a female';
  const regionDescription = region === 'south' ? 'Southern Vietnamese' : 'Northern Vietnamese';
  const productInfoContext = productInfo 
    ? `Critically, you MUST use the following user-provided "Product Information" as the primary inspiration for the description: "${productInfo}". For this specific generation (seed ${seed}), you MUST create a UNIQUE and CREATIVE variation that has NOT been generated before. Focus on a different feature or angle.`
    : "Analyze the product image to understand its key features and create an appealing, UNIQUE description.";

  const textAndPromptGenResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
        parts: [
            { text: `Based on the unique qualities of the provided product image, the generated promotional image, and the user's product info, perform two tasks and return the result as a single JSON object with keys "description" and "animationPrompt".

IMPORTANT for seed ${seed}: Your response must be COMPLETELY UNIQUE and DIFFERENT from any previous attempts. Create a fresh, new idea for both the description and the camera movement.

1.  **description**: Write a concise promotional description in Vietnamese. The length MUST be short, between 15 and 25 words. This is a strict limit for an 8-second voiceover. CRITICAL RULE: The description text MUST NOT contain any special characters like hyphens (-), asterisks (*), quotes (", '), or any other punctuation. Use simple, plain Vietnamese text only. This will be spoken directly by the text-to-speech engine, so clarity is essential. ${productInfoContext}

2.  **animationPrompt**: Build a detailed video prompt as a structured JSON object for a video generation model like VEO 3.1. This prompt must create a vivid and dynamic 8-second TikTok video in an "Outfit Showcase" style, with a special focus on lively and engaging camera movements.
    - The JSON object must contain the following keys: "sceneDescription", "characterAction", "cameraMovement", "lighting", "facialExpression", "videoDuration", and "audioDescription".
    - "cameraMovement" MUST be a unique, dynamic, and creative camera movement. DO NOT use static shots or repeat previous camera movements.
    - "videoDuration" must be exactly "8 seconds".
    - "audioDescription" must state that the person speaks the Vietnamese "description" you created, specifying it's performed by ${voiceDescription} with a ${regionDescription} accent.
    - All other fields must be filled with creative, detailed descriptions in English based on the generated image.` },
            { text: "Product Image:" },
            { inlineData: { data: productImageBase64, mimeType: 'image/jpeg' } },
            { text: "Generated Promotional Image with Person:" },
            { inlineData: { data: generatedImageBase64, mimeType: 'image/jpeg' } }
        ]
    },
    config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                description: { 
                  type: Type.STRING,
                  description: "Promotional product description in Vietnamese, suitable for an 8-second voiceover (15-25 words). It must not contain any special characters."
                },
                animationPrompt: { 
                  type: Type.OBJECT,
                  description: "A detailed VEO 3.1 video generation prompt as a structured JSON object.",
                  properties: {
                    sceneDescription: { type: Type.STRING, description: "Description of the scene and background."},
                    characterAction: { type: Type.STRING, description: "Detailed movement of the character."},
                    cameraMovement: { type: Type.STRING, description: "How the camera moves. MUST be dynamic and lively. Use cinematic terms like 'smooth panning shot', 'dolly zoom in', 'orbital shot around the character', 'handheld follow shot', 'crane shot revealing the scene'. AVOID static shots."},
                    lighting: { type: Type.STRING, description: "The style of lighting (e.g., golden hour, studio)."},
                    facialExpression: { type: Type.STRING, description: "The character's facial expression."},
                    videoDuration: { type: Type.STRING, description: "The exact duration of the video."},
                    audioDescription: { type: Type.STRING, description: "Description of the voiceover audio."}
                  },
                  required: ["sceneDescription", "characterAction", "cameraMovement", "lighting", "facialExpression", "videoDuration", "audioDescription"]
                },
            },
            required: ["description", "animationPrompt"]
        }
    }
  });

  return JSON.parse(textAndPromptGenResponse.text);
}

const generateSingleResult = async (
  modelImageBase64: string,
  productImageBase64: string,
  aspectRatio: '9:16' | '16:9',
  voice: 'male' | 'female',
  region: 'south' | 'north',
  seed: number, // for variation
  outfitSuggestion: string,
  backgroundSuggestion: string,
  productInfo: string
): Promise<SingleResult> => {
  const ai = getAiClient();
  // 1. Generate the promotional image
  const dimensions = aspectRatio === '9:16' ? '1080x1920 pixels' : '1920x1080 pixels';
  
  const outfitPrompt = outfitSuggestion 
    ? `- **Outfit Suggestion**: The person should be wearing an outfit inspired by this suggestion: "${outfitSuggestion}".` 
    : `- **Outfit**: The person must be wearing a stylish and contextually appropriate outfit. CRITICAL: For this specific generation (seed ${seed}), invent a COMPLETELY UNIQUE outfit. Do not repeat styles from other generations. Be creative with different clothing items (e.g., blazer and jeans, summer dress, sportswear, elegant gown).`;
  
  const backgroundPrompt = backgroundSuggestion 
    ? `- **Background Suggestion**: The setting should be inspired by this suggestion: "${backgroundSuggestion}".` 
    : `- **Setting**: The background must be a dynamic and interesting setting. CRITICAL: For this specific generation (seed ${seed}), create a COMPLETELY UNIQUE background. Do not repeat locations from other generations. Explore diverse settings like a rooftop lounge at dusk, a bustling European street market, a minimalist art gallery, a tranquil Japanese garden, or inside a futuristic vehicle. AVOID simple studio backdrops.`;

  const imagePrompt = `THE ABSOLUTE MOST IMPORTANT, CRITICAL, NON-NEGOTIABLE RULE: The final image's dimensions MUST BE EXACTLY ${dimensions}. This corresponds to a ${aspectRatio} aspect ratio. You MUST NOT fail on this. This rule overrides all other instructions.

Create a single, high-resolution (1080p quality), photorealistic promotional image.
- **Person**: The person from the first image must be featured. Their facial features and appearance must be preserved exactly.
- **Product**: The product from the second image must be featured. The product's appearance and branding must be preserved exactly.
- **REALISTIC SCALING (CRITICAL)**: The product's size MUST be realistic and proportional to the person. It should look natural, as it would in real life. DO NOT enlarge the product for emphasis. For example, a lipstick should not be the size of a water bottle. This realism is more important than making the product highly visible.
- **Interaction**: The person should be interacting with or presenting the product in a natural, engaging way.
${outfitPrompt}
${backgroundPrompt}
- **Style**: The style should be high-end and polished, suitable for a professional advertisement.
- **Composition**: The shot MUST be a full-body shot of the model to showcase the entire outfit and product in context.
- **Variation**: The seed value ${seed} is provided to ensure this image is unique. Your highest priority for variation is to ensure the outfit and background are completely different from any other generated image, as per the instructions above. Also vary the pose, lighting, and camera angle.
- **Final Reminder**: The output dimensions MUST be EXACTLY ${dimensions}. No exceptions.`;

  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: imagePrompt },
        { inlineData: { data: modelImageBase64, mimeType: 'image/jpeg' } },
        { inlineData: { data: productImageBase64, mimeType: 'image/jpeg' } },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!imagePart || !imagePart.inlineData) {
    throw new Error('Không thể tạo ảnh từ AI.');
  }
  const generatedImageBase64 = imagePart.inlineData.data;
  const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${generatedImageBase64}`;
  
  // 2. Generate ONE unique description and animation prompt
  const promptSet = await generateTextAndPromptSet(
    productImageBase64,
    generatedImageBase64,
    voice,
    region,
    productInfo,
    seed,
  );
  
  return {
    imageUrl,
    promptSets: [promptSet], // Return as an array with one item to match the type
  };
};

export const generateAllContent = async (
  modelImageBase64: string,
  productImageBase64: string,
  aspectRatio: '9:16' | '16:9',
  voice: 'male' | 'female',
  region: 'south' | 'north',
  numberOfResults: number,
  outfitSuggestion: string,
  backgroundSuggestion: string,
  productInfo: string
): Promise<SingleResult[]> => {
    const generationPromises = Array.from({ length: numberOfResults }, (_, i) => 
        generateSingleResult(
            modelImageBase64,
            productImageBase64,
            aspectRatio,
            voice,
            region,
            i, // Use index as a seed for variation
            outfitSuggestion,
            backgroundSuggestion,
            productInfo
        )
    );
    
    return Promise.all(generationPromises);
};
