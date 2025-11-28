import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'EN' | 'CN' | 'VN' | 'TH' | 'KH';

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
      tab_market: string;
      tab_notice: string;
      chart_title: string;
    };
    developers: {
      title: string;
      description: string;
      cta: string;
    };
    faq: {
      title: string;
      description: string;
      q1: string; a1: string;
      q2: string; a2: string;
      q3: string; a3: string;
      q4: string; a4: string;
      q5: string; a5: string;
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
    }
  };
}

const translations: Translations = {
  EN: {
    nav: { ecosystem: 'Ecosystem', features: 'Solutions', insights: 'Insights', developers: 'Developers', faq: 'FAQ', download: 'Download App', community: 'Join Community' },
    hero: {
      title_line1: 'Next Gen Global', title_line2: 'Clearing Network',
      subtitle: 'Blockchain-based hybrid financial architecture. Enabling frictionless cross-border asset liquidity.',
      cta_start: 'Get Started', cta_contact: 'Contact Sales',
      card_holder: 'CARD HOLDER', card_level: 'BUSINESS ELITE'
    },
    stats: { coverage: 'Countries', clearance: 'Settlement', accounts: 'Native Currencies' },
    ecosystem: { title: 'Liquidity Backed by Top Tier Institutions', description: 'Connecting global tier-1 banks, local clearing rails, and card schemes.' },
    compliance: { title: 'Global Standards, Sovereign Compliance', description: 'Every transaction is audited and protected by bank-grade security protocols.', certified: 'Certified', standard: 'Standard', security: 'Security', license: 'License' },
    features: {
      title: 'Full-Stack Financial Solutions', description: 'Seamless payment experience for individuals and enterprises.',
      card1_title: 'Borderless Payments', card1_desc: 'Break geographical boundaries. Instant fund movement across 150+ countries via direct local clearing rails.',
      card2_title: 'Transparent FX', card2_desc: 'Smart routing engine finds the best global rates. Zero hidden fees, clear cost structure.',
      card3_title: 'Sovereign Security', card3_desc: 'Enterprise multi-sig wallets with private key sharding. Absolute asset sovereignty and governance.'
    },
    lifestyle: {
      tag: 'Lifestyle Integration', title_line1: 'Work in Web3', title_line2: 'Live in Reality',
      description: 'Whether you are a nomad in Bali or a merchant in Yiwu, PAIPAY removes technical friction. No complex on-chain ops, just the sound of funds arriving.',
      check1: 'Seamless Fiat-Crypto Swap', check2: 'Global Visa/Mastercard Spending',
      app_received: 'Payment Received', app_balance: 'Total Balance', app_activity: 'Recent Activity'
    },
    insights: { title: 'Market Intelligence', description: 'Real-time crypto assets and FX flow trends.', tab_market: 'Market Data', tab_notice: 'System Notice', chart_title: 'Global Crypto Cap' },
    developers: { title: 'Connect the World in Lines of Code', description: 'Minimalist API designed for speed. Integration in minutes.', cta: 'View API Docs' },
    faq: {
      title: 'Frequently Asked Questions', description: 'Answers about product, security, and integration.',
      q1: 'Supported countries and currencies?', a1: 'PAIPAY covers 150+ countries, supporting 100+ native fiat currencies and major crypto assets.',
      q2: 'How is fund security guaranteed?', a2: 'We use ISO 27001 standards and hold PCI-DSS L1. Assets are managed via multi-sig and private key sharding.',
      q3: 'Integration time for API?', a3: 'Typically 1-3 days for sandbox testing and production deployment.',
      q4: 'What are the FX rates?', a4: 'Transparent interbank rates with no hidden markups via our smart routing engine.',
      q5: 'Is it for individuals?', a5: 'Yes, both individuals and enterprises can use PAIPAY.'
    },
    footer: { ready: 'Ready to upgrade your financial experience?', rights: 'All rights reserved.', privacy: 'Privacy Policy', terms: 'Terms of Service', compliance: 'Compliance' },
    notices: { n1: 'New: Enterprise Multi-sig Wallet & Smart Treasury', n2: 'B2B Solutions: One-stop Global Clearing Integration', n3: 'Security Upgrade: Private Key Sharding Technology' }
  },
  CN: {
    nav: { ecosystem: '生态网络', features: '解决方案', insights: '市场脉动', developers: '开发者', faq: '常见问题', download: '下载 App', community: '加入社群' },
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
    insights: { title: '市场情报与深度洞察', description: '掌握全球加密资产与外汇流动趋势。', tab_market: '市场数据', tab_notice: '系统公告', chart_title: '全球数字货币总市值' },
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
    notices: { n1: '全新推出：企业级多签钱包与智能财务系统', n2: 'B2B 解决方案上线：一站式集成全球清算能力', n3: '安全升级：私钥分片技术保障资金绝对主权' }
  },
  VN: {
    nav: { ecosystem: 'Hệ Sinh Thái', features: 'Giải Pháp', insights: 'Thị Trường', developers: 'Lập Trình Viên', faq: 'Hỏi Đáp', download: 'Tải App', community: 'Cộng Đồng' },
    hero: {
      title_line1: 'Mạng Lưới', title_line2: 'Thanh Toán Toàn Cầu',
      subtitle: 'Kiến trúc tài chính lai dựa trên Blockchain. Giúp tài sản kỹ thuật số lưu thông tự nhiên như hơi thở.',
      cta_start: 'Bắt Đầu', cta_contact: 'Liên Hệ Sale',
      card_holder: 'CHỦ THẺ', card_level: 'DOANH NHÂN'
    },
    stats: { coverage: 'Quốc Gia', clearance: 'Thanh Toán', accounts: 'Tiền Tệ Gốc' },
    ecosystem: { title: 'Thanh Khoản Từ Các Định Chế Tài Chính Hàng Đầu', description: 'Kết nối các ngân hàng cấp 1 quốc tế và cổng thanh toán địa phương.' },
    compliance: { title: 'Tiêu Chuẩn Toàn Cầu, Tuân Thủ Tuyệt Đối', description: 'Mọi giao dịch đều được kiểm toán và bảo vệ bởi bảo mật cấp ngân hàng.', certified: 'Chứng Nhận', standard: 'Tiêu Chuẩn', security: 'Bảo Mật', license: 'Giấy Phép' },
    features: {
      title: 'Giải Pháp Tài Chính Toàn Diện', description: 'Trải nghiệm thanh toán liền mạch cho cá nhân và doanh nghiệp.',
      card1_title: 'Thanh Toán Không Biên Giới', card1_desc: 'Xóa bỏ rào cản địa lý. Chuyển tiền tức thì qua 150+ quốc gia.',
      card2_title: 'Tỷ Giá Minh Bạch', card2_desc: 'Công cụ định tuyến thông minh tìm tỷ giá tốt nhất toàn cầu. Không phí ẩn.',
      card3_title: 'Bảo Mật Tuyệt Đối', card3_desc: 'Ví đa chữ ký doanh nghiệp và công nghệ phân mảnh khóa riêng tư (Private Key Sharding).'
    },
    lifestyle: {
      tag: 'Phong Cách Sống', title_line1: 'Làm Việc Web3', title_line2: 'Sống Thực Tế',
      description: 'Dù bạn ở Bali hay Yiwu, PAIPAY loại bỏ mọi rào cản kỹ thuật. Không thao tác on-chain phức tạp.',
      check1: 'Chuyển Đổi Fiat-Crypto Liền Mạch', check2: 'Chi Tiêu Visa/Mastercard Toàn Cầu',
      app_received: 'Đã Nhận Tiền', app_balance: 'Tổng Số Dư', app_activity: 'Hoạt Động'
    },
    insights: { title: 'Thông Tin Thị Trường', description: 'Xu hướng dòng tiền Crypto và FX thời gian thực.', tab_market: 'Dữ Liệu', tab_notice: 'Thông Báo', chart_title: 'Vốn Hóa Crypto Toàn Cầu' },
    developers: { title: 'Kết Nối Thế Giới Bằng Vài Dòng Code', description: 'API tối giản được thiết kế cho tốc độ. Tích hợp trong vài phút.', cta: 'Xem Tài Liệu API' },
    faq: {
      title: 'Câu Hỏi Thường Gặp', description: 'Giải đáp về sản phẩm, bảo mật và tích hợp.',
      q1: 'Hỗ trợ quốc gia và tiền tệ nào?', a1: 'PAIPAY phủ sóng 150+ quốc gia, hỗ trợ 100+ loại tiền tệ fiat và crypto.',
      q2: 'Bảo mật tiền như thế nào?', a2: 'Tiêu chuẩn ISO 27001 và PCI-DSS L1. Quản lý tài sản qua ví đa chữ ký.',
      q3: 'Thời gian tích hợp API?', a3: 'Thường mất 1-3 ngày để kiểm thử sandbox và triển khai.',
      q4: 'Phí chuyển tiền quốc tế?', a4: 'Tỷ giá minh bạch, không phí ẩn thông qua công cụ định tuyến thông minh.',
      q5: 'Cá nhân có được đăng ký không?', a5: 'Có, PAIPAY phục vụ cả cá nhân và doanh nghiệp.'
    },
    footer: { ready: 'Sẵn sàng nâng cấp trải nghiệm tài chính?', rights: 'Mọi quyền được bảo lưu.', privacy: 'Chính Sách', terms: 'Điều Khoản', compliance: 'Tuân Thủ' },
    notices: { n1: 'Mới: Ví Đa Chữ Ký Doanh Nghiệp & Quản Lý Ngân Khố', n2: 'Giải Pháp B2B: Tích Hợp Thanh Toán Toàn Cầu', n3: 'Nâng Cấp Bảo Mật: Công Nghệ Phân Mảnh Khóa Riêng Tư' }
  },
  TH: {
    nav: { ecosystem: 'ระบบนิเวศ', features: 'โซลูชัน', insights: 'ข้อมูลเชิงลึก', developers: 'นักพัฒนา', faq: 'ถาม-ตอบ', download: 'โหลดแอป', community: 'ชุมชน' },
    hero: {
      title_line1: 'เครือข่ายชำระเงิน', title_line2: 'ระดับโลกยุคใหม่',
      subtitle: 'สถาปัตยกรรมทางการเงินแบบไฮบริดบนบล็อกเชน ให้สินทรัพย์ดิจิทัลไหลเวียนอย่างเป็นธรรมชาติ',
      cta_start: 'เริ่มต้นใช้งาน', cta_contact: 'ติดต่อฝ่ายขาย',
      card_holder: 'ผู้ถือบัตร', card_level: 'นักธุรกิจ'
    },
    stats: { coverage: 'ประเทศ', clearance: 'การชำระบัญชี', accounts: 'สกุลเงินท้องถิ่น' },
    ecosystem: { title: 'สภาพคล่องจากสถาบันการเงินชั้นนำ', description: 'เชื่อมต่อธนาคารชั้นนำระดับโลกและระบบชำระเงินท้องถิ่น' },
    compliance: { title: 'มาตรฐานระดับโลก การปฏิบัติตามกฎระเบียบ', description: 'ทุกธุรกรรมได้รับการตรวจสอบและคุ้มครองด้วยความปลอดภัยระดับธนาคาร', certified: 'รับรอง', standard: 'มาตรฐาน', security: 'ความปลอดภัย', license: 'ใบอนุญาต' },
    features: {
      title: 'โซลูชันทางการเงินครบวงจร', description: 'ประสบการณ์การชำระเงินที่ราบรื่นสำหรับบุคคลและองค์กร',
      card1_title: 'การชำระเงินไร้พรมแดน', card1_desc: 'ทำลายกำแพงทางภูมิศาสตร์ โอนเงินทันทีผ่าน 150+ ประเทศ',
      card2_title: 'อัตราแลกเปลี่ยนโปร่งใส', card2_desc: 'ระบบหาเรทที่ดีที่สุดทั่วโลก ไม่มีค่าธรรมเนียมแอบแฝง',
      card3_title: 'ความปลอดภัยสูงสุด', card3_desc: 'กระเป๋าเงิน Multi-sig สำหรับองค์กรและเทคโนโลยี Private Key Sharding'
    },
    lifestyle: {
      tag: 'ไลฟ์สไตล์', title_line1: 'ทำงานใน Web3', title_line2: 'ใช้ชีวิตในโลกจริง',
      description: 'ไม่ว่าคุณจะอยู่ที่บาหลีหรืออี้หวู่ PAIPAY ขจัดความยุ่งยากทางเทคนิค ไม่มีการดำเนินการ on-chain ที่ซับซ้อน',
      check1: 'แลกเปลี่ยน Fiat-Crypto ไร้รอยต่อ', check2: 'ใช้จ่ายผ่าน Visa/Mastercard ทั่วโลก',
      app_received: 'ได้รับเงิน', app_balance: 'ยอดคงเหลือ', app_activity: 'กิจกรรมล่าสุด'
    },
    insights: { title: 'ข้อมูลตลาดเชิงลึก', description: 'แนวโน้มกระแสเงิน Crypto และ FX แบบเรียลไทม์', tab_market: 'ข้อมูลตลาด', tab_notice: 'ประกาศระบบ', chart_title: 'มูลค่าตลาดคริปโต' },
    developers: { title: 'เชื่อมต่อโลกด้วยโค้ดเพียงไม่กี่บรรทัด', description: 'API ที่เรียบง่ายออกแบบมาเพื่อความรวดเร็ว บูรณาการได้ในไม่กี่นาที', cta: 'ดูเอกสาร API' },
    faq: {
      title: 'คำถามที่พบบ่อย', description: 'คำตอบเกี่ยวกับผลิตภัณฑ์ ความปลอดภัย และการเชื่อมต่อ',
      q1: 'รองรับประเทศและสกุลเงินใดบ้าง?', a1: 'PAIPAY ครอบคลุม 150+ ประเทศ รองรับ 100+ สกุลเงินท้องถิ่นและคริปโต',
      q2: 'รับประกันความปลอดภัยของเงินทุนอย่างไร?', a2: 'เราใช้มาตรฐาน ISO 27001 และถือใบอนุญาต PCI-DSS L1',
      q3: 'ใช้เวลาเชื่อมต่อ API นานเท่าไหร่?', a3: 'โดยปกติ 1-3 วันสำหรับการทดสอบ Sandbox และใช้งานจริง',
      q4: 'อัตราค่าธรรมเนียมการโอน?', a4: 'อัตราแลกเปลี่ยนโปร่งใส ไม่มีค่าธรรมเนียมแอบแฝง',
      q5: 'บุคคลธรรมดาสามารถลงทะเบียนได้หรือไม่?', a5: 'ได้ PAIPAY ให้บริการทั้งบุคคลและองค์กร'
    },
    footer: { ready: 'พร้อมยกระดับประสบการณ์ทางการเงินหรือยัง?', rights: 'สงวนลิขสิทธิ์', privacy: 'นโยบาย', terms: 'เงื่อนไข', compliance: 'การปฏิบัติตามกฎ' },
    notices: { n1: 'ใหม่: กระเป๋าเงิน Multi-sig ระดับองค์กร', n2: 'โซลูชัน B2B: บูรณาการการชำระบัญชีทั่วโลก', n3: 'อัปเกรดความปลอดภัย: เทคโนโลยี Private Key Sharding' }
  },
  KH: {
    nav: { ecosystem: 'ប្រព័ន្ធអេកូឡូស៊ី', features: 'ដំណោះស្រាយ', insights: 'ទីផ្សារ', developers: 'អ្នកអភិវឌ្ឍន៍', faq: 'សំណួរ', download: 'ទាញយក', community: 'សហគមន៍' },
    hero: {
      title_line1: 'បណ្តាញទូទាត់សាច់ប្រាក់', title_line2: 'សកលជំនាន់ក្រោយ',
      subtitle: 'ស្ថាបត្យកម្មហិរញ្ញវត្ថុផ្អែកលើ Blockchain ។ អនុញ្ញាតឱ្យទ្រព្យសម្បត្តិឌីជីថលហូរយ៉ាងរលូន។',
      cta_start: 'ចាប់ផ្តើម', cta_contact: 'ទាក់ទង',
      card_holder: 'ម្ចាស់ប័ណ្ណ', card_level: 'ធុរកិច្ច'
    },
    stats: { coverage: 'ប្រទេស', clearance: 'ការទូទាត់', accounts: 'រូបិយប័ណ្ណ' },
    ecosystem: { title: 'គាំទ្រសាច់ប្រាក់ដោយស្ថាប័នហិរញ្ញវត្ថុធំៗ', description: 'តភ្ជាប់ធនាគារលំដាប់ថ្នាក់ទីមួយអន្តរជាតិ និងបណ្តាញទូទាត់ក្នុងស្រុក។' },
    compliance: { title: 'ស្តង់ដារសកល ការអនុលោមតាមច្បាប់', description: 'រាល់ប្រតិបត្តិការត្រូវបានការពារដោយសុវត្ថិភាពកម្រិតធនាគារ។', certified: 'បញ្ជាក់', standard: 'ស្តង់ដារ', security: 'សុវត្ថិភាព', license: 'អាជ្ញាប័ណ្ណ' },
    features: {
      title: 'ដំណោះស្រាយហិរញ្ញវត្ថុពេញលេញ', description: 'បទពិសោធន៍ទូទាត់ប្រាក់ដោយរលូនសម្រាប់បុគ្គល និងអាជីវកម្ម។',
      card1_title: 'ការទូទាត់គ្មានព្រំដែន', card1_desc: 'ផ្លាស់ទីមូលនិធិភ្លាមៗឆ្លងកាត់ ១៥០+ ប្រទេស។',
      card2_title: 'អត្រាប្តូរប្រាក់តម្លាភាព', card2_desc: 'គ្មានថ្លៃសេវាលាក់កំបាំង តាមរយៈម៉ាស៊ីនកំណត់ផ្លូវឆ្លាតវៃ។',
      card3_title: 'សុវត្ថិភាពអធិបតេយ្យ', card3_desc: 'កាបូប Multi-sig សម្រាប់សហគ្រាស និងបច្ចេកវិទ្យា Private Key Sharding។'
    },
    lifestyle: {
      tag: 'របៀបរស់នៅ', title_line1: 'ធ្វើការក្នុង Web3', title_line2: 'រស់នៅក្នុងការពិត',
      description: 'មិនថាអ្នកនៅ Bali ឬ Yiwu, PAIPAY លុបបំបាត់ការលំបាកផ្នែកបច្ចេកទេស។',
      check1: 'ប្តូរ Fiat-Crypto ដោយរលូន', check2: 'ចាយវាយជាមួយ Visa/Mastercard',
      app_received: 'បានទទួលប្រាក់', app_balance: 'សមតុល្យ', app_activity: 'សកម្មភាព'
    },
    insights: { title: 'ការយល់ដឹងអំពីទីផ្សារ', description: 'និន្នាការលំហូរ Crypto និង FX តាមពេលវេលាជាក់ស្តែង។', tab_market: 'ទិន្នន័យ', tab_notice: 'ជូនដំណឹង', chart_title: 'មូលធនូបនីយកម្ម Crypto' },
    developers: { title: 'ភ្ជាប់ពិភពលោកដោយកូដ', description: 'API សាមញ្ញដែលត្រូវបានរចនាឡើងសម្រាប់ល្បឿន។', cta: 'ឯកសារ API' },
    faq: {
      title: 'សំណួរដែលសួរញឹកញាប់', description: 'ចម្លើយអំពីផលិតផល និងសុវត្ថិភាព។',
      q1: 'តើប្រទេសណាខ្លះដែលគាំទ្រ?', a1: 'PAIPAY គ្របដណ្តប់ ១៥០+ ប្រទេស និងគាំទ្ររូបិយប័ណ្ណ ១០០+ ។',
      q2: 'តើប្រាក់មានសុវត្ថិភាពយ៉ាងដូចម្តេច?', a2: 'យើងប្រើស្តង់ដារ ISO 27001 និង PCI-DSS L1 ។',
      q3: 'រយៈពេលនៃការភ្ជាប់ API?', a3: 'ជាធម្មតា ១-៣ ថ្ងៃសម្រាប់ការធ្វើតេស្ត។',
      q4: 'តើអត្រាថ្លៃសេវាប៉ុន្មាន?', a4: 'អត្រាផ្លាស់ប្តូរតម្លាភាព គ្មានការសម្ងាត់។',
      q5: 'តើគាំទ្របុគ្គលដែរឬទេ?', a5: 'បាទ PAIPAY សម្រាប់ទាំងបុគ្គល និងអាជីវកម្ម។'
    },
    footer: { ready: 'ត្រៀមខ្លួនដើម្បីបង្កើនបទពិសោធន៍ហិរញ្ញវត្ថុរបស់អ្នកឬនៅ?', rights: 'រក្សាសិទ្ធិគ្រប់យ៉ាង។', privacy: 'ឯកជនភាព', terms: 'លក្ខខណ្ឌ', compliance: 'ការអនុលោម' },
    notices: { n1: 'ថ្មី៖ កាបូប Multi-sig សហគ្រាស', n2: 'ដំណោះស្រាយ B2B៖ ការទូទាត់សកល', n3: 'សុវត្ថិភាព៖ បច្ចេកវិទ្យា Private Key Sharding' }
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