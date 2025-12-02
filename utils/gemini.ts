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
  // We use the nullish coalescing operator and avoid try/catch blocks to prevent Rollup parsing errors.
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
    // Small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getMockArticle("Simulation Topic (No Key)", language, stream);
  }

  // Use the configured model
  const prefix = stream === 'market' ? (language === 'CN' ? '【PAIPAY 市场洞察】' : '[PAIPAY Market Pulse]') : (language === 'CN' ? '【系统公告】' : '[System Notice]');

  const systemInstruction = `You are an expert Fintech Editor for PAIPAY, a global clearing network. 
  Your Tone: ${tone}.
  Article Length: ${length} (Short: ~300 words, Medium: ~800 words, Long: ~1500 words).
  Stream Type: ${stream} (Market Pulse vs System Notice).
  Language: ${language}.
  
  Mandatory Formatting Rules:
  1. **Intro**: Start the HTML content with a paragraph containing the prefix "${prefix}".
  2. **Outro**: End the HTML content with a horizontal rule <hr> and a standardized disclaimer in ${language}.
  3. **Tags**: Generate 3-5 relevant tags (e.g., #DeFi, #Payments) and include them in the JSON 'tags' array, NOT in the HTML content.
  4. **Structure**: Use perfect HTML structure. **CRITICAL**: Use <p> tags for paragraphs. Do NOT use simple line breaks. Ensure headers (<h2>, <h3>) have clear separation from text.
  5. **Poster Data**: Extract key short texts for generating a poster image.
  6. **Image Prompt**: Generate a detailed Midjourney/DALL-E prompt for an abstract, high-tech illustration suitable for this article. Style: Isometric, Blue/White, Fintech.

  Requirements:
  1. Output must be valid JSON.
  2. "content" must be rich HTML.
  3. "social_drafts" should provide platform-specific copy (Twitter: short + hashtags, LinkedIn: professional, Telegram: bullet points).
  `;

  const prompt = `Raw Source Material: 
  "${rawSource}"
  
  Please generate the article structure.`;

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
            slug: { type: Type.STRING, description: "URL friendly slug" },
            meta_desc: { type: Type.STRING, description: "SEO meta description, max 160 chars" },
            content: { type: Type.STRING, description: "Full article body in HTML format" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            image_prompt: { type: Type.STRING, description: "Prompt for AI image generation" },
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
      // CLEANUP: Remove Markdown code blocks if present (common issue with some models)
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      return JSON.parse(cleanText) as GeneratedArticle;
    }
    return null;

  } catch (error) {
    console.error("AI Generation Failed:", error);
    // Fallback to mock if API call fails
    return getMockArticle("Generation Error (Check Console)", language, stream);
  }
};

export const translateText = async (
    text: string,
    targetLanguage: string,
    modelName: string = "gemini-2.5-flash-lite-latest",
    apiKey?: string // Optional dynamic API key
): Promise<string> => {
    
    const ai = getAiClient(apiKey);

    if (!ai) {
        return `[Mock Trans] ${text.substring(0, 50)}... (${targetLanguage})`;
    }

    const systemInstruction = `You are a professional translator for a Fintech company. Translate the text to ${targetLanguage}. Maintain tone and formatting. Return ONLY the translated text.`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: text,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text || text;
    } catch (e) {
        console.error("Translation failed", e);
        return text;
    }
}

export const generateVideoContent = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  apiKey?: string // Optional dynamic API key
): Promise<string | null> => {
  
  const aiClient = getAiClient(apiKey);
  
  if (!aiClient) {
     throw new Error("API Key is missing. Please select a key.");
  }
  
  const model = 'veo-3.1-fast-generate-preview';

  try {
      console.log(`Starting Veo generation (${aspectRatio})...`);
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
      // We must append the key to the URL for it to be accessible
      if (vid?.uri) {
          // Find which key was actually used to append it to the URL
          const usedKey = apiKey || process.env.API_KEY || '';
          return `${vid.uri}&key=${usedKey}`;
      }
      return null;
  } catch (error) {
      console.error("Veo Generation Error:", error);
      throw error;
  }
};