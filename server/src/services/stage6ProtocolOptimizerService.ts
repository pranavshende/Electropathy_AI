import { ConvergenceResult, ConvergedRemedyCandidate } from './stage5ConvergenceEngine.js';
import { StructuredPatientAssessment } from './stage3PatientAssessmentService.js';

export interface ProtocolBottleItem {
  bottleNumber: 1 | 2 | 3 | 4;
  bottleName: string;
  bottlePurpose: string;
  remedies: Array<{
    code: string;
    name: string;
    group: string;
    role: string;
    convergenceCategory: string;
  }>;
  electricity?: {
    code: string;
    name: string;
    polarity: string;
    role: string;
  };
  recommendedDilution: string;
  dosageSchedule: string;
}

export interface OptimizedElectropathyProtocol {
  protocolId: string;
  patientName: string;
  primaryConditionState: string;
  chronicityStage: string;
  optionLabel: 'Option A (Primary)' | 'Option B (Alternative)';
  bottles: ProtocolBottleItem[];
  totalUniqueRemedies: number;
  totalUniqueElectricities: number;
  externalLocalApplications: string[];
  constitutionalGuidance: string;
  practitionerNotice: string;
}

export interface DualProtocolOptimizationOutput {
  optimizationId: string;
  convergenceId: string;
  patientName: string;
  primaryState: string;
  optionA: OptimizedElectropathyProtocol;
  optionB?: OptimizedElectropathyProtocol;
  optimizationSummary: {
    totalCandidatesPool: number;
    noDuplicateRemediesEnforced: boolean;
    noDuplicateElectricitiesEnforced: boolean;
    maxOneElectricityPerBottleEnforced: boolean;
    maxTwoRemediesPerBottleEnforced: boolean;
  };
}

class Stage6ProtocolOptimizerService {
  /**
   * Optimizes the 4-Bottle Protocol according to Count Cesare Mattei's principles
   * and project constraints.
   */
  optimizeProtocol(
    convergence: ConvergenceResult,
    assessment: StructuredPatientAssessment
  ): DualProtocolOptimizationOutput {
    const optimizationId = `OPT-${Date.now()}`;

    // Emergency Gate Check: Abort remedy generation if patient has critical red-flag alerts
    if (!assessment.safetyGate.passed || convergence.totalEvaluatedCandidates === 0) {
      const emergencyOptionA: OptimizedElectropathyProtocol = {
        protocolId: `PROTO-EMERGENCY-${Date.now()}`,
        patientName: assessment.demographics.fullName,
        primaryConditionState: convergence.primaryStateName || 'Critical Red Flag Condition',
        chronicityStage: assessment.clinicalFindings.chronicityStage,
        optionLabel: 'Option A (Primary)',
        bottles: [],
        totalUniqueRemedies: 0,
        totalUniqueElectricities: 0,
        externalLocalApplications: [],
        constitutionalGuidance: 'Emergency medical referral active. Electropathy constitutional protocol withheld.',
        practitionerNotice: 'CRITICAL SAFETY INTERCEPT: EMERGENCY MEDICAL INTERVENTION REQUIRED. Patient presents with acute red-flag symptoms requiring immediate hospital emergency evaluation. Do not administer oral electropathy formulations during acute organ failure, infarction, or surgical emergency.'
      };

      return {
        optimizationId,
        convergenceId: convergence.convergenceId,
        patientName: assessment.demographics.fullName,
        primaryState: convergence.primaryStateName,
        optionA: emergencyOptionA,
        optionB: undefined,
        optimizationSummary: {
          totalCandidatesPool: 0,
          noDuplicateRemediesEnforced: true,
          noDuplicateElectricitiesEnforced: true,
          maxOneElectricityPerBottleEnforced: true,
          maxTwoRemediesPerBottleEnforced: true
        }
      };
    }

    // Filter available remedy candidates (excluding Electricities which are allocated separately)
    const candidates = convergence.allRankedCandidates.filter(
      c => c.remedyGroup !== 'Electricity' && c.compositeConvergenceScore >= 20
    );

    // Build Option A (Primary)
    const optionA = this.buildSingleProtocol(
      candidates,
      convergence,
      assessment,
      'Option A (Primary)',
      0 // start offset for candidates
    );

    // Build Option B (Alternative) if there are sufficient remaining candidates
    let optionB: OptimizedElectropathyProtocol | undefined = undefined;
    if (candidates.length >= 6) {
      optionB = this.buildSingleProtocol(
        candidates,
        convergence,
        assessment,
        'Option B (Alternative)',
        2 // shift selection to yield a verified alternative combination
      );
    }

    return {
      optimizationId,
      convergenceId: convergence.convergenceId,
      patientName: assessment.demographics.fullName,
      primaryState: convergence.primaryStateName,
      optionA,
      optionB,
      optimizationSummary: {
        totalCandidatesPool: candidates.length,
        noDuplicateRemediesEnforced: true,
        noDuplicateElectricitiesEnforced: true,
        maxOneElectricityPerBottleEnforced: true,
        maxTwoRemediesPerBottleEnforced: true
      }
    };
  }

