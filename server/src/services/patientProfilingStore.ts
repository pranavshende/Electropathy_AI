/**
 * Resilient In-Memory Patient Profiling & History Store
 * Provides high-availability storage for patient profiles, extracted medical facts,
 * medications, symptoms, allergies, lifestyle data, observations, and chronological timeline events.
 */

export interface StoredPatientProfile {
  id: string;
  userId?: string | null;
  fullName: string;
  dateOfBirth?: string | null;
  age?: number | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  consentStatus: string;
  profileStatus: string; // 'active', 'needs_review', 'verified'
  completenessScore: number;
  primarySymptoms: string;
  totalConversations: number;
  lastInteractionAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredSymptom {
  id: string;
  patientId: string;
  symptom: string;
  description?: string | null;
  severity?: string | null;
  duration?: string | null;
  onsetDate?: string | null;
  currentStatus: 'active' | 'improving' | 'resolved' | 'worsened' | 'recurred';
  originalLanguage?: string | null;
  originalStatement?: string | null;
  sourceConversationId?: string | null;
  sourceMessageId?: string | null;
  verificationStatus: 'ai_extracted' | 'patient_confirmed' | 'practitioner_verified' | 'needs_review' | 'corrected';
  extractionConfidence: number;
  recordedAt: Date;
  updatedAt: Date;
}

export interface StoredMedicalHistory {
  id: string;
  patientId: string;
  condition: string;
  description?: string | null;
  status: 'current' | 'historical' | 'family_history' | 'resolved';
  onsetDate?: string | null;
  sourceConversationId?: string | null;
  sourceMessageId?: string | null;
  originalStatement?: string | null;
  verificationStatus: 'ai_extracted' | 'patient_confirmed' | 'practitioner_verified' | 'needs_review' | 'corrected';
  extractionConfidence: number;
  recordedAt: Date;
  updatedAt: Date;
}

export interface StoredMedication {
  id: string;
  patientId: string;
  medicationName: string;
  condition?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  medicationStatus: 'current' | 'previous' | 'stopped' | 'adverse_reaction';
  sideEffects?: string | null;
  treatmentOutcome?: string | null;
  sourceConversationId?: string | null;
  sourceMessageId?: string | null;
  originalStatement?: string | null;
  verificationStatus: 'ai_extracted' | 'patient_confirmed' | 'practitioner_verified' | 'needs_review' | 'corrected';
  recordedAt: Date;
  updatedAt: Date;
}

export interface StoredAllergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction?: string | null;
  severity?: string | null;
  sourceConversationId?: string | null;
  sourceMessageId?: string | null;
  originalStatement?: string | null;
  verificationStatus: string;
  recordedAt: Date;
  updatedAt: Date;
}

export interface StoredLifestyle {
  id: string;
  patientId: string;
  diet?: string | null;
  sleep?: string | null;
  physicalActivity?: string | null;
  substanceUse?: string | null;
  stressFactors?: string | null;
  sourceConversationId?: string | null;
  recordedAt: Date;
  updatedAt: Date;
}

export interface StoredObservation {
  id: string;
  patientId: string;
  category: string; // 'personal', 'symptom', 'medication', 'history', 'lifestyle', 'inquiry'
  extractedInformation: any;
  originalStatement: string;
  language: string;
  sourceConversationId: string;
  sourceMessageId?: string | null;
  confidence: number;
  verificationStatus: 'ai_extracted' | 'patient_confirmed' | 'practitioner_verified' | 'needs_review' | 'corrected';
  verificationNote?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredTimelineEvent {
  id: string;
  patientId: string;
  eventType: string;
  title: string;
  description: string;
  fieldName?: string | null;
  previousValue?: any;
  updatedValue?: any;
  sourceConversationId?: string | null;
  sourceMessageId?: string | null;
  createdAt: Date;
}

class PatientProfilingStore {
  private profiles: Map<string, StoredPatientProfile> = new Map();
  private symptoms: StoredSymptom[] = [];
  private medicalHistories: StoredMedicalHistory[] = [];
  private medications: StoredMedication[] = [];
  private allergies: StoredAllergy[] = [];
  private lifestyles: Map<string, StoredLifestyle> = new Map();
  private observations: StoredObservation[] = [];
  private timelineEvents: StoredTimelineEvent[] = [];

  constructor() {
    this.seedDemoData();
  }

