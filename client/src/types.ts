export type UserType = 'patient' | 'practitioner' | 'student' | 'researcher';
export type UserRole = 'patient' | 'practitioner' | 'admin';
export type PreferredLang = 'en' | 'hi' | 'mr';

export interface User {
  id: string;
  mobileNumber: string;
  fullName?: string;
  email?: string;
  userType?: UserType;
  preferredLang: PreferredLang;
  role: UserRole;
  isActive?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  isNewUser?: boolean;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  user?: User;
}

export interface PatientCase {
  id: string;
  practitionerId: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contactNumber: string;
  city: string;
  occupation?: string;
  chiefComplaints: {
    complaint: string;
    duration: string;
    severity: number;
    factors?: string;
  }[];
  presentIllness: {
    description: string;
    previousTreatments?: string;
    responseToTreatment?: string;
  };
  pastMedical: {
    chronicConditions: string[];
    surgeries?: string;
    allergies: string[];
  };
  lifestyle: {
    diet: string;
    sleep: string;
    appetite: string;
    stressLevel: string;
  };
  electropathyDetails?: {
    temperament?: string;
    previousElectropathy?: string;
    notes?: string;
  };
  status: 'draft' | 'submitted' | 'in_review' | 'completed';
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  feedback?: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  language: string;
  messageCount: number;
  lastMessage?: { content: string; role: string; createdAt: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail {
  id: string;
  userId: string;
  title: string;
  language: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface AdminOverview {
  users: {
    total: number;
    active: number;
    inactive: number;
    newLast7Days: number;
  };
  conversations: {
    totalConversations: number;
    totalMessages: number;
  };
  patientCases: {
    total: number;
    byStatus: Record<string, number>;
  };
  knowledgeBase: {
    totalDocuments: number;
    totalChunks: number;
  };
  recentActivities?: AuditLogItem[];
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  action: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
  admin?: { id: string; fullName: string; email: string; mobileNumber: string };
}

// ---------------------------------------------
// Patient Profiling & Medical History Management
// ---------------------------------------------

export interface PatientProfileSummary {
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
  profileStatus: 'active' | 'needs_review' | 'verified';
  completenessScore: number;
  primarySymptoms: string;
  totalConversations: number;
  lastInteractionAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientSymptomItem {
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
  recordedAt: string;
  updatedAt: string;
}

export interface PatientMedicalHistoryItem {
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
  recordedAt: string;
  updatedAt: string;
}

export interface PatientMedicationItem {
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
  recordedAt: string;
  updatedAt: string;
}

export interface PatientAllergyItem {
  id: string;
  patientId: string;
  allergen: string;
  reaction?: string | null;
  severity?: string | null;
  sourceConversationId?: string | null;
  sourceMessageId?: string | null;
  originalStatement?: string | null;
  verificationStatus: string;
  recordedAt: string;
  updatedAt: string;
}

export interface PatientLifestyleItem {
  id: string;
  patientId: string;
  diet?: string | null;
  sleep?: string | null;
  physicalActivity?: string | null;
  substanceUse?: string | null;
  stressFactors?: string | null;
  sourceConversationId?: string | null;
  recordedAt: string;
  updatedAt: string;
}

export interface PatientObservationItem {
  id: string;
  patientId: string;
  category: string;
  extractedInformation: any;
  originalStatement: string;
  language: string;
  sourceConversationId: string;
  sourceMessageId?: string | null;
  confidence: number;
  verificationStatus: 'ai_extracted' | 'patient_confirmed' | 'practitioner_verified' | 'needs_review' | 'corrected';
  verificationNote?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientTimelineEventItem {
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
  createdAt: string;
}

export interface PatientProfileDetail {
  profile: PatientProfileSummary;
  symptoms: PatientSymptomItem[];
  medications: PatientMedicationItem[];
  medicalHistory: PatientMedicalHistoryItem[];
  allergies: PatientAllergyItem[];
  lifestyle: PatientLifestyleItem | null;
  observations: PatientObservationItem[];
  timeline: PatientTimelineEventItem[];
  conversations?: ConversationSummary[];
}
