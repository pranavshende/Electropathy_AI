import { stage1DualTableService } from '../services/stage1DualTableService.js';

async function runStage1Tests() {
  console.log('\n================================================================');
  console.log('🧪 v2026 STAGE 1: DUAL-TABLE & REGISTRIES VERIFICATION TEST');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✔ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // 1. Table A preservation
  const tableA = stage1DualTableService.getTableARecords();
  assert(tableA.length === 38, 'Table A preserves exactly 38 Core Remedy-State records', `Found: ${tableA.length}`);

  // 2. Table B preservation
  const tableB = stage1DualTableService.getTableBRecords();
  assert(tableB.length === 60, 'Table B preserves exactly 60 SPG Organ-Action entries', `Found: ${tableB.length}`);

  // 3. Source Registry
  const sources = stage1DualTableService.getSourceRegistry();
  assert(sources.length === 2, 'Source Registry holds both independent sources with provenance', `Found: ${sources.length}`);
  assert(sources.some(s => s.sourceCode === 'SRC-MATTEI-CORE-2026'), 'Source A (Mattei Core Table 2) registered');
  assert(sources.some(s => s.sourceCode === 'SRC-AJIT-SPG-PDF-2026'), 'Source B (Ajit Master PDF SPG) registered');

  // 4. A.P.P. (Aqua Perla Pelle) preservation
  const appInTableA = tableA.find(a => a.code === 'A.P.P.');
  const appInTableB = tableB.find(b => b.sourceCode === 'APP');
  assert(appInTableA !== undefined, 'A.P.P. preserved in Table A as external cellular/skin conductor');
  assert(appInTableB !== undefined && appInTableB.medicineName.includes('Arnica montana'), 'A.P.P. preserved in Table B as Arnica montana SPG (Entry #60)');

  // 5. Rule: Same Group != Same Remedy Identity
  // In Scrofoloso, S1, S2, S3, S5, S6, S10, S11 match, but S4, S7, S8, S9, Synth are distinct compound medicines
  const s4Record = tableB.find(b => b.sourceCode === 'S4');
  assert(
    s4Record !== undefined && s4Record.matchedCoreCode === undefined && s4Record.medicineName === 'Sarsaparilla SPG',
    'S4 (Sarsaparilla SPG) preserved as distinct compound supplementary identity, not merged into S1'
  );

  const synthRecord = tableB.find(b => b.sourceCode === 'Synth');
  assert(
    synthRecord !== undefined && synthRecord.matchedCoreCode === undefined,
    'Synthesis (Synth SPG) preserved as distinct compound supplementary identity'
  );

  const s1RecordB = tableB.find(b => b.sourceCode === 'S1');
  assert(
    s1RecordB !== undefined && s1RecordB.matchedCoreCode === 'S1',
    'S1 correctly crosswalked to canonical code S1 while maintaining separate Table A and Table B records'
  );

  // 6. Mapping Registry check
  const mappings = stage1DualTableService.getMappings();
  assert(mappings.length >= 170, `Mapping Registry contains traceable state, organ, and requirement links (Total: ${mappings.length})`);
  assert(mappings.every(m => m.sourceId && m.mappingRationale), 'Every mapping has documented provenance and rationale');

  // 7. Full Reconciliation Report Generation
  const report = stage1DualTableService.generateReconciliationReport();
  assert(report.dataIntegrityValidation.hasNoForcedMerges, 'Data Integrity: No forced table merges');
  assert(report.dataIntegrityValidation.all38TableAEntriesPreserved, 'Data Integrity: All 38 Table A entries preserved');
  assert(report.dataIntegrityValidation.all60TableBEntriesPreserved, 'Data Integrity: All 60 Table B entries preserved');
  assert(report.dataIntegrityValidation.readyForStage2Approval, 'Approval Gate: Stage 1 verified and ready for project owner review');

  console.log('\n----------------------------------------------------------------');
  console.log(`Stage 1 Verification Summary: ${passed} PASSED | ${failed} FAILED`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage1Tests().catch((err) => {
  console.error('Fatal error in Stage 1 test:', err);
  process.exit(1);
});
