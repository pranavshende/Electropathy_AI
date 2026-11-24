export interface ElectropathyCoreRemedy {
  code: string;
  name: string;
  type: string;
  polarity: string;
  primarySphere: string;
  secondarySphere: string;
  coreAction: string;
  functionalKeywords: string;
  pathophysiologicalTarget: string;
  physiologicalEffectSummary: string;
  therapeuticFocus: string;
  suggestedProtocolRole: string;
  externalLocalUse: string;
  organPolarityLink: string;
  electroPhysiologicalEffect: string;
  colorSymbolism: string;
  remarks: string;
  verificationStatus: string;
  dominantState: string;
  secondaryStates: string;
  organAxis: string;
  tissueAffinity: string;
  corePhysiologicalRole: string;
  preferredStage: string;
  protocolPosition: string;
  table2MappingStatus?: string;
}

export interface ElectropathySPGFormulation {
  srNo: number;
  sourceCode: string;
  medicineName: string;
  group: string;
  organPhysiologicalAction: string;
  pdfPage: number;
  sourceValidationStatus: string;
  crosswalkStatus: string;
  matchedCoreCode?: string;
}
