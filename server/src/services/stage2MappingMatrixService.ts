import { stage1DualTableService } from './stage1DualTableService.js';
import {
  ORGAN_TAXONOMY,
  DISEASE_STATE_TAXONOMY,
  PHYSIOLOGICAL_REQUIREMENTS,
  SYMPTOM_TAXONOMY,
  StateOrganMappingMatrixEntry,
  SymptomTaxonomyEntry,
  DiseaseStateTaxonomyEntry,
  OrganTaxonomyNode
} from '../data/taxonomies/index.js';

export interface SymptomResolutionResult {
  detectedSymptoms: Array<{
    symptomId: string;
    canonicalName: string;
    matchedToken: string;
    matchedLanguage: 'en' | 'hi' | 'mr';
    primaryOrganId: string;
    bodySystemId: string;
  }>;
  affectedOrgans: Array<{
    organId: string;
    organName: string;
    systemName: string;
  }>;
  resolvedDiseaseStates: Array<{
    stateId: string;
    stateName: string;
    stage: string;
    confidence: number;
  }>;
  recommendedPhysiologicalRequirements: string[];
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
}

class Stage2MappingMatrixService {
  private matrix: Map<string, StateOrganMappingMatrixEntry> = new Map();

  constructor() {
    this.buildStateOrganMappingMatrix();
  }

  /**
   * Constructs the integrated State–Organ Mapping Matrix linking Table A and Table B
   */
  private buildStateOrganMappingMatrix(): void {
    const tableA = stage1DualTableService.getTableARecords();
    const tableB = stage1DualTableService.getTableBRecords();

    // 1. Map Table A core remedies
    for (const core of tableA) {
      const codeUpper = core.code.toUpperCase();
      const spgMatches = tableB.filter(b => b.matchedCoreCode?.toUpperCase() === codeUpper);

      const spgActions = spgMatches.map(spg => ({
        sourceEntryNo: spg.srNo,
        medicineName: spg.medicineName,
        group: spg.group,
        organActionText: spg.organPhysiologicalAction,
        pdfPage: spg.pdfPage,
        normalizedOrgans: spg.normalizedOrganTerms,
        normalizedTissues: spg.normalizedTissueTerms
      }));

      // Find requirements
      const matchedReqs = this.resolveRequirementsForCore(core);

      const identity = stage1DualTableService.getIdentityByCanonicalCode(core.code);

      const entry: StateOrganMappingMatrixEntry = {
        remedyId: core.remedyId,
        canonicalCode: core.code,
        canonicalName: core.name,
        remedyGroup: identity?.remedyGroup || 'General',
        polarity: core.polarity,
        protocolPosition: core.protocolPosition,
        tableA_States: {
          dominantState: core.dominantState,
          secondaryStates: core.secondaryStates,
          stage: core.preferredStage,
          organAxis: core.organAxis,
          tissueAffinity: core.tissueAffinity
        },
        tableB_OrganActions: spgActions,
        physiologicalRequirements: matchedReqs,
        evidenceClass: spgActions.length > 0 ? 'Class_I_and_II_Reconciled' : 'Class_I_Verified_Core',
        sourceCitations: [
          'SRC-MATTEI-CORE-2026: Master Remedy Table 2',
          ...(spgActions.map(s => `SRC-AJIT-SPG-PDF-2026: Page ${s.pdfPage}, #${s.sourceEntryNo} (${s.medicineName})`))
        ]
      };

      this.matrix.set(codeUpper, entry);
    }

    // 2. Map Supplementary Unmatched Table B entries (e.g. S4, S7, C7, P5, etc.)
    const suppEntries = tableB.filter(b => !b.matchedCoreCode);
    for (const supp of suppEntries) {
      const codeUpper = `SUPP_${supp.sourceCode.toUpperCase()}`;
      
      const entry: StateOrganMappingMatrixEntry = {
        remedyId: `REM-SUPP-${supp.sourceCode}`,
        canonicalCode: supp.sourceCode,
        canonicalName: supp.medicineName,
        remedyGroup: supp.group,
        polarity: 'Unknown (Pending Historical Identity Verification)',
        protocolPosition: 'Supplementary Protocol Candidate',
        tableA_States: null,
        tableB_OrganActions: [{
          sourceEntryNo: supp.srNo,
          medicineName: supp.medicineName,
          group: supp.group,
          organActionText: supp.organPhysiologicalAction,
          pdfPage: supp.pdfPage,
          normalizedOrgans: supp.normalizedOrganTerms,
          normalizedTissues: supp.normalizedTissueTerms
        }],
        physiologicalRequirements: supp.normalizedFunctionTerms,
        evidenceClass: 'Class_II_Historical_SPG',
        sourceCitations: [
          `SRC-AJIT-SPG-PDF-2026: Page ${supp.pdfPage}, Entry #${supp.srNo} (${supp.medicineName})`
        ]
      };

      this.matrix.set(codeUpper, entry);
    }
  }

