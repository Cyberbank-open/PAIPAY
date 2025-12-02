import React, { useState, useEffect, useRef } from 'react';
import { generateArticleContent, generateVideoContent, translateText } from '../utils/gemini';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'launchpad' | 'studio' | 'notices' | 'reports' | 'team' | 'settings';
type SettingsSubTab = 'ai' | 'data' | 'social' | 'brand';
type WorkflowStep = 'strategy' | 'editor' | 'assets' | 'distribution' | 'summary';
type ContentStream = 'market' | 'notice';
type PosterRatio = '1:1' | '16:9' | '9:16';
type ArticleLength = 'short' | 'medium' | 'long';
type InputSourceType = 'text' | 'url' | 'image';
type AssetMode = 'template' | 'ai_gen' | 'veo';

// --- Visual Style Constants ---
const PAIPAY_VISUAL_STYLE = "PAIPAY Brand Style: Futuristic Fintech, 3D Isometric View, Clean White Background, Deep Blue (#2563EB) and Cyan (#06B6D4) Accents, High-end Commercial Render, Unreal Engine 5 Style, 8k Resolution, Minimalist Tech.";

// --- Types ---
interface SocialChannel {
    id: string;
    platform: 'twitter' | 'facebook' | 'telegram' | 'wechat' | 'linkedin' | 'instagram' | 'tiktok' | 'web';
    name: string;
    group: 'Global' | 'China' | 'Vietnam' | 'Thailand' | 'Cambodia';
    icon: string;
    connected: boolean;
    lang_code: string; 
    preferred_ratio: PosterRatio;
    followers?: string;
    last_sync?: string;
}

interface DataSource {
    id: number;
    name: string;
    type: 'RSS' | 'API' | 'Scraper' | 'Stream' | 'Webhook';
    status: 'active' | 'paused';
    lastSync: string;
    frequency: string;
    endpoint: string;
}

interface Notice {
    id: number;
    title: string;
    slug: string; 
    meta_desc: string;
    stream: ContentStream;
    category: string;
    language: string; 
    tag: string;
    date: string;
    author: string;
    status: 'Published' | 'Archived' | 'Draft' | 'Scheduled' | 'Pending Audit';
    workflow_step: WorkflowStep;
    views: number;
    shares: number;
    content?: string;
    raw_source?: string;
    custom_instruction?: string; 
    generated_image?: string; 
    generated_video?: string; // New: Veo Output
    image_prompt?: string; 
    poster_template_id?: string;
    social_drafts?: Record<string, string>;
    tags?: string[];
    created_at?: string;
    image_url?: string;
}

interface TrendingTopic {
    id: string;
    title: string;
    source: string;
    hot_score: number;
    desc: string;
}

interface PosterTemplate {
    id: string;
    name: string;
    type: 'system' | 'market';
    previewColor: string;
    icon: string;
    label_en: string; 
}

interface BrandConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    logoUrl: string;
    watermark: boolean;
    companyName: string;
    slogan: string;
    vision: string;
    mission: string;
    tone: string;
    keywords: string[];
}

interface AIConfig {
    // Content Creation (High IQ)
    creationProvider: 'gemini' | 'openai' | 'anthropic';
    creationModel: string;
    creationApiKey: string;
    
    // Translation (Cost Effective)
    translationProvider: 'gemini' | 'deepl';
    translationModel: string;
    
    // Visuals
    imageProvider: 'midjourney' | 'dalle' | 'imagen';
    imageModel: string;
    imageApiKey: string;
    
    // Video
    videoProvider: 'veo';
    videoModel: string;
    
    // General
    temperature: number;
    maxTokens: number;
    isSaving: boolean;
}

// --- Templates Configuration ---
const SYSTEM_TEMPLATES: PosterTemplate[] = [
    { id: 'sys_partnership', name: '合作宣言', label_en: 'PARTNERSHIP', type: 'system', previewColor: 'bg-gradient-to-br from-yellow-100 to-blue-100', icon: 'ri-hand-coin-line' },
    { id: 'sys_update', name: 'APP更新', label_en: 'NEW UPDATE', type: 'system', previewColor: 'bg-gray-50 border border-gray-200', icon: 'ri-smartphone-line' },
    { id: 'sys_event', name: '活动预告', label_en: 'EVENT', type: 'system', previewColor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', icon: 'ri-calendar-event-line' },
    { id: 'sys_maintenance', name: '停机维护', label_en: 'MAINTENANCE', type: 'system', previewColor: 'bg-yellow-50 border-yellow-200', icon: 'ri-tools-line' },
    { id: 'sys_security', name: '安全升级', label_en: 'SECURITY', type: 'system', previewColor: 'bg-green-50 border-green-200', icon: 'ri-shield-check-line' },
];

const MARKET_TEMPLATES: PosterTemplate[] = [
    { id: 'mkt_trend', name: '趋势分析', label_en: 'MARKET TREND', type: 'market', previewColor: 'bg-blue-50', icon: 'ri-line-chart-line' },
    { id: 'mkt_report', name: '研报摘要', label_en: 'INSIGHTS', type: 'market', previewColor: 'bg-gray-100', icon: 'ri-file-paper-2-line' },
    { id: 'mkt_breaking', name: '突发快讯', label_en: 'BREAKING', type: 'market', previewColor: 'bg-red-50', icon: 'ri-alarm-warning-line' },
    { id: 'mkt_regulation', name: '合规政策', label_en: 'REGULATION', type: 'market', previewColor: 'bg-indigo-50', icon: 'ri-government-line' },
    { id: 'mkt_edu', name: '科普教育', label_en: 'ACADEMY', type: 'market', previewColor: 'bg-teal-50', icon: 'ri-book-open-line' },
];

// --- Mock Data ---
const trendingTopicsRaw: TrendingTopic[] = [
    { id: 't1', title: "Fed Rate Cut Impact on Stablecoins", source: "Bloomberg", hot_score: 98, desc: "Traders are moving to on-chain yields as treasury rates drop." },
    { id: 't2', title: "RWA Tokenization in SEA", source: "CoinDesk", hot_score: 85, desc: "Singapore regulators approve new sandbox for RWA." },
    { id: 't3', title: "Solana Pay Integration with Shopify", source: "TechCrunch", hot_score: 72, desc: "New plugin allows instant USDC settlement for merchants." },
    { id: 't4', title: "Cross-border Yuan Settlement Rise", source: "Reuters", hot_score: 65, desc: "Usage of CIPS grows by 15% in Q3." },
    { id: 't5', title: "PAIPAY Network Upgrade Completed", source: "Internal System", hot_score: 100, desc: "All nodes updated successfully." },
    { id: 't6', title: "Scheduled Maintenance: BTC Bridge", source: "DevOps", hot_score: 90, desc: "Downtime expected: 2 hours." },
];

const text = {
    sidebar: {
        studio: '内容工坊',
        notices: '公告管理',
        settings: '系统配置',
        logout: '退出登录'
    }
};

// --- Simple Rich Text Editor Component ---
const RichTextEditor: React.FC<{ value: string; onChange: (html: string) => void; className?: string }> = ({ value, onChange, className }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
             if (!editorRef.current.innerHTML) editorRef.current.innerHTML = value;
        }
    }, [value]);

    const exec = (command: string, value: string = '') => {
        document.execCommand(command, false, value);
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    return (
        <div className={`flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white ${isFocused ? 'ring-2 ring-blue-100 border-blue-400' : ''} ${className}`}>
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 overflow-x-auto scrollbar-hide">
                <button title="Bold" onClick={() => exec('bold')} className="p-2 rounded hover:bg-gray-200 text-gray-600 flex-shrink-0"><i className="ri-bold"></i></button>
                <button title="Italic" onClick={() => exec('italic')} className="p-2 rounded hover:bg-gray-200 text-gray-600 flex-shrink-0"><i className="ri-italic"></i></button>
                <div className="w-px h-4 bg-gray-300 mx-1 flex-shrink-0"></div>
                <button title="H3" onClick={() => exec('formatBlock', '<h3>')} className="p-2 rounded hover:bg-gray-200 text-gray-600 font-bold text-xs flex-shrink-0">H3</button>
                <button title="Paragraph" onClick={() => exec('formatBlock', '<p>')} className="p-2 rounded hover:bg-gray-200 text-gray-600 font-bold text-xs flex-shrink-0">P</button>
                <div className="w-px h-4 bg-gray-300 mx-1 flex-shrink-0"></div>
                <button title="Unordered List" onClick={() => exec('insertUnorderedList')} className="p-2 rounded hover:bg-gray-200 text-gray-600 flex-shrink-0"><i className="ri-list-unordered"></i></button>
                <button title="Quote" onClick={() => exec('formatBlock', '<blockquote>')} className="p-2 rounded hover:bg-gray-200 text-gray-600 flex-shrink-0"><i className="ri-double-quotes-l"></i></button>
            </div>
            <div 
                ref={editorRef}
                contentEditable
                className="flex-1 p-4 md:p-6 outline-none min-h-[300px] md:min-h-[400px] prose prose-blue prose-p:mb-4 prose-headings:mb-3 prose-headings:font-bold prose-ul:list-disc prose-li:mb-1 max-w-none text-gray-700 leading-relaxed text-sm md:text-base"
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { setIsFocused(false); onChange(editorRef.current?.innerHTML || ''); }}
                dangerouslySetInnerHTML={{ __html: value }} 
            />
        </div>
    );
};

