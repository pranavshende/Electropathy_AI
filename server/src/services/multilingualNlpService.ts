/**
 * v2026 Multilingual NLP & Language Understanding Engine
 * Supports: English, Hindi (हिन्दी), Marathi (मराठी), Hinglish, and Romanized Marathi.
 * Implements: Language Detection, Transliteration Mapping, Medical Entity Extraction,
 * and Cross-Lingual Synonym Expansion for Hybrid BM25/Semantic Retrieval.
 */

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface LanguageDetectionResult {
  targetLang: SupportedLanguage;
  script: 'devanagari' | 'latin';
  isTransliterated: boolean;
  isExplicitInstruction: boolean;
  detectionMethod: 'explicit_request' | 'devanagari_markers' | 'romanized_markers' | 'user_preference' | 'default_fallback';
  confidence: number;
}

export interface ExtractedEntities {
  organs: string[];
  symptoms: string[];
  remedies: string[];
  intent: 'remedy_search' | 'organ_search' | 'symptom_search' | 'language_switch' | 'general_consultation';
}

export interface ExpandedQuery {
  originalQuery: string;
  detectedLanguage: LanguageDetectionResult;
  normalizedEnglishQuery: string;
  searchKeywords: string[];
  entities: ExtractedEntities;
}

// -------------------------------------------------------------
// Multilingual Vocabulary & Entity Dictionaries
// -------------------------------------------------------------

