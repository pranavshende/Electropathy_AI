import { knowledgeService } from '../services/knowledgeService.js';
import { CORE_ELECTROPATHY_REMEDIES } from '../data/electropathy/coreRemediesData.js';
import { SPG_BOTANICAL_FORMULATIONS } from '../data/electropathy/spgFormulationsData.js';
import { getCoreRemedyByCode, getSpgFormulationsByCoreCode } from '../data/electropathy/index.js';

async function runElectropathyRagTests() {
  console.log('\n================================================================');
  console.log('🧪 ELECTROPATHY AI: RAG KNOWLEDGE BASE & RETRIEVAL VERIFICATION');
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

  // -------------------------------------------------------------
  // Test 1: Verify Core Remedies Count & Schema Integrity
  // -------------------------------------------------------------
  assert(
    CORE_ELECTROPATHY_REMEDIES.length === 38,
    'Core Remedies Count matches exactly 38',
    `Found ${CORE_ELECTROPATHY_REMEDIES.length}`
  );

  const sampleS1 = getCoreRemedyByCode('S1');
  assert(
    sampleS1 !== undefined &&
    sampleS1.name === 'Scrofoloso-1' &&
    sampleS1.polarity.includes('Negative') &&
    sampleS1.organAxis === 'Lymph–Skin–Glands' &&
    sampleS1.protocolPosition === 'Bottle 1',
    'S1 (Scrofoloso-1) has complete clinical & polarity schema'
  );

  const sampleRE = getCoreRemedyByCode('R.E.');
  assert(
    sampleRE !== undefined &&
    sampleRE.name === 'Red Electricity' &&
    sampleRE.polarity.includes('Positive') &&
    sampleRE.protocolPosition.includes('Bottle 1'),
    'R.E. (Red Electricity) properly typed as Positive (+) Starter'
  );

  const sampleBE = getCoreRemedyByCode('B.E.');
  assert(
    sampleBE !== undefined &&
    sampleBE.name === 'Blue Electricity' &&
    sampleBE.polarity.includes('Negative') &&
    sampleBE.dominantState.includes('Venous congestion'),
    'B.E. (Blue Electricity) properly typed as Negative (–) Cooling'
  );

  // -------------------------------------------------------------
  // Test 2: Verify 60 SPG Botanical Formulations
  // -------------------------------------------------------------
  assert(
    SPG_BOTANICAL_FORMULATIONS.length === 60,
    'SPG Botanical Formulations count matches exactly 60 entries',
    `Found ${SPG_BOTANICAL_FORMULATIONS.length}`
  );

  const s1SPG = getSpgFormulationsByCoreCode('S1');
  assert(
    s1SPG.length > 0 && s1SPG[0]?.medicineName === 'Cochlearia off. SPG',
    'S1 correctly crosswalked to Cochlearia off. SPG'
  );

  const populusSPG = SPG_BOTANICAL_FORMULATIONS.find(s => s.medicineName.includes('Populus'));
  assert(
    populusSPG !== undefined && populusSPG.matchedCoreCode === 'G.E.',
    'Populus SPG correctly crosswalked to Green Electricity (G.E.)'
  );

  // -------------------------------------------------------------
  // Test 3: RAG Retrieval by Specific Remedy Code
  // -------------------------------------------------------------
  const s6Matches = await knowledgeService.findMatchingKnowledge('Please tell me about S6 remedy in electropathy');
  assert(
    s6Matches.length > 0 && s6Matches.some(m => (m.metadata as any)?.code === 'S6'),
    'RAG Retrieval for "S6" successfully returns Scrofoloso-6'
  );

  const c4Matches = await knowledgeService.findMatchingKnowledge('What is C4 used for in bone and cartilage?');
  assert(
    c4Matches.length > 0 && c4Matches.some(m => (m.metadata as any)?.code === 'C4'),
    'RAG Retrieval for "C4" returns Canceroso 4 with cartilage/fibro-osseous action'
  );

  // -------------------------------------------------------------
  // Test 4: RAG Retrieval by Organ Axis & Symptoms
  // -------------------------------------------------------------
  const respMatches = await knowledgeService.findMatchingKnowledge('bronchial airway congestion productive cough');
  assert(
    respMatches.length > 0 && respMatches.some(m => ['P1', 'P2', 'P3'].includes((m.metadata as any)?.code)),
    'RAG Retrieval for bronchial congestion correctly retrieves P-series (Pettorale)'
  );

  const renalMatches = await knowledgeService.findMatchingKnowledge('renal calculus kidney burning urination stones');
  assert(
    renalMatches.length > 0 && renalMatches.some(m => ['S6', 'C6', 'A2'].includes((m.metadata as any)?.code) || m.content.includes('Renal Colic')),
    'RAG Retrieval for renal stones correctly prioritizes renal protocols and S6'
  );

  // -------------------------------------------------------------
  // Test 5: Polarity-Aware RAG Matching
  // -------------------------------------------------------------
  const blueElecMatches = await knowledgeService.findMatchingKnowledge('cooling venous decongestant electricity for hemorrhoids');
  assert(
    blueElecMatches.length > 0 && blueElecMatches.some(m => (m.metadata as any)?.code === 'B.E.'),
    'RAG Retrieval correctly matches Blue Electricity for cooling venous decongestion'
  );

  console.log('\n----------------------------------------------------------------');
  console.log(`Test Execution Summary: ${passed} PASSED | ${failed} FAILED`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runElectropathyRagTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
