import React, { useState } from 'react';
import { LanguageProvider } from './components/LanguageContext';
import TopNotificationBar from './components/TopNotificationBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustStats from './components/TrustStats';
import Ecosystem from './components/Ecosystem';
import Compliance from './components/Compliance';
import Features from './components/Features';
import Lifestyle from './components/Lifestyle';
import Insights from './components/Insights';
import Developers from './components/Developers';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import MarketHub from './components/MarketHub';
import NoticeHub from './components/NoticeHub';
import ArticleDetail from './components/ArticleDetail';

export type PageView = 'home' | 'market_hub' | 'notice_hub' | 'article_detail';

export interface AppState {
  view: PageView;
  articleId?: string;
  articleType?: 'market' | 'notice';
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({ view: 'home' });

  const navigate = (view: PageView, articleId?: string, articleType?: 'market' | 'notice') => {
    // CRITICAL FIX: Use 'auto' instead of 'smooth' for full page transitions.
    // 'smooth' scrolling on DOM replacement causes the browser to get stuck calculating positions of elements that no longer exist.
    window.scrollTo({ top: 0, behavior: 'auto' });
    setAppState({ view, articleId, articleType });
  };

  return (
    <LanguageProvider>
      <div className="antialiased selection:bg-blue-100 selection:text-blue-900 pt-10">
        <TopNotificationBar onNavigate={() => navigate('notice_hub')} />
        
        {/* Navbar handles navigation requests */}
        <Navbar onNavigateHome={(view) => navigate(view || 'home')} />
        
        <main className="relative z-0 pt-6 md:pt-16 min-h-screen">
          {appState.view === 'home' && (
            <div className="animate-fade-in">
              <Hero />
              <TrustStats />
              <Ecosystem />
              <Compliance />
              <Features />
              <Lifestyle />
              <Insights onNavigate={navigate} />
              <Developers />
              <FAQ />
            </div>
          )}

          {appState.view === 'market_hub' && (
             <MarketHub onNavigate={navigate} />
          )}

          {appState.view === 'notice_hub' && (
             <NoticeHub onNavigate={navigate} />
          )}

          {appState.view === 'article_detail' && appState.articleId && (
            <ArticleDetail 
              id={appState.articleId} 
              type={appState.articleType || 'market'} 
              onNavigate={navigate} 
            />
          )}
          
          <Footer />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default App;