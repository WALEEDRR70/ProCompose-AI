import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, Check, AlertCircle, RefreshCw, Aperture } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { ImageFile } from '../types';
import { generateCompositionPrompt } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const CompositionGenerator = () => {
  const { t } = useLanguage();
  const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [styleNotes, setStyleNotes] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const progressInterval = useRef<number | null>(null);

  const startProgress = () => {
    setProgress(0);
    if (progressInterval.current) window.clearInterval(progressInterval.current);
    
    progressInterval.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Random increment between 1 and 5
        const increment = Math.floor(Math.random() * 5) + 1;
        return Math.min(prev + increment, 90);
      });
    }, 500);
  };

  const stopProgress = () => {
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setGeneratedPrompt('');

    if (!referenceImage || !productImage) {
      setError(t.errRefProd);
      return;
    }

    setIsGenerating(true);
    startProgress();

    try {
      const result = await generateCompositionPrompt(referenceImage, productImage, styleNotes);
      setProgress(100);
      setTimeout(() => {
          setGeneratedPrompt(result);
          setIsGenerating(false);
      }, 500); // Short delay to show 100%
    } catch (err: any) {
      setError(err.message || t.errGeneral);
      setIsGenerating(false);
    } finally {
      stopProgress();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopProgress();
  }, []);

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs text-zinc-400">1</span>
            {t.compStep1}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[280px]">
            <ImageUploader 
              id="ref-upload"
              label={t.compRefLabel}
              subLabel={t.compRefSub}
              image={referenceImage}
              onImageChange={setReferenceImage}
            />
            <ImageUploader 
              id="prod-upload"
              label={t.compProdLabel}
              subLabel={t.compProdSub}
              image={productImage}
              onImageChange={setProductImage}
            />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs text-zinc-400">2</span>
            {t.compStep2}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="style-notes" className="block text-sm font-semibold text-zinc-300 mb-2">
                {t.compStyleLabel}
              </label>
              <textarea
                id="style-notes"
                value={styleNotes}
                onChange={(e) => setStyleNotes(e.target.value)}
                placeholder={t.compStylePlace}
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!referenceImage || !productImage)}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-indigo-500/20
            ${isGenerating 
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
              : (!referenceImage || !productImage) 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.02] active:scale-[0.98]'
            }
          `}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="animate-spin w-5 h-5" />
              {t.compAnalyzing} ({progress}%)
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {t.compGenerate}
            </>
          )}
        </button>
          {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Right Column: Output */}
      <div className="lg:col-span-7">
          <div className="h-full bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs text-zinc-400">3</span>
                {t.compStep3}
              </h2>
              {generatedPrompt && (
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${copied 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }
                  `}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? t.compCopied : t.compCopy}
                </button>
              )}
            </div>

            <div className="flex-1 relative">
              {generatedPrompt ? (
                <div dir="ltr" className="w-full h-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 overflow-y-auto whitespace-pre-wrap leading-relaxed text-zinc-300 shadow-inner font-mono text-sm text-left">
                  {generatedPrompt}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/50">
                  {isGenerating ? (
                      <div className="flex flex-col items-center gap-4 w-full max-w-xs px-4">
                         <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                          <Sparkles className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div className="w-full">
                           <div className="flex justify-between text-xs text-zinc-400 mb-2">
                              <span>Analyzing assets...</span>
                              <span>{progress}%</span>
                           </div>
                           <div className="w-full bg-zinc-800 rounded-full h-2">
                              <div 
                                className="bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${progress}%` }}
                              ></div>
                           </div>
                        </div>
                      </div>
                  ) : (
                    <>
                      <Aperture className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-medium">{t.compReady}</p>
                      <p className="text-sm mt-2 opacity-60 max-w-xs text-center">
                        {t.compReadySub}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Info Footer within card */}
            {generatedPrompt && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500 flex items-center gap-2">
                    <Sparkles size={12} className="text-indigo-400"/>
                    {t.compFooter}
                  </p>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default CompositionGenerator;