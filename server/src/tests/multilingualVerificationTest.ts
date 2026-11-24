/**
 * v2026 Electropathy AI Engine - Multilingual Verification Test
 * Tests:
 * 1. 4-Tier Language Detection (English, Hindi, Marathi, Hinglish, Romanized Marathi, In-situ Switch)
 * 2. Cross-Lingual Entity & Synonym Expansion
 * 3. Cross-Lingual Knowledge Retrieval against Canonical Knowledge Base
 * 4. End-to-End Chat Generation in target languages (Hindi & Marathi Devanagari)
 */

import { multilingualNlpService } from '../services/multilingualNlpService.js';
import { knowledgeService } from '../services/knowledgeService.js';
import { patientChatService } from '../services/patientChatService.js';

interface TestResult {
  suite: string;
  testCase: string;
  passed: boolean;
  details?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, testCase: string, details?: any) {
  if (condition) {
    results.push({ suite, testCase, passed: true, details });
    console.log(`  ✅ [PASS] ${suite} -> ${testCase}`);
  } else {
    results.push({ suite, testCase, passed: false, details });
    console.error(`  ❌ [FAIL] ${suite} -> ${testCase}`, details);
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING V2026 MULTILINGUAL VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // SUITE 1: 4-Tier Language Detection
  // -------------------------------------------------------------
  console.log('--- Suite 1: Language Detection & Script Analysis ---');

  const enQuery = 'Which remedies are associated with liver-related conditions?';
  const hiQuery = 'लिवर से संबंधित समस्याओं के लिए कौन से रेमेडीज उपलब्ध हैं?';
  const mrQuery = 'लिव्हरशी संबंधित समस्यांसाठी कोणते रेमेडीज उपलब्ध आहेत?';
  const hinglishQuery = 'Liver ke liye kaunse remedies available hain?';
  const romanMrQuery = 'Liver sathi konte remedies available aahet?';
  const switchMr = 'Explain the same in Marathi';
  const switchHi = 'कृपया यह सब हिंदी में समझाइए';
  const switchMrDev = 'हे सर्व मराठीत सांगा';

  const enRes = multilingualNlpService.detectLanguage(enQuery);
  assert(enRes.targetLang === 'en', 'Language Detection', 'English query detected as en', enRes);

  const hiRes = multilingualNlpService.detectLanguage(hiQuery);
  assert(hiRes.targetLang === 'hi' && hiRes.script === 'devanagari', 'Language Detection', 'Hindi Devanagari query detected as hi', hiRes);

  const mrRes = multilingualNlpService.detectLanguage(mrQuery);
  assert(mrRes.targetLang === 'mr' && mrRes.script === 'devanagari', 'Language Detection', 'Marathi Devanagari query detected as mr', mrRes);

  const hinglishRes = multilingualNlpService.detectLanguage(hinglishQuery);
  assert(hinglishRes.targetLang === 'hi' && hinglishRes.isTransliterated, 'Language Detection', 'Hinglish query detected as transliterated hi', hinglishRes);

  const romanMrRes = multilingualNlpService.detectLanguage(romanMrQuery);
  assert(romanMrRes.targetLang === 'mr' && romanMrRes.isTransliterated, 'Language Detection', 'Romanized Marathi query detected as transliterated mr', romanMrRes);

  const switchMrRes = multilingualNlpService.detectLanguage(switchMr, 'en');
  assert(switchMrRes.targetLang === 'mr' && switchMrRes.isExplicitInstruction, 'Language Detection', 'Explicit "Explain in Marathi" detected as mr with priority 1', switchMrRes);

  const switchHiRes = multilingualNlpService.detectLanguage(switchHi, 'en');
  assert(switchHiRes.targetLang === 'hi' && switchHiRes.isExplicitInstruction, 'Language Detection', 'Explicit Hindi instruction detected as hi', switchHiRes);

  const switchMrDevRes = multilingualNlpService.detectLanguage(switchMrDev, 'hi');
  assert(switchMrDevRes.targetLang === 'mr' && switchMrDevRes.isExplicitInstruction, 'Language Detection', 'Devanagari "मराठीत सांगा" switches to mr overriding default', switchMrDevRes);

  // -------------------------------------------------------------
  // SUITE 2: Cross-Lingual Entity Extraction & Synonym Expansion
  // -------------------------------------------------------------
  console.log('\n--- Suite 2: Cross-Lingual Entity Extraction & Synonyms ---');

  const liverHiExpanded = multilingualNlpService.expandQuery(hiQuery, 'hi');
  assert(
    liverHiExpanded.entities.organs.includes('Liver'),
    'Entity Extraction',
    'Hindi "लिवर" extracted as canonical organ Liver',
    liverHiExpanded.entities
  );
  assert(
    liverHiExpanded.entities.remedies.includes('S5') && liverHiExpanded.entities.remedies.includes('C5'),
    'Entity Extraction',
    'Liver query automatically expands to remedy affinities S5 and C5',
    liverHiExpanded.entities.remedies
  );

  const kidneyMrExpanded = multilingualNlpService.expandQuery('मूत्रपिंडाच्या विकारांवर काय उपाय आहेत?', 'mr');
  assert(
    kidneyMrExpanded.entities.organs.includes('Kidneys'),
    'Entity Extraction',
    'Marathi "मूत्रपिंड" extracted as canonical organ Kidneys',
    kidneyMrExpanded.entities
  );
  assert(
    kidneyMrExpanded.entities.remedies.includes('S6') && kidneyMrExpanded.entities.remedies.includes('C6'),
    'Entity Extraction',
    'Kidney query expands to S6 and C6 affinities',
    kidneyMrExpanded.entities.remedies
  );

  // -------------------------------------------------------------
  // SUITE 3: Cross-Lingual Knowledge Retrieval
  // -------------------------------------------------------------
  console.log('\n--- Suite 3: Cross-Lingual Hybrid Knowledge Retrieval ---');

  console.log('  Testing English query retrieval...');
  const enMatches = await knowledgeService.findMatchingKnowledge(enQuery, { limit: 4, targetLang: 'en' });
  const enHasLiverRemedy = enMatches.some(m => m.content.includes('S5') || m.content.includes('C5') || m.content.toLowerCase().includes('liver'));
  assert(enHasLiverRemedy && enMatches.length > 0, 'Retrieval', 'English query retrieves liver remedies (S5/C5)', { count: enMatches.length, top: enMatches[0]?.id });

  console.log('  Testing Hindi Devanagari query retrieval...');
  const hiMatches = await knowledgeService.findMatchingKnowledge(hiQuery, { limit: 4, targetLang: 'hi' });
  const hiHasLiverRemedy = hiMatches.some(m => m.content.includes('S5') || m.content.includes('C5') || m.content.toLowerCase().includes('liver'));
  assert(hiHasLiverRemedy && hiMatches.length > 0, 'Retrieval', 'Hindi Devanagari query retrieves same canonical liver remedies', { count: hiMatches.length, top: hiMatches[0]?.id });

  console.log('  Testing Marathi Devanagari query retrieval...');
  const mrMatches = await knowledgeService.findMatchingKnowledge(mrQuery, { limit: 4, targetLang: 'mr' });
  const mrHasLiverRemedy = mrMatches.some(m => m.content.includes('S5') || m.content.includes('C5') || m.content.toLowerCase().includes('liver'));
  assert(mrHasLiverRemedy && mrMatches.length > 0, 'Retrieval', 'Marathi Devanagari query retrieves same canonical liver remedies', { count: mrMatches.length, top: mrMatches[0]?.id });

  console.log('  Testing Hinglish query retrieval...');
  const hinglishMatches = await knowledgeService.findMatchingKnowledge(hinglishQuery, { limit: 4, targetLang: 'hi' });
  const hinglishHasLiverRemedy = hinglishMatches.some(m => m.content.includes('S5') || m.content.includes('C5') || m.content.toLowerCase().includes('liver'));
  assert(hinglishHasLiverRemedy && hinglishMatches.length > 0, 'Retrieval', 'Hinglish query retrieves same canonical liver remedies', { count: hinglishMatches.length, top: hinglishMatches[0]?.id });

  console.log('  Testing Romanized Marathi query retrieval...');
  const romanMrMatches = await knowledgeService.findMatchingKnowledge(romanMrQuery, { limit: 4, targetLang: 'mr' });
  const romanMrHasLiverRemedy = romanMrMatches.some(m => m.content.includes('S5') || m.content.includes('C5') || m.content.toLowerCase().includes('liver'));
  assert(romanMrHasLiverRemedy && romanMrMatches.length > 0, 'Retrieval', 'Romanized Marathi query retrieves same canonical liver remedies', { count: romanMrMatches.length, top: romanMrMatches[0]?.id });

  // -------------------------------------------------------------
  // SUITE 4: Multi-Turn Language Switch & Chat Generation
  // -------------------------------------------------------------
  console.log('\n--- Suite 4: End-to-End Chat Generation & Language Switching ---');

  const testUserId = 'test-multilingual-user';
  const testConvId = 'conv-multilingual-test-' + Date.now();

  console.log('  Sending Marathi Consultation...');
  const mrChatRes = await patientChatService.processPatientMessage({
    userId: testUserId,
    conversationId: testConvId,
    content: 'मला २ दिवसांपासून तीव्र खोकला आणि छातीत कफ जाणवतोय. उपाय काय?',
    preferredLang: 'mr'
  });

  const mrResponseText = mrChatRes.assistantMessage.content;
  const containsDevanagari = /[\u0900-\u097F]/.test(mrResponseText);
  assert(containsDevanagari, 'Chat Generation', 'Marathi query response contains authentic Devanagari script', { snippet: mrResponseText.slice(0, 150) });
  console.log(`    Snippet: ${mrResponseText.slice(0, 180)}...\n`);

  console.log('  Sending Language Switch follow-up: "Explain the same in Hindi"...');
  const switchFollowupRes = await patientChatService.processPatientMessage({
    userId: testUserId,
    conversationId: testConvId,
    content: 'Explain the same in Hindi',
    preferredLang: 'mr' // user setting is mr, but message explicitly requested Hindi
  });

  const hiResponseText = switchFollowupRes.assistantMessage.content;
  const switchContainsDevanagari = /[\u0900-\u097F]/.test(hiResponseText);
  // Verify that it is in Hindi
  const isHindiResponse = hiResponseText.includes('है') || hiResponseText.includes('के लिए') || hiResponseText.includes('उपाय') || hiResponseText.includes('नमस्ते');
  assert(switchContainsDevanagari && isHindiResponse, 'Language Switch', 'Explicit language switch follow-up produced fluent Hindi response', { snippet: hiResponseText.slice(0, 150) });
  console.log(`    Snippet: ${hiResponseText.slice(0, 180)}...\n`);

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('===============================================================');
  console.log(`🏁 TEST SUITE FINISHED: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
