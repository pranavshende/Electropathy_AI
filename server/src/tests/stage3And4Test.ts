import { stage3PatientAssessmentService, PatientAssessmentInput } from '../services/stage3PatientAssessmentService.js';
import { stage4DiseaseStateResolverService } from '../services/stage4DiseaseStateResolverService.js';

async function runStage3And4Tests() {
  console.log('\n================================================================');
  console.log('🧪 v2026 STAGE 3 & 4: PATIENT ASSESSMENT & DISEASE-STATE RESOLVER');
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
  // Test Case 1: Standard Renal Calculus Case with Lab Report
  // -------------------------------------------------------------
  const renalPatientInput: PatientAssessmentInput = {
    fullName: 'Ramesh Sharma',
    age: 44,
    gender: 'male',
    contactNumber: '+919876543210',
    chiefComplaints: [
      { complaint: 'Right flank sharp renal colic pain radiating to groin', duration: '3 days', severity: 8 },
      { complaint: 'Burning urination and urinary gravel', duration: '1 week', severity: 7 }
    ],
    presentIllnessDescription: 'Patient developed acute right lumbar colic 3 days ago with gravel in urine.',
    chronicConditions: ['Hyperuricemia'],
    knownAllergies: ['Sulfa drugs'],
    temperament: 'Bilious',
    laboratoryReports: [
      {
        testName: 'Serum Uric Acid',
        observedValue: 8.6,
        unit: 'mg/dL',
        referenceRange: '3.5 - 7.2 mg/dL',
        status: 'High',
        extractionConfidence: 0.98
      },
      {
        testName: 'Serum Creatinine',
        observedValue: 1.1,
        unit: 'mg/dL',
        referenceRange: '0.7 - 1.3 mg/dL',
        status: 'Normal',
        extractionConfidence: 0.99
      }
    ]
  };

  const assessment1 = stage3PatientAssessmentService.assessPatient(renalPatientInput);
  assert(assessment1.demographics.fullName === 'Ramesh Sharma', 'Stage 3: Demographics correctly recorded');
  assert(assessment1.clinicalFindings.symptomSeverityScore === 7.5, 'Stage 3: Average symptom severity score computed accurately (7.5/10)');
  assert(assessment1.laboratoryBiomarkers.abnormalMarkers.length === 1, 'Stage 3: Abnormal lab marker (Uric Acid 8.6 mg/dL) identified');
  assert(assessment1.laboratoryBiomarkers.criticalOrganFlags.includes('Kidneys / Renal Axis'), 'Stage 3: Renal Axis flagged by abnormal lab marker');
  assert(assessment1.safetyGate.passed === true, 'Stage 3: Safety Gate passed for non-emergency renal colic');
  assert(assessment1.safetyGate.highestAlertLevel === 'MODERATE_WARNING', 'Stage 3: Allergy precaution flagged under moderate warning');

  const resolvedProfile1 = stage4DiseaseStateResolverService.resolveDiseaseStates(assessment1);
  assert(resolvedProfile1.isSafetyBlocked === false, 'Stage 4: State resolution permitted (not safety blocked)');
  assert(
    resolvedProfile1.primaryDiseaseState.stateId === 'STATE_GENITOURINARY_MUCOSAL_DYSFUNCTION',
    'Stage 4: Primary disease state resolved to Genitourinary Mucosal Dysfunction & Renal Irritation'
  );
  assert(
    resolvedProfile1.affectedOrganAxes.some(o => o.organName === 'Kidneys' && o.supportedByLabMarkers),
    'Stage 4: Kidneys organ axis confirmed with laboratory marker correlation'
  );
  assert(
    resolvedProfile1.candidateRemedies.some(c => c.canonicalCode === 'S6'),
    'Stage 4: Scrofoloso-6 (S6) prioritized as top candidate for renal calculus'
  );

  // -------------------------------------------------------------
  // Test Case 2: Acute Emergency Safety Interception (Cardiac Red Flag)
  // -------------------------------------------------------------
  const emergencyPatientInput: PatientAssessmentInput = {
    fullName: 'Emergency Patient Test',
    age: 58,
    gender: 'male',
    contactNumber: '+919999999999',
    chiefComplaints: [
      { complaint: 'Crushing chest pain radiating to left arm with diaphoresis and breathlessness', severity: 10 }
    ],
    presentIllnessDescription: 'Sudden onset of crushing retrosternal pressure radiating to jaw and left arm.'
  };

  const assessmentEmergency = stage3PatientAssessmentService.assessPatient(emergencyPatientInput);
  assert(assessmentEmergency.safetyGate.passed === false, 'Stage 3 Safety Gate: Crushing chest pain fails safety gate');
  assert(assessmentEmergency.safetyGate.highestAlertLevel === 'CRITICAL_EMERGENCY', 'Stage 3 Safety Gate: Highest alert level set to CRITICAL_EMERGENCY');
  assert(assessmentEmergency.safetyGate.alerts.some(a => a.category.includes('Cardiac')), 'Stage 3 Safety Gate: Acute Cardiac Red Flag detected');

  const resolvedEmergency = stage4DiseaseStateResolverService.resolveDiseaseStates(assessmentEmergency);
  assert(resolvedEmergency.isSafetyBlocked === true, 'Stage 4 Safety Gate: Automatic remedy generation is HALTED for emergency triage');
  assert(resolvedEmergency.candidateRemedies.length === 0, 'Stage 4 Safety Gate: Zero remedies generated during emergency triage');
  assert(
    resolvedEmergency.clinicalSynthesisNotes.includes('AUTOMATIC REMEDY GENERATION HALTED'),
    'Stage 4 Safety Gate: Clinical synthesis notes contain prominent hospital referral warning'
  );

  // -------------------------------------------------------------
  // Test Case 3: Chronic Respiratory Bronchial Case (Marathi Complaint)
  // -------------------------------------------------------------
  const respiratoryInput: PatientAssessmentInput = {
    fullName: 'Suresh Patil',
    age: 52,
    gender: 'male',
    contactNumber: '+919822000000',
    chiefComplaints: [
      { complaint: 'छातीत कफ साठून सारखा खोकला येत आहे आणि चिकट कफ पडत आहे', duration: '2 months', severity: 7 }
    ],
    temperament: 'Lymphatic'
  };

  const assessmentResp = stage3PatientAssessmentService.assessPatient(respiratoryInput);
  assert(assessmentResp.clinicalFindings.chronicityStage === 'Subacute', 'Stage 3: 2-month symptom duration classified as Subacute');

  const resolvedResp = stage4DiseaseStateResolverService.resolveDiseaseStates(assessmentResp);
  assert(resolvedResp.isSafetyBlocked === false, 'Stage 4: Respiratory complaint passes safety gate');
  assert(
    resolvedResp.primaryDiseaseState.stateId === 'STATE_ACUTE_BRONCHIAL_CONGESTION',
    'Stage 4: Primary state resolved to Acute Bronchial Congestion from Marathi input'
  );
  assert(
    resolvedResp.candidateRemedies.some(c => ['P1', 'P2'].includes(c.canonicalCode)),
    'Stage 4: Pettorale series (P1/P2) successfully identified'
  );

  console.log('\n----------------------------------------------------------------');
  console.log(`Stage 3 & 4 Verification Summary: ${passed} PASSED | ${failed} FAILED`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage3And4Tests().catch((err) => {
  console.error('Fatal error in Stage 3 & 4 test:', err);
  process.exit(1);
});
