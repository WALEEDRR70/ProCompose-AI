import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, AlertCircle, RefreshCw, Video, Mic } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { ImageFile } from '../types';
import { generateVeoPrompt } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const VeoGenerator = () => {
  const { t } = useLanguage();
  const [firstFrame, setFirstFrame] = useState<ImageFile | null>(null);
  const [lastFrame, setLastFrame] = useState<ImageFile | null>(null);
  const [description, setDescription] = useState('');
  
  // Audio state
  const [hasAudio, setHasAudio] = useState(false);
  const [audioText, setAudioText] = useState('');
  const [audioGender, setAudioGender] = useState<'Male' | 'Female'>('Female');
  const [audioTone, setAudioTone] = useState('');

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
        const increment = Math.floor(Math.random() * 4) + 1; // Slower increment for video reasoning
        return Math.min(prev + increment, 90);
      });
    }, 600);
  };

  const stopProgress = () => {
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  useEffect(() => {
    return () => stopProgress();
  }, []);

  const handleGenerate = async () => {
    setError(null);
    setGeneratedPrompt('');

    if (!firstFrame) {
      setError(t.errStartFrame);
      return;
    }

    setIsGenerating(true);
    startProgress();

    try {
      const result = await generateVeoPrompt({
        firstFrame,
        lastFrame,
        description,
        voiceInstructions: hasAudio ? {
          text: audioText,
          gender: audioGender,
          tone: audioTone
        } : undefined
      });
      setProgress(100);
      setTimeout(() => {
        setGeneratedPrompt(result);
        setIsGenerating(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || t.errGeneral);
      setIsGenerating(false);
    } finally {
      stopProgress();
    }
  };

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
            {t.veoStep1}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[250px]">
            <ImageUploader 
              id="start-frame"
              label={t.veoStartLabel}
              subLabel={t.veoStartSub}
              image={firstFrame}
              onImageChange={setFirstFrame}
            />
            <ImageUploader 
              id="end-frame"
              label={t.veoEndLabel}
              subLabel={t.veoEndSub}
              image={lastFrame}
              onImageChange={setLastFrame}
            />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs text-zinc-400">2</span>
            {t.veoStep2}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="veo-desc" className="block text-sm font-semibold text-zinc-300 mb-2">
                {t.veoDescLabel}
              </label>
              <textarea
                id="veo-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.veoDescPlace}
                className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
              />
            </div>

            <div className="pt-2 border-t border-zinc-800/50">
              <div className="flex items-center gap-2 mb-3">
                 <input 
                  type="checkbox" 
                  id="hasAudio" 
                  checked={hasAudio} 
                  onChange={(e) => setHasAudio(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                 />
                 <label htmlFor="hasAudio" className="text-sm font-semibold text-zinc-300 flex items-center gap-2 cursor-pointer select-none">
                   <Mic size={14} /> {t.veoAudioCheck}
                 </label>
              </div>

              {hasAudio && (
                <div className="space-y-3 pl-6 animate-in fade-in slide-in-from-top-2 duration-200">
                   <div>
                      <label className="text-xs text-zinc-500 mb-1 block">{t.veoAudioText}</label>
                      <input 
                        type="text"
                        value={audioText}
                        onChange={(e) => setAudioText(e.target.value)}
                        placeholder="e.g. 'Experience the future of comfort...'"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">{t.veoAudioGender}</label>
                        <select 
                          value={audioGender}
                          onChange={(e) => setAudioGender(e.target.value as 'Male' | 'Female')}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                        >
                          <option value="Female">{t.genderFemale}</option>
                          <option value="Male">{t.genderMale}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">{t.veoAudioTone}</label>
                         <input 
                          type="text"
                          value={audioTone}
                          onChange={(e) => setAudioTone(e.target.value)}
                          placeholder="e.g. Cinematic, Calm"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !firstFrame}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-indigo-500/20
            ${isGenerating 
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
              : !firstFrame
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.02] active:scale-[0.98]'
            }
          `}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="animate-spin w-5 h-5" />
              {t.veoDirecting} ({progress}%)
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              {t.veoGenerate}
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
                          <Video className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div className="w-full">
                           <div className="flex justify-between text-xs text-zinc-400 mb-2">
                              <span>Structuring narrative...</span>
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
                      <Video className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-medium">{t.veoReady}</p>
                      <p className="text-sm mt-2 opacity-60 max-w-xs text-center">
                        {t.veoReadySub}
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
                    {t.veoFooter}
                  </p>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default VeoGenerator;