import { GoogleGenAI, Type } from "@google/genai";

// Helper to get the AI client dynamically
const getAiClient = (specificApiKey?: string) => {
  if (specificApiKey && specificApiKey.trim() !== '') {
    return new GoogleGenAI({ apiKey: specificApiKey });
  }
  try {
    const envKey = process.env.API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim() !== '') {
      return new GoogleGenAI({ apiKey: envKey });
    }
  } catch (e) {
    console.warn("Failed to read process.env.API_KEY");
  }
  return null;
};

export interface GeneratedArticle {
  title: string;
  poster_data: {
    headline: string;
    subhead: string;
    body_highlight: string;
  };
  slug: string;
  meta_desc: string;
  content: string; // HTML formatted content
  tags: string[];
  image_prompt: string;
  social_drafts: {
    twitter: string;
    linkedin: string;
    telegram: string;
  };
}

// Mock generator for when no key is present
const getMockArticle = (topic: string, lang: string, stream: 'market' | 'notice'): GeneratedArticle => {
  const isCN = lang === 'CN';
  return {
    title: isCN ? `[模拟] 深度解析: ${topic}` : `[SIM] Deep Dive: ${topic}`,
    poster_data: {
      headline: isCN ? "市场趋势分析" : "Market Trend",
      subhead: isCN ? `${topic} 重塑格局` : `${topic} reshaping payments`,
      body_highlight: isCN ? "全球清算 · 极速达" : "Global Clearing · Instant Settlement"
    },
    slug: "market-trend-2025",
    meta_desc: isCN ? "PAIPAY 深度市场分析报告（模拟数据）。" : "PAIPAY In-depth market analysis (Simulation).",
    content: `<p><strong>${isCN ? '【模拟生成】' : '[Simulation Mode]'}</strong></p><p>Please configure your API Key in Settings to generate real content.</p>`,
    tags: ["#Fintech", "#PAIPAY", "#Simulation"],
    image_prompt: `Futuristic abstract illustration of ${topic}, blue and white color scheme.`,
    social_drafts: { twitter: `[Sim] ${topic}`, linkedin: `[Sim] ${topic}`, telegram: `[Sim] ${topic}` }
  };
};

export const generateArticleContent = async (
  rawSource: string,
  tone: string,
  language: string,
  category: string,
  stream: 'market' | 'notice',
  length: 'short' | 'medium' | 'long',
  modelName: string = "gemini-2.5-flash",
  apiKey?: string
): Promise<GeneratedArticle | null> => {
  
  const ai = getAiClient(apiKey);

  if (!ai) {
    console.warn("⚠️ Simulation Mode: API Key missing.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getMockArticle("Simulation Topic", language, stream);
  }

  // --- STRICT TYPESETTING RULES ---
  // This ensures the layout is always perfect depending on the length selected.
  let layoutInstruction = "";
  
  if (length === 'short') {
    layoutInstruction = `
      **STRICT HTML LAYOUT (SHORT)**:
      1. Start immediately with a <strong>summary paragraph</strong> (approx 3 sentences).
      2. Follow with a <ul> list containing exactly 3 <li> items highlighting key impacts.
      3. Do NOT use <h2> or <h3> headers.
      4. Keep it concise, punchy, and direct.
    `;
  } else if (length === 'medium') {
    layoutInstruction = `
      **STRICT HTML LAYOUT (STANDARD)**:
      1. <h3>Executive Summary</h3>: One paragraph summarizing the core message.
      2. <h3>Background</h3>: Two paragraphs explaining context.
      3. <h3>Analysis</h3>: Three paragraphs of breakdown.
      4. <ul> List: 4 bullet points of data/features.
      5. <h3>Conclusion</h3>: One wrapping paragraph.
      Use standard HTML tags: <h3>, <p>, <ul>, <li>.
    `;
  } else {
    layoutInstruction = `
      **STRICT HTML LAYOUT (LONG REPORT)**:
      1. <h2>Abstract</h2>: A bold intro paragraph.
      2. <h3>Market Context</h3>: Detailed background (2-3 paragraphs).
      3. <h3>Technical Analysis</h3>: Deep dive content (4-5 paragraphs).
      4. <h3>Data Insights</h3>: A detailed <ul> list with bolded keys (e.g., <li><strong>Metric:</strong> Value</li>).
      5. <h3>Strategic Outlook</h3>: Future implications.
      6. <h3>Summary</h3>: Final conclusion.
    `;
  }

  const systemInstruction = `
  Role: Expert Fintech Editor for PAIPAY.
  Tone: ${tone}.
  Language: ${language} (Simplified Chinese preferred if 'CN').
  Stream: ${stream}.
  
  ${layoutInstruction}
  
  **Formatting Rules**:
  1. Return ONLY valid JSON.
  2. The "content" field must be pure HTML. 
  3. Do NOT use Markdown symbols (like ## or **) inside the HTML content string. Use <b> or <strong> for bold.
  4. "poster_data" must be very short for graphic design use.
  5. "social_drafts" must be platform-native (Hashtags for Twitter, professional for LinkedIn).
  `;

  const prompt = `Raw Source Material: "${rawSource}". Generate the article structure now.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            poster_data: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    subhead: { type: Type.STRING },
                    body_highlight: { type: Type.STRING }
                }
            },
            slug: { type: Type.STRING },
            meta_desc: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            image_prompt: { type: Type.STRING },
            social_drafts: {
              type: Type.OBJECT,
              properties: {
                twitter: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                telegram: { type: Type.STRING },
              }
            }
          },
          required: ["title", "poster_data", "slug", "meta_desc", "content", "tags", "image_prompt", "social_drafts"]
        }
      }
    });

    if (response.text) {
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
      else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
      return JSON.parse(cleanText) as GeneratedArticle;
    }
    return null;

  } catch (error) {
    console.error("AI Generation Failed:", error);
    return null;
  }
};

export const translateText = async (text: string, targetLanguage: string, modelName: string, apiKey?: string): Promise<string> => {
    const ai = getAiClient(apiKey);
    if (!ai) return text;
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: text,
            config: { systemInstruction: `Translate to ${targetLanguage}. Return ONLY text.` }
        });
        return response.text || text;
    } catch (e) { return text; }
}

export const generateVideoContent = async (prompt: string, aspectRatio: '16:9' | '9:16', apiKey?: string): Promise<string | null> => {
  const aiClient = getAiClient(apiKey);
  if (!aiClient) throw new Error("API Key missing");
  try {
      let operation = await aiClient.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt,
          config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
      });
      while (!operation.done) {
          await new Promise(r => setTimeout(r, 5000)); 
          operation = await aiClient.operations.getVideosOperation({ operation });
      }
      const vid = operation.response?.generatedVideos?.[0]?.video;
      return vid?.uri ? `${vid.uri}&key=${apiKey || process.env.API_KEY}` : null;
  } catch (error) {
      console.error("Veo Error:", error);
      throw error;
  }
};