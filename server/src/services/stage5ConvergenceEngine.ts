import { ResolvedClinicalStateProfile } from './stage4DiseaseStateResolverService.js';
import { stage1DualTableService } from './stage1DualTableService.js';
import { stage2MappingMatrixService } from './stage2MappingMatrixService.js';

export type ConvergenceCategory = 'Category_A' | 'Category_B' | 'Category_C' | 'Category_D';

export interface ConvergedRemedyCandidate {
  canonicalCode: string;
  canonicalName: string;
  remedyGroup: string;
  polarity: string;
  suggestedProtocolPosition: string;
  category: ConvergenceCategory;
  categoryLabel: string;
  stateScore: number;
  organScore: number;
  compositeConvergenceScore: number;
  branchA_CoreEvidence: {
    matchedStateName?: string;
    organAxis?: string;
    stage?: string;
    dominantState?: string;
  } | null;
  branchB_OrganEvidence: {
    spgMedicineName?: string;
    spgGroup?: string;
    organActionText?: string;
    pdfPage?: number;
  } | null;
  conflictWarnings: string[];
}

export interface ConvergenceResult {
  convergenceId: string;
  resolutionId: string;
  patientName: string;
  primaryStateName: string;
  affectedOrgansSummary: string[];
  totalEvaluatedCandidates: number;
  categoryA_Candidates: ConvergedRemedyCandidate[];
  categoryB_Candidates: ConvergedRemedyCandidate[];
  categoryC_Candidates: ConvergedRemedyCandidate[];
  categoryD_Candidates: ConvergedRemedyCandidate[];
  allRankedCandidates: ConvergedRemedyCandidate[];
  clinicalObservations: string[];
}