const ORGAN_DICTIONARY: Record<string, { canonical: string; remedyAffinity: string[] }> = {
  // Liver / Hepatic
  'liver': { canonical: 'Liver', remedyAffinity: ['S5', 'C5', 'L1', 'F1'] },
  'hepatic': { canonical: 'Liver', remedyAffinity: ['S5', 'C5', 'L1'] },
  'यकृत': { canonical: 'Liver', remedyAffinity: ['S5', 'C5', 'L1'] },
  'लीवर': { canonical: 'Liver', remedyAffinity: ['S5', 'C5', 'L1'] },
  'लिवर': { canonical: 'Liver', remedyAffinity: ['S5', 'C5', 'L1'] },
  'लिव्हर': { canonical: 'Liver', remedyAffinity: ['S5', 'C5', 'L1'] },

  // Kidney / Renal
  'kidney': { canonical: 'Kidneys', remedyAffinity: ['S6', 'C6', 'A2', 'B.E.'] },
  'kidneys': { canonical: 'Kidneys', remedyAffinity: ['S6', 'C6', 'A2', 'B.E.'] },
  'renal': { canonical: 'Kidneys', remedyAffinity: ['S6', 'C6'] },
  'गुर्दा': { canonical: 'Kidneys', remedyAffinity: ['S6', 'C6'] },
  'गुर्दे': { canonical: 'Kidneys', remedyAffinity: ['S6', 'C6'] },
  'किडनी': { canonical: 'Kidneys', remedyAffinity: ['S6', 'C6'] },
  'मूत्रपिंड': { canonical: 'Kidneys', remedyAffinity: ['S6', 'C6'] },

  // Stomach / Gastric
  'stomach': { canonical: 'Stomach', remedyAffinity: ['S1', 'S2', 'C15', 'G.E.'] },
  'gastric': { canonical: 'Stomach', remedyAffinity: ['S1', 'S2', 'C15'] },
  'पेट': { canonical: 'Stomach', remedyAffinity: ['S1', 'S2', 'C15'] },
  'आमाशय': { canonical: 'Stomach', remedyAffinity: ['S1', 'S2', 'C15'] },
  'पोट': { canonical: 'Stomach', remedyAffinity: ['S1', 'S2', 'C15'] },
  'पोटात': { canonical: 'Stomach', remedyAffinity: ['S1', 'S2', 'C15'] },
  'जठर': { canonical: 'Stomach', remedyAffinity: ['S1', 'S2', 'C15'] },

  // Lungs & Bronchi / Respiratory
  'lung': { canonical: 'Lungs', remedyAffinity: ['P1', 'P2', 'P3', 'P4'] },
  'lungs': { canonical: 'Lungs', remedyAffinity: ['P1', 'P2', 'P3', 'P4'] },
  'chest': { canonical: 'Lungs', remedyAffinity: ['P1', 'P2', 'A2'] },
  'bronchial': { canonical: 'Bronchi', remedyAffinity: ['P1', 'P2'] },
  'फेफड़े': { canonical: 'Lungs', remedyAffinity: ['P1', 'P2'] },
  'फेफड़ों': { canonical: 'Lungs', remedyAffinity: ['P1', 'P2'] },
  'छाती': { canonical: 'Lungs', remedyAffinity: ['P1', 'P2'] },
  'फुफ्फुस': { canonical: 'Lungs', remedyAffinity: ['P1', 'P2'] },
  'फुफ्फुसे': { canonical: 'Lungs', remedyAffinity: ['P1', 'P2'] },

  // Heart / Cardiovascular
  'heart': { canonical: 'Heart', remedyAffinity: ['A1', 'A2', 'A3', 'C1'] },
  'cardiac': { canonical: 'Heart', remedyAffinity: ['A1', 'A3'] },
  'दिल': { canonical: 'Heart', remedyAffinity: ['A1', 'A3'] },
  'हृदय': { canonical: 'Heart', remedyAffinity: ['A1', 'A3'] },
  'हृदयाशी': { canonical: 'Heart', remedyAffinity: ['A1', 'A3'] },

  // Blood Vessels / Veins
  'veins': { canonical: 'Veins', remedyAffinity: ['A2', 'Ven1', 'B.E.'] },
  'vein': { canonical: 'Veins', remedyAffinity: ['A2', 'Ven1'] },
  'नसें': { canonical: 'Veins', remedyAffinity: ['A2', 'Ven1'] },
  'नस': { canonical: 'Veins', remedyAffinity: ['A2', 'Ven1'] },
  'शीरा': { canonical: 'Veins', remedyAffinity: ['A2', 'Ven1'] },
  'रक्तवाहिन्या': { canonical: 'Veins', remedyAffinity: ['A2', 'Ven1'] },

  // Skin / Cutaneous
  'skin': { canonical: 'Skin', remedyAffinity: ['S5', 'C5', 'Ver1', 'A2'] },
  'त्वचा': { canonical: 'Skin', remedyAffinity: ['S5', 'C5', 'Ver1'] },
  'त्वचेवर': { canonical: 'Skin', remedyAffinity: ['S5', 'C5', 'Ver1'] },
  'चमड़ी': { canonical: 'Skin', remedyAffinity: ['S5', 'C5'] },
  'चामडी': { canonical: 'Skin', remedyAffinity: ['S5', 'C5'] },

  // Intestines / Bowels
  'intestines': { canonical: 'Intestines', remedyAffinity: ['S2', 'S.Lass', 'C10'] },
  'bowel': { canonical: 'Intestines', remedyAffinity: ['S2', 'S.Lass'] },
  'gut': { canonical: 'Intestines', remedyAffinity: ['S2', 'S.Lass'] },
  'colon': { canonical: 'Intestines', remedyAffinity: ['S2', 'S.Lass'] },
  'आंत': { canonical: 'Intestines', remedyAffinity: ['S2', 'S.Lass'] },
  'आंतें': { canonical: 'Intestines', remedyAffinity: ['S2', 'S.Lass'] },
  'आतडे': { canonical: 'Intestines', remedyAffinity: ['S2', 'S.Lass'] },
  'आतडी': { canonical: 'Intestines', remedyAffinity: ['S2', 'S.Lass'] },

  // Lymphatic System
  'lymph': { canonical: 'Lymphatic System', remedyAffinity: ['S1', 'L1', 'A2'] },
  'lymphatic': { canonical: 'Lymphatic System', remedyAffinity: ['S1', 'L1'] },
  'लसीका': { canonical: 'Lymphatic System', remedyAffinity: ['S1', 'L1'] },
  'लसिका': { canonical: 'Lymphatic System', remedyAffinity: ['S1', 'L1'] }
};