  private resolveRequirementsForCore(core: any): string[] {
    const text = `${core.dominantState} ${core.secondaryStates} ${core.corePhysiologicalRole} ${core.functionalKeywords}`.toLowerCase();
    const matched: string[] = [];

    for (const req of PHYSIOLOGICAL_REQUIREMENTS) {
      const nameTokens = req.requirementName.toLowerCase().split(/\s+/).filter(t => t.length > 3);
      if (nameTokens.some(t => text.includes(t))) {
        matched.push(req.requirementId);
      }
    }

    return matched.length > 0 ? Array.from(new Set(matched)) : ['REQ_LYMPH_DRAINAGE'];
  }

  // ==========================================================================
  // Public Query & Natural Language Resolution APIs
  // ==========================================================================

  getAllMatrixEntries(): StateOrganMappingMatrixEntry[] {
    return Array.from(this.matrix.values());
  }

  getMatrixEntry(canonicalCode: string): StateOrganMappingMatrixEntry | undefined {
    return this.matrix.get(canonicalCode.toUpperCase()) || this.matrix.get(`SUPP_${canonicalCode.toUpperCase()}`);
  }

  /**
   * Intelligent Multilingual Symptom & Query Resolver
   * Understands English, colloquial phrasing, Hindi, and Marathi terms.
   */
  resolveUserQuery(queryText: string): SymptomResolutionResult {
    const cleanQuery = queryText.toLowerCase().trim();
    const detectedSymptoms: any[] = [];
    const affectedOrganIds = new Set<string>();
    const resolvedDiseaseStates: any[] = [];

    // Helper for flexible phrase & n-gram token matching
    const checkPhrases = (phrases: string[], lang: 'en' | 'hi' | 'mr') => {
      for (const phrase of phrases) {
        const phraseLower = phrase.toLowerCase();
        if (cleanQuery.includes(phraseLower)) {
          return { matched: true, token: phrase, lang };
        }
        // Also check if significant words appear in query
        const words = phraseLower.split(/\s+/).filter(w => w.length >= 2);
        if (words.length >= 2 && words.every(w => cleanQuery.includes(w))) {
          return { matched: true, token: phrase, lang };
        }
      }
      return { matched: false, token: '', lang };
    };

    // 1. Scan Symptom Taxonomy across all languages
    for (const sym of SYMPTOM_TAXONOMY) {
      let matchRes = checkPhrases([...sym.medicalSynonyms, ...sym.colloquialEnglish], 'en');
      if (!matchRes.matched) {
        matchRes = checkPhrases([...sym.hindiDevanagari, ...sym.hindiRomanized], 'hi');
      }
      if (!matchRes.matched) {
        matchRes = checkPhrases([...sym.marathiDevanagari, ...sym.marathiRomanized], 'mr');
      }

      if (matchRes.matched) {
        detectedSymptoms.push({
          symptomId: sym.symptomId,
          canonicalName: sym.canonicalName,
          matchedToken: matchRes.token,
          matchedLanguage: matchRes.lang,
          primaryOrganId: sym.primaryOrganId,
          bodySystemId: sym.bodySystemId
        });
        affectedOrganIds.add(sym.primaryOrganId);

        // Directly link to associated disease states
        for (const stId of (sym.associatedStateIds || [])) {
          const foundState = DISEASE_STATE_TAXONOMY.find(d => d.stateId === stId);
          if (foundState && !resolvedDiseaseStates.some(r => r.stateId === stId)) {
            resolvedDiseaseStates.push({
              stateId: foundState.stateId,
              stateName: foundState.stateName,
              stage: foundState.stage,
              confidence: 0.95
            });
          }
        }
      }
    }

    // 2. Resolve Affected Organs from Organ Taxonomy
    const affectedOrgans: any[] = [];
    for (const sys of ORGAN_TAXONOMY) {
      for (const org of sys.organs) {
        if (
          affectedOrganIds.has(org.organId) ||
          cleanQuery.includes(org.organName.toLowerCase()) ||
          org.synonyms.some(s => cleanQuery.includes(s.toLowerCase()))
        ) {
          if (!affectedOrgans.some(o => o.organId === org.organId)) {
            affectedOrgans.push({
              organId: org.organId,
              organName: org.organName,
              systemName: sys.systemName
            });
          }
        }
      }
    }

    // 3. Additional contextual disease states resolution
    for (const state of DISEASE_STATE_TAXONOMY) {
      if (resolvedDiseaseStates.some(r => r.stateId === state.stateId)) continue;

      let matchCount = 0;
      for (const symStr of state.representativeSymptoms) {
        if (cleanQuery.includes(symStr.toLowerCase())) {
          matchCount++;
        }
      }
      if (matchCount > 0) {
        resolvedDiseaseStates.push({
          stateId: state.stateId,
          stateName: state.stateName,
          stage: state.stage,
          confidence: Math.min(1.0, 0.4 + matchCount * 0.2)
        });
      }
    }

    // Sort disease states by confidence
    resolvedDiseaseStates.sort((a, b) => b.confidence - a.confidence);

    // 4. Candidate Remedies Resolution via State-Organ Mapping Matrix
    const candidatesMap = new Map<string, { entry: StateOrganMappingMatrixEntry; score: number; reasons: string[] }>();

    for (const entry of this.matrix.values()) {
      let score = 0;
      const reasons: string[] = [];

      // A. Direct remedy code hit
      const codeRegex = new RegExp(`\\b${entry.canonicalCode.replace('.', '\\.')}\\b`, 'i');
      if (codeRegex.test(cleanQuery)) {
        score += 85;
        reasons.push(`Direct remedy code hit: ${entry.canonicalCode}`);
      }

      // B. Boost from detected symptoms' curated recommendations
      for (const sym of detectedSymptoms) {
        const symDef = SYMPTOM_TAXONOMY.find(s => s.symptomId === sym.symptomId);
        if (symDef?.suggestedRemedyCodes?.includes(entry.canonicalCode)) {
          score += 65;
          reasons.push(`Indicated for symptom: ${symDef.canonicalName}`);
        }
      }

      // C. Check state match
      if (entry.tableA_States) {
        const domLower = entry.tableA_States.dominantState.toLowerCase();
        for (const st of resolvedDiseaseStates) {
          if (domLower.includes(st.stateName.toLowerCase()) || st.stateName.toLowerCase().includes(domLower)) {
            score += 50;
            reasons.push(`Dominant state match: ${st.stateName}`);
          }
        }

        // Check organ axis match
        const axisLower = entry.tableA_States.organAxis.toLowerCase();
        for (const org of affectedOrgans) {
          if (axisLower.includes(org.organName.toLowerCase())) {
            score += 35;
            reasons.push(`Organ axis alignment: ${org.organName}`);
          }
        }
      }

      // D. Check Table B SPG organ action text match
      for (const spg of entry.tableB_OrganActions) {
        const spgLower = spg.organActionText.toLowerCase();
        for (const org of affectedOrgans) {
          if (spgLower.includes(org.organName.toLowerCase())) {
            score += 30;
            reasons.push(`SPG botanical organ action (${spg.medicineName}): matches ${org.organName}`);
          }
        }
        for (const sym of detectedSymptoms) {
          if (spgLower.includes(sym.matchedToken.toLowerCase())) {
            score += 25;
            reasons.push(`SPG historical indication matches symptom "${sym.matchedToken}"`);
          }
        }
      }

      if (score >= 25) {
        candidatesMap.set(entry.canonicalCode, { entry, score, reasons });
      }
    }

    const candidateRemedies = Array.from(candidatesMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ entry, score, reasons }) => ({
        canonicalCode: entry.canonicalCode,
        canonicalName: entry.canonicalName,
        remedyGroup: entry.remedyGroup,
        polarity: entry.polarity,
        protocolPosition: entry.protocolPosition,
        evidenceClass: entry.evidenceClass,
        relevanceScore: score,
        matchedReasons: Array.from(new Set(reasons))
      }));

    return {
      detectedSymptoms,
      affectedOrgans,
      resolvedDiseaseStates,
      recommendedPhysiologicalRequirements: Array.from(new Set(
        candidateRemedies.flatMap(c => this.matrix.get(c.canonicalCode)?.physiologicalRequirements || [])
      )),
      candidateRemedies
    };
  }

  getMatrixStats() {
    return {
      totalMatrixEntries: this.matrix.size,
      totalBodySystems: ORGAN_TAXONOMY.length,
      totalDiseaseStates: DISEASE_STATE_TAXONOMY.length,
      totalSymptomConcepts: SYMPTOM_TAXONOMY.length,
      totalPhysiologicalRequirements: PHYSIOLOGICAL_REQUIREMENTS.length
    };
  }

  getOrganTaxonomy(): OrganTaxonomyNode[] {
    return ORGAN_TAXONOMY;
  }

  getDiseaseStateTaxonomy(): DiseaseStateTaxonomyEntry[] {
    return DISEASE_STATE_TAXONOMY;
  }
}

export const stage2MappingMatrixService = new Stage2MappingMatrixService();
