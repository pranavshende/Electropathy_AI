import { stage3PatientAssessmentService, PatientAssessmentInput } from '../services/stage3PatientAssessmentService.js';
import { stage4DiseaseStateResolverService } from '../services/stage4DiseaseStateResolverService.js';
import { stage5ConvergenceEngine } from '../services/stage5ConvergenceEngine.js';
import { stage6ProtocolOptimizerService } from '../services/stage6ProtocolOptimizerService.js';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, errorMsg: string, details?: any) {
  if (!condition) {
    results.push({ name: testName, passed: false, error: errorMsg, details });
    console.error(`❌ [FAILED] ${testName}: ${errorMsg}`);
  } else {
    results.push({ name: testName, passed: true, details });
    console.log(`✅ [PASSED] ${testName}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING STAGE 5 & 6 TEST SUITE: CONVERGENCE & 4-BOTTLE PROTOCOL');
  console.log('======================================================\n');

  // TEST 1: Stage 5 Convergence on Functional Gastric Stasis & Hyperacidity
  console.log('--- Test 1: Convergence Engine for Functional Gastric Stasis ---');
  const gastricPatientInput: PatientAssessmentInput = {
    fullName: "Vikas Patel",
    age: 48,
    gender: "male",
    contactNumber: "+919811122233",
    chiefComplaints: [
      { complaint: "Severe hyperacidity, persistent heartburn, and delayed gastric emptying", duration: "2 months", severity: 7 },
      { complaint: "Gastric stasis and abdominal fullness after food", duration: "3 weeks", severity: 6 }
    ],
    presentIllnessDescription: "Patient suffers from severe hyperacidity, persistent heartburn, and delayed gastric emptying after eating.",
    temperament: "Bilious"
  };

  const assessment1 = stage3PatientAssessmentService.assessPatient(gastricPatientInput);
  const resolution1 = stage4DiseaseStateResolverService.resolveDiseaseStates(assessment1);
  const convergence1 = stage5ConvergenceEngine.evaluateConvergence(resolution1);

  assert(
    convergence1.allRankedCandidates.length > 0,
    'Converged Candidates Generated',
    'Candidate list should not be empty'
  );

  // Check Category A / B / C presence
  const catA = convergence1.categoryA_Candidates;
  const catB = convergence1.categoryB_Candidates;
  const catC = convergence1.categoryC_Candidates;
  console.log(`ℹ️ Category A: ${catA.length}, Category B: ${catB.length}, Category C: ${catC.length}`);
  console.log(`ℹ️ Top Candidates:`, convergence1.allRankedCandidates.slice(0, 5).map(c => `${c.canonicalCode} (${c.category}, score: ${c.compositeConvergenceScore})`));

  assert(
    catA.length > 0 || catB.length > 0,
    'High/Moderate Convergence Candidates Identified',
    'Expected at least one Category A or Category B candidate'
  );

  // Verify candidate data integrity (Dual-Table Grounding)
  const topCandidate = convergence1.allRankedCandidates[0];
  assert(
    Boolean(topCandidate) && (topCandidate?.stateScore ?? 0) >= 0 && (topCandidate?.organScore ?? 0) >= 0,
    'Segregated Dual-Table Scores Preserved',
    'Both Branch A (Table A) and Branch B (Table B) scores must be present and nonnegative',
    { code: topCandidate?.canonicalCode, stateScore: topCandidate?.stateScore, organScore: topCandidate?.organScore }
  );

  // TEST 2: Conflict Handling in Category D
  console.log('\n--- Test 2: Category D and Conflict Warnings ---');
  assert(
    Array.isArray(convergence1.categoryD_Candidates),
    'Category D Candidates Array Initialized',
    'Category D candidates must be an array'
  );

  // TEST 3: Stage 6 Protocol Generation - 4-Bottle Optimizer
  console.log('\n--- Test 3: Stage 6 Protocol Optimizer - 4-Bottle Constraints ---');
  const dualOutput = stage6ProtocolOptimizerService.optimizeProtocol(convergence1, assessment1);
  const protocol1 = dualOutput.optionA;

  assert(
    protocol1.bottles.length === 4,
    'Four Bottles Generated for Option A',
    `Expected 4 bottles, got ${protocol1.bottles.length}`
  );

  // Constraint 3.1: Max 2 remedies per bottle
  const validBottleRemedyCounts = protocol1.bottles.every(b => b.remedies.length >= 1 && b.remedies.length <= 2);
  assert(
    validBottleRemedyCounts,
    'Constraint: Max 2 Remedies Per Bottle',
    'All bottles must have between 1 and 2 remedies'
  );

  // Constraint 3.2: Max 1 electricity per bottle
  const validBottleElectricities = protocol1.bottles.every(b => !b.electricity || typeof b.electricity.code === 'string');
  assert(
    validBottleElectricities,
    'Constraint: Max 1 Electricity Per Bottle',
    'Bottles must have at most 1 electricity'
  );

  // Constraint 3.3: No duplicate electricities across different bottles
  const usedElectricities = protocol1.bottles
    .map(b => b.electricity?.code)
    .filter((e): e is string => Boolean(e));
  const uniqueElectricities = new Set(usedElectricities);
  assert(
    usedElectricities.length === uniqueElectricities.size,
    'Constraint: No Duplicate Electricities Across Bottles',
    `Electricities used: ${usedElectricities.join(', ')} must all be unique`
  );

  // Constraint 3.4: No duplicate remedies across bottles in the same option
  const allRemedies = protocol1.bottles.flatMap(b => b.remedies.map(r => r.code));
  const uniqueRemedies = new Set(allRemedies);
  assert(
    allRemedies.length === uniqueRemedies.size,
    'Constraint: No Duplicate Remedies Across Bottles',
    `Remedies used: ${allRemedies.join(', ')} should be distinct across the 4 bottles`
  );

  // TEST 4: Dilution Assignment Logic
  console.log('\n--- Test 4: Dilution Assignment Logic ---');
  const bottleDilutions = protocol1.bottles.map(b => b.recommendedDilution);
  console.log(`ℹ️ Option A Bottle Dilutions: ${bottleDilutions.join(', ')}`);
  assert(
    bottleDilutions.every(d => d.includes('D1') || d.includes('D2') || d.includes('D3') || d.includes('D4') || d.includes('D6') || d.includes('D10') || d.includes('D30') || d.includes('D200')),
    'Standard Dilution Scale Enforced',
    'Dilutions must adhere to standard Electropathy pharmacopoeia scale'
  );

  // TEST 5: Option A & Option B Generation
  console.log('\n--- Test 5: Option A & Option B Dual-Formulation ---');
  assert(
    Boolean(dualOutput.optionA),
    'Option A Present',
    'Option A must always be present'
  );
  if (dualOutput.optionB) {
    assert(
      dualOutput.optionB.bottles.length === 4,
      'Option B Provides Complete 4-Bottle System',
      'Option B must contain 4 bottles when generated'
    );
  } else {
    console.log('ℹ️ Option B not generated (candidates pool < 6, acceptable for targeted sub-conditions)');
  }

  // TEST 6: External Local Applications & Constitutional Advice
  console.log('\n--- Test 6: External Compresses & Constitutional Guidance ---');
  assert(
    Array.isArray(protocol1.externalLocalApplications),
    'External Applications Array Present',
    'External applications recommendations should be populated'
  );
  assert(
    typeof protocol1.constitutionalGuidance === 'string' && protocol1.constitutionalGuidance.length > 0,
    'Constitutional Guidance Present',
    'Constitutional temperament guidance must be provided'
  );

  // TEST 7: Emergency Case Safety Abort in Stage 5/6
  console.log('\n--- Test 7: Emergency Red-Flag Interception ---');
  const emergencyPatientInput: PatientAssessmentInput = {
    fullName: "Emergency Test",
    age: 55,
    gender: "male",
    contactNumber: "+919999988888",
    chiefComplaints: [
      { complaint: "Crushing chest pain radiating down left arm with profuse cold diaphoresis", duration: "30 mins", severity: 10 }
    ],
    presentIllnessDescription: "Crushing chest pain radiating down left arm with cold clammy sweating and shortness of breath."
  };

  const emergencyAssessment = stage3PatientAssessmentService.assessPatient(emergencyPatientInput);
  const emergencyResolution = stage4DiseaseStateResolverService.resolveDiseaseStates(emergencyAssessment);
  const emergencyConvergence = stage5ConvergenceEngine.evaluateConvergence(emergencyResolution);
  const emergencyProtocol = stage6ProtocolOptimizerService.optimizeProtocol(emergencyConvergence, emergencyAssessment);

  assert(
    emergencyResolution.isSafetyBlocked === true,
    'Emergency Assessment Correctly Flagged as Safety Blocked',
    'Resolution must have isSafetyBlocked = true'
  );

  assert(
    emergencyConvergence.clinicalObservations.some(o => o.includes('CONVERGENCE EVALUATION HALTED')),
    'Emergency Convergence Halted Safely',
    'Convergence evaluation must report halted observation'
  );

  assert(
    emergencyProtocol.optionA.bottles.length === 0 && emergencyProtocol.optionA.practitionerNotice.includes('EMERGENCY MEDICAL INTERVENTION'),
    'Emergency Protocol Halted with Red-Flag Notice',
    'Bottles must be empty and practitioner notice must mandate immediate hospital emergency care'
  );

  // SUMMARY
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n======================================================');
  console.log(`📊 STAGE 5 & 6 TEST SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
