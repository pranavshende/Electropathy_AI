import { AuthResponse, User, PatientCase } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('electropathy_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- Auth & Login ---

  async sendOtp(mobileNumber: string): Promise<{ success: boolean; message: string; cooldownSeconds?: number; devOtp?: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber }),
    });
    return res.json();
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, otp }),
    });
    const data: AuthResponse = await res.json();
    if (data.success && data.tokens?.accessToken) {
      localStorage.setItem('electropathy_token', data.tokens.accessToken);
    }
    return data;
  }

  async updateProfile(profileData: {
    fullName: string;
    email?: string;
    userType: string;
    preferredLang: string;
  }): Promise<{ success: boolean; user: User; message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  }

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  logout(): void {
    localStorage.removeItem('electropathy_token');
  }

  // --- Patient Intake & History ---

  async createPatientCase(data: Partial<PatientCase>): Promise<{ success: boolean; case: PatientCase; message: string }> {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async getPatientCases(): Promise<{ success: boolean; cases: PatientCase[]; count: number }> {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return res.json();
  }
}

export const api = new ApiService();
