/**
 * Intelligent Multilingual Patient Profiling & Medical History Extraction Engine
 * Analyzes patient conversations in English, Hindi, Marathi, Hinglish, and Romanized scripts.
 * Automatically constructs and evolves structured clinical records, tracks symptom/medication changes,
 * enforces traceability back to source conversations, and guards against attributing hypothetical queries as personal history.
 */

import { prisma } from '../db/prisma.js';
import { dbCircuitBreaker } from '../db/circuitBreaker.js';
import { geminiService } from './geminiService.js';
import { multilingualNlpService, SupportedLanguage } from './multilingualNlpService.js';
import {
  patientProfilingStore,
  StoredPatientProfile,
  StoredSymptom,
  StoredMedication,
  StoredMedicalHistory,
  StoredAllergy,
  StoredLifestyle,
  StoredObservation,
  StoredTimelineEvent
} from './patientProfilingStore.js';

export interface ExtractionInput {
  userId: string;
  conversationId: string;
  messageId?: string;
  userMessage: string;
  assistantMessage?: string;
  lang?: SupportedLanguage;
}

export interface ExtractedPatientFacts {
  isHypotheticalInquiry: boolean;
  personalInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    phone?: string;
    email?: string;
    location?: string;
  };
  symptoms?: Array<{
    symptom: string;
    description?: string;
    duration?: string;
    severity?: string;
    statusChange?: 'active' | 'improving' | 'resolved' | 'worsened' | 'recurred';
  }>;
  medicalHistory?: Array<{
    condition: string;
    status?: 'current' | 'historical' | 'family_history';
    description?: string;
  }>;
  medications?: Array<{
    name: string;
    condition?: string;
    dosage?: string;
    frequency?: string;
    status: 'current' | 'previous' | 'stopped';
    sideEffects?: string;
  }>;
  allergies?: Array<{
    allergen: string;
    reaction?: string;
    severity?: string;
  }>;
  lifestyle?: {
    diet?: string;
    sleep?: string;
    physicalActivity?: string;
    substanceUse?: string;
    stressFactors?: string;
  };
  patientObservations?: string[];
}

class PatientProfilingService {
  private processedMessageIds = new Set<string>();

  /**
   * Main asynchronous entrypoint: Triggered non-blockingly after patient chat messages.
   */
  public async extractAndUpdateProfileAsync(input: ExtractionInput): Promise<StoredPatientProfile | null> {
    const dedupKey = input.messageId || `${input.conversationId}_${input.userMessage.trim()}`;
    if (this.processedMessageIds.has(dedupKey)) {
      return this.getProfileByUserId(input.userId);
    }
    this.processedMessageIds.add(dedupKey);

    try {
      return await this.processExtraction(input);
    } catch (err: any) {
      console.error('[PATIENT PROFILING ERROR]', err);
      return this.getProfileByUserId(input.userId);
    }
  }

