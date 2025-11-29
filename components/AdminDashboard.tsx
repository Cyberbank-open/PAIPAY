import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { generateArticleContent, GeneratedArticle } from '../lib/gemini';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'launchpad' | 'studio' | 'notices' | 'reports' | 'team' | 'settings';
type AdminLang = 'EN' | 'CN' | 'VN';
type WorkflowStep = 'idea' | 'source_ingest' | 'ai_gen' | 'review' | 'layout' | 'approved' | 'published' | 'summary';
type PreviewMode = 'social' | 'seo';
type ContentStream = 'market' | 'notice';

// --- Types ---
interface SocialChannel {
    id: string;
    platform: 'twitter' | 'facebook' | 'telegram' | 'wechat' | 'linkedin';
    name: string;
    group: 'Global' | 'China' | 'Vietnam'; // New Grouping
    icon: string;
    connected: boolean;
}

interface Notice {
    id: number;
    title: string;
    slug: string; 
    meta_desc: string;
    stream: ContentStream;
    category: string;
    language: string; // Article Language
    tag: string;
    date: string;
    author: string;
    status: 'Published' | 'Archived' | 'Draft' | 'Scheduled';
    workflow_step: WorkflowStep;
    views: number;
    shares: number;
    content?: string;
    raw_source?: string;
    generated_image?: string; 
    poster_template?: string; 
    social_drafts?: Record<string, string>; // Map channel ID to copy
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: '超级管理员' | '主编' | '观察员';
    last_active: string;
    status: 'active' | 'inactive';
    avatar_color: string;
}

interface Tutorial {
    id: number;
    title: string;
    steps: string[];
}

// --- Mock Data ---
const dailyData = [
  { name: '周一', views: 4000, shares: 240, active: 120 },
  { name: '周二', views: 3000, shares: 139, active: 98 },
  { name: '周三', views: 6000, shares: 980, active: 200 },
  { name: '周四', views: 2780, shares: 390, active: 150 },
  { name: '周五', views: 1890, shares: 480, active: 110 },
  { name: '周六', views: 2390, shares: 380, active: 90 },
  { name: '周日', views: 3490, shares: 430, active: 130 },
];

const mockNotices: Notice[] = [
    { id: 101, stream: 'market', language: 'CN', title: '2025年Q1 全球稳定币监管白皮书', slug: '2025-q1-stablecoin-regulation-whitepaper', meta_desc: '深入剖析东南亚、欧盟及美洲地区的稳定币合规框架演变。', category: 'Regulatory', tag: 'Report', date: '2024-10-24', author: 'Alex Chen', status: 'Published', workflow_step: 'published', views: 12400, shares: 450 },
    { id: 102, stream: 'notice', language: 'CN', title: '系统维护公告：Solana 节点升级', slug: 'maintenance-solana-node-upgrade', meta_desc: '为了提供更快的交易确认速度，我们将于本周五进行节点维护。', category: 'Maintenance', tag: 'System', date: '2024-10-22', author: 'DevOps Team', status: 'Archived', workflow_step: 'published', views: 5300, shares: 12 },
    { id: 103, stream: 'market', language: 'EN', title: 'New Feature: Enterprise MPC Wallet', slug: 'feature-enterprise-mpc-wallet', meta_desc: 'PAIPAY officially launches one-stop treasury management solution based on MPC technology.', category: 'Product', tag: 'Feature', date: '2024-10-20', author: 'Product Team', status: 'Published', workflow_step: 'published', views: 8900, shares: 210 },
];

const mockTeam: TeamMember[] = [
    { id: 1, name: 'Alex Chen', email: 'alex@paipay.finance', role: '超级管理员', last_active: '在线', status: 'active', avatar_color: 'bg-blue-600' },
    { id: 2, name: 'Sarah Wu', email: 'sarah@paipay.finance', role: '主编', last_active: '2小时前', status: 'active', avatar_color: 'bg-pink-600' },
    { id: 3, name: 'David Li', email: 'david@paipay.finance', role: '观察员', last_active: '1天前', status: 'inactive', avatar_color: 'bg-yellow-600' },
];

const checklist = [
    { id: 1, label: '配置 Supabase 数据库与鉴权', status: 'done', desc: '用户系统与数据存储已就绪' },
    { id: 2, label: '连接 Gemini AI (Pro/Flash) 模型', status: 'done', desc: 'AI 核心大脑已激活' },
    { id: 3, label: '定义品牌智能 (Brand Intelligence)', status: 'done', desc: 'AI 已学习 PAIPAY 品牌语调' },
    { id: 4, label: '前端部署 (Netlify/Vercel)', status: 'pending', desc: '将代码推送到 GitHub 并连接 Netlify 进行自动化部署。' },
    { id: 5, label: '域名购买与 DNS 配置', status: 'pending', desc: '在 Namecheap/GoDaddy 购买域名，添加 CNAME 记录。' },
    { id: 6, label: '配置全球 CDN (Cloudflare)', status: 'pending', desc: '配置 Nameservers 以获得全球加速。' },
    { id: 7, label: '后端/边缘函数部署', status: 'pending', desc: '配置 Supabase Edge Functions。' },
    { id: 8, label: '强制启用 2FA 双重验证', status: 'pending', desc: '提升管理员账户安全性' },
];

