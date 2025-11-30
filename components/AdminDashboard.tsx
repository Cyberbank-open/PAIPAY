
import React, { useState, useEffect, useRef } from 'react';
import { generateArticleContent } from '../utils/gemini';
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

// --- Types ---
interface SocialChannel {
    id: string;
    platform: 'twitter' | 'facebook' | 'telegram' | 'wechat' | 'linkedin' | 'instagram' | 'tiktok';
    name: string;
    group: 'Global' | 'China' | 'Vietnam' | 'Thailand' | 'Cambodia';
    icon: string;
    connected: boolean;
    lang_code: string; 
    preferred_ratio: PosterRatio;
    followers?: string;
    last_sync?: string;
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
    image_prompt?: string; // New field for AI Image prompt
    poster_template_id?: string;
    social_drafts?: Record<string, string>;
    tags?: string[];
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
    label_en: string; // Added label for poster rendering
}

interface BrandConfig {
    // Visual Identity
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logoUrl: string; // Base64 or URL
    watermark: boolean;
    
    // Strategic Identity (New)
    companyName: string;
    slogan: string;
    vision: string;
    mission: string;
    
    // Tone & Voice
    tone: string;
    keywords: string[]; // Key terminology to reinforce
}

interface AIConfig {
    textProvider: 'gemini' | 'openai' | 'anthropic';
    textModel: string;
    textApiKey: string;
    
    imageProvider: 'midjourney' | 'dalle' | 'stability';
    imageModel: string;
    imageApiKey: string;
    
    temperature: number;
    maxTokens: number;
    isSaving: boolean;
}

// --- Templates Configuration (Refined) ---
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
                <button title="H2" onClick={() => exec('formatBlock', '<h2>')} className="p-2 rounded hover:bg-gray-200 text-gray-600 font-bold text-xs flex-shrink-0">H2</button>
                <button title="H3" onClick={() => exec('formatBlock', '<h3>')} className="p-2 rounded hover:bg-gray-200 text-gray-600 font-bold text-xs flex-shrink-0">H3</button>
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

