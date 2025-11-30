
import React, { useState, useEffect, useRef } from 'react';
import { generateArticleContent } from '../utils/gemini';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'launchpad' | 'studio' | 'notices' | 'reports' | 'team' | 'settings';
type AdminLang = 'EN' | 'CN' | 'VN';
type WorkflowStep = 'strategy' | 'editor' | 'assets' | 'distribution' | 'summary';
type ContentStream = 'market' | 'notice';
type PosterRatio = '1:1' | '16:9' | '9:16';
type ArticleLength = 'short' | 'medium' | 'long';
type InputSourceType = 'text' | 'url' | 'image';

// --- Types ---
interface SocialChannel {
    id: string;
    platform: 'twitter' | 'facebook' | 'telegram' | 'wechat' | 'linkedin';
    name: string;
    group: 'Global' | 'China' | 'Vietnam';
    icon: string;
    connected: boolean;
    lang_code: string; 
    preferred_ratio: PosterRatio;
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
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logoUrl: string; // Base64 or URL
    tone: string;
    watermark: boolean;
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
const mockNotices: Notice[] = [
    { id: 101, stream: 'market', language: 'CN', title: '2025年Q1 全球稳定币监管白皮书', slug: '2025-q1-stablecoin-regulation-whitepaper', meta_desc: '深入剖析东南亚、欧盟及美洲地区的稳定币合规框架演变。', category: 'Regulatory', tag: 'Report', date: '2024-10-24', author: 'Alex Chen', status: 'Published', workflow_step: 'summary', views: 12400, shares: 450 },
    { id: 102, stream: 'notice', language: 'CN', title: '系统维护公告：Solana 节点升级', slug: 'maintenance-solana-node-upgrade', meta_desc: '为了提供更快的交易确认速度，我们将于本周五进行节点维护。', category: 'Maintenance', tag: 'System', date: '2024-10-22', author: 'DevOps Team', status: 'Archived', workflow_step: 'summary', views: 5300, shares: 12 },
];

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
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 overflow-x-auto">
                <button title="Bold" onClick={() => exec('bold')} className="p-2 rounded hover:bg-gray-200 text-gray-600"><i className="ri-bold"></i></button>
                <button title="Italic" onClick={() => exec('italic')} className="p-2 rounded hover:bg-gray-200 text-gray-600"><i className="ri-italic"></i></button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button title="H2" onClick={() => exec('formatBlock', '<h2>')} className="p-2 rounded hover:bg-gray-200 text-gray-600 font-bold text-xs">H2</button>
                <button title="H3" onClick={() => exec('formatBlock', '<h3>')} className="p-2 rounded hover:bg-gray-200 text-gray-600 font-bold text-xs">H3</button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button title="Unordered List" onClick={() => exec('insertUnorderedList')} className="p-2 rounded hover:bg-gray-200 text-gray-600"><i className="ri-list-unordered"></i></button>
                <button title="Quote" onClick={() => exec('formatBlock', '<blockquote>')} className="p-2 rounded hover:bg-gray-200 text-gray-600"><i className="ri-double-quotes-l"></i></button>
            </div>
            <div 
                ref={editorRef}
                contentEditable
                className="flex-1 p-6 outline-none min-h-[400px] prose prose-blue prose-p:mb-4 prose-headings:mb-3 prose-headings:font-bold prose-ul:list-disc prose-li:mb-1 max-w-none text-gray-700 leading-relaxed"
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
        <div className={`fixed bottom-6 right-6 z-[100] transform transition-all duration-300 ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
            <div className={`${type === 'success' ? 'bg-gray-900 border-gray-800' : (type === 'loading' ? 'bg-blue-600 border-blue-500' : (type === 'error' ? 'bg-red-600 border-red-500' : 'bg-gray-800 border-gray-700'))} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border min-w-[300px]`}>
                {type === 'loading' ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <div className={`w-6 h-6 rounded-full ${type === 'success' ? 'bg-green-500 text-black' : (type === 'error' ? 'bg-white text-red-600' : 'bg-blue-500 text-white')} flex items-center justify-center text-sm`}>
                        <i className={type === 'success' ? "ri-check-line font-bold" : (type === 'error' ? "ri-close-line font-bold" : "ri-information-line font-bold")}></i>
                    </div>
                )}
                <span className="font-bold text-sm tracking-wide">{message}</span>
            </div>
        </div>
    );
};

// --- Modal Component (Generic) ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><i className="ri-close-line text-xl"></i></button>
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
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'info' | 'loading' | 'error'>('success');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('Loading...');

  // Brand Configuration State
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
      primaryColor: '#2563EB', // Blue-600
      secondaryColor: '#0F172A', // Slate-900
      fontFamily: 'Inter',
      logoUrl: '',
      tone: 'Professional, Authoritative',
      watermark: true
  });
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Data States
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>(trendingTopicsRaw);
  
  // Market Pulse Config
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


  // --- Social Matrix State ---
  const [socialChannels, setSocialChannels] = useState<SocialChannel[]>([
      { id: 'wechat_cn', platform: 'wechat', name: 'WeChat OA', group: 'China', icon: 'ri-wechat-fill', connected: true, lang_code: 'CN', preferred_ratio: '9:16' },
      { id: 'x_cn', platform: 'twitter', name: 'X (中文)', group: 'China', icon: 'ri-twitter-x-line', connected: true, lang_code: 'CN', preferred_ratio: '16:9' },
      { id: 'x_global', platform: 'twitter', name: 'X (Global)', group: 'Global', icon: 'ri-twitter-x-line', connected: true, lang_code: 'EN', preferred_ratio: '16:9' },
      { id: 'tg_global', platform: 'telegram', name: 'Telegram (Global)', group: 'Global', icon: 'ri-telegram-fill', connected: true, lang_code: 'EN', preferred_ratio: '1:1' },
      { id: 'fb_vn', platform: 'facebook', name: 'Facebook (VN)', group: 'Vietnam', icon: 'ri-facebook-fill', connected: false, lang_code: 'VN', preferred_ratio: '1:1' },
  ]);
  
  // Distribution Selection State
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set(['wechat_cn', 'x_cn']));
  const [activeSocialPreview, setActiveSocialPreview] = useState<string>('x_cn');

  // --- Content Studio State ---
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
          // Auto set preview ratio based on first channel, but user can override
          setPreviewRatio(first.preferred_ratio);
      }
  }, [currentArticle.language, socialChannels]);


  const t = {
    CN: {
      sidebar: { brand: 'PAIPAY 中控', launchpad: '启动清单', studio: '内容工坊', notices: '内容档案', reports: '决策情报', team: '团队管理', settings: '系统设置', user: '管理员', logout: '登出' },
      studio: { 
          title: '智能内容工坊 v3.0', 
          subtitle: '全链路营销中台', 
          new_btn: '创作新内容', 
          stream_market: '市场动态 (Market Pulse)',
          stream_notice: '系统公告 (System Notice)',
          btn_generate: 'AI 智能编写', 
          publish: '一键发布', 
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
      showNotification('跳转至系统配置页面', 'info');
  };

  const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          showNotification('正在识别海报内容...', 'loading');
          
          setTimeout(() => {
              // Simulation of OCR
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
      setAiStep(`正在分析素材 (Gemini 2.5 Flash)...`);

      try {
        const generatedData = await generateArticleContent(
          currentArticle.raw_source || '',
          brandConfig.tone,
          currentArticle.language || 'CN',
          currentArticle.category || 'General',
          stream,
          articleLength
        );

        if (!generatedData) throw new Error("No data generated");

        const drafts: Record<string, string> = {};
        socialChannels.forEach(ch => {
          let text = '';
          if (ch.platform === 'twitter') text = generatedData.social_drafts.twitter;
          else if (ch.platform === 'linkedin') text = generatedData.social_drafts.linkedin;
          else if (ch.platform === 'telegram') text = generatedData.social_drafts.telegram;
          else text = generatedData.social_drafts.linkedin; // Fallback
          
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
          image_prompt: generatedData.image_prompt // AI Generated Prompt
        }));
        
        // Auto-fill poster text
        setPosterText({
            headline: generatedData.poster_data.headline || 'BREAKING NEWS',
            subhead: generatedData.poster_data.subhead || '',
            body: generatedData.poster_data.body_highlight || '',
            footer: generatedData.tags[0] || '#PAIPAY'
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
      showNotification('AI 正在绘制插图 (模拟 Midjourney v6)...', 'loading');
      
      // Simulate AI Generation time
      setTimeout(() => {
          // Use a realistic placeholder service that supports text to simulate "generated" content
          const keywords = currentArticle.tags?.slice(0, 2).join(',') || 'fintech';
          // Fallback to a solid reliable placeholder
          const fallbackUrl = `https://placehold.co/1024x1024/0F172A/FFF?text=${keywords}+Illustration&font=roboto`;
          
          setCurrentArticle(prev => ({ 
              ...prev, 
              generated_image: fallbackUrl, // Using placehold.co for reliable simulation 1:1 text
              poster_template_id: 'ai_custom' 
          }));
          setAssetMode('ai_gen');
          setAiImageLoading(false);
          showNotification('插图绘制完成，已适配所有尺寸', 'success');
      }, 3000);
  };

  // --- Visual Engine v3 (Template System) ---
  const handleTemplateSelect = (templateId: string) => {
      setAssetMode('template');
      setCurrentArticle(prev => ({ ...prev, poster_template_id: templateId }));
      showNotification('模版已切换', 'info');
  };

  // Redraw whenever relevant state changes
  useEffect(() => {
      if (currentArticle.workflow_step === 'assets' && assetMode === 'template' && currentArticle.poster_template_id) {
           drawPoster(currentArticle.poster_template_id, posterText, previewRatio);
      }
  }, [currentArticle.workflow_step, currentArticle.poster_template_id, previewRatio, posterText, assetMode, brandConfig]);

  const drawLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      const { primaryColor, secondaryColor } = brandConfig;
      
      // Draw PAIPAY P Logo
      ctx.save();
      // Background Squircle
      ctx.beginPath();
      const r = size * 0.2; // radius
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
      grd.addColorStop(1, '#06B6D4'); // Cyan mix
      ctx.fillStyle = grd;
      ctx.fill();

      // The "P"
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${size * 0.6}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("P", x + size / 2, y + size / 2 + size * 0.05);
      ctx.restore();

      // Brand Name
      ctx.save();
      ctx.fillStyle = secondaryColor;
      ctx.font = `bold ${size * 0.4}px ${brandConfig.fontFamily}, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText("PAIPAY", x + size * 1.2, y + size / 2);
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
      
      // Calculate X based on alignment
      const startX = align === 'right' ? x - boxWidth : x;

      // Draw Badge Background
      ctx.beginPath();
      ctx.rect(startX, y, boxWidth, boxHeight);
      ctx.closePath();

      if (type === 'market') {
          // Market: Primary Color, Sharp
           ctx.fillStyle = brandConfig.primaryColor;
      } else {
          // System: Secondary Color, Tech
           ctx.fillStyle = brandConfig.secondaryColor;
      }
      ctx.fill();

      // Draw Text
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, startX + boxWidth / 2, y + boxHeight / 2);

      // Decorative Line (Bottom accent)
      ctx.fillStyle = type === 'market' ? '#06B6D4' : '#F59E0B';
      ctx.fillRect(startX, y + boxHeight - 4, boxWidth, 4);

      ctx.restore();
  }

  /**
   * Refined wrapText function that returns the new Y position
   * Prevents text overlap by calculating actual height usage.
   */
  const wrapText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    lineHeight: number
  ): number => {
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
      return currentY + lineHeight; // Return Y position for next element
  }

  const drawPoster = (templateId: string, texts: typeof posterText, ratio: PosterRatio) => {
      return new Promise<void>((resolve, reject) => {
          const canvas = canvasRef.current;
          if (!canvas) return reject('No canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No ctx');

          // 1. Dimensions
          let w = 1080;
          let h = 1080;
          if (ratio === '16:9') { w = 1920; h = 1080; }
          if (ratio === '9:16') { w = 1080; h = 1920; }
          canvas.width = w;
          canvas.height = h;

          // 2. Clear & Base
          ctx.clearRect(0, 0, w, h);
          const primary = brandConfig.primaryColor;
          const secondary = brandConfig.secondaryColor;

          // 3. Template Logic (Backgrounds)
          // Default bg
          ctx.fillStyle = '#FFFFFF'; 
          ctx.fillRect(0, 0, w, h);

          if (templateId === 'mkt_trend') {
              // Bloomberg Style: Dark, Grid
              ctx.fillStyle = '#0F172A'; // Slate 900
              ctx.fillRect(0, 0, w, h);
              // Draw Grid
              ctx.strokeStyle = 'rgba(255,255,255,0.05)';
              ctx.lineWidth = 2;
              const gridSize = 120;
              for(let gx=0; gx<w; gx+=gridSize) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke(); }
              for(let gy=0; gy<h; gy+=gridSize) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke(); }
          } 
          else if (templateId === 'mkt_breaking') {
              // CNN Style: Light Red/Pinkish
              ctx.fillStyle = '#FFF1F2'; // Rose 50
              ctx.fillRect(0, 0, w, h);
              // Massive Red Bar at Bottom
              ctx.fillStyle = '#DC2626'; 
              ctx.fillRect(0, h - (h*0.1), w, h*0.1);
          }
          else if (templateId === 'sys_partnership') {
              // Apple Style: Subtle Radial
              const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
              grad.addColorStop(0, '#FFFFFF');
              grad.addColorStop(1, '#DBEAFE'); // Blue 100
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, w, h);
              // Circles
              ctx.strokeStyle = 'rgba(37,99,235,0.1)';
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.arc(w/2, h/2, w*0.3, 0, Math.PI*2); ctx.stroke();
              ctx.beginPath(); ctx.arc(w/2, h/2, w*0.4, 0, Math.PI*2); ctx.stroke();
          }

          // 4. Common Dimensions
          const padding = w * 0.08; // 8% padding
          const maxWidth = w - (padding * 2);

          // 5. Draw Header (Logo & Badge)
          // Determine text color based on BG
          const isDarkTheme = templateId === 'mkt_trend';
          const titleColor = isDarkTheme ? '#FFFFFF' : '#111827';
          const bodyColor = isDarkTheme ? '#CBD5E1' : '#374151'; // Slate 300 vs Gray 700

          // Logo Left Top
          if (brandConfig.logoUrl) {
               // If external logo image logic needed
               drawLogo(ctx, padding, padding, w * 0.08);
          } else {
               drawLogo(ctx, padding, padding, w * 0.08);
          }

          // Badge Right Top
          const tpl = [...SYSTEM_TEMPLATES, ...MARKET_TEMPLATES].find(t => t.id === templateId);
          const badgeText = tpl ? tpl.label_en : 'NEWS';
          const badgeType = tpl ? tpl.type : 'system';
          drawBadge(ctx, badgeText, w - padding, padding + 10, w * 0.06, badgeType, 'right');

          // 6. Flow Layout for Content
          // Start cursor. Center vertically roughly?
          // Let's calculate rough height of text to center it, or use a fixed top-heavy ratio.
          // Professional posters usually are top-heavy or vertically balanced.
          // Let's start at 35% height to leave room for visual breathing space.
          let cursorY = h * 0.35;
          if (ratio === '16:9') cursorY = h * 0.3; // Higher for wide screens

          // 6.1 Subhead (Eyebrow)
          ctx.fillStyle = isDarkTheme ? '#94A3B8' : '#6B7280';
          const subheadSize = w * 0.025; // Small relative to width
          ctx.font = `normal ${subheadSize}px ${brandConfig.fontFamily}, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          // Wrap subhead
          cursorY = wrapText(ctx, texts.subhead, padding, cursorY, maxWidth, subheadSize * 1.5);
          
          // Gap
          cursorY += h * 0.02;

          // 6.2 Headline (H1)
          ctx.fillStyle = titleColor;
          const titleSize = w * 0.07; // Big bold
          ctx.font = `bold ${titleSize}px ${brandConfig.fontFamily}, sans-serif`;
          // Leading for title
          const titleLeading = titleSize * 1.2;
          cursorY = wrapText(ctx, texts.headline, padding, cursorY, maxWidth, titleLeading);

          // Gap & Decoration
          cursorY += h * 0.04;
          
          // Draw Line or Element
          ctx.fillStyle = templateId === 'mkt_breaking' ? '#DC2626' : primary;
          ctx.fillRect(padding, cursorY, w * 0.1, h * 0.005);
          cursorY += h * 0.06;

          // 6.3 Body Highlight
          ctx.fillStyle = templateId === 'mkt_breaking' ? '#DC2626' : (isDarkTheme ? '#FFFFFF' : primary);
          const bodySize = w * 0.04;
          ctx.font = `bold ${bodySize}px ${brandConfig.fontFamily}, sans-serif`;
          cursorY = wrapText(ctx, texts.body, padding, cursorY, maxWidth, bodySize * 1.4);

          // 7. Footer
          // Position absolute bottom
          const footerY = h - padding;
          ctx.fillStyle = isDarkTheme ? '#64748B' : '#9CA3AF';
          ctx.font = `bold ${w * 0.02}px ${brandConfig.fontFamily}, sans-serif`;
          ctx.textAlign = 'center';
          const footerText = brandConfig.watermark ? 'PAIPAY.FINANCE' : '';
          ctx.fillText(footerText, w/2, footerY);

          // Export
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
      // Set default template if entering assets
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

  // --- RENDERERS ---

  const renderStrategyInput = () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Left: Sources & Config */}
          <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <i className={`${stream === 'market' ? 'ri-fire-fill text-orange-500' : 'ri-notification-3-fill text-blue-500'}`}></i> 
                            {stream === 'market' ? '热点抓取' : '系统日志'}
                        </h4>
                        {stream === 'market' && (
                            <button onClick={() => setPulseConfig({...pulseConfig, isConfigOpen: !pulseConfig.isConfigOpen})} className="text-gray-400 hover:text-blue-600">
                                <i className="ri-settings-3-line"></i>
                            </button>
                        )}
                    </div>

                    {/* Config Panel */}
                    {pulseConfig.isConfigOpen && stream === 'market' && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs animate-fade-in">
                            <div className="mb-2">
                                <label className="block font-bold mb-1 text-gray-500">过滤关键词</label>
                                <input 
                                    className="w-full p-2 rounded border border-gray-200" 
                                    placeholder="Solana, Fed, CPI..." 
                                    value={pulseConfig.keywords}
                                    onChange={(e) => setPulseConfig({...pulseConfig, keywords: e.target.value})}
                                />
                            </div>
                            <div className="flex items-center justify-between text-gray-500">
                                <span>模拟刷新周期: 1h</span>
                                <button className="text-blue-600 font-bold" onClick={() => showNotification('源数据已刷新', 'success')}>立即刷新</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
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
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                             <h3 className="text-lg font-bold text-gray-900">Step 1: 内容策略 (Strategy)</h3>
                             <button onClick={navigateToSettings} className="text-gray-300 hover:text-blue-600 transition-colors" title="AI Configuration">
                                <i className="ri-settings-line"></i>
                             </button>
                        </div>
                        
                        {/* Stream Switcher */}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
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

                    <div className="grid grid-cols-2 gap-6 mb-6">
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
                        <div className="flex gap-4 border-b border-gray-100 mb-4">
                            <button onClick={() => setInputType('text')} className={`pb-2 text-sm font-bold border-b-2 transition-all ${inputType === 'text' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>文本输入</button>
                            <button onClick={() => setInputType('image')} className={`pb-2 text-sm font-bold border-b-2 transition-all ${inputType === 'image' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>图片/海报源</button>
                            <button onClick={() => setInputType('url')} className={`pb-2 text-sm font-bold border-b-2 transition-all ${inputType === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>URL 抓取</button>
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

                    {currentArticle.raw_source && inputType === 'image' && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4 animate-fade-in">
                            <h5 className="text-xs font-bold text-green-700 mb-2">识别结果预览:</h5>
                            <p className="text-xs text-green-600 whitespace-pre-wrap">{currentArticle.raw_source}</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button 
                            onClick={handleAiGenerate}
                            disabled={aiGenerating || !currentArticle.raw_source}
                            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-gray-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
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
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
           <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
               <div>
                   <h3 className="text-lg font-bold text-gray-900">Step 2: 智能编辑 (Editor)</h3>
                   <p className="text-xs text-gray-500">AI 已完成标准化排版。请检查段落间距与标题层级。</p>
               </div>
               <div className="flex gap-2">
                   <button onClick={() => handleWorkflowClick('strategy')} className="px-4 py-2 text-gray-500 hover:text-gray-900 text-sm font-bold">返回</button>
                   <button onClick={() => handleWorkflowClick('assets')} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md">下一步：视觉引擎</button>
               </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               {/* Metadata Column */}
               <div className="space-y-4">
                   <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">文章标题</label>
                       <textarea 
                           value={currentArticle.title} 
                           onChange={(e) => setCurrentArticle({...currentArticle, title: e.target.value})}
                           className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900 text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none resize-none h-20" 
                       />
                   </div>
                   
                   {/* Auto Tags */}
                   <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">智能标签 (文末自动追加)</label>
                        <div className="flex flex-wrap gap-2">
                            {currentArticle.tags?.map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded font-bold">{tag}</span>
                            ))}
                        </div>
                   </div>

                   {/* AI Tools */}
                   <div className="pt-4 border-t border-gray-100">
                       <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">AI 助手</h4>
                       <div className="flex flex-col gap-2">
                           <button className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 text-left">
                               <i className="ri-magic-line"></i> 润色语气
                           </button>
                           <button className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 text-left">
                               <i className="ri-scissors-cut-line"></i> 精简摘要
                           </button>
                       </div>
                   </div>

                   {/* AI Image Prompt Display */}
                   <div className="pt-4 border-t border-gray-100">
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">插图提示词 (Prompt)</h4>
                       <div className="p-3 bg-gray-50 rounded-lg text-[10px] text-gray-500 max-h-24 overflow-y-auto">
                           {currentArticle.image_prompt || "等待生成..."}
                       </div>
                   </div>
               </div>

               {/* Editor Column */}
               <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">正文内容 (HTML 预览)</label>
                        <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">标准排版已应用</span>
                    </div>
                    {/* The className logic inside RichTextEditor handles the prose spacing */}
                    <RichTextEditor 
                        value={currentArticle.content || ''} 
                        onChange={(html) => setCurrentArticle({...currentArticle, content: html})}
                        className="min-h-[500px]"
                    />
               </div>
           </div>
      </div>
  );

  const renderAssets = () => {
      // Filter templates based on current stream
      const templates = stream === 'market' ? MARKET_TEMPLATES : SYSTEM_TEMPLATES;

      return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Step 3: 视觉引擎 (Assets)</h3>
                    <p className="text-xs text-gray-500">标准化输出所有社交媒体尺寸 (9:16 / 16:9 / 1:1)。品牌 VI 自动合成。</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleWorkflowClick('editor')} className="px-4 py-2 text-gray-500 hover:text-gray-900 text-sm font-bold">返回</button>
                    <button onClick={() => handleWorkflowClick('distribution')} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md">下一步：全网分发</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Configuration & Templates */}
                    <div className="space-y-6">
                        {/* Tab Switcher */}
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
                                {/* Template Library */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">模版库 ({stream === 'market' ? '市场类' : '系统类'})</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {templates.map(tpl => (
                                            <button 
                                                key={tpl.id}
                                                onClick={() => handleTemplateSelect(tpl.id)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${currentArticle.poster_template_id === tpl.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${tpl.previewColor}`}>
                                                    <i className={`${tpl.icon} text-lg text-gray-700`}></i>
                                                </div>
                                                <span className={`text-[10px] font-bold ${currentArticle.poster_template_id === tpl.id ? 'text-blue-700' : 'text-gray-600'}`}>{tpl.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Text Controls */}
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
                            /* AI Gen Mode */
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <h4 className="text-xs font-bold text-blue-700 uppercase mb-2 flex items-center gap-2">
                                        <i className="ri-sparkling-fill"></i> AI 绘图引擎 (Midjourney Sim)
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
                        
                        {/* VI Config Button */}
                        <div className="pt-4 border-t border-gray-100 text-center">
                            <button 
                                onClick={() => setIsBrandModalOpen(true)}
                                className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center justify-center gap-2 w-full py-2"
                            >
                                <i className="ri-palette-line"></i> 配置品牌视觉规范 (VI)
                            </button>
                        </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="lg:col-span-2 flex flex-col h-full bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden relative">
                         {/* INDEPENDENT Ratio Switcher */}
                         <div className="absolute top-4 left-0 w-full flex justify-center z-10 pointer-events-none">
                            <div className="flex bg-white/90 backdrop-blur-md rounded-full p-1 border border-gray-200 shadow-sm pointer-events-auto">
                                <button 
                                    onClick={() => setPreviewRatio('1:1')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${previewRatio === '1:1' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <i className="ri-instagram-line"></i> Square (1:1)
                                </button>
                                <button 
                                    onClick={() => setPreviewRatio('16:9')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${previewRatio === '16:9' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <i className="ri-twitter-x-line"></i> Post (16:9)
                                </button>
                                <button 
                                    onClick={() => setPreviewRatio('9:16')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${previewRatio === '9:16' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <i className="ri-smartphone-line"></i> Story (9:16)
                                </button>
                            </div>
                         </div>

                        <div className="flex-grow flex items-center justify-center p-12 mt-12 overflow-hidden">
                            {/* Canvas Simulation Container */}
                            <div 
                                className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 relative flex items-center justify-center overflow-hidden"
                                style={{ 
                                    width: previewRatio === '16:9' ? '100%' : (previewRatio === '9:16' ? '45%' : '65%'),
                                    aspectRatio: previewRatio.replace(':', '/'),
                                    maxWidth: '100%',
                                    maxHeight: '100%'
                                }}
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
                                                <img 
                                                    src={currentArticle.generated_image} 
                                                    alt="AI Generated" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur font-bold">
                                                    AI ILLUSTRATION
                                                </div>
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
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
           <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
               <div>
                   <h3 className="text-lg font-bold text-gray-900">Step 4: 全网分发 (Distribute)</h3>
                   <p className="text-xs text-gray-500">已自动过滤 Markdown 符号。海报已按渠道标准生成。</p>
               </div>
               <div className="flex gap-2">
                   <button onClick={() => handleWorkflowClick('assets')} className="px-4 py-2 text-gray-500 hover:text-gray-900 text-sm font-bold">返回</button>
                   <button onClick={handleApproveAndPublish} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2">
                       <i className="ri-rocket-fill"></i> 确认发布
                   </button>
               </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Channel Selection */}
               <div className="space-y-4">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">分发矩阵 (按语言)</h4>
                   {socialChannels.map(ch => (
                        <div 
                            key={ch.id}
                            onClick={() => handleChannelToggle(ch.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden ${selectedChannels.has(ch.id) ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-200 opacity-60 hover:opacity-100'}`}
                        >
                            <i className={`${ch.icon} text-xl ${selectedChannels.has(ch.id) ? 'text-blue-600' : 'text-gray-400'}`}></i>
                            <div className="flex-1">
                                <div className={`text-sm font-bold ${selectedChannels.has(ch.id) ? 'text-blue-900' : 'text-gray-700'}`}>{ch.name}</div>
                                <div className="text-[10px] text-gray-400">{ch.group}</div>
                            </div>
                            
                            {/* Auto Translate Badge */}
                            {selectedChannels.has(ch.id) && ch.lang_code !== currentArticle.language && (
                                <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold mr-2">
                                    <i className="ri-translate-2"></i> Auto
                                </span>
                            )}
                            
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedChannels.has(ch.id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                                {selectedChannels.has(ch.id) && <i className="ri-check-line text-white text-xs"></i>}
                            </div>
                        </div>
                   ))}
               </div>

               {/* Preview Panel */}
               <div className="lg:col-span-2">
                   <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                       {Array.from(selectedChannels).map(id => {
                           const ch = socialChannels.find(c => c.id === id);
                           if(!ch) return null;
                           return (
                               <button 
                                   key={id}
                                   onClick={() => setActiveSocialPreview(id)}
                                   className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeSocialPreview === id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}
                               >
                                   {ch.name}
                               </button>
                           )
                       })}
                   </div>

                   <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 relative">
                        {/* Fake Platform UI */}
                        <div className="flex items-center gap-3 mb-4 opacity-70">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div>
                                <div className="h-3 w-24 bg-gray-300 rounded mb-1"></div>
                                <div className="h-2 w-16 bg-gray-200 rounded"></div>
                            </div>
                        </div>

                        {/* Cleaned Text Area */}
                        <textarea 
                            className="w-full bg-transparent text-sm text-gray-800 leading-relaxed outline-none resize-none h-40 font-medium"
                            value={(currentArticle.social_drafts?.[activeSocialPreview] || "").replace(/\*\*/g, '')}
                            onChange={(e) => setCurrentArticle(prev => ({...prev, social_drafts: {...prev.social_drafts, [activeSocialPreview]: e.target.value}}))}
                            placeholder="Social text here..."
                        ></textarea>
                        
                        {currentArticle.generated_image && (
                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm max-h-64 w-full object-cover relative group">
                                <img src={currentArticle.generated_image} className="w-full h-auto object-cover" alt="Preview" />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur">
                                    Poster Attached
                                </div>
                            </div>
                        )}
                   </div>
                   <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                       <span>{(currentArticle.social_drafts?.[activeSocialPreview] || "").length} chars</span>
                       <span className="flex items-center gap-1"><i className="ri-shield-check-line text-green-500"></i> Content Safe</span>
                   </div>
               </div>
           </div>
      </div>
  );

  const renderStudio = () => (
     <div className="animate-fade-in">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
             <div>
                 <h1 className="text-3xl font-bold text-gray-900 mb-1">{text.studio.title}</h1>
                 <p className="text-gray-500 text-sm">{text.studio.subtitle}</p>
             </div>
             <div className="flex gap-2">
                <button 
                    onClick={() => {
                        setCurrentArticle({ workflow_step: 'strategy', title: '', content: '', raw_source: '', tag: 'TREND', language: 'CN', stream: 'market', image_prompt: '' });
                        setAssetMode('template');
                    }}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black shadow-lg shadow-gray-300 transition-all flex items-center gap-2"
                >
                    <i className="ri-add-line"></i>{text.studio.new_btn}
                </button>
             </div>
         </div>

         {/* Stepper */}
         <div className="mb-10 overflow-x-auto pb-2 border-b border-gray-100">
            <div className="flex items-center min-w-max gap-8">
                {['strategy', 'editor', 'assets', 'distribution'].map((step, idx) => {
                    const isCurrent = currentArticle.workflow_step === step;
                    const isPassed = ['strategy', 'editor', 'assets', 'distribution'].indexOf(currentArticle.workflow_step || 'strategy') > idx;
                    
                    return (
                        <button 
                            key={step}
                            onClick={() => handleWorkflowClick(step as WorkflowStep)}
                            className={`flex items-center gap-3 pb-4 border-b-2 transition-all ${isCurrent ? 'border-blue-600 text-blue-600' : (isPassed ? 'border-transparent text-gray-600' : 'border-transparent text-gray-300')}`}
                        >
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
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <i className="ri-check-line text-5xl text-green-600"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">发布流程已完成</h2>
          <p className="text-gray-500 max-w-md mb-10">
              内容已成功推送到全网节点和所选社群矩阵。
          </p>
          <div className="flex gap-4">
              <button onClick={() => setCurrentArticle({ workflow_step: 'strategy', language: 'CN' })} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold">创作新内容</button>
          </div>
      </div>
  );

  // Other tabs (Simplified for this update)
  const renderLaunchpad = () => <div className="p-8 text-center text-gray-400">Launchpad Module</div>;
  const renderReports = () => <div className="p-8 text-center text-gray-400">Reports Module</div>;
  const renderNotices = () => <div className="p-8 text-center text-gray-400">Notices Module</div>;
  const renderTeam = () => <div className="p-8 text-center text-gray-400">Team Module</div>;
  const renderSettings = () => <div className="p-8 text-center text-gray-400">Settings Module</div>;

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
      
      {/* Brand VI Modal */}
      <Modal 
        isOpen={isBrandModalOpen} 
        onClose={() => setIsBrandModalOpen(false)} 
        title="品牌视觉规范配置 (Brand VI)"
      >
          <div className="space-y-6">
              {/* Logo Config */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">品牌 Logo</label>
                  <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                          {brandConfig.logoUrl ? (
                              <img src={brandConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                              <span className="text-xs text-gray-400 text-center">系统<br/>默认</span>
                          )}
                      </div>
                      <div className="flex-1">
                          <input 
                             type="text" 
                             placeholder="粘贴 Logo URL (https://...)" 
                             value={brandConfig.logoUrl}
                             onChange={(e) => setBrandConfig({...brandConfig, logoUrl: e.target.value})}
                             className="w-full p-2 text-xs border border-gray-300 rounded-lg mb-2"
                          />
                          <p className="text-[10px] text-gray-400">留空则自动绘制系统默认 Logo (PAIPAY Icon)</p>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Color</label>
                      <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={brandConfig.primaryColor} 
                            onChange={(e) => setBrandConfig({...brandConfig, primaryColor: e.target.value})}
                            className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-sm font-mono text-gray-600">{brandConfig.primaryColor}</span>
                      </div>
                  </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Secondary Color</label>
                       <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={brandConfig.secondaryColor} 
                            onChange={(e) => setBrandConfig({...brandConfig, secondaryColor: e.target.value})}
                            className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-sm font-mono text-gray-600">{brandConfig.secondaryColor}</span>
                      </div>
                  </div>
              </div>

              <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Typography (Font Family)</label>
                   <select 
                        value={brandConfig.fontFamily}
                        onChange={(e) => setBrandConfig({...brandConfig, fontFamily: e.target.value})}
                        className="w-full p-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none"
                   >
                       <option value="Inter">Inter (Modern Sans)</option>
                       <option value="Times New Roman">Serif (Classic)</option>
                       <option value="Courier New">Monospace (Tech)</option>
                   </select>
              </div>

              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Brand Tone & Voice (AI 指令)</label>
                  <textarea 
                        value={brandConfig.tone}
                        onChange={(e) => setBrandConfig({...brandConfig, tone: e.target.value})}
                        className="w-full p-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:border-blue-500 outline-none h-24 resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">此设置将影响所有 AI 生成的文案风格。</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-bold text-gray-700">海报水印 (Watermark)</span>
                  <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${brandConfig.watermark ? 'bg-green-500' : 'bg-gray-300'}`}
                    onClick={() => setBrandConfig({...brandConfig, watermark: !brandConfig.watermark})}
                  >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${brandConfig.watermark ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
              </div>

              <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => setIsBrandModalOpen(false)}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black"
                  >
                      保存配置
                  </button>
              </div>
          </div>
      </Modal>

      {renderSidebar()}
      
      <div className="md:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">P</div>
               <span className="font-bold text-lg">{text.sidebar.brand}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600"><i className="ri-menu-line text-2xl"></i></button>
      </div>
      <main className="p-6 max-w-7xl mx-auto">
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
