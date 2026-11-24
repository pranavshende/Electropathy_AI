export interface OrganTaxonomyNode {
  systemId: string;
  systemName: string;
  organs: {
    organId: string;
    organName: string;
    synonyms: string[];
    tissues: {
      tissueId: string;
      tissueName: string;
      cellularTargets: string[];
    }[];
  }[];
}

export interface SymptomTaxonomyEntry {
  symptomId: string;
  canonicalName: string;
  bodySystemId: string;
  primaryOrganId: string;
  medicalSynonyms: string[];
  colloquialEnglish: string[];
  hindiDevanagari: string[];
  hindiRomanized: string[];
  marathiDevanagari: string[];
  marathiRomanized: string[];
  typicalStage: 'Functional' | 'Structural' | 'Degenerative' | 'Acute Functional' | 'Chronic Functional' | 'Chronic' | 'Recovery';
  associatedStateIds?: string[];
  suggestedRemedyCodes?: string[];
  severityLevels?: string[];
}

export interface DiseaseStateTaxonomyEntry {
  stateId: string;
  stateName: string;
  stage: 'Functional' | 'Structural' | 'Degenerative' | 'Acute Functional' | 'Chronic Functional' | 'Recovery';
  pathophysiologicalMechanism: string;
  associatedOrganAxis: string;
  physiologicalRequirements: string[];
  representativeSymptoms: string[];
}

export interface PhysiologicalRequirementEntry {
  requirementId: string;
  requirementName: string;
  category: 'Drainage' | 'Cleansing' | 'Decongestion' | 'Harmonization' | 'Reconstruction' | 'Sedation' | 'Vitalization';
  targetBiologicalProcess: string;
  recommendedDilutionRange: string;
}

export interface StateOrganMappingMatrixEntry {
  remedyId: string;
  canonicalCode: string;
  canonicalName: string;
  remedyGroup: string;
  polarity: string;
  protocolPosition: string;
  
  // Table A Core Associations
  tableA_States: {
    dominantState: string;
    secondaryStates: string;
    stage: string;
    organAxis: string;
    tissueAffinity: string;
  } | null;

  // Table B SPG Botanical Associations
  tableB_OrganActions: Array<{
    sourceEntryNo: number;
    medicineName: string;
    group: string;
    organActionText: string;
    pdfPage: number;
    normalizedOrgans: string[];
    normalizedTissues: string[];
  }>;

  // Synthesized Requirements & Evidence Class
  physiologicalRequirements: string[];
  evidenceClass: 'Class_I_Verified_Core' | 'Class_II_Historical_SPG' | 'Class_I_and_II_Reconciled';
  sourceCitations: string[];
}

export interface NLPQuerySample {
  queryId: string;
  queryText: string;
  language: 'en' | 'hi' | 'mr';
  intent: 
    | 'multi_symptom_search'
    | 'organ_search'
    | 'remedy_info'
    | 'remedy_comparison'
    | 'polarity_electricity_search'
    | 'protocol_inquiry'
    | 'spg_botanical_composition'
    | 'follow_up_clarification';
  extractedSymptomIds: string[];
  extractedOrganIds: string[];
  expectedStateMatch?: string;
  expectedRemedyCodes: string[];
  notes?: string;
}
