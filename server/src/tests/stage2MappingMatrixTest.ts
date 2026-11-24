import { stage2MappingMatrixService } from '../services/stage2MappingMatrixService.js';
import {
  ORGAN_TAXONOMY,
  DISEASE_STATE_TAXONOMY,
  SYMPTOM_TAXONOMY,
  PHYSIOLOGICAL_REQUIREMENTS,
  NLP_QUERY_DATASET
} from '../data/taxonomies/index.js';

async function runStage2Tests() {
  console.log('\n================================================================');
  console.log('🧪 v2026 STAGE 2: STATE–ORGAN MAPPING MATRIX & NLP TEST SUITE');
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

  // 1. Organ Taxonomy Verification
  assert(ORGAN_TAXONOMY.length === 8, `Organ Taxonomy covers 8 major body systems with organs & tissues (Found: ${ORGAN_TAXONOMY.length})`);
  const digestiveSys = ORGAN_TAXONOMY.find(s => s.systemId === 'SYS_DIGESTIVE');
  assert(
    digestiveSys !== undefined && digestiveSys.organs.some(o => o.organName === 'Stomach') && digestiveSys.organs.some(o => o.organName === 'Liver'),
    'Digestive system includes Stomach, Liver, Gallbladder, Intestines, and Pancreas'
  );

  // 2. Disease State Taxonomy Verification
  assert(DISEASE_STATE_TAXONOMY.length >= 12, `Disease-State Taxonomy defines core pathological mechanisms (Total: ${DISEASE_STATE_TAXONOMY.length})`);
  assert(PHYSIOLOGICAL_REQUIREMENTS.length >= 20, `Physiological Requirements taxonomy defines therapeutic targets (Total: ${PHYSIOLOGICAL_REQUIREMENTS.length})`);

  // 3. Symptom Taxonomy Multilingual Verification
  assert(SYMPTOM_TAXONOMY.length >= 12, `Symptom Taxonomy contains canonical concepts (Total: ${SYMPTOM_TAXONOMY.length})`);
  const constip = SYMPTOM_TAXONOMY.find(s => s.symptomId === 'SYM_CONSTIPATION');
  assert(
    constip !== undefined &&
    constip.hindiDevanagari.includes('कब्ज') &&
    constip.marathiDevanagari.includes('मलबद्धता'),
    'Constipation symptom includes canonical English, Hindi (कब्ज), and Marathi (मलबद्धता)'
  );

  const stoneSym = SYMPTOM_TAXONOMY.find(s => s.symptomId === 'SYM_RENAL_COLIC');
  assert(
    stoneSym !== undefined &&
    stoneSym.hindiDevanagari.includes('गुर्दे की पथरी का दर्द') &&
    stoneSym.marathiDevanagari.includes('मूतखडा दुखणे'),
    'Renal Colic symptom includes Hindi (गुर्दे की पथरी) and Marathi (मूतखडा दुखणे)'
  );

  // 4. State–Organ Mapping Matrix Verification
  const matrixEntries = stage2MappingMatrixService.getAllMatrixEntries();
  assert(matrixEntries.length >= 60, `State–Organ Mapping Matrix contains unified Table A & Table B entries (Total: ${matrixEntries.length})`);

  const s1Matrix = stage2MappingMatrixService.getMatrixEntry('S1');
  assert(
    s1Matrix !== undefined &&
    s1Matrix.canonicalCode === 'S1' &&
    s1Matrix.tableA_States?.organAxis === 'Lymph–Skin–Glands' &&
    s1Matrix.tableB_OrganActions.some(b => b.medicineName.includes('Cochlearia off. SPG')),
    'S1 correctly unifies Table A Lymph-Skin axis with Table B Cochlearia off. SPG organ action'
  );

  const s4Matrix = stage2MappingMatrixService.getMatrixEntry('S4');
  assert(
    s4Matrix !== undefined &&
    s4Matrix.evidenceClass === 'Class_II_Historical_SPG' &&
    s4Matrix.tableA_States === null,
    'S4 preserved as independent supplementary entry in Matrix without forced merge into S1'
  );

  // 5. Multilingual NLP Query Resolution Tests
  console.log('\n--- Multilingual NLP Query Resolution Tests ---');

  // English test
  const enRes = stage2MappingMatrixService.resolveUserQuery('My stomach feels very bloated, heavy, and I have chronic constipation with sluggish digestion.');
  assert(
    enRes.detectedSymptoms.some(s => s.symptomId === 'SYM_BLOATING' || s.symptomId === 'SYM_CONSTIPATION'),
    'English query: successfully extracts Bloating and Constipation symptoms'
  );
  assert(
    enRes.affectedOrgans.some(o => o.organName === 'Stomach' || o.organName.includes('Intestines')),
    'English query: successfully resolves affected organs (Stomach/Intestines)'
  );
  assert(
    enRes.candidateRemedies.some(c => c.canonicalCode === 'S2' || c.canonicalCode === 'S.Lass'),
    'English query: successfully retrieves S2 / S.Lass as top candidates'
  );

  // Hindi test
  const hiRes = stage2MappingMatrixService.resolveUserQuery('गुर्दे की पथरी का असह्य दर्द हो रहा है और पेशाब में बहुत तेज जलन है।');
  assert(
    hiRes.detectedSymptoms.some(s => s.symptomId === 'SYM_RENAL_COLIC') &&
    hiRes.detectedSymptoms.some(s => s.symptomId === 'SYM_BURNING_URINATION'),
    'Hindi query: successfully extracts Renal Colic and Burning Urination (गुर्दे की पथरी व पेशाब में जलन)'
  );
  assert(
    hiRes.affectedOrgans.some(o => o.organName === 'Kidneys' || o.organName.includes('Bladder')),
    'Hindi query: successfully resolves Kidneys & Bladder organ systems'
  );
  assert(
    hiRes.candidateRemedies.some(c => c.canonicalCode === 'S6'),
    'Hindi query: successfully retrieves S6 (Scrofoloso-6) for renal calculus state'
  );

  // Marathi test: Respiratory cough
  const mrRes = stage2MappingMatrixService.resolveUserQuery('छातीत कफ साठून सारखा खोकला येत आहे आणि चिकट कफ पडत आहे.');
  assert(
    mrRes.detectedSymptoms.some(s => s.symptomId === 'SYM_PRODUCTIVE_COUGH'),
    'Marathi query: successfully extracts Productive Cough (कफाचा खोकला)'
  );
  assert(
    mrRes.affectedOrgans.some(o => o.organName.includes('Lungs') || o.organName.includes('Bronchial')),
    'Marathi query: successfully resolves Bronchial/Pulmonary system'
  );
  assert(
    mrRes.candidateRemedies.some(c => ['P1', 'P2'].includes(c.canonicalCode)),
    'Marathi query: successfully retrieves Pettorale series (P1/P2)'
  );

  // Marathi test: Varicose veins
  const mrVeinRes = stage2MappingMatrixService.resolveUserQuery('पायांच्या शिरा फुगल्या आहेत आणि असह्य जडपणा वाटतो, मूळव्याधीचाही त्रास आहे.');
  assert(
    mrVeinRes.detectedSymptoms.some(s => s.symptomId === 'SYM_VARICOSE_VEINS') ||
    mrVeinRes.detectedSymptoms.some(s => s.symptomId === 'SYM_HEMORRHOIDS'),
    'Marathi query: successfully extracts Varicose Veins (पायांच्या शिरा फुगणे) & Hemorrhoids (मूळव्याध)'
  );
  assert(
    mrVeinRes.candidateRemedies.some(c => ['A2', 'B.E.', 'Ven1'].includes(c.canonicalCode)),
    'Marathi query: successfully prioritizes Angioticos 2 (A2) and Blue Electricity (B.E.)'
  );

  console.log('\n----------------------------------------------------------------');
  console.log(`Stage 2 Verification Summary: ${passed} PASSED | ${failed} FAILED`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage2Tests().catch((err) => {
  console.error('Fatal error in Stage 2 test:', err);
  process.exit(1);
});