  // --- Seed Demo Data for Practitioner Experience ---
  private seedDemoData() {
    const p1Id = 'pat-rahul-001';
    this.profiles.set(p1Id, {
      id: p1Id,
      userId: 'usr-rahul-demo',
      fullName: 'Rahul Sharma',
      dateOfBirth: '1999-05-14',
      age: 25,
      gender: 'male',
      phone: '+919822012345',
      email: 'rahul.sharma@example.com',
      location: 'Pune, Maharashtra',
      consentStatus: 'consented',
      profileStatus: 'active',
      completenessScore: 85,
      primarySymptoms: 'Throbbing Headache, Frontal Pressure, Nausea',
      totalConversations: 3,
      lastInteractionAt: new Date(Date.now() - 1000 * 60 * 30),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    });

    this.symptoms.push(
      {
        id: 'sym-001',
        patientId: p1Id,
        symptom: 'Bilateral Throbbing Headache',
        description: 'Persistent headache aggravated by sunlight and screen exposure',
        severity: 'moderate',
        duration: '2 weeks',
        onsetDate: '14 days ago',
        currentStatus: 'improving',
        originalLanguage: 'en',
        originalStatement: 'I have been experiencing severe headaches for the last two weeks.',
        sourceConversationId: 'conv-rahul-1',
        sourceMessageId: 'msg-r1-1',
        verificationStatus: 'practitioner_verified',
        extractionConfidence: 0.95,
        recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
      },
      {
        id: 'sym-002',
        patientId: p1Id,
        symptom: 'Occasional Nausea',
        description: 'Mild morning nausea without active emesis',
        severity: 'mild',
        duration: '3 days',
        onsetDate: '3 days ago',
        currentStatus: 'active',
        originalLanguage: 'en',
        originalStatement: 'Also feeling a bit of nausea in the mornings.',
        sourceConversationId: 'conv-rahul-2',
        sourceMessageId: 'msg-r2-2',
        verificationStatus: 'ai_extracted',
        extractionConfidence: 0.88,
        recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
      }
    );

    this.medications.push(
      {
        id: 'med-001',
        patientId: p1Id,
        medicationName: 'Naproxen 250mg',
        condition: 'Migraine / Tension Headache',
        dosage: '250mg',
        frequency: 'As needed',
        duration: '1 month',
        medicationStatus: 'stopped',
        sideEffects: 'Mild gastric acidity',
        treatmentOutcome: 'Temporary relief only',
        sourceConversationId: 'conv-rahul-1',
        sourceMessageId: 'msg-r1-2',
        originalStatement: 'I previously took naproxen for migraines but stopped last week due to stomach burn.',
        verificationStatus: 'practitioner_verified',
        recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
      },
      {
        id: 'med-002',
        patientId: p1Id,
        medicationName: 'Electropathy S1 (Scrofoloso-1) D6',
        condition: 'Lymphatic Drainage & Headache',
        dosage: '5 drops',
        frequency: '3 times daily in water',
        duration: '1 week',
        medicationStatus: 'current',
        sideEffects: 'None reported',
        treatmentOutcome: 'Headache intensity reduced by 50%',
        sourceConversationId: 'conv-rahul-3',
        sourceMessageId: 'msg-r3-1',
        originalStatement: 'Currently taking S1 D6 as advised.',
        verificationStatus: 'practitioner_verified',
        recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30)
      }
    );

    this.medicalHistories.push({
      id: 'hist-001',
      patientId: p1Id,
      condition: 'Recurrent Episodic Migraine',
      description: 'Patient reports historical diagnosis of migraine without aura',
      status: 'historical',
      onsetDate: '2 years ago',
      sourceConversationId: 'conv-rahul-1',
      originalStatement: 'I have a history of migraines during exam periods.',
      verificationStatus: 'practitioner_verified',
      extractionConfidence: 0.92,
      recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
    });

    this.allergies.push({
      id: 'alg-001',
      patientId: p1Id,
      allergen: 'Sulfa Drugs / Sulfonamides',
      reaction: 'Skin rash and pruritus',
      severity: 'moderate',
      sourceConversationId: 'conv-rahul-1',
      originalStatement: 'I am allergic to sulfa antibiotics.',
      verificationStatus: 'patient_confirmed',
      recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
    });

    this.lifestyles.set(p1Id, {
      id: 'life-001',
      patientId: p1Id,
      diet: 'Vegetarian, irregular meal timings',
      sleep: '6 hours / night, interrupted',
      physicalActivity: 'Sedentary desk work (Software Engineer)',
      substanceUse: 'Occasional tea/coffee (3 cups/day), non-smoker',
      stressFactors: 'Work deadlines and screen fatigue',
      sourceConversationId: 'conv-rahul-1',
      recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
    });