const SYMPTOM_DICTIONARY: Record<string, { canonical: string; remedyAffinity: string[] }> = {
  // Constipation
  'constipation': { canonical: 'Constipation', remedyAffinity: ['S2', 'S.Lass', 'G.E.'] },
  'कब्ज': { canonical: 'Constipation', remedyAffinity: ['S2', 'S.Lass', 'G.E.'] },
  'कब्जियत': { canonical: 'Constipation', remedyAffinity: ['S2', 'S.Lass'] },
  'मलबद्धता': { canonical: 'Constipation', remedyAffinity: ['S2', 'S.Lass'] },
  'बद्धकोष्ठता': { canonical: 'Constipation', remedyAffinity: ['S2', 'S.Lass'] },
  'kabz': { canonical: 'Constipation', remedyAffinity: ['S2', 'S.Lass'] },
  'pet saaf': { canonical: 'Constipation', remedyAffinity: ['S2', 'S.Lass'] },

  // Fever
  'fever': { canonical: 'Fever', remedyAffinity: ['F1', 'A2', 'R.E.'] },
  'pyrexia': { canonical: 'Fever', remedyAffinity: ['F1', 'A2'] },
  'बुखार': { canonical: 'Fever', remedyAffinity: ['F1', 'A2', 'R.E.'] },
  'ताप': { canonical: 'Fever', remedyAffinity: ['F1', 'A2', 'R.E.'] },
  'bukhar': { canonical: 'Fever', remedyAffinity: ['F1', 'A2'] },
  'tap': { canonical: 'Fever', remedyAffinity: ['F1', 'A2'] },

  // Cough
  'cough': { canonical: 'Cough', remedyAffinity: ['P1', 'P2', 'P3'] },
  'खांसी': { canonical: 'Cough', remedyAffinity: ['P1', 'P2'] },
  'खोकला': { canonical: 'Cough', remedyAffinity: ['P1', 'P2'] },
  'khansi': { canonical: 'Cough', remedyAffinity: ['P1', 'P2'] },
  'khokla': { canonical: 'Cough', remedyAffinity: ['P1', 'P2'] },

  // Pain / Burning
  'pain': { canonical: 'Pain', remedyAffinity: ['A2', 'B.E.', 'F1'] },
  'burning': { canonical: 'Burning Sensation', remedyAffinity: ['A2', 'B.E.', 'S6'] },
  'दर्द': { canonical: 'Pain', remedyAffinity: ['A2', 'B.E.'] },
  'जलन': { canonical: 'Burning Sensation', remedyAffinity: ['A2', 'B.E.', 'S6'] },
  'वेदना': { canonical: 'Pain', remedyAffinity: ['A2', 'B.E.'] },
  'दाह': { canonical: 'Burning Sensation', remedyAffinity: ['A2', 'B.E.'] },
  'आग': { canonical: 'Burning Sensation', remedyAffinity: ['A2', 'B.E.'] },
  'dard': { canonical: 'Pain', remedyAffinity: ['A2', 'B.E.'] },
  'jalan': { canonical: 'Burning Sensation', remedyAffinity: ['A2', 'B.E.'] },

  // Bloating / Gas
  'bloating': { canonical: 'Bloating & Gas', remedyAffinity: ['S2', 'C15', 'G.E.'] },
  'gas': { canonical: 'Bloating & Gas', remedyAffinity: ['S2', 'G.E.'] },
  'गैस': { canonical: 'Bloating & Gas', remedyAffinity: ['S2', 'G.E.'] },
  'भारीपन': { canonical: 'Bloating & Gas', remedyAffinity: ['S2', 'C15'] },
  'पोट फुगणे': { canonical: 'Bloating & Gas', remedyAffinity: ['S2', 'G.E.'] },
  'गॅस': { canonical: 'Bloating & Gas', remedyAffinity: ['S2', 'G.E.'] }
};

