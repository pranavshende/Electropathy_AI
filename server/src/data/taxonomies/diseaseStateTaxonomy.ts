import { DiseaseStateTaxonomyEntry, PhysiologicalRequirementEntry } from './types.js';

export const DISEASE_STATE_TAXONOMY: DiseaseStateTaxonomyEntry[] = [
  {
    stateId: 'STATE_LYMPHATIC_TOXICITY',
    stateName: 'Lymphatic Toxicity & Glandular Congestion',
    stage: 'Functional',
    pathophysiologicalMechanism: 'Humoral stagnation in interstitial fluid and lymphatic vessels with glandular hyperreactivity.',
    associatedOrganAxis: 'Lymph–Skin–Glands',
    physiologicalRequirements: ['REQ_LYMPH_DRAINAGE', 'REQ_GLANDULAR_REGULATION', 'REQ_CUTANEOUS_PURIFICATION'],
    representativeSymptoms: ['swollen glands', 'tonsil swelling', 'eczema', 'skin eruptions', 'lymph stasis']
  },
  {
    stateId: 'STATE_DIGESTIVE_INSUFFICIENCY',
    stateName: 'Digestive Insufficiency & Portal Congestion',
    stage: 'Functional',
    pathophysiologicalMechanism: 'Deficient gastric/pancreatic glandular secretions accompanied by passive portal congestion and mucosal catarrh.',
    associatedOrganAxis: 'Digestive–Hepatic',
    physiologicalRequirements: ['REQ_DIGESTIVE_REGULATION', 'REQ_BILE_STIMULATION', 'REQ_MUCOSAL_CORRECTION'],
    representativeSymptoms: ['constipation', 'abdominal bloating', 'gastric catarrh', 'biliary sluggishness', 'sluggish liver']
  },
  {
    stateId: 'STATE_HEPATOBILIARY_CONGESTION',
    stateName: 'Hepatobiliary Congestion & Biliary Dysregulation',
    stage: 'Functional',
    pathophysiologicalMechanism: 'Impaired bile flow with secondary toxemia and hepatic ductal tension.',
    associatedOrganAxis: 'Liver–Biliary',
    physiologicalRequirements: ['REQ_HEPATIC_DETOX', 'REQ_BILE_REGULATION'],
    representativeSymptoms: ['hepatic congestion', 'jaundice tendency', 'biliary colic', 'yellow-coated tongue', 'right hypochondrium fullness']
  },
  {
    stateId: 'STATE_HEPATO_RENAL_FAILURE',
    stateName: 'Hepato-Renal Detox Failure & Systemic Toxemia',
    stage: 'Chronic Functional',
    pathophysiologicalMechanism: 'Dual organ excretory deficit leading to fluid retention, interstitial edema, and chronic toxic accumulation.',
    associatedOrganAxis: 'Liver–Kidney',
    physiologicalRequirements: ['REQ_BLOOD_PURIFICATION', 'REQ_HEPATO_RENAL_DRAINAGE', 'REQ_DIURESIS'],
    representativeSymptoms: ['fluid retention', 'edema', 'ascites tendency', 'chronic uric acid elevation', 'portal-renal stasis']
  },
  {
    stateId: 'STATE_GENITOURINARY_MUCOSAL_DYSFUNCTION',
    stateName: 'Genitourinary Mucosal Dysfunction & Renal Irritation',
    stage: 'Functional',
    pathophysiologicalMechanism: 'Epithelial micro-inflammation, calculus formation, and pelvic lymphatic stasis across renal pelvis and bladder.',
    associatedOrganAxis: 'Kidney–Bladder–Genital',
    physiologicalRequirements: ['REQ_URINARY_REGULATION', 'REQ_LITHIC_DISSOLUTION', 'REQ_PELVIC_DRAINAGE'],
    representativeSymptoms: ['renal colic pain', 'kidney stone gravel', 'burning urination', 'dysuria', 'cystitis', 'leucorrhoea', 'prostatitis']
  },
  {
    stateId: 'STATE_INTESTINAL_EVACUATION_FAILURE',
    stateName: 'Intestinal Evacuation Failure & Sluggish Bowel',
    stage: 'Functional',
    pathophysiologicalMechanism: 'Atony of colonic glandular epithelium, dry mucosal lining, and sluggish peristalsis.',
    associatedOrganAxis: 'Intestinal Axis',
    physiologicalRequirements: ['REQ_BOWEL_ACTIVATION', 'REQ_LAXATION', 'REQ_PORTAL_DECONGESTION'],
    representativeSymptoms: ['chronic constipation', 'flatulence', 'abdominal fullness', 'infrequent stools', 'portal stagnation']
  },
  {
    stateId: 'STATE_FIBRO_OSSEOUS_DEGENERATION',
    stateName: 'Fibro-Osseous Degeneration & Cartilage Breakdown',
    stage: 'Structural',
    pathophysiologicalMechanism: 'Demineralization of bone tissue, joint cartilage erosion, and defective fibrous connective matrix synthesis.',
    associatedOrganAxis: 'Cartilage–Fibrous Tissue',
    physiologicalRequirements: ['REQ_BONE_REPAIR', 'REQ_CARTILAGE_RECONSTRUCTION', 'REQ_URIC_SEDIMENT_ELIMINATION'],
    representativeSymptoms: ['arthritis', 'joint pain', 'cartilage degeneration', 'rickets', 'bone injury repair', 'brittle nails', 'caries']
  },
  {
    stateId: 'STATE_ACUTE_BRONCHIAL_CONGESTION',
    stateName: 'Acute Bronchial Congestion & Viscous Airway Obstruction',
    stage: 'Acute Functional',
    pathophysiologicalMechanism: 'Bronchial smooth muscle hyperreactivity, hypersecretion of viscous mucus, and alveolar congestion.',
    associatedOrganAxis: 'Lungs–Bronchial Tree',
    physiologicalRequirements: ['REQ_EXPECTORATION', 'REQ_BRONCHODILATION', 'REQ_AIRWAY_VENTILATION'],
    representativeSymptoms: ['productive cough', 'viscous mucus phlegm', 'bronchitis', 'airway congestion', 'chest tightness']
  },
  {
    stateId: 'STATE_NEURO_SPASMODIC_RESPIRATORY',
    stateName: 'Neuro-Spasmodic Respiratory Dysfunction',
    stage: 'Chronic Functional',
    pathophysiologicalMechanism: 'Laryngeal sensory hypersensitivity, hyperactive vagal cough reflex, and capillary instability.',
    associatedOrganAxis: 'Larynx–Pharynx–Pulmonary Capillaries',
    physiologicalRequirements: ['REQ_ANTISPASMODIC', 'REQ_LARYNGEAL_SEDATION', 'REQ_VASCULAR_CAPILLARY_TONE'],
    representativeSymptoms: ['spasmodic cough', 'whooping cough', 'laryngeal irritation', 'convulsive asthma', 'nocturnal dry cough']
  },
  {
    stateId: 'STATE_VENOUS_CONGESTION_HEAT',
    stateName: 'Venous Congestion & Inflammatory Heat',
    stage: 'Functional',
    pathophysiologicalMechanism: 'Venous wall dilatation, valve incompetence, pelvic/portal stasis, and local inflammatory hyperthermia.',
    associatedOrganAxis: 'Venous–Lymphatic Axis',
    physiologicalRequirements: ['REQ_VENOUS_COOLING', 'REQ_VENOUS_TONE', 'REQ_ANTI_INFLAMMATORY_SEDATION'],
    representativeSymptoms: ['varicose veins', 'hemorrhoids', 'venous stasis', 'phlebitis', 'splenic congestion', 'throbbing venous heat']
  },
  {
    stateId: 'STATE_VITAL_ENERGY_DEFICIENCY',
    stateName: 'Vital Energy Deficiency & Arterial Sluggishness',
    stage: 'Recovery',
    pathophysiologicalMechanism: 'Depressed bioelectric cellular potential, arterial ischemia, neuromuscular fatigue, and convalescent debility.',
    associatedOrganAxis: 'CNS–Arterial Circulation',
    physiologicalRequirements: ['REQ_ARTERIAL_VITALIZATION', 'REQ_NEURO_MUSCULAR_TONE'],
    representativeSymptoms: ['vital exhaustion', 'chronic fatigue', 'arterial sluggishness', 'paralytic weakness', 'muscular debility']
  },
  {
    stateId: 'STATE_CEREBROSPINAL_DYSREGULATION',
    stateName: 'Cerebrospinal Dysregulation & Higher Nerve Exhaustion',
    stage: 'Recovery',
    pathophysiologicalMechanism: 'Higher nervous coordination failure, neurotransmitter exhaustion, and autonomic-endocrine dissociation.',
    associatedOrganAxis: 'Brain–Spinal Axis',
    physiologicalRequirements: ['REQ_CEREBROSPINAL_HARMONY', 'REQ_NEURO_ENDOCRINE_BALANCE'],
    representativeSymptoms: ['insomnia', 'mental exhaustion', 'nervous debility', 'migraine-like feelings', 'neurasthenia', 'poor coordination']
  }
];