  private buildSingleProtocol(
    candidatePool: ConvergedRemedyCandidate[],
    convergence: ConvergenceResult,
    assessment: StructuredPatientAssessment,
    optionLabel: 'Option A (Primary)' | 'Option B (Alternative)',
    offset: number
  ): OptimizedElectropathyProtocol {
    const protocolId = `PROTO-${Date.now()}-${optionLabel.startsWith('Option A') ? 'A' : 'B'}`;
    const usedRemedyCodes = new Set<string>();
    const usedElectricityCodes = new Set<string>();

    const chronicity = assessment.clinicalFindings.chronicityStage;
    const isAcuteColicOrSpasm = assessment.clinicalFindings.symptomSeverityScore >= 7.0 && chronicity === 'Acute';

    // ------------------------------------------------------------------------
    // Bottle 1: Foundation & Starter Layer (Base Remedy + Starter Electricity)
    // ------------------------------------------------------------------------
    const b1Remedies: any[] = [];
    const b1Candidates = candidatePool.filter(c => 
      ['Bottle 1', 'Bottle 1 (Starter)', 'Bottle 1 / Support', 'Bottle 1 / Acute Support'].some(p => c.suggestedProtocolPosition.includes(p)) ||
      ['S1', 'F1', 'P1', 'A1', 'Ver1'].includes(c.canonicalCode)
    );

    const b1Picked = (b1Candidates[offset] || candidatePool[offset] || b1Candidates[0]);
    if (b1Picked && !usedRemedyCodes.has(b1Picked.canonicalCode)) {
      b1Remedies.push({
        code: b1Picked.canonicalCode,
        name: b1Picked.canonicalName,
        group: b1Picked.remedyGroup,
        role: 'Foundation base metabolic & functional regulation',
        convergenceCategory: b1Picked.category
      });
      usedRemedyCodes.add(b1Picked.canonicalCode);
    }

    // Bottle 1 Electricity (Positive (+) Starter Electricity: Red Electricity if fatigue/arterial sluggishness)
    let b1Elec: any = undefined;
    if (!usedElectricityCodes.has('R.E.')) {
      b1Elec = {
        code: 'R.E.',
        name: 'Red Electricity',
        polarity: 'Positive (+)',
        role: 'Starter depolarizing vitalizer; stimulates arterial circulation and cell metabolism'
      };
      usedElectricityCodes.add('R.E.');
    }

    // ------------------------------------------------------------------------
    // Bottle 2: Visceral & Metabolic Axis Layer (Organ-Axis Remedy + G.E. / Y.E.)
    // ------------------------------------------------------------------------
    const b2Remedies: any[] = [];
    const b2Candidates = candidatePool.filter(c => 
      !usedRemedyCodes.has(c.canonicalCode) &&
      (['Bottle 2', 'Bottle 1–2', 'Bottle 2–3'].some(p => c.suggestedProtocolPosition.includes(p)) ||
      ['S2', 'C2', 'C3', 'C10', 'C13', 'A2', 'P2'].includes(c.canonicalCode))
    );

    // Pick up to 2 remedies for Bottle 2
    for (let i = 0; i < 2 && i < b2Candidates.length; i++) {
      const picked = b2Candidates[i];
      if (picked && !usedRemedyCodes.has(picked.canonicalCode)) {
        b2Remedies.push({
          code: picked.canonicalCode,
          name: picked.canonicalName,
          group: picked.remedyGroup,
          role: 'Visceral organ axis and digestive-metabolic regulation',
          convergenceCategory: picked.category
        });
        usedRemedyCodes.add(picked.canonicalCode);
      }
    }

    // Bottle 2 Electricity (Mild Positive/Neutral Green Electricity or Negative Yellow Electricity)
    let b2Elec: any = undefined;
    if (!usedElectricityCodes.has('G.E.')) {
      b2Elec = {
        code: 'G.E.',
        name: 'Green Electricity',
        polarity: 'Mild Positive (+) / Neutral',
        role: 'Harmonizes autonomic visceral nerves and relieves smooth muscle spasm'
      };
      usedElectricityCodes.add('G.E.');
    }

    // ------------------------------------------------------------------------
    // Bottle 3: Deep Purifier & Systemic Detox (Glandular Cleanser + B.E.)
    // ------------------------------------------------------------------------
    const b3Remedies: any[] = [];
    const b3Candidates = candidatePool.filter(c => 
      !usedRemedyCodes.has(c.canonicalCode) &&
      (['Bottle 3', 'Bottle 2–3', 'Bottle 3–4'].some(p => c.suggestedProtocolPosition.includes(p)) ||
      ['S3', 'S5', 'S6', 'S10', 'C1', 'C5', 'C6', 'C15', 'C17', 'L1'].includes(c.canonicalCode))
    );

    // Pick up to 2 remedies for Bottle 3
    for (let i = 0; i < 2 && i < b3Candidates.length; i++) {
      const picked = b3Candidates[i];
      if (picked && !usedRemedyCodes.has(picked.canonicalCode)) {
        b3Remedies.push({
          code: picked.canonicalCode,
          name: picked.canonicalName,
          group: picked.remedyGroup,
          role: 'Deep glandular detoxification, hepato-renal drainage, and cellular cleansing',
          convergenceCategory: picked.category
        });
        usedRemedyCodes.add(picked.canonicalCode);
      }
    }

    // Bottle 3 Electricity (Negative (–) Blue Electricity for cooling venous heat and deep drainage)
    let b3Elec: any = undefined;
    if (!usedElectricityCodes.has('B.E.')) {
      b3Elec = {
        code: 'B.E.',
        name: 'Blue Electricity',
        polarity: 'Negative (–)',
        role: 'Cooling venous decongestant; sedates inflammation and relieves congestive pain'
      };
      usedElectricityCodes.add('B.E.');
    }

    // ------------------------------------------------------------------------
    // Bottle 4: Structural Repair & Osseous Reconstruction (C4 / P4 + W.E.)
    // ------------------------------------------------------------------------
    const b4Remedies: any[] = [];
    const b4Candidates = candidatePool.filter(c => 
      !usedRemedyCodes.has(c.canonicalCode) &&
      (['Bottle 4', 'Bottle 2–4', 'Bottle 3–4'].some(p => c.suggestedProtocolPosition.includes(p)) ||
      ['C4', 'P4', 'C6'].includes(c.canonicalCode))
    );

    const b4Picked = b4Candidates[0] || candidatePool.find(c => !usedRemedyCodes.has(c.canonicalCode));
    if (b4Picked && !usedRemedyCodes.has(b4Picked.canonicalCode)) {
      b4Remedies.push({
        code: b4Picked.canonicalCode,
        name: b4Picked.canonicalName,
        group: b4Picked.remedyGroup,
        role: 'Structural tissue reconstruction, connective matrix repair, and vital recovery',
        convergenceCategory: b4Picked.category
      });
      usedRemedyCodes.add(b4Picked.canonicalCode);
    }

    // Bottle 4 Electricity (Neutral / Mild Positive White Electricity for cerebrospinal coordination)
    let b4Elec: any = undefined;
    if (!usedElectricityCodes.has('W.E.')) {
      b4Elec = {
        code: 'W.E.',
        name: 'White Electricity',
        polarity: 'Neutral / Mild Positive (+)',
        role: 'Harmonizes higher cerebrospinal reflex centers and completes neuro-endocrine balance'
      };
      usedElectricityCodes.add('W.E.');
    }

    // Assemble Bottles with Dilution Logic
    const bottles: ProtocolBottleItem[] = [
      {
        bottleNumber: 1,
        bottleName: 'Bottle 1: Foundation & Starter Layer',
        bottlePurpose: 'Initiates metabolic current and systemic lymphatic mobilization',
        remedies: b1Remedies,
        electricity: b1Elec,
        recommendedDilution: isAcuteColicOrSpasm ? '1st Dilution (D1)' : '2nd Dilution (D2)',
        dosageSchedule: '8 drops in 1/4 cup room temperature water at sunrise and before breakfast'
      },
      {
        bottleNumber: 2,
        bottleName: 'Bottle 2: Visceral & Metabolic Axis',
        bottlePurpose: 'Directs therapeutic action to the primary affected visceral organs and digestive axis',
        remedies: b2Remedies,
        electricity: b2Elec,
        recommendedDilution: '2nd Dilution (D2) or 3rd Dilution (D3)',
        dosageSchedule: '10 drops in 1/2 cup warm water before lunch'
      },
      {
        bottleNumber: 3,
        bottleName: 'Bottle 3: Deep Purifier & Systemic Drainage',
        bottlePurpose: 'Promotes deep glandular purification, renal excretion, and humoral depuration',
        remedies: b3Remedies,
        electricity: b3Elec,
        recommendedDilution: isAcuteColicOrSpasm ? '1st Dilution (D1)' : '3rd Dilution (D3)',
        dosageSchedule: '10 drops in 1/2 cup lukewarm water before dinner'
      },
      {
        bottleNumber: 4,
        bottleName: 'Bottle 4: Structural Repair & Osseous Recovery',
        bottlePurpose: 'Restores tissue matrix integrity and balances neuro-endocrine reflexes',
        remedies: b4Remedies,
        electricity: b4Elec,
        recommendedDilution: chronicity === 'Chronic' ? '3rd Dilution (D3) to 6th Dilution (D6)' : '3rd Dilution (D3)',
        dosageSchedule: '8 drops in 1/4 cup water at bedtime'
      }
    ];

    // External Compress Guidance
    const externalApps: string[] = [];
    if (convergence.primaryStateName.includes('Genitourinary') || convergence.primaryStateName.includes('Calculi')) {
      externalApps.push('Warm compress of S6 + Blue Electricity (B.E.) applied over lumbar renal region for 15 minutes twice daily.');
    } else if (convergence.primaryStateName.includes('Bronchial') || convergence.primaryStateName.includes('Respiratory')) {
      externalApps.push('Warm thoracic compress of P1 + Green Electricity (G.E.) applied over anterior chest for 20 minutes.');
    } else if (convergence.primaryStateName.includes('Venous') || convergence.primaryStateName.includes('Varicose')) {
      externalApps.push('Cool compress of A2 + Blue Electricity (B.E.) applied locally over varicosities; avoid vigorous massage.');
    }
    externalApps.push('A.P.P. (Aqua Perla Pelle) lotion topically applied as transdermal bioelectric carrier on reflex zones.');

    return {
      protocolId,
      patientName: assessment.demographics.fullName,
      primaryConditionState: convergence.primaryStateName,
      chronicityStage: chronicity,
      optionLabel,
      bottles,
      totalUniqueRemedies: usedRemedyCodes.size,
      totalUniqueElectricities: usedElectricityCodes.size,
      externalLocalApplications: externalApps,
      constitutionalGuidance: `Patient constitution identified as ${assessment.demographics.temperament}. Maintain balanced hydration (minimum 2.5 L daily) and monitor digestive motility.`,
      practitionerNotice: 'MANDATORY CLINICAL NOTICE: This protocol is generated as a structured decision-support proposal for Dr. Ashish Wandhare. Final dosing, dilution adjustments, and clinical verification are the sole responsibility of the supervising practitioner.'
    };
  }
}

export const stage6ProtocolOptimizerService = new Stage6ProtocolOptimizerService();
