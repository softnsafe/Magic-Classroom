import { GoogleGenAI } from "@google/genai";
import { ImageState, GenerationResult } from "../types";

// Ensure the API key is available
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

/**
 * Checks if the API key is currently configured.
 */
export const isConfigured = (): boolean => {
  return !!apiKey && apiKey.length > 0;
};

/**
 * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
 */
export const editImageWithGemini = async (
  originalImage: ImageState,
  prompt: string
): Promise<GenerationResult> => {
  if (!apiKey) {
    throw new Error("Missing API Key. Please add API_KEY to your environment variables.");
  }

  // Strip the prefix from the base64 string for the API
  const base64Data = originalImage.data?.split(',')[1];
  if (!base64Data) {
    throw new Error("Invalid image data.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: originalImage.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Note: responseMimeType and responseSchema are not supported for this model
    });

    let resultImage: ImageState | null = null;
    let resultText: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           // Reconstruct the full base64 string for frontend display
           // The API usually returns PNG for generated images, but let's be safe
           const mime = part.inlineData.mimeType || 'image/png';
           resultImage = {
             data: `data:${mime};base64,${part.inlineData.data}`,
             mimeType: mime
           };
        } else if (part.text) {
          resultText = part.text;
        }
      }
    }

    if (!resultImage && !resultText) {
       throw new Error("The magic didn't work! No image was returned.");
    }

    return { image: resultImage, text: resultText };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};