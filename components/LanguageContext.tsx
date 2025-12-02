
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'EN' | 'CN' | 'VN' | 'TH' | 'KH';

export type MarketCategory = 'all' | 'analysis' | 'trend' | 'report';
export type NoticeCategory = 'all' | 'system' | 'maintenance' | 'feature';

export interface Article {
  id: string;
  category: MarketCategory | NoticeCategory; // Used for filtering logic
  tag: string; // Display label (can remain as is for badge)
  title: string;
  date: string;
  summary: string;
  content: string;
  image_url?: string; // New: Support for generated posters/images
}

interface Translations {
  [key: string]: {
    nav: {
      ecosystem: string;
      features: string;
      insights: string;
      developers: string;
      faq: string;
      download: string;
      community: string;
      back_home: string;
    };
    hero: {
      title_line1: string;
      title_line2: string;
      subtitle: string;
      cta_start: string;
      cta_contact: string;
      card_holder: string;
      card_level: string;
    };
    stats: {
      coverage: string;
      clearance: string;
      accounts: string;
    };
    ecosystem: {
      title: string;
      description: string;
    };
    compliance: {
      title: string;
      description: string;
      certified: string;
      standard: string;
      security: string;
      license: string;
    };
    features: {
      title: string;
      description: string;
      card1_title: string;
      card1_desc: string;
      card2_title: string;
      card2_desc: string;
      card3_title: string;
      card3_desc: string;
    };
    lifestyle: {
      tag: string;
      title_line1: string;
      title_line2: string;
      description: string;
      check1: string;
      check2: string;
      app_received: string;
      app_balance: string;
      app_activity: string;
    };
    insights: { 
      title: string; 
      description: string; 
      notice_title: string;
      notice_description: string;
      tab_market: string; 
      tab_notice: string; 
      chart_title: string;
      view_all: string;
      read_more: string;
      market_items: Article[];
      notice_items: Article[];
      categories: {
        market: { [key in MarketCategory]: string };
        notice: { [key in NoticeCategory]: string };
      }
    };
    developers: {
      title: string;
      description: string;
      cta: string;
    };
    faq: {
      title: string;
      description: string;
      q1: string;
      a1: string;
      q2: string;
      a2: string;
      q3: string;
      a3: string;
      q4: string;
      a4: string;
      q5: string;
      a5: string;
    };
    footer: { 
        ready: string;
        rights: string;
        privacy: string;
        terms: string;
        compliance: string; 
    };
    notices: { 
        n1: string;
        n2: string;
        n3: string; 
    };
    download_drawer: {
      select_title: string;
      select_subtitle: string;
      ios_tip: string;
      android_rec: string;
      btn_back: string;
      btn_confirm: string;
    };
    admin: {
      studio: {
        market_pulse: string;
        visual_engine: string;
        generate_poster: string;
        workflow_audit: string;
        layer_bg: string;
        layer_mask: string;
        layer_text: string;
        topic_select: string;
      }
    };
  };
}