  /**
   * Core extraction and profile synchronization
   */
  public async processExtraction(input: ExtractionInput): Promise<StoredPatientProfile | null> {
    const rawText = input.userMessage.trim();
    if (!rawText) return null;

    // Detect language
    const langDetection = multilingualNlpService.detectLanguage(rawText, input.lang);
    const targetLang = langDetection.targetLang;

    // 1. Analyze and Extract Facts (AI + Heuristic Fallback)
    const facts = await this.extractFactsWithAI(rawText, targetLang);

    // 2. Fetch or create patient profile
    const existingBefore = patientProfilingStore.getProfileByUserId(input.userId);
    const isNewProfile = !existingBefore;
    let profile = await this.resolvePatientProfile(input.userId, facts.personalInfo);

    // 3. If hypothetical inquiry only, save as observation and avoid personal medical history
    if (facts.isHypotheticalInquiry && !facts.personalInfo?.name && (!facts.symptoms || facts.symptoms.length === 0)) {
      this.recordObservation(profile.id, {
        category: 'inquiry',
        extractedInformation: { inquiry: rawText, isHypothetical: true },
        originalStatement: rawText,
        language: targetLang,
        sourceConversationId: input.conversationId,
        sourceMessageId: input.messageId,
        confidence: 0.95,
        verificationStatus: 'ai_extracted'
      });
      return profile;
    }

    // 4. Update Personal Demographics
    let profileUpdated = false;
    if (facts.personalInfo) {
      const pi = facts.personalInfo;
      if (pi.name && pi.name !== profile.fullName && pi.name.length > 1) {
        const oldName = profile.fullName;
        profile.fullName = pi.name;
        profileUpdated = true;
        this.recordTimelineEvent(profile.id, {
          eventType: 'MANUAL_CORRECTION',
          title: 'Patient Name Updated',
          description: `Name updated to "${pi.name}" (previously "${oldName}").`,
          fieldName: 'fullName',
          previousValue: oldName,
          updatedValue: pi.name,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId
        });
      }

      if (pi.age && pi.age !== profile.age && pi.age > 0 && pi.age < 125) {
        const oldAge = profile.age;
        profile.age = pi.age;
        profileUpdated = true;
        this.recordTimelineEvent(profile.id, {
          eventType: 'MANUAL_CORRECTION',
          title: `Age Updated (${pi.age} Years)`,
          description: oldAge ? `Age corrected from ${oldAge} to ${pi.age} years.` : `Age recorded as ${pi.age} years.`,
          fieldName: 'age',
          previousValue: oldAge,
          updatedValue: pi.age,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId
        });
      }

      if (pi.gender && (!profile.gender || profile.gender === 'unspecified')) {
        profile.gender = pi.gender;
        profileUpdated = true;
      }

      if (pi.phone && !profile.phone) {
        profile.phone = pi.phone;
        profileUpdated = true;
      }

      if (pi.location && !profile.location) {
        profile.location = pi.location;
        profileUpdated = true;
      }
    }

    // 5. Update Symptoms
    if (facts.symptoms && facts.symptoms.length > 0) {
      for (const sym of facts.symptoms) {
        const status = sym.statusChange || 'active';
        const symptomRecord: StoredSymptom = {
          id: 'sym-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          patientId: profile.id,
          symptom: sym.symptom,
          description: sym.description || sym.symptom,
          severity: sym.severity || 'moderate',
          duration: sym.duration || null,
          currentStatus: status,
          originalLanguage: targetLang,
          originalStatement: rawText,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId,
          verificationStatus: 'ai_extracted',
          extractionConfidence: 0.9,
          recordedAt: new Date(),
          updatedAt: new Date()
        };

        patientProfilingStore.addSymptom(symptomRecord);
        profileUpdated = true;

        let eventType = 'SYMPTOM_REPORTED';
        let eventTitle = `Symptom Reported: ${sym.symptom}`;
        if (status === 'improving') {
          eventType = 'SYMPTOM_UPDATED';
          eventTitle = `Symptom Improving: ${sym.symptom}`;
        } else if (status === 'resolved') {
          eventType = 'SYMPTOM_UPDATED';
          eventTitle = `Symptom Resolved: ${sym.symptom}`;
        } else if (status === 'recurred') {
          eventType = 'SYMPTOM_UPDATED';
          eventTitle = `Symptom Recurred: ${sym.symptom}`;
        }

        this.recordTimelineEvent(profile.id, {
          eventType,
          title: eventTitle,
          description: sym.duration ? `${sym.symptom} (Duration: ${sym.duration})` : sym.symptom,
          fieldName: 'symptoms',
          updatedValue: sym,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId
        });

        this.recordObservation(profile.id, {
          category: 'symptom',
          extractedInformation: sym,
          originalStatement: rawText,
          language: targetLang,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId,
          confidence: 0.9,
          verificationStatus: 'ai_extracted'
        });
      }

      // Update summary string on profile
      const activeSyms = patientProfilingStore.getFullPatientRecord(profile.id)?.symptoms || [];
      profile.primarySymptoms = activeSyms.map(s => s.symptom).slice(0, 4).join(', ');
    }

    // 6. Update Medications (distinguishing Current vs Stopped vs Historical)
    if (facts.medications && facts.medications.length > 0) {
      for (const med of facts.medications) {
        const medRecord: StoredMedication = {
          id: 'med-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          patientId: profile.id,
          medicationName: med.name,
          condition: med.condition || null,
          dosage: med.dosage || null,
          frequency: med.frequency || null,
          medicationStatus: med.status,
          sideEffects: med.sideEffects || null,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId,
          originalStatement: rawText,
          verificationStatus: 'ai_extracted',
          recordedAt: new Date(),
          updatedAt: new Date()
        };

        patientProfilingStore.addMedication(medRecord);
        profileUpdated = true;

        const eventType = med.status === 'stopped' ? 'MEDICATION_STOPPED' : (med.status === 'current' ? 'MEDICATION_STARTED' : 'HISTORY_DISCLOSED');
        const eventTitle = med.status === 'stopped' 
          ? `Discontinued Medication: ${med.name}`
          : (med.status === 'current' ? `Started Medication: ${med.name}` : `Historical Medication Disclosed: ${med.name}`);

        this.recordTimelineEvent(profile.id, {
          eventType,
          title: eventTitle,
          description: med.dosage ? `${med.name} (${med.dosage}) - Status: ${med.status}` : `${med.name} - Status: ${med.status}`,
          fieldName: 'medications',
          updatedValue: med,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId
        });

        this.recordObservation(profile.id, {
          category: 'medication',
          extractedInformation: med,
          originalStatement: rawText,
          language: targetLang,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId,
          confidence: 0.9,
          verificationStatus: 'ai_extracted'
        });
      }
    }

    // 7. Update Medical History
    if (facts.medicalHistory && facts.medicalHistory.length > 0) {
      for (const hist of facts.medicalHistory) {
        const histRecord: StoredMedicalHistory = {
          id: 'hist-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          patientId: profile.id,
          condition: hist.condition,
          description: hist.description || hist.condition,
          status: hist.status || 'historical',
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId,
          originalStatement: rawText,
          verificationStatus: 'ai_extracted',
          extractionConfidence: 0.9,
          recordedAt: new Date(),
          updatedAt: new Date()
        };

        patientProfilingStore.addMedicalHistory(histRecord);
        profileUpdated = true;

        this.recordTimelineEvent(profile.id, {
          eventType: 'HISTORY_DISCLOSED',
          title: `Medical History: ${hist.condition}`,
          description: `Disclosed history of ${hist.condition} (${hist.status || 'historical'}).`,
          fieldName: 'medicalHistory',
          updatedValue: hist,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId
        });

        this.recordObservation(profile.id, {
          category: 'history',
          extractedInformation: hist,
          originalStatement: rawText,
          language: targetLang,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId,
          confidence: 0.9,
          verificationStatus: 'ai_extracted'
        });
      }
    }

    // 8. Update Allergies
    if (facts.allergies && facts.allergies.length > 0) {
      for (const alg of facts.allergies) {
        const allergyRecord: StoredAllergy = {
          id: 'alg-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          patientId: profile.id,
          allergen: alg.allergen,
          reaction: alg.reaction || null,
          severity: alg.severity || 'moderate',
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId,
          originalStatement: rawText,
          verificationStatus: 'ai_extracted',
          recordedAt: new Date(),
          updatedAt: new Date()
        };

        patientProfilingStore.addAllergy(allergyRecord);
        profileUpdated = true;

        this.recordTimelineEvent(profile.id, {
          eventType: 'ALLERGY_ADDED',
          title: `Allergy Recorded: ${alg.allergen}`,
          description: alg.reaction ? `Reaction: ${alg.reaction} (${alg.severity || 'moderate'})` : `Allergic to ${alg.allergen}`,
          fieldName: 'allergies',
          updatedValue: alg,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId
        });

        this.recordObservation(profile.id, {
          category: 'allergy',
          extractedInformation: alg,
          originalStatement: rawText,
          language: targetLang,
          sourceConversationId: input.conversationId,
          sourceMessageId: input.messageId,
          confidence: 0.92,
          verificationStatus: 'ai_extracted'
        });
      }
    }

    // 9. Update Lifestyle
    if (facts.lifestyle) {
      const ls = facts.lifestyle;
      const currentLs = patientProfilingStore.getFullPatientRecord(profile.id)?.lifestyle;
      const updatedLs: StoredLifestyle = {
        id: currentLs?.id || 'life-' + Date.now().toString(36),
        patientId: profile.id,
        diet: ls.diet || currentLs?.diet || null,
        sleep: ls.sleep || currentLs?.sleep || null,
        physicalActivity: ls.physicalActivity || currentLs?.physicalActivity || null,
        substanceUse: ls.substanceUse || currentLs?.substanceUse || null,
        stressFactors: ls.stressFactors || currentLs?.stressFactors || null,
        sourceConversationId: input.conversationId,
        recordedAt: currentLs?.recordedAt || new Date(),
        updatedAt: new Date()
      };
      patientProfilingStore.setLifestyle(updatedLs);
      profileUpdated = true;
    }

    // 10. Update Conversation Count & Last Interaction
    profile.lastInteractionAt = new Date();
    if (isNewProfile) {
      profile.totalConversations = 1;
    } else {
      profile.totalConversations = Math.max(1, profile.totalConversations + 1);
    }

    // 11. Recalculate Completeness Score
    profile.completenessScore = this.calculateCompleteness(profile.id);

    // 12. Save Profile
    patientProfilingStore.saveProfile(profile);

    // Asynchronously synchronize with PostgreSQL if DB is available
    if (dbCircuitBreaker.isDbAvailable()) {
      this.syncProfileToPostgres(profile).catch(err => {
        dbCircuitBreaker.recordError(err);
      });
    }

    return profile;
  }

