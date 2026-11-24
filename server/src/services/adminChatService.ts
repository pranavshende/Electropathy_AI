import { geminiService } from './geminiService.js';
import { patientContextService, StructuredPatientProfile } from './patientContextService.js';
import { knowledgeService, RetrievedKnowledgeChunk } from './knowledgeService.js';
import { auditService } from './auditService.js';
import { stage3PatientAssessmentService, PatientAssessmentInput } from './stage3PatientAssessmentService.js';
import { stage4DiseaseStateResolverService, ResolvedClinicalStateProfile } from './stage4DiseaseStateResolverService.js';
import { stage5ConvergenceEngine, ConvergenceResult } from './stage5ConvergenceEngine.js';
import { stage6ProtocolOptimizerService, DualProtocolOptimizationOutput } from './stage6ProtocolOptimizerService.js';

export interface AdminChatRequest {
  adminId: string;
  query: string;
  patientId?: string; // Optional caseId or userId
  ipAddress?: string;
}

export interface AdminChatResponse {
  answer: string;
  patientProfile?: StructuredPatientProfile | null;
  doctorDatasetMatches: Array<{
    id: string;
    category: string;
    conditionOrTitle?: string;
    citation?: string;
    content: string;
    relevanceScore?: number;
  }>;
  dualProtocol?: DualProtocolOptimizationOutput;
  convergence?: ConvergenceResult;
  diseaseStateResolution?: ResolvedClinicalStateProfile;
  missingInformation: string[];
  criticalSafetyAlerts: string[];
  geminiInterpretation?: string;
  precautions?: string[];
  model: string;
  latencyMs: number;
}

