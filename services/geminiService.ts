
import { GoogleGenAI } from "@google/genai";
import { ModelType } from "../types";

// --- API Key Management ---

let storedApiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;

export const setStoredApiKey = (key: string) => {
  storedApiKey = key;
  if (typeof localStorage !== 'undefined') {
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }
};

export const getStoredApiKey = (): string | null => {
  return storedApiKey;
};

// Helper to get the effective API key
const getApiKey = (): string | undefined => {
  return storedApiKey || process.env.API_KEY;
};

// Helper to get a fresh client instance. 
const getClient = async (): Promise<GoogleGenAI> => {
  // 1. Try manual key first
  const manualKey = getStoredApiKey();
  if (manualKey) {
    return new GoogleGenAI({ apiKey: manualKey });
  }

  // 2. Try AI Studio environment flow
  if (typeof window !== 'undefined' && window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
    // In AI Studio, the key is injected into process.env after selection
    if (process.env.API_KEY) {
      return new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }

  // 3. Fallback to process.env (e.g. if set at build time)
  if (process.env.API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  throw new Error("API Key is missing. Please set it in Settings.");
};

// --- Video Generation (Veo) ---

export const generateVideo = async (
  prompt: string, 
  aspectRatio: '16:9' | '9:16', 
  image?: string
): Promise<string> => {
  try {
    const ai = await getClient();
    const model = ModelType.VEO_FAST;

    console.log(`Starting Veo generation: ${model}, AR: ${aspectRatio}`);

    let operation;
    
    if (image) {
      // Image-to-Video
      operation = await ai.models.generateVideos({
        model,
        prompt: prompt || "Animate this image", 
        image: {
          imageBytes: image,
          mimeType: 'image/png', 
        },
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio
        }
      });
    } else {
      // Text-to-Video
      operation = await ai.models.generateVideos({
        model,
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio
        }
      });
    }

    console.log("Video operation started, polling for completion...");

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
      console.log("Polling status...", operation.metadata);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned from operation.");
    }

    console.log("Video generation complete. Fetching media...");

    // Fetch the actual video bytes using the key
    // We need to append the key manually for the fetch request
    // If we used a manual key, use that. Otherwise try env.
    const keyForFetch = getApiKey();
    if (!keyForFetch) {
       throw new Error("API Key missing during fetch.");
    }

    const mediaResponse = await fetch(`${videoUri}&key=${keyForFetch}`);
    
    if (!mediaResponse.ok) {
      throw new Error(`Failed to fetch video media: ${mediaResponse.statusText}`);
    }

    const videoBlob = await mediaResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error: any) {
    console.error("Veo Error:", error);
    if (error.message && error.message.includes("Requested entity was not found") && window.aistudio && !getStoredApiKey()) {
      await window.aistudio.openSelectKey();
      throw new Error("API Key invalid or expired. Please select a project again.");
    }
    throw error;
  }
};

// --- Image Analysis (Gemini 3 Pro) ---

export const analyzeImage = async (
  base64Image: string, 
  prompt: string
): Promise<string> => {
  // Use getClient to ensure we use the correct key source
  const ai = await getClient();
  
  // Clean base64 if it has header
  const data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const response = await ai.models.generateContent({
    model: ModelType.GEMINI_PRO_VISION,
    contents: {
      parts: [
        {
          inlineData: {
            data: data,
            mimeType: 'image/png' 
          }
        },
        { text: prompt || "Describe this image in detail." }
      ]
    }
  });

  return response.text || "No analysis generated.";
};

// --- Chat (Gemini Flash/Pro) ---

export const sendMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  // Use getClient to ensure we use the correct key source
  const ai = await getClient();
  
  const chat = ai.chats.create({
    model: ModelType.GEMINI_FLASH,
    history: history,
  });

  const result = await chat.sendMessage({ message });
  return result.text || "";
};
