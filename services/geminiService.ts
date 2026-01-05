import { GoogleGenAI } from "@google/genai";
import { ImageFile, VeoPromptRequest, ConceptRequest } from "../types";
import { SYSTEM_PROMPT, VEO_SYSTEM_PROMPT, CONCEPT_SYSTEM_PROMPT } from "../constants";

export const generateCompositionPrompt = async (
  referenceImage: ImageFile,
  productImage: ImageFile,
  styleNotes: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Extract base64 data without the prefix (e.g., "data:image/jpeg;base64,")
    const cleanReferenceBase64 = referenceImage.base64.split(",")[1];
    const cleanProductBase64 = productImage.base64.split(",")[1];

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using Pro for better complex visual reasoning
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4, // Reduced for higher technical precision
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Here is the REFERENCE IMAGE (Copy this environment, lighting, and mood exactly):",
            },
            {
              inlineData: {
                mimeType: referenceImage.mimeType,
                data: cleanReferenceBase64,
              },
            },
            {
              text: "Here is the USER PRODUCT IMAGE (Insert this object into the scene):",
            },
            {
              inlineData: {
                mimeType: productImage.mimeType,
                data: cleanProductBase64,
              },
            },
            {
              text: `
USER NOTES: ${styleNotes || "None"}

TASK:
1.  **Analyze Reference**: Extract camera angle, focal length, lighting ratios, and every background prop with 99.9% precision.
2.  **Analyze Product**: Identify the User Product's geometry and branding.
3.  **Generate Prompt**: Create a master-level prompt that places the User Product into the Reference Environment.
    *   **Requirement**: The prompt must explicitly describe the lighting architecture (Key, Fill, Backlight).
    *   **Requirement**: The prompt must rigorously enforce "Legible Text" and "Exact Logo" preservation.

OUTPUT: The final prompt string only.
`,
            },
          ],
        },
      ],
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text generated.");
    }

    return text.trim();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate prompt.");
  }
};

export const generateVeoPrompt = async (
  request: VeoPromptRequest
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const parts: any[] = [];

    // First Frame
    if (request.firstFrame) {
      parts.push({ text: "First Frame Image:" });
      parts.push({
        inlineData: {
          mimeType: request.firstFrame.mimeType,
          data: request.firstFrame.base64.split(",")[1],
        },
      });
    }

    // Helper Description
    if (request.description) {
      parts.push({ text: `Short Helper Description: ${request.description}` });
    }

    // Voice / Audio
    if (request.voiceInstructions) {
      const voiceInfo = `
Voice / Audio Instructions:
- Text/Phrase: "${request.voiceInstructions.text}"
- Gender: ${request.voiceInstructions.gender}
- Tone: ${request.voiceInstructions.tone}
      `.trim();
      parts.push({ text: voiceInfo });
    } else {
      parts.push({ text: "Voice / Audio Instructions: None." });
    }

    // Last Frame
    if (request.lastFrame) {
      parts.push({ text: "Last Frame Image:" });
      parts.push({
        inlineData: {
          mimeType: request.lastFrame.mimeType,
          data: request.lastFrame.base64.split(",")[1],
        },
      });
    }

    parts.push({ text: "Generate the high-quality Veo 3 video prompt now." });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: VEO_SYSTEM_PROMPT,
        temperature: 0.7,
      },
      contents: [{ role: "user", parts }],
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text generated.");
    }

    return text.trim();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate Veo prompt.");
  }
};

export const generateCreativeConcepts = async (
  request: ConceptRequest & { language?: 'en' | 'ar' }
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const parts: any[] = [];

    parts.push({ text: "Analyze this Product Image:" });
    parts.push({
      inlineData: {
        mimeType: request.productImage.mimeType,
        data: request.productImage.base64.split(",")[1],
      },
    });

    if (request.description) {
      parts.push({ text: `Helper Context (Category, Audience, Usage): ${request.description}` });
    } else {
      parts.push({ text: "Helper Context: None provided. Infer from image." });
    }

    parts.push({ text: `Generate exactly ${request.conceptCount} distinct creative concepts.` });

    if (request.language === 'ar') {
      parts.push({ text: "CRITICAL INSTRUCTION: Output the result entirely in Arabic (اللغة العربية)." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: CONCEPT_SYSTEM_PROMPT,
        temperature: 0.8, // Slightly higher for creativity
      },
      contents: [{ role: "user", parts }],
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text generated.");
    }

    return text.trim();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate creative concepts.");
  }
};