class Stage5ConvergenceEngine {
  /**
   * Evaluates Branch A (Table A: Core State) and Branch B (Table B: SPG Organ Action)
   * and classifies candidates into Category A, B, C, D evidence tiers.
   */
  evaluateConvergence(profile: ResolvedClinicalStateProfile): ConvergenceResult {
    const convergenceId = `CONV-${Date.now()}`;
    const clinicalObservations: string[] = [];

    if (profile.isSafetyBlocked) {
      return {
        convergenceId,
        resolutionId: profile.resolutionId,
        patientName: profile.patientName,
        primaryStateName: profile.primaryDiseaseState.stateName,
        affectedOrgansSummary: [],
        totalEvaluatedCandidates: 0,
        categoryA_Candidates: [],
        categoryB_Candidates: [],
        categoryC_Candidates: [],
        categoryD_Candidates: [],
        allRankedCandidates: [],
        clinicalObservations: ['CONVERGENCE EVALUATION HALTED: Emergency medical condition flagged.']
      };
    }

    const tableA = stage1DualTableService.getTableARecords();
    const tableB = stage1DualTableService.getTableBRecords();
    const primaryStateName = profile.primaryDiseaseState.stateName.toLowerCase();
    const secondaryStateNames = profile.secondaryDiseaseStates.map(s => s.stateName.toLowerCase());
    const organNames = profile.affectedOrganAxes.map(o => o.organName.toLowerCase());
    const tissueTargets = profile.tissueAffinityTargets.map(t => t.toLowerCase());

    const evaluatedCandidates: ConvergedRemedyCandidate[] = [];

    // Evaluate every canonical remedy in the system
    const allIdentities = stage1DualTableService.getAllIdentities();

    for (const identity of allIdentities) {
      let stateScore = 0;
      let organScore = 0;
      const conflictWarnings: string[] = [];

      let branchAEvidence: any = null;
      let branchBEvidence: any = null;

      // -------------------------------------------------------------
      // Branch A Evaluation (Table A Core 38)
      // -------------------------------------------------------------
      const coreRecord = tableA.find(a => a.code.toUpperCase() === identity.canonicalCode.toUpperCase());
      if (coreRecord) {
        const domLower = coreRecord.dominantState.toLowerCase();
        const secLower = coreRecord.secondaryStates.toLowerCase();
        const axisLower = coreRecord.organAxis.toLowerCase();

        // Check primary state match
        if (primaryStateName.includes(domLower) || domLower.includes(primaryStateName)) {
          stateScore += 55;
          branchAEvidence = {
            matchedStateName: coreRecord.dominantState,
            organAxis: coreRecord.organAxis,
            stage: coreRecord.preferredStage,
            dominantState: coreRecord.dominantState
          };
        } else {
          // Check secondary states
          for (const secSt of secondaryStateNames) {
            if (secLower.includes(secSt) || secSt.includes(secLower) || domLower.includes(secSt)) {
              stateScore += 35;
              branchAEvidence = {
                matchedStateName: coreRecord.secondaryStates,
                organAxis: coreRecord.organAxis,
                stage: coreRecord.preferredStage,
                dominantState: coreRecord.dominantState
              };
              break;
            }
          }
        }

        // Check Table A organ axis alignment
        for (const org of organNames) {
          if (axisLower.includes(org)) {
            stateScore += 25;
            break;
          }
        }
      }

      // -------------------------------------------------------------
      // Branch B Evaluation (Table B SPG 60)
      // -------------------------------------------------------------
      const spgRecords = tableB.filter(b => 
        (b.matchedCoreCode && b.matchedCoreCode.toUpperCase() === identity.canonicalCode.toUpperCase()) ||
        b.sourceCode.toUpperCase() === identity.canonicalCode.toUpperCase()
      );

      if (spgRecords.length > 0) {
        const spg = spgRecords[0];
        if (spg) {
          const spgTextLower = spg.organPhysiologicalAction.toLowerCase();

          // Check organ alignment
          for (const org of organNames) {
            if (spgTextLower.includes(org) || spg.normalizedOrganTerms.includes(org)) {
              organScore += 45;
              branchBEvidence = {
                spgMedicineName: spg.medicineName,
                spgGroup: spg.group,
                organActionText: spg.organPhysiologicalAction,
                pdfPage: spg.pdfPage
              };
              break;
            }
          }

          // Check tissue target alignment
          for (const tis of tissueTargets) {
            if (spgTextLower.includes(tis) || spg.normalizedTissueTerms.includes(tis)) {
              organScore += 25;
              if (!branchBEvidence) {
                branchBEvidence = {
                  spgMedicineName: spg.medicineName,
                  spgGroup: spg.group,
                  organActionText: spg.organPhysiologicalAction,
                  pdfPage: spg.pdfPage
                };
              }
              break;
            }
          }
        }
      }

      // -------------------------------------------------------------
      // Direct Boost from Stage 4 Pre-Ranked Candidates
      // -------------------------------------------------------------
      const preMatch = profile.candidateRemedies.find(c => c.canonicalCode === identity.canonicalCode);
      if (preMatch) {
        stateScore += 20;
        organScore += 15;
      }

      // Determine Category Classification
      const isStrongState = stateScore >= 35;
      const isStrongOrgan = organScore >= 35;

      let category: ConvergenceCategory;
      let categoryLabel: string;

      if (isStrongState && isStrongOrgan) {
        category = 'Category_A';
        categoryLabel = 'Category A: Strong State Match + Strong Organ Match';
      } else if (isStrongState && !isStrongOrgan) {
        category = 'Category_B';
        categoryLabel = 'Category B: Strong State Match + Limited Organ Match';
      } else if (!isStrongState && isStrongOrgan) {
        category = 'Category_C';
        categoryLabel = 'Category C: Limited State Match + Strong Organ Match';
      } else {
        category = 'Category_D';
        categoryLabel = 'Category D: Conflict / Insufficient Evidence';
      }

      const compositeScore = Math.round((stateScore * 0.55 + organScore * 0.45) * 10) / 10;

      // Only include candidates with measurable relevance (> 20)
      if (compositeScore >= 20 || category !== 'Category_D') {
        const matrixEntry = stage2MappingMatrixService.getMatrixEntry(identity.canonicalCode);

        evaluatedCandidates.push({
          canonicalCode: identity.canonicalCode,
          canonicalName: identity.canonicalName,
          remedyGroup: identity.remedyGroup,
          polarity: matrixEntry?.polarity || 'Neutral',
          suggestedProtocolPosition: matrixEntry?.protocolPosition || 'Bottle 2',
          category,
          categoryLabel,
          stateScore,
          organScore,
          compositeConvergenceScore: compositeScore,
          branchA_CoreEvidence: branchAEvidence,
          branchB_OrganEvidence: branchBEvidence,
          conflictWarnings
        });
      }
    }

    // Sort descending by composite score
    evaluatedCandidates.sort((a, b) => b.compositeConvergenceScore - a.compositeConvergenceScore);

    const catA = evaluatedCandidates.filter(c => c.category === 'Category_A');
    const catB = evaluatedCandidates.filter(c => c.category === 'Category_B');
    const catC = evaluatedCandidates.filter(c => c.category === 'Category_C');
    const catD = evaluatedCandidates.filter(c => c.category === 'Category_D');

    clinicalObservations.push(`Identified ${catA.length} Category A candidates with strong Dual-Table state & organ alignment.`);
    clinicalObservations.push(`Identified ${catB.length} Category B systemic state candidates and ${catC.length} Category C organ affinity candidates.`);

    return {
      convergenceId,
      resolutionId: profile.resolutionId,
      patientName: profile.patientName,
      primaryStateName: profile.primaryDiseaseState.stateName,
      affectedOrgansSummary: profile.affectedOrganAxes.map(o => o.organName),
      totalEvaluatedCandidates: evaluatedCandidates.length,
      categoryA_Candidates: catA,
      categoryB_Candidates: catB,
      categoryC_Candidates: catC,
      categoryD_Candidates: catD,
      allRankedCandidates: evaluatedCandidates,
      clinicalObservations
    };
  }
}

export const stage5ConvergenceEngine = new Stage5ConvergenceEngine();
