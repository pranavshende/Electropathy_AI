import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { 
  Phone, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  User as UserIcon, 
  ShieldCheck, 
  Loader2, 
  Eye, 
  EyeOff, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface LoginModalProps {
  onSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  // Mode: 'password_login' (default) | 'otp_register' | 'forgot_password'
  const [mode, setMode] = useState<'password_login' | 'otp_register' | 'forgot_password'>('password_login');
  
  // Registration / OTP sub-steps
  const [registerStep, setRegisterStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [forgotStep, setForgotStep] = useState<'phone' | 'reset'>('phone');

  // Form Fields
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('practitioner');
  const [preferredLang, setPreferredLang] = useState('en');
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Reset errors on mode change
  const switchMode = (newMode: 'password_login' | 'otp_register' | 'forgot_password') => {
    setMode(newMode);
    setError(null);
    setInfoMessage(null);
    setRegisterStep('phone');
    setForgotStep('phone');
    setOtp('');
  };

  // 1. Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = mobileNumber.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginWithPassword(clean, password);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError('Unable to reach server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Send OTP for Registration / Number Verification
  const handleSendOtpRegister = async (e: React.FormEvent) => {
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
        setRegisterStep('otp');
        setCooldown(res.cooldownSeconds || 10);
        if (res.devOtp) setDevOtp(res.devOtp);
      } else {
        setError(res.message);
        if (res.cooldownSeconds) setCooldown(res.cooldownSeconds);
      }
    } catch (err: any) {
      setError('Error dispatching OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP for Registration
  const handleVerifyOtpRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP received on your phone.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp(mobileNumber, otp);
      if (res.success && res.user) {
        setRegisterStep('profile');
      } else {
        setError(res.message || 'Invalid or expired OTP.');
      }
    } catch (err: any) {
      setError('Verification failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Complete Registration Profile & Set Password
  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Please create a password of at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.updateProfile({
        fullName: fullName.trim(),
        userType,
        preferredLang,
        password: password.trim()
      });
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.message || 'Could not complete registration.');
      }
    } catch (err: any) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Forgot Password: Send OTP
  const handleSendOtpForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = mobileNumber.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(clean);
      if (res.success) {
        setForgotStep('reset');
        setCooldown(res.cooldownSeconds || 10);
        if (res.devOtp) setDevOtp(res.devOtp);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError('Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(mobileNumber, otp, newPassword);
      if (res.success) {
        setInfoMessage('Password successfully updated! You can now log in.');
        setPassword(newPassword);
        setMode('password_login');
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '40px auto',
      padding: '36px',
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)',
      border: '1px solid #E2E8F0',
      textAlign: 'left'
    }}>
      {/* Top Banner Icon */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
          {mode === 'password_login' && <Lock size={28} />}
          {mode === 'otp_register' && (registerStep === 'profile' ? <UserIcon size={28} /> : <Phone size={28} />)}
          {mode === 'forgot_password' && <KeyRound size={28} />}
        </div>
        
        <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
          {mode === 'password_login' && 'Practitioner Sign In'}
          {mode === 'otp_register' && (
            registerStep === 'phone' ? 'Verify Mobile Number' :
            registerStep === 'otp' ? 'Enter SMS Verification Code' :
            'Setup Doctor Profile & Password'
          )}
          {mode === 'forgot_password' && 'Reset Account Password'}
        </h2>
        
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          {mode === 'password_login' && 'Sign in with your mobile number and password.'}
          {mode === 'otp_register' && registerStep === 'phone' && 'OTP verification is required only once to verify your phone.'}
          {mode === 'otp_register' && registerStep === 'otp' && `Enter the 6-digit code dispatched to +91 ${mobileNumber}`}
          {mode === 'otp_register' && registerStep === 'profile' && 'Choose a secure password and enter your clinical details.'}
          {mode === 'forgot_password' && 'Verify your mobile number to set a new password.'}
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: '#F1F5F9',
        borderRadius: '10px',
        padding: '4px',
        marginBottom: '24px'
      }}>
        <button
          type="button"
          onClick={() => switchMode('password_login')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '0.85rem',
            fontWeight: mode === 'password_login' ? 600 : 500,
            color: mode === 'password_login' ? '#0F4C81' : '#64748B',
            backgroundColor: mode === 'password_login' ? '#FFFFFF' : 'transparent',
            borderRadius: '8px',
            border: 'none',
            boxShadow: mode === 'password_login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode('otp_register')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '0.85rem',
            fontWeight: mode === 'otp_register' ? 600 : 500,
            color: mode === 'otp_register' ? '#0F4C81' : '#64748B',
            backgroundColor: mode === 'otp_register' ? '#FFFFFF' : 'transparent',
            borderRadius: '8px',
            border: 'none',
            boxShadow: mode === 'otp_register' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          New User / OTP
        </button>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div style={{
          backgroundColor: '#DEF7EC',
          border: '1px solid #84E1BC',
          color: '#03543F',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: PASSWORD LOGIN (DEFAULT FOR RETURNING USERS)     */}
      {/* ======================================================== */}
      {mode === 'password_login' && (
        <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#334155'
              }}>
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                className="input-field"
                placeholder="10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => switchMode('forgot_password')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0F4C81',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Helpful Note for Existing Accounts */}
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={14} color="#00A896" />
              <span>For existing accounts, default password is <strong>Password@1234</strong></span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            disabled={loading || mobileNumber.length !== 10 || !password}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Sign In with Password</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.825rem', color: '#64748B' }}>
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => switchMode('otp_register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0F4C81',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Verify number & register with OTP
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* MODE 2: OTP VERIFICATION & REGISTRATION (ONLY FOR ONBOARD) */}
      {/* ======================================================== */}
      {mode === 'otp_register' && (
        <div>
          {/* Step 1: Send OTP to verify number */}
          {registerStep === 'phone' && (
            <form onSubmit={handleSendOtpRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="input-label">Mobile Number for Verification</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 14px',
                    backgroundColor: '#F1F5F9',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
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
                  We will send a 6-digit OTP code to verify your phone number.
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

          {/* Step 2: Enter OTP */}
          {registerStep === 'otp' && (
            <form onSubmit={handleVerifyOtpRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="input-label">6-Digit Verification Code</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.25rem', fontWeight: 700 }}
                  autoFocus
                  required
                />

                {devOtp && (
                  <div style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#065F46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>SMS / Dev OTP: <strong>{devOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtp(devOtp)}
                      style={{
                        backgroundColor: '#059669',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Auto-fill
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={loading || otp.length !== 6}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>Verify Phone Number</span>
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setRegisterStep('phone')}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={handleSendOtpRegister}
                  disabled={cooldown > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: cooldown > 0 ? '#94A3B8' : '#0F4C81',
                    cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    padding: 0
                  }}
                >
                  {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Setup Profile and Permanent Password */}
          {registerStep === 'profile' && (
            <form onSubmit={handleCompleteRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Full Name / Clinical Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Dr. Ashish Wandhare"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="input-label">Create Account Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Min 6 characters (e.g. Password@1234)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  You will use this password to sign in without needing OTP every time.
                </span>
              </div>

              <div>
                <label className="input-label">User Type / Role</label>
                <select
                  className="input-field"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <option value="practitioner">Registered Practitioner</option>
                  <option value="patient">Patient / Care Seeker</option>
                  <option value="student">Electropathy Student</option>
                  <option value="researcher">Medical Researcher</option>
                </select>
              </div>

              <div>
                <label className="input-label">Preferred Clinical Language</label>
                <select
                  className="input-field"
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value)}
                >
                  <option value="en">English (Clinical Latin Terminology)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '6px' }}
                disabled={loading || !fullName.trim() || password.length < 6}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>Complete Registration & Sign In</span>
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: FORGOT PASSWORD / RESET VIA OTP                   */}
      {/* ======================================================== */}
      {mode === 'forgot_password' && (
        <div>
          {forgotStep === 'phone' && (
            <form onSubmit={handleSendOtpForgot} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="input-label">Enter Registered Mobile Number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 14px',
                    backgroundColor: '#F1F5F9',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#334155'
                  }}>
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={loading || mobileNumber.length !== 10}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>Send Password Reset OTP</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => switchMode('password_login')}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.825rem', cursor: 'pointer' }}
                >
                  ← Back to Password Sign In
                </button>
              </div>
            </form>
          )}

          {forgotStep === 'reset' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="input-label">6-Digit Verification Code</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.25rem', fontWeight: 700 }}
                  autoFocus
                  required
                />
                {devOtp && (
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 10px',
                    backgroundColor: '#ECFDF5',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    color: '#065F46'
                  }}>
                    OTP: <strong>{devOtp}</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">New Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={loading || otp.length !== 6 || newPassword.length < 6}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>Save New Password & Continue</span>
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Security Footer Notice */}
      <div style={{
        marginTop: '28px',
        paddingTop: '16px',
        borderTop: '1px solid #F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: '#94A3B8',
        fontSize: '0.75rem'
      }}>
        <ShieldCheck size={16} color="#00A896" />
        <span>End-to-End Encrypted Session • Electropathy AI RBAC Protected</span>
      </div>
    </div>
  );
};