const tutorials: Record<number, Tutorial> = {
    4: {
        id: 4,
        title: '前端自动化部署指南 (Netlify)',
        steps: [
            '1. 登录 Netlify 官网并点击 "New site from Git"。',
            '2. 授权连接您的 GitHub 仓库 paipay-web。',
            '3. 在 Build Settings 中，设置 Build command 为 "npm run build"，Publish directory 为 "dist"。',
            '4. 点击 "Show advanced" 添加环境变量 (Environment Variables)，如 VITE_SUPABASE_URL 等。',
            '5. 点击 Deploy site，等待约 1 分钟即可完成上线。'
        ]
    },
    5: {
        id: 5,
        title: '域名与 DNS 配置指南',
        steps: [
            '1. 登录您的域名注册商 (如 GoDaddy)。',
            '2. 进入 DNS 管理页面，找到记录列表。',
            '3. 添加一条 CNAME 记录：Host 填 "www"，Value 填 Netlify 提供的二级域名 (如 paipay.netlify.app)。',
            '4. 如果需要根域名访问，请遵循 Netlify 的 A 记录配置指引。',
            '5. 保存后，DNS 生效可能需要 10分钟 至 24小时。'
        ]
    },
    6: {
        id: 6,
        title: 'Cloudflare CDN 加速配置',
        steps: [
            '1. 注册 Cloudflare 账号并点击 "Add a Site"。',
            '2. 输入您的域名，选择 Free Plan。',
            '3. Cloudflare 会扫描现有的 DNS 记录，确认无误后点击 Continue。',
            '4. 复制 Cloudflare 提供的 2 个 Nameservers (如 bob.ns.cloudflare.com)。',
            '5. 回到域名注册商后台，将 Nameservers 修改为 Cloudflare 提供的地址。'
        ]
    },
    7: {
        id: 7,
        title: 'Supabase Edge Functions 部署',
        steps: [
            '1. 确保本地安装了 Supabase CLI。',
            '2. 运行 "supabase login" 进行授权。',
            '3. 在项目根目录创建 functions 文件夹。',
            '4. 编写 TypeScript 函数逻辑 (如支付回调处理)。',
            '5. 运行 "supabase functions deploy [function_name]" 推送到云端。'
        ]
    },
    8: {
        id: 8,
        title: '启用 2FA 双重验证',
        steps: [
            '1. 进入 Supabase Dashboard -> Authentication -> Providers。',
            '2. 确保 Phone 或 TOTP 选项已开启。',
            '3. 在 Admin Dashboard 代码中，集成 Google Authenticator 逻辑。',
            '4. 在 "系统设置" 中强制所有管理员账户绑定 MFA 设备。'
        ]
    }
};

const trendingTopics = [
    { title: "美联储降息对稳定币流动性的影响", source: "Bloomberg Finance" },
    { title: "RWA (现实世界资产) 代币化在东南亚的崛起", source: "CoinDesk Asia" },
    { title: "Solana vs Ethereum: 2025 支付赛道对比", source: "The Block" },
];

// Mock Raw Scraped Content
const mockRawScrape = `
(SOURCE: BLOOMBERG ASIA | 2024-10-27)
TITLE: Stablecoin Velocity Overtakes Traditional Settlement in SEA

Singapore/Bangkok -- The velocity of USD-pegged stablecoins transactions across Southeast Asia has officially surpassed traditional Visa settlement rails for B2B cross-border trade, according to new data released this Monday.

Key drivers include:
1. High fees in traditional Swift transfers (avg 2-3%).
2. T+2 settlement delays affecting SME cash flow.
3. Rising adoption of TRC-20 and SPL tokens by local merchants.

"The shift is structural, not cyclical," says Analyst Jane Doe. "Merchants in Yiwu and Bangkok are bypassing dollars for direct stablecoin invoicing."
`;

// --- Components: Toast ---
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

