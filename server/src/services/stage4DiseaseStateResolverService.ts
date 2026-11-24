import { StructuredPatientAssessment } from './stage3PatientAssessmentService.js';
import { stage2MappingMatrixService, SymptomResolutionResult } from './stage2MappingMatrixService.js';
import { DISEASE_STATE_TAXONOMY, ORGAN_TAXONOMY } from '../data/taxonomies/index.js';

export interface ResolvedClinicalStateProfile {
  resolutionId: string;
  assessmentId: string;
  patientName: string;
  isSafetyBlocked: boolean;
  safetyReason?: string;
  
  // Disease-State Synthesis
  primaryDiseaseState: {
    stateId: string;
    stateName: string;
    stage: string;
    confidence: number;
    pathophysiologicalMechanism: string;
  };
  secondaryDiseaseStates: Array<{
    stateId: string;
    stateName: string;
    stage: string;
    confidence: number;
  }>;
  
  // Organ & Tissue Affinity Synthesis
  affectedOrganAxes: Array<{
    organId: string;
    organName: string;
    systemName: string;
    supportedByLabMarkers: boolean;
  }>;
  tissueAffinityTargets: string[];
  
  // Therapeutic Target Requirements
  prioritizedRequirements: string[];
  
  // Candidate Convergence Matches from Dual Tables
  candidateRemedies: Array<{
    canonicalCode: string;
    canonicalName: string;
    remedyGroup: string;
    polarity: string;
    protocolPosition: string;
    evidenceClass: string;
    relevanceScore: number;
    matchedReasons: string[];
  }>;

  clinicalSynthesisNotes: string;
}

class Stage4DiseaseStateResolverService {
  /**
   * Resolves clinical disease states, organ axes, and dual-table remedy candidates
   * from structured patient assessment and lab reports.
   */
  resolveDiseaseStates(assessment: StructuredPatientAssessment): ResolvedClinicalStateProfile {
    const resolutionId = `RES-${Date.now()}`;

    // 1. Check Safety Gate Interception
    if (!assessment.safetyGate.passed) {
      return {
        resolutionId,
        assessmentId: assessment.assessmentId,
        patientName: assessment.demographics.fullName,
        isSafetyBlocked: true,
        safetyReason: assessment.safetyGate.emergencyReferralText || 'Emergency Red Flag Intercepted',
        primaryDiseaseState: {
          stateId: 'STATE_EMERGENCY_TRIAGE',
          stateName: 'Acute Medical Emergency / Conventional Referral Required',
          stage: 'Acute Functional',
          confidence: 1.0,
          pathophysiologicalMechanism: 'Immediate critical condition requiring hospital evaluation; remedy selection deferred.'
        },
        secondaryDiseaseStates: [],
        affectedOrganAxes: [],
        tissueAffinityTargets: [],
        prioritizedRequirements: [],
        candidateRemedies: [],
        clinicalSynthesisNotes: 'AUTOMATIC REMEDY GENERATION HALTED: Critical emergency symptoms detected. Patient must seek immediate emergency medical care.'
      };
    }

    // 2. Build Composite Clinical Narrative
    const complaintTexts = assessment.clinicalFindings.normalizedComplaints.map(c => c.complaint).join(' ');
    const labTexts = assessment.laboratoryBiomarkers.abnormalMarkers.map(m => `${m.testName} high`).join(' ');
    const compositeQuery = `${complaintTexts} ${labTexts}`.trim();

    // 3. Query Stage 2 State-Organ Mapping Matrix
    const matrixResult = stage2MappingMatrixService.resolveUserQuery(compositeQuery);

    // 4. Synthesize Primary and Secondary Disease States
    let primaryState = matrixResult.resolvedDiseaseStates[0];
    if (!primaryState) {
      // Default fallback state if general
      const defaultState = DISEASE_STATE_TAXONOMY[0] || {
        stateId: 'STATE_LYMPHATIC_TOXICITY',
        stateName: 'Lymphatic Toxicity & Glandular Congestion',
        stage: 'Functional'
      };
      primaryState = {
        stateId: defaultState.stateId,
        stateName: defaultState.stateName,
        stage: defaultState.stage,
        confidence: 0.70
      };
    }

    const fullPrimaryDef = DISEASE_STATE_TAXONOMY.find(d => d.stateId === primaryState.stateId);

    const secondaryStates = matrixResult.resolvedDiseaseStates.slice(1, 4);

    // 5. Cross-Correlate with Laboratory Biomarkers & Organs
    const affectedOrganAxes: any[] = [];
    for (const org of matrixResult.affectedOrgans) {
      const isLabSupported = assessment.laboratoryBiomarkers.criticalOrganFlags.some(
        f => f.toLowerCase().includes(org.organName.toLowerCase()) || org.systemName.toLowerCase().includes(f.toLowerCase())
      );
      affectedOrganAxes.push({
        ...org,
        supportedByLabMarkers: isLabSupported
      });
    }

    // Tissues extraction from organ taxonomy
    const tissueAffinityTargets = new Set<string>();
    for (const org of affectedOrganAxes) {
      for (const sys of ORGAN_TAXONOMY) {
        const found = sys.organs.find(o => o.organId === org.organId);
        if (found) {
          found.tissues.forEach(t => tissueAffinityTargets.add(t.tissueName));
        }
      }
    }

    // 6. Formulate Clinical Synthesis Notes
    const synthesisNotes = `Clinical state resolved to "${primaryState.stateName}" (${primaryState.stage}). ` +
      `Affected organs: ${affectedOrganAxes.map(o => o.organName).join(', ') || 'Systemic Lymphatic'}. ` +
      `Identified ${matrixResult.candidateRemedies.length} candidate remedies across Table A and Table B.`;

    return {
      resolutionId,
      assessmentId: assessment.assessmentId,
      patientName: assessment.demographics.fullName,
      isSafetyBlocked: false,
      primaryDiseaseState: {
        stateId: primaryState.stateId,
        stateName: primaryState.stateName,
        stage: primaryState.stage,
        confidence: primaryState.confidence,
        pathophysiologicalMechanism: fullPrimaryDef?.pathophysiologicalMechanism || 'Organ tissue dysregulation and humoral congestion.'
      },
      secondaryDiseaseStates: secondaryStates,
      affectedOrganAxes,
      tissueAffinityTargets: Array.from(tissueAffinityTargets),
      prioritizedRequirements: matrixResult.recommendedPhysiologicalRequirements,
      candidateRemedies: matrixResult.candidateRemedies,
      clinicalSynthesisNotes: synthesisNotes
    };
  }
}

export const stage4DiseaseStateResolverService = new Stage4DiseaseStateResolverService();
