import { GoogleGenAI, Type } from "@google/genai";

// Helper to get the AI client dynamically
// Priority: Specific API Key passed in argument > process.env.API_KEY
const getAiClient = (specificApiKey?: string) => {
  const defaultKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
  const finalKey = specificApiKey || defaultKey;

  if (!finalKey) return null;
  return new GoogleGenAI({ apiKey: finalKey });
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

  let title, headline, subhead, content;
  
  if (stream === 'market') {
    title = isCN ? `深度解析: ${topic} 对全球结算网络的影响` : `Deep Dive: Impact of ${topic} on Global Settlement`;
    headline = isCN ? "市场趋势分析" : "Market Trend";
    subhead = isCN ? `${topic} 正在重塑跨境支付格局` : `${topic} is reshaping cross-border payments`;
    content = isCN 
      ? `<p><strong>${prefix}</strong></p><p>随着 <strong>${topic}</strong> 的持续发酵，全球金融市场正在经历新一轮的波动。作为下一代清算网络，PAIPAY 密切关注这一趋势。</p><h2>市场背景</h2><p>近期数据显示，链上交易量增长显著，机构入场速度加快。在此背景下，传统的跨境支付链路显得愈发低效。</p><h3>关键数据分析</h3><ul><li>链上交易量增长 15%</li><li>机构入场速度加快</li><li>合规门槛进一步提升</li></ul><p>我们的混合架构正是为了解决这一痛点而生。通过整合 Layer 2 技术，我们将结算成本降低了 90%。</p><h3>未来展望</h3><p>预计在 Q3 季度，我们将看到更多基于区块链的即时结算应用落地。建议企业客户提前布局，优化资金管理策略。</p>${suffix}`
      : `<p><strong>${prefix}</strong></p><p>As <strong>${topic}</strong> continues to evolve, global financial markets are experiencing a new wave of volatility. As a next-gen clearing network, PAIPAY is monitoring this trend closely.</p><h2>Market Context</h2><p>Recent data indicates a significant increase in on-chain transaction volume and accelerated institutional entry. In this context, traditional cross-border payment rails are becoming increasingly inefficient.</p><h3>Key Data Analysis</h3><ul><li>On-chain volume up 15%</li><li>Institutional adoption accelerating</li><li>Compliance standards tightening</li></ul><p>Our hybrid architecture was designed to solve this exact pain point. By integrating Layer 2 technology, we have reduced settlement costs by 90%.</p><h3>Outlook</h3><p>We expect to see more blockchain-based real-time settlement applications launching in Q3.</p>${suffix}`;
  } else {
    title = isCN ? `公告: ${topic} 功能正式上线` : `Announcement: ${topic} is Live`;
    headline = isCN ? "系统升级" : "System Upgrade";
    subhead = isCN ? "更安全、更快速的结算体验" : "Faster, safer settlement experience";
    content = isCN
      ? `<p><strong>${prefix}</strong></p><p>尊敬的用户，我们很高兴地宣布 <strong>${topic}</strong> 现已部署完毕。本次更新旨在提升资金流转效率。</p><h2>功能概述</h2><p>经过三个月的开发与测试，新版本将为用户带来以下核心改进：</p><h3>主要变更</h3><ul><li>API 响应速度提升 30%</li><li>支持更多本地货币结算</li><li>增强了安全验证机制</li></ul><p>请查阅开发者文档以获取最新集成指南。如有任何疑问，请随时联系我们的技术支持团队。</p>${suffix}`
      : `<p><strong>${prefix}</strong></p><p>Dear users, we are pleased to announce that <strong>${topic}</strong> is now fully deployed. This update aims to improve capital flow efficiency.</p><h2>Overview</h2><p>After three months of development and testing, the new version brings the following core improvements:</p><h3>Key Changes</h3><ul><li>API response time improved by 30%</li><li>Support for more local currencies</li><li>Enhanced security verification mechanisms</li></ul><p>Please refer to the developer documentation for the latest integration guides.</p>${suffix}`;
  }

  return {
    title,
    poster_data: {
      headline: headline,
      subhead: subhead,
      body_highlight: isCN ? "全球清算 · 极速达" : "Global Clearing · Instant Settlement"
    },
    slug: "impact-of-market-trend-2025",
    meta_desc: isCN ? "本文深入探讨了近期市场热点对跨境支付基础设施的长远影响。" : "An in-depth analysis of recent market trends.",
    content,
    tags: isCN ? ["#金融科技", "#跨境支付", "#区块链"] : ["#Fintech", "#CrossBorder", "#Blockchain"],
    image_prompt: `Futuristic 3D abstract illustration of ${topic}, blue and white color scheme, isometric view, high tech financial data visualization, clean background, 8k resolution.`,
    social_drafts: {
      twitter: isCN 
        ? `🚀 ${topic} 正在重塑市场！\n\n传统的结算方式已经跟不上节奏了。看看 PAIPAY 如何通过混合架构解决这一难题。\n\n👉 阅读完整报告: https://paipay.finance/insights`
        : `🚀 ${topic} is reshaping the market!\n\nTraditional settlement rails can't keep up. See how PAIPAY solves this with hybrid architecture.\n\n👉 Read full report: https://paipay.finance/insights`,
      linkedin: isCN
        ? `【行业洞察】${topic}：机遇与挑战并存\n\n在最新的市场分析中，我们探讨了这一趋势如何影响企业级资金流转。PAIPAY 致力于为企业提供合规、高效的全球结算方案。`
        : `[Industry Insight] ${topic}: Opportunities & Challenges\n\nIn our latest market analysis, we explore how this trend impacts enterprise capital flow. PAIPAY is committed to providing compliant, efficient global settlement solutions.`,
      telegram: isCN
        ? `📢 **PAIPAY 市场简报**\n\n主题: ${topic}\n\n🔸 核心观点: 市场正在转向链上结算\n🔸 影响: 传统 SWIFT 模式面临挑战\n🔸 建议: 关注合规稳定币通道`
        : `📢 **PAIPAY Market Brief**\n\nTopic: ${topic}\n\n🔸 Core View: Market shifting to on-chain settlement\n🔸 Impact: Traditional SWIFT models challenged\n🔸 Advice: Monitor compliant stablecoin rails`
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
  apiKey?: string // Optional dynamic API key
): Promise<GeneratedArticle | null> => {
  
  const ai = getAiClient(apiKey);

  if (!ai) {
    console.warn("⚠️ Simulation Mode: API Key missing. Returning mock AI response.");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let topic = "Crypto Trend";
    const titleMatch = rawSource.match(/(?:标题|TITLE)[:：]\s*(.*)/);
    if (titleMatch) {
         topic = titleMatch[1];
    } else {
         const topicMatch = rawSource.match(/TITLE: (.*)/) || rawSource.substring(0, 20);
         topic = Array.isArray(topicMatch) ? topicMatch[1] : topicMatch as string;
    }

    return getMockArticle(topic || "Crypto Trend", language, stream);
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
      return JSON.parse(response.text) as GeneratedArticle;
    }
    return null;

  } catch (error) {
    console.error("AI Generation Failed:", error);
    return getMockArticle("Market Update", language, stream);
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
  
  // Video logic specifically often needs a paid key, so we strictly check
  const currentKey = apiKey || process.env.API_KEY;
  if (!currentKey) {
     throw new Error("API Key is missing. Please select a key.");
  }
  
  const aiClient = new GoogleGenAI({ apiKey: currentKey });
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
      if (vid?.uri) {
          return `${vid.uri}&key=${currentKey}`;
      }
      return null;
  } catch (error) {
      console.error("Veo Generation Error:", error);
      throw error;
  }
};