export const PHYSIOLOGICAL_REQUIREMENTS: PhysiologicalRequirementEntry[] = [
  { requirementId: 'REQ_LYMPH_DRAINAGE', requirementName: 'Lymphatic Drainage & Interstitial Cleansing', category: 'Drainage', targetBiologicalProcess: 'Accelerates lymphatic fluid current and reduces glandular swelling', recommendedDilutionRange: 'D2–D3' },
  { requirementId: 'REQ_GLANDULAR_REGULATION', requirementName: 'Glandular Secretory Regulation', category: 'Harmonization', targetBiologicalProcess: 'Restores secretory balance in endocrine and exocrine glands', recommendedDilutionRange: 'D3' },
  { requirementId: 'REQ_CUTANEOUS_PURIFICATION', requirementName: 'Cutaneous & Epidermal Purification', category: 'Cleansing', targetBiologicalProcess: 'Eliminates cellular toxins from dermatoid and subcutaneous layers', recommendedDilutionRange: 'D1–D2 internal + external A.P.P.' },
  { requirementId: 'REQ_DIGESTIVE_REGULATION', requirementName: 'Gastrointestinal Secretory Stimulation', category: 'Harmonization', targetBiologicalProcess: 'Promotes digestive enzymes and mucosal regeneration', recommendedDilutionRange: 'D1–D2 before meals' },
  { requirementId: 'REQ_BILE_STIMULATION', requirementName: 'Biliary Secretion & Flow Stimulation', category: 'Drainage', targetBiologicalProcess: 'Stimulates bile synthesis and prevents gall stasis', recommendedDilutionRange: 'D2–D3' },
  { requirementId: 'REQ_MUCOSAL_CORRECTION', requirementName: 'Mucous Membrane Trophism', category: 'Reconstruction', targetBiologicalProcess: 'Resolves chronic mucous catarrh and restores epithelial barrier', recommendedDilutionRange: 'D2–D3' },
  { requirementId: 'REQ_HEPATIC_DETOX', requirementName: 'Hepatic Parenchymal Detoxification', category: 'Cleansing', targetBiologicalProcess: 'Protects hepatocytes and enhances toxin clearance', recommendedDilutionRange: 'D2–D3' },
  { requirementId: 'REQ_BLOOD_PURIFICATION', requirementName: 'Humoral & Blood Depuration', category: 'Cleansing', targetBiologicalProcess: 'Clears metabolic waste products from circulatory blood pool', recommendedDilutionRange: 'D3' },
  { requirementId: 'REQ_HEPATO_RENAL_DRAINAGE', requirementName: 'Combined Hepato-Renal Drainage', category: 'Drainage', targetBiologicalProcess: 'Coordinates liver and kidney elimination channels', recommendedDilutionRange: 'D3' },
  { requirementId: 'REQ_DIURESIS', requirementName: 'Renal Epithelial Diuresis', category: 'Drainage', targetBiologicalProcess: 'Increases glomerular filtration and urinary excretion', recommendedDilutionRange: 'D1–D2' },
  { requirementId: 'REQ_URINARY_REGULATION', requirementName: 'Urinary Tract Mucosal Toning', category: 'Harmonization', targetBiologicalProcess: 'Soothes inflamed urothelium and tones bladder muscle', recommendedDilutionRange: 'D2–D3' },
  { requirementId: 'REQ_LITHIC_DISSOLUTION', requirementName: 'Lithic Gravel Dispersion', category: 'Cleansing', targetBiologicalProcess: 'Softens crystalline calculus deposits in renal calyces and bladder', recommendedDilutionRange: 'D1–D2 in warm water' },
  { requirementId: 'REQ_PELVIC_DRAINAGE', requirementName: 'Pelvic Venous & Lymphatic Decongestion', category: 'Decongestion', targetBiologicalProcess: 'Reduces pelvic congestion and relieves perineal fullness', recommendedDilutionRange: 'D2–D3' },
  { requirementId: 'REQ_BOWEL_ACTIVATION', requirementName: 'Peristaltic & Glandular Bowel Activation', category: 'Drainage', targetBiologicalProcess: 'Restores tone to intestinal mucous membranes and stimulates stool evacuation', recommendedDilutionRange: 'D1–D2 at bedtime' },
  { requirementId: 'REQ_BONE_REPAIR', requirementName: 'Osseous Re-mineralization & Bone Healing', category: 'Reconstruction', targetBiologicalProcess: 'Promotes osteogenesis, callus formation, and structural bone density', recommendedDilutionRange: 'D2–D3' },
  { requirementId: 'REQ_CARTILAGE_RECONSTRUCTION', requirementName: 'Chondral Matrix Regeneration', category: 'Reconstruction', targetBiologicalProcess: 'Aids joint cartilage regeneration and relieves osteoarthritic inflammation', recommendedDilutionRange: 'D2–D4' },
  { requirementId: 'REQ_EXPECTORATION', requirementName: 'Mucolytic Bronchial Expectoration', category: 'Drainage', targetBiologicalProcess: 'Liquefies viscous pulmonary secretions and clears air cells', recommendedDilutionRange: 'D1–D2 warm sips' },
  { requirementId: 'REQ_BRONCHODILATION', requirementName: 'Bronchial Smooth Muscle Relaxation', category: 'Harmonization', targetBiologicalProcess: 'Alleviates airway spasm and improves thoracic ventilation', recommendedDilutionRange: 'D2–D3' },
  { requirementId: 'REQ_ANTISPASMODIC', requirementName: 'Neuro-Respiratory Antispasmodic Regulation', category: 'Sedation', targetBiologicalProcess: 'Calms hyperactive laryngeal cough reflex and settles convulsive paroxysms', recommendedDilutionRange: 'D3' },
  { requirementId: 'REQ_VENOUS_COOLING', requirementName: 'Venous Depolarization & Heat Cooling', category: 'Decongestion', targetBiologicalProcess: 'Reduces passive venous engorgement, phlebitis, and throbbing pain', recommendedDilutionRange: 'D2–D3 internal + cold compress' },
  { requirementId: 'REQ_ARTERIAL_VITALIZATION', requirementName: 'Arterial Microcirculatory Vitalization', category: 'Vitalization', targetBiologicalProcess: 'Enhances arterial depolarizing current, oxygen delivery, and vitality', recommendedDilutionRange: 'D1–D2 drops' },
  { requirementId: 'REQ_CEREBROSPINAL_HARMONY', requirementName: 'Cerebrospinal Coordination Restorative', category: 'Harmonization', targetBiologicalProcess: 'Harmonizes central reflexes, calms mental fatigue, and restores sleep architecture', recommendedDilutionRange: 'D3' }
];
