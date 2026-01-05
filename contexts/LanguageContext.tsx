import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Record<string, string>;
  isRTL: boolean;
}

const translations = {
  en: {
    appTitle: "ProCompose AI",
    tabComposition: "Visual Composition",
    tabVeo: "Veo 3 Video",
    tabConcepts: "Creative Concepts",
    // Composition
    compStep1: "Upload Assets",
    compRefLabel: "Reference Image",
    compRefSub: "Inspiration for lighting, composition, and mood",
    compProdLabel: "Your Product",
    compProdSub: "Clean white background preferred",
    compStep2: "Style & Context",
    compStyleLabel: "Optional Style Notes",
    compStylePlace: "e.g., Luxury, minimal, cinematic lighting, dramatic shadows...",
    compGenerate: "Generate Prompt",
    compAnalyzing: "Analyzing Composition",
    compStep3: "Generated Prompt",
    compCopy: "Copy",
    compCopied: "Copied",
    compReady: "Ready to generate",
    compReadySub: "Upload your reference and product images to create a high-quality AI composition prompt.",
    compFooter: "This prompt is optimized for Midjourney, Stable Diffusion, and Adobe Firefly.",
    // Veo
    veoStep1: "Visual Sequence",
    veoStartLabel: "First Frame",
    veoStartSub: "Opening scene & style",
    veoEndLabel: "Last Frame",
    veoEndSub: "Ending composition (Optional)",
    veoStep2: "Narrative & Audio",
    veoDescLabel: "Short Helper Description",
    veoDescPlace: "Briefly describe the idea, emotion, or action...",
    veoAudioCheck: "Include Voice/Audio Instructions",
    veoAudioText: "Spoken Phrase / Text",
    veoAudioGender: "Gender",
    veoAudioTone: "Tone",
    veoGenerate: "Generate Veo Prompt",
    veoDirecting: "Directing Scene",
    veoReady: "Ready to Direct",
    veoReadySub: "Upload your frames and story details to generate a production-ready Veo 3 prompt.",
    veoFooter: "Optimized for Google Veo 3 Video Generation.",
    // Concepts
    concStep1: "Product Asset",
    concProdLabel: "Product Image",
    concProdSub: "Clean, well-lit product shot",
    concStep2: "Context & Strategy",
    concDescLabel: "Helper Description",
    concDescPlace: "Product category, target audience, usage context...",
    concCountLabel: "Number of Concepts",
    concUnit: "Concept",
    concUnits: "Concepts",
    concGenerate: "Generate Concepts",
    concBrainstorming: "Brainstorming",
    concStep3: "Creative Strategy",
    concReady: "Ready to Ideate",
    concReadySub: "Upload your product to get professional marketing and visual concepts.",
    concFooter: "Concepts are ready for moodboarding or AI generation.",
    // Errors/General
    errRefProd: "Both a Reference Image and a Product Image are required.",
    errStartFrame: "First Frame Image is required to set the scene.",
    errProdReq: "Product Image is required.",
    errGeneral: "Something went wrong. Please try again.",
    dragDrop: "Click or drag image",
    genderMale: "Male",
    genderFemale: "Female"
  },
  ar: {
    appTitle: "المؤلف الاحترافي AI",
    tabComposition: "تكوين بصري",
    tabVeo: "فيديو Veo 3",
    tabConcepts: "مفاهيم إبداعية",
    // Composition
    compStep1: "رفع الملفات",
    compRefLabel: "الصورة المرجعية",
    compRefSub: "مصدر الإلهام للإضاءة والتكوين والمزاج",
    compProdLabel: "صورة المنتج",
    compProdSub: "يفضل خلفية بيضاء نظيفة",
    compStep2: "النمط والسياق",
    compStyleLabel: "ملاحظات نمط اختيارية",
    compStylePlace: "مثلاً: فاخر، بسيط، إضاءة سينمائية، ظلال درامية...",
    compGenerate: "توليد الوصف",
    compAnalyzing: "جاري تحليل التكوين",
    compStep3: "الوصف المُولد",
    compCopy: "نسخ",
    compCopied: "تم النسخ",
    compReady: "جاهز للتوليد",
    compReadySub: "قم برفع الصورة المرجعية وصورة المنتج لإنشاء وصف تكوين عالي الجودة.",
    compFooter: "هذا الوصف مُحسن لـ Midjourney و Stable Diffusion و Adobe Firefly.",
    // Veo
    veoStep1: "التسلسل البصري",
    veoStartLabel: "الإطار الأول",
    veoStartSub: "المشهد الافتتاحي والنمط",
    veoEndLabel: "الإطار الأخير",
    veoEndSub: "تكوين النهاية (اختياري)",
    veoStep2: "السرد والصوت",
    veoDescLabel: "وصف مساعد قصير",
    veoDescPlace: "صف الفكرة أو العاطفة أو الإجراء باختصار...",
    veoAudioCheck: "تضمين تعليمات الصوت/الكلام",
    veoAudioText: "العبارة المنطوقة / النص",
    veoAudioGender: "الجنس",
    veoAudioTone: "النبرة",
    veoGenerate: "توليد وصف Veo",
    veoDirecting: "إخراج المشهد",
    veoReady: "جاهز للإخراج",
    veoReadySub: "قم برفع الإطارات وتفاصيل القصة لإنشاء وصف Veo 3 جاهز للإنتاج.",
    veoFooter: "مُحسن لتوليد الفيديو عبر Google Veo 3.",
    // Concepts
    concStep1: "أصل المنتج",
    concProdLabel: "صورة المنتج",
    concProdSub: "لقطة منتج نظيفة وجيدة الإضاءة",
    concStep2: "السياق والاستراتيجية",
    concDescLabel: "وصف مساعد",
    concDescPlace: "فئة المنتج، الجمهور المستهدف، سياق الاستخدام...",
    concCountLabel: "عدد المفاهيم",
    concUnit: "مفهوم",
    concUnits: "مفاهيم",
    concGenerate: "توليد المفاهيم",
    concBrainstorming: "عصف ذهني",
    concStep3: "الاستراتيجية الإبداعية",
    concReady: "جاهز للابتكار",
    concReadySub: "ارفع منتجك للحصول على مفاهيم تسويقية وبصرية احترافية.",
    concFooter: "المفاهيم جاهزة للوحات الإلهام أو التوليد بالذكاء الاصطناعي.",
    // Errors/General
    errRefProd: "مطلوب كل من الصورة المرجعية وصورة المنتج.",
    errStartFrame: "مطلوب صورة الإطار الأول لضبط المشهد.",
    errProdReq: "صورة المنتج مطلوبة.",
    errGeneral: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    dragDrop: "انقر أو اسحب الصورة",
    genderMale: "ذكر",
    genderFemale: "أنثى"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language], isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
