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
