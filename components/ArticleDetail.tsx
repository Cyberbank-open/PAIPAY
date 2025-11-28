import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { PageView } from '../App';

interface ArticleDetailProps {
  id: string;
  type: 'market' | 'notice';
  onNavigate: (view: PageView, articleId?: string, articleType?: 'market' | 'notice') => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ id, type, onNavigate }) => {
  const { t } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const items = type === 'market' ? t.insights.market_items : t.insights.notice_items;
  const article = items.find(i => i.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!article) return <div className="py-32 text-center text-gray-500">Article not found</div>;

  const parentView = type === 'market' ? 'market_hub' : 'notice_hub';
  const parentLabel = type === 'market' ? t.insights.tab_market : t.insights.tab_notice;

  // --- Handlers ---

  const handleShare = () => {
    // Simulate copying link
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      // Simulate network upload delay for "System" feel
      setTimeout(() => {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          setIsUploading(false);
      }, 800);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-white animate-fade-in pb-32">
       {/* Breadcrumb Nav */}
       <div className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-16 z-30">
          <div className="max-w-3xl mx-auto px-6 h-14 flex items-center text-xs font-medium text-gray-500">
             <span className="hover:text-gray-900 cursor-pointer" onClick={() => onNavigate('home')}>{t.nav.back_home}</span>
             <span className="mx-2">/</span>
             <span className="hover:text-gray-900 cursor-pointer" onClick={() => onNavigate(parentView)}>{parentLabel}</span>
             <span className="mx-2">/</span>
             <span className="text-gray-900 truncate max-w-[150px]">{article.title}</span>
          </div>
       </div>

       <div className="max-w-3xl mx-auto px-6 pt-16">
          <div className="mb-8">
             <span className="inline-block px-3 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-6">
                {article.tag}
             </span>
             <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                {article.title}
             </h1>
             <div className="flex items-center gap-4 text-xs text-gray-400 font-mono border-b border-gray-100 pb-8">
                <span>{article.date}</span>
                <span>•</span>
                <span>3 min read</span>
             </div>
          </div>

          <article className="prose prose-blue prose-lg text-gray-600 leading-loose">
             <p className="font-medium text-gray-800 text-lg mb-8">{article.summary}</p>
             <div className="whitespace-pre-line">
                {article.content}
             </div>
             
             {/* Simulated Lorem Ipsum content for length */}
             <p className="mt-8">
                In addition to the primary developments, we are observing significant shifts in user behavior across the APAC region. Institutional demand for real-time settlement is driving adoption of our Layer-2 solutions.
             </p>
          </article>

          {/* --- INTERACTION DOCK (Red Dot Style) --- */}
          <div className="mt-16 pt-10 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Actions & Feedback</h4>
            
            <div className="flex flex-wrap items-center gap-4">
                {/* 1. Share Button */}
                <button 
                    onClick={handleShare}
                    className={`h-12 px-6 rounded-xl flex items-center gap-2 text-sm font-bold transition-all duration-300 border ${isCopied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'}`}
                >
                    <i className={`${isCopied ? 'ri-check-line' : 'ri-share-box-line'} text-lg`}></i>
                    <span>{isCopied ? 'Link Copied' : 'Share Article'}</span>
                </button>

                {/* 2. Upload Button */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="image/*"
                />
                <button 
                    onClick={triggerFileUpload}
                    disabled={isUploading}
                    className="h-12 px-6 rounded-xl bg-gray-900 text-white hover:bg-black flex items-center gap-2 text-sm font-bold transition-all duration-300 shadow-lg shadow-gray-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isUploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <i className="ri-image-add-line text-lg"></i>
                            <span>Attach Image</span>
                        </>
                    )}
                </button>
            </div>

            {/* 3. Image Preview Area */}
            {previewUrl && (
                <div className="mt-8 animate-fade-in">
                    <div className="inline-flex flex-col gap-2">
                        <div className="relative group rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100 bg-white p-2">
                            <img src={previewUrl} alt="Preview" className="max-w-full h-auto max-h-[300px] object-cover block rounded-xl" />
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-2 rounded-xl bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="text-white font-bold text-xs tracking-wider uppercase drop-shadow-md">Preview</span>
                            </div>

                            {/* Remove Button (Floating) */}
                            <button 
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full text-red-500 shadow-md border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all z-20"
                            >
                                <i className="ri-close-line text-lg"></i>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-wide px-1">
                            <i className="ri-checkbox-circle-fill"></i>
                            <span>Image attached successfully</span>
                        </div>
                    </div>
                </div>
            )}
          </div>
          
          {/* Navigation Footer */}
          <div className="mt-12 flex justify-between">
              <button 
                onClick={() => onNavigate(parentView)}
                className="text-gray-400 hover:text-gray-900 text-sm font-bold flex items-center gap-2 transition-colors"
              >
                 <i className="ri-arrow-left-line"></i> Back to {parentLabel}
              </button>
          </div>
       </div>
    </div>
  );
};

export default ArticleDetail;