import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Phone, KeyRound, ArrowRight, CheckCircle2, User as UserIcon, ShieldCheck, Loader2 } from 'lucide-react';

interface LoginModalProps {
  onSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('practitioner');
  const [preferredLang, setPreferredLang] = useState('en');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [tempUser, setTempUser] = useState<User | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = mobileNumber.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(clean);
      if (res.success) {
        setStep('otp');
        setCooldown(res.cooldownSeconds || 5);
        if (res.devOtp) setDevOtp(res.devOtp);
      } else {
        setError(res.message);
        if (res.cooldownSeconds) setCooldown(res.cooldownSeconds);
      }
    } catch (err: any) {
      setError('Unable to reach server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP received via SMS.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp(mobileNumber, otp);
      if (res.success && res.user) {
        if (res.isNewUser || !res.user.fullName) {
          setTempUser(res.user);
          setStep('profile');
        } else {
          onSuccess(res.user);
        }
      } else {
        setError(res.message || 'Invalid OTP code.');
      }
    } catch (err: any) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.updateProfile({
        fullName: fullName.trim(),
        userType,
        preferredLang
      });
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.message || 'Could not update profile.');
      }
    } catch (err: any) {
      setError('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '460px',
      margin: '60px auto',
      padding: '36px',
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)',
      border: '1px solid #E2E8F0',
      textAlign: 'left'
    }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 16px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #0F4C81 0%, #00A896 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 8px 16px rgba(15, 76, 129, 0.2)'
        }}>
          {step === 'phone' && <Phone size={28} />}
          {step === 'otp' && <KeyRound size={28} />}
          {step === 'profile' && <UserIcon size={28} />}
        </div>
        
        <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
          {step === 'phone' && 'Welcome to Electropathy AI'}
          {step === 'otp' && 'Enter Verification Code'}
          {step === 'profile' && 'Complete Doctor Profile'}
        </h2>
        
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          {step === 'phone' && 'Access the clinical knowledge portal with your mobile number.'}
          {step === 'otp' && `We sent a 6-digit OTP via BlackSMS to +91 ${mobileNumber}`}
          {step === 'profile' && 'Set up your credentials for patient case intake.'}
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Phone Number Input */}
      {step === 'phone' && (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="input-label">Mobile Number</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 14px',
                backgroundColor: '#F1F5F9',
                border: '1.5px solid #CBD5E1',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#334155'
              }}>
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                className="input-field"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                autoFocus
                required
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', display: 'block' }}>
              Standard OTP will be dispatched to your phone
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading || mobileNumber.length !== 10}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: OTP Verification */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {devOtp && (
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1px dashed #3B82F6',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#1E40AF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Generated Code: <strong>{devOtp}</strong></span>
              <button
                type="button"
                onClick={() => setOtp(devOtp)}
                style={{
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Auto-Fill
              </button>
            </div>
          )}

          <div>
            <label className="input-label">6-Digit OTP</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 740461"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              style={{
                letterSpacing: '8px',
                textAlign: 'center',
                fontSize: '1.4rem',
                fontWeight: 700
              }}
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading || otp.length !== 6}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Verify & Login</span>
                <CheckCircle2 size={18} />
              </>
            )}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); }}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              ← Change Mobile Number
            </button>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={cooldown > 0 || loading}
              style={{
                background: 'none',
                border: 'none',
                color: cooldown > 0 ? '#94A3B8' : '#0F4C81',
                fontWeight: 600,
                cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Complete Profile */}
      {step === 'profile' && (
        <form onSubmit={handleCompleteProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="input-label">Your Full Name / Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Dr. Ashish Wandhare"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="input-label">User Category</label>
            <select
              className="input-field"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="practitioner">Electropathy Practitioner / Doctor</option>
              <option value="student">Medical Student</option>
              <option value="researcher">Clinical Researcher</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          <div>
            <label className="input-label">Preferred Language</label>
            <select
              className="input-field"
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading || !fullName.trim()}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Enter Medical Portal</span>
                <ShieldCheck size={18} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