// --- Toast Component ---
const Toast: React.FC<{ message: string; show: boolean; onClose: () => void; type?: 'success' | 'info' | 'loading' | 'error' }> = ({ message, show, onClose, type = 'success' }) => {
    useEffect(() => {
        if (show && type !== 'loading') {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose, type]);

    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[100] transform transition-all duration-300 w-[90%] md:w-auto ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
            <div className={`${type === 'success' ? 'bg-gray-900 border-gray-800' : (type === 'loading' ? 'bg-blue-600 border-blue-500' : (type === 'error' ? 'bg-red-600 border-red-500' : 'bg-gray-800 border-gray-700'))} text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border md:min-w-[300px] w-full`}>
                {type === 'loading' ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0"></div>
                ) : (
                    <div className={`w-6 h-6 rounded-full ${type === 'success' ? 'bg-green-500 text-black' : (type === 'error' ? 'bg-white text-red-600' : 'bg-blue-500 text-white')} flex items-center justify-center text-sm flex-shrink-0`}>
                        <i className={type === 'success' ? "ri-check-line font-bold" : (type === 'error' ? "ri-close-line font-bold" : "ri-information-line font-bold")}></i>
                    </div>
                )}
                <span className="font-bold text-sm tracking-wide truncate">{message}</span>
            </div>
        </div>
    );
};

