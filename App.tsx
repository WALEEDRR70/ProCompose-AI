
import React, { useState } from 'react';
import { Aperture, Image as ImageIcon, Video, Lightbulb, Languages } from 'lucide-react';
import CompositionGenerator from './components/CompositionGenerator';
import VeoGenerator from './components/VeoGenerator';
import ConceptGenerator from './components/ConceptGenerator';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'composition' | 'veo' | 'concepts'>('composition');
  const { language, setLanguage, t, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className={`min-h-screen bg-zinc-950 text-zinc-200 selection:bg-indigo-500/30 ${isRTL ? 'font-[Tajawal]' : 'font-[Inter]'}`}
    >
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Aperture className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              {t.appTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto max-w-[40vw] sm:max-w-none no-scrollbar">
               <button 
                  onClick={() => setActiveTab('composition')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'composition' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
               >
                  <ImageIcon size={16} />
                  {t.tabComposition}
               </button>
               <button 
                  onClick={() => setActiveTab('veo')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'veo' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
               >
                  <Video size={16} />
                  {t.tabVeo}
               </button>
               <button 
                  onClick={() => setActiveTab('concepts')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'concepts' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
               >
                  <Lightbulb size={16} />
                  {t.tabConcepts}
               </button>
            </div>

            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Switch Language"
            >
              <Languages size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div style={{ display: activeTab === 'composition' ? 'block' : 'none' }}>
          <CompositionGenerator />
        </div>
        <div style={{ display: activeTab === 'veo' ? 'block' : 'none' }}>
          <VeoGenerator />
        </div>
        <div style={{ display: activeTab === 'concepts' ? 'block' : 'none' }}>
          <ConceptGenerator />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