    this.timelineEvents.push(
      {
        id: 'time-001',
        patientId: p1Id,
        eventType: 'PROFILE_CREATED',
        title: 'Initial Consultation Profile Created',
        description: 'Patient initiated consultation via Electropathy AI chatbot.',
        sourceConversationId: 'conv-rahul-1',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
      },
      {
        id: 'time-002',
        patientId: p1Id,
        eventType: 'SYMPTOM_REPORTED',
        title: 'Headache Reported (2 Weeks Duration)',
        description: 'Reported bilateral throbbing headache aggravated by screen exposure.',
        sourceConversationId: 'conv-rahul-1',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
      },
      {
        id: 'time-003',
        patientId: p1Id,
        eventType: 'MEDICATION_STOPPED',
        title: 'Stopped Naproxen 250mg',
        description: 'Patient discontinued NSAID due to stomach irritation.',
        sourceConversationId: 'conv-rahul-1',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
      },
      {
        id: 'time-004',
        patientId: p1Id,
        eventType: 'MEDICATION_STARTED',
        title: 'Started S1 (Scrofoloso-1) Dilution 6',
        description: 'Began taking 5 drops 3x/day for lymphatic and headache regulation.',
        sourceConversationId: 'conv-rahul-2',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
      },
      {
        id: 'time-005',
        patientId: p1Id,
        eventType: 'SYMPTOM_UPDATED',
        title: 'Headache Improving',
        description: 'Patient noted 50% improvement in headache intensity and duration.',
        sourceConversationId: 'conv-rahul-3',
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      }
    );

    // Seed Marathi Patient (Sunita Deshmukh)
    const p2Id = 'pat-sunita-002';
    this.profiles.set(p2Id, {
      id: p2Id,
      userId: 'usr-sunita-demo',
      fullName: 'Sunita Deshmukh',
      dateOfBirth: '1976-11-20',
      age: 48,
      gender: 'female',
      phone: '+919422998877',
      email: 'sunita.d@example.com',
      location: 'Nagpur, Maharashtra',
      consentStatus: 'consented',
      profileStatus: 'verified',
      completenessScore: 92,
      primarySymptoms: 'गुडघेदुखी (Knee Joint Pain), अपचन (Indigestion)',
      totalConversations: 2,
      lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    });

    this.symptoms.push({
      id: 'sym-003',
      patientId: p2Id,
      symptom: 'दोन्ही गुडघ्यांमध्ये तीव्र वेदना (Bilateral Knee Arthralgia)',
      description: 'सकाळी उठल्यावर सांधे कडक होणे व जिने चढताना वेदना वाढणे',
      severity: 'moderate',
      duration: '3 months',
      onsetDate: '3 months ago',
      currentStatus: 'active',
      originalLanguage: 'mr',
      originalStatement: 'गेल्या ३ महिन्यांपासून माझे दोन्ही गुडघे खूप दुखत आहेत.',
      sourceConversationId: 'conv-sunita-1',
      verificationStatus: 'practitioner_verified',
      extractionConfidence: 0.94,
      recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
    });

    this.timelineEvents.push({
      id: 'time-006',
      patientId: p2Id,
      eventType: 'PROFILE_CREATED',
      title: 'मराठी सल्लामसलत प्रोफाइल तयार झाले (Marathi Consultation Initialized)',
      description: 'रुग्णाने इलेक्ट्रोपॅथी सल्लामसलत सुरू केली.',
      sourceConversationId: 'conv-sunita-1',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
    });
  }

  // --- CRUD and Query Methods ---

  public getProfileByUserId(userId: string): StoredPatientProfile | undefined {
    for (const p of this.profiles.values()) {
      if (p.userId === userId) return p;
    }
    return undefined;
  }

  public getProfileById(id: string): StoredPatientProfile | undefined {
    return this.profiles.get(id);
  }

  public saveProfile(profile: StoredPatientProfile): StoredPatientProfile {
    profile.updatedAt = new Date();
    this.profiles.set(profile.id, profile);
    return profile;
  }

