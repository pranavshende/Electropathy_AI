// ============================================================================
// v2026 Electropathy AI Engine — Stage 3: Patient Assessment Engine & Safety Gate
// ============================================================================

export interface ChiefComplaintInput {
  complaint: string;
  duration?: string;
  severity?: number; // 1 to 10 scale
  aggravatingFactors?: string;
  relievingFactors?: string;
}

export interface LabMarkerRecord {
  testName: string;
  observedValue: number | string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'Low' | 'High' | 'Critical';
  extractionConfidence: number; // 0.0 to 1.0
  sourceDocument?: string;
}

export interface PatientAssessmentInput {
  patientId?: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contactNumber: string;
  chiefComplaints: ChiefComplaintInput[];
  presentIllnessDescription?: string;
  chronicConditions?: string[];
  pastSurgeries?: string[];
  knownAllergies?: string[];
  lifestyle?: {
    diet?: string;
    appetite?: string;
    sleepHours?: number;
    stressLevel?: string;
    bowelHabit?: string;
  };
  temperament?: 'Lymphatic' | 'Sanguine' | 'Bilious' | 'Nervous' | 'Mixed';
  laboratoryReports?: LabMarkerRecord[];
}

export interface SafetyGateAlert {
  severity: 'CRITICAL_EMERGENCY' | 'HIGH_PRECAUTION' | 'MODERATE_WARNING';
  category: string;
  triggerPhrase: string;
  clinicalAction: string;
  requiresHospitalReferral: boolean;
}

export interface StructuredPatientAssessment {
  assessmentId: string;
  timestamp: string;
  demographics: {
    fullName: string;
    age: number;
    gender: string;
    contactNumber: string;
    temperament: string;
  };
  clinicalFindings: {
    normalizedComplaints: ChiefComplaintInput[];
    symptomSeverityScore: number; // average severity
    chronicityStage: 'Acute' | 'Subacute' | 'Chronic' | 'Degenerative';
    chronicComorbidities: string[];
    allergyAlerts: string[];
  };
  laboratoryBiomarkers: {
    abnormalMarkers: LabMarkerRecord[];
    normalMarkers: LabMarkerRecord[];
    criticalOrganFlags: string[];
  };
  safetyGate: {
    passed: boolean;
    highestAlertLevel: 'CLEAR' | 'MODERATE_WARNING' | 'HIGH_PRECAUTION' | 'CRITICAL_EMERGENCY';
    alerts: SafetyGateAlert[];
    emergencyReferralText?: string;
  };
}

class Stage3PatientAssessmentService {
  private emergencyRedFlags = [
    {
      category: 'Cardiac / Acute Coronary',
      regex: /\b(crushing chest pain|chest pressure|chest pain radiating|left arm pain|diaphoresis|heart attack)\b/i,
      action: 'Immediate Emergency Cardiology Referral (Call 108/112). Rule out Acute Myocardial Infarction.',
      requiresReferral: true
    },
    {
      category: 'Neurological / Stroke',
      regex: /\b(sudden facial droop|slurred speech|hemiparesis|one side weakness|sudden vision loss|thunderclap headache)\b/i,
      action: 'Immediate Emergency Neurology Triage. Suspected Acute Stroke / Intracranial Hemorrhage.',
      requiresReferral: true
    },
    {
      category: 'Respiratory / Acute Distress',
      regex: /\b(severe breathlessness|gasping for air|stridor|choking|lips turning blue|cyanosis|spo2 below 88)\b/i,
      action: 'Immediate Emergency Oxygenation & Airway Management. Suspected Acute Respiratory Failure / Laryngeal Edema.',
      requiresReferral: true
    },
    {
      category: 'Severe Anaphylaxis',
      regex: /\b(anaphylaxis|swollen tongue|throat closing up|generalized hives with fainting|severe drug reaction)\b/i,
      action: 'Immediate Intramuscular Epinephrine & Critical Care Emergency Transport.',
      requiresReferral: true
    },
    {
      category: 'Massive Hemorrhage / Shock',
      regex: /\b(vomiting blood|coughing blood|hematemesis|massive rectal bleeding|black tarry stool with fainting)\b/i,
      action: 'Immediate Emergency Resuscitation & GI Endoscopy Evaluation. Rule out Hemorrhagic Shock.',
      requiresReferral: true
    },
    {
      category: 'Acute Surgical Abdomen',
      regex: /\b(rigid abdomen|board like abdomen|severe rebound tenderness|sudden peritonitis|projectile bile vomiting)\b/i,
      action: 'Immediate Emergency General Surgery Consultation. Suspected Acute Peritonitis / Bowel Perforation.',
      requiresReferral: true
    },
    {
      category: 'Acute Renal Shutdown',
      regex: /\b(complete stop of urine|no urine for 24 hours|anuria with delirium|severe uremic drowsiness)\b/i,
      action: 'Immediate Emergency Nephrology Evaluation. Suspected Acute Renal Failure.',
      requiresReferral: true
    }
  ];