  /**
   * AI-powered Extraction using Gemini + Multilingual Fallback Rule Parser
   */
  public async extractFactsWithAI(text: string, lang: SupportedLanguage): Promise<ExtractedPatientFacts> {
    const isHypothetical = this.detectHypotheticalQuery(text);

    // Call Gemini for structured JSON extraction
    const prompt = `You are a clinical NLP extractor for Electropathy AI.
Analyze the following patient message and extract structured patient facts.
The message may be in English, Hindi (हिन्दी), Marathi (मराठी), Hinglish, or Romanized Devanagari.

Rules:
1. Distinguish hypothetical or general medical questions from PERSONAL patient facts. If the patient is asking generally (e.g. "What causes liver cirrhosis?", "Can people get fever from cold?"), set "isHypotheticalInquiry": true and leave personal symptoms/history empty.
2. If the patient mentions their name ("My name is Rahul", "Mera naam Rahul hai", "माझे नाव राहुल आहे") extract name.
3. If the patient mentions age ("I am 25", "25 saal", "२५ वर्षे"), extract age as an integer.
4. Extract current symptoms, symptom duration, and whether symptoms have improved ("better", "theek ho raha hai", "कमी झाले"), worsened, or recurred.
5. Extract medications: distinguish currently taking vs previously taken vs stopped medications.
6. Extract known medical conditions, family history, and allergies.
7. Return ONLY valid JSON adhering strictly to this schema:

{
  "isHypotheticalInquiry": boolean,
  "personalInfo": {
    "name": string or null,
    "age": number or null,
    "gender": "male" | "female" | "other" | null,
    "phone": string or null,
    "location": string or null
  },
  "symptoms": [
    {
      "symptom": string,
      "duration": string or null,
      "severity": "mild" | "moderate" | "severe" | null,
      "statusChange": "active" | "improving" | "resolved" | "worsened" | "recurred"
    }
  ],
  "medicalHistory": [
    {
      "condition": string,
      "status": "current" | "historical" | "family_history"
    }
  ],
  "medications": [
    {
      "name": string,
      "dosage": string or null,
      "status": "current" | "previous" | "stopped"
    }
  ],
  "allergies": [
    {
      "allergen": string,
      "reaction": string or null
    }
  ],
  "lifestyle": {
    "diet": string or null,
    "sleep": string or null
  }
}

PATIENT MESSAGE:
"${text}"`;

    try {
      const aiRes = await geminiService.generateText(prompt, undefined, {
        temperature: 0.1,
        maxOutputTokens: 600
      });

      const jsonMatch = aiRes.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed === 'object') {
          return {
            isHypotheticalInquiry: Boolean(parsed.isHypotheticalInquiry || isHypothetical),
            personalInfo: parsed.personalInfo,
            symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
            medicalHistory: Array.isArray(parsed.medicalHistory) ? parsed.medicalHistory : [],
            medications: Array.isArray(parsed.medications) ? parsed.medications : [],
            allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
            lifestyle: parsed.lifestyle
          };
        }
      }
    } catch (err: any) {
      console.warn('[PATIENT PROFILING AI FALLBACK] Using rule-based multilingual extractor:', err.message);
    }

    // Resilient Fallback Heuristic Parser
    return this.ruleBasedExtractor(text, lang, isHypothetical);
  }

  /**
   * Resilient Rule-Based Extractor for English, Hindi, and Marathi
   */
  private ruleBasedExtractor(text: string, lang: SupportedLanguage, isHypothetical: boolean): ExtractedPatientFacts {
    const lower = text.toLowerCase();
    const result: ExtractedPatientFacts = {
      isHypotheticalInquiry: isHypothetical,
      symptoms: [],
      medications: [],
      medicalHistory: [],
      allergies: []
    };

    if (isHypothetical) {
      return result;
    }

    // Name Extraction
    const namePatterns = [
      /(?:my name is|mera naam|naam hai|माझे नाव|नाव आहे)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i,
      /(?:i am|i'm)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i,
      /(?:myself)\s+([A-Za-z]+)/i
    ];
    for (const pat of namePatterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        let candidate = m[1].trim();
        // Remove trailing connector words
        candidate = candidate.replace(/\s+(?:and|or|i|aur|ani|ahe|hai|years|saal).*$/i, '').trim();
        if (candidate && !['suffering', 'experiencing', 'taking', 'patient', 'having', 'feeling'].includes(candidate.toLowerCase())) {
          result.personalInfo = result.personalInfo || {};
          result.personalInfo.name = candidate.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        }
      }
    }

    // Age Extraction
    const agePatterns = [
      /(?:i am|age is|umra|umr|उम्र|वय)\s*[:=]?\s*(\d{1,2})\s*(?:years|yrs|saal|साल|वर्षे)?/i,
      /(\d{1,2})\s*(?:years old|year old|yrs old|saal ka|साल की|साल का|साल|वर्षे वय)/i,
      /\b(?:age|वय|उम्र)\s*[:=]?\s*(\d{1,2})\b/i,
      /\b(\d{1,2})\s*(?:साल|वर्षे)\b/i
    ];
    for (const pat of agePatterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        const ageNum = parseInt(m[1], 10);
        if (ageNum > 0 && ageNum < 120) {
          result.personalInfo = result.personalInfo || {};
          result.personalInfo.age = ageNum;
          break;
        }
      }
    }

    // Status Transitions (improving / resolved / recurred / stopped)
    const isImproving = /better|improving|कम हो रहा|आराम है|कमी झाले|सुधारणा|कमी होत आहे/i.test(text);
    const isRecurred = /returned|back again|फिर से|पुन्हा सुरू|परत त्रास/i.test(text);
    const isStopped = /stopped|discontinued|बंद कर दिया|बंद केले|नाही घेत/i.test(text);

    // Symptom Detection
    const symptomKeywords = [
      { term: 'headache', hi: 'सिरदर्द', mr: 'डोकेदुखी', canonical: 'Headache' },
      { term: 'fever', hi: 'बुखार', mr: 'ताप', canonical: 'Fever' },
      { term: 'cough', hi: 'खांसी', mr: 'खोकला', canonical: 'Cough' },
      { term: 'joint pain', hi: 'जोड़ों का दर्द', mr: 'सांधेदुखी', canonical: 'Joint Pain' },
      { term: 'knee pain', hi: 'घुटने का दर्द', mr: 'गुडघेदुखी', canonical: 'Knee Pain' },
      { term: 'swelling', hi: 'सूजन', mr: 'सूज', canonical: 'Swelling / Inflammation' },
      { term: 'acidity', hi: 'एसिडिटी', mr: 'पित्त', canonical: 'Acidity / Gastritis' },
      { term: 'indigestion', hi: 'अपचन', mr: 'अपचन', canonical: 'Indigestion' },
      { term: 'nausea', hi: 'जी मिचलाना', mr: 'मळमळ', canonical: 'Nausea' },
      { term: 'fatigue', hi: 'कमजोरी', mr: 'थकवा', canonical: 'Fatigue / Weakness' }
    ];

    // Duration extraction
    let duration: string | undefined;
    const durMatch = text.match(/(\d+\s*(?:weeks?|days?|months?|years?|हफ्ते|दिन|महिने|दिवस|आठवडे))/i);
    if (durMatch) {
      duration = durMatch[1];
    }

    for (const sk of symptomKeywords) {
      if (lower.includes(sk.term) || text.includes(sk.hi) || text.includes(sk.mr)) {
        let statusChange: StoredSymptom['currentStatus'] = 'active';
        if (isImproving) statusChange = 'improving';
        if (isRecurred) statusChange = 'recurred';

        result.symptoms?.push({
          symptom: sk.canonical,
          duration,
          severity: 'moderate',
          statusChange
        });
      }
    }

    // Medication Detection
    const medKeywords = [
      { name: 'Paracetamol', match: /paracetamol|crocin|dolo|पॅरासिटामॉल/i },
      { name: 'Naproxen', match: /naproxen/i },
      { name: 'Metformin', match: /metformin/i },
      { name: 'Amlodipine', match: /amlodipine/i },
      { name: 'Electropathy S1', match: /s1|scrofoloso/i },
      { name: 'Electropathy C5', match: /c5|canceroso/i },
      { name: 'Electropathy A2', match: /a2|angiotico/i }
    ];

    for (const mk of medKeywords) {
      if (mk.match.test(text)) {
        let medStatus: 'current' | 'previous' | 'stopped' = 'current';
        if (isStopped || /stopped taking|बंद कर दिया|बंद केले/i.test(text)) {
          medStatus = 'stopped';
        } else if (/previously took|pehle leta tha|पूर्वी घेत होतो/i.test(text)) {
          medStatus = 'previous';
        }

        result.medications?.push({
          name: mk.name,
          status: medStatus
        });
      }
    }

    // Historical Condition Detection
    if (/migraine|मायग्रेन/i.test(text)) {
      result.medicalHistory?.push({
        condition: 'Migraine',
        status: 'historical'
      });
    }
    if (/diabetes|मधुमेह/i.test(text) && !isHypothetical) {
      result.medicalHistory?.push({
        condition: 'Diabetes Mellitus',
        status: 'current'
      });
    }
    if (/hypertension|high bp|रक्तदाब/i.test(text) && !isHypothetical) {
      result.medicalHistory?.push({
        condition: 'Hypertension',
        status: 'current'
      });
    }

    // Allergy Detection
    const allergyMatch = text.match(/(?:allergic to|allergy of|एलर्जी)\s*([A-Za-z\u0900-\u097F\s]+)/i);
    if (allergyMatch && allergyMatch[1]) {
      result.allergies?.push({
        allergen: allergyMatch[1].trim().slice(0, 30),
        reaction: 'Adverse reaction reported by patient'
      });
    }

    return result;
  }

  /**
   * Detects hypothetical medical inquiries to avoid false medical attribution
   */
  private detectHypotheticalQuery(text: string): boolean {
    const t = text.toLowerCase();
    const hypotheticalPatterns = [
      /^what (?:is|are|causes)/,
      /^can (?:someone|a person|people|you|we)/,
      /^how (?:does|is|do)/,
      /^why (?:do|does)/,
      /^tell me about/,
      /^explain/,
      /लक्षणे काय आहेत\??$/,
      /लक्षण क्या हैं\??$/,
      /हो सकता है क्या\??$/,
      /शक्य आहे का\??$/,
      /बद्दल माहिती सांगा/,
      /के बारे में बताएं/
    ];

    const personalIndicators = [
      /i have/,
      /i am suffering/,
      /my name/,
      /i feel/,
      /mujhe/,
      /mera/,
      /mala/,
      /maze/,
      /माझे/,
      /मला/
    ];

    const hasPersonalIndicator = personalIndicators.some(pat => pat.test(t));
    if (hasPersonalIndicator) {
      return false;
    }

    return hypotheticalPatterns.some(pat => pat.test(t));
  }

  /**
   * Resolve existing profile by userId or create a new profile
   */
  private async resolvePatientProfile(userId: string, personalInfo?: ExtractedPatientFacts['personalInfo']): Promise<StoredPatientProfile> {
    // 1. Check in-memory store
    let profile = patientProfilingStore.getProfileByUserId(userId);
    if (profile) {
      return profile;
    }

    // 2. Check PostgreSQL if available
    if (dbCircuitBreaker.isDbAvailable()) {
      try {
        const dbProfile = await prisma.patientProfile.findUnique({
          where: { userId }
        });
        if (dbProfile) {
          const mapped: StoredPatientProfile = {
            id: dbProfile.id,
            userId: dbProfile.userId,
            fullName: dbProfile.fullName,
            dateOfBirth: dbProfile.dateOfBirth?.toISOString() || null,
            age: dbProfile.age,
            gender: dbProfile.gender,
            phone: dbProfile.phone,
            email: dbProfile.email,
            location: dbProfile.location,
            consentStatus: dbProfile.consentStatus,
            profileStatus: dbProfile.profileStatus,
            completenessScore: dbProfile.completenessScore,
            primarySymptoms: dbProfile.primarySymptoms || '',
            totalConversations: 1,
            lastInteractionAt: dbProfile.lastInteractionAt,
            createdAt: dbProfile.createdAt,
            updatedAt: dbProfile.updatedAt
          };
          patientProfilingStore.saveProfile(mapped);
          return mapped;
        }
      } catch (err: any) {
        dbCircuitBreaker.recordError(err);
      }
    }

    // 3. Create New Profile
    const newId = 'pat-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const newProfile: StoredPatientProfile = {
      id: newId,
      userId,
      fullName: personalInfo?.name || 'Anonymous Patient',
      dateOfBirth: null,
      age: personalInfo?.age || null,
      gender: personalInfo?.gender || 'unspecified',
      phone: personalInfo?.phone || null,
      email: personalInfo?.email || null,
      location: personalInfo?.location || null,
      consentStatus: 'consented',
      profileStatus: 'active',
      completenessScore: 20,
      primarySymptoms: '',
      totalConversations: 1,
      lastInteractionAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    patientProfilingStore.saveProfile(newProfile);

    // Record Profile Created Timeline Event
    this.recordTimelineEvent(newId, {
      eventType: 'PROFILE_CREATED',
      title: 'Electropathy Patient Profile Initialized',
      description: 'Profile automatically created upon chatbot consultation interaction.'
    });

    return newProfile;
  }

  private recordTimelineEvent(patientId: string, event: Omit<StoredTimelineEvent, 'id' | 'patientId' | 'createdAt'>) {
    patientProfilingStore.addTimelineEvent({
      id: 'time-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      patientId,
      ...event,
      createdAt: new Date()
    });
  }

  private recordObservation(patientId: string, obs: Omit<StoredObservation, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>) {
    patientProfilingStore.addObservation({
      id: 'obs-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      patientId,
      ...obs,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  private calculateCompleteness(patientId: string): number {
    const full = patientProfilingStore.getFullPatientRecord(patientId);
    if (!full) return 10;

    let score = 0;
    if (full.profile.fullName && full.profile.fullName !== 'Anonymous Patient') score += 15;
    if (full.profile.age) score += 15;
    if (full.profile.gender && full.profile.gender !== 'unspecified') score += 10;
    if (full.profile.phone || full.profile.email) score += 10;
    if (full.symptoms.length > 0) score += 20;
    if (full.medications.length > 0) score += 15;
    if (full.medicalHistory.length > 0) score += 15;

    return Math.min(100, Math.max(15, score));
  }

  public getProfileByUserId(userId: string): StoredPatientProfile | null {
    return patientProfilingStore.getProfileByUserId(userId) || null;
  }

  private async syncProfileToPostgres(profile: StoredPatientProfile): Promise<void> {
    if (!dbCircuitBreaker.isDbAvailable()) return;

    try {
      await prisma.patientProfile.upsert({
        where: { id: profile.id },
        update: {
          fullName: profile.fullName,
          age: profile.age,
          gender: profile.gender,
          phone: profile.phone,
          email: profile.email,
          location: profile.location,
          primarySymptoms: profile.primarySymptoms,
          completenessScore: profile.completenessScore,
          lastInteractionAt: profile.lastInteractionAt,
          updatedAt: profile.updatedAt
        },
        create: {
          id: profile.id,
          userId: profile.userId,
          fullName: profile.fullName,
          age: profile.age,
          gender: profile.gender,
          phone: profile.phone,
          email: profile.email,
          location: profile.location,
          primarySymptoms: profile.primarySymptoms,
          completenessScore: profile.completenessScore,
          lastInteractionAt: profile.lastInteractionAt,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        }
      });
      dbCircuitBreaker.recordSuccess();
    } catch (err: any) {
      dbCircuitBreaker.recordError(err);
    }
  }
}

export const patientProfilingService = new PatientProfilingService();