const commonContent = {
  en_market: [
    { id: 'm1', category: 'report', tag: 'INSIGHT', title: '2025 Cross-Border Payment Whitepaper', date: 'Oct 24, 2024', summary: 'Deep dive into how hybrid financial architecture is reshaping the SEA payment corridor.', content: 'The landscape of cross-border payments is undergoing a seismic shift. Traditional correspondent banking models are being challenged by blockchain-based settlement layers that offer near-instant finality. This whitepaper explores the integration of stablecoins into institutional flows...' },
    { id: 'm2', category: 'analysis', tag: 'MARKET', title: 'FX Weekly: DXY Volatility Analysis', date: 'Oct 22, 2024', summary: 'The DXY is trending upwards this week. Exporters are advised to lock in forward rates.', content: 'With the Federal Reserve signaling a "higher for longer" interest rate environment, the DXY index has broken through key resistance levels. Emerging market currencies are facing pressure, creating arbitrage opportunities for liquidity providers...' },
    { id: 'm3', category: 'trend', tag: 'TREND', title: 'Stablecoin Volume Surpasses Visa in SEA', date: 'Oct 18, 2024', summary: 'On-chain data reveals a historic flip in transaction volume for Q3 2024.', content: 'For the first time in history, the aggregate volume of USD-pegged stablecoins settled on TRON and Solana networks in Southeast Asia has surpassed Visa\'s regional settlement volume. This marks a turning point for utility-based crypto adoption...' }
  ] as Article[],
  cn_market: [
    { id: 'm1', category: 'report', tag: '深度洞察', title: '2025 跨境支付白皮书', date: '2024年10月24日', summary: '深入剖析混合金融架构如何重塑东南亚支付走廊。', content: '跨境支付格局正在经历一场巨变。传统的代理行模式正受到区块链结算层的挑战，后者提供了近乎即时的最终性。本白皮书探讨了稳定币如何融入机构资金流...' },
    { id: 'm2', category: 'analysis', tag: '市场分析', title: '外汇周报：DXY 波动指数分析', date: '2024年10月22日', summary: '本周美元指数呈上升趋势，建议出口商锁定远期汇率。', content: '随着美联储释放“长期高息”的信号，美元指数已突破关键阻力位。新兴市场货币正面临压力，为流动性提供商创造了套利机会...' },
    { id: 'm3', category: 'trend', tag: '趋势', title: '东南亚稳定币交易量超越 Visa', date: '2024年10月18日', summary: '链上数据显示 2024 年第三季度交易量出现历史性反转。', content: '历史上首次，在东南亚地区，基于 TRON 和 Solana 网络的美元稳定币结算总量超过了 Visa 的区域结算量。这标志着基于实用性的加密货币采用出现了转折点...' }
  ] as Article[],
  en_notice: [
    { id: 'n1', category: 'feature', tag: 'SYSTEM', title: 'New PromptPay (Thailand) Instant Channel', date: '2h ago', summary: 'Integration with Thai National Payment Gateway completed. Supporting THB up to 2M per txn.', content: 'We are pleased to announce the full integration of Thailand\'s PromptPay system. Users can now perform instant THB payouts to any Thai bank account using just a mobile number or Citizen ID. The limit per transaction has been increased to 2M THB.' },
    { id: 'n2', category: 'maintenance', tag: 'MAINTENANCE', title: 'Solana Node Upgrade Notice', date: '1d ago', summary: 'Scheduled for 2025-05-20 UTC 02:00. SOL deposits/withdrawals paused for ~30 mins.', content: 'To support the upcoming Solana mainnet upgrade, PAIPAY will perform node maintenance. During this window, SOL and SPL token deposits/withdrawals will be briefly paused. Trading and internal transfers remain unaffected.' },
    { id: 'n3', category: 'system', tag: 'FEATURE', title: 'API V2.1 Now Available', date: '3d ago', summary: 'Added Batch Transfer Query endpoint and Webhook retry mechanism. Check docs.', content: 'API version 2.1 is now live in the sandbox and production environments. Key features include a new endpoint for querying batch transfer statuses in a single call, and an improved webhook delivery system with exponential backoff retries.' }
  ] as Article[],
  cn_notice: [
    { id: 'n1', category: 'feature', tag: '系统更新', title: '新增 PromptPay (泰国) 极速通道', date: '2小时前', summary: '已完成与泰国国家支付网关的集成。支持单笔最高 200万泰铢。', content: '我们要很高兴地宣布，泰国的 PromptPay 系统已完全集成。用户现在可以使用手机号码或公民身份证，即时向任何泰国银行账户进行泰铢付款。单笔交易限额已提高至 200 万泰铢。' },
    { id: 'n2', category: 'maintenance', tag: '维护公告', title: 'Solana 节点升级公告', date: '1天前', summary: '计划于 2025-05-20 UTC 02:00 进行。SOL 充提将暂停约 30 分钟。', content: '为了支持即将到来的 Solana 主网升级，PAIPAY 将进行节点维护。在此期间，SOL 和 SPL 代币的充值/提现将短暂暂停。交易和内部转账不受影响。' },
    { id: 'n3', category: 'system', tag: '功能发布', title: 'API V2.1 版本发布', date: '3天前', summary: '新增批量转账查询接口及 Webhook 重试机制。请查看文档。', content: 'API 2.1 版本现已在沙盒和生产环境中上线。主要功能包括一个新的端点，用于在一次调用中查询批量转账状态，以及一个改进的 Webhook 交付系统，具有指数退避重试功能。' }
  ] as Article[]
};

