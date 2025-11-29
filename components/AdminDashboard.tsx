import React, { useState, useEffect } from 'react';
import { generateArticleContent } from '../lib/gemini';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MarketCategory, NoticeCategory } from './LanguageContext';

interface AdminDashboardProps {
  onLogout: () => void;
}

type WorkflowStep = 'idea' | 'ai_gen' | 'review' | 'published';
type ContentStream = 'market' | 'notice';

interface ArticleState {
    title: string;
    content: string;
    raw_source: string;
    slug: string;
    meta_desc: string;
    category: MarketCategory | NoticeCategory;
    tag: string;
    language: string;
    workflow_step: WorkflowStep;
}

// Available categories map for dropdowns
const CATEGORY_MAP = {
    market: ['analysis', 'trend', 'report'] as MarketCategory[],
    notice: ['system', 'maintenance', 'feature'] as NoticeCategory[]
};

// --- Simple Toast ---
const Toast: React.FC<{ message: string; show: boolean; onClose: () => void; type?: 'success' | 'error' | 'loading' }> = ({ message, show, onClose, type = 'success' }) => {
    useEffect(() => {
        if (show && type !== 'loading') {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose, type]);

    if (!show) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in-up">
            <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border min-w-[300px] ${
                type === 'success' ? 'bg-gray-900 text-white border-gray-800' : 
                type === 'error' ? 'bg-white text-red-600 border-red-100' : 
                'bg-blue-600 text-white border-blue-500'
            }`}>
                {type === 'loading' ? (
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <i className={type === 'success' ? "ri-check-line" : "ri-error-warning-line"}></i>
                )}
                <span className="font-bold text-sm">{message}</span>
            </div>
        </div>
    );
};

// --- Main Component ---
const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [toast, setToast] = useState({ msg: '', show: false, type: 'success' as 'success' | 'error' | 'loading' });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('Loading...');

  // --- Content Studio State ---
  const [stream, setStream] = useState<ContentStream>('market');
  
  const [article, setArticle] = useState<ArticleState>({ 
      title: '',
      content: '',
      raw_source: '',
      slug: '',
      meta_desc: '',
      category: 'analysis', // Default valid category
      tag: 'UPDATE',
      language: 'CN',
      workflow_step: 'idea'
  });

  const [aiGenerating, setAiGenerating] = useState(false);

  // Update category default when stream changes
  useEffect(() => {
      setArticle(prev => ({
          ...prev,
          category: CATEGORY_MAP[stream][0] // Default to first valid category for new stream
      }));
  }, [stream]);

  useEffect(() => {
    const getUser = async () => {
        if (!isSupabaseConfigured) {
             setCurrentUserEmail('Offline Admin');
             return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserEmail(user?.email || 'Admin');
    };
    getUser();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'loading' = 'success') => {
      setToast({ msg, show: true, type });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const handleAiGenerate = async () => {
      if (!article.raw_source) {
          showToast('Please enter raw content first.', 'error');
          return;
      }

      setAiGenerating(true);
      showToast('Generating content with Gemini 2.5...', 'loading');
      setArticle(prev => ({ ...prev, workflow_step: 'ai_gen' }));
      
      try {
        const generatedData = await generateArticleContent(
          article.raw_source,
          'Professional and authoritative',
          article.language,
          article.category
        );

        if (!generatedData) throw new Error("No data generated");

        setArticle(prev => ({
          ...prev,
          title: generatedData.title,
          slug: generatedData.slug,
          meta_desc: generatedData.meta_desc,
          content: generatedData.content,
          workflow_step: 'review'
        }));
        
        showToast('Content generated successfully', 'success');
      } catch (error: any) {
        console.error(error);
        showToast(`Generation failed: ${error.message}`, 'error');
        setArticle(prev => ({ ...prev, workflow_step: 'idea' }));
      } finally {
        setAiGenerating(false);
      }
  };

  const handlePublish = async () => {
      if (!isSupabaseConfigured) {
           showToast('Supabase not configured.', 'error');
           return;
      }

      showToast('Publishing to database...', 'loading');
      
      try {
        const { error } = await supabase.from('articles').insert([{
            title: article.title,
            slug: article.slug,
            content: article.content,
            meta_desc: article.meta_desc,
            category: article.category,
            language: article.language,
            stream: stream,
            tag: article.tag,
            author: currentUserEmail
        }]);

        if (error) throw error;

        setArticle(prev => ({ ...prev, workflow_step: 'published' }));
        showToast('Published successfully!', 'success');
      } catch (e: any) {
        showToast(`Publish failed: ${e.message}`, 'error');
      }
  };

  const handleReset = () => {
      setArticle({ 
        title: '', 
        content: '', 
        raw_source: '', 
        slug: '', 
        meta_desc: '', 
        category: CATEGORY_MAP[stream][0], 
        tag: 'UPDATE', 
        language: 'CN', 
        workflow_step: 'idea' 
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
          <div className="p-6 border-b border-gray-800 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">P</div>
               <span className="font-bold text-lg">Admin OS</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20">
                  <i className="ri-edit-circle-line"></i> Content Studio
              </button>
          </nav>
          <div className="p-4 bg-gray-800">
              <div className="text-xs text-gray-400 mb-1">Signed in as</div>
              <div className="text-sm font-bold truncate mb-3">{currentUserEmail}</div>
              <button onClick={handleLogout} className="text-xs text-red-400 hover:text-white flex items-center gap-1">
                  <i className="ri-logout-box-line"></i> Sign Out
              </button>
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
         <div className="animate-fade-in space-y-8">
             <div className="flex justify-between items-center">
                 <div>
                     <h1 className="text-3xl font-bold text-gray-900">Content Studio</h1>
                     <p className="text-gray-500">AI-driven content pipeline</p>
                 </div>
                 <button 
                    onClick={handleReset}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 text-gray-700 shadow-sm"
                 >
                    Reset / New
                 </button>
             </div>

             {/* Workflow Steps Visual */}
             <div className="flex items-center gap-4 text-sm font-medium text-gray-400 border-b border-gray-200 pb-6">
                {['idea', 'ai_gen', 'review', 'published'].map((step, i) => (
                    <div key={step} className={`flex items-center gap-2 ${article.workflow_step === step ? 'text-blue-600' : ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${article.workflow_step === step ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                            {i + 1}
                        </span>
                        <span className="capitalize">{step.replace('_', ' ')}</span>
                        {i < 3 && <span className="text-gray-300">/</span>}
                    </div>
                ))}
             </div>

             {/* Step 1: Input */}
             <div className={`space-y-6 ${article.workflow_step === 'published' ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-500 uppercase">Stream</label>
                         <div className="flex p-1 bg-gray-200 rounded-lg">
                             {['market', 'notice'].map(s => (
                                 <button 
                                    key={s}
                                    onClick={() => setStream(s as ContentStream)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md capitalize transition-all ${stream === s ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
                                 >
                                    {s}
                                 </button>
                             ))}
                         </div>
                    </div>
                    
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                         <div className="relative">
                            <select 
                                value={article.category}
                                onChange={e => setArticle({...article, category: e.target.value as any})}
                                className="w-full h-[42px] px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {CATEGORY_MAP[stream].map(cat => (
                                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                ))}
                            </select>
                            <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                         </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-500 uppercase">Language</label>
                         <div className="relative">
                             <select 
                                value={article.language}
                                onChange={e => setArticle({...article, language: e.target.value})}
                                className="w-full h-[42px] px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                             >
                                 <option value="CN">Chinese (CN)</option>
                                 <option value="EN">English (EN)</option>
                                 <option value="VN">Vietnamese (VN)</option>
                             </select>
                             <i className="ri-global-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                         </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Raw Input / Topic</label>
                    <textarea 
                        value={article.raw_source}
                        onChange={e => setArticle({...article, raw_source: e.target.value})}
                        className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none text-sm"
                        placeholder="Paste raw text, news snippet, or rough notes here..."
                    ></textarea>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="space-y-1">
                             <label className="text-[10px] font-bold text-gray-400 uppercase">Tag (Badge)</label>
                             <input 
                                value={article.tag} 
                                onChange={(e) => setArticle({...article, tag: e.target.value})}
                                className="h-10 px-3 rounded-lg border border-gray-200 text-sm font-bold w-32"
                             />
                        </div>
                    </div>
                    <button 
                        onClick={handleAiGenerate}
                        disabled={aiGenerating || article.workflow_step === 'published'}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {aiGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>
                </div>
             </div>

             {/* Step 2: Review & Publish */}
             {article.workflow_step === 'review' && (
                 <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-xl shadow-blue-50/50 animate-fade-in-up">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="font-bold text-gray-900">Review Draft</h3>
                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">AI Generated</span>
                     </div>
                     
                     <div className="space-y-4">
                         <div>
                             <label className="text-xs font-bold text-gray-400">Title</label>
                             <input 
                                value={article.title}
                                onChange={e => setArticle({...article, title: e.target.value})}
                                className="w-full font-bold text-xl text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-blue-500 outline-none py-1"
                             />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-gray-400">Content (HTML)</label>
                             <textarea 
                                value={article.content}
                                onChange={e => setArticle({...article, content: e.target.value})}
                                className="w-full h-64 p-3 bg-gray-50 rounded-lg text-sm font-mono text-gray-600 border border-transparent focus:bg-white focus:border-blue-300 outline-none"
                             />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400">Meta Desc</label>
                                <input 
                                    value={article.meta_desc}
                                    onChange={e => setArticle({...article, meta_desc: e.target.value})}
                                    className="w-full p-2 border-b border-gray-200 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400">Slug</label>
                                <input 
                                    value={article.slug}
                                    onChange={e => setArticle({...article, slug: e.target.value})}
                                    className="w-full p-2 border-b border-gray-200 text-sm text-gray-500"
                                />
                            </div>
                         </div>
                     </div>

                     <div className="mt-8 flex justify-end gap-3">
                         <button onClick={() => setArticle({...article, workflow_step: 'idea'})} className="px-6 py-2 text-gray-500 font-bold text-sm hover:text-gray-900">
                             Discard
                         </button>
                         <button 
                            onClick={handlePublish}
                            className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                         >
                             <i className="ri-upload-cloud-2-line"></i> Publish to Supabase
                         </button>
                     </div>
                 </div>
             )}

             {/* Step 3: Success */}
             {article.workflow_step === 'published' && (
                 <div className="p-10 text-center bg-green-50 rounded-2xl border border-green-100 animate-fade-in">
                     <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                         <i className="ri-check-line"></i>
                     </div>
                     <h3 className="text-2xl font-bold text-green-900 mb-2">Published Successfully!</h3>
                     <p className="text-green-700 mb-8">The article is now live on the {stream} hub.</p>
                     <button 
                        onClick={handleReset}
                        className="px-6 py-3 bg-white text-green-700 font-bold rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-all"
                     >
                         Create Another
                     </button>
                 </div>
             )}
         </div>
      </main>
    </div>
  );
};

export default AdminDashboard;