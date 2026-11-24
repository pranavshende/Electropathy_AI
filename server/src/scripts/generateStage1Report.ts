import fs from 'fs';
import path from 'path';
import { stage1DualTableService } from '../services/stage1DualTableService.js';

export function runStage1ReportGeneration() {
  console.log('\n================================================================');
  console.log('📋 v2026 ELECTROPATHY AI ENGINE: STAGE 1 RECONCILIATION REPORT');
  console.log('================================================================\n');

  const report = stage1DualTableService.generateReconciliationReport();

  console.log(`• Engine Version: ${report.engineVersion}`);
  console.log(`• Generated At: ${report.timestamp}`);
  console.log(`• Table A (Core Remedy-State Table): ${report.totalTableARecords} records`);
  console.log(`• Table B (Supplementary Organ-Action Table): ${report.totalTableBRecords} entries`);
  console.log(`• Total Distinct Identities: ${report.totalDistinctIdentities}`);
  console.log(`• Exact Reconciled Matches: ${report.exactCanonicalMatchesCount}`);
  console.log(`• Supplementary Unmatched Table B Entries: ${report.supplementaryUnmatchedTableBCount}`);
  console.log(`• Core-Only Table A Entries: ${report.coreTableOnlyCount}`);
  console.log(`• Total Traceable Mappings Registered: ${report.totalMappingsCount}`);
  console.log(`• Data Integrity Status:`);
  console.log(`    - Has No Forced Merges: ${report.dataIntegrityValidation.hasNoForcedMerges ? '✔ TRUE' : '❌ FALSE'}`);
  console.log(`    - All 38 Table A Entries Preserved: ${report.dataIntegrityValidation.all38TableAEntriesPreserved ? '✔ TRUE' : '❌ FALSE'}`);
  console.log(`    - All 60 Table B Entries Preserved: ${report.dataIntegrityValidation.all60TableBEntriesPreserved ? '✔ TRUE' : '❌ FALSE'}`);
  console.log(`    - A.P.P. Preserved: ${report.dataIntegrityValidation.appEntryPreserved ? '✔ TRUE' : '❌ FALSE'}`);
  console.log(`    - Sources Traceable: ${report.dataIntegrityValidation.sourcesTraceable ? '✔ TRUE' : '❌ FALSE'}`);
  console.log(`    - Ready for Stage 2 Approval: ${report.dataIntegrityValidation.readyForStage2Approval ? '✔ READY' : '❌ NOT READY'}`);

  return report;
}

if (process.argv[1]?.includes('generateStage1Report')) {
  runStage1ReportGeneration();
}