  /**
   * Executes multi-dimensional patient assessment, lab biomarker extraction,
   * and clinical safety screening.
   */
  assessPatient(input: PatientAssessmentInput): StructuredPatientAssessment {
    const assessmentId = `ASSESS-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. Clinical Safety Gate Evaluation
    const safetyAlerts: SafetyGateAlert[] = [];
    const fullNarrative = [
      input.presentIllnessDescription || '',
      ...input.chiefComplaints.map(c => c.complaint),
      ...(input.chronicConditions || []),
      ...(input.knownAllergies || [])
    ].join(' ');

    for (const flag of this.emergencyRedFlags) {
      const match = fullNarrative.match(flag.regex);
      if (match) {
        safetyAlerts.push({
          severity: 'CRITICAL_EMERGENCY',
          category: flag.category,
          triggerPhrase: match[0],
          clinicalAction: flag.action,
          requiresHospitalReferral: flag.requiresReferral
        });
      }
    }

    // Check allergies vs complaints
    if (input.knownAllergies && input.knownAllergies.length > 0) {
      safetyAlerts.push({
        severity: 'MODERATE_WARNING',
        category: 'Allergy Precaution',
        triggerPhrase: input.knownAllergies.join(', '),
        clinicalAction: `Verify remedies against known allergies: ${input.knownAllergies.join(', ')}`,
        requiresHospitalReferral: false
      });
    }

    const hasCritical = safetyAlerts.some(a => a.severity === 'CRITICAL_EMERGENCY');
    const highestLevel = hasCritical
      ? 'CRITICAL_EMERGENCY'
      : (safetyAlerts.length > 0 ? 'MODERATE_WARNING' : 'CLEAR');

    // 2. Parse & Standardize Laboratory Biomarkers
    const abnormalMarkers: LabMarkerRecord[] = [];
    const normalMarkers: LabMarkerRecord[] = [];
    const criticalOrganFlags = new Set<string>();

    for (const marker of (input.laboratoryReports || [])) {
      if (marker.status === 'High' || marker.status === 'Critical') {
        abnormalMarkers.push(marker);
        const name = marker.testName.toLowerCase();
        if (name.includes('creatinine') || name.includes('urea') || name.includes('uric acid')) {
          criticalOrganFlags.add('Kidneys / Renal Axis');
        }
        if (name.includes('bilirubin') || name.includes('sgpt') || name.includes('sgot') || name.includes('alkaline phosphatase')) {
          criticalOrganFlags.add('Liver / Hepato-Biliary Axis');
        }
        if (name.includes('sugar') || name.includes('hba1c')) {
          criticalOrganFlags.add('Pancreas / Metabolic Axis');
        }
      } else {
        normalMarkers.push(marker);
      }
    }

    // 3. Chronicity and Severity Computation
    const totalSeverity = input.chiefComplaints.reduce((acc, curr) => acc + (curr.severity || 5), 0);
    const avgSeverity = input.chiefComplaints.length > 0
      ? Math.round((totalSeverity / input.chiefComplaints.length) * 10) / 10
      : 5.0;

    let chronicityStage: 'Acute' | 'Subacute' | 'Chronic' | 'Degenerative' = 'Acute';
    const durationText = input.chiefComplaints.map(c => (c.duration || '').toLowerCase()).join(' ');
    if (durationText.includes('year') || durationText.includes('yr') || (input.chronicConditions && input.chronicConditions.length >= 2)) {
      chronicityStage = 'Chronic';
    } else if (durationText.includes('month') || durationText.includes('mo')) {
      chronicityStage = 'Subacute';
    }

    return {
      assessmentId,
      timestamp,
      demographics: {
        fullName: input.fullName,
        age: input.age,
        gender: input.gender,
        contactNumber: input.contactNumber,
        temperament: input.temperament || 'Lymphatic'
      },
      clinicalFindings: {
        normalizedComplaints: input.chiefComplaints,
        symptomSeverityScore: avgSeverity,
        chronicityStage,
        chronicComorbidities: input.chronicConditions || [],
        allergyAlerts: input.knownAllergies || []
      },
      laboratoryBiomarkers: {
        abnormalMarkers,
        normalMarkers,
        criticalOrganFlags: Array.from(criticalOrganFlags)
      },
      safetyGate: {
        passed: !hasCritical,
        highestAlertLevel: highestLevel,
        alerts: safetyAlerts,
        emergencyReferralText: hasCritical
          ? '🚨 CRITICAL MEDICAL SAFETY ALERT: Patient presents with acute red-flag symptoms requiring immediate emergency hospital evaluation. Electropathy remedies must not replace emergency resuscitation.'
          : undefined
      }
    };
  }
}

export const stage3PatientAssessmentService = new Stage3PatientAssessmentService();