class AdminChatService {
  async processAdminQuery(req: AdminChatRequest): Promise<AdminChatResponse> {
    const cleanQuery = geminiService.sanitizeInput(req.query);
    if (!cleanQuery) {
      throw new Error('Query text is required');
    }

    // 1. Resolve Patient Context if patientId provided or mentioned
    let patientProfile: StructuredPatientProfile | null = null;
    let queryPatientId = req.patientId;

    if (queryPatientId) {
      patientProfile = await patientContextService.getPatientFullProfile({ caseId: queryPatientId });
      if (!patientProfile) {
        patientProfile = await patientContextService.getPatientFullProfile({ userId: queryPatientId });
      }
    } else {
      // Check if query contains a 10-digit mobile number or known patient name
      const phoneMatch = cleanQuery.match(/\b(?:\+91)?[6-9]\d{9}\b/);
      if (phoneMatch) {
        patientProfile = await patientContextService.getPatientFullProfile({ contactNumber: phoneMatch[0] });
      }
    }

    // 2. Retrieve Doctor-Approved Electropathy Knowledge Chunks
    let knowledgeQuery = cleanQuery;
    if (patientProfile?.latestCase?.chiefComplaints?.[0]?.complaint) {
      knowledgeQuery += ` ${patientProfile.latestCase.chiefComplaints[0].complaint}`;
    }
    const datasetMatches = await knowledgeService.findMatchingKnowledge(knowledgeQuery, { limit: 4 });

    // 3. Assemble Grounded Context for Gemini
    let patientContextText = 'NO SPECIFIC PATIENT SELECTED.';
    if (patientProfile) {
      const lc = patientProfile.latestCase;
      const complaintsStr = lc?.chiefComplaints?.map(c => 
        `- Complaint: ${c.complaint} | Duration: ${c.duration || 'Not specified'} | Severity: ${c.severity !== undefined ? c.severity + '/10' : 'Unrecorded'} | Aggravating/Relieving: ${c.factors || 'None'}`
      ).join('\n') || 'None recorded';

      const prevCasesStr = patientProfile.previousCases.map(pc =>
        `- Date: ${pc.createdAt.toISOString().split('T')[0]} | Status: ${pc.status} | Complaints: ${JSON.stringify(pc.chiefComplaints)}`
      ).join('\n') || 'No previous cases';

      patientContextText = `VERIFIED PATIENT DATABASE RECORD (Source: PostgreSQL live):
• Patient Name: ${patientProfile.patientName}
• Case ID: ${patientProfile.id}
• Age: ${patientProfile.age} | Gender: ${patientProfile.gender} | Contact: ${patientProfile.contactNumber}
• Status: ${lc?.status || 'Unknown'} | Total Submitted Cases: ${patientProfile.totalCases}
• Chief Complaints:
${complaintsStr}
• Present Illness & Previous Treatments:
  - Description: ${lc?.presentIllness?.description || 'None recorded'}
  - Previous Treatments: ${lc?.presentIllness?.previousTreatments || 'None recorded'}
  - Response to Treatments: ${lc?.presentIllness?.responseToTreatment || 'Not documented'}
• Past Medical History & Allergies:
  - Known Allergies: ${lc?.pastMedical?.allergies?.length ? lc.pastMedical.allergies.join(', ') : 'None Reported / Empty'}
  - Chronic Conditions: ${lc?.pastMedical?.chronicConditions?.length ? lc.pastMedical.chronicConditions.join(', ') : 'None Reported'}
  - Past Surgeries: ${lc?.pastMedical?.surgeries || 'None'}
• Lifestyle & Personal History:
  - Diet: ${lc?.lifestyle?.diet || 'Not recorded'} | Sleep: ${lc?.lifestyle?.sleep || 'Not recorded'} | Stress: ${lc?.lifestyle?.stressLevel || 'Not recorded'}
• Electropathy Details:
  - Temperament: ${lc?.electropathyDetails?.temperament || 'Not assessed'}
  - Notes: ${lc?.electropathyDetails?.notes || 'None'}
• Previous Case Records Comparison:
${prevCasesStr}
• Detected Missing Clinical Information:
${patientProfile.missingInformation.length ? patientProfile.missingInformation.map(m => `⚠️ ${m}`).join('\n') : 'All baseline clinical fields present'}
• Critical Safety Flags:
${patientProfile.criticalSafetyAlerts.length ? patientProfile.criticalSafetyAlerts.map(a => `🚨 ${a}`).join('\n') : 'No acute emergency flags detected'}`;
    }

    let doctorDatasetText = 'NO MATCHING DOCTOR-APPROVED DATASET RECORD FOUND.';
    if (datasetMatches.length > 0) {
      doctorDatasetText = datasetMatches.map((m, idx) => 
        `[DOCTOR DATASET MATCH #${idx + 1}] (Reference: ${m.citation || m.id})\n${m.content}`
      ).join('\n\n---\n\n');
    }

    // 4. v2026 Engine: Stages 3–6 Convergence & 4-Bottle Optimization Execution
    const assessmentInput: PatientAssessmentInput = {
      fullName: patientProfile?.patientName || 'Consultation Patient',
      age: patientProfile?.age || 40,
      gender: (patientProfile?.gender as any) || 'other',
      contactNumber: patientProfile?.contactNumber || 'N/A',
      chiefComplaints: patientProfile?.latestCase?.chiefComplaints?.map(c => ({
        complaint: c.complaint,
        duration: c.duration,
        severity: c.severity,
        aggravatingFactors: c.factors
      })) || [{ complaint: cleanQuery, severity: 6 }],
      presentIllnessDescription: patientProfile?.latestCase?.presentIllness?.description || cleanQuery,
      chronicConditions: patientProfile?.latestCase?.pastMedical?.chronicConditions || [],
      knownAllergies: patientProfile?.latestCase?.pastMedical?.allergies || [],
      temperament: (patientProfile?.latestCase?.electropathyDetails?.temperament as any) || 'Lymphatic'
    };

    const assessment = stage3PatientAssessmentService.assessPatient(assessmentInput);
    const diseaseStateResolution = stage4DiseaseStateResolverService.resolveDiseaseStates(assessment);
    const convergence = stage5ConvergenceEngine.evaluateConvergence(diseaseStateResolution);
    const dualProtocol = stage6ProtocolOptimizerService.optimizeProtocol(convergence, assessment);

    // Format Convergence & 4-Bottle Protocol Details for Gemini Grounding
    let protocolSummaryText = '';
    if (!assessment.safetyGate.passed) {
      protocolSummaryText = `⚠️ CLINICAL SAFETY INTERCEPT ACTIVE:
Patient triggered acute red-flag emergency safety rules:
${assessment.safetyGate.alerts.map(a => `- ${a.category}: ${a.clinicalAction}`).join('\n')}
AUTOMATIC PROTOCOL GENERATION HAS BEEN HALTED. Immediate hospital medical intervention is mandated.`;
    } else {
      const bText = (p: typeof dualProtocol.optionA) => p.bottles.map(b => 
        `  • Bottle ${b.bottleNumber} (${b.bottleName} - ${b.recommendedDilution}): Remedies: [${b.remedies.map(r => `${r.code} (${r.name})`).join(', ')}] | Electricity: [${b.electricity ? `${b.electricity.code} (${b.electricity.polarity})` : 'None'}] | Schedule: ${b.dosageSchedule}`
      ).join('\n');

      protocolSummaryText = `RESOLVED DISEASE STATE & CONVERGENCE EVIDENCE:
• Primary Disease State: ${diseaseStateResolution.primaryDiseaseState.stateName} (Stage: ${diseaseStateResolution.primaryDiseaseState.stage})
• Affected Organ Axes: ${diseaseStateResolution.affectedOrganAxes.map(o => o.organName).join(', ')}
• Top Converged Candidates:
  - Category A (High Convergence): ${convergence.categoryA_Candidates.map(c => `${c.canonicalCode} (${c.compositeConvergenceScore} pts)`).join(', ') || 'None'}
  - Category B (Organ Aligned): ${convergence.categoryB_Candidates.map(c => `${c.canonicalCode} (${c.compositeConvergenceScore} pts)`).join(', ') || 'None'}
  - Category C (State Aligned): ${convergence.categoryC_Candidates.map(c => `${c.canonicalCode} (${c.compositeConvergenceScore} pts)`).join(', ') || 'None'}

OPTIMIZED 4-BOTTLE PROTOCOL (Count Cesare Mattei System):
[OPTION A (Primary Formulations)]:
${bText(dualProtocol.optionA)}
External Applications: ${dualProtocol.optionA.externalLocalApplications.join(', ') || 'None required'}
Constitutional Guidance: ${dualProtocol.optionA.constitutionalGuidance}

${dualProtocol.optionB ? `[OPTION B (Alternative Formulations)]:
${bText(dualProtocol.optionB)}` : ''}`;
    }

    // 5. Gemini Prompt & System Instruction
    const systemInstruction = `You are the Electropathy AI Clinical & Administrative Decision Support Assistant built for Dr. Ashish Wandhare.
You are assisting authorized clinical administrators and practitioners.

ELECTROPATHY CLINICAL & PROTOCOL PRINCIPLES (Count Cesare Mattei System):
1. POLARITY LAW: Match positive remedies/electricities to negative physiological states; negative remedies to positive/hyperactive states; neutral conductors (W.E., G.E., A.P.P.) for equilibrium.
2. 4-BOTTLE PROTOCOL ARCHITECTURE:
   - Bottle 1 (Base / Starter): General metabolic & lymphatic starter (e.g. S1, F1, P1, A1, R.E.).
   - Bottle 2 (Metabolic / Digestive / Functional): Specific organ axis regulation (e.g. S2, C2, C3, C10, C13, A2, P2, Y.E.).
   - Bottle 3 (Deep Purifier / Drainage): Deep glandular, hepato-renal, cellular detoxification (e.g. S3, S5, S6, S10, C1, C5, C6, C15, C17, L1, B.E., W.E.).
   - Bottle 4 (Structural / Recovery): Osseous, connective, chronic mucous repair (e.g. C4, P4).
3. DILUTION POTENCIES:
   - D1 / D2: Acute colic, spasms, organ stimulation, physical tissue deficiency.
   - D3: Functional normalization and balanced systemic maintenance.
   - Higher Dilutions (D6–D30): Chronic, degenerative, neuropathic, or hypersensitive constitutions.
4. EXTERNAL & LOCAL APPLICATIONS: Detail compress points, compresses with A.P.P. (Aqua Perla Pelle), or specific electricity applications (+ / – poles).

STRICT GROUNDING & MEDICAL SAFETY RULES:
1. BASE YOUR CLINICAL REPORT STRICTLY on the supplied VERIFIED PATIENT DATABASE RECORD, DOCTOR-APPROVED DATASET, and the RESOLVED CONVERGENCE 4-BOTTLE PROTOCOL.
2. NEVER FABRICATE, invent, or hallucinate patient details, test results, medicines, or dosages.
3. CLEARLY DISTINGUISH FOUR DISTINCT SECTIONS in your response:
   - "### 📋 Patient Clinical Record Summary" (Pure database facts: complaints, history, allergies, previous treatments)
   - "### 🌿 Doctor-Approved Electropathy Dataset Findings" (Verified remedies from Dr. Wandhare's dataset with citations, polarities, and organ axes)
   - "### ⚡ Electropathy Protocol & Polarity Formulation" (Structured 4-Bottle protocol, dilution levels D1-D3, electricity pairing, external applications)
   - "### 💡 Clinical Interpretation & Safety Precautions" (AI differential reasoning, allergy alerts, red flag warnings, missing data alerts)
4. IF NO MATCHING DOCTOR-APPROVED RECORD EXISTS in the provided dataset, you MUST EXPLICITLY STATE:
   "No matching record was found in the doctor-approved dataset for this specific presentation." You may explain general medical principles, but NEVER portray them as verified doctor-approved remedies.
5. IF THE PATIENT HAS REPORTED ALLERGIES OR RED FLAGS, prominently highlight them under Precautions.
6. Provide a concise, highly structured, professional Markdown output suitable for medical review.`;

    const fullPrompt = `${patientContextText}

============================================================
DOCTOR-APPROVED MEDICINE DATASET EVIDENCE:
============================================================
${doctorDatasetText}

============================================================
v2026 DUAL-TABLE CONVERGENCE & 4-BOTTLE OPTIMIZER OUTPUT:
============================================================
${protocolSummaryText}

============================================================
ADMINISTRATOR / PRACTITIONER QUERY:
============================================================
"${cleanQuery}"

Provide a comprehensive, structured response answering the query with complete accuracy.`;

    // 6. Generate AI Response
    let aiResponse;
    try {
      aiResponse = await geminiService.generateText(fullPrompt, systemInstruction, {
        temperature: 0.15,
        maxOutputTokens: 2500
      });
    } catch (err: any) {
      console.warn('[ADMIN CHAT] Falling back to structured local clinical synthesis due to Gemini error:', err.message);
      // Graceful fallback response when external AI is offline or quota exceeded
      aiResponse = {
        text: `### 📋 Patient Clinical Record Summary\n\n${patientContextText}\n\n### 🌿 Doctor-Approved Electropathy Dataset Findings\n\n${doctorDatasetText}\n\n### ⚡ Electropathy Protocol & Polarity Formulation\n\n${protocolSummaryText}\n\n> ⚠️ *Note: Gemini AI generation is temporarily delayed or offline (${err.message}). The authoritative database records and verified doctor dataset matches above were retrieved directly from PostgreSQL.*`,
        model: 'database-fallback-engine',
        latencyMs: 15
      };
    }

    // 7. Record Audit Log for Administrative Access
    try {
      await auditService.log(
        req.adminId,
        'ADMIN_AI_QUERY',
        patientProfile?.id || undefined,
        {
          patientName: patientProfile?.patientName || 'None',
          contactNumber: patientProfile?.contactNumber || 'None',
          datasetMatchesCount: datasetMatches.length,
          queryLength: cleanQuery.length
        },
        req.ipAddress
      );
    } catch (auditErr) {
      console.warn('[ADMIN CHAT] Audit logging warning:', auditErr);
    }

    return {
      answer: aiResponse.text,
      patientProfile,
      doctorDatasetMatches: datasetMatches.map(m => ({
        id: m.id,
        category: m.category,
        conditionOrTitle: (m.metadata as any)?.conditionOrTitle,
        citation: m.citation,
        content: m.content,
        relevanceScore: m.relevanceScore
      })),
      dualProtocol,
      convergence,
      diseaseStateResolution,
      missingInformation: patientProfile?.missingInformation || [],
      criticalSafetyAlerts: [
        ...(patientProfile?.criticalSafetyAlerts || []),
        ...assessment.safetyGate.alerts.map(a => `${a.category}: ${a.clinicalAction}`)
      ],
      model: aiResponse.model,
      latencyMs: aiResponse.latencyMs
    };
  }
}

export const adminChatService = new AdminChatService();
