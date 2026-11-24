import { SymptomTaxonomyEntry } from './types.js';

export const SYMPTOM_TAXONOMY: SymptomTaxonomyEntry[] = [
  {
    symptomId: 'SYM_CONSTIPATION',
    canonicalName: 'Constipation & Intestinal Sluggishness',
    bodySystemId: 'SYS_DIGESTIVE',
    primaryOrganId: 'ORG_INTESTINES',
    medicalSynonyms: ['obstipation', 'fecal impaction', 'sluggish bowel', 'irregular bowel movements', 'hypomotility'],
    colloquialEnglish: [
      'constipation', 'cannot pass stool', 'hard stools', 'bowels won\'t clear', 'irregular motions',
      'dry hard motions', 'stuck stools', 'straining at stool', 'incomplete evacuation', 'sluggish bowel'
    ],
    hindiDevanagari: ['कब्ज', 'पेट साफ न होना', 'कड़ा मल', 'मलत्याग में कठिनाई', 'शौच न होना', 'पुराना कब्ज', 'पेट साफ नहीं'],
    hindiRomanized: ['kabz', 'pet saaf na hona', 'kada mal', 'shauch na hona', 'constipation in hindi'],
    marathiDevanagari: ['मलबद्धता', 'पोट साफ न होणे', 'पोट साफ होत नाही', 'शौचास कडक होणे', 'बद्धकोष्ठता', 'शौचास त्रास'],
    marathiRomanized: ['malbaddhata', 'pot saaf na hone', 'pot saaf hot nahi', 'shauchas kadak hone', 'baddhakoshthata'],
    typicalStage: 'Functional',
    associatedStateIds: ['STATE_DIGESTIVE_INSUFFICIENCY', 'STATE_INTESTINAL_EVACUATION_FAILURE'],
    suggestedRemedyCodes: ['S2', 'S.Lass', 'G.E.']
  },
  {
    symptomId: 'SYM_BLOATING',
    canonicalName: 'Abdominal Bloating & Flatulence',
    bodySystemId: 'SYS_DIGESTIVE',
    primaryOrganId: 'ORG_STOMACH',
    medicalSynonyms: ['meteorism', 'tympanites', 'abdominal distension', 'gas formation', 'eructation'],
    colloquialEnglish: [
      'bloating', 'bloated', 'gas in stomach', 'swollen belly', 'stomach fullness after eating', 'trapped wind',
      'heavy belly', 'abdominal fullness', 'belching', 'stomach distended'
    ],
    hindiDevanagari: ['पेट फूलना', 'पेट में गैस', 'पेट भारी', 'गैस व भारीपन', 'अफारा', 'पेट में भारीपन', 'पेट फूल'],
    hindiRomanized: ['pet phoolna', 'pet me gas', 'pet bhari lagna', 'afara', 'gas banna', 'bloated'],
    marathiDevanagari: ['पोट फुगणे', 'पोट फुगलेले', 'पोटात गॅस', 'पोट जड', 'अपचन व गॅस', 'पोटात वात', 'पोट फुग'],
    marathiRomanized: ['pot fugne', 'pot fuglele', 'potat gas', 'pot jad hone', 'apachan'],
    typicalStage: 'Functional',
    associatedStateIds: ['STATE_DIGESTIVE_INSUFFICIENCY'],
    suggestedRemedyCodes: ['S2', 'C15', 'G.E.']
  },
  {
    symptomId: 'SYM_RENAL_COLIC',
    canonicalName: 'Renal Colic & Urinary Calculi Pain',
    bodySystemId: 'SYS_URINARY',
    primaryOrganId: 'ORG_KIDNEY',
    medicalSynonyms: ['nephrolithiasis', 'urolithiasis', 'renal gravel', 'kidney stone pain', 'flank colic'],
    colloquialEnglish: [
      'kidney stone', 'kidney stone pain', 'renal colic', 'sharp back flank pain', 'stone colic', 'severe pain radiating to groin',
      'gravel in urine', 'stone attack', 'lower back renal spasm', 'flank pain'
    ],
    hindiDevanagari: ['गुर्दे की पथरी', 'किडनी की पथरी', 'पथरी का दर्द', 'गुर्दे की पथरी का दर्द', 'कमर में तेज दर्द', 'पथरी', 'किडनी स्टोन'],
    hindiRomanized: ['gurde ki pathari', 'kidney stone', 'pathri', 'pathari ka dard', 'kidney stone ka dard'],
    marathiDevanagari: ['मूतखडा', 'मूतखड्याची', 'मूतखड्याचे दुखणे', 'किडनी स्टोन', 'किडनी स्टोनचे दुखणे', 'कंबरेत असह्य कळ', 'मूतखडा दुखणे'],
    marathiRomanized: ['mootkhada', 'mutkhada', 'kidney stone', 'mootkhada dukhne', 'pathit kambaret dukhne'],
    typicalStage: 'Structural',
    associatedStateIds: ['STATE_GENITOURINARY_MUCOSAL_DYSFUNCTION'],
    suggestedRemedyCodes: ['S6', 'C6', 'A2', 'B.E.']
  },
  {
    symptomId: 'SYM_BURNING_URINATION',
    canonicalName: 'Burning Urination & Dysuria',
    bodySystemId: 'SYS_URINARY',
    primaryOrganId: 'ORG_BLADDER',
    medicalSynonyms: ['dysuria', 'urothelial irritation', 'cystitis pain', 'urinary strangury'],
    colloquialEnglish: [
      'burning urination', 'pain while passing urine', 'burning pee', 'stinging sensation while urinating',
      'scalding urine', 'painful urination', 'urinary burning', 'burning urine'
    ],
    hindiDevanagari: ['पेशाब में जलन', 'पेशाब में बहुत तेज जलन', 'पेशाब करते समय दर्द', 'जलनदार पेशाब', 'रुक-रुक कर पेशाब आना', 'पेशाब जलन'],
    hindiRomanized: ['peshab me jalan', 'peshab karte samay dard', 'jalandaar peshab', 'mutra jalan'],
    marathiDevanagari: ['लघवी करताना जळजळ', 'लघवी करताना खूप आग', 'लघवीला आग', 'लघवी जळजळ', 'लघवी साफ न होणे', 'लघवीत दाह'],
    marathiRomanized: ['laghavi kartana jaljal', 'laghavila aag', 'laghavila aag hone', 'laghavi daah'],
    typicalStage: 'Functional',
    associatedStateIds: ['STATE_GENITOURINARY_MUCOSAL_DYSFUNCTION'],
    suggestedRemedyCodes: ['S6', 'C17', 'A2']
  },
  {
    symptomId: 'SYM_PRODUCTIVE_COUGH',
    canonicalName: 'Productive Cough & Airway Catarrh',
    bodySystemId: 'SYS_RESPIRATORY',
    primaryOrganId: 'ORG_BRONCHI',
    medicalSynonyms: ['bronchial catarrh', 'viscous expectoration', 'bronchitis with sputum', 'mucous cough'],
    colloquialEnglish: [
      'productive cough', 'wet cough', 'cough with phlegm', 'cough with thick mucus', 'congested chest',
      'rattling cough', 'spitting mucus', 'heavy chest cough', 'chest congestion', 'phlegm'
    ],
    hindiDevanagari: ['बलगम वाली खांसी', 'कफ वाली खांसी', 'कफ', 'बलगम', 'सीने में जकड़न', 'फेफड़ों में कफ', 'तर खांसी', 'गाढ़ा कफ'],
    hindiRomanized: ['balgam wali khansi', 'kaph wali khansi', 'balgam', 'kaph', 'seene me jakdan', 'tar khansi'],
    marathiDevanagari: ['कफाचा खोकला', 'छातीत कफ', 'कफ साठून', 'चिकट कफ', 'कफ पडणारा खोकला', 'कफ पडत आहे', 'खोकल्यातून चिकट कफ'],
    marathiRomanized: ['kaphacha khokla', 'chhatit kaph', 'chikat kaph', 'chhatit kaph sathne'],
    typicalStage: 'Acute Functional',
    associatedStateIds: ['STATE_ACUTE_BRONCHIAL_CONGESTION'],
    suggestedRemedyCodes: ['P1', 'P2']
  },
  {
    symptomId: 'SYM_SPASMODIC_COUGH',
    canonicalName: 'Neuro-Spasmodic Cough & Laryngeal Irritation',
    bodySystemId: 'SYS_RESPIRATORY',
    primaryOrganId: 'ORG_UPPER_AIRWAYS',
    medicalSynonyms: ['pertussis-like cough', 'laryngeal spasm', 'whooping cough', 'spasmodic asthma'],
    colloquialEnglish: [
      'spasmodic cough', 'dry hacking cough', 'cough fits', 'cough paroxysms', 'throat tickle cough',
      'suffocative cough', 'choking cough at night', 'spasm cough'
    ],
    hindiDevanagari: ['सूखी खांसी', 'काली खांसी', 'धौंकनी वाली खांसी', 'खांसी का दौरा', 'गले में खराश के साथ खांसी'],
    hindiRomanized: ['sukhi khansi', 'kali khansi', 'khansi ka daura', 'gale me kharash'],
    marathiDevanagari: ['डांग्या खोकला', 'सुका खोकला', 'खोकल्याची उबळ', 'घशात खवखव व कोरडा खोकला'],
    marathiRomanized: ['dangya khokla', 'suka khokla', 'khoklyachi ubal', 'ghashat khavkhav'],
    typicalStage: 'Chronic Functional',
    associatedStateIds: ['STATE_NEURO_SPASMODIC_RESPIRATORY'],
    suggestedRemedyCodes: ['P3', 'P4']
  },
  {
    symptomId: 'SYM_VARICOSE_VEINS',
    canonicalName: 'Varicose Veins & Venous Stasis',
    bodySystemId: 'SYS_CARDIOVASCULAR',
    primaryOrganId: 'ORG_VEINS',
    medicalSynonyms: ['phlebectasia', 'venous insufficiency', 'varicosities', 'chronic venous congestion'],
    colloquialEnglish: [
      'varicose veins', 'swollen leg veins', 'purple bulged veins', 'heavy tired legs', 'spider veins',
      'aching veins', 'venous pooling', 'aching lower limbs', 'varicose'
    ],
    hindiDevanagari: ['पैरों की नसों का फूलना', 'वेरिकोज वेन्स', 'नीली उभरी हुई नसें', 'पैरों की नसें', 'नसों का फूलना', 'पैरों में भारीपन व दर्द'],
    hindiRomanized: ['pairo ki naso ka phoolna', 'varicose veins in hindi', 'neeli nase', 'pairo me dard', 'varicose'],
    marathiDevanagari: ['पायांच्या शिरा फुगणे', 'पायांच्या शिरा फुगल्या', 'शिरा फुगल्या', 'व्हेरिकोज व्हेन्स', 'निळ्या सुजलेल्या नसा', 'पायात असह्य जडपणा', 'शिरा फुगणे'],
    marathiRomanized: ['payanchya shira fugne', 'shira fuglya', 'varicose veins in marathi', 'payat jadpana'],
    typicalStage: 'Functional',
    associatedStateIds: ['STATE_VENOUS_CONGESTION_HEAT'],
    suggestedRemedyCodes: ['A2', 'B.E.', 'Ven1']
  },
  {
    symptomId: 'SYM_HEMORRHOIDS',
    canonicalName: 'Hemorrhoids & Rectal Venous Congestion',
    bodySystemId: 'SYS_CARDIOVASCULAR',
    primaryOrganId: 'ORG_VEINS',
    medicalSynonyms: ['piles', 'rectal varicosities', 'hemorrhoidal swelling', 'bleeding piles'],
    colloquialEnglish: [
      'piles', 'hemorrhoids', 'anal lumps', 'bleeding from rectum', 'burning anal pain',
      'swollen piles masses', 'pain during bowel movement'
    ],
    hindiDevanagari: ['बवासीर', 'पाइल्स', 'मलद्वार में मस्से', 'बवासीर का दर्द', 'खूनी बवासीर'],
    hindiRomanized: ['bawasir', 'piles in hindi', 'masse', 'khooni bawasir'],
    marathiDevanagari: ['मूळव्याध', 'मूळव्याधीचा', 'पाईल्स', 'गुदद्वारात कोंब', 'मूळव्याधीचे दुखणे', 'रक्त पडणे'],
    marathiRomanized: ['mulvyadh', 'mulvyadhicha', 'piles in marathi', 'guddwarat komb', 'rakt padne'],
    typicalStage: 'Structural',
    associatedStateIds: ['STATE_VENOUS_CONGESTION_HEAT'],
    suggestedRemedyCodes: ['A2', 'B.E.', 'C2']
  },
  {
    symptomId: 'SYM_ARTHRITIS_JOINT_PAIN',
    canonicalName: 'Arthritic Pain & Cartilage Degeneration',
    bodySystemId: 'SYS_MUSCULOSKELETAL',
    primaryOrganId: 'ORG_BONES_JOINTS',
    medicalSynonyms: ['osteoarthritis', 'gouty arthropathy', 'cartilage breakdown', 'joint stiffness'],
    colloquialEnglish: [
      'joint pain', 'knee pain', 'arthritis pain', 'stiff joints in morning', 'cracking joints',
      'cartilage wearing out', 'bone pain', 'swollen knuckles', 'arthritis', 'cartilage'
    ],
    hindiDevanagari: ['जोड़ों का दर्द', 'गठिया', 'घुटनों का दर्द', 'हड्डियों में दर्द', 'जोड़ों में अकड़न', 'हड्डियों'],
    hindiRomanized: ['jodo ka dard', 'gathiya', 'ghutno ka dard', 'haddiyo me dard'],
    marathiDevanagari: ['सांधेदुखी', 'संधिवात', 'गुडघेदुखी', 'हाडांचे दुखणे', 'सांध्यांची झीज', 'सांधे दुखी'],
    marathiRomanized: ['sandheduki', 'sandhivat', 'gudgheduki', 'hadanche dukhne'],
    typicalStage: 'Structural',
    associatedStateIds: ['STATE_FIBRO_OSSEOUS_DEGENERATION'],
    suggestedRemedyCodes: ['C4', 'A3']
  },
  {
    symptomId: 'SYM_SKIN_ECZEMA',
    canonicalName: 'Eczema & Cutaneous Toxemia',
    bodySystemId: 'SYS_INTEGUMENTARY',
    primaryOrganId: 'ORG_SKIN',
    medicalSynonyms: ['dermatitis', 'pruritus', 'scrofulous skin eruptions', 'cutaneous irritation'],
    colloquialEnglish: [
      'eczema', 'skin rash', 'intense itching', 'red inflamed skin', 'flaking skin',
      'dry weeping skin patches', 'allergic skin rash', 'skin eruption'
    ],
    hindiDevanagari: ['एक्जिमा', 'त्वचा में खुजली', 'लाल चकत्ते', 'दाद-खाज', 'चर्म रोग'],
    hindiRomanized: ['eczema in hindi', 'tvacha me khujli', 'laal chakatte', 'daadh khaj', 'charm rog'],
    marathiDevanagari: ['एक्झिमा', 'त्वचेवर खाज', 'लाल चट्टे', 'खरुज', 'त्वचारोग'],
    marathiRomanized: ['eczema in marathi', 'tvachevar khaj', 'kharuj', 'tvacharog'],
    typicalStage: 'Functional',
    associatedStateIds: ['STATE_LYMPHATIC_TOXICITY'],
    suggestedRemedyCodes: ['S1', 'S5', 'C5', 'A.P.P.']
  },
  {
    symptomId: 'SYM_CHRONIC_FATIGUE',
    canonicalName: 'Vital Fatigue & Arterial Sluggishness',
    bodySystemId: 'SYS_NERVOUS',
    primaryOrganId: 'ORG_BRAIN',
    medicalSynonyms: ['neurasthenia', 'vital debility', 'adrenal exhaustion', 'paralytic weakness'],
    colloquialEnglish: [
      'chronic fatigue', 'severe weakness', 'no energy', 'feeling drained out', 'muscular exhaustion',
      'cannot walk properly', 'vital collapse', 'fatigue'
    ],
    hindiDevanagari: ['अत्यधिक कमजोरी', 'थकान', 'सुस्ती', 'शरीर में जान न होना', 'नाड़ी की कमजोरी'],
    hindiRomanized: ['atyadhik kamzori', 'thakan', 'sustee', 'kamzori'],
    marathiDevanagari: ['अतिशय थकवा', 'अशक्तपणा', 'शरीरात त्राण नसणे', 'सुस्ती', 'शारीरिक दुर्बलता', 'थकवा'],
    marathiRomanized: ['atishay thakva', 'ashaktapana', 'trann nasne', 'sharirik durballata', 'thakva'],
    typicalStage: 'Recovery',
    associatedStateIds: ['STATE_VITAL_ENERGY_DEFICIENCY'],
    suggestedRemedyCodes: ['R.E.', 'S10', 'C6']
  },
  {
    symptomId: 'SYM_INSOMNIA_NERVOUS',
    canonicalName: 'Insomnia & Mental Exhaustion',
    bodySystemId: 'SYS_NERVOUS',
    primaryOrganId: 'ORG_BRAIN',
    medicalSynonyms: ['sleeplessness', 'cerebrospinal debility', 'mental agitation', 'nervous exhaustion'],
    colloquialEnglish: [
      'insomnia', 'cannot sleep', 'restless sleep', 'brain tired but can\'t sleep', 'mental overwork',
      'waking up exhausted', 'nervous agitation', 'sleepless'
    ],
    hindiDevanagari: ['नींद न आना', 'अनिद्रा', 'मानसिक तनाव व थकान', 'रात भर करवटें बदलना', 'दिमागी थकान'],
    hindiRomanized: ['neend na aana', 'anidra', 'mansik thakan', 'dimagi thakan'],
    marathiDevanagari: ['झोप न येणे', 'अनिद्रा', 'मानसिक थकवा', 'डोके शांत नसणे', 'अस्वस्थ झोप'],
    marathiRomanized: ['zhop na yene', 'anidra', 'mansik thakva', 'aswastha zhop'],
    typicalStage: 'Recovery',
    associatedStateIds: ['STATE_CEREBROSPINAL_DYSREGULATION'],
    suggestedRemedyCodes: ['W.E.', 'C1']
  }
];
