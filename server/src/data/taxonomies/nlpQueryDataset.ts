import { NLPQuerySample } from './types.js';

export const NLP_QUERY_DATASET: NLPQuerySample[] = [
  // Multi-symptom search (English)
  {
    queryId: 'Q_EN_01',
    queryText: 'My stomach feels very bloated, heavy, and I have chronic constipation with sluggish digestion.',
    language: 'en',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_BLOATING', 'SYM_CONSTIPATION'],
    extractedOrganIds: ['ORG_STOMACH', 'ORG_INTESTINES', 'ORG_LIVER'],
    expectedStateMatch: 'STATE_DIGESTIVE_INSUFFICIENCY',
    expectedRemedyCodes: ['S2', 'S.Lass', 'G.E.']
  },
  {
    queryId: 'Q_EN_02',
    queryText: 'Patient has severe right flank kidney stone colic pain with burning urination.',
    language: 'en',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_RENAL_COLIC', 'SYM_BURNING_URINATION'],
    extractedOrganIds: ['ORG_KIDNEY', 'ORG_BLADDER'],
    expectedStateMatch: 'STATE_GENITOURINARY_MUCOSAL_DYSFUNCTION',
    expectedRemedyCodes: ['S6', 'C6', 'A2', 'B.E.']
  },
  {
    queryId: 'Q_EN_03',
    queryText: 'Heavy chest congestion with persistent cough and thick viscous phlegm.',
    language: 'en',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_PRODUCTIVE_COUGH'],
    extractedOrganIds: ['ORG_BRONCHI', 'ORG_LUNGS'],
    expectedStateMatch: 'STATE_ACUTE_BRONCHIAL_CONGESTION',
    expectedRemedyCodes: ['P1', 'P2']
  },
  {
    queryId: 'Q_EN_04',
    queryText: 'Painful swollen varicose veins in legs with severe venous throbbing and aching.',
    language: 'en',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_VARICOSE_VEINS'],
    extractedOrganIds: ['ORG_VEINS'],
    expectedStateMatch: 'STATE_VENOUS_CONGESTION_HEAT',
    expectedRemedyCodes: ['A2', 'B.E.', 'Ven1']
  },

  // Multi-symptom search (Hindi)
  {
    queryId: 'Q_HI_01',
    queryText: 'मुझे बहुत दिनों से कब्ज है और पेट में बहुत गैस व भारीपन रहता है।',
    language: 'hi',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_CONSTIPATION', 'SYM_BLOATING'],
    extractedOrganIds: ['ORG_INTESTINES', 'ORG_STOMACH'],
    expectedStateMatch: 'STATE_DIGESTIVE_INSUFFICIENCY',
    expectedRemedyCodes: ['S2', 'S.Lass', 'G.E.']
  },
  {
    queryId: 'Q_HI_02',
    queryText: 'गुर्दे की पथरी का असह्य दर्द हो रहा है और पेशाब में बहुत तेज जलन है।',
    language: 'hi',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_RENAL_COLIC', 'SYM_BURNING_URINATION'],
    extractedOrganIds: ['ORG_KIDNEY', 'ORG_BLADDER'],
    expectedStateMatch: 'STATE_GENITOURINARY_MUCOSAL_DYSFUNCTION',
    expectedRemedyCodes: ['S6', 'C6', 'A2', 'B.E.']
  },
  {
    queryId: 'Q_HI_03',
    queryText: 'छाती में बहुत बलगम जमा है और खांसी के साथ गाढ़ा कफ निकलता है।',
    language: 'hi',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_PRODUCTIVE_COUGH'],
    extractedOrganIds: ['ORG_BRONCHI', 'ORG_LUNGS'],
    expectedStateMatch: 'STATE_ACUTE_BRONCHIAL_CONGESTION',
    expectedRemedyCodes: ['P1', 'P2']
  },
  {
    queryId: 'Q_HI_04',
    queryText: 'पैरों की नसें नीली होकर फूल गई हैं और बहुत दर्द होता है। बवासीर भी है।',
    language: 'hi',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_VARICOSE_VEINS', 'SYM_HEMORRHOIDS'],
    extractedOrganIds: ['ORG_VEINS'],
    expectedStateMatch: 'STATE_VENOUS_CONGESTION_HEAT',
    expectedRemedyCodes: ['A2', 'B.E.']
  },

  // Multi-symptom search (Marathi)
  {
    queryId: 'Q_MR_01',
    queryText: 'माझे पोट अजिबात साफ होत नाही आणि पोटात गॅस होऊन पोट सतत फुगलेले राहते.',
    language: 'mr',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_CONSTIPATION', 'SYM_BLOATING'],
    extractedOrganIds: ['ORG_INTESTINES', 'ORG_STOMACH'],
    expectedStateMatch: 'STATE_DIGESTIVE_INSUFFICIENCY',
    expectedRemedyCodes: ['S2', 'S.Lass', 'G.E.']
  },
  {
    queryId: 'Q_MR_02',
    queryText: 'मूतखड्याची तीव्र कळ कंबरेत येत आहे आणि लघवी करताना खूप आग व जळजळ होते.',
    language: 'mr',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_RENAL_COLIC', 'SYM_BURNING_URINATION'],
    extractedOrganIds: ['ORG_KIDNEY', 'ORG_BLADDER'],
    expectedStateMatch: 'STATE_GENITOURINARY_MUCOSAL_DYSFUNCTION',
    expectedRemedyCodes: ['S6', 'C6', 'A2', 'B.E.']
  },
  {
    queryId: 'Q_MR_03',
    queryText: 'छातीत कफ साठून सारखा खोकला येत आहे आणि चिकट कफ पडत आहे.',
    language: 'mr',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_PRODUCTIVE_COUGH'],
    extractedOrganIds: ['ORG_BRONCHI', 'ORG_LUNGS'],
    expectedStateMatch: 'STATE_ACUTE_BRONCHIAL_CONGESTION',
    expectedRemedyCodes: ['P1', 'P2']
  },
  {
    queryId: 'Q_MR_04',
    queryText: 'पायांच्या शिरा फुगल्या आहेत आणि असह्य जडपणा वाटतो, मूळव्याधीचाही त्रास आहे.',
    language: 'mr',
    intent: 'multi_symptom_search',
    extractedSymptomIds: ['SYM_VARICOSE_VEINS', 'SYM_HEMORRHOIDS'],
    extractedOrganIds: ['ORG_VEINS'],
    expectedStateMatch: 'STATE_VENOUS_CONGESTION_HEAT',
    expectedRemedyCodes: ['A2', 'B.E.']
  },

  // Organ search
  {
    queryId: 'Q_ORG_01',
    queryText: 'Which remedies in the dataset act specifically on the liver and gallbladder?',
    language: 'en',
    intent: 'organ_search',
    extractedSymptomIds: [],
    extractedOrganIds: ['ORG_LIVER', 'ORG_GALLBLADDER'],
    expectedRemedyCodes: ['S2', 'S3', 'S5', 'C5']
  },
  {
    queryId: 'Q_ORG_02',
    queryText: 'मूत्रपिंड आणि मूत्राशयावर कोणती औषधे कार्य करतात?',
    language: 'mr',
    intent: 'organ_search',
    extractedSymptomIds: [],
    extractedOrganIds: ['ORG_KIDNEY', 'ORG_BLADDER'],
    expectedRemedyCodes: ['S6', 'C17']
  },

  // Remedy info & comparison
  {
    queryId: 'Q_INFO_01',
    queryText: 'Explain the physiological action, polarity, and organ axis of C4.',
    language: 'en',
    intent: 'remedy_info',
    extractedSymptomIds: ['SYM_ARTHRITIS_JOINT_PAIN'],
    extractedOrganIds: ['ORG_BONES_JOINTS'],
    expectedStateMatch: 'STATE_FIBRO_OSSEOUS_DEGENERATION',
    expectedRemedyCodes: ['C4']
  },
  {
    queryId: 'Q_COMP_01',
    queryText: 'What is the clinical difference between S1 and S2 in terms of organ affinity?',
    language: 'en',
    intent: 'remedy_comparison',
    extractedSymptomIds: [],
    extractedOrganIds: ['ORG_LYMPH_NODES', 'ORG_STOMACH', 'ORG_LIVER'],
    expectedRemedyCodes: ['S1', 'S2']
  },

  // Polarity / Electricity search
  {
    queryId: 'Q_POL_01',
    queryText: 'Which electricity provides cooling action for inflamed varicose veins and venous heat?',
    language: 'en',
    intent: 'polarity_electricity_search',
    extractedSymptomIds: ['SYM_VARICOSE_VEINS'],
    extractedOrganIds: ['ORG_VEINS'],
    expectedStateMatch: 'STATE_VENOUS_CONGESTION_HEAT',
    expectedRemedyCodes: ['B.E.']
  },
  {
    queryId: 'Q_POL_02',
    queryText: 'थकवा आणि नाडीच्या दुर्बलतेसाठी कोणती पॉझिटिव्ह इलेक्ट्रिसिटी वापरली जाते?',
    language: 'mr',
    intent: 'polarity_electricity_search',
    extractedSymptomIds: ['SYM_CHRONIC_FATIGUE'],
    extractedOrganIds: ['ORG_BRAIN', 'ORG_ARTERIES'],
    expectedStateMatch: 'STATE_VITAL_ENERGY_DEFICIENCY',
    expectedRemedyCodes: ['R.E.']
  },

  // SPG Botanical query
  {
    queryId: 'Q_SPG_01',
    queryText: 'What is Populus SPG in Table B and which electricity is it mapped to?',
    language: 'en',
    intent: 'spg_botanical_composition',
    extractedSymptomIds: [],
    extractedOrganIds: ['ORG_VEINS'],
    expectedRemedyCodes: ['G.E.']
  }
];
