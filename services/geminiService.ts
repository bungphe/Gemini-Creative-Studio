import { GoogleGenAI } from "@google/genai";
import { ModelType } from "../types";

// Helper to ensure we have a key for Veo, handling the UI flow if needed.
// This is critical for Veo operations which require a paid project key.
const ensureApiKey = async (): Promise<string> => {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
    // We assume the key is now in process.env.API_KEY or the environment handles it.
    // The prompt says: "The selected API key is available via process.env.API_KEY"
  }
  return process.env.API_KEY as string;
};

// Helper to get a fresh client instance. 
// Important for Veo to pick up the newly selected key if it changed.
const getClient = async (): Promise<GoogleGenAI> => {
  const apiKey = await ensureApiKey();
  return new GoogleGenAI({ apiKey });
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
        prompt: prompt || "Animate this image", // Prompt is optional but recommended
        image: {
          imageBytes: image,
          mimeType: 'image/png', // Assuming PNG or standard image conversion before calling
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
      // Wait 5 seconds between polls
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
      console.log("Polling status...", operation.metadata);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned from operation.");
    }

    console.log("Video generation complete. Fetching media...");

    // Fetch the actual video bytes using the key
    const apiKey = process.env.API_KEY;
    const mediaResponse = await fetch(`${videoUri}&key=${apiKey}`);
    
    if (!mediaResponse.ok) {
      throw new Error(`Failed to fetch video media: ${mediaResponse.statusText}`);
    }

    const videoBlob = await mediaResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error: any) {
    console.error("Veo Error:", error);
    // Handle the specific "Requested entity was not found" error for keys
    if (error.message && error.message.includes("Requested entity was not found") && window.aistudio) {
      await window.aistudio.openSelectKey();
      // Retry logic could go here, but for now we throw to let the UI prompt again
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean base64 if it has header
  const data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const response = await ai.models.generateContent({
    model: ModelType.GEMINI_PRO_VISION,
    contents: {
      parts: [
        {
          inlineData: {
            data: data,
            mimeType: 'image/png' // Generic safe assumption for this context or extract real mime
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use Flash for speed in chat
  const chat = ai.chats.create({
    model: ModelType.GEMINI_FLASH,
    history: history,
  });

  const result = await chat.sendMessage({ message });
  return result.text || "";
};