// --- Main Component ---
const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('studio');
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsSubTab>('ai');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'info' | 'loading' | 'error'>('success');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('Loading...');
  const [isMobile, setIsMobile] = useState(false);

  // --- SETTINGS STATE ---
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
      primaryColor: '#2563EB', 
      secondaryColor: '#0F172A', 
      accentColor: '#06B6D4',
      fontFamily: 'Inter',
      logoUrl: '',
      watermark: true,
      companyName: 'PAIPAY',
      slogan: 'Next Gen Global Clearing Network',
      vision: 'Building the seamless financial layer for the digital economy.',
      mission: 'To democratize access to institutional-grade payment rails.',
      tone: 'Professional, Authoritative, Insightful',
      keywords: ['Fintech', 'Blockchain', 'Settlement', 'Global', 'Compliance']
  });
  
  const [aiConfig, setAiConfig] = useState<AIConfig>({
      creationProvider: 'gemini',
      creationModel: 'gemini-3-pro-preview',
      creationApiKey: '',
      translationProvider: 'gemini',
      translationModel: 'gemini-2.5-flash-lite-latest',
      imageProvider: 'midjourney',
      imageModel: 'midjourney-v6',
      imageApiKey: '',
      videoProvider: 'veo',
      videoModel: 'veo-3.1-fast-generate-preview',
      temperature: 0.7,
      maxTokens: 2048,
      isSaving: false
  });

  const [dataSources, setDataSources] = useState<DataSource[]>([
      { id: 1, name: 'Bloomberg Crypto RSS', type: 'RSS', status: 'active', lastSync: '10 mins ago', frequency: '1h', endpoint: 'https://rss.bloomberg.com/crypto' },
      { id: 2, name: 'CoinGecko API', type: 'API', status: 'active', lastSync: '1 min ago', frequency: '15m', endpoint: 'https://api.coingecko.com/v3/global' },
      { id: 3, name: 'Google Trends (Finance)', type: 'Scraper', status: 'active', lastSync: '1 hour ago', frequency: '6h', endpoint: 'trends.google.com' },
      { id: 4, name: 'Twitter Sentiment Firehose', type: 'Stream', status: 'paused', lastSync: '2 days ago', frequency: 'Real-time', endpoint: 'wss://firehose.twitter.com' },
      { id: 5, name: 'Internal Jira (DevOps)', type: 'Webhook', status: 'active', lastSync: 'Live', frequency: 'Real-time', endpoint: 'https://hooks.paipay.com/jira/v2' }
  ]);

  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [newSource, setNewSource] = useState<Partial<DataSource>>({
      name: '',
      type: 'RSS',
      endpoint: '',
      frequency: '1h'
  });

  const [socialChannels, setSocialChannels] = useState<SocialChannel[]>([
      { id: 'wechat_cn', platform: 'wechat', name: 'WeChat OA', group: 'China', icon: 'ri-wechat-fill', connected: true, lang_code: 'CN', preferred_ratio: '9:16', followers: '45.2K', last_sync: 'Active' },
      { id: 'x_cn', platform: 'twitter', name: 'X (中文)', group: 'China', icon: 'ri-twitter-x-line', connected: true, lang_code: 'CN', preferred_ratio: '16:9', followers: '12.8K', last_sync: 'Active' },
      { id: 'x_global', platform: 'twitter', name: 'X (Global)', group: 'Global', icon: 'ri-twitter-x-line', connected: true, lang_code: 'EN', preferred_ratio: '16:9', followers: '89.4K', last_sync: 'Active' },
      { id: 'tg_global', platform: 'telegram', name: 'Telegram (Global)', group: 'Global', icon: 'ri-telegram-fill', connected: true, lang_code: 'EN', preferred_ratio: '1:1', followers: '105K', last_sync: 'Active' },
  ]);
  
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false);
  const [newChannel, setNewChannel] = useState<Partial<SocialChannel>>({
      platform: 'twitter',
      group: 'Global',
      lang_code: 'EN',
      preferred_ratio: '16:9'
  });
  
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>(trendingTopicsRaw);
  const [pulseConfig, setPulseConfig] = useState({ keywords: '', isConfigOpen: false });

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Poster/Assets State
  const [posterText, setPosterText] = useState({
      headline: '',
      subhead: '',
      body: '',
      footer: '#PAIPAY'
  });
  const [assetMode, setAssetMode] = useState<AssetMode>('template');
  const [aiImageLoading, setAiImageLoading] = useState(false);
  const [veoLoading, setVeoLoading] = useState(false);
  const [previewRatio, setPreviewRatio] = useState<PosterRatio>('1:1'); 

  // Content Studio State
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set(['wechat_cn', 'x_cn']));
  const [activeSocialPreview, setActiveSocialPreview] = useState<string>('x_cn');
  const [stream, setStream] = useState<ContentStream>('market');
  const [articleLength, setArticleLength] = useState<ArticleLength>('medium');
  const [inputType, setInputType] = useState<InputSourceType>('text');
  
  const [currentArticle, setCurrentArticle] = useState<Partial<Notice>>({ 
      workflow_step: 'strategy',
      title: '',
      content: '',
      raw_source: '',
      custom_instruction: '',
      slug: '',
      meta_desc: '',
      stream: 'market',
      category: 'Crypto Trends',
      tag: 'TREND',
      language: 'CN', 
      social_drafts: {},
      tags: [],
      status: 'Draft',
      poster_template_id: '',
      image_prompt: ''
  });
  
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState(''); 

  // --- CMS STATE (Notices Module) ---
  const [cmsArticles, setCmsArticles] = useState<Notice[]>([]);
  const [cmsLoading, setCmsLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const getUser = async () => {
        if (!isSupabaseConfigured) {
             if (isMounted) setCurrentUserEmail('Admin (Simulation)');
             return;
        }
        try {
            const auth = supabase.auth as any;
            const { data } = await auth.getUser();
            if (isMounted) setCurrentUserEmail(data?.user?.email || 'Guest Admin');
        } catch (e) {
            if (isMounted) setCurrentUserEmail('Admin (Offline)');
        }
    };
    getUser();
    return () => { isMounted = false; };
  }, []);

  // Fetch articles when tab changes to 'notices'
  useEffect(() => {
    if (activeTab === 'notices') {
        const fetchCmsData = async () => {
            setCmsLoading(true);
            try {
                if (isSupabaseConfigured) {
                    const { data, error } = await supabase
                        .from('articles')
                        .select('*')
                        .order('created_at', { ascending: false });
                    
                    if (data) {
                        const mapped = data.map((item: any) => ({
                            ...item,
                            status: 'Published',
                            date: new Date(item.created_at).toLocaleDateString(),
                            workflow_step: 'summary'
                        }));
                        setCmsArticles(mapped);
                    }
                } else {
                    setCmsArticles([]);
                }
            } catch (e) {
                console.error("CMS Fetch Error", e);
            } finally {
                setCmsLoading(false);
            }
        };
        fetchCmsData();
    }
  }, [activeTab]);

  useEffect(() => {
      if (stream === 'market') {
          let filtered = trendingTopicsRaw.filter(t => t.source !== 'Internal System' && t.source !== 'DevOps');
          if (pulseConfig.keywords) {
              const kws = pulseConfig.keywords.toLowerCase().split(',').map(k => k.trim());
              filtered = filtered.filter(t => kws.some(k => t.title.toLowerCase().includes(k) || t.desc.toLowerCase().includes(k)));
          }
          setTrendingTopics(filtered);
      } else {
          setTrendingTopics(trendingTopicsRaw.filter(t => t.source === 'Internal System' || t.source === 'DevOps'));
      }
  }, [stream, pulseConfig.keywords]);

  // Update currentArticle stream when UI stream toggles
  useEffect(() => {
      setCurrentArticle(prev => ({ ...prev, stream: stream }));
  }, [stream]);

  const showNotification = (msg: string, type: 'success' | 'info' | 'loading' | 'error' = 'success') => {
      setToastMsg(msg); setToastType(type); setShowToast(true);
  };

  const navigateToSettings = () => {
      setActiveTab('settings');
      setActiveSettingsTab('ai'); 
      showNotification('跳转至系统配置页面', 'info');
  };

  const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          showNotification('正在识别海报内容...', 'loading');
          setTimeout(() => {
              const mockExtractedText = stream === 'market'
                 ? "(OCR 识别结果)\n来源：CoinTelegraph 截图\n标题：以太坊 ETF 获批概率提升至 75%\n内容摘要：彭博社分析师指出，SEC 态度出现软化，多个申请方已更新 S-1 表格。市场预计最早将于下周一公布结果。"
                 : "(OCR 识别结果)\n来源：内部邮件截图\n标题：关于 API v3.2 停机维护通知\n时间：2025年5月20日 02:00 UTC\n影响范围：所有充提币接口\n预计时长：2小时";
              setCurrentArticle(prev => ({
                  ...prev,
                  raw_source: mockExtractedText
              }));
              showNotification('识别成功，素材已填入', 'success');
          }, 1500);
      }
  }

  const ingestTopic = (topic: TrendingTopic) => {
      setCurrentArticle(prev => ({
          ...prev,
          raw_source: `(Source: ${topic.source})\nTITLE: ${topic.title}\n\n${topic.desc}`,
          title: topic.title,
          stream: stream, // Ensure stream is synced
          category: stream === 'market' ? 'Crypto Trends' : 'System Update',
          tag: stream === 'market' ? 'TREND' : 'SYSTEM'
      }));
      setInputType('text');
      showNotification(`已引用: ${topic.title}`, 'info');
  };

  const handleAiGenerate = async () => {
      if (!currentArticle.raw_source) {
          showNotification('请输入原始素材', 'error');
          return;
      }
      setAiGenerating(true);
      setAiStep(`正在分析素材 (${aiConfig.creationModel})...`); 

      try {
        const generatedData = await generateArticleContent(
          currentArticle.raw_source || '',
          brandConfig.tone, 
          currentArticle.language || 'CN',
          currentArticle.category || 'General',
          stream,
          articleLength,
          aiConfig.creationModel,
          aiConfig.creationApiKey
        );

        if (!generatedData) throw new Error("No data generated");

        const drafts: Record<string, string> = {};
        socialChannels.forEach(ch => {
          let text = '';
          if (['twitter', 'wechat'].includes(ch.platform)) text = generatedData.social_drafts.twitter; 
          else if (['linkedin', 'facebook'].includes(ch.platform)) text = generatedData.social_drafts.linkedin;
          else if (ch.platform === 'telegram') text = generatedData.social_drafts.telegram;
          else text = generatedData.social_drafts.linkedin; 
          
          const hashtags = generatedData.tags.join(' ');
          drafts[ch.id] = `${text}\n\n${hashtags}`;
        });

        const brandPromptPrefix = `${PAIPAY_VISUAL_STYLE} Subject:`;
        const enhancedImagePrompt = `${brandPromptPrefix} ${generatedData.image_prompt}`;

        setCurrentArticle(prev => ({
          ...prev,
          title: generatedData.title,
          slug: generatedData.slug,
          meta_desc: generatedData.meta_desc,
          content: generatedData.content,
          social_drafts: drafts,
          tags: generatedData.tags,
          workflow_step: 'editor',
          image_prompt: enhancedImagePrompt
        }));
        
        setPosterText({
            headline: generatedData.poster_data.headline || 'BREAKING NEWS',
            subhead: generatedData.poster_data.subhead || '',
            body: generatedData.poster_data.body_highlight || '',
            footer: brandConfig.slogan || '#PAIPAY'
        });

        showNotification('草稿已生成，请审核', 'success');
      } catch (error: any) {
        showNotification(`生成失败: ${error.message}`, 'error');
      } finally {
        setAiGenerating(false);
      }
  };

  const handleAiImageGeneration = () => {
      if (!currentArticle.image_prompt) {
          showNotification('缺少 AI 绘图提示词，请先生成文章', 'error');
          return;
      }
      setAiImageLoading(true);
      showNotification(`AI 正在绘制插图 (${aiConfig.imageModel})...`, 'loading'); 
      
      setTimeout(() => {
          const keywords = currentArticle.tags?.slice(0, 2).join(',') || 'fintech';
          const fallbackUrl = `https://placehold.co/1024x1024/0F172A/FFF?text=${keywords}+Illustration&font=roboto`;
          
          setCurrentArticle(prev => ({ 
              ...prev, 
              generated_image: fallbackUrl,
              poster_template_id: 'ai_custom' 
          }));
          setAssetMode('ai_gen');
          setAiImageLoading(false);
          showNotification('插图绘制完成，已适配所有尺寸', 'success');
      }, 3000);
  };

  const handleVeoGeneration = async () => {
      if (!currentArticle.image_prompt) {
          showNotification('缺少视频提示词', 'error');
          return;
      }
      
      if (previewRatio === '1:1') {
          showNotification('Veo 视频不支持 1:1 比例，请切换至 16:9 或 9:16', 'error');
          return;
      }

      setVeoLoading(true);
      showNotification(`正在连接 ${aiConfig.videoModel}...`, 'loading');
      
      try {
          const aistudio = (window as any).aistudio;
          if (aistudio) {
              let hasKey = await aistudio.hasSelectedApiKey();
              if (!hasKey) {
                  try {
                      await aistudio.openSelectKey();
                      hasKey = await aistudio.hasSelectedApiKey();
                  } catch (e) {
                      throw new Error("取消了 API Key 选择");
                  }
              }
              if (!hasKey) {
                showNotification('请选择 Paid API Key 以使用 Veo 模型', 'info');
                setVeoLoading(false);
                return;
              }
          }

          const motionSuffix = " Cinematic lighting, high-tech motion graphics, 4k, slow smooth motion.";
          const finalPrompt = currentArticle.image_prompt.includes('Cinematic') ? currentArticle.image_prompt : currentArticle.image_prompt + motionSuffix;

          const videoUri = await generateVideoContent(
              finalPrompt,
              previewRatio as '16:9' | '9:16',
              aiConfig.creationApiKey 
          );

          if (videoUri) {
              setCurrentArticle(prev => ({
                  ...prev,
                  generated_video: videoUri,
                  poster_template_id: 'veo_motion'
              }));
              showNotification('Veo 视频生成成功', 'success');
          } else {
              throw new Error("Video generation returned no URI");
          }
      } catch (err: any) {
          console.error(err);
          let msg = err.message || '生成失败';
          if (msg.includes('Requested entity was not found')) msg = "API Key 无效或未启用计费，请重新选择";
          showNotification(msg, 'error');
      } finally {
          setVeoLoading(false);
      }
  };

  const handleTemplateSelect = (templateId: string) => {
      setAssetMode('template');
      setCurrentArticle(prev => ({ ...prev, poster_template_id: templateId }));
      showNotification('模版已切换', 'info');
  };

  // ... (Drawing logic maintained, skipping some lines for brevity) ...
  useEffect(() => {
      if (currentArticle.workflow_step === 'assets' && assetMode === 'template' && currentArticle.poster_template_id) {
           drawPoster(currentArticle.poster_template_id, posterText, previewRatio);
      }
  }, [currentArticle.workflow_step, currentArticle.poster_template_id, previewRatio, posterText, assetMode, brandConfig]);

  const drawLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      const { primaryColor, secondaryColor } = brandConfig;
      ctx.save();
      ctx.beginPath();
      const r = size * 0.2; 
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + size - r, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + r);
      ctx.lineTo(x + size, y + size - r);
      ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
      ctx.lineTo(x + r, y + size);
      ctx.quadraticCurveTo(x, y + size, x, y + size - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      
      const grd = ctx.createLinearGradient(x, y, x + size, y + size);
      grd.addColorStop(0, primaryColor);
      grd.addColorStop(1, '#06B6D4');
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${size * 0.6}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("P", x + size / 2, y + size / 2 + size * 0.05);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = secondaryColor;
      ctx.font = `bold ${size * 0.4}px ${brandConfig.fontFamily}, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(brandConfig.companyName, x + size * 1.2, y + size / 2);
      ctx.restore();
  }

  const drawBadge = (ctx: CanvasRenderingContext2D, label: string, x: number, y: number, height: number, type: 'market' | 'system', align: 'left' | 'right' = 'right') => {
      ctx.save();
      const fontSize = height * 0.5; 
      ctx.font = `bold ${fontSize}px sans-serif`;
      const textMetrics = ctx.measureText(label);
      const padding = fontSize * 0.8;
      const boxWidth = textMetrics.width + padding * 2;
      const boxHeight = height;
      const startX = align === 'right' ? x - boxWidth : x;

      ctx.beginPath();
      ctx.rect(startX, y, boxWidth, boxHeight);
      ctx.closePath();
      ctx.fillStyle = type === 'market' ? brandConfig.primaryColor : brandConfig.secondaryColor;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, startX + boxWidth / 2, y + boxHeight / 2);
      ctx.fillStyle = type === 'market' ? '#06B6D4' : '#F59E0B';
      ctx.fillRect(startX, y + boxHeight - 4, boxWidth, 4);
      ctx.restore();
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
  }

  const drawPoster = (templateId: string, texts: typeof posterText, ratio: PosterRatio) => {
      return new Promise<void>((resolve, reject) => {
          const canvas = canvasRef.current;
          if (!canvas) return reject('No canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No ctx');

          let w = 1080;
          let h = 1080;
          if (ratio === '16:9') { w = 1920; h = 1080; }
          if (ratio === '9:16') { w = 1080; h = 1920; }
          canvas.width = w;
          canvas.height = h;

          ctx.clearRect(0, 0, w, h);
          const primary = brandConfig.primaryColor;
          
          ctx.fillStyle = '#FFFFFF'; 
          ctx.fillRect(0, 0, w, h);

          if (templateId === 'mkt_trend') {
              ctx.fillStyle = '#0F172A'; 
              ctx.fillRect(0, 0, w, h);
              ctx.strokeStyle = 'rgba(255,255,255,0.05)';
              ctx.lineWidth = 2;
              const gridSize = 120;
              for(let gx=0; gx<w; gx+=gridSize) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke(); }
              for(let gy=0; gy<h; gy+=gridSize) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke(); }
          } 
          else if (templateId === 'mkt_breaking') {
              ctx.fillStyle = '#FFF1F2'; 
              ctx.fillRect(0, 0, w, h);
              ctx.fillStyle = '#DC2626'; 
              ctx.fillRect(0, h - (h*0.1), w, h*0.1);
          }
          else if (templateId === 'sys_partnership') {
              const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
              grad.addColorStop(0, '#FFFFFF');
              grad.addColorStop(1, '#DBEAFE'); 
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, w, h);
              ctx.strokeStyle = 'rgba(37,99,235,0.1)';
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.arc(w/2, h/2, w*0.3, 0, Math.PI*2); ctx.stroke();
              ctx.beginPath(); ctx.arc(w/2, h/2, w*0.4, 0, Math.PI*2); ctx.stroke();
          }

          const padding = w * 0.08; 
          const maxWidth = w - (padding * 2);
          const isDarkTheme = templateId === 'mkt_trend';
          const titleColor = isDarkTheme ? '#FFFFFF' : '#111827';
          
          drawLogo(ctx, padding, padding, w * 0.08);

          const tpl = [...SYSTEM_TEMPLATES, ...MARKET_TEMPLATES].find(t => t.id === templateId);
          const badgeText = tpl ? tpl.label_en : 'NEWS';
          const badgeType = tpl ? tpl.type : 'system';
          drawBadge(ctx, badgeText, w - padding, padding + 10, w * 0.06, badgeType, 'right');

          let cursorY = h * 0.35;
          if (ratio === '16:9') cursorY = h * 0.3;

          ctx.fillStyle = isDarkTheme ? '#94A3B8' : '#6B7280';
          const subheadSize = w * 0.025; 
          ctx.font = `normal ${subheadSize}px ${brandConfig.fontFamily}, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          cursorY = wrapText(ctx, texts.subhead, padding, cursorY, maxWidth, subheadSize * 1.5);
          cursorY += h * 0.02;

          ctx.fillStyle = titleColor;
          const titleSize = w * 0.07; 
          ctx.font = `bold ${titleSize}px ${brandConfig.fontFamily}, sans-serif`;
          const titleLeading = titleSize * 1.2;
          cursorY = wrapText(ctx, texts.headline, padding, cursorY, maxWidth, titleLeading);
          cursorY += h * 0.04;
          
          ctx.fillStyle = templateId === 'mkt_breaking' ? '#DC2626' : primary;
          ctx.fillRect(padding, cursorY, w * 0.1, h * 0.005);
          cursorY += h * 0.06;

          ctx.fillStyle = templateId === 'mkt_breaking' ? '#DC2626' : (isDarkTheme ? '#FFFFFF' : primary);
          const bodySize = w * 0.04;
          ctx.font = `bold ${bodySize}px ${brandConfig.fontFamily}, sans-serif`;
          cursorY = wrapText(ctx, texts.body, padding, cursorY, maxWidth, bodySize * 1.4);

          const footerY = h - padding;
          ctx.fillStyle = isDarkTheme ? '#64748B' : '#9CA3AF';
          ctx.font = `bold ${w * 0.02}px ${brandConfig.fontFamily}, sans-serif`;
          ctx.textAlign = 'center';
          const footerText = brandConfig.watermark ? (brandConfig.slogan || 'PAIPAY.FINANCE') : '';
          ctx.fillText(footerText, w/2, footerY);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          if (assetMode === 'template') {
             setCurrentArticle(prev => ({ ...prev, generated_image: dataUrl }));
          }
          resolve();
      });
  }

  const handleApproveAndPublish = async () => {
      if (!currentArticle.title || !currentArticle.content) {
          showNotification('内容不完整，无法发布', 'error');
          return;
      }
      showNotification('正在发布到官方网站...', 'loading');

      const payload = {
          stream: stream, // Explicitly use the current stream state
          category: currentArticle.category || 'General',
          tag: currentArticle.tag || 'UPDATE',
          title: currentArticle.title,
          meta_desc: currentArticle.meta_desc || '',
          content: currentArticle.content,
          image_url: currentArticle.generated_video || currentArticle.generated_image || '',
          created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
          try {
              const { error } = await supabase.from('articles').insert([payload]);
              if (error) {
                  console.error('Publish error:', error);
                  showNotification(`发布失败: ${error.message}`, 'error');
                  return;
              }
          } catch (e: any) {
               showNotification(`系统错误: ${e.message}`, 'error');
               return;
          }
      } else {
          await new Promise(r => setTimeout(r, 1500));
      }

      handleWorkflowClick('summary');
      showNotification('发布成功！已同步至前端', 'success');
  };

  const handleWorkflowClick = (step: WorkflowStep) => {
      if (step === 'assets' && !currentArticle.poster_template_id && !currentArticle.generated_image) {
          const defaultId = stream === 'market' ? 'mkt_trend' : 'sys_update';
          setAssetMode('template');
          setCurrentArticle(prev => ({...prev, poster_template_id: defaultId, workflow_step: step}));
      } else {
          setCurrentArticle(prev => ({ ...prev, workflow_step: step }));
      }
  }

  // --- MISSING FUNCTIONS IMPLEMENTATION ---
  
  const saveAiConfig = () => {
      // In a real app, this would save to a DB or local storage
      showNotification('系统配置已保存', 'success');
  };

  const handleLogout = () => {
      onLogout();
  };

  const renderAssets = () => (
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-100 pb-4 gap-4">
               <div>
                   <h3 className="text-lg font-bold text-gray-900">Step 3: 视觉引擎 (Visuals)</h3>
                   <p className="text-xs text-gray-500">生成多尺寸适配的社交媒体海报或短视频。</p>
               </div>
               <div className="flex gap-2 w-full md:w-auto">
                   <button onClick={() => handleWorkflowClick('editor')} className="flex-1 md:flex-none px-4 py-3 md:py-2 text-gray-500 hover:text-gray-900 text-sm font-bold border border-gray-200 md:border-transparent rounded-lg">返回</button>
                   <button onClick={() => handleWorkflowClick('distribution')} className="flex-[2] md:flex-none px-6 py-3 md:py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md">下一步：分发</button>
               </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Controls */}
               <div className="space-y-6 order-2 lg:order-1">
                   {/* Mode Switcher */}
                   <div className="bg-gray-50 p-1 rounded-xl flex">
                       <button onClick={() => setAssetMode('template')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${assetMode === 'template' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>模版海报</button>
                       <button onClick={() => setAssetMode('ai_gen')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${assetMode === 'ai_gen' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}>AI 绘图</button>
                       <button onClick={() => setAssetMode('veo')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${assetMode === 'veo' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>Veo 视频</button>
                   </div>
                   
                   {/* Aspect Ratio */}
                   <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">输出比例</label>
                       <div className="flex gap-2">
                           {(['1:1', '16:9', '9:16'] as PosterRatio[]).map(r => (
                               <button 
                                   key={r}
                                   onClick={() => setPreviewRatio(r)}
                                   className={`flex-1 py-2 border rounded-lg text-xs font-bold transition-colors ${previewRatio === r ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600'}`}
                               >
                                   {r}
                               </button>
                           ))}
                       </div>
                   </div>

                   {assetMode === 'template' && (
                       <div className="space-y-4">
                           <div>
                               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">选择模版</label>
                               <div className="grid grid-cols-2 gap-2">
                                   {(stream === 'market' ? MARKET_TEMPLATES : SYSTEM_TEMPLATES).map(tpl => (
                                       <button 
                                           key={tpl.id}
                                           onClick={() => handleTemplateSelect(tpl.id)}
                                           className={`p-2 rounded-lg border text-left transition-all ${currentArticle.poster_template_id === tpl.id ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-400'}`}
                                       >
                                           <div className={`h-8 rounded mb-2 ${tpl.previewColor} flex items-center justify-center`}>
                                               <i className={`${tpl.icon} opacity-50`}></i>
                                           </div>
                                           <div className="text-[10px] font-bold text-gray-700">{tpl.name}</div>
                                       </button>
                                   ))}
                               </div>
                           </div>
                           
                           <div className="space-y-3 pt-4 border-t border-gray-100">
                               <input value={posterText.headline} onChange={(e) => setPosterText({...posterText, headline: e.target.value})} className="w-full p-2 text-sm border border-gray-200 rounded-lg" placeholder="主标题" />
                               <input value={posterText.subhead} onChange={(e) => setPosterText({...posterText, subhead: e.target.value})} className="w-full p-2 text-sm border border-gray-200 rounded-lg" placeholder="副标题" />
                               <textarea value={posterText.body} onChange={(e) => setPosterText({...posterText, body: e.target.value})} className="w-full p-2 text-sm border border-gray-200 rounded-lg h-20" placeholder="正文摘要" />
                           </div>
                       </div>
                   )}

                   {assetMode === 'ai_gen' && (
                       <div className="space-y-4">
                           <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                               <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">Prompt (Midjourney/Imagen)</label>
                               <textarea 
                                   value={currentArticle.image_prompt} 
                                   onChange={(e) => setCurrentArticle({...currentArticle, image_prompt: e.target.value})}
                                   className="w-full bg-white p-2 rounded-lg text-xs border border-purple-200 text-purple-900 h-24" 
                               />
                               <button 
                                   onClick={handleAiImageGeneration}
                                   disabled={aiImageLoading}
                                   className="w-full mt-3 bg-purple-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-purple-700 disabled:opacity-70"
                               >
                                   {aiImageLoading ? 'Drawing...' : 'Generate Image'}
                               </button>
                           </div>
                       </div>
                   )}

                   {assetMode === 'veo' && (
                       <div className="space-y-4">
                           <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                               <label className="block text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Prompt (Veo Video)</label>
                               <textarea 
                                   value={currentArticle.image_prompt} 
                                   onChange={(e) => setCurrentArticle({...currentArticle, image_prompt: e.target.value})}
                                   className="w-full bg-white p-2 rounded-lg text-xs border border-orange-200 text-orange-900 h-24" 
                               />
                               <button 
                                   onClick={handleVeoGeneration}
                                   disabled={veoLoading}
                                   className="w-full mt-3 bg-orange-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-orange-700 disabled:opacity-70"
                               >
                                   {veoLoading ? 'Generating Video...' : 'Generate Video (Veo)'}
                               </button>
                           </div>
                       </div>
                   )}
               </div>

               {/* Preview Area */}
               <div className="lg:col-span-2 order-1 lg:order-2 bg-gray-100 rounded-xl flex items-center justify-center p-8 overflow-hidden min-h-[400px]">
                   <div className={`relative shadow-2xl transition-all duration-500 bg-white ${previewRatio === '16:9' ? 'w-full aspect-video' : (previewRatio === '9:16' ? 'h-[500px] aspect-[9/16]' : 'w-[400px] aspect-square')}`}>
                       {assetMode === 'template' && (
                           <canvas ref={canvasRef} className="w-full h-full object-contain" />
                       )}
                       
                       {assetMode === 'ai_gen' && (
                           <div className="w-full h-full bg-gray-200 relative group overflow-hidden">
                               {currentArticle.generated_image ? (
                                   <img src={currentArticle.generated_image} className="w-full h-full object-cover" alt="AI Gen" />
                               ) : (
                                   <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col gap-2">
                                       <i className="ri-image-2-line text-4xl"></i>
                                       <span className="text-xs font-bold">Waiting for generation...</span>
                                   </div>
                               )}
                           </div>
                       )}

                       {assetMode === 'veo' && (
                           <div className="w-full h-full bg-black relative flex items-center justify-center">
                               {currentArticle.generated_video ? (
                                   <video src={currentArticle.generated_video} className="w-full h-full object-contain" controls autoPlay loop />
                               ) : (
                                   <div className="text-gray-500 flex flex-col items-center">
                                       <i className="ri-movie-line text-4xl mb-2"></i>
                                       <span className="text-xs">Video Preview</span>
                                   </div>
                               )}
                           </div>
                       )}
                   </div>
               </div>
           </div>
      </div>
  );

  const renderNotices = () => (
    <div className="animate-fade-in space-y-6">
        <div className="border-b border-gray-100 pb-6 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">内容管理 (CMS)</h2>
                <p className="text-sm text-gray-500">管理官方网站展示的所有文章与公告。</p>
            </div>
            <button 
                onClick={() => {
                   setActiveTab('studio');
                   setCurrentArticle({ workflow_step: 'strategy', language: 'CN', stream: 'market' });
                }}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
            >
                <i className="ri-add-line mr-1"></i> 发布新文章
            </button>
        </div>

        {cmsLoading ? (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        ) : cmsArticles.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <div className="text-gray-400 mb-2"><i className="ri-inbox-line text-4xl"></i></div>
                <p className="text-gray-500 font-medium">暂无已发布文章</p>
                <p className="text-xs text-gray-400 mt-1">前往内容工坊发布第一篇文章</p>
            </div>
        ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">文章标题</th>
                                <th className="px-6 py-4">类型/标签</th>
                                <th className="px-6 py-4">发布时间</th>
                                <th className="px-6 py-4">状态</th>
                                <th className="px-6 py-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {cmsArticles.map((article) => (
                                <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-gray-400 font-mono">#{article.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {article.image_url ? (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                                     {article.image_url.includes('.mp4') ? (
                                                         <video src={article.image_url} className="w-full h-full object-cover" />
                                                     ) : (
                                                         <img src={article.image_url} alt="Cover" className="w-full h-full object-cover" />
                                                     )}
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 flex-shrink-0">
                                                    <i className="ri-image-line"></i>
                                                </div>
                                            )}
                                            <div className="font-bold text-gray-900 line-clamp-1 max-w-[200px] group-hover:text-blue-600 transition-colors">
                                                {article.title}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            {article.stream === 'market' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                    市场数据
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                                                    系统公告
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded self-start mt-1">{article.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                        {new Date(article.created_at || '').toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                            Published
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-blue-600 px-2 py-1 transition-colors"><i className="ri-eye-line"></i></button>
                                        <button className="text-gray-400 hover:text-red-600 px-2 py-1 transition-colors"><i className="ri-delete-bin-line"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </div>
  );

  const renderStrategyInput = () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <i className={`${stream === 'market' ? 'ri-fire-fill text-orange-500' : 'ri-notification-3-fill text-blue-500'}`}></i> 
                            {stream === 'market' ? '热点抓取' : '系统日志'}
                        </h4>
                        <button onClick={navigateToSettings} className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            配置源 <i className="ri-arrow-right-line"></i>
                        </button>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] md:max-h-[400px]">
                        {trendingTopics.map(topic => (
                            <div key={topic.id} onClick={() => ingestTopic(topic)} className="p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all group">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-sm text-gray-800 group-hover:text-blue-700">{topic.title}</div>
                                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${stream === 'market' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{stream === 'market' ? topic.hot_score : 'LOG'}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                    <span>{topic.source}</span>
                                    <span className="text-blue-600 font-bold opacity-0 group-hover:opacity-100">引用</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
          </div>

          <div className="lg:col-span-2 space-y-4 md:space-y-6 order-1 lg:order-2">
              <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-2">
                             <h3 className="text-lg font-bold text-gray-900">Step 1: 内容策略 (Strategy)</h3>
                             <button onClick={navigateToSettings} className="text-gray-300 hover:text-blue-600 transition-colors" title="AI Configuration">
                                <i className="ri-settings-line"></i>
                             </button>
                        </div>
                        
                        <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto">
                            <button 
                                onClick={() => setStream('market')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${stream === 'market' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                            >
                                市场数据
                            </button>
                            <button 
                                onClick={() => setStream('notice')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${stream === 'notice' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                            >
                                系统公告
                            </button>
                        </div>
                    </div>
                    {/* ... Rest of Strategy Input ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">目标语言</label>
                             <select 
                                value={currentArticle.language}
                                onChange={(e) => setCurrentArticle({...currentArticle, language: e.target.value})}
                                className="w-full p-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                             >
                                 <option value="CN">简体中文 (默认)</option>
                                 <option value="EN">English (Global)</option>
                                 <option value="VN">Tiếng Việt</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">文章篇幅</label>
                             <div className="flex gap-2">
                                {(['short', 'medium', 'long'] as ArticleLength[]).map(len => (
                                    <button 
                                        key={len}
                                        onClick={() => setArticleLength(len)}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border ${articleLength === len ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        {len === 'short' ? '短讯' : (len === 'medium' ? '标准' : '深度')}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex gap-4 border-b border-gray-100 mb-4 overflow-x-auto">
                            <button onClick={() => setInputType('text')} className={`pb-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${inputType === 'text' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>文本输入</button>
                            <button onClick={() => setInputType('image')} className={`pb-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${inputType === 'image' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>图片/海报源</button>
                            <button onClick={() => setInputType('url')} className={`pb-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${inputType === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>URL 抓取</button>
                        </div>

                        {inputType === 'text' && (
                            <textarea 
                                value={currentArticle.raw_source}
                                onChange={(e) => setCurrentArticle({...currentArticle, raw_source: e.target.value})}
                                className="w-full h-32 p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none text-sm"
                                placeholder={stream === 'market' ? "粘贴关键事实、数据点或新闻快讯..." : "输入系统升级日志、维护时间或功能特性..."}
                            ></textarea>
                        )}

                        {inputType === 'image' && (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gray-50 group">
                                <i className="ri-image-add-line text-4xl text-gray-300 group-hover:text-blue-500 mb-3 block transition-colors"></i>
                                <div className="text-sm font-bold text-gray-600 mb-1">拖拽或点击上传海报/截图</div>
                                <div className="text-xs text-gray-400">系统将自动识别提取文字内容 (模拟 OCR)</div>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={handleSourceImageUpload}
                                    accept="image/*"
                                />
                            </div>
                        )}

                        {inputType === 'url' && (
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
                                    placeholder="https://..."
                                />
                                <button className="px-6 rounded-xl bg-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-300">抓取</button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button 
                            onClick={handleAiGenerate}
                            disabled={aiGenerating || !currentArticle.raw_source}
                            className="w-full md:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-gray-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {aiGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>{aiStep}</span>
                                </>
                            ) : (
                                <>
                                    <i className="ri-sparkling-2-fill text-yellow-400"></i>
                                    <span>AI 深度生成 (下一步)</span>
                                </>
                            )}
                        </button>
                    </div>
              </div>
          </div>
      </div>
  );

  const renderEditor = () => (
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-100 pb-4 gap-4">
               <div>
                   <h3 className="text-lg font-bold text-gray-900">Step 2: 智能编辑 (Editor)</h3>
                   <p className="text-xs text-gray-500">AI 已完成标准化排版。请检查段落间距与标题层级。</p>
               </div>
               <div className="flex gap-2 w-full md:w-auto">
                   <button onClick={() => handleWorkflowClick('strategy')} className="flex-1 md:flex-none px-4 py-3 md:py-2 text-gray-500 hover:text-gray-900 text-sm font-bold border border-gray-200 md:border-transparent rounded-lg">返回</button>
                   <button onClick={() => handleWorkflowClick('assets')} className="flex-[2] md:flex-none px-6 py-3 md:py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md">下一步：视觉引擎</button>
               </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               <div className="space-y-4 order-2 lg:order-1">
                   <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">文章标题</label>
                       <textarea 
                           value={currentArticle.title} 
                           onChange={(e) => setCurrentArticle({...currentArticle, title: e.target.value})}
                           className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900 text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none resize-none h-20" 
                       />
                   </div>
                   
                   <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">智能标签 (文末自动追加)</label>
                        <div className="flex flex-wrap gap-2">
                            {currentArticle.tags?.map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded font-bold">{tag}</span>
                            ))}
                        </div>
                   </div>

                   <div className="pt-4 border-t border-gray-100">
                       <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">AI 助手</h4>
                       <div className="flex flex-col gap-2">
                           <button className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 text-left">
                               <i className="ri-magic-line"></i> 润色语气 ({brandConfig.tone.split(',')[0]})
                           </button>
                           <button className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 text-left">
                               <i className="ri-scissors-cut-line"></i> 精简摘要
                           </button>
                       </div>
                   </div>
               </div>

               <div className="lg:col-span-3 order-1 lg:order-2">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">正文内容 (HTML 预览)</label>
                        <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">标准排版已应用</span>
                    </div>
                    <RichTextEditor 
                        value={currentArticle.content || ''} 
                        onChange={(html) => setCurrentArticle({...currentArticle, content: html})}
                        className="min-h-[300px] md:min-h-[500px]"
                    />
               </div>
           </div>
      </div>
  );
  
  // Return the main render (Dashboard Shell)
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex text-gray-600">
      {/* Toast Notification */}
      <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} type={toastType} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-gray-500"><i className="ri-menu-2-line text-xl"></i></button>
                <div className="hidden md:flex items-center text-sm font-bold text-gray-400">
                    <span className="text-gray-900">PAIPAY</span>
                    <span className="mx-2">/</span>
                    <span>Admin Console</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <button className="text-gray-400 hover:text-blue-600 transition-colors"><i className="ri-notification-3-line text-xl"></i></button>
                 <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-gray-900">Admin</div>
                        <div className="text-[10px] text-gray-400">{currentUserEmail}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-xs">A</div>
                    </div>
                 </div>
            </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {activeTab === 'studio' && (
                    <>
                        {currentArticle.workflow_step === 'strategy' && renderStrategyInput()}
                        {currentArticle.workflow_step === 'editor' && renderEditor()}
                        {currentArticle.workflow_step === 'assets' && renderAssets()}
                        {currentArticle.workflow_step === 'distribution' && (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold mb-4">全网分发确认</h3>
                                <button onClick={handleApproveAndPublish} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700">立即发布</button>
                            </div>
                        )}
                        {currentArticle.workflow_step === 'summary' && (
                             <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                                 <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6">
                                     <i className="ri-check-line text-4xl"></i>
                                 </div>
                                 <h2 className="text-2xl font-bold text-gray-900 mb-2">发布成功</h2>
                                 <p className="text-gray-500 mb-8">文章已同步至官网及所选社交媒体渠道。</p>
                                 <button onClick={() => setCurrentArticle({ workflow_step: 'strategy', language: 'CN', stream: 'market' })} className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:border-gray-900 transition-colors">发布下一篇</button>
                             </div>
                        )}
                    </>
                )}

                {activeTab === 'notices' && renderNotices()}

                {activeTab === 'settings' && (
                    <div className="p-8 bg-white rounded-2xl border border-gray-200">
                        <h2 className="text-xl font-bold mb-6">系统配置</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">Google Gemini API Key</label>
                                <input 
                                    type="password" 
                                    value={aiConfig.creationApiKey} 
                                    onChange={(e) => setAiConfig({...aiConfig, creationApiKey: e.target.value})}
                                    placeholder="Enter AIza..."
                                    className="w-full p-3 border rounded-xl" 
                                />
                            </div>
                            <button onClick={saveAiConfig} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">保存配置</button>
                        </div>
                    </div>
                )}
            </div>
        </main>
      </div>

      {/* Sidebar (Mobile Overlay) */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
      
      {/* Sidebar (Desktop) */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                 <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mr-3">P</div>
                 <span className="font-bold text-gray-900 tracking-tight">PAIPAY <span className="text-xs text-gray-400 font-normal">OS</span></span>
            </div>
            <div className="p-4 space-y-1">
                 <button onClick={() => setActiveTab('studio')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'studio' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                     <i className="ri-magic-line text-lg"></i> {text.sidebar.studio}
                 </button>
                 <button onClick={() => setActiveTab('notices')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'notices' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                     <i className="ri-article-line text-lg"></i> {text.sidebar.notices}
                 </button>
                 <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                     <i className="ri-settings-4-line text-lg"></i> {text.sidebar.settings}
                 </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
                 <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                     <i className="ri-logout-box-line"></i> {text.sidebar.logout}
                 </button>
            </div>
      </aside>
    </div>
  );
};

export default AdminDashboard;