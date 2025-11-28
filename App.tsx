import React from 'react';
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

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <div className="antialiased selection:bg-blue-100 selection:text-blue-900 pt-10">
        <TopNotificationBar />
        <Navbar />
        <main className="relative z-0 pt-6 md:pt-16">
          <Hero />
          <TrustStats />
          <Ecosystem />
          <Compliance />
          <Features />
          <Lifestyle />
          <Insights />
          <Developers />
          <FAQ />
          <Footer />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default App;