const translations: Translations = {
  EN: {
    nav: { ecosystem: 'Network', features: 'Solutions', insights: 'Intelligence', developers: 'Developers', faq: 'Support', download: 'Download App', community: 'Community', back_home: 'Back to Home' },
    hero: {
      title_line1: 'Next-Gen Global', title_line2: 'Clearing Rails',
      subtitle: 'Hybrid financial architecture on blockchain infrastructure. Fluid asset movement across borders with zero friction.',
      cta_start: 'Get Started', cta_contact: 'Contact Sales',
      card_holder: 'CARD HOLDER', card_level: 'BUSINESS ELITE'
    },
    stats: { coverage: 'Global Markets', clearance: 'Settlement Time', accounts: 'Native Accounts' },
    ecosystem: { title: 'Deep Liquidity via Tier-1 Institutions', description: 'Direct integration with global money center banks, local clearing houses, and card schemes.' },
    compliance: { title: 'Global Standards, Sovereign Compliance', description: 'Bank-grade audit trails and security protocols ensuring absolute asset integrity.', certified: 'Certified', standard: 'Standard', security: 'Security', license: 'License' },
    features: {
      title: 'Full-Stack Financial Infrastructure', description: 'Seamless payment rails for modern enterprises and digital natives.',
      card1_title: 'Borderless Settlement', card1_desc: 'Dissolve geographical barriers. Instant fund movement across 150+ jurisdictions via local rails.',
      card2_title: 'Transparent FX', card2_desc: 'Smart routing engine executes at interbank mid-market rates. Zero hidden spreads.',
      card3_title: 'Institutional Custody', card3_desc: 'Enterprise MPC wallets with private key sharding. Governance controls for treasury management.'
    },
    lifestyle: {
      tag: 'Lifestyle Integration', title_line1: 'Native to Web3', title_line2: 'Living in Reality',
      description: 'Whether you are a nomad in Bali or a merchant in Yiwu, PAIPAY abstracts the complexity. No on-chain friction, just instant liquidity.',
      check1: 'Instant Fiat-Crypto On/Off Ramp', check2: 'Global Spending via Virtual Cards',
      app_received: 'Payment Received', app_balance: 'Total Asset Value', app_activity: 'Recent Transactions'
    },
    insights: { 
      title: 'Market Intelligence', 
      description: 'Real-time capital flow analysis and FX trends.', 
      notice_title: 'System Announcements',
      notice_description: 'Platform status, maintenance schedules, and new feature releases.',
      tab_market: 'Market Data', 
      tab_notice: 'System Status', 
      chart_title: 'Global Crypto Cap',
      view_all: 'View All Updates',
      read_more: 'Read Article',
      market_items: commonContent.en_market,
      notice_items: commonContent.en_notice,
      categories: {
        market: { all: 'All', analysis: 'Analysis', trend: 'Trends', report: 'Reports' },
        notice: { all: 'All', system: 'System', maintenance: 'Maintenance', feature: 'Features' }
      }
    },
    developers: { title: 'Program Money with Code', description: 'Developer-first API designed for high-frequency settlement. Integrate in minutes, scale to millions.', cta: 'Read API Docs' },
    faq: {
      title: 'Frequently Asked Questions', description: 'Technical, compliance, and product support.',
      q1: 'Supported jurisdictions and currencies?', a1: 'PAIPAY operates in 150+ markets, supporting 100+ native fiat currencies and major digital assets.',
      q2: 'How is asset security guaranteed?', a2: 'We utilize ISO 27001 certified infrastructure and MPC technology. Assets are segregated and fully audited.',
      q3: 'What is the API integration timeline?', a3: 'Production keys can be issued within 1-3 business days after compliance verification.',
      q4: 'How is FX pricing determined?', a4: 'We provide real-time interbank rates with transparent fee structures. No hidden markups.',
      q5: 'Do you support individual accounts?', a5: 'Yes, we offer both personal wealth accounts and enterprise treasury solutions.'
    },
    footer: { ready: 'Ready to upgrade your financial stack?', rights: 'All rights reserved.', privacy: 'Privacy Policy', terms: 'Terms of Service', compliance: 'Compliance' },
    notices: { n1: 'New: Enterprise MPC Wallet & Treasury OS', n2: 'B2B Rails: Unified Global Settlement API', n3: 'Security Update: Enhanced Private Key Sharding' },
    download_drawer: {
      select_title: 'Download App',
      select_subtitle: 'Select your platform',
      ios_tip: 'Tip: If not found in local store, please switch to Global (US/SG) region.',
      android_rec: 'Google Play recommended for auto-updates',
      btn_back: 'Back',
      btn_confirm: 'Confirm'
    },
    admin: {
        studio: {
            market_pulse: 'Market Pulse (Input)',
            visual_engine: 'Visual Engine',
            generate_poster: 'Generate Poster (Layered)',
            workflow_audit: 'Submit for Audit',
            layer_bg: 'Layer 1: Gen/Stock',
            layer_mask: 'Layer 2: Brand Mask',
            layer_text: 'Layer 3: Typography',
            topic_select: 'Use This Topic'
        }
    }
  },
  CN: {
    nav: { ecosystem: '生态网络', features: '解决方案', insights: '市场脉动', developers: '开发者', faq: '常见问题', download: '下载 App', community: '加入社群', back_home: '返回首页' },
    hero: {
      title_line1: '下一代全球', title_line2: '清算网络',
      subtitle: '基于区块链技术的混合金融架构。让您的数字资产像呼吸一样自然地流向全球。',
      cta_start: '开始体验', cta_contact: '联系企业顾问',
      card_holder: '持卡人', card_level: '商业精英'
    },
    stats: { coverage: '覆盖国家/地区', clearance: '毫秒级清算', accounts: '原生币种账户' },
    ecosystem: { title: '由全球顶级金融机构提供流动性支持', description: '连接国际一级银行、本地清算巨头与卡组织，构建稳如磐石的支付网络。' },
    compliance: { title: '全球标准，原生合规', description: '每一笔交易都受到最高级别的合规审计与安全保护。', certified: '认证', standard: '标准', security: '安全', license: '牌照' },
    features: {
      title: '全场景金融解决方案', description: '为个人与企业打造的无缝支付体验，重塑价值流转方式。',
      card1_title: '无界支付', card1_desc: '打破地理边界。通过全球银行网络，实现资金在 150+ 国家的无障碍流转。',
      card2_title: '透明汇率', card2_desc: '智能路由引擎自动寻找全球最优汇率。拒绝隐形汇损，每一分钱的成本都清晰可见。',
      card3_title: '原生安全', card3_desc: '企业级多签钱包与组织治理架构。私钥分片技术保障资金绝对主权。'
    },
    lifestyle: {
      tag: '生活方式融合', title_line1: '工作在 Web3', title_line2: '生活在现实',
      description: '无论您是巴厘岛的数字游民，还是义乌的跨国贸易商，PAIPAY 消除了一切技术冷感。',
      check1: '法币与加密货币双向无感兑换', check2: '支持 Visa/Mastercard 全球消费',
      app_received: '已收款', app_balance: '总资产', app_activity: '最近活动'
    },
    insights: { 
      title: '市场情报与深度洞察', 
      description: '掌握全球加密资产与外汇流动趋势。', 
      notice_title: '系统公告',
      notice_description: '平台状态、系统维护通知与新功能发布。',
      tab_market: '市场数据', 
      tab_notice: '系统公告', 
      chart_title: '全球数字货币总市值',
      view_all: '查看所有',
      read_more: '阅读全文',
      market_items: commonContent.cn_market,
      notice_items: commonContent.cn_notice,
      categories: {
        market: { all: '全部', analysis: '深度分析', trend: '市场趋势', report: '研究报告' },
        notice: { all: '全部', system: '系统升级', maintenance: '停机维护', feature: '功能发布' }
      }
    },
    developers: { title: '几行代码，连接世界', description: '为开发者设计的极简 API。无论是电商结账还是批量发薪，5分钟即可完成集成。', cta: '查看 API 文档' },
    faq: {
      title: '常见问题', description: '关于产品、安全与集成的解答',
      q1: 'PAIPAY 支持哪些国家和货币？', a1: 'PAIPAY 目前覆盖全球 150+ 个国家和地区，支持 100+ 种原生法币账户以及主流加密货币。',
      q2: '资金安全如何保障？', a2: '我们采用银行级安全标准，持有 ISO 27001 认证及 PCI-DSS L1 牌照。核心资产通过多签管理。',
      q3: '企业接入 API 需要多久？', a3: '通常开发者可在 1-3 天内完成沙箱测试与生产环境部署。',
      q4: '跨境转账的费率是多少？', a4: '我们采用透明汇率机制，智能路由引擎会自动寻找最优汇率，无隐形汇损。',
      q5: '是否支持个人用户注册？', a5: '是的，PAIPAY 同时服务于个人与企业用户。'
    },
    footer: { ready: '准备好升级您的金融体验了吗？', rights: '保留所有权利。', privacy: '隐私政策', terms: '服务条款', compliance: '合规中心' },
    notices: { n1: '全新推出：企业级多签钱包与智能财务系统', n2: 'B2B 解决方案上线：一站式集成全球清算能力', n3: '安全升级：私钥分片技术保障资金绝对主权' },
    download_drawer: {
      select_title: '下载 App',
      select_subtitle: '请选择您的平台',
      ios_tip: '温馨提示：若在本地商店未找到，请切换至美区(Global)商店。',
      android_rec: '推荐使用 Google Play 获取自动更新',
      btn_back: '返回',
      btn_confirm: '确认前往'
    },
    admin: {
        studio: {
            market_pulse: '市场脉动 (素材源)',
            visual_engine: '视觉合成引擎',
            generate_poster: '生成分层海报',
            workflow_audit: '提交审核',
            layer_bg: '图层 1: 底图 (AI/Stock)',
            layer_mask: '图层 2: 品牌蒙版',
            layer_text: '图层 3: 动态排版',
            topic_select: '引用此热点'
        }
    }
  },
  VN: {
    nav: { ecosystem: 'Hệ Sinh Thái', features: 'Giải Pháp', insights: 'Thị Trường', developers: 'Lập Trình Viên', faq: 'Hỗ Trợ', download: 'Tải App', community: 'Cộng Đồng', back_home: 'Trở Về' },
    hero: {
      title_line1: 'Mạng Lưới', title_line2: 'Thanh Quyết Toán Toàn Cầu',
      subtitle: 'Kiến trúc tài chính lai (Hybrid) trên nền tảng Blockchain. Giúp dòng vốn lưu thông xuyên biên giới mượt mà như hơi thở.',
      cta_start: 'Bắt Đầu Ngay', cta_contact: 'Liên Hệ Doanh Nghiệp',
      card_holder: 'CHỦ THẺ', card_level: 'DOANH NHÂN'
    },
    stats: { coverage: 'Quốc Gia & Vùng Lãnh Thổ', clearance: 'Tốc Độ Quyết Toán', accounts: 'Tài Khoản Bản Địa' },
    ecosystem: { title: 'Thanh Khoản Từ Các Định Chế Tài Chính Cấp 1', description: 'Kết nối trực tiếp với các ngân hàng trung tâm toàn cầu và cổng thanh toán địa phương (Local Rails).' },
    compliance: { title: 'Tiêu Chuẩn Toàn Cầu, Tuân Thủ Chủ Quyền', description: 'Mọi giao dịch đều được kiểm toán nghiêm ngặt và bảo vệ bởi các giao thức bảo mật cấp ngân hàng.', certified: 'Chứng Nhận', standard: 'Tiêu Chuẩn', security: 'Bảo Mật', license: 'Giấy Phép' },
    features: {
      title: 'Hạ Tầng Tài Chính Toàn Diện', description: 'Trải nghiệm thanh toán không gián đoạn cho cá nhân và doanh nghiệp số.',
      card1_title: 'Thanh Toán Xuyên Biên Giới', card1_desc: 'Xóa bỏ rào cản địa lý. Điều chuyển vốn tức thì qua 150+ quốc gia thông qua hệ thống thanh toán địa phương.',
      card2_title: 'Tỷ Giá Minh Bạch (FX)', card2_desc: 'Công cụ định tuyến thông minh khớp lệnh theo tỷ giá liên ngân hàng. Không có phí ẩn (Zero spread).',
      card3_title: 'Bảo Mật Cấp Tổ Chức', card3_desc: 'Ví doanh nghiệp Multi-sig và công nghệ phân mảnh khóa riêng tư (MPC). Quản trị ngân khố chuyên nghiệp.'
    },
    lifestyle: {
      tag: 'Phong Cách Sống Web3', title_line1: 'Làm Việc Web3', title_line2: 'Sống Thực Tế',
      description: 'Dù bạn là Digital Nomad tại Bali hay thương nhân tại Yiwu, PAIPAY loại bỏ mọi phức tạp kỹ thuật. Không rào cản On-chain.',
      check1: 'Cổng Chuyển Đổi Fiat-Crypto Tức Thì', check2: 'Thẻ Ảo Visa/Mastercard Toàn Cầu',
      app_received: 'Đã Nhận Tiền', app_balance: 'Tổng Tài Sản', app_activity: 'Giao Dịch Gần Đây'
    },
    insights: { 
      title: 'Thông Tin Thị Trường', 
      description: 'Phân tích dòng tiền Crypto và xu hướng ngoại hối (FX) thời gian thực.', 
      notice_title: 'Thông Báo Hệ Thống',
      notice_description: 'Trạng thái nền tảng, lịch bảo trì và phát hành tính năng mới.',
      tab_market: 'Dữ Liệu', 
      tab_notice: 'Hệ Thống', 
      chart_title: 'Vốn Hóa Crypto Toàn Cầu',
      view_all: 'Xem Tất Cả',
      read_more: 'Đọc Thêm',
      market_items: commonContent.en_market, // Using English as fallback
      notice_items: commonContent.en_notice,
      categories: {
        market: { all: 'Tất cả', analysis: 'Phân Tích', trend: 'Xu Hướng', report: 'Báo Cáo' },
        notice: { all: 'Tất cả', system: 'Hệ Thống', maintenance: 'Bảo Trì', feature: 'Tính Năng' }
      }
    },
    developers: { title: 'Lập Trình Dòng Tiền Bằng Code', description: 'API tối giản được thiết kế cho tốc độ cao. Tích hợp trong vài phút, mở rộng quy mô toàn cầu.', cta: 'Xem Tài Liệu API' },
    faq: {
      title: 'Câu Hỏi Thường Gặp', description: 'Giải đáp về sản phẩm, tuân thủ và kỹ thuật.',
      q1: 'Hỗ trợ những quốc gia và loại tiền nào?', a1: 'PAIPAY hoạt động tại 150+ thị trường, hỗ trợ 100+ loại tiền pháp định bản địa và tài sản số.',
      q2: 'Tài sản được bảo vệ như thế nào?', a2: 'Chúng tôi sử dụng hạ tầng chuẩn ISO 27001 và công nghệ MPC. Tài sản được tách biệt và kiểm toán đầy đủ.',
      q3: 'Thời gian tích hợp API là bao lâu?', a3: 'Key môi trường Production có thể được cấp trong 1-3 ngày làm việc sau khi xác minh.',
      q4: 'Cơ chế tỷ giá FX như thế nào?', a4: 'Chúng tôi cung cấp tỷ giá liên ngân hàng thời gian thực với cấu trúc phí minh bạch.',
      q5: 'Có hỗ trợ tài khoản cá nhân không?', a5: 'Có, chúng tôi cung cấp cả tài khoản cá nhân và giải pháp quản lý ngân khố doanh nghiệp.'
    },
    footer: { ready: 'Sẵn sàng nâng cấp trải nghiệm tài chính?', rights: 'Bảo lưu mọi quyền.', privacy: 'Chính Sách', terms: 'Điều Khoản', compliance: 'Tuân Thủ' },
    notices: { n1: 'Mới: Ví MPC Doanh Nghiệp & Hệ Điều Hành Ngân Khố', n2: 'Giải Pháp B2B: API Quyết Toán Toàn Cầu Hợp Nhất', n3: 'Nâng Cấp Bảo Mật: Tăng Cường Phân Mảnh Private Key' },
    download_drawer: {
      select_title: 'Tải Ứng Dụng',
      select_subtitle: 'Chọn nền tảng của bạn',
      ios_tip: 'Mẹo: Nếu không tìm thấy, vui lòng chuyển vùng App Store sang Global (US/SG).',
      android_rec: 'Khuyên dùng Google Play để tự động cập nhật',
      btn_back: 'Quay lại',
      btn_confirm: 'Xác nhận'
    },
    admin: {
        studio: {
            market_pulse: 'Market Pulse (Input)',
            visual_engine: 'Visual Engine',
            generate_poster: 'Tạo Poster (Layered)',
            workflow_audit: 'Gửi Duyệt',
            layer_bg: 'Lớp 1: Ảnh Nền',
            layer_mask: 'Lớp 2: Mặt Nạ Thương Hiệu',
            layer_text: 'Lớp 3: Typography',
            topic_select: 'Chọn Chủ Đề Này'
        }
    }
  },
  TH: {
    nav: { ecosystem: 'เครือข่าย', features: 'โซลูชัน', insights: 'ข้อมูลเชิงลึก', developers: 'นักพัฒนา', faq: 'ซัพพอร์ต', download: 'ดาวน์โหลด', community: 'คอมมูนิตี้', back_home: 'หน้าหลัก' },
    hero: {
      title_line1: 'เครือข่ายการชำระดุล', title_line2: 'ระดับโลกยุคใหม่',
      subtitle: 'สถาปัตยกรรมทางการเงินแบบไฮบริดบนโครงสร้างพื้นฐานบล็อกเชน ให้การเคลื่อนย้ายสินทรัพย์ข้ามพรมแดนลื่นไหลไร้แรงเสียดทาน',
      cta_start: 'เริ่มต้นใช้งาน', cta_contact: 'ติดต่อฝ่ายธุรกิจ',
      card_holder: 'ผู้ถือบัตร', card_level: 'BUSINESS ELITE'
    },
    stats: { coverage: 'ตลาดทั่วโลก', clearance: 'ระยะเวลาชำระดุล', accounts: 'บัญชีสกุลเงินท้องถิ่น' },
    ecosystem: { title: 'สภาพคล่องสูงจากสถาบันการเงินระดับ Tier-1', description: 'เชื่อมต่อโดยตรงกับธนาคารศูนย์กลางเงินตราต่างประเทศและระบบชำระเงินท้องถิ่น (Local Rails)' },
    compliance: { title: 'มาตรฐานสากล การปฏิบัติตามกฎระเบียบ', description: 'ตรวจสอบเส้นทางธุรกรรมได้แบบ Bank-grade และโปรโตคอลความปลอดภัยเพื่อความสมบูรณ์ของสินทรัพย์', certified: 'รับรอง', standard: 'มาตรฐาน', security: 'ความปลอดภัย', license: 'ใบอนุญาต' },
    features: {
      title: 'โครงสร้างพื้นฐานทางการเงินแบบ Full-Stack', description: 'ระบบชำระเงินที่ไร้รอยต่อสำหรับองค์กรยุคใหม่และผู้ใช้งานดิจิทัล',
      card1_title: 'การชำระดุลไร้พรมแดน', card1_desc: 'ทลายกำแพงทางภูมิศาสตร์ เคลื่อนย้ายเงินทุนทันทีผ่าน 150+ เขตอำนาจรัฐ',
      card2_title: 'FX ที่โปร่งใส', card2_desc: 'Smart Routing Engine ประมวลผลด้วยอัตราแลกเปลี่ยนระหว่างธนาคาร (Interbank Rates) ไม่มีค่าธรรมเนียมแอบแฝง',
      card3_title: 'การดูแลสินทรัพย์ระดับสถาบัน', card3_desc: 'กระเป๋าเงิน MPC สำหรับองค์กรพร้อมเทคโนโลยี Private Key Sharding และระบบธรรมาภิบาล'
    },
    lifestyle: {
      tag: 'ไลฟ์สไตล์ Web3', title_line1: 'ทำงานใน Web3', title_line2: 'ใช้ชีวิตในโลกจริง',
      description: 'ไม่ว่าคุณจะเป็น Digital Nomad ในบาหลี หรือผู้ค้าในอี้หวู่ PAIPAY ขจัดความซับซ้อนทางเทคนิค ไม่มีความยุ่งยาก On-chain',
      check1: 'ทางด่วนแลกเปลี่ยน Fiat-Crypto ทันที', check2: 'ใช้จ่ายทั่วโลกผ่าน Virtual Cards',
      app_received: 'ได้รับชำระเงิน', app_balance: 'มูลค่าสินทรัพย์รวม', app_activity: 'ธุรกรรมล่าสุด'
    },
    insights: { 
      title: 'ข้อมูลตลาดเชิงลึก', 
      description: 'วิเคราะห์กระแสเงินทุนและแนวโน้ม FX แบบเรียลไทม์', 
      notice_title: 'ประกาศระบบ',
      notice_description: 'สถานะแพลตฟอร์ม กำหนดการบำรุงรักษา และฟีเจอร์ใหม่',
      tab_market: 'ข้อมูลตลาด', 
      tab_notice: 'สถานะระบบ', 
      chart_title: 'มูลค่าตลาดคริปโต',
      view_all: 'ดูทั้งหมด',
      read_more: 'อ่านเพิ่มเติม',
      market_items: commonContent.en_market,
      notice_items: commonContent.en_notice,
      categories: {
        market: { all: 'ทั้งหมด', analysis: 'วิเคราะห์', trend: 'แนวโน้ม', report: 'รายงาน' },
        notice: { all: 'ทั้งหมด', system: 'ระบบ', maintenance: 'บำรุงรักษา', feature: 'ฟีเจอร์' }
      }
    },
    developers: { title: 'เขียนโปรแกรมการเงินด้วยโค้ด', description: 'API ที่ออกแบบมาเพื่อการชำระดุลความถี่สูง (High-Frequency) ติดตั้งง่าย ขยายสเกลได้ทันที', cta: 'อ่านเอกสาร API' },
    faq: {
      title: 'คำถามที่พบบ่อย', description: 'ข้อมูลเทคนิค การปฏิบัติตามกฎ และผลิตภัณฑ์',
      q1: 'รองรับประเทศและสกุลเงินใดบ้าง?', a1: 'PAIPAY ให้บริการใน 150+ ตลาด รองรับ 100+ สกุลเงินท้องถิ่นและสินทรัพย์ดิจิทัลหลัก',
      q2: 'รับประกันความปลอดภัยของสินทรัพย์อย่างไร?', a2: 'เราใช้โครงสร้างพื้นฐานมาตรฐาน ISO 27001 และเทคโนโลยี MPC สินทรัพย์ถูกแยกบัญชีและตรวจสอบอย่างสมบูรณ์',
      q3: 'ใช้เวลาเชื่อมต่อ API นานเท่าไหร่?', a3: 'Production Keys สามารถออกได้ภายใน 1-3 วันทำการหลังผ่านการตรวจสอบ',
      q4: 'ราคา FX กำหนดอย่างไร?', a4: 'เราให้อัตราแลกเปลี่ยนระหว่างธนาคารแบบเรียลไทม์ พร้อมโครงสร้างค่าธรรมเนียมที่โปร่งใส',
      q5: 'รองรับบัญชีบุคคลธรรมดาหรือไม่?', a5: 'ได้ เรามีทั้งบัญชีบริหารความมั่งคั่งส่วนบุคคลและโซลูชันสำหรับองค์กร'
    },
    footer: { ready: 'พร้อมยกระดับ Stack ทางการเงินของคุณหรือยัง?', rights: 'สงวนลิขสิทธิ์', privacy: 'นโยบายความเป็นส่วนตัว', terms: 'เงื่อนไขการใช้บริการ', compliance: 'การปฏิบัติตามกฎ' },
    notices: { n1: 'ใหม่: Enterprise MPC Wallet & ระบบบริหารเงินสด', n2: 'B2B Rails: API การชำระดุลระดับโลก', n3: 'อัปเดตความปลอดภัย: เพิ่มประสิทธิภาพ Private Key Sharding' },
    download_drawer: {
      select_title: 'ดาวน์โหลดแอป',
      select_subtitle: 'เลือกแพลตฟอร์มของคุณ',
      ios_tip: 'คำแนะนำ: หากไม่พบในร้านค้าท้องถิ่น โปรดเปลี่ยนภูมิภาคเป็น Global (US/SG)',
      android_rec: 'แนะนำให้ใช้ Google Play เพื่อการอัปเดตอัตโนมัติ',
      btn_back: 'ย้อนกลับ',
      btn_confirm: 'ยืนยัน'
    },
    admin: {
        studio: {
            market_pulse: 'Market Pulse (Input)',
            visual_engine: 'Visual Engine',
            generate_poster: 'Generate Poster',
            workflow_audit: 'Submit Audit',
            layer_bg: 'Layer 1: Background',
            layer_mask: 'Layer 2: Mask',
            layer_text: 'Layer 3: Text',
            topic_select: 'Select'
        }
    }
  },
  KH: {
    nav: { ecosystem: 'ប្រព័ន្ធបណ្តាញ', features: 'ដំណោះស្រាយ', insights: 'ព័ត៌មានទីផ្សារ', developers: 'អ្នកអភិវឌ្ឍន៍', faq: 'ជំនួយ', download: 'ទាញយក', community: 'សហគមន៍', back_home: 'ត្រឡប់ទៅដើម' },
    hero: {
      title_line1: 'បណ្តាញទូទាត់សាច់ប្រាក់', title_line2: 'សកលជំនាន់ថ្មី',
      subtitle: 'ស្ថាបត្យកម្មហិរញ្ញវត្ថុចម្រុះ (Hybrid) លើហេដ្ឋារចនាសម្ព័ន្ធ Blockchain ។ លំហូរទ្រព្យសកម្មឆ្លងដែនដោយរលូនឥតខ្ចោះ។',
      cta_start: 'ចាប់ផ្តើម', cta_contact: 'ទាក់ទងផ្នែកលក់',
      card_holder: 'ម្ចាស់ប័ណ្ណ', card_level: 'ធុរកិច្ច'
    },
    stats: { coverage: 'ទីផ្សារសកល', clearance: 'រយៈពេលទូទាត់', accounts: 'គណនីរូបិយប័ណ្ណ' },
    ecosystem: { title: 'សាច់ប្រាក់ងាយស្រួលពីស្ថាប័នហិរញ្ញវត្ថុធំៗ', description: 'ការតភ្ជាប់ដោយផ្ទាល់ជាមួយធនាគារកណ្តាលអន្តរជាតិ និងប្រព័ន្ធទូទាត់ក្នុងស្រុក (Local Rails) ។' },
    compliance: { title: 'ស្តង់ដារសកល អធិបតេយ្យភាពនៃច្បាប់', description: 'រាល់ប្រតិបត្តិការត្រូវបានការពារដោយប្រព័ន្ធសុវត្ថិភាពកម្រិតធនាគារ និងមានសវនកម្មច្បាស់លាស់។', certified: 'បញ្ជាក់', standard: 'ស្តង់ដារ', security: 'សុវត្ថិភាព', license: 'អាជ្ញាប័ណ្ណ' },
    features: {
      title: 'ហេដ្ឋារចនាសម្ព័ន្ធហិរញ្ញវត្ថុពេញលេញ', description: 'ប្រព័ន្ធទូទាត់ប្រាក់ដែលមិនមានការរំខានសម្រាប់សហគ្រាសទំនើប។',
      card1_title: 'ការទូទាត់គ្មានព្រំដែន', card1_desc: 'លុបបំបាត់របាំងភូមិសាស្ត្រ។ ផ្ទេរមូលនិធិភ្លាមៗឆ្លងកាត់ ១៥០+ ប្រទេស។',
      card2_title: 'អត្រាប្តូរប្រាក់តម្លាភាព (FX)', card2_desc: 'ម៉ាស៊ីនកំណត់ផ្លូវឆ្លាតវៃផ្តល់អត្រាទីផ្សារអន្តរធនាគារ។ គ្មានកម្រៃជើងសារលាក់កំបាំង។',
      card3_title: 'ការគ្រប់គ្រងទ្រព្យសកម្មស្ថាប័ន', card3_desc: 'កាបូប MPC សម្រាប់សហគ្រាស និងបច្ចេកវិទ្យា Private Key Sharding ។ ការគ្រប់គ្រងរតនាគារ។'
    },
    lifestyle: {
      tag: 'របៀបរស់នៅ Web3', title_line1: 'ធ្វើការក្នុង Web3', title_line2: 'រស់នៅក្នុងការពិត',
      description: 'មិនថាអ្នកនៅ Bali ឬ Yiwu, PAIPAY ធ្វើឱ្យបច្ចេកវិទ្យាក្លាយជារឿងសាមញ្ញ។ គ្មានការរំខាន On-chain ។',
      check1: 'ច្រកប្តូរ Fiat-Crypto ភ្លាមៗ', check2: 'ការចាយវាយសកលតាមរយៈកាតនិម្មិត',
      app_received: 'បានទទួលការទូទាត់', app_balance: 'តម្លៃទ្រព្យសរុប', app_activity: 'ប្រតិបត្តិការថ្មីៗ'
    },
    insights: { 
      title: 'ការយល់ដឹងអំពីទីផ្សារ', 
      description: 'ការវិភាគលំហូរមូលធន និងនិន្នាការ FX ជាក់ស្តែង។', 
      notice_title: 'សេចក្តីជូនដំណឹងប្រព័ន្ធ',
      notice_description: 'ស្ថានភាពវេទិកា កាលវិភាគថែទាំ និងលក្ខណៈពិសេសថ្មី។',
      tab_market: 'ទិន្នន័យ', 
      tab_notice: 'ស្ថានភាពប្រព័ន្ធ', 
      chart_title: 'មូលធនូបនីយកម្ម Crypto',
      view_all: 'មើល​ទាំងអស់',
      read_more: 'អានបន្ថែម',
      market_items: commonContent.en_market,
      notice_items: commonContent.en_notice,
      categories: {
        market: { all: 'ទាំងអស់', analysis: 'ការវិភាគ', trend: 'និន្នាការ', report: 'របាយការណ៍' },
        notice: { all: 'ទាំងអស់', system: 'ប្រព័ន្ធ', maintenance: 'ថែទាំ', feature: 'លក្ខណៈពិសេស' }
      }
    },
    developers: { title: 'បង្កើតប្រព័ន្ធហិរញ្ញវត្ថុដោយកូដ', description: 'API ដែលរចនាឡើងសម្រាប់ការទូទាត់ប្រាក់កម្រិតខ្ពស់។ ភ្ជាប់ក្នុងរយៈពេលប៉ុន្មាននាទី។', cta: 'អានឯកសារ API' },
    faq: {
      title: 'សំណួរដែលសួរញឹកញាប់', description: 'ជំនួយបច្ចេកទេស និងផលិតផល។',
      q1: 'តើគាំទ្រប្រទេសនិងរូបិយប័ណ្ណណាខ្លះ?', a1: 'PAIPAY ប្រតិបត្តិការក្នុង ១៥០+ ទីផ្សារ គាំទ្ររូបិយប័ណ្ណ ១០០+ និងទ្រព្យសកម្មឌីជីថល។',
      q2: 'តើសុវត្ថិភាពទ្រព្យសកម្មត្រូវបានធានាយ៉ាងដូចម្តេច?', a2: 'យើងប្រើប្រាស់ហេដ្ឋារចនាសម្ព័ន្ធស្តង់ដារ ISO 27001 និងបច្ចេកវិទ្យា MPC ។',
      q3: 'តើការភ្ជាប់ API ត្រូវការពេលប៉ុន្មាន?', a3: 'កូនសោ Production អាចចេញក្នុងរយៈពេល ១-៣ ថ្ងៃធ្វើការ។',
      q4: 'តើអត្រា FX ត្រូវបានកំណត់យ៉ាងដូចម្តេច?', a4: 'យើងផ្តល់អត្រាអន្តរធនាគារជាក់ស្តែងជាមួយនឹងរចនាសម្ព័ន្ធថ្លៃសេវាច្បាស់លាស់។',
      q5: 'តើអ្នកគាំទ្រគណនីបុគ្គលទេ?', a5: 'បាទ យើងផ្តល់ជូនទាំងគណនីផ្ទាល់ខ្លួន និងដំណោះស្រាយរតនាគារសហគ្រាស។'
    },
    footer: { ready: 'ត្រៀមខ្លួនដើម្បីបង្កើនបទពិសោធន៍ហិរញ្ញវត្ថុរបស់អ្នកឬនៅ?', rights: 'រក្សាសិទ្ធិគ្រប់យ៉ាង។', privacy: 'គោលការណ៍​ឯកជនភាព', terms: 'លក្ខខណ្ឌសេវាកម្ម', compliance: 'ការអនុលោមតាមច្បាប់' },
    notices: { n1: 'ថ្មី៖ កាបូប MPC សហគ្រាស & ប្រព័ន្ធរតនាគារ', n2: 'B2B Rails៖ API ទូទាត់សកលរួមបញ្ចូលគ្នា', n3: 'បច្ចុប្បន្នភាពសុវត្ថិភាព៖ ការពង្រឹង Private Key Sharding' },
    download_drawer: {
      select_title: 'ទាញយកកម្មវិធី',
      select_subtitle: 'ជ្រើសរើសវេទិការបស់អ្នក។',
      ios_tip: 'ជំនួយ៖ ប្រសិនបើមិនមាននៅក្នុងហាងក្នុងស្រុក សូមប្តូរទៅតំបន់ Global (US/SG) ។',
      android_rec: 'ណែនាំឱ្យប្រើ Google Play សម្រាប់ការធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ',
      btn_back: 'ត្រឡប់ក្រោយ',
      btn_confirm: 'បញ្ជាក់'
    },
    admin: {
        studio: {
            market_pulse: 'Market Pulse',
            visual_engine: 'Visual Engine',
            generate_poster: 'Generate Poster',
            workflow_audit: 'Submit Audit',
            layer_bg: 'Layer 1: BG',
            layer_mask: 'Layer 2: Mask',
            layer_text: 'Layer 3: Text',
            topic_select: 'Select'
        }
    }
  }
};

const LanguageContext = createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations['CN'];
}>({
  lang: 'CN',
  setLang: () => {},
  t: translations.CN,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('CN');

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
