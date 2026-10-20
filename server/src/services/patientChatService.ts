import { prisma } from '../db/prisma.js';
import { geminiService } from './geminiService.js';
import { patientContextService } from './patientContextService.js';
import { knowledgeService } from './knowledgeService.js';

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

    // 1. Verify Conversation ownership
    const conversation = await prisma.conversation.findFirst({
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

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    // 2. Fetch authenticated patient's live profile & case history from PostgreSQL
    const patientProfile = await patientContextService.getPatientFullProfile({ userId: req.userId });

    // Determine target language (priority: conversation language > user preferred language > 'en')
    const targetLang = conversation.language || conversation.user.preferredLang || req.preferredLang || 'en';

    // 3. Emergency Red Flag Detection
    const emergencyAlert = this.detectEmergencyRedFlags(cleanContent, targetLang);

    // 4. Retrieve Doctor-Approved Electropathy Knowledge Chunks
    const datasetMatches = await knowledgeService.findMatchingKnowledge(cleanContent, { limit: 3 });

    // 5. Assemble Grounded Context for Gemini
    const langInstructions: Record<string, string> = {
      en: 'Respond in clear, empathetic, and professional English.',
      hi: 'Respond completely in natural, clear, and empathetic Hindi (हिंदी). Use proper Devanagari script.',
      mr: 'Respond completely in natural, clear, and empathetic Marathi (मराठी). Use proper Devanagari script.'
    };

    const chosenLangRule = langInstructions[targetLang] || langInstructions.en;

    // Past turns for multi-turn conversation memory (ordered chronologically)
    const recentMessages = conversation.messages.slice().reverse().map(m => 
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
5. GROUNDING IN DOCTOR'S DATASET:
   - If a matching doctor-approved Electropathy remedy was retrieved from Dr. Wandhare's dataset, you may explain the general supportive approach and precautions with clear attribution.
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
      console.warn('[PATIENT CHAT] Gemini generation failure, providing safe offline clinical response:', err.message);
      aiResponse = {
        text: this.getOfflineSafeResponse(cleanContent, targetLang, emergencyAlert),
        model: 'offline-safe-guardrail',
        latencyMs: 10
      };
    }

    // 8. Atomically persist User Message and Assistant Message in PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      const userMsg = await tx.message.create({
        data: {
          conversationId: req.conversationId,
          role: 'user',
          content: cleanContent
        }
      });

      const assistantMsg = await tx.message.create({
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
      if (conversation.messages.length === 0) {
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

      return { userMsg, assistantMsg };
    });

    return {
      userMessage: result.userMsg,
      assistantMessage: result.assistantMsg,
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
   * Safe offline fallback response when Gemini API is temporarily unavailable
   */
  private getOfflineSafeResponse(query: string, lang: string, emergencyAlert: string | null): string {
    if (emergencyAlert) {
      if (lang === 'hi') {
        return `⚠️ **आपातकालीन चेतावनी**: आपके द्वारा बताए गए लक्षण (${emergencyAlert}) गंभीर हो सकते हैं। कृपया तुरंत नजदीकी अस्पताल के आपातकालीन विभाग में जाएं या एम्बुलेंस से संपर्क करें। किसी भी घरेलू उपचार के भरोसे न रहें।`;
      }
      if (lang === 'mr') {
        return `⚠️ **तातडीचा इशारा**: आपण नमूद केलेली लक्षणे (${emergencyAlert}) गंभीर असू शकतात. कृपया ताबडतोब नजीकच्या रुग्णालयात किंवा आपत्कालीन वैद्यकीय कक्षात संपर्क साधा. घरगुती उपायांवर अवलंबून राहू नका.`;
      }
      return `⚠️ **EMERGENCY WARNING**: The symptoms you described (${emergencyAlert}) require immediate professional medical evaluation. Please visit the nearest emergency room or call emergency medical services immediately. Do not rely on home remedies for severe symptoms.`;
    }

    if (lang === 'hi') {
      return `नमस्ते! आपके प्रश्न "${query}" के संबंध में: कृपया पर्याप्त पानी पिएं और पर्याप्त आराम करें। सटीक निदान एवं इलेक्ट्रोपैथी परामर्श के लिए कृपया योग्य चिकित्सक से व्यक्तिगत रूप से संपर्क करें।`;
    }
    if (lang === 'mr') {
      return `नमस्कार! आपल्या प्रश्नाबाबत ("${query}"): कृपया भरपूर पाणी प्या आणि विश्रांती घ्या. अचूक निदान आणि इलेक्ट्रोपॅथी उपचारांसाठी कृपया तज्ज्ञ डॉक्टरांशी संपर्क साधा.`;
    }
    return `Thank you for sharing your concern regarding "${query}". For general comfort, ensure adequate hydration and rest. Because safe healthcare requires thorough clinical assessment, please consult a qualified healthcare practitioner for an accurate evaluation.`;
  }
}

export const patientChatService = new PatientChatService();