  public listProfiles(filters: {
    search?: string;
    status?: string;
    minAge?: number;
    maxAge?: number;
    symptom?: string;
    page?: number;
    limit?: number;
  }) {
    let list = Array.from(this.profiles.values());

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p => 
        p.fullName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.primarySymptoms && p.primarySymptoms.toLowerCase().includes(q))
      );
    }

    if (filters.status && filters.status !== 'all') {
      list = list.filter(p => p.profileStatus.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters.minAge !== undefined && !isNaN(filters.minAge)) {
      list = list.filter(p => p.age !== null && p.age !== undefined && p.age >= filters.minAge!);
    }

    if (filters.maxAge !== undefined && !isNaN(filters.maxAge)) {
      list = list.filter(p => p.age !== null && p.age !== undefined && p.age <= filters.maxAge!);
    }

    if (filters.symptom) {
      const sq = filters.symptom.toLowerCase().trim();
      list = list.filter(p => p.primarySymptoms && p.primarySymptoms.toLowerCase().includes(sq));
    }

    // Sort by recent interaction
    list.sort((a, b) => new Date(b.lastInteractionAt).getTime() - new Date(a.lastInteractionAt).getTime());

    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, filters.limit || 15);
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      total,
      page,
      limit,
      totalPages,
      patients: paginated
    };
  }

  public getFullPatientRecord(patientId: string) {
    const profile = this.profiles.get(patientId);
    if (!profile) return null;

    const patientSymptoms = this.symptoms.filter(s => s.patientId === patientId);
    const patientMedications = this.medications.filter(m => m.patientId === patientId);
    const patientHistories = this.medicalHistories.filter(h => h.patientId === patientId);
    const patientAllergies = this.allergies.filter(a => a.patientId === patientId);
    const patientLifestyle = this.lifestyles.get(patientId) || null;
    const patientObservations = this.observations.filter(o => o.patientId === patientId);
    const timeline = this.timelineEvents
      .filter(t => t.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      profile,
      symptoms: patientSymptoms,
      medications: patientMedications,
      medicalHistory: patientHistories,
      allergies: patientAllergies,
      lifestyle: patientLifestyle,
      observations: patientObservations,
      timeline
    };
  }

  public addSymptom(symptom: StoredSymptom): StoredSymptom {
    const existingIdx = this.symptoms.findIndex(
      s => s.patientId === symptom.patientId && s.symptom.toLowerCase() === symptom.symptom.toLowerCase()
    );
    if (existingIdx >= 0) {
      this.symptoms[existingIdx] = {
        ...this.symptoms[existingIdx],
        ...symptom,
        updatedAt: new Date()
      };
      return this.symptoms[existingIdx];
    }
    this.symptoms.push(symptom);
    return symptom;
  }

  public updateSymptomStatus(id: string, currentStatus: StoredSymptom['currentStatus']): StoredSymptom | undefined {
    const s = this.symptoms.find(item => item.id === id);
    if (s) {
      s.currentStatus = currentStatus;
      s.updatedAt = new Date();
    }
    return s;
  }

  public addMedication(med: StoredMedication): StoredMedication {
    const existingIdx = this.medications.findIndex(
      m => m.patientId === med.patientId && m.medicationName.toLowerCase() === med.medicationName.toLowerCase()
    );
    if (existingIdx >= 0) {
      this.medications[existingIdx] = {
        ...this.medications[existingIdx],
        ...med,
        updatedAt: new Date()
      };
      return this.medications[existingIdx];
    }
    this.medications.push(med);
    return med;
  }

  public updateMedicationStatus(id: string, status: StoredMedication['medicationStatus']): StoredMedication | undefined {
    const m = this.medications.find(item => item.id === id);
    if (m) {
      m.medicationStatus = status;
      m.updatedAt = new Date();
    }
    return m;
  }

  public addMedicalHistory(hist: StoredMedicalHistory): StoredMedicalHistory {
    const existingIdx = this.medicalHistories.findIndex(
      h => h.patientId === hist.patientId && h.condition.toLowerCase() === hist.condition.toLowerCase()
    );
    if (existingIdx >= 0) {
      this.medicalHistories[existingIdx] = {
        ...this.medicalHistories[existingIdx],
        ...hist,
        updatedAt: new Date()
      };
      return this.medicalHistories[existingIdx];
    }
    this.medicalHistories.push(hist);
    return hist;
  }

  public addAllergy(allergy: StoredAllergy): StoredAllergy {
    const existingIdx = this.allergies.findIndex(
      a => a.patientId === allergy.patientId && a.allergen.toLowerCase() === allergy.allergen.toLowerCase()
    );
    if (existingIdx >= 0) {
      this.allergies[existingIdx] = {
        ...this.allergies[existingIdx],
        ...allergy,
        updatedAt: new Date()
      };
      return this.allergies[existingIdx];
    }
    this.allergies.push(allergy);
    return allergy;
  }

  public setLifestyle(lifestyle: StoredLifestyle): StoredLifestyle {
    this.lifestyles.set(lifestyle.patientId, lifestyle);
    return lifestyle;
  }

  public addObservation(obs: StoredObservation): StoredObservation {
    this.observations.push(obs);
    return obs;
  }

  public updateObservationVerification(
    obsId: string,
    status: StoredObservation['verificationStatus'],
    note?: string,
    verifiedBy?: string
  ): StoredObservation | undefined {
    const obs = this.observations.find(o => o.id === obsId);
    if (obs) {
      obs.verificationStatus = status;
      if (note !== undefined) obs.verificationNote = note;
      if (verifiedBy) obs.verifiedBy = verifiedBy;
      obs.verifiedAt = new Date();
      obs.updatedAt = new Date();
    }
    return obs;
  }

  public addTimelineEvent(event: StoredTimelineEvent): StoredTimelineEvent {
    this.timelineEvents.unshift(event);
    return event;
  }
}

export const patientProfilingStore = new PatientProfilingStore();
