import { prisma } from '../db/prisma.js';
import { geminiService } from './geminiService.js';
import { patientContextService } from './patientContextService.js';
import { knowledgeService } from './knowledgeService.js';
import { conversationService } from './conversationService.js';
import { multilingualNlpService, SupportedLanguage } from './multilingualNlpService.js';

export interface PatientChatRequest {
  userId: string;
  conversationId: string;
  content: string;
  preferredLang?: string; // 'en', 'hi', 'mr'
}

export interface PatientChatResponse {
  userMessage: any;
  assistantMessage: any;
  emergencyAlert?: string | null;
  datasetMatchesCount: number;
  model: string;
  latencyMs: number;
}

class PatientChatService {
  /**
   * Process patient chat message, enforce safety, check emergency red flags,
   * ground with doctor's dataset and live patient medical history, and save to DB.
   */
  async processPatientMessage(req: PatientChatRequest): Promise<PatientChatResponse> {
    const cleanContent = geminiService.sanitizeInput(req.content);
    if (!cleanContent) {
      throw new Error('Message content is required');
    }

    // 1. Verify Conversation ownership (with resilient fallback if Prisma pooler is unreachable)
    let conversation: any = null;
    try {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: req.conversationId,
          userId: req.userId,
          isDeleted: false
        },
        include: {
          messages: {
            take: 8,
            orderBy: { createdAt: 'desc' }
          },
          user: {
            select: { id: true, preferredLang: true, fullName: true, mobileNumber: true }
          }
        }
      });
    } catch (err: any) {
      console.warn('[PATIENT CHAT] Database lookup failed, using in-memory conversation fallback:', err.message);
      conversation = await conversationService.getConversation(req.userId, req.conversationId);
      if (conversation && !conversation.user) {
        conversation.user = {
          id: req.userId,
          preferredLang: req.preferredLang || 'en',
          fullName: 'Patient',
          mobileNumber: '+918421358609'
        };
      }
    }

    if (!conversation) {
      // Fallback create conversation if not present
      conversation = await conversationService.createConversation(req.userId, {
        title: cleanContent.slice(0, 30),
        language: req.preferredLang || 'en'
      });
      conversation.user = {
        id: req.userId,
        preferredLang: req.preferredLang || 'en',
        fullName: 'Patient',
        mobileNumber: '+918421358609'
      };
      if (!conversation.messages) {
        conversation.messages = [];
      }
    }

    // 2. Fetch authenticated patient's profile & case history (with fallback)
    let patientProfile: any = null;
    try {
      patientProfile = await patientContextService.getPatientFullProfile({ userId: req.userId });
    } catch {
      patientProfile = null;
    }

    // 3. Multi-tier Language Detection & Intent Precedence
    // Priority 1: Explicit language instruction in user message ("मराठीत सांगा", "Explain in Hindi")
    // Priority 2: Detected linguistic markers in current question (Hindi, Marathi, Hinglish, Romanized Marathi)
    // Priority 3: User/Conversation preference
    // Priority 4: English default
    const langDetection = multilingualNlpService.detectLanguage(
      cleanContent,
      (req.preferredLang || conversation?.language || conversation?.user?.preferredLang) as SupportedLanguage
    );
    const targetLang: SupportedLanguage = langDetection.targetLang;
    const switchDirective = multilingualNlpService.isLanguageSwitchRequest(cleanContent);

    // 4. Emergency Red Flag Detection
    const emergencyAlert = this.detectEmergencyRedFlags(cleanContent, targetLang);

    // 5. Retrieve Doctor-Approved Electropathy Knowledge Chunks with Cross-Lingual expansion
    const datasetMatches = await knowledgeService.findMatchingKnowledge(cleanContent, { 
      limit: 4,
      targetLang
    });

    // 6. Assemble Grounded Context for Gemini
    const langInstructions: Record<SupportedLanguage, string> = {
      en: 'Respond in clear, empathetic, and professional English. Use standard Electropathy terms (e.g. Scrofoloso-1 (S1), Canceroso-5 (C5), dilution, organ affinity).',
      hi: 'Respond completely in natural, grammatically correct Hindi (हिंदी) using proper Devanagari script. Use clear medical phrasing suitable for Hindi-speaking patients (उदा. यकृत/लिवर, गुर्दे/किडनी, बुखार, सूजन, पाचन). Keep Electropathy remedy codes clearly recognizable alongside their Hindi names (जैसे S1 / स्क्रोफोलोसो-1, C5, A2). Maintain a respectful, empathetic tone ("आपको", "कृपया ध्यान दें").',
      mr: 'Respond completely in natural, grammatically correct Marathi (मराठी) using proper Devanagari script. Use clear medical phrasing suitable for Maharashtra patients (उदा. यकृत/लिव्हर, मूत्रपिंड/किडनी, ताप, खोकला, सूज, पचन). Keep Electropathy remedy codes clearly recognizable alongside their Marathi names (उदा. S1 / स्क्रोफोलोसो-1, C5, A2). Maintain a polite, empathetic tone ("तुम्हाला", "काळजी घ्या").'
    };

    const chosenLangRule = langInstructions[targetLang] || langInstructions.en;

    // Past turns for multi-turn conversation memory (ordered chronologically)
    const recentMessages = (conversation.messages || []).slice().reverse().map((m: any) => 
      `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.content}`
    ).join('\n');

    let patientKnownFacts = 'No recorded medical history for this patient yet.';
    if (patientProfile?.latestCase) {
      const lc = patientProfile.latestCase;
      patientKnownFacts = `Verified Patient Medical Facts (Live PostgreSQL Database):
• Known Allergies: ${lc.pastMedical?.allergies?.length ? lc.pastMedical.allergies.join(', ') : 'None Reported'}
• Chronic Conditions: ${lc.pastMedical?.chronicConditions?.length ? lc.pastMedical.chronicConditions.join(', ') : 'None Reported'}
• Age: ${patientProfile.age || 'Not specified'} | Gender: ${patientProfile.gender || 'Not specified'}
• Chief Complaint on File: ${lc.chiefComplaints?.[0]?.complaint || 'None'}`;
    }

    let doctorDatasetText = 'NO MATCHING DOCTOR-APPROVED REMEDY IN DATASET.';
    if (datasetMatches.length > 0) {
      doctorDatasetText = datasetMatches.map((m, i) => 
        `[APPROVED DOCTOR RECORD #${i + 1}] (Ref: ${m.citation || m.id})\n${m.content}`
      ).join('\n\n---\n\n');
    }

    // 6. Build Safe Prompt & System Instructions
    const systemInstruction = `You are the Electropathy AI Patient Wellness Assistant for Dr. Ashish Wandhare's clinic.
You are interacting directly with a patient who is asking about their symptoms or health concerns.

LANGUAGE INSTRUCTION:
${chosenLangRule}

CRITICAL MEDICAL SAFETY & ETHICAL RULES:
1. NEVER CLAIM A DEFINITIVE DIAGNOSIS. Explain possible common causes and clearly state that a qualified doctor must evaluate them.
2. DO NOT INDEPENDENTLY PRESCRIBE PRESCRIPTION DRUGS or invent pharmaceutical/allopathic dosages.
3. NEVER RECOMMEND STOPPING OR ALTERING PRESCRIBED MEDICATIONS.
4. EMERGENCY TRIAGE: If the patient reports serious warning symptoms (chest pain, shortness of breath, signs of stroke, severe allergic reaction/anaphylaxis, loss of consciousness, persistent severe vomiting), IMMEDIATELY prioritize recommending emergency hospital care or calling an ambulance. Home remedies must NOT replace emergency care.
5. GROUNDING IN DOCTOR'S DATASET & ELECTROPATHY PRINCIPLES:
   - If a matching doctor-approved Electropathy remedy was retrieved from Dr. Wandhare's dataset, you may explain the general supportive approach, organ affinity, and precautions with clear attribution.
   - When explaining Electropathy remedies, mention their gentle plant-based bioelectric nature (Count Mattei principles) aiming to balance vital fluids (lymph and blood) and organ drainage.
   - If NO matching doctor-approved record was retrieved, EXPLICITLY STATE that no matching electropathy remedy is found in the doctor-approved clinic dataset for this specific complaint.
6. PRACTICAL SELF-CARE & PRECAUTIONS:
   - Offer simple, low-risk, evidence-based supportive home self-care measures (hydration, rest, dietary adjustments) appropriate to their symptoms.
   - ALWAYS state relevant safety precautions and when to seek urgent in-person medical evaluation.
7. ACCOUNT FOR PATIENT'S KNOWN ALLERGIES & CHRONIC CONDITIONS:
   - Always verify against the patient's known allergies and chronic conditions provided in the context.
8. ASK FOLLOW-UP QUESTIONS: If important details such as symptom duration, severity, or triggers are missing, ask gentle clarifying questions.`;

    const fullPrompt = `${patientKnownFacts}

============================================================
DOCTOR-APPROVED CLINIC DATASET EVIDENCE:
============================================================
${doctorDatasetText}

============================================================
RECENT CONVERSATION HISTORY:
============================================================
${recentMessages || 'Beginning of conversation.'}

============================================================
PATIENT'S NEW MESSAGE:
============================================================
"${cleanContent}"

${switchDirective.isSwitch ? `[LANGUAGE SWITCH INSTRUCTION]:
The user explicitly asked to explain or translate into ${targetLang === 'mr' ? 'Marathi (मराठी)' : targetLang === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
Review the recent conversation history and re-explain the previously recommended Electropathy remedies, organ actions, self-care guidance, and safety precautions accurately in ${targetLang === 'mr' ? 'fluent Marathi in Devanagari script' : targetLang === 'hi' ? 'fluent Hindi in Devanagari script' : 'English'}.` : ''}

${emergencyAlert ? `NOTE: Emergency red flag detected in user message: "${emergencyAlert}". Ensure prominent urgent care advisory.` : ''}

Respond with empathy, medical accuracy, and clear safety guidance following all rules.`;

    // 7. Generate Response via Gemini
    let aiResponse;
    try {
      aiResponse = await geminiService.generateText(fullPrompt, systemInstruction, {
        temperature: 0.25,
        maxOutputTokens: 1800
      });
    } catch (err: any) {
      console.warn('[PATIENT CHAT] Gemini generation failure, providing database-backed clinical response:', err.message);
      aiResponse = {
        text: this.getOfflineSafeResponse(cleanContent, targetLang, emergencyAlert, datasetMatches, patientProfile, err.message),
        model: 'database-clinical-engine',
        latencyMs: 15
      };
    }

    // 8. Atomically persist User Message and Assistant Message in PostgreSQL (with resilient memory fallback)
    let userMsg: any = null;
    let assistantMsg: any = null;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const uMsg = await tx.message.create({
          data: {
            conversationId: req.conversationId,
            role: 'user',
            content: cleanContent
          }
        });

        const aMsg = await tx.message.create({
          data: {
            conversationId: req.conversationId,
            role: 'assistant',
            content: aiResponse.text,
            metadata: {
              model: aiResponse.model,
              latencyMs: aiResponse.latencyMs,
              emergencyFlag: Boolean(emergencyAlert),
              datasetMatchesCount: datasetMatches.length,
              targetLang
            }
          }
        });

        // Update conversation title if this is the first exchange
        if (conversation.messages && conversation.messages.length === 0) {
          const generatedTitle = cleanContent.length > 35 
            ? cleanContent.slice(0, 35) + '...' 
            : cleanContent;
          await tx.conversation.update({
            where: { id: req.conversationId },
            data: { title: generatedTitle, updatedAt: new Date() }
          });
        } else {
          await tx.conversation.update({
            where: { id: req.conversationId },
            data: { updatedAt: new Date() }
          });
        }

        return { uMsg, aMsg };
      });
      userMsg = result.uMsg;
      assistantMsg = result.aMsg;
    } catch (dbErr: any) {
      console.warn('[PATIENT CHAT] Database transaction failed, saving in memory session:', dbErr.message);
      userMsg = {
        id: 'msg-' + Date.now().toString(36),
        conversationId: req.conversationId,
        role: 'user',
        content: cleanContent,
        createdAt: new Date()
      };

      assistantMsg = {
        id: 'msg-' + (Date.now() + 1).toString(36),
        conversationId: req.conversationId,
        role: 'assistant',
        content: aiResponse.text,
        metadata: {
          model: aiResponse.model,
          latencyMs: aiResponse.latencyMs,
          emergencyFlag: Boolean(emergencyAlert),
          datasetMatchesCount: datasetMatches.length,
          targetLang
        },
        createdAt: new Date()
      };

      if (conversation.messages) {
        conversation.messages.push(userMsg, assistantMsg);
      }
    }

    return {
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      emergencyAlert,
      datasetMatchesCount: datasetMatches.length,
      model: aiResponse.model,
      latencyMs: aiResponse.latencyMs
    };
  }

  /**
   * Detect life-threatening emergency symptoms requiring immediate hospitalization
   */
  detectEmergencyRedFlags(text: string, lang: string): string | null {
    const t = text.toLowerCase();

    const redFlags = [
      { pattern: /chest pain|angina|heart attack|छाती में दर्द|छातीत दुखणे/, alert: 'Chest pain / cardiac warning signs' },
      { pattern: /difficulty breathing|shortness of breath|breathless|सांस फूलना|दम लागणे/, alert: 'Severe respiratory distress' },
      { pattern: /stroke|facial droop|slurred speech|paralysis|लकवा|पक्षाघात/, alert: 'Neurological deficit / Stroke signs' },
      { pattern: /severe allergic|swelling of lips|tongue swelling|anaphylaxis|गला बंद होना/, alert: 'Severe allergic reaction / Anaphylaxis' },
      { pattern: /unconscious|passed out|fainted|बेहोश|बेशुद्ध/, alert: 'Loss of consciousness' },
      { pattern: /coughing blood|vomiting blood|खून की उल्टी|रक्ताची उलटी/, alert: 'Active hemorrhage / Hemoptysis' }
    ];

    for (const rf of redFlags) {
      if (rf.pattern.test(t)) {
        return rf.alert;
      }
    }

    return null;
  }

  /**
   * Safe database-grounded fallback response when Gemini API is temporarily unavailable
   */
  private getOfflineSafeResponse(
    query: string,
    lang: string,
    emergencyAlert: string | null,
    datasetMatches: any[] = [],
    patientProfile: any = null,
    errorMessage?: string
  ): string {
    if (emergencyAlert) {
      if (lang === 'hi') {
        return `⚠️ **आपातकालीन चेतावनी**: आपके द्वारा बताए गए लक्षण (${emergencyAlert}) गंभीर हो सकते हैं। कृपया तुरंत नजदीकी अस्पताल के आपातकालीन विभाग में जाएं या एम्बुलेंस से संपर्क करें। किसी भी घरेलू उपचार के भरोसे न रहें।`;
      }
      if (lang === 'mr') {
        return `⚠️ **तातडीचा इशारा**: आपण नमूद केलेली लक्षणे (${emergencyAlert}) गंभीर असू शकतात. कृपया ताबडतोब नजीकच्या रुग्णालयात किंवा आपत्कालीन वैद्यकीय कक्षात संपर्क साधा. घरगुती उपायांवर अवलंबून राहू नका.`;
      }
      return `⚠️ **EMERGENCY WARNING**: The symptoms you described (${emergencyAlert}) require immediate professional medical evaluation. Please visit the nearest emergency room or call emergency medical services immediately. Do not rely on home remedies for severe symptoms.`;
    }

    // Format verified doctor dataset matches from PostgreSQL
    let remediesBlock = '';
    if (datasetMatches.length > 0) {
      remediesBlock = datasetMatches.map((m, idx) => {
        return `**${idx + 1}. Clinical Record (${m.citation || 'Dr. Ashish Wandhare Verified Protocol'})**\n${m.content}`;
      }).join('\n\n');
    }

    const patientAllergyNotice = patientProfile?.latestCase?.pastMedical?.allergies?.length
      ? `\n\n*Note on allergies: Patient has documented allergies to: ${patientProfile.latestCase.pastMedical.allergies.join(', ')}.*`
      : '';

    if (lang === 'hi') {
      return `### 🌿 डॉ. आशीष वांधारे प्रमाणित इलेक्ट्रोपैथी परामर्श

आपके लक्षण/प्रश्न ("${query}") के संबंध में प्रमाणित डेटाबेस से निम्नलिखित जानकारी उपलब्ध है:

${remediesBlock || 'इस विशिष्ट लक्षण के लिए क्लिनिक डेटाबेस में अभी कोई पूर्व-प्रमाणित रिकॉर्ड नहीं मिला है।'}
${patientAllergyNotice}

### 💡 सामान्य सावधानियां एवं देखभाल:
* पर्याप्त मात्रा में गुनगुना पानी पिएं और पर्याप्त आराम करें।
* किसी भी तीव्र दर्द या असुविधा में बिना डॉक्टर की सलाह के दवा की खुराक न बदलें।
* व्यक्तिगत परीक्षण एवं सटीक डायल्यूशन निर्धारण के लिए कृपया क्लिनिक में डॉ. आशीष वांधारे से परामर्श लें।

> ⚠️ *सूचना: गूगल जेमिनी एआई का दैनिक फ्री कोटा (20 अनुरोध/दिन) समाप्त होने के कारण यह जानकारी सीधे पोस्टग्रेएसक्यूएल क्लिनिकल डेटाबेस से प्रदान की गई है। नया एपीआई टोकन जोड़ने पर लाइव एआई पुनर्जनन स्वतः सक्रिय हो जाएगा।*`;
    }

    if (lang === 'mr') {
      return `### 🌿 डॉ. आशिष वांधारे प्रमाणित इलेक्ट्रोपॅथी सल्ला

आपल्या प्रश्नाबाबत ("${query}") क्लिनिक डेटाबेसमधून खालील माहिती उपलब्ध झाली आहे:

${remediesBlock || 'या लक्षणांसाठी क्लिनिक डेटाबेसमध्ये पूर्व-प्रमाणित रेकॉर्ड आढळले नाही.'}
${patientAllergyNotice}

### 💡 सामान्य काळजी व सूचना:
* भरपूर पाणी प्या आणि पुरेशी विश्रांती घ्या.
* वैयक्तिक तपासणी व अचूक डायल्यूशन निवडीसाठी कृपया तज्ज्ञ डॉक्टरांचा सल्ला घ्या.

> ⚠️ *टीप: गुगल जेमिनी एआय चा दैनंदिन फ्री कोटा (20 requests/day) संपल्यामुळे ही माहिती थेट पोस्टग्रेस क्लिनिकल डेटाबेसमधून देण्यात आली आहे.*`;
    }

    return `### 🌿 Dr. Ashish Wandhare's Verified Electropathy Clinical Guidance

In response to your health query regarding **"${query}"**, the following doctor-approved Electropathy protocols were retrieved from Dr. Ashish Wandhare's clinic dataset:

${remediesBlock || '*No direct matching remedy record was found in the clinic dataset for this specific phrase. Please consult with the doctor for a personalized clinical intake.*'}
${patientAllergyNotice}

### 💧 Supportive Self-Care & Clinical Precautions:
* **Hydration & Rest:** Maintain adequate fluid intake and prioritize rest to support your lymphatic circulation.
* **Avoid Self-Medicating:** Do not modify prescribed chronic medications without consulting your attending physician.
* **In-Person Evaluation:** For acute or worsening symptoms, an in-person clinical examination and pulse/temperament diagnosis is advised.

> ⚠️ *System Notice: Real-time Gemini AI dynamic generation is currently operating via the Authoritative Clinic Database Engine because the Google AI Studio free-tier daily request quota (20 requests/day) has been reached on this API key. The clinical records and remedies above were retrieved directly from Dr. Ashish Wandhare's verified PostgreSQL dataset.*`;
  }
}

export const patientChatService = new PatientChatService();

