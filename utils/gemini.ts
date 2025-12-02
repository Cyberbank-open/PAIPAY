import { GoogleGenAI, Type } from "@google/genai";

// Helper to get the AI client dynamically
// Priority: Specific API Key passed in argument > process.env.API_KEY
const getAiClient = (specificApiKey?: string) => {
  // 1. Try to use the specific key passed from Admin Dashboard Settings
  if (specificApiKey && specificApiKey.trim() !== '') {
    return new GoogleGenAI({ apiKey: specificApiKey });
  }

  // 2. Fallback to the environment variable (Netlify/Vite)
  // Vite replaces 'process.env.API_KEY' with the actual string literal at build time.
  const envKey = process.env.API_KEY ?? "";
  
  if (envKey && typeof envKey === 'string' && envKey.trim() !== '') {
    return new GoogleGenAI({ apiKey: envKey });
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

// --- MOCK DATA GENERATOR FOR SIMULATION MODE ---
const getMockArticle = (topic: string, lang: string, stream: 'market' | 'notice'): GeneratedArticle => {
  const isCN = lang === 'CN';
  const prefix = stream === 'market' ? (isCN ? '【PAIPAY 市场洞察】' : '[PAIPAY Market Pulse]') : (isCN ? '【系统公告】' : '[System Notice]');
  const suffix = isCN ? '<hr><p class="text-sm text-gray-500 italic">免责声明：本文仅供参考，不构成投资建议。</p>' : '<hr><p class="text-sm text-gray-500 italic">Disclaimer: This content is for informational purposes only.</p>';

  return {
    title: isCN ? `[模拟] 深度解析: ${topic}` : `[SIM] Deep Dive: ${topic}`,
    poster_data: {
      headline: isCN ? "市场趋势分析" : "Market Trend",
      subhead: isCN ? `${topic} 正在重塑支付格局` : `${topic} is reshaping payments`,
      body_highlight: isCN ? "全球清算 · 极速达" : "Global Clearing · Instant Settlement"
    },
    slug: "market-trend-2025",
    meta_desc: isCN ? "PAIPAY 深度市场分析报告（模拟数据）。" : "PAIPAY In-depth market analysis (Simulation).",
    content: `<p><strong>${prefix}</strong></p>
    <p>${isCN ? '⚠️ <strong>系统提示：当前处于模拟生成模式。</strong>' : '⚠️ <strong>System Notice: Currently in Simulation Mode.</strong>'}</p>
    <p>${isCN ? '原因：未检测到有效的 API Key。' : 'Reason: No valid API Key detected.'}</p>
    <ul>
      <li>${isCN ? '如果您已在 Netlify 配置 Key，请检查代码已重新部署。' : 'If you set the Key in Netlify, ensure code is redeployed.'}</li>
      <li>${isCN ? '您也可以在“系统配置”中手动输入 API Key。' : 'You can also manually enter the API Key in "System Settings".'}</li>
    </ul>
    ${suffix}`,
    tags: ["#Fintech", "#PAIPAY", "#Simulation"],
    image_prompt: `Futuristic abstract illustration of ${topic}, blue and white color scheme, isometric view, high tech, clean background.`,
    social_drafts: {
      twitter: `[Sim] ${topic} is trending! #PAIPAY`,
      linkedin: `[Sim] Latest insights on ${topic}. Read more at PAIPAY.`,
      telegram: `[Sim] 📢 Update: ${topic}`
    }
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
  apiKey?: string // Optional dynamic API key from Admin Settings
): Promise<GeneratedArticle | null> => {
  
  const ai = getAiClient(apiKey);

  if (!ai) {
    console.warn("⚠️ Simulation Mode: API Key missing. Returning mock AI response.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getMockArticle("Simulation Topic (No Key)", language, stream);
  }

  // Use the configured model
  const prefix = stream === 'market' ? (language === 'CN' ? '【PAIPAY 市场洞察】' : '[PAIPAY Market Pulse]') : (language === 'CN' ? '【系统公告】' : '[System Notice]');

  // STRICT PROMPT ENGINEERING FOR HTML FORMATTING
  const systemInstruction = `You are an expert Fintech Editor for PAIPAY, a global clearing network. 
  Your Tone: ${tone}.
  Article Length: ${length}.
  Stream Type: ${stream}.
  Language: ${language}.
  
  CRITICAL FORMATTING RULES (STRICT HTML ENFORCEMENT):
  1. **OUTPUT RAW JSON ONLY**. Do NOT use markdown code blocks (no \`\`\`json).
  2. **CONTENT FIELD MUST BE HTML**:
     - The 'content' field must be a valid HTML string (e.g., "<p>Text</p>").
     - **DO NOT** use Markdown syntax (e.g., **bold**, ## Header) inside the content string. 
     - Use <h3> for subheadings.
     - Use <p> for paragraphs.
     - Use <ul> and <li> for lists.
     - Use <strong> for emphasis.
     - Use <br> for line breaks only if necessary within a paragraph.
  3. **STRUCTURE**:
     - Start with <p><strong>${prefix}</strong></p>.
     - Write a compelling lead.
     - Use bullet points for data.
     - End with <hr> and a disclaimer.
  `;

  const prompt = `Raw Source Material: 
  "${rawSource}"
  
  Generate the full JSON response now, ensuring 'content' is pure HTML tags, no markdown formatting.`;

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
                    headline: { type: Type.STRING, description: "Max 5 words, catchy" },
                    subhead: { type: Type.STRING, description: "Max 12 words summary" },
                    body_highlight: { type: Type.STRING, description: "Key stat or short quote" }
                }
            },
            slug: { type: Type.STRING },
            meta_desc: { type: Type.STRING },
            content: { type: Type.STRING, description: "Full article body in HTML format (NO Markdown)" },
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
      // Remove generic markdown blocks if model hallucinates them
      if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
      if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
      
      return JSON.parse(cleanText) as GeneratedArticle;
    }
    return null;

  } catch (error) {
    console.error("AI Generation Failed:", error);
    return getMockArticle("Generation Error", language, stream);
  }
};

export const translateText = async (
    text: string,
    targetLanguage: string,
    modelName: string = "gemini-2.5-flash-lite-latest",
    apiKey?: string
): Promise<string> => {
    const ai = getAiClient(apiKey);
    if (!ai) return `[Mock Trans] ${text.substring(0, 50)}...`;

    const systemInstruction = `Translate to ${targetLanguage}. Maintain tone. Return ONLY the translated text.`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: text,
            config: { systemInstruction }
        });
        return response.text || text;
    } catch (e) { return text; }
}

export const generateVideoContent = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  apiKey?: string
): Promise<string | null> => {
  const aiClient = getAiClient(apiKey);
  if (!aiClient) throw new Error("API Key is missing.");
  
  const model = 'veo-3.1-fast-generate-preview';

  try {
      let operation = await aiClient.models.generateVideos({
          model,
          prompt,
          config: {
              numberOfVideos: 1,
              resolution: '720p',
              aspectRatio: aspectRatio
          }
      });

      while (!operation.done) {
          await new Promise(r => setTimeout(r, 5000)); 
          operation = await aiClient.operations.getVideosOperation({ operation });
      }
      
      const vid = operation.response?.generatedVideos?.[0]?.video;
      if (vid?.uri) {
          const usedKey = apiKey || process.env.API_KEY || '';
          return `${vid.uri}&key=${usedKey}`;
      }
      return null;
  } catch (error) {
      console.error("Veo Error:", error);
      throw error;
  }
};