export class MultilingualNlpService {
  /**
   * Determine exact target language using strict 4-tier precedence:
   * 1. Explicit request in prompt ("in marathi", "हिंदी में बताएं")
   * 2. Detected language of the query text
   * 3. User preferred language setting
   * 4. English default
   */
  detectLanguage(text: string, userPref?: string): LanguageDetectionResult {
    const clean = (text || '').trim();
    if (!clean) {
      const fallback = (userPref === 'hi' || userPref === 'mr') ? userPref : 'en';
      return {
        targetLang: fallback,
        script: 'latin',
        isTransliterated: false,
        isExplicitInstruction: false,
        detectionMethod: 'user_preference',
        confidence: 0.9
      };
    }

    const lower = clean.toLowerCase();

    // -------------------------------------------------------------
    // Priority 1: Explicit Language Request in Prompt
    // -------------------------------------------------------------
    if (
      lower.includes('in marathi') || 
      lower.includes('marathi madhe') || 
      lower.includes('marathit') ||
      clean.includes('मराठीत') || 
      clean.includes('मराठी मध्ये') || 
      clean.includes('मराठीमध्ये') ||
      clean.includes('मराठी भाषा')
    ) {
      return {
        targetLang: 'mr',
        script: /[\u0900-\u097F]/.test(clean) ? 'devanagari' : 'latin',
        isTransliterated: !/[\u0900-\u097F]/.test(clean),
        isExplicitInstruction: true,
        detectionMethod: 'explicit_request',
        confidence: 1.0
      };
    }

    if (
      lower.includes('in hindi') || 
      lower.includes('hindi me') || 
      lower.includes('hindi mein') ||
      clean.includes('हिंदी में') || 
      clean.includes('हिन्दी में') || 
      clean.includes('हिंदी भाषा')
    ) {
      return {
        targetLang: 'hi',
        script: /[\u0900-\u097F]/.test(clean) ? 'devanagari' : 'latin',
        isTransliterated: !/[\u0900-\u097F]/.test(clean),
        isExplicitInstruction: true,
        detectionMethod: 'explicit_request',
        confidence: 1.0
      };
    }

    if (
      lower.includes('in english') || 
      lower.includes('explain in english') || 
      clean.includes('अंग्रेजी में') || 
      clean.includes('इंग्रजीत')
    ) {
      return {
        targetLang: 'en',
        script: 'latin',
        isTransliterated: false,
        isExplicitInstruction: true,
        detectionMethod: 'explicit_request',
        confidence: 1.0
      };
    }

    // -------------------------------------------------------------
    // Priority 2: Script and Linguistic Marker Analysis
    // -------------------------------------------------------------
    const hasDevanagari = /[\u0900-\u097F]/.test(clean);

    if (hasDevanagari) {
      // Distinguish Marathi vs Hindi in Devanagari
      const marathiDevanagariWords = [
        'आहे', 'आहेत', 'नाही', 'काय', 'कसे', 'करणे', 'साठी', 'मध्ये', 'पोटात', 
        'झाले', 'झाली', 'होते', 'सांगा', 'औषध', 'द्या', 'येईल', 'त्यामुळे', 'लक्षणे',
        'तपासणी', 'पाहिजे', 'कधी', 'कमी', 'जास्त', 'दुखणे', 'डोके', 'त्रास', 'फुफ्फुस'
      ];
      
      const hindiDevanagariWords = [
        'है', 'हैं', 'नहीं', 'क्या', 'कैसे', 'करना', 'के लिए', 'में', 'पेट में',
        'हुआ', 'हुई', 'था', 'थे', 'बताएं', 'दवा', 'दीजिए', 'सकते', 'सकता', 'लक्षण',
        'जांच', 'चाहिए', 'कब', 'कम', 'ज्यादा', 'दर्द', 'सिर', 'समस्या', 'उपाय'
      ];

      let mrCount = 0;
      let hiCount = 0;

      for (const w of marathiDevanagariWords) {
        if (clean.includes(w)) mrCount++;
      }
      for (const w of hindiDevanagariWords) {
        if (clean.includes(w)) hiCount++;
      }

      if (mrCount > hiCount) {
        return {
          targetLang: 'mr',
          script: 'devanagari',
          isTransliterated: false,
          isExplicitInstruction: false,
          detectionMethod: 'devanagari_markers',
          confidence: 0.95
        };
      }

      if (hiCount > mrCount) {
        return {
          targetLang: 'hi',
          script: 'devanagari',
          isTransliterated: false,
          isExplicitInstruction: false,
          detectionMethod: 'devanagari_markers',
          confidence: 0.95
        };
      }

      // If tie in Devanagari markers, check character presence (Marathi ळ / etc.) or user preference
      if (clean.includes('ळ') || clean.includes('ऱ्ह')) {
        return { targetLang: 'mr', script: 'devanagari', isTransliterated: false, isExplicitInstruction: false, detectionMethod: 'devanagari_markers', confidence: 0.9 };
      }

      // Default to user preference if Hindi/Marathi, else Hindi
      const tieLang = (userPref === 'mr') ? 'mr' : 'hi';
      return {
        targetLang: tieLang,
        script: 'devanagari',
        isTransliterated: false,
        isExplicitInstruction: false,
        detectionMethod: 'devanagari_markers',
        confidence: 0.85
      };
    }

    // Latin Script: Check for Hinglish vs Romanized Marathi
    const romanizedMarathiWords = [
      'aahe', 'aahet', 'nahi', 'kay', 'kase', 'sathi', 'madhe', 'sangaa', 'sanga',
      'potat', 'doke', 'dokh', 'tap', 'aushadh', 'dya', 'trass', 'koni', 'konte', 'hote'
    ];

    const hinglishWords = [
      'kya', 'hai', 'hain', 'nahi', 'ke liye', 'kaunsa', 'kaunse', 'batao', 'bataye',
      'chahiye', 'pet', 'dard', 'bukhar', 'ilaj', 'dawa', 'kare', 'kaise', 'hota'
    ];

    let mrRomCount = 0;
    let hiRomCount = 0;

    const lowerTokens = lower.split(/[\s,?.!]+/);
    for (const t of lowerTokens) {
      if (romanizedMarathiWords.includes(t)) mrRomCount++;
      if (hinglishWords.includes(t)) hiRomCount++;
    }

    if (mrRomCount > 0 && mrRomCount >= hiRomCount) {
      return {
        targetLang: 'mr',
        script: 'latin',
        isTransliterated: true,
        isExplicitInstruction: false,
        detectionMethod: 'romanized_markers',
        confidence: 0.9
      };
    }

    if (hiRomCount > 0) {
      return {
        targetLang: 'hi',
        script: 'latin',
        isTransliterated: true,
        isExplicitInstruction: false,
        detectionMethod: 'romanized_markers',
        confidence: 0.9
      };
    }

    // -------------------------------------------------------------
    // Priority 3 & 4: User Preference or Default English
    // -------------------------------------------------------------
    if (userPref === 'hi' || userPref === 'mr') {
      return {
        targetLang: userPref,
        script: 'latin',
        isTransliterated: false,
        isExplicitInstruction: false,
        detectionMethod: 'user_preference',
        confidence: 0.8
      };
    }

    return {
      targetLang: 'en',
      script: 'latin',
      isTransliterated: false,
      isExplicitInstruction: false,
      detectionMethod: 'default_fallback',
      confidence: 0.99
    };
  }