// --- Modal Component ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 truncate text-lg">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"><i className="ri-close-line text-xl"></i></button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
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
  // Brand Configuration State (Global)
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
      primaryColor: '#2563EB', // Blue-600
      secondaryColor: '#0F172A', // Slate-900
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
  
  // AI Engine Configuration
  const [aiConfig, setAiConfig] = useState<AIConfig>({
      textProvider: 'gemini',
      textModel: 'gemini-2.5-flash',
      textApiKey: '', // Separate key for text

      imageProvider: 'midjourney',
      imageModel: 'midjourney-v6',
      imageApiKey: '', // Separate key for images
      
      temperature: 0.7,
      maxTokens: 2048,
      isSaving: false
  });

  // Data Sources Configuration
  const [dataSources, setDataSources] = useState([
      { id: 1, name: 'Bloomberg Crypto RSS', type: 'RSS', status: 'active', lastSync: '10 mins ago' },
      { id: 2, name: 'CoinGecko API', type: 'API', status: 'active', lastSync: '1 min ago' },
      { id: 3, name: 'Google Trends (Finance)', type: 'Scraper', status: 'active', lastSync: '1 hour ago' },
      { id: 4, name: 'Twitter Sentiment Firehose', type: 'Stream', status: 'paused', lastSync: '2 days ago' },
      { id: 5, name: 'Internal Jira (DevOps)', type: 'Webhook', status: 'active', lastSync: 'Live' }
  ]);

  // Social Matrix State (Now integrated into Settings)
  const [socialChannels, setSocialChannels] = useState<SocialChannel[]>([
      { id: 'wechat_cn', platform: 'wechat', name: 'WeChat OA', group: 'China', icon: 'ri-wechat-fill', connected: true, lang_code: 'CN', preferred_ratio: '9:16', followers: '45.2K', last_sync: 'Active' },
      { id: 'x_cn', platform: 'twitter', name: 'X (中文)', group: 'China', icon: 'ri-twitter-x-line', connected: true, lang_code: 'CN', preferred_ratio: '16:9', followers: '12.8K', last_sync: 'Active' },
      { id: 'x_global', platform: 'twitter', name: 'X (Global)', group: 'Global', icon: 'ri-twitter-x-line', connected: true, lang_code: 'EN', preferred_ratio: '16:9', followers: '89.4K', last_sync: 'Active' },
      { id: 'tg_global', platform: 'telegram', name: 'Telegram (Global)', group: 'Global', icon: 'ri-telegram-fill', connected: true, lang_code: 'EN', preferred_ratio: '1:1', followers: '105K', last_sync: 'Active' },
      { id: 'fb_vn', platform: 'facebook', name: 'Facebook (VN)', group: 'Vietnam', icon: 'ri-facebook-fill', connected: false, lang_code: 'VN', preferred_ratio: '1:1', followers: '-', last_sync: 'Inactive' },
  ]);
  
  // Add Channel Modal State
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false);
  const [newChannel, setNewChannel] = useState<Partial<SocialChannel>>({
      platform: 'twitter',
      group: 'Global',
      lang_code: 'EN',
      preferred_ratio: '16:9'
  });
  
  // Data States for Studio
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>(trendingTopicsRaw);
  
  // Market Pulse Config (Local to Studio view, but data comes from "Data Sources")
  const [pulseConfig, setPulseConfig] = useState({
      keywords: '',
      isConfigOpen: false
  });

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Poster State
  const [posterText, setPosterText] = useState({
      headline: '',
      subhead: '',
      body: '',
      footer: '#PAIPAY'
  });
  const [assetMode, setAssetMode] = useState<'template' | 'ai_gen'>('template');
  const [aiImageLoading, setAiImageLoading] = useState(false);
  const [previewRatio, setPreviewRatio] = useState<PosterRatio>('1:1'); // Default preview ratio

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
      language: 'CN', // Default Chinese
      social_drafts: {},
      tags: [],
      status: 'Draft',
      poster_template_id: '',
      image_prompt: ''
  });
  
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState(''); 

  // Resize Handler for Mobile Detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // User Fetching
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

  // --- Filter Logic for Market Pulse ---
  useEffect(() => {
      if (stream === 'market') {
          // Filter out internal system stuff
          let filtered = trendingTopicsRaw.filter(t => t.source !== 'Internal System' && t.source !== 'DevOps');
          
          if (pulseConfig.keywords) {
              const kws = pulseConfig.keywords.toLowerCase().split(',').map(k => k.trim());
              filtered = filtered.filter(t => kws.some(k => t.title.toLowerCase().includes(k) || t.desc.toLowerCase().includes(k)));
          }
          setTrendingTopics(filtered);
      } else {
          // System Notice Stream - Show internal topics
          setTrendingTopics(trendingTopicsRaw.filter(t => t.source === 'Internal System' || t.source === 'DevOps'));
      }
  }, [stream, pulseConfig.keywords]);

  // Update selected channels based on Article Language
  useEffect(() => {
      const newSelection = new Set<string>();
      socialChannels.forEach(ch => {
          if (ch.lang_code === currentArticle.language && ch.connected) {
              newSelection.add(ch.id);
          }
      });
      setSelectedChannels(newSelection);
      const first = socialChannels.find(ch => ch.lang_code === currentArticle.language && ch.connected);
      if(first) {
          setActiveSocialPreview(first.id);
          setPreviewRatio(first.preferred_ratio);
      }
  }, [currentArticle.language, socialChannels]);


  const t = {
    CN: {
      sidebar: { brand: 'PAIPAY 中控', launchpad: '启动清单', studio: '内容工坊', notices: '内容档案', reports: '决策情报', team: '团队管理', settings: '系统配置', user: '管理员', logout: '登出' },
      studio: { 
          title: '智能内容工坊 v3.0', 
          subtitle: '全链路营销中台', 
          new_btn: '创作新内容', 
      },
    }
  };

  const text = t.CN;

  // --- Actions ---
  const handleLogout = async () => {
    try {
        const auth = supabase.auth as any;
        if (typeof auth.signOut === 'function') await auth.signOut();
        onLogout();
    } catch (error) { onLogout(); }
  };

  const showNotification = (msg: string, type: 'success' | 'info' | 'loading' | 'error' = 'success') => {
      setToastMsg(msg); setToastType(type); setShowToast(true);
  };

  const navigateToSettings = () => {
      setActiveTab('settings');
      setActiveSettingsTab('ai'); // Default to AI tab
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
      setAiStep(`正在分析素材 (${aiConfig.textModel})...`); // Use config model

      try {
        const generatedData = await generateArticleContent(
          currentArticle.raw_source || '',
          brandConfig.tone, // Use config tone
          currentArticle.language || 'CN',
          currentArticle.category || 'General',
          stream,
          articleLength
        );

        if (!generatedData) throw new Error("No data generated");

        const drafts: Record<string, string> = {};
        socialChannels.forEach(ch => {
          let text = '';
          // Simple logic to distribute short vs long content based on platform
          if (['twitter', 'wechat'].includes(ch.platform)) text = generatedData.social_drafts.twitter; 
          else if (['linkedin', 'facebook'].includes(ch.platform)) text = generatedData.social_drafts.linkedin;
          else if (ch.platform === 'telegram') text = generatedData.social_drafts.telegram;
          else text = generatedData.social_drafts.linkedin; 
          
          const hashtags = generatedData.tags.join(' ');
          drafts[ch.id] = `${text}\n\n${hashtags}`;
        });

        setCurrentArticle(prev => ({
          ...prev,
          title: generatedData.title,
          slug: generatedData.slug,
          meta_desc: generatedData.meta_desc,
          content: generatedData.content,
          social_drafts: drafts,
          tags: generatedData.tags,
          workflow_step: 'editor',
          image_prompt: generatedData.image_prompt 
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
      showNotification(`AI 正在绘制插图 (${aiConfig.imageModel})...`, 'loading'); // Use config model
      
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

  const handleTemplateSelect = (templateId: string) => {
      setAssetMode('template');
      setCurrentArticle(prev => ({ ...prev, poster_template_id: templateId }));
      showNotification('模版已切换', 'info');
  };

  useEffect(() => {
      if (currentArticle.workflow_step === 'assets' && assetMode === 'template' && currentArticle.poster_template_id) {
           drawPoster(currentArticle.poster_template_id, posterText, previewRatio);
      }
  }, [currentArticle.workflow_step, currentArticle.poster_template_id, previewRatio, posterText, assetMode, brandConfig]);

  // --- Canvas Drawing Logic ---
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
          setCurrentArticle(prev => ({ ...prev, generated_image: dataUrl }));
          resolve();
      });
  }

  const handleApproveAndPublish = async () => {
      showNotification('正在向全网节点分发...', 'loading');
      setTimeout(() => {
          handleWorkflowClick('summary');
          showNotification('发布成功', 'success');
      }, 2000);
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

  const handleChannelToggle = (id: string) => {
      const newSet = new Set(selectedChannels);
      if (newSet.has(id)) newSet.delete(id);
      else {
          newSet.add(id);
          const ch = socialChannels.find(c => c.id === id);
          if (ch && ch.lang_code !== currentArticle.language) {
              if (!currentArticle.social_drafts?.[id]) {
                 const baseDraft = String(Object.values(currentArticle.social_drafts || {})[0] || '');
                 const cleaned = baseDraft.replace(/\*\*/g, '');
                 const translated = ch.lang_code === 'EN' 
                    ? `[Auto-Trans] ${cleaned.substring(0, 50)}... (Translated to English)` 
                    : `[Auto-Trans] ${cleaned.substring(0, 50)}... (Translated)`;
                 
                 setCurrentArticle(prev => ({
                     ...prev,
                     social_drafts: { ...prev.social_drafts, [id]: translated }
                 }));
                 showNotification(`已自动翻译适配 ${ch.group} 社区`, 'info');
              }
          }
      }
      setSelectedChannels(newSet);
  }

  // --- SETTINGS ACTIONS ---
  const saveAiConfig = () => {
      setAiConfig({ ...aiConfig, isSaving: true });
      setTimeout(() => {
          setAiConfig({ ...aiConfig, isSaving: false });
          showNotification('AI 引擎配置已更新', 'success');
      }, 1000);
  };

  const toggleDataSource = (id: number) => {
      setDataSources(prev => prev.map(source => 
          source.id === id ? { ...source, status: source.status === 'active' ? 'paused' : 'active' } : source
      ));
      showNotification('数据源状态已切换', 'info');
  };

  const toggleSocialConnect = (id: string) => {
      const target = socialChannels.find(c => c.id === id);
      if (target?.connected) {
           setSocialChannels(prev => prev.map(c => c.id === id ? { ...c, connected: false } : c));
           showNotification(`已断开 ${target.name}`, 'info');
      } else {
          showNotification(`正在连接 ${target?.name}...`, 'loading');
          setTimeout(() => {
              setSocialChannels(prev => prev.map(c => c.id === id ? { ...c, connected: true, last_sync: 'Just now' } : c));
              showNotification(`授权成功`, 'success');
          }, 1500);
      }
  };

  const addNewSocialChannel = () => {
      if (!newChannel.name) {
          showNotification('请输入渠道名称', 'error');
          return;
      }
      const newId = `custom_${Date.now()}`;
      const channel: SocialChannel = {
          id: newId,
          platform: newChannel.platform as any,
          name: newChannel.name,
          group: newChannel.group as any,
          lang_code: newChannel.lang_code || 'EN',
          preferred_ratio: newChannel.preferred_ratio || '16:9',
          icon: newChannel.platform === 'twitter' ? 'ri-twitter-x-line' : (newChannel.platform === 'facebook' ? 'ri-facebook-fill' : 'ri-share-line'),
          connected: true,
          followers: '0',
          last_sync: 'Active'
      };
      
      setSocialChannels([...socialChannels, channel]);
      setIsAddChannelModalOpen(false);
      setNewChannel({ platform: 'twitter', group: 'Global', lang_code: 'EN', preferred_ratio: '16:9', name: '' });
      showNotification('新渠道已添加', 'success');
  }

  // --- RENDERERS ---
  // ... (Strategies, Editor, Assets, Distribution, Studio renders remain same but use new BrandConfig where applicable) ...

  const renderStrategyInput = () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
          {/* Left: Sources & Config */}
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
                        {trendingTopics.length === 0 && (
                            <div className="text-center text-gray-400 py-10 text-xs">没有找到相关数据</div>
                        )}
                    </div>
                </div>
          </div>

          {/* Right: Strategy Config */}
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
                                市场动态
                            </button>
                            <button 
                                onClick={() => setStream('notice')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${stream === 'notice' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                            >
                                系统公告
                            </button>
                        </div>
                    </div>

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

  // Editor, Assets, Distribution, Summary are mostly same structure, utilizing updated context.
  // ... (Skipping full repetition of unmodified UI blocks for brevity, but they are part of the full file) ...
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

  const renderAssets = () => {
      const templates = stream === 'market' ? MARKET_TEMPLATES : SYSTEM_TEMPLATES;
      return (
        <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-100 pb-4 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Step 3: 视觉引擎 (Assets)</h3>
                    <p className="text-xs text-gray-500">标准化输出所有社交媒体尺寸。VI 自动合成: {brandConfig.companyName}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => handleWorkflowClick('editor')} className="flex-1 md:flex-none px-4 py-3 md:py-2 text-gray-500 hover:text-gray-900 text-sm font-bold border border-gray-200 md:border-transparent rounded-lg">返回</button>
                    <button onClick={() => handleWorkflowClick('distribution')} className="flex-[2] md:flex-none px-6 py-3 md:py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md">下一步：全网分发</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Configuration & Templates */}
                    <div className="space-y-6 order-2 lg:order-1">
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                             <button 
                                onClick={() => { setAssetMode('template'); setCurrentArticle(p => ({ ...p, generated_image: undefined })); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${assetMode === 'template' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                             >
                                 标准模版
                             </button>
                             <button 
                                onClick={() => setAssetMode('ai_gen')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${assetMode === 'ai_gen' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                             >
                                 AI 绘图 (Auto-Draw)
                             </button>
                        </div>

                        {assetMode === 'template' ? (
                            <>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">模版库 ({stream === 'market' ? '市场类' : '系统类'})</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {templates.map(tpl => (
                                            <button 
                                                key={tpl.id}
                                                onClick={() => handleTemplateSelect(tpl.id)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95 ${currentArticle.poster_template_id === tpl.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${tpl.previewColor}`}>
                                                    <i className={`${tpl.icon} text-lg text-gray-700`}></i>
                                                </div>
                                                <span className={`text-[10px] font-bold ${currentArticle.poster_template_id === tpl.id ? 'text-blue-700' : 'text-gray-600'}`}>{tpl.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">文案微调</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">主标题</label>
                                            <input className="w-full p-2 rounded border border-gray-200 text-sm font-bold" value={posterText.headline} onChange={(e) => setPosterText({...posterText, headline: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">核心内文</label>
                                            <textarea className="w-full p-2 rounded border border-gray-200 text-sm h-16 resize-none" value={posterText.body} onChange={(e) => setPosterText({...posterText, body: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <h4 className="text-xs font-bold text-blue-700 uppercase mb-2 flex items-center gap-2">
                                        <i className="ri-sparkling-fill"></i> AI 绘图引擎 ({aiConfig.imageModel})
                                    </h4>
                                    <p className="text-xs text-blue-600 mb-3 leading-relaxed">
                                        基于文章语义自动生成配图。支持 1:1, 16:9, 9:16 全尺寸裁切。
                                    </p>
                                    <div className="mb-3">
                                        <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1">当前提示词 (Prompt)</label>
                                        <textarea 
                                            readOnly 
                                            className="w-full p-2 rounded bg-white border border-blue-200 text-[10px] text-gray-500 h-20 resize-none"
                                            value={currentArticle.image_prompt || "No prompt available"}
                                        />
                                    </div>
                                    <button 
                                        onClick={handleAiImageGeneration}
                                        disabled={aiImageLoading || !currentArticle.image_prompt}
                                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {aiImageLoading ? '正在绘制...' : '立即生成插图'}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="pt-4 border-t border-gray-100 text-center">
                            <button 
                                onClick={navigateToSettings}
                                className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center justify-center gap-2 w-full py-2"
                            >
                                <i className="ri-palette-line"></i> 调整品牌视觉规范 (VI)
                            </button>
                        </div>
                    </div>
                    {/* Right: Live Preview */}
                    <div className="lg:col-span-2 flex flex-col h-full bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden relative order-1 lg:order-2">
                         <div className="absolute top-4 left-0 w-full flex justify-center z-10 pointer-events-none">
                            <div className="flex bg-white/90 backdrop-blur-md rounded-full p-1 border border-gray-200 shadow-sm pointer-events-auto overflow-x-auto max-w-[90%] md:max-w-none scrollbar-hide">
                                <button onClick={() => setPreviewRatio('1:1')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${previewRatio === '1:1' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}><i className="ri-instagram-line"></i> Square (1:1)</button>
                                <button onClick={() => setPreviewRatio('16:9')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${previewRatio === '16:9' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}><i className="ri-twitter-x-line"></i> Post (16:9)</button>
                                <button onClick={() => setPreviewRatio('9:16')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${previewRatio === '9:16' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}><i className="ri-smartphone-line"></i> Story (9:16)</button>
                            </div>
                         </div>

                        <div className="flex-grow flex items-center justify-center p-6 md:p-12 mt-12 md:mt-12 overflow-hidden bg-gray-100/50 min-h-[400px]">
                            <div 
                                className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 relative flex items-center justify-center overflow-hidden"
                                style={{ width: isMobile ? '100%' : (previewRatio === '16:9' ? '100%' : (previewRatio === '9:16' ? '45%' : '65%')), aspectRatio: previewRatio.replace(':', '/'), maxWidth: '100%', maxHeight: '100%' }}
                            >
                                {aiImageLoading ? (
                                    <div className="absolute inset-0 bg-gray-100 animate-pulse flex flex-col items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Generating...</span>
                                    </div>
                                ) : (
                                    <>
                                        {assetMode === 'ai_gen' && currentArticle.generated_image ? (
                                             <div className="relative w-full h-full">
                                                <img src={currentArticle.generated_image} alt="AI Generated" className="w-full h-full object-cover"/>
                                                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur font-bold">AI ILLUSTRATION</div>
                                             </div>
                                        ) : (
                                            <img src={currentArticle.generated_image} alt="Poster Preview" className="w-full h-full object-contain" />
                                        )}
                                    </>
                                )}
                                <canvas ref={canvasRef} className="hidden"></canvas>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
      );
  };

  const renderDistribution = () => (
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-100 pb-4 gap-4">
               <div>
                   <h3 className="text-lg font-bold text-gray-900">Step 4: 全网分发 (Distribute)</h3>
                   <p className="text-xs text-gray-500">已自动过滤 Markdown 符号。海报已按渠道标准生成。</p>
               </div>
               <div className="flex gap-2 w-full md:w-auto">
                   <button onClick={() => handleWorkflowClick('assets')} className="flex-1 md:flex-none px-4 py-3 md:py-2 text-gray-500 hover:text-gray-900 text-sm font-bold border border-gray-200 md:border-transparent rounded-lg">返回</button>
                   <button onClick={handleApproveAndPublish} className="flex-[2] md:flex-none px-6 py-3 md:py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                       <i className="ri-rocket-fill"></i> 确认发布
                   </button>
               </div>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="space-y-4 order-2 lg:order-1">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">分发矩阵 (按语言)</h4>
                   {socialChannels.filter(ch => ch.connected).map(ch => (
                        <div 
                            key={ch.id}
                            onClick={() => handleChannelToggle(ch.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden active:scale-[0.98] ${selectedChannels.has(ch.id) ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-200 opacity-60 hover:opacity-100'}`}
                        >
                            <i className={`${ch.icon} text-xl ${selectedChannels.has(ch.id) ? 'text-blue-600' : 'text-gray-400'}`}></i>
                            <div className="flex-1">
                                <div className={`text-sm font-bold ${selectedChannels.has(ch.id) ? 'text-blue-900' : 'text-gray-700'}`}>{ch.name}</div>
                                <div className="text-[10px] text-gray-400">{ch.group}</div>
                            </div>
                            {selectedChannels.has(ch.id) && ch.lang_code !== currentArticle.language && (
                                <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold mr-2"><i className="ri-translate-2"></i> Auto</span>
                            )}
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedChannels.has(ch.id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                                {selectedChannels.has(ch.id) && <i className="ri-check-line text-white text-xs"></i>}
                            </div>
                        </div>
                   ))}
               </div>
               <div className="lg:col-span-2 order-1 lg:order-2">
                   <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                       {Array.from(selectedChannels).map(id => {
                           const ch = socialChannels.find(c => c.id === id);
                           if(!ch) return null;
                           return <button key={id} onClick={() => setActiveSocialPreview(id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeSocialPreview === id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>{ch.name}</button>
                       })}
                   </div>
                   <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200 relative">
                        <textarea 
                            className="w-full bg-transparent text-sm text-gray-800 leading-relaxed outline-none resize-none h-40 font-medium"
                            value={(currentArticle.social_drafts?.[activeSocialPreview] || "").replace(/\*\*/g, '')}
                            onChange={(e) => setCurrentArticle(prev => ({...prev, social_drafts: {...prev.social_drafts, [activeSocialPreview]: e.target.value}}))}
                            placeholder="Social text here..."
                        ></textarea>
                        {currentArticle.generated_image && (
                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm max-h-64 w-full object-cover relative group">
                                <img src={currentArticle.generated_image} className="w-full h-auto object-cover" alt="Preview" />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur">Poster Attached</div>
                            </div>
                        )}
                   </div>
               </div>
           </div>
      </div>
  );

  const renderStudio = () => (
     <div className="animate-fade-in">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
             <div>
                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{text.studio.title}</h1>
                 <p className="text-gray-500 text-sm">{text.studio.subtitle}</p>
             </div>
             <div className="flex gap-2">
                <button 
                    onClick={() => {
                        setCurrentArticle({ workflow_step: 'strategy', title: '', content: '', raw_source: '', tag: 'TREND', language: 'CN', stream: 'market', image_prompt: '' });
                        setAssetMode('template');
                    }}
                    className="w-full md:w-auto px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black shadow-lg shadow-gray-300 transition-all flex items-center justify-center gap-2"
                >
                    <i className="ri-add-line"></i>{text.studio.new_btn}
                </button>
             </div>
         </div>
         <div className="mb-10 overflow-x-auto pb-2 border-b border-gray-100 scrollbar-hide">
            <div className="flex items-center min-w-max gap-8 px-1">
                {['strategy', 'editor', 'assets', 'distribution'].map((step, idx) => {
                    const isCurrent = currentArticle.workflow_step === step;
                    const isPassed = ['strategy', 'editor', 'assets', 'distribution'].indexOf(currentArticle.workflow_step || 'strategy') > idx;
                    return (
                        <button key={step} onClick={() => handleWorkflowClick(step as WorkflowStep)} className={`flex items-center gap-3 pb-4 border-b-2 transition-all ${isCurrent ? 'border-blue-600 text-blue-600' : (isPassed ? 'border-transparent text-gray-600' : 'border-transparent text-gray-300')}`}>
                            <span className={`text-lg font-bold ${isCurrent ? 'text-blue-600' : (isPassed ? 'text-green-500' : 'text-gray-300')}`}>0{idx + 1}</span>
                            <span className="font-bold text-sm uppercase tracking-wider">{step}</span>
                        </button>
                    );
                })}
            </div>
         </div>
         {currentArticle.workflow_step === 'strategy' && renderStrategyInput()}
         {currentArticle.workflow_step === 'editor' && renderEditor()}
         {currentArticle.workflow_step === 'assets' && renderAssets()}
         {currentArticle.workflow_step === 'distribution' && renderDistribution()}
         {currentArticle.workflow_step === 'summary' && renderSummary()}
     </div>
  );

  const renderSummary = () => (
      <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow-lg shadow-green-200"><i className="ri-check-line text-5xl text-green-600"></i></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">发布流程已完成</h2>
          <p className="text-gray-500 max-w-md mb-10">内容已成功推送到全网节点和所选社群矩阵。</p>
          <button onClick={() => setCurrentArticle({ workflow_step: 'strategy', language: 'CN' })} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold">创作新内容</button>
      </div>
  );

  // --- NEW SETTINGS MODULE (Deep Navigation) ---
  const renderSettings = () => (
      <div className="animate-fade-in h-full flex flex-col md:flex-row gap-6 md:gap-8 min-h-[600px]">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sticky top-6">
                 <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Global Config</div>
                 {[
                     { id: 'ai', label: 'AI 引擎与算力', icon: 'ri-brain-line', desc: 'LLM & Image Gen Models' },
                     { id: 'data', label: '数据情报源', icon: 'ri-radar-line', desc: 'RSS, API, Webhooks' },
                     { id: 'social', label: '全网分发矩阵', icon: 'ri-share-forward-line', desc: 'Channels & OAuth' },
                     { id: 'brand', label: '品牌视觉规范 (VI)', icon: 'ri-palette-line', desc: 'Identity & Strategy' },
                 ].map((item) => (
                     <button
                        key={item.id}
                        onClick={() => setActiveSettingsTab(item.id as SettingsSubTab)}
                        className={`w-full text-left p-3.5 rounded-xl mb-1 transition-all flex items-center gap-3 ${activeSettingsTab === item.id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                     >
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeSettingsTab === item.id ? 'bg-gray-800' : 'bg-gray-100'}`}>
                             <i className={`${item.icon} text-lg`}></i>
                         </div>
                         <div>
                             <div className="text-sm font-bold">{item.label}</div>
                             <div className={`text-[10px] ${activeSettingsTab === item.id ? 'text-gray-400' : 'text-gray-400'}`}>{item.desc}</div>
                         </div>
                         {activeSettingsTab === item.id && <i className="ri-arrow-right-s-line ml-auto"></i>}
                     </button>
                 ))}
             </div>
          </div>

          {/* Settings Main Content Area */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 relative">
              
              {/* AI Config */}
              {activeSettingsTab === 'ai' && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="border-b border-gray-100 pb-6">
                          <h2 className="text-xl font-bold text-gray-900 mb-1">AI 引擎配置 (Engine)</h2>
                          <p className="text-sm text-gray-500">分别配置文本生成与图像生成的模型参数与密钥。</p>
                      </div>

                      {/* Text Model Section */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-center gap-2 mb-4">
                              <i className="ri-file-text-line text-blue-600 text-xl"></i>
                              <h3 className="font-bold text-gray-900">文本大模型 (Text LLM)</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Provider</label>
                                  <select 
                                    value={aiConfig.textProvider}
                                    onChange={(e) => setAiConfig({...aiConfig, textProvider: e.target.value as any})}
                                    className="w-full p-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-blue-500 outline-none"
                                  >
                                      <option value="gemini">Google Gemini</option>
                                      <option value="openai">OpenAI (GPT)</option>
                                      <option value="anthropic">Anthropic (Claude)</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Model Version</label>
                                  <select 
                                    value={aiConfig.textModel}
                                    onChange={(e) => setAiConfig({...aiConfig, textModel: e.target.value})}
                                    className="w-full p-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-blue-500 outline-none"
                                  >
                                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                      <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
                                      <option value="gpt-4o">GPT-4o</option>
                                  </select>
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">API Key (Text)</label>
                              <div className="relative">
                                  <input 
                                    type="password" 
                                    value={aiConfig.textApiKey}
                                    placeholder="sk-..."
                                    onChange={(e) => setAiConfig({...aiConfig, textApiKey: e.target.value})}
                                    className="w-full p-3 pl-10 bg-white rounded-xl text-sm font-mono border border-gray-200 focus:border-blue-500 outline-none"
                                  />
                                  <i className="ri-key-2-line absolute left-3 top-3.5 text-gray-400"></i>
                              </div>
                          </div>
                      </div>

                      {/* Image Model Section */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-center gap-2 mb-4">
                              <i className="ri-image-line text-purple-600 text-xl"></i>
                              <h3 className="font-bold text-gray-900">绘图模型 (Image Gen)</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Provider</label>
                                  <select 
                                    value={aiConfig.imageProvider}
                                    onChange={(e) => setAiConfig({...aiConfig, imageProvider: e.target.value as any})}
                                    className="w-full p-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-purple-500 outline-none"
                                  >
                                      <option value="midjourney">Midjourney</option>
                                      <option value="dalle">DALL-E 3</option>
                                      <option value="stability">Stability AI</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Model Version</label>
                                  <select 
                                    value={aiConfig.imageModel}
                                    onChange={(e) => setAiConfig({...aiConfig, imageModel: e.target.value})}
                                    className="w-full p-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-purple-500 outline-none"
                                  >
                                      <option value="midjourney-v6">Midjourney v6</option>
                                      <option value="midjourney-niji">Niji Journey (Anime)</option>
                                      <option value="dall-e-3">DALL-E 3 HD</option>
                                  </select>
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">API Key (Image)</label>
                              <div className="relative">
                                  <input 
                                    type="password" 
                                    value={aiConfig.imageApiKey}
                                    placeholder="sk-..."
                                    onChange={(e) => setAiConfig({...aiConfig, imageApiKey: e.target.value})}
                                    className="w-full p-3 pl-10 bg-white rounded-xl text-sm font-mono border border-gray-200 focus:border-purple-500 outline-none"
                                  />
                                  <i className="ri-key-2-line absolute left-3 top-3.5 text-gray-400"></i>
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">创造力参数 (Temperature): {aiConfig.temperature}</label>
                          <input 
                            type="range" 
                            min="0" max="1" step="0.1" 
                            value={aiConfig.temperature}
                            onChange={(e) => setAiConfig({...aiConfig, temperature: parseFloat(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                              <span>严谨 (0.0)</span>
                              <span>平衡 (0.5)</span>
                              <span>发散 (1.0)</span>
                          </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex justify-end">
                          <button 
                            onClick={saveAiConfig}
                            disabled={aiConfig.isSaving}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md flex items-center gap-2 transition-all active:scale-95"
                          >
                              {aiConfig.isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <i className="ri-save-3-line"></i>}
                              保存配置
                          </button>
                      </div>
                  </div>
              )}

              {/* Data Sources */}
              {activeSettingsTab === 'data' && (
                  <div className="space-y-6 animate-fade-in">
                       <div className="border-b border-gray-100 pb-6 flex justify-between items-end">
                          <div>
                              <h2 className="text-xl font-bold text-gray-900 mb-1">数据情报源 (Sources)</h2>
                              <p className="text-sm text-gray-500">配置“市场热点”抓取的信源与更新频率。</p>
                          </div>
                          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2 transition-colors">
                              <i className="ri-add-line"></i> 新增源
                          </button>
                      </div>

                      <div className="space-y-3">
                          {dataSources.map(source => (
                              <div key={source.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${source.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                          <i className={source.type === 'RSS' ? 'ri-rss-fill' : (source.type === 'API' ? 'ri-database-2-line' : 'ri-global-line')}></i>
                                      </div>
                                      <div>
                                          <div className="font-bold text-gray-900 text-sm">{source.name}</div>
                                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                              <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">{source.type}</span>
                                              <span>Last Sync: {source.lastSync}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <div 
                                        onClick={() => toggleDataSource(source.id)}
                                        className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${source.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}
                                      >
                                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${source.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                      </div>
                                      <button className="text-gray-400 hover:text-gray-900 p-2"><i className="ri-settings-4-line"></i></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Social Matrix */}
              {activeSettingsTab === 'social' && (
                   <div className="space-y-6 animate-fade-in">
                       <div className="border-b border-gray-100 pb-6 flex justify-between items-end">
                          <div>
                              <h2 className="text-xl font-bold text-gray-900 mb-1">全网分发矩阵 (Channels)</h2>
                              <p className="text-sm text-gray-500">管理各区域市场的社交媒体账号授权。</p>
                          </div>
                          <button onClick={() => setIsAddChannelModalOpen(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black flex items-center gap-2 shadow-md transition-all active:scale-95">
                              <i className="ri-add-line"></i> 添加渠道
                          </button>
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {socialChannels.map(channel => (
                              <div key={channel.id} className="p-5 border border-gray-200 rounded-2xl flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                                  {/* Background Icon Watermark */}
                                  <i className={`${channel.icon} absolute -right-4 -bottom-4 text-9xl text-gray-50 opacity-50 group-hover:scale-110 transition-transform pointer-events-none`}></i>

                                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${channel.connected ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                      <i className={channel.icon}></i>
                                  </div>
                                  
                                  <div className="flex-1 relative z-10">
                                      <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-bold text-gray-900">{channel.name}</h4>
                                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold">{channel.group}</span>
                                      </div>
                                      {channel.connected ? (
                                          <div className="flex flex-col gap-0.5">
                                              <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
                                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                  Connected
                                              </div>
                                              <div className="text-[10px] text-gray-400">Followers: {channel.followers}</div>
                                          </div>
                                      ) : (
                                          <div className="text-xs text-gray-400">Not Connected</div>
                                      )}
                                  </div>

                                  <button 
                                    onClick={() => toggleSocialConnect(channel.id)}
                                    className={`relative z-10 px-4 py-2 rounded-lg text-xs font-bold transition-all ${channel.connected ? 'bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200' : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'}`}
                                  >
                                      {channel.connected ? 'Disconnect' : 'Connect'}
                                  </button>
                              </div>
                          ))}
                      </div>
                   </div>
              )}

              {/* Brand VI (Integrated) */}
              {activeSettingsTab === 'brand' && (
                  <div className="space-y-8 animate-fade-in">
                       <div className="border-b border-gray-100 pb-6">
                          <h2 className="text-xl font-bold text-gray-900 mb-1">品牌视觉规范 (Brand VI)</h2>
                          <p className="text-sm text-gray-500">配置企业核心识别要素，AI 将基于此生成符合调性的内容。</p>
                      </div>

                      {/* Section 1: Strategic Identity */}
                      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                          <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                              <i className="ri-compass-3-fill"></i> 战略识别 (Strategic Identity)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Name</label>
                                  <input 
                                    type="text" 
                                    value={brandConfig.companyName}
                                    onChange={(e) => setBrandConfig({...brandConfig, companyName: e.target.value})}
                                    className="w-full p-3 bg-white rounded-xl text-sm border border-blue-100 focus:border-blue-500 outline-none"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Slogan</label>
                                  <input 
                                    type="text" 
                                    value={brandConfig.slogan}
                                    onChange={(e) => setBrandConfig({...brandConfig, slogan: e.target.value})}
                                    className="w-full p-3 bg-white rounded-xl text-sm border border-blue-100 focus:border-blue-500 outline-none"
                                  />
                              </div>
                              <div className="md:col-span-2">
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vision Statement (愿景)</label>
                                  <textarea 
                                    value={brandConfig.vision}
                                    onChange={(e) => setBrandConfig({...brandConfig, vision: e.target.value})}
                                    className="w-full p-3 bg-white rounded-xl text-sm border border-blue-100 focus:border-blue-500 outline-none resize-none h-20"
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Section 2: Visual Identity */}
                      <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <i className="ri-palette-fill text-gray-400"></i> 视觉识别 (Visual Identity)
                          </h3>
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:flex-row items-start gap-6 mb-6">
                              <div className="text-center w-full md:w-auto">
                                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Logo</label>
                                  <div className="w-24 h-24 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden mx-auto">
                                      {brandConfig.logoUrl ? (
                                          <img src={brandConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                      ) : (
                                          <div className="text-center">
                                              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold mx-auto mb-1 text-lg">P</div>
                                          </div>
                                      )}
                                  </div>
                              </div>
                              <div className="flex-1 w-full">
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Logo URL</label>
                                  <input 
                                    type="text" 
                                    placeholder="https://..." 
                                    value={brandConfig.logoUrl}
                                    onChange={(e) => setBrandConfig({...brandConfig, logoUrl: e.target.value})}
                                    className="w-full p-3 bg-white rounded-xl border border-gray-200 text-sm focus:border-blue-500 outline-none mb-2"
                                  />
                                  <div className="flex items-center gap-2">
                                      <input type="checkbox" checked={brandConfig.watermark} onChange={(e) => setBrandConfig({...brandConfig, watermark: e.target.checked})} id="watermark_chk" className="rounded text-blue-600 focus:ring-blue-500"/>
                                      <label htmlFor="watermark_chk" className="text-xs text-gray-600 font-medium">在生成的海报中应用水印</label>
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">主色调 (Primary)</label>
                                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                                      <input 
                                        type="color" 
                                        value={brandConfig.primaryColor} 
                                        onChange={(e) => setBrandConfig({...brandConfig, primaryColor: e.target.value})}
                                        className="w-8 h-8 rounded border-0 p-0 cursor-pointer"
                                      />
                                      <span className="font-mono text-sm text-gray-600 uppercase">{brandConfig.primaryColor}</span>
                                  </div>
                              </div>
                               <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">辅助色 (Secondary)</label>
                                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                                      <input 
                                        type="color" 
                                        value={brandConfig.secondaryColor} 
                                        onChange={(e) => setBrandConfig({...brandConfig, secondaryColor: e.target.value})}
                                        className="w-8 h-8 rounded border-0 p-0 cursor-pointer"
                                      />
                                      <span className="font-mono text-sm text-gray-600 uppercase">{brandConfig.secondaryColor}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Section 3: Tone & Voice */}
                      <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <i className="ri-chat-voice-fill text-gray-400"></i> 语气与调性 (Tone & Voice)
                          </h3>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Persona Description</label>
                          <textarea 
                                value={brandConfig.tone}
                                onChange={(e) => setBrandConfig({...brandConfig, tone: e.target.value})}
                                className="w-full p-4 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none h-24 resize-none leading-relaxed"
                                placeholder="e.g. Professional, Authoritative, Insightful. Speaks directly to institutional investors..."
                          />
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  const renderLaunchpad = () => <div className="p-8 text-center text-gray-400">Launchpad Module (Coming Soon)</div>;
  const renderReports = () => <div className="p-8 text-center text-gray-400">Reports Module (Coming Soon)</div>;
  const renderNotices = () => <div className="p-8 text-center text-gray-400">Notices Module (Coming Soon)</div>;
  const renderTeam = () => <div className="p-8 text-center text-gray-400">Team Module (Coming Soon)</div>;

  const renderSidebar = () => (
    <>
        <div 
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsSidebarOpen(false)}
        ></div>

        <div className={`fixed left-0 top-0 h-screen w-64 bg-[#0F172A] text-white border-r border-gray-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/50">P</div>
                    <span className="font-bold tracking-tight text-lg">{text.sidebar.brand}</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400"><i className="ri-close-line text-xl"></i></button>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-6">
                {[
                    { id: 'studio', label: text.sidebar.studio, icon: 'ri-edit-circle-line' },
                    { id: 'reports', label: text.sidebar.reports, icon: 'ri-pie-chart-2-line' },
                    { id: 'launchpad', label: text.sidebar.launchpad, icon: 'ri-rocket-2-line' },
                    { id: 'notices', label: text.sidebar.notices, icon: 'ri-archive-line' },
                    { id: 'team', label: text.sidebar.team, icon: 'ri-team-line' },
                    { id: 'settings', label: text.sidebar.settings, icon: 'ri-settings-4-line' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as Tab); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <i className={`${item.icon} text-lg`}></i>
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="p-4 bg-[#0B1120]">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold border border-white/10">{currentUserEmail.charAt(0).toUpperCase()}</div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-bold text-gray-200 truncate">{currentUserEmail}</div>
                        <div className="text-[10px] text-gray-500">{text.sidebar.user}</div>
                    </div>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors"><i className="ri-logout-box-r-line"></i></button>
                </div>
            </div>
        </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white md:pl-64 transition-all duration-300">
      <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} type={toastType} />
      
      {renderSidebar()}

      {/* Add Channel Modal */}
      <Modal isOpen={isAddChannelModalOpen} onClose={() => setIsAddChannelModalOpen(false)} title="Add Social Channel">
          <div className="space-y-4">
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Platform</label>
                  <select 
                      className="w-full p-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none"
                      value={newChannel.platform}
                      onChange={(e) => setNewChannel({...newChannel, platform: e.target.value as any})}
                  >
                      <option value="twitter">X (Twitter)</option>
                      <option value="facebook">Facebook</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="telegram">Telegram</option>
                      <option value="wechat">WeChat (Weixin)</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Channel Name</label>
                  <input 
                      type="text" 
                      className="w-full p-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none"
                      placeholder="e.g. PAIPAY Global"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Region/Group</label>
                      <select 
                          className="w-full p-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none"
                          value={newChannel.group}
                          onChange={(e) => setNewChannel({...newChannel, group: e.target.value as any})}
                      >
                          <option value="Global">Global</option>
                          <option value="China">China</option>
                          <option value="Vietnam">Vietnam</option>
                          <option value="Thailand">Thailand</option>
                      </select>
                  </div>
                  <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Language</label>
                       <select 
                          className="w-full p-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none"
                          value={newChannel.lang_code}
                          onChange={(e) => setNewChannel({...newChannel, lang_code: e.target.value})}
                      >
                          <option value="EN">English</option>
                          <option value="CN">Chinese</option>
                          <option value="VN">Vietnamese</option>
                          <option value="TH">Thai</option>
                      </select>
                  </div>
              </div>
              <button 
                  onClick={addNewSocialChannel}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 mt-4"
              >
                  Confirm & Connect
              </button>
          </div>
      </Modal>
      
      <div className="md:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">P</div>
               <span className="font-bold text-lg">{text.sidebar.brand}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 p-2"><i className="ri-menu-line text-2xl"></i></button>
      </div>
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {activeTab === 'studio' && renderStudio()}
        {activeTab === 'launchpad' && renderLaunchpad()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'notices' && renderNotices()}
        {activeTab === 'team' && renderTeam()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
};

export default AdminDashboard;
