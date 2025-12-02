import React, { useState, useEffect, useRef } from 'react';
import { generateArticleContent, generateVideoContent } from '../utils/gemini';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

interface AdminDashboardProps {
  onLogout: () => void;
}

// ... Types ...
type Tab = 'launchpad' | 'studio' | 'notices' | 'settings';
type WorkflowStep = 'strategy' | 'editor' | 'assets' | 'summary';
type ContentStream = 'market' | 'notice';
type ArticleLength = 'short' | 'medium' | 'long';
type PosterRatio = '1:1' | '16:9' | '9:16';

const PAIPAY_VISUAL_STYLE = "PAIPAY Brand Style: Futuristic Fintech, 3D Isometric View, Clean White Background, Deep Blue (#2563EB) and Cyan (#06B6D4) Accents, High-end Commercial Render.";

// Simple Rich Text Editor
const RichTextEditor: React.FC<{ value: string; onChange: (html: string) => void; className?: string }> = ({ value, onChange, className }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
             if (Math.abs(editorRef.current.innerHTML.length - value.length) > 5) editorRef.current.innerHTML = value;
             if (!editorRef.current.innerHTML) editorRef.current.innerHTML = value;
        }
    }, [value]);
    return (
        <div className={`flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white ${className}`}>
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100">
                <button onClick={() => document.execCommand('bold')} className="p-2 hover:bg-gray-200 rounded"><i className="ri-bold"></i></button>
                <button onClick={() => document.execCommand('italic')} className="p-2 hover:bg-gray-200 rounded"><i className="ri-italic"></i></button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button onClick={() => document.execCommand('formatBlock', false, '<h3>')} className="p-2 text-xs font-bold hover:bg-gray-200 rounded">H3</button>
                <button onClick={() => document.execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded"><i className="ri-list-unordered"></i></button>
            </div>
            <div 
                ref={editorRef} contentEditable 
                className="flex-1 p-4 outline-none min-h-[300px] prose prose-sm max-w-none"
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                onBlur={() => onChange(editorRef.current?.innerHTML || '')}
                dangerouslySetInnerHTML={{ __html: value }} 
            />
        </div>
    );
};

