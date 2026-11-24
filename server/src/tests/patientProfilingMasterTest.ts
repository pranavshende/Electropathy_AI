/**
 * Master Verification Suite: AI-Powered Automatic Patient Profiling & Medical History Management
 * Validates all 12 acceptance criteria specified in the Master Implementation Prompt.
 */

import dotenv from 'dotenv';
dotenv.config();

import { patientProfilingService } from '../services/patientProfilingService.js';
import { patientProfilingStore } from '../services/patientProfilingStore.js';
import { patientProfileController } from '../controllers/patientProfileController.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} - ${details || 'Assertion failed'}`);
    failed++;
  }
}

async function runAllAcceptanceTests() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING MASTER PATIENT PROFILING VERIFICATION SUITE');
  console.log('================================================================\n');

  const testUserId = 'test-patient-rahul-' + Date.now();
  const testConv1 = 'conv-1-' + Date.now();
  const testConv2 = 'conv-2-' + Date.now();

  // -------------------------------------------------------------
  // TEST 1: New patient shares name and age -> Profile created
  // -------------------------------------------------------------
  console.log('--- Test 1: New Patient Profile Creation ---');
  const p1 = await patientProfilingService.processExtraction({
    userId: testUserId,
    conversationId: testConv1,
    messageId: 'msg-1',
    userMessage: 'Hello, my name is Rahul Verma and I am 25 years old.',
    lang: 'en'
  });

  assert(p1 !== null, 'Profile is created and returned');
  assert(p1?.fullName === 'Rahul Verma', 'Patient name extracted as "Rahul Verma"', `Got: ${p1?.fullName}`);
  assert(p1?.age === 25, 'Patient age extracted as 25', `Got: ${p1?.age}`);
  assert(p1?.totalConversations === 1, 'Initial conversation count is 1');

  // -------------------------------------------------------------
  // TEST 2: Patient shares symptoms -> Symptoms appear in profile
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Symptom Extraction & Categorization ---');
  await patientProfilingService.processExtraction({
    userId: testUserId,
    conversationId: testConv1,
    messageId: 'msg-2',
    userMessage: 'I have been suffering from severe headache and cough for the last 2 weeks.',
    lang: 'en'
  });

  const recordT2 = patientProfilingStore.getFullPatientRecord(p1!.id);
  const symHeadache = recordT2?.symptoms.find(s => s.symptom.toLowerCase().includes('headache'));
  assert(Boolean(symHeadache), 'Headache extracted into patient symptoms list');
  assert(symHeadache?.currentStatus === 'active', 'Symptom status is "active"');
  assert(Boolean(symHeadache?.duration), 'Symptom duration extracted (2 weeks)');

  // -------------------------------------------------------------
  // TEST 3: Discusses previous medication -> Saved as historical
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Historical Medication Disclosed ---');
  await patientProfilingService.processExtraction({
    userId: testUserId,
    conversationId: testConv1,
    messageId: 'msg-3',
    userMessage: 'I previously took Paracetamol for my fever last year.',
    lang: 'en'
  });

  const recordT3 = patientProfilingStore.getFullPatientRecord(p1!.id);
  const prevMed = recordT3?.medications.find(m => m.medicationName.toLowerCase().includes('paracetamol'));
  assert(Boolean(prevMed), 'Paracetamol extracted into medication records');
  assert(prevMed?.medicationStatus === 'previous' || prevMed?.medicationStatus === 'stopped', 
    'Medication status correctly identified as historical/previous', `Got: ${prevMed?.medicationStatus}`);

  // -------------------------------------------------------------
  // TEST 4: Patient says stopped taking medication -> Status updated
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Stopped / Discontinued Medication ---');
  await patientProfilingService.processExtraction({
    userId: testUserId,
    conversationId: testConv1,
    messageId: 'msg-4',
    userMessage: 'I was taking Naproxen earlier, but I stopped taking Naproxen due to stomach pain.',
    lang: 'en'
  });

  const recordT4 = patientProfilingStore.getFullPatientRecord(p1!.id);
  const stoppedMed = recordT4?.medications.find(m => m.medicationName.toLowerCase().includes('naproxen'));
  assert(Boolean(stoppedMed), 'Naproxen extracted');
  assert(stoppedMed?.medicationStatus === 'stopped', 'Medication status is "stopped" while history is preserved', `Got: ${stoppedMed?.medicationStatus}`);

  // -------------------------------------------------------------
  // TEST 5: Existing patient in second conversation -> Profile updated, no duplicate
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Multi-Conversation Profile Continuity ---');
  const p2 = await patientProfilingService.processExtraction({
    userId: testUserId,
    conversationId: testConv2,
    messageId: 'msg-5',
    userMessage: 'Hello doctor, today my headache is feeling much better and improving.',
    lang: 'en'
  });

  assert(p2?.id === p1?.id, 'Same patient profile reused across conversations (No duplicate created)');
  assert((p2?.totalConversations || 0) >= 2, 'Conversation count incremented');

  const recordT5 = patientProfilingStore.getFullPatientRecord(p1!.id);
  const updatedHeadache = recordT5?.symptoms.find(s => s.symptom.toLowerCase().includes('headache'));
  assert(updatedHeadache?.currentStatus === 'improving', 'Symptom status successfully updated to "improving"');

  // -------------------------------------------------------------
  // TEST 6: Patient corrects age -> Correction recorded on timeline
  // -------------------------------------------------------------
  console.log('\n--- Test 6: Correction Tracking & Timeline Logging ---');
  await patientProfilingService.processExtraction({
    userId: testUserId,
    conversationId: testConv2,
    messageId: 'msg-6',
    userMessage: 'Actually, my age is 26 years old, not 25.',
    lang: 'en'
  });

  const recordT6 = patientProfilingStore.getFullPatientRecord(p1!.id);
  assert(recordT6?.profile.age === 26, 'Patient age successfully updated to 26', `Got: ${recordT6?.profile.age}`);
  
  const correctionEvent = recordT6?.timeline.find(t => t.eventType === 'MANUAL_CORRECTION' && t.fieldName === 'age');
  assert(Boolean(correctionEvent), 'Timeline recorded MANUAL_CORRECTION event for age update');
  assert(correctionEvent?.previousValue === 25 && correctionEvent?.updatedValue === 26, 'Timeline captures previous (25) and updated (26) values');

  // -------------------------------------------------------------
  // TEST 7: Multilingual Extraction (Hindi & Marathi)
  // -------------------------------------------------------------
  console.log('\n--- Test 7: Multilingual Clinical Extraction (Hindi & Marathi) ---');
  const hindiUserId = 'pat-hindi-' + Date.now();
  await patientProfilingService.processExtraction({
    userId: hindiUserId,
    conversationId: 'conv-hi-1',
    messageId: 'msg-hi-1',
    userMessage: 'मेरा नाम सुरेश है, उम्र 42 साल है और मुझे तीन दिनों से जोड़ों का दर्द और बुखार है।',
    lang: 'hi'
  });

  const hindiProfile = patientProfilingStore.getProfileByUserId(hindiUserId);
  assert(Boolean(hindiProfile), 'Hindi patient profile created');
  assert(hindiProfile?.age === 42, 'Hindi age (42) extracted correctly', `Got: ${hindiProfile?.age}`);

  const hindiRecord = patientProfilingStore.getFullPatientRecord(hindiProfile!.id);
  const hindiSym = hindiRecord?.symptoms.find(s => s.symptom.toLowerCase().includes('joint pain') || s.symptom.toLowerCase().includes('fever'));
  assert(Boolean(hindiSym), 'Hindi symptoms (Joint pain / Fever) extracted into profile');

  // Marathi Test
  const marathiUserId = 'pat-marathi-' + Date.now();
  await patientProfilingService.processExtraction({
    userId: marathiUserId,
    conversationId: 'conv-mr-1',
    messageId: 'msg-mr-1',
    userMessage: 'माझे नाव आनंदी आहे, वय 35 वर्षे, मला गेल्या आठवड्यापासून तीव्र डोकेदुखी होत आहे.',
    lang: 'mr'
  });

  const marathiProfile = patientProfilingStore.getProfileByUserId(marathiUserId);
  assert(Boolean(marathiProfile), 'Marathi patient profile created');
  const marathiRecord = patientProfilingStore.getFullPatientRecord(marathiProfile!.id);
  const marathiSym = marathiRecord?.symptoms.find(s => s.symptom.toLowerCase().includes('headache'));
  assert(Boolean(marathiSym), 'Marathi symptom (डोकेदुखी / Headache) extracted');

  // -------------------------------------------------------------
  // TEST 8: Hypothetical question NOT added to personal history
  // -------------------------------------------------------------
  console.log('\n--- Test 8: Hypothetical Inquiry Protection ---');
  const hypoUserId = 'pat-hypo-' + Date.now();
  await patientProfilingService.processExtraction({
    userId: hypoUserId,
    conversationId: 'conv-hypo-1',
    messageId: 'msg-hypo-1',
    userMessage: 'What are the main causes and symptoms of liver cirrhosis and hepatitis?',
    lang: 'en'
  });

  const hypoProfile = patientProfilingStore.getProfileByUserId(hypoUserId);
  const hypoRecord = hypoProfile ? patientProfilingStore.getFullPatientRecord(hypoProfile.id) : null;
  const hasLiverCirrhosis = hypoRecord?.medicalHistory.some(h => h.condition.toLowerCase().includes('cirrhosis'));
  assert(!hasLiverCirrhosis, 'Hypothetical inquiry did NOT falsely attribute liver cirrhosis to patient medical history');

  // -------------------------------------------------------------
  // TEST 9: Admin Listing Returns Profiles with Stats
  // -------------------------------------------------------------
  console.log('\n--- Test 9: Admin Patient Listing API ---');
  const listResult = patientProfilingStore.listProfiles({ page: 1, limit: 10 });
  assert(listResult.total > 0, 'Admin listing returns total patient count > 0');
  assert(Array.isArray(listResult.patients), 'Admin listing returns patient profile array');
  const firstPat = listResult.patients[0];
  assert(Boolean(firstPat && firstPat.id && firstPat.fullName), 'Patient profile summary has ID and Full Name');
  assert(typeof firstPat?.completenessScore === 'number', 'Patient has completeness score calculated');

  // -------------------------------------------------------------
  // TEST 10: Admin Detail View Traces Back to Source Conversation
  // -------------------------------------------------------------
  console.log('\n--- Test 10: Traceability to Source Conversation ---');
  const detail = patientProfilingStore.getFullPatientRecord(p1!.id);
  const tracedObs = detail?.observations.find(o => Boolean(o.sourceConversationId));
  assert(Boolean(tracedObs), 'Observation has sourceConversationId for complete auditability');
  assert(Boolean(tracedObs?.originalStatement), 'Observation preserves exact original patient statement');

  // -------------------------------------------------------------
  // TEST 11: Verification Status & Observation Updates
  // -------------------------------------------------------------
  console.log('\n--- Test 11: Practitioner Verification Controls ---');
  if (tracedObs) {
    const verified = patientProfilingStore.updateObservationVerification(
      tracedObs.id,
      'practitioner_verified',
      'Confirmed by Dr. Ashish Wandhare during consultation audit',
      'Dr. Ashish Wandhare'
    );
    assert(verified?.verificationStatus === 'practitioner_verified', 'Observation updated to "practitioner_verified"');
    assert(verified?.verifiedBy === 'Dr. Ashish Wandhare', 'Verified practitioner name recorded');
  } else {
    assert(true, 'Skipped obs verify test (no obs found)');
  }

  // -------------------------------------------------------------
  // TEST 12: Idempotent Extraction - Retries do not create duplicates
  // -------------------------------------------------------------
  console.log('\n--- Test 12: Idempotency & Duplicate Prevention ---');
  const symptomCountBefore = patientProfilingStore.getFullPatientRecord(p1!.id)?.symptoms.length || 0;
  
  // Re-run identical message extraction
  await patientProfilingService.extractAndUpdateProfileAsync({
    userId: testUserId,
    conversationId: testConv1,
    messageId: 'msg-2', // identical messageId
    userMessage: 'I have been suffering from severe headache and cough for the last 2 weeks.',
    lang: 'en'
  });

  const symptomCountAfter = patientProfilingStore.getFullPatientRecord(p1!.id)?.symptoms.length || 0;
  assert(symptomCountBefore === symptomCountAfter, 'Duplicate extraction avoided via idempotency checks (Count matches)');

  console.log('\n================================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllAcceptanceTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
