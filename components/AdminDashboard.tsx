import React, { useState } from 'react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'notices' | 'market_bot' | 'team' | 'settings';
type AdminLang = 'EN' | 'CN' | 'VN';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('notices');
  const [lang, setLang] = useState<AdminLang>('CN'); // Default to Chinese as requested

  // --- Translations ---
  const t = {
    EN: {
      sidebar: {
        brand: 'PAIPAY OS',
        notices: 'System Notices',
        bot: 'Market Bot AI',
        team: 'Team & Roles',
        settings: 'Configuration',
        user: 'Super Admin',
        logout: 'Logout'
      },
      notices: {
        title: 'System Notices',
        subtitle: 'Manage platform announcements and updates.',
        new_btn: 'New Notice',
        col_title: 'Title',
        col_cat: 'Category',
        col_date: 'Date',
        col_status: 'Status',
        col_action: 'Action',
        status_pub: 'Published',
        status_arch: 'Archived'
      },
      bot: {
        title: 'Market Bot AI',
        subtitle: 'Configure API aggregators, AI translation engine, and social broadcasting.',
        stat_processed: 'Articles (24h)',
        stat_success: 'AI Accuracy',
        stat_reach: 'Social Reach',
        section_source: 'News Source API',
        source_desc: 'Connect to global media aggregators instead of raw scraping.',
        key_cryptopanic: 'CryptoPanic API Key',
        key_newsapi: 'NewsAPI Key',
        section_ai: 'Intelligence Engine',
        key_gemini: 'Google Gemini API Key',
        section_social: 'Auto-Broadcast',
        social_fb: 'Facebook Graph Token',
        social_x: 'X (Twitter) API Key',
        social_tg: 'Telegram Bot Token',
        save_btn: 'Save Configuration',
        connected: 'Connected',
        disconnected: 'Disconnected'
      },
      team: {
        title: 'Team & Roles',
        subtitle: 'Manage access and RBAC permissions.',
        invite_btn: 'Invite Member',
        col_user: 'User',
        col_role: 'Role',
        col_2fa: '2FA Status',
        col_status: 'Status',
        status_active: 'Active',
        role_admin: 'Admin',
        role_editor: 'Editor'
      }
    },
    CN: {
      sidebar: {
        brand: 'PAIPAY 中控',
        notices: '系统公告',
        bot: '市场情报机器人',
        team: '团队权限',
        settings: '系统设置',
        user: '超级管理员',
        logout: '登出'
      },
      notices: {
        title: '系统公告管理',
        subtitle: '发布平台通知、维护公告与新功能上线。',
        new_btn: '发布新公告',
        col_title: '标题',
        col_cat: '分类',
        col_date: '日期',
        col_status: '状态',
        col_action: '操作',
        status_pub: '已发布',
        status_arch: '已归档'
      },
      bot: {
        title: '市场情报 AI 机器人',
        subtitle: '配置新闻聚合 API、AI 翻译引擎及社群自动分发。',
        stat_processed: '今日抓取',
        stat_success: 'AI 翻译准确率',
        stat_reach: '社群触达',
        section_source: '新闻源 API 配置',
        source_desc: '对接全球主流媒体聚合器，替代不稳定的网页爬虫。',
        key_cryptopanic: 'CryptoPanic API Key',
        key_newsapi: 'NewsAPI Key',
        section_ai: '智能引擎配置',
        key_gemini: 'Google Gemini API Key',
        section_social: '社群自动分发',
        social_fb: 'Facebook Graph Token',
        social_x: 'X (Twitter) API Key',
        social_tg: 'Telegram Bot Token',
        save_btn: '保存配置',
        connected: '已连接',
        disconnected: '未连接'
      },
      team: {
        title: '团队与权限',
        subtitle: '管理员工账号、角色分配及 2FA 状态。',
        invite_btn: '邀请成员',
        col_user: '用户',
        col_role: '角色',
        col_2fa: '2FA 状态',
        col_status: '账号状态',
        status_active: '正常',
        role_admin: '管理员',
        role_editor: '编辑'
      }
    },
    VN: {
      sidebar: {
        brand: 'PAIPAY OS',
        notices: 'Thông Báo Hệ Thống',
        bot: 'Bot AI Thị Trường',
        team: 'Đội Ngũ & Vai Trò',
        settings: 'Cấu Hình',
        user: 'Quản Trị Viên',
        logout: 'Đăng Xuất'
      },
      notices: {
        title: 'Quản Lý Thông Báo',
        subtitle: 'Quản lý các thông báo nền tảng và cập nhật.',
        new_btn: 'Tạo Thông Báo',
        col_title: 'Tiêu Đề',
        col_cat: 'Danh Mục',
        col_date: 'Ngày',
        col_status: 'Trạng Thái',
        col_action: 'Hành Động',
        status_pub: 'Đã Xuất Bản',
        status_arch: 'Đã Lưu Trữ'
      },
      bot: {
        title: 'Bot AI Thị Trường',
        subtitle: 'Cấu hình bộ tổng hợp API, công cụ dịch AI và phát sóng xã hội.',
        stat_processed: 'Bài Viết (24h)',
        stat_success: 'Độ Chính Xác AI',
        stat_reach: 'Tiếp Cận Xã Hội',
        section_source: 'Nguồn Tin API',
        source_desc: 'Kết nối với các bộ tổng hợp truyền thông toàn cầu thay vì thu thập thô.',
        key_cryptopanic: 'CryptoPanic API Key',
        key_newsapi: 'NewsAPI Key',
        section_ai: 'Công Cụ Trí Tuệ',
        key_gemini: 'Google Gemini API Key',
        section_social: 'Tự Động Phát Sóng',
        social_fb: 'Facebook Graph Token',
        social_x: 'X (Twitter) API Key',
        social_tg: 'Telegram Bot Token',
        save_btn: 'Lưu Cấu Hình',
        connected: 'Đã Kết Nối',
        disconnected: 'Ngắt Kết Nối'
      },
      team: {
        title: 'Đội Ngũ & Vai Trò',
        subtitle: 'Quản lý quyền truy cập và phân quyền RBAC.',
        invite_btn: 'Mời Thành Viên',
        col_user: 'Người Dùng',
        col_role: 'Vai Trò',
        col_2fa: 'Trạng Thái 2FA',
        col_status: 'Trạng Thái',
        status_active: 'Hoạt Động',
        role_admin: 'Quản Trị',
        role_editor: 'Biên Tập'
      }
    }
  };

  const text = t[lang];

  // --- Mock Data ---
  const [team, setTeam] = useState([
    { id: 1, name: 'Alex Chen', email: 'alex@paipay.finance', role: 'admin', status: 'active' },
    { id: 2, name: 'Sarah Jones', email: 'sarah@paipay.finance', role: 'editor', status: 'active' },
  ]);

  // --- Render Functions ---

  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-200">P</div>
                <span className="font-bold text-gray-900 tracking-tight text-lg">{text.sidebar.brand}</span>
            </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
            {[
                { id: 'notices', label: text.sidebar.notices, icon: 'ri-notification-badge-line' },
                { id: 'market_bot', label: text.sidebar.bot, icon: 'ri-robot-2-line' },
                { id: 'team', label: text.sidebar.team, icon: 'ri-team-line' },
                { id: 'settings', label: text.sidebar.settings, icon: 'ri-settings-4-line' },
            ].map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === item.id ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                    <i className={`${item.icon} text-lg`}></i>
                    {item.label}
                </button>
            ))}
        </nav>

        {/* Language Switcher */}
        <div className="px-6 pb-4">
             <div className="flex bg-gray-100 p-1 rounded-lg">
                 {(['EN', 'CN', 'VN'] as AdminLang[]).map((l) => (
                     <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${lang === l ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                     >
                         {l}
                     </button>
                 ))}
             </div>
        </div>

        <div className="p-4 border-t border-gray-50">
            <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold border border-white shadow-sm">AC</div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-xs font-bold text-gray-900 truncate">Alex Chen</div>
                    <div className="text-[10px] text-gray-400">{text.sidebar.user}</div>
                </div>
                <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors" title={text.sidebar.logout}><i className="ri-logout-box-r-line"></i></button>
            </div>
        </div>
    </div>
  );

  const renderNotices = () => (
      <div className="space-y-8 animate-fade-in">
          <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{text.notices.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{text.notices.subtitle}</p>
              </div>
              <button className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 flex items-center gap-2">
                  <i className="ri-add-line text-lg"></i>{text.notices.new_btn}
              </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 bg-gray-50/80 p-5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <div className="col-span-5">{text.notices.col_title}</div>
                  <div className="col-span-2">{text.notices.col_cat}</div>
                  <div className="col-span-2">{text.notices.col_date}</div>
                  <div className="col-span-2">{text.notices.col_status}</div>
                  <div className="col-span-1 text-right">{text.notices.col_action}</div>
              </div>
              {[
                  { title: 'New PromptPay (Thailand) Instant Channel', cat: 'Feature', date: '2h ago', status: 'Published' },
                  { title: 'Solana Node Upgrade Notice', cat: 'Maintenance', date: '1d ago', status: 'Published' },
                  { title: 'API V2.1 Now Available', cat: 'System', date: '3d ago', status: 'Archived' },
              ].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 p-5 items-center border-b border-gray-50 hover:bg-blue-50/10 transition-colors group">
                      <div className="col-span-5 font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{item.title}</div>
                      <div className="col-span-2"><span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[11px] font-bold border border-gray-200">{item.cat}</span></div>
                      <div className="col-span-2 text-xs text-gray-400 font-mono">{item.date}</div>
                      <div className="col-span-2">
                          <span className={`text-[11px] font-bold flex items-center gap-1.5 ${item.status === 'Published' ? 'text-green-600 bg-green-50 px-2 py-0.5 rounded-md w-fit' : 'text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md w-fit'}`}>
                              <i className={`ri-checkbox-circle-fill ${item.status === 'Published' ? 'text-green-500' : 'text-gray-400'}`}></i> 
                              {item.status === 'Published' ? text.notices.status_pub : text.notices.status_arch}
                          </span>
                      </div>
                      <div className="col-span-1 flex gap-2 justify-end">
                          <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all"><i className="ri-pencil-fill"></i></button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderMarketBot = () => (
      <div className="space-y-8 animate-fade-in pb-20">
           <div className="flex justify-between items-end">
              <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{text.bot.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{text.bot.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wide">System Online</span>
                  </div>
              </div>
           </div>

           {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><i className="ri-article-line text-6xl text-blue-600"></i></div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{text.bot.stat_processed}</div>
                    <div className="text-4xl font-bold text-gray-900 tracking-tight">142</div>
                    <div className="text-xs text-green-500 mt-2 flex items-center gap-1 font-bold"><i className="ri-arrow-up-line"></i> 12%</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><i className="ri-translate-2 text-6xl text-purple-600"></i></div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{text.bot.stat_success}</div>
                    <div className="text-4xl font-bold text-gray-900 tracking-tight">99.8%</div>
                    <div className="text-xs text-purple-500 mt-2 flex items-center gap-1 font-bold">Google Gemini Pro</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><i className="ri-share-network-line text-6xl text-orange-600"></i></div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{text.bot.stat_reach}</div>
                    <div className="text-4xl font-bold text-gray-900 tracking-tight">24.5K</div>
                    <div className="text-xs text-orange-500 mt-2 flex items-center gap-1 font-bold">FB / X / TG</div>
                </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* API Config */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg"><i className="ri-rss-fill text-orange-500"></i> {text.bot.section_source}</h3>
                        <p className="text-xs text-gray-400 mb-6">{text.bot.source_desc}</p>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{text.bot.key_cryptopanic}</label>
                                <div className="flex gap-2">
                                    <input type="password" value="************************" readOnly className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono text-gray-500" />
                                    <button className="h-11 px-4 rounded-xl border border-green-200 bg-green-50 text-green-600 text-xs font-bold">{text.bot.connected}</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{text.bot.key_newsapi}</label>
                                <div className="flex gap-2">
                                    <input type="password" placeholder="Enter API Key" className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-white focus:border-blue-500 transition-colors text-sm font-mono" />
                                    <button className="h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-xs font-bold">{text.bot.disconnected}</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg"><i className="ri-brain-line text-purple-600"></i> {text.bot.section_ai}</h3>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{text.bot.key_gemini}</label>
                            <div className="flex gap-2">
                                <input type="password" value="************************" readOnly className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono text-gray-500" />
                                <button className="h-11 px-4 rounded-xl border border-green-200 bg-green-50 text-green-600 text-xs font-bold">{text.bot.connected}</button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">Model: <span className="font-mono text-gray-600">gemini-1.5-pro</span></p>
                        </div>
                    </div>
                </div>

                {/* Social Broadcast Config */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
                     <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg"><i className="ri-share-forward-line text-blue-600"></i> {text.bot.section_social}</h3>
                     
                     <div className="space-y-6 flex-grow">
                         {/* Facebook */}
                         <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all">
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white"><i className="ri-facebook-fill"></i></div>
                                    <span className="text-sm font-bold text-gray-900">Facebook Page</span>
                                </div>
                                <div className="relative inline-block w-10 align-middle select-none">
                                     <div className="w-10 h-5 bg-green-400 rounded-full shadow-inner"></div>
                                     <div className="absolute right-0 top-0 w-5 h-5 bg-white rounded-full shadow-sm border border-gray-200"></div>
                                </div>
                             </div>
                             <input type="password" placeholder={text.bot.social_fb} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs font-mono focus:border-blue-500 outline-none" />
                         </div>

                         {/* Twitter */}
                         <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-all">
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white"><i className="ri-twitter-x-line"></i></div>
                                    <span className="text-sm font-bold text-gray-900">X (Twitter)</span>
                                </div>
                                <div className="relative inline-block w-10 align-middle select-none opacity-50">
                                     <div className="w-10 h-5 bg-gray-300 rounded-full shadow-inner"></div>
                                     <div className="absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow-sm border border-gray-200"></div>
                                </div>
                             </div>
                             <input type="password" placeholder={text.bot.social_x} disabled className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs font-mono bg-gray-100 cursor-not-allowed" />
                         </div>

                         {/* Telegram */}
                         <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-300 transition-all">
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#24A1DE] flex items-center justify-center text-white"><i className="ri-telegram-fill"></i></div>
                                    <span className="text-sm font-bold text-gray-900">Telegram Channel</span>
                                </div>
                                <div className="relative inline-block w-10 align-middle select-none">
                                     <div className="w-10 h-5 bg-green-400 rounded-full shadow-inner"></div>
                                     <div className="absolute right-0 top-0 w-5 h-5 bg-white rounded-full shadow-sm border border-gray-200"></div>
                                </div>
                             </div>
                             <input type="password" placeholder={text.bot.social_tg} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs font-mono focus:border-blue-500 outline-none" />
                         </div>
                     </div>

                     <div className="mt-8">
                         <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl shadow-gray-200 hover:bg-black active:scale-[0.98] transition-all">
                             {text.bot.save_btn}
                         </button>
                     </div>
                </div>
           </div>
      </div>
  );

  const renderTeam = () => (
      <div className="space-y-8 animate-fade-in">
          <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{text.team.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{text.team.subtitle}</p>
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-2">
                  <i className="ri-user-add-line text-lg"></i>{text.team.invite_btn}
              </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
             <div className="grid grid-cols-12 bg-gray-50/80 p-5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <div className="col-span-4">{text.team.col_user}</div>
                  <div className="col-span-3">{text.team.col_role}</div>
                  <div className="col-span-2">{text.team.col_2fa}</div>
                  <div className="col-span-2">{text.team.col_status}</div>
                  <div className="col-span-1 text-right">{text.notices.col_action}</div>
              </div>
              {team.map((member) => (
                  <div key={member.id} className="grid grid-cols-12 p-5 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <div className="col-span-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 shadow-inner">{member.name.substring(0,2).toUpperCase()}</div>
                          <div>
                              <div className="text-sm font-bold text-gray-900">{member.name}</div>
                              <div className="text-xs text-gray-400">{member.email}</div>
                          </div>
                      </div>
                      <div className="col-span-3">
                          <span className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-sm inline-flex items-center gap-2">
                              {member.role === 'admin' ? text.team.role_admin : text.team.role_editor}
                              <i className="ri-arrow-down-s-fill text-gray-300 text-[10px]"></i>
                          </span>
                      </div>
                      <div className="col-span-2">
                           <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-md text-[10px] font-bold uppercase tracking-wide border border-green-100 flex items-center gap-1 w-fit">
                               <i className="ri-shield-check-fill"></i> Enabled
                           </span>
                      </div>
                      <div className="col-span-2">
                          <span className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> {text.team.status_active}
                          </span>
                      </div>
                      <div className="col-span-1 text-right">
                          <button className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"><i className="ri-delete-bin-line"></i></button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-gray-900">
      {renderSidebar()}
      
      <main className="pl-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-10 py-12">
            {activeTab === 'notices' && renderNotices()}
            {activeTab === 'market_bot' && renderMarketBot()}
            {activeTab === 'team' && renderTeam()}
            {activeTab === 'settings' && <div className="text-center py-32 text-gray-400 font-medium">Settings Module Coming Soon</div>}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;