// Toast Notification
const Toast: React.FC<{ message: string; show: boolean; type?: string }> = ({ message, show, type = 'success' }) => (
    <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className={`${type === 'error' ? 'bg-red-600' : (type === 'loading' ? 'bg-blue-600' : 'bg-gray-900')} text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3`}>
             <i className={type === 'loading' ? "ri-loader-4-line animate-spin" : "ri-information-line"}></i>
             <span className="font-bold text-sm">{message}</span>
        </div>
    </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('studio');
  const [toast, setToast] = useState({ msg: '', show: false, type: 'success' });
  
  // Settings
  const [apiKey, setApiKey] = useState('');
  const [brandTone, setBrandTone] = useState('Professional');
  
  // Content State
  const [stream, setStream] = useState<ContentStream>('market');
  const [articleLength, setArticleLength] = useState<ArticleLength>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // The Article Object - Preserved across step changes
  const [currentArticle, setCurrentArticle] = useState({
      title: '',
      content: '', // HTML content
      raw_source: '',
      workflow_step: 'strategy' as WorkflowStep,
      image_prompt: '',
      generated_image: '',
      generated_video: '',
      slug: '',
      meta_desc: '',
      category: 'Analysis',
      tag: 'TREND',
      status: 'Draft'
  });

  const showToast = (msg: string, type: 'success'|'error'|'loading' = 'success') => {
      setToast({ msg, show: true, type });
      if (type !== 'loading') setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // --- AI HANDLERS ---
  const handleGenerate = async () => {
      if (!currentArticle.raw_source) return showToast('Please enter source text', 'error');
      
      setIsGenerating(true);
      showToast('AI Agent is writing...', 'loading');
      
      try {
          const res = await generateArticleContent(
              currentArticle.raw_source,
              brandTone,
              'CN',
              currentArticle.category,
              stream,
              articleLength, // Pass length for strict formatting
              'gemini-2.5-flash',
              apiKey
          );
          
          if (res) {
              const enhancedPrompt = `${PAIPAY_VISUAL_STYLE} Subject: ${res.image_prompt}`;
              setCurrentArticle(prev => ({
                  ...prev,
                  title: res.title,
                  content: res.content,
                  slug: res.slug,
                  meta_desc: res.meta_desc,
                  image_prompt: enhancedPrompt,
                  workflow_step: 'editor' // Auto advance to editor
              }));
              showToast('Draft generated successfully!', 'success');
          } else {
              throw new Error("No response from AI");
          }
      } catch (e: any) {
          showToast(e.message || 'Generation failed', 'error');
      } finally {
          setIsGenerating(false);
      }
  };

  const handlePublish = async () => {
      if (!isSupabaseConfigured) return showToast('Supabase not configured (Demo Mode)', 'error');
      
      showToast('Publishing to database...', 'loading');
      
      const payload = {
          title: currentArticle.title,
          content: currentArticle.content,
          meta_desc: currentArticle.meta_desc,
          image_url: currentArticle.generated_video || currentArticle.generated_image,
          stream: stream,
          category: currentArticle.category,
          tag: currentArticle.tag,
          slug: currentArticle.slug || `post-${Date.now()}`,
          status: 'Published',
          created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('articles').insert([payload]);

      if (error) {
          console.error(error);
          showToast(`Publish failed: ${error.message}`, 'error');
      } else {
          showToast('Published successfully!', 'success');
          setCurrentArticle(prev => ({ ...prev, workflow_step: 'summary' }));
      }
  };

  const handleVideoGen = async () => {
      showToast('Generating Veo Video...', 'loading');
      try {
           // Check for key interaction first
           const aistudio = (window as any).aistudio;
           if (aistudio && !(await aistudio.hasSelectedApiKey())) {
               await aistudio.openSelectKey();
           }
           
           const uri = await generateVideoContent(currentArticle.image_prompt, '16:9', apiKey);
           if (uri) {
               setCurrentArticle(prev => ({ ...prev, generated_video: uri }));
               showToast('Video generated!', 'success');
           }
      } catch (e: any) {
           showToast(e.message, 'error');
      }
  };

  // --- RENDERERS ---

  const renderSidebar = () => (
      <div className="w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">P</div>
              <span className="font-bold text-gray-800">Admin Console</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
              {[
                  { id: 'studio', label: 'Content Studio', icon: 'ri-quill-pen-line' },
                  { id: 'notices', label: 'CMS Management', icon: 'ri-database-2-line' },
                  { id: 'settings', label: 'Settings', icon: 'ri-settings-4-line' }
              ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                      <i className={`${item.icon} text-lg`}></i> {item.label}
                  </button>
              ))}
          </nav>
          <div className="p-4 border-t border-gray-100">
              <button onClick={onLogout} className="w-full flex items-center gap-2 text-red-500 font-bold text-sm px-4 py-2 hover:bg-red-50 rounded-lg transition-colors">
                  <i className="ri-logout-box-line"></i> Logout
              </button>
          </div>
      </div>
  );

  const renderStudio = () => (
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50">
          {/* Workflow Stepper */}
          <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  {['strategy', 'editor', 'assets', 'summary'].map((step, idx) => (
                      <div key={step} className="flex items-center">
                          <div className={`flex items-center gap-2 text-sm font-bold ${currentArticle.workflow_step === step ? 'text-blue-600' : 'text-gray-400'}`}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${currentArticle.workflow_step === step ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>{idx + 1}</span>
                              <span className="uppercase tracking-wider">{step}</span>
                          </div>
                          {idx < 3 && <div className="w-8 h-px bg-gray-200 mx-3"></div>}
                      </div>
                  ))}
              </div>
              <div className="flex gap-2">
                 <button className="px-4 py-2 text-xs font-bold bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600">Save Draft</button>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto">
                  {/* STEP 1: STRATEGY */}
                  {currentArticle.workflow_step === 'strategy' && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in">
                          <h2 className="text-xl font-bold text-gray-900 mb-6">Content Strategy</h2>
                          <div className="grid grid-cols-2 gap-6 mb-6">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stream</label>
                                  <div className="flex bg-gray-50 p-1 rounded-lg">
                                      {['market', 'notice'].map(s => (
                                          <button key={s} onClick={() => setStream(s as ContentStream)} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${stream === s ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>{s.toUpperCase()}</button>
                                      ))}
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Length</label>
                                  <div className="flex bg-gray-50 p-1 rounded-lg">
                                      {['short', 'medium', 'long'].map(l => (
                                          <button key={l} onClick={() => setArticleLength(l as ArticleLength)} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${articleLength === l ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>{l.toUpperCase()}</button>
                                      ))}
                                  </div>
                              </div>
                          </div>
                          
                          <div className="mb-6">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Source Material</label>
                              <textarea 
                                  value={currentArticle.raw_source}
                                  onChange={(e) => setCurrentArticle(prev => ({...prev, raw_source: e.target.value}))}
                                  className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-mono"
                                  placeholder="Paste raw text, URL content, or notes here..."
                              />
                          </div>

                          <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-70"
                          >
                              {isGenerating ? 'AI Processing...' : 'Generate Content Draft'}
                          </button>
                      </div>
                  )}

                  {/* STEP 2: EDITOR */}
                  {currentArticle.workflow_step === 'editor' && (
                      <div className="space-y-6 animate-fade-in">
                          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                              <label className="block text-xs font-bold text-gray-400 mb-2">TITLE</label>
                              <input 
                                  value={currentArticle.title}
                                  onChange={(e) => setCurrentArticle(prev => ({...prev, title: e.target.value}))}
                                  className="w-full text-2xl font-bold border-none p-0 focus:ring-0 placeholder:text-gray-300"
                                  placeholder="Article Title..."
                              />
                          </div>
                          
                          <RichTextEditor 
                              value={currentArticle.content} 
                              onChange={(html) => setCurrentArticle(prev => ({...prev, content: html}))} 
                          />

                          <div className="flex gap-4">
                              <button onClick={() => setCurrentArticle(prev => ({...prev, workflow_step: 'strategy'}))} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">Back</button>
                              <button onClick={() => setCurrentArticle(prev => ({...prev, workflow_step: 'assets'}))} className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700">Next: Assets</button>
                          </div>
                      </div>
                  )}

                  {/* STEP 3: ASSETS */}
                  {currentArticle.workflow_step === 'assets' && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in space-y-8">
                          <div>
                              <h3 className="text-lg font-bold mb-4">Visual Assets</h3>
                              <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 min-h-[300px] flex flex-col items-center justify-center">
                                  {currentArticle.generated_video ? (
                                      <video src={currentArticle.generated_video} controls className="max-h-[400px] rounded-lg shadow-lg w-full" />
                                  ) : currentArticle.generated_image ? (
                                      <img src={currentArticle.generated_image} className="max-h-[400px] rounded-lg shadow-lg object-contain" />
                                  ) : (
                                      <div className="text-center text-gray-400">
                                          <i className="ri-image-line text-4xl mb-2"></i>
                                          <p className="text-sm">No assets generated yet</p>
                                      </div>
                                  )}
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                               <button 
                                  onClick={() => {
                                      const fallback = `https://placehold.co/1080x1080/0F172A/FFF?text=${encodeURIComponent(currentArticle.title.substring(0,20))}`;
                                      setCurrentArticle(prev => ({ ...prev, generated_image: fallback }));
                                  }}
                                  className="py-3 bg-gray-100 rounded-xl font-bold text-sm hover:bg-gray-200"
                               >
                                  Generate Static Poster
                               </button>
                               <button 
                                  onClick={handleVideoGen}
                                  className="py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:opacity-90"
                               >
                                  Generate Veo Video (AI)
                               </button>
                          </div>

                          <div className="flex gap-4 pt-6 border-t border-gray-100">
                              <button onClick={() => setCurrentArticle(prev => ({...prev, workflow_step: 'editor'}))} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">Back</button>
                              <button onClick={handlePublish} className="flex-1 px-6 py-3 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 hover:bg-green-700">Approve & Publish</button>
                          </div>
                      </div>
                  )}
                  
                  {/* STEP 4: SUMMARY */}
                  {currentArticle.workflow_step === 'summary' && (
                       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i className="ri-check-line text-4xl"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Published Successfully!</h2>
                            <p className="text-gray-500 mb-8">Your content is now live on the platform.</p>
                            <button 
                                onClick={() => setCurrentArticle(prev => ({ ...prev, workflow_step: 'strategy', title: '', content: '', raw_source: '' }))}
                                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold"
                            >
                                Start New Campaign
                            </button>
                       </div>
                  )}
              </div>
          </div>
      </div>
  );

  const renderNotices = () => (
      <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
               <h3 className="text-xl font-bold text-gray-400">CMS Management</h3>
               <p className="text-gray-400 mt-2">Connect to Supabase to view article history.</p>
          </div>
      </div>
  );

  const renderSettings = () => (
      <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
           <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
               <h2 className="text-xl font-bold text-gray-900 mb-6">System Configuration</h2>
               <div className="space-y-4">
                   <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gemini API Key</label>
                       <input 
                          type="password" 
                          value={apiKey} 
                          onChange={e => setApiKey(e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                          placeholder="AIza..." 
                       />
                       <p className="text-xs text-gray-400 mt-2">Will override env variable if set.</p>
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Brand Tone</label>
                       <select 
                          value={brandTone} 
                          onChange={e => setBrandTone(e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                       >
                           <option>Professional</option>
                           <option>Exciting</option>
                           <option>Technical</option>
                       </select>
                   </div>
               </div>
           </div>
      </div>
  );

  return (
      <div className="flex h-screen w-full bg-white font-sans text-gray-900">
          {renderSidebar()}
          {activeTab === 'studio' && renderStudio()}
          {activeTab === 'notices' && renderNotices()}
          {activeTab === 'settings' && renderSettings()}
          <Toast message={toast.msg} show={toast.show} type={toast.type} />
      </div>
  );
};

export default AdminDashboard;