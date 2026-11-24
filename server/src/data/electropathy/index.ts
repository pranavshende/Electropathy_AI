export * from './types.js';
export * from './coreRemediesData.js';
export * from './spgFormulationsData.js';

import { CORE_ELECTROPATHY_REMEDIES } from './coreRemediesData.js';
import { SPG_BOTANICAL_FORMULATIONS } from './spgFormulationsData.js';

export function getCoreRemedyByCode(code: string) {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, '');
  return CORE_ELECTROPATHY_REMEDIES.find(
    r => r.code.toUpperCase().replace(/\s+/g, '') === normalized
  );
}

export function getSpgFormulationsByCoreCode(coreCode: string) {
  const normalized = coreCode.trim().toUpperCase().replace(/\s+/g, '');
  return SPG_BOTANICAL_FORMULATIONS.filter(
    s => s.matchedCoreCode && s.matchedCoreCode.toUpperCase().replace(/\s+/g, '') === normalized
  );
}