// --- Components: Tutorial Modal ---
const TutorialModal: React.FC<{ tutorial: Tutorial | null; onClose: () => void }> = ({ tutorial, onClose }) => {
    if (!tutorial) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                    <i className="ri-close-line text-2xl"></i>
                </button>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                    <i className="ri-book-open-line text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{tutorial.title}</h3>
                <div className="space-y-4">
                    {tutorial.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3 text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {step}
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-colors">
                        明白了
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Main Component ---
const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('studio');
  const [lang, setLang] = useState<AdminLang>('CN'); 
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'info' | 'loading' | 'error'>('success');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const manualInputRef = useRef<HTMLInputElement>(null);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('Loading...');

  // Get current user on mount with robust error handling
  useEffect(() => {
    let isMounted = true;
    const getUser = async () => {
        if (!isSupabaseConfigured) {
             if (isMounted) setCurrentUserEmail('Demo Admin (No DB)');
             return;
        }

        try {
            // Support both v2 getUser and v1 user()
            const auth = supabase.auth as any;
            let user = null;
            
            if (typeof auth.getUser === 'function') {
                const { data, error } = await auth.getUser();
                if (error) console.warn("Auth check warning:", error.message);
                user = data?.user;
            } else if (typeof auth.user === 'function') {
                user = auth.user();
            }

            if (user && user.email) {
                if (isMounted) setCurrentUserEmail(user.email);
            } else {
                if (isMounted) setCurrentUserEmail('Guest Admin');
            }
        } catch (e) {
            console.error("Failed to fetch user:", e);
            if (isMounted) setCurrentUserEmail('Admin (Offline Mode)');
        }
    };
    getUser();
    return () => { isMounted = false; };
  }, []);

  // --- Brand Intelligence State ---
  const [brandConfig, setBrandConfig] = useState({
      tone: '专业、权威但易于理解。融合金融科技的前瞻性与传统金融的稳重感。',
      manual: '', 
      hasManual: false, 
      image_style: '全息风格(Holographic)、赛博朋克微光、PAIPAY 品牌蓝(#2563EB)与青色(#06B6D4)为主色调',
      global_seo_title: 'PAIPAY | Global Clearing Network',
      global_seo_keywords: 'Fintech, Blockchain, Settlement, Cross-border Payment',
  });

  // --- Social Matrix State (Grouped) ---
  const [socialChannels, setSocialChannels] = useState<SocialChannel[]>([
      { id: 'x_global', platform: 'twitter', name: 'X (Global)', group: 'Global', icon: 'ri-twitter-x-line', connected: true },
      { id: 'fb_global', platform: 'facebook', name: 'Facebook', group: 'Global', icon: 'ri-facebook-circle-fill', connected: false },
      { id: 'in_global', platform: 'linkedin', name: 'LinkedIn', group: 'Global', icon: 'ri-linkedin-box-fill', connected: true },
      { id: 'tg_global', platform: 'telegram', name: 'Telegram', group: 'Global', icon: 'ri-telegram-fill', connected: true },
      
      { id: 'x_cn', platform: 'twitter', name: 'X (中文)', group: 'China', icon: 'ri-twitter-x-line', connected: true },
      { id: 'wechat_cn', platform: 'wechat', name: 'WeChat OA', group: 'China', icon: 'ri-wechat-fill', connected: true },
      
      { id: 'fb_vn', platform: 'facebook', name: 'Facebook (VN)', group: 'Vietnam', icon: 'ri-facebook-circle-fill', connected: false },
      { id: 'tg_vn', platform: 'telegram', name: 'Telegram (VN)', group: 'Vietnam', icon: 'ri-telegram-fill', connected: true },
  ]);
  
  const [activeSocialPreview, setActiveSocialPreview] = useState<string>('x_cn'); // ID of active preview

  // --- Content Studio State ---
  const [stream, setStream] = useState<ContentStream>('market');
  const [currentArticle, setCurrentArticle] = useState<Partial<Notice>>({ 
      workflow_step: 'idea',
      title: '',
      content: '',
      raw_source: '',
      slug: '',
      meta_desc: '',
      stream: 'market',
      category: 'Crypto Trends',
      tag: 'TREND', // Default Tag
      language: 'CN',
      social_drafts: {}
  });
  const [previewMode, setPreviewMode] = useState<PreviewMode>('social');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState(''); 
  
  // --- Report State ---
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const t = {
    EN: {
      sidebar: { brand: 'PAIPAY OS', launchpad: 'Launchpad', studio: 'Content Studio', notices: 'Archives', reports: 'Executive Reports', team: 'Team', settings: 'Settings', user: 'Admin User', logout: 'Logout' },
      studio: { 
          title: 'Content Studio', 
          subtitle: 'AI-driven content production pipeline', 
          new_btn: 'Create New', 
          input_topic: 'Source Material / Raw Content', 
          btn_generate: 'AI Auto-Write & Verify', 
          btn_generate_img: 'Generate Branded Poster', 
          publish: 'Publish to All Channels', 
          tab_social: 'Social Matrix',
          tab_seo: 'SEO Preview',
          stream_market: 'Market Pulse',
          stream_notice: 'System Notices',
          auto_fetch: 'Scrape Trending Topics',
          manual_required: 'Brand Manual Required',
          manual_uploaded: 'Manual Active',
          upload_manual: 'Upload Brand Manual',
          ingest_placeholder: 'Paste raw content here or use "Scrape Trending" to fill automatically...'
      },
      reports: { title: 'Executive Reports', subtitle: 'Generate daily briefs for TG.', btn_push: 'Push to TG', stat_views: 'Total Views', stat_shares: 'Shares', chart_title: 'Impact Trend' },
      settings: { title: 'System Settings', brand_section: 'Brand Intelligence', social_section: 'Social Matrix', seo_section: 'Global SEO', sec_security: 'Security & 2FA', save: 'Save Config' }
    },
    CN: {
      sidebar: { brand: 'PAIPAY 中控', launchpad: '启动清单', studio: '内容工坊', notices: '内容档案', reports: '决策情报', team: '团队管理', settings: '系统设置', user: '管理员', logout: '登出' },
      studio: { 
          title: '智能内容工坊', 
          subtitle: 'AI 驱动的一站式媒体生产流', 
          new_btn: '创作新内容', 
          input_topic: '输入素材 / 原始生肉内容', 
          btn_generate: 'AI 深度编写与核查', 
          btn_generate_img: '生成品牌海报', 
          publish: '保存并发布 (Supabase)', 
          tab_social: '社群矩阵配置', 
          tab_seo: 'SEO 预览',
          stream_market: '市场脉动 (Market Pulse)',
          stream_notice: '系统公告 (System Notices)',
          auto_fetch: '自动抓取热点 (Scrape)',
          manual_required: '必须上传品牌手册才能开始创作',
          manual_uploaded: '品牌手册已生效',
          upload_manual: '上传品牌手册',
          ingest_placeholder: '在此粘贴原始文章内容，或点击上方“自动抓取”获取素材...'
      },
      reports: { title: '决策情报看板', subtitle: '生成高管日报并推送至 TG 群。', btn_push: '生成简报并推送 TG', stat_views: '总阅读量', stat_shares: '社群转发', chart_title: '影响力趋势' },
      settings: { title: '系统级配置', brand_section: '品牌智能 (AI 脑)', social_section: '社群矩阵连接', seo_section: '全局 SEO 配置', sec_security: '安全与 2FA 设置', save: '保存配置' }
    },
    VN: {
      sidebar: { brand: 'PAIPAY OS', launchpad: 'Khởi Chạy', studio: 'Xưởng Nội Dung', notices: 'Lưu Trữ', reports: 'Báo Cáo', team: 'Đội Ngũ', settings: 'Cài Đặt', user: 'Quản Trị', logout: 'Đăng Xuất' },
      studio: { 
          title: 'Xưởng Nội Dung', 
          subtitle: 'Quy trình sản xuất nội dung AI', 
          new_btn: 'Tạo Mới', 
          input_topic: 'Nội Dung Thô', 
          btn_generate: 'Tự Động Viết', 
          btn_generate_img: 'Tạo Poster', 
          publish: 'Xuất Bản', 
          tab_social: 'Ma Trận MXH',
          tab_seo: 'Xem Trước SEO',
          stream_market: 'Nhịp Đập Thị Trường',
          stream_notice: 'Thông Báo Hệ Thống',
          auto_fetch: 'Tự Động Lấy Xu Hướng',
          manual_required: 'Cần Sổ Tay Thương Hiệu Để Bắt Đầu',
          manual_uploaded: 'Sổ Tay Đã Kích Hoạt',
          upload_manual: 'Tải Lên Sổ Tay',
          ingest_placeholder: 'Dán nội dung thô vào đây...'
      },
      reports: { title: 'Báo Cáo Điều Hành', subtitle: 'Tạo tóm tắt hàng ngày cho TG.', btn_push: 'Đẩy lên TG', stat_views: 'Tổng Lượt Xem', stat_shares: 'Chia Sẻ', chart_title: 'Xu Hướng Tác Động' },
      settings: { title: 'Cài Đặt Hệ Thống', brand_section: 'Trí Tuệ Thương Hiệu', social_section: 'Kết Nối MXH', seo_section: 'SEO Toàn Cầu', sec_security: 'Bảo Mật & 2FA', save: 'Lưu Cấu Hình' }
    }
  };

  const text = t[lang];

  // Categories
  const marketCategories = ['Global Macro', 'Crypto Trends', 'Regulatory', 'Payment Rails', 'Forex'];
  const noticeCategories = ['System Upgrade', 'Maintenance', 'API Update', 'Security Alert', 'New Feature'];

  // --- Actions ---
  const handleLogout = async () => {
    try {
        const auth = supabase.auth as any;
        if (typeof auth.signOut === 'function') {
            await auth.signOut();
        }
        onLogout();
    } catch (error) {
        console.error("Logout failed", error);
        onLogout(); // Fallback
    }
  };

  const showNotification = (msg: string, type: 'success' | 'info' | 'loading' | 'error' = 'success') => {
      setToastMsg(msg);
      setToastType(type);
      setShowToast(true);
  };

  const handleUploadManual = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          showNotification('正在解析品牌手册并存入向量数据库...', 'loading');
          setTimeout(() => {
              setBrandConfig(prev => ({ 
                  ...prev, 
                  manual: e.target.files![0].name,
                  hasManual: true 
              }));
              showNotification('品牌手册上传成功！AI 已学习品牌规范。', 'success');
          }, 2000);
      }
  };

  const handleAutoFetch = () => {
      if (!brandConfig.hasManual) {
          showNotification('请先上传品牌手册', 'error');
          return;
      }
      showNotification('正在爬取 Bloomberg/CoinDesk 数据源...', 'loading');
      setTimeout(() => {
          const randomTopic = trendingTopics[Math.floor(Math.random() * trendingTopics.length)];
          
          setCurrentArticle(prev => ({
              ...prev,
              raw_source: mockRawScrape, // Fill raw content
              workflow_step: 'source_ingest',
              title: randomTopic.title, // Temp title
              category: 'Crypto Trends',
              tag: 'TREND'
          }));
          
          showNotification(`已抓取: "${randomTopic.title}" (来源: ${randomTopic.source})`, 'success');
      }, 1500);
  };

  const handleAiGenerate = async () => {
      if (!brandConfig.hasManual) {
          showNotification('禁止操作：必须先上传品牌手册以确保一致性。', 'error');
          return;
      }
      if (!currentArticle.raw_source && currentArticle.workflow_step !== 'source_ingest') {
          showNotification('请先输入或抓取原始素材', 'error');
          return;
      }

      setAiGenerating(true);
      setCurrentArticle(prev => ({ ...prev, workflow_step: 'ai_gen' }));
      
      const targetLang = currentArticle.language || 'CN';
      setAiStep(`Initializing Gemini 2.5 Flash...`);

      try {
        const generatedData = await generateArticleContent(
          currentArticle.raw_source || '',
          brandConfig.tone,
          targetLang,
          currentArticle.category || 'General'
        );

        if (!generatedData) throw new Error("No data generated");

        // Map AI response to our state
        // Create social drafts map for UI
        const drafts: Record<string, string> = {};
        socialChannels.forEach(ch => {
          // Simple logic to distribute AI drafts to channels based on platform
          if (ch.platform === 'twitter') drafts[ch.id] = generatedData.social_drafts.twitter;
          else if (ch.platform === 'linkedin') drafts[ch.id] = generatedData.social_drafts.linkedin;
          else if (ch.platform === 'telegram') drafts[ch.id] = generatedData.social_drafts.telegram;
          else drafts[ch.id] = generatedData.social_drafts.linkedin; // Fallback
        });

        setCurrentArticle(prev => ({
          ...prev,
          title: generatedData.title,
          slug: generatedData.slug,
          meta_desc: generatedData.meta_desc,
          content: generatedData.content,
          social_drafts: drafts,
          workflow_step: 'review'
        }));
        
        showNotification('AI 内容生成完成', 'success');

      } catch (error: any) {
        console.error(error);
        showNotification(`AI 生成失败: ${error.message || '请检查 API Key'}`, 'error');
        setCurrentArticle(prev => ({ ...prev, workflow_step: 'source_ingest' }));
      } finally {
        setAiGenerating(false);
      }
  };

  const handleGeneratePoster = () => {
      if (!brandConfig.hasManual) {
          showNotification('必须上传品牌手册才能生成海报', 'error');
          return;
      }
      showNotification('正在应用品牌模版生成海报...', 'loading');
      setTimeout(() => {
          // Simulate different templates based on stream
          const template = stream === 'market' ? 'corporate' : 'alert';
          const placeholder = stream === 'market' 
            ? 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600' // Cyberpunk
            : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600'; // Tech abstract
          
          setCurrentArticle(prev => ({
              ...prev,
              generated_image: placeholder,
              poster_template: template
          }));
          showNotification('海报生成成功！(Logo/Tags 已自动合成)', 'success');
          setShowToast(false);
      }, 2000);
  };

  const handlePushReport = () => {
      setReportGenerating(true);
      showNotification(`正在生成${reportPeriod === 'weekly' ? '周报' : '月报'}并分析数据...`, 'loading');
      setTimeout(() => {
          setReportGenerating(false);
          setShowToast(false);
          showNotification('专业分析报表已发送至 "PAIPAY 管理层" TG 群', 'success');
      }, 2000);
  }

  const handlePublish = async () => {
      showNotification('正在连接 Supabase 数据库...', 'loading');
      
      try {
        if (!isSupabaseConfigured) {
             throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Netlify Environment Variables.");
        }

        // Determine tag based on category if not set
        let finalTag = currentArticle.tag;
        if (!finalTag) {
            if (stream === 'market') finalTag = 'TREND';
            else finalTag = 'SYSTEM';
        }

        // Real DB Insert
        const { error } = await supabase.from('articles').insert([{
            title: currentArticle.title,
            slug: currentArticle.slug,
            content: currentArticle.content,
            meta_desc: currentArticle.meta_desc,
            category: currentArticle.category,
            language: currentArticle.language,
            stream: stream,
            tag: finalTag,
            author: currentUserEmail || 'Admin'
        }]);

        if (error) {
            console.error('Database insertion error:', error);
            // If table doesn't exist, we fallback to visual success but warn in console
            if (error.code === '42P01') { // undefined_table
                 showNotification('错误: 请先在 Supabase SQL Editor 运行建表代码', 'error');
                 return;
            }
            throw error;
        }

        // Success Flow
        showNotification('数据已写入 Supabase！', 'success');
        
        setTimeout(() => {
             showNotification('正在发布社群矩阵...', 'loading');
             setTimeout(() => {
                  handleWorkflowClick('summary');
                  showNotification('全渠道发布完成！', 'success');
             }, 1200);
        }, 800);

      } catch (e: any) {
        console.error("Publish failed", e);
        showNotification(`发布失败: ${e.message}`, 'error');
      }
  };

  const handleWorkflowClick = (step: WorkflowStep) => {
      setCurrentArticle(prev => ({ ...prev, workflow_step: step }));
  }

  const toggleSocialConnection = (id: string) => {
      setSocialChannels(prev => prev.map(ch => 
          ch.id === id ? { ...ch, connected: !ch.connected } : ch
      ));
      const channel = socialChannels.find(c => c.id === id);
      showNotification(channel?.connected ? `${channel.name} 已断开` : `${channel?.name} 已连接`, 'info');
  }

  const updateSocialDraft = (id: string, newText: string) => {
      setCurrentArticle(prev => ({
          ...prev,
          social_drafts: {
              ...prev.social_drafts,
              [id]: newText
          }
      }));
  }

  const handleTutorialClick = (id: number) => {
      const tutorial = tutorials[id];
      if (tutorial) {
          setActiveTutorial(tutorial);
      } else {
          showNotification('该步骤暂无教程', 'info');
      }
  }

  // --- Renderers ---
  
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
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
                    <i className="ri-close-line text-xl"></i>
                </button>
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
                <div className="flex bg-gray-800/50 p-1 rounded-lg mb-4">
                    {(['EN', 'CN', 'VN'] as AdminLang[]).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${lang === l ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold border border-white/10">
                        {currentUserEmail.charAt(0).toUpperCase()}
                    </div>
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

  const renderPostPublishState = () => (
      <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in py-20">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <i className="ri-check-line text-5xl text-green-600"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Supabase 写入成功</h2>
          <p className="text-gray-500 max-w-md mb-10">
              文章已保存至 <strong>articles 表</strong>，并已同步推送到 <strong>{socialChannels.filter(c => c.connected).length} 个社交账号</strong>。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 w-full max-w-5xl">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-blue-600 mb-2"><i className="ri-database-2-line text-2xl"></i></div>
                  <div className="font-bold text-gray-900 text-sm">Supabase DB</div>
                  <div className="text-xs text-green-600 mt-1">Saved</div>
              </div>
               {socialChannels.filter(c => c.connected).map(c => (
                   <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-black mb-2"><i className={`${c.icon} text-2xl`}></i></div>
                        <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                        <div className="text-xs text-green-600 mt-1">Published ({currentArticle.language})</div>
                   </div>
               ))}
          </div>

          <div className="flex gap-4">
              <button 
                onClick={() => {
                    setCurrentArticle({ workflow_step: 'idea', title: '', content: '', raw_source: '', tag: 'TREND', language: 'CN' });
                }}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                  创作新内容
              </button>
              <button 
                onClick={() => {
                    setActiveTab('reports');
                    setTimeout(() => handlePushReport(), 500);
                }}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-300"
              >
                  查看情报日报
              </button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-white md:pl-64 transition-all duration-300">
      <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} type={toastType} />
      <TutorialModal tutorial={activeTutorial} onClose={() => setActiveTutorial(null)} />
      
      {renderSidebar()}

      {/* Mobile Header */}
      <div className="md:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">P</div>
               <span className="font-bold text-lg">{text.sidebar.brand}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
              <i className="ri-menu-line text-2xl"></i>
          </button>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === 'studio' && (
             <div className="animate-fade-in">
                 {/* Header */}
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                     <div>
                         <h1 className="text-3xl font-bold text-gray-900 mb-1">{text.studio.title}</h1>
                         <p className="text-gray-500 text-sm">{text.studio.subtitle}</p>
                     </div>
                     <div className="flex gap-2">
                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                            <i className="ri-history-line mr-2"></i>History
                        </button>
                        <button onClick={() => setCurrentArticle({ workflow_step: 'idea', title: '' })} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                            <i className="ri-add-line mr-2"></i>{text.studio.new_btn}
                        </button>
                     </div>
                 </div>

                 {/* Workflow Stepper */}
                 <div className="mb-10 overflow-x-auto pb-2">
                    <div className="flex items-center min-w-max">
                        {['idea', 'source_ingest', 'ai_gen', 'review', 'layout', 'approved', 'published', 'summary'].map((step, idx) => {
                            const isCurrent = currentArticle.workflow_step === step;
                            const isPast = ['idea', 'source_ingest', 'ai_gen', 'review', 'layout', 'approved', 'published', 'summary'].indexOf(currentArticle.workflow_step || 'idea') > idx;
                            return (
                                <React.Fragment key={step}>
                                    <div className={`flex items-center gap-2 ${isCurrent ? 'text-blue-600 font-bold' : (isPast ? 'text-gray-900 font-medium' : 'text-gray-300')}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 transition-all ${isCurrent ? 'border-blue-600 bg-blue-50' : (isPast ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white')}`}>
                                            {isPast ? <i className="ri-check-line"></i> : idx + 1}
                                        </div>
                                        <span className="capitalize text-sm hidden md:block">{step.replace('_', ' ')}</span>
                                    </div>
                                    {idx < 7 && <div className={`w-12 h-0.5 mx-2 ${isPast ? 'bg-gray-900' : 'bg-gray-200'}`}></div>}
                                </React.Fragment>
                            );
                        })}
                    </div>
                 </div>

                 {/* Workspace */}
                 {currentArticle.workflow_step === 'summary' ? renderPostPublishState() : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Input & Config */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Stream Selector */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Content Stream</label>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setStream('market')}
                                        className={`flex-1 py-4 px-6 rounded-xl border-2 text-left transition-all ${stream === 'market' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className={`text-sm font-bold mb-1 ${stream === 'market' ? 'text-blue-700' : 'text-gray-900'}`}>{text.studio.stream_market}</div>
                                        <div className="text-xs text-gray-500">Global Macro, Crypto Trends, FX</div>
                                    </button>
                                    <button 
                                        onClick={() => setStream('notice')}
                                        className={`flex-1 py-4 px-6 rounded-xl border-2 text-left transition-all ${stream === 'notice' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className={`text-sm font-bold mb-1 ${stream === 'notice' ? 'text-blue-700' : 'text-gray-900'}`}>{text.studio.stream_notice}</div>
                                        <div className="text-xs text-gray-500">System Upgrade, Maintenance, API</div>
                                    </button>
                                </div>
                            </div>

                            {/* Manual Upload Check */}
                            <div className={`bg-white p-6 rounded-2xl border transition-all ${brandConfig.hasManual ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${brandConfig.hasManual ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
                                        <span className={`text-sm font-bold ${brandConfig.hasManual ? 'text-green-700' : 'text-orange-700'}`}>
                                            {brandConfig.hasManual ? text.studio.manual_uploaded : text.studio.manual_required}
                                        </span>
                                    </div>
                                    {!brandConfig.hasManual && (
                                        <button onClick={() => manualInputRef.current?.click()} className="text-xs font-bold underline text-orange-700">
                                            {text.studio.upload_manual}
                                        </button>
                                    )}
                                    <input type="file" ref={manualInputRef} onChange={handleUploadManual} className="hidden" />
                                </div>
                                {brandConfig.hasManual && (
                                    <div className="text-xs text-green-800 font-mono">
                                        <i className="ri-file-text-line mr-1"></i> {brandConfig.manual} (Vectorized)
                                    </div>
                                )}
                            </div>

                            {/* Main Input */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{text.studio.input_topic}</label>
                                    <button onClick={handleAutoFetch} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors">
                                        <i className="ri-magic-line mr-1"></i>{text.studio.auto_fetch}
                                    </button>
                                </div>
                                <textarea 
                                    value={currentArticle.raw_source}
                                    onChange={(e) => setCurrentArticle({...currentArticle, raw_source: e.target.value})}
                                    className="w-full h-48 p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none text-sm leading-relaxed"
                                    placeholder={text.studio.ingest_placeholder}
                                ></textarea>
                                
                                <div className="mt-6 flex justify-end">
                                    <button 
                                        onClick={handleAiGenerate}
                                        disabled={aiGenerating}
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
                                                <span>{text.studio.btn_generate}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                             {/* Review Area (Only shows after generation) */}
                             {currentArticle.workflow_step === 'review' && (
                                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-lg shadow-blue-50 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                        <h3 className="font-bold text-gray-900">AI Draft Review</h3>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            Verified by Gemini 2.5
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-gray-400 font-bold uppercase">Title</label>
                                            <input 
                                                value={currentArticle.title} 
                                                onChange={(e) => setCurrentArticle({...currentArticle, title: e.target.value})}
                                                className="w-full mt-1 font-bold text-lg text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-blue-500 outline-none bg-transparent" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 font-bold uppercase">Content (HTML)</label>
                                            <div className="relative">
                                                <textarea 
                                                    value={currentArticle.content} 
                                                    onChange={(e) => setCurrentArticle({...currentArticle, content: e.target.value})}
                                                    className="w-full mt-1 text-sm text-gray-600 leading-relaxed h-64 p-3 bg-gray-50 rounded-lg border border-transparent focus:bg-white focus:border-blue-300 outline-none" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 flex justify-end gap-3">
                                        <button className="px-6 py-3 text-gray-500 font-bold text-sm hover:text-gray-900">Regenerate</button>
                                        <button 
                                            onClick={handlePublish}
                                            className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                                        >
                                            <i className="ri-upload-cloud-2-line"></i>
                                            {text.studio.publish}
                                        </button>
                                    </div>
                                </div>
                             )}
                        </div>

                        {/* Right: Sidebar Tools */}
                        <div className="space-y-6">
                            {/* Tabs */}
                            <div className="bg-gray-100 p-1 rounded-xl flex">
                                <button 
                                    onClick={() => setPreviewMode('social')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${previewMode === 'social' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                >
                                    {text.studio.tab_social}
                                </button>
                                <button 
                                    onClick={() => setPreviewMode('seo')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${previewMode === 'seo' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                >
                                    {text.studio.tab_seo}
                                </button>
                            </div>

                            {/* Content */}
                            {previewMode === 'social' ? (
                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                                        {socialChannels.map(ch => (
                                            <button 
                                                key={ch.id}
                                                onClick={() => setActiveSocialPreview(ch.id)}
                                                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${activeSocialPreview === ch.id ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                            >
                                                <i className={ch.icon}></i>
                                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${ch.connected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Preview Card */}
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-900">PAIPAY Official</div>
                                                    <div className="text-[10px] text-gray-400">Just now</div>
                                                </div>
                                            </div>
                                            <i className="ri-twitter-x-line text-gray-400"></i>
                                        </div>
                                        <textarea 
                                            className="w-full bg-transparent text-sm text-gray-800 leading-relaxed outline-none resize-none h-32"
                                            value={currentArticle.social_drafts?.[activeSocialPreview] || "AI will generate copy for this channel..."}
                                            onChange={(e) => updateSocialDraft(activeSocialPreview, e.target.value)}
                                        ></textarea>
                                        {currentArticle.generated_image && (
                                            <div className="mt-3 rounded-lg overflow-hidden relative">
                                                <img src={currentArticle.generated_image} className="w-full h-auto" alt="Social Asset" />
                                            </div>
                                        )}
                                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-gray-400 text-lg">
                                            <i className="ri-image-line cursor-pointer hover:text-blue-500" onClick={handleGeneratePoster}></i>
                                            <i className="ri-gif-line"></i>
                                            <i className="ri-bar-chart-horizontal-line"></i>
                                            <i className="ri-emotion-line"></i>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                         <div className="flex items-center justify-between">
                                             <span className="text-xs font-bold text-gray-500">Connection Status</span>
                                             <button 
                                                onClick={() => toggleSocialConnection(activeSocialPreview)}
                                                className={`text-xs font-bold px-3 py-1 rounded-full ${socialChannels.find(c => c.id === activeSocialPreview)?.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                             >
                                                 {socialChannels.find(c => c.id === activeSocialPreview)?.connected ? 'Connected' : 'Disconnected'}
                                             </button>
                                         </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="mb-4">
                                        <div className="text-blue-700 text-lg font-medium hover:underline cursor-pointer truncate">
                                            {currentArticle.title || "Page Title Preview"}
                                        </div>
                                        <div className="text-green-700 text-xs my-1">
                                            https://www.paipay.finance/insights/{currentArticle.slug || "url-slug"}
                                        </div>
                                        <div className="text-gray-600 text-xs leading-relaxed line-clamp-3">
                                            {currentArticle.meta_desc || "Meta description will appear here..."}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                 )}
             </div>
        )}
        
        {/* Placeholder for other tabs to keep code short, logic same structure */}
        {activeTab !== 'studio' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <i className="ri-tools-line text-4xl mb-4"></i>
                <p>Module <strong>{activeTab}</strong> is ready for expansion.</p>
                <button 
                    onClick={() => setActiveTab('studio')}
                    className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700"
                >
                    Return to Studio
                </button>
            </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;