  /**
   * Check if query is an in-situ language switch or explanation request
   * (e.g. "Explain in Hindi", "आता हेच मराठीत सांगा")
   */
  isLanguageSwitchRequest(queryText: string): { isSwitch: boolean; requestedLang?: SupportedLanguage } {
    const q = queryText.toLowerCase().trim();
    if (q.length < 50) {
      if (q.includes('in hindi') || q.includes('hindi me') || q.includes('हिंदी में')) {
        return { isSwitch: true, requestedLang: 'hi' };
      }
      if (q.includes('in marathi') || q.includes('मराठीत') || q.includes('मराठी मध्ये') || q.includes('marathit')) {
        return { isSwitch: true, requestedLang: 'mr' };
      }
      if (q.includes('in english') || q.includes('अंग्रेजी में') || q.includes('इंग्रजीत')) {
        return { isSwitch: true, requestedLang: 'en' };
      }
    }
    return { isSwitch: false };
  }

  /**
   * Tokenize query preserving Unicode Devanagari letters (\p{L}) and numbers (\p{N})
   */
  tokenizeUnicode(text: string): string[] {
    if (!text) return [];
    // Strips only punctuation and symbols, PRESERVING all Unicode alphabetic glyphs!
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\.\-]/gu, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 2);
  }

  /**
   * Comprehensive Entity Extraction and Cross-Lingual Query Expansion
   * Maps Hindi/Marathi/Hinglish terms to canonical English medical terms & remedy codes
   * so hybrid retrieval finds the exact doctor-approved evidence.
   */
  expandQuery(queryText: string, userPref?: string): ExpandedQuery {
    const langInfo = this.detectLanguage(queryText, userPref);
    const tokens = this.tokenizeUnicode(queryText);
    const lowerQuery = queryText.toLowerCase();

    const matchedOrgans = new Set<string>();
    const matchedSymptoms = new Set<string>();
    const matchedRemedies = new Set<string>();
    const searchTerms = new Set<string>();

    // 1. Scan Organ Dictionary
    for (const [key, val] of Object.entries(ORGAN_DICTIONARY)) {
      if (lowerQuery.includes(key.toLowerCase())) {
        matchedOrgans.add(val.canonical);
        searchTerms.add(val.canonical.toLowerCase());
        val.remedyAffinity.forEach(r => matchedRemedies.add(r));
      }
    }

    // 2. Scan Symptom Dictionary
    for (const [key, val] of Object.entries(SYMPTOM_DICTIONARY)) {
      if (lowerQuery.includes(key.toLowerCase())) {
        matchedSymptoms.add(val.canonical);
        searchTerms.add(val.canonical.toLowerCase());
        val.remedyAffinity.forEach(r => matchedRemedies.add(r));
      }
    }

    // 3. Scan Direct Remedy Codes (S1, S2, C4, A2, P1, F1, R.E., B.E., G.E., etc.)
    const remedyCodeRegex = /\b([SCAFPLVvWwYyGgBbRr]\d{0,2}|[RGBYAW]\.?E\.?|APP|LASS|SY|T\.E\.)\b/gi;
    let match;
    while ((match = remedyCodeRegex.exec(queryText)) !== null) {
      matchedRemedies.add(match[0].toUpperCase());
      searchTerms.add(match[0].toLowerCase());
    }

    // 4. Intent Classification
    let intent: ExtractedEntities['intent'] = 'general_consultation';
    if (this.isLanguageSwitchRequest(queryText).isSwitch) {
      intent = 'language_switch';
    } else if (matchedRemedies.size > 0) {
      intent = 'remedy_search';
    } else if (matchedOrgans.size > 0) {
      intent = 'organ_search';
    } else if (matchedSymptoms.size > 0) {
      intent = 'symptom_search';
    }

    // 5. Build Normalized English Query for Canonical Retrieval
    const parts: string[] = [];
    if (matchedOrgans.size > 0) {
      parts.push(`Organ: ${Array.from(matchedOrgans).join(', ')}`);
    }
    if (matchedSymptoms.size > 0) {
      parts.push(`Symptoms: ${Array.from(matchedSymptoms).join(', ')}`);
    }
    if (matchedRemedies.size > 0) {
      parts.push(`Remedies: ${Array.from(matchedRemedies).join(', ')}`);
    }

    // If query has English tokens, retain them
    const englishTokens = tokens.filter(t => /^[a-z0-9\.\-]+$/.test(t) && t.length > 2);
    if (englishTokens.length > 0) {
      parts.push(englishTokens.join(' '));
    }

    const normalizedEnglishQuery = parts.length > 0 ? parts.join(' | ') : queryText;

    // Merge original tokens with expanded keywords
    tokens.forEach(t => searchTerms.add(t));
    Array.from(matchedRemedies).forEach(r => searchTerms.add(r.toLowerCase()));

    return {
      originalQuery: queryText,
      detectedLanguage: langInfo,
      normalizedEnglishQuery,
      searchKeywords: Array.from(searchTerms),
      entities: {
        organs: Array.from(matchedOrgans),
        symptoms: Array.from(matchedSymptoms),
        remedies: Array.from(matchedRemedies),
        intent
      }
    };
  }
}

export const multilingualNlpService = new MultilingualNlpService();
