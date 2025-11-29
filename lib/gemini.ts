import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY as per guidelines.
// In Vite with the 'define' plugin, 'process.env.API_KEY' is replaced by the actual string value at build time.
// We must access it directly so the replacement matches.
const apiKey = process.env.API_KEY;

// Initialize AI client only if key is present
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface GeneratedArticle {
  title: string;
  slug: string;
  meta_desc: string;
  content: string; // HTML formatted content
  social_drafts: {
    twitter: string;
    linkedin: string;
    telegram: string;
  };
}

export const generateArticleContent = async (
  rawSource: string,
  tone: string,
  language: string,
  category: string
): Promise<GeneratedArticle | null> => {
  if (!ai) {
    console.error("Gemini API Key is missing. Ensure process.env.API_KEY is set.");
    throw new Error("AI 服务未初始化：缺少 API Key (process.env.API_KEY)。");
  }

  const modelId = "gemini-2.5-flash"; // Using Flash for speed and efficiency in text tasks

  const systemInstruction = `You are an expert Fintech Editor for PAIPAY, a global clearing network. 
  Your Tone: ${tone}.
  Your Goal: Transform raw input into a professional, authoritative, and engaging article for the website.
  
  Requirements:
  1. Output must be valid JSON.
  2. "content" must be rich HTML (use <h2>, <h3>, <p>, <ul>, <li>). Do not use Markdown in the HTML field.
  3. "social_drafts" should provide platform-specific copy (Twitter: short + hashtags, LinkedIn: professional, Telegram: bullet points).
  4. Language: The output must be in ${language}.
  5. Category Context: This is a ${category} article.
  `;

  const prompt = `Raw Source Material: 
  "${rawSource}"
  
  Please generate the article structure.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            slug: { type: Type.STRING, description: "URL friendly slug" },
            meta_desc: { type: Type.STRING, description: "SEO meta description, max 160 chars" },
            content: { type: Type.STRING, description: "Full article body in HTML format" },
            social_drafts: {
              type: Type.OBJECT,
              properties: {
                twitter: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                telegram: { type: Type.STRING },
              }
            }
          },
          required: ["title", "slug", "meta_desc", "content", "social_drafts"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedArticle;
    }
    return null;

  } catch (error) {
    console.error("AI Generation Failed:", error);
    throw error;
  }
};