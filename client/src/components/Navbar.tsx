import React from 'react';
import { User } from '../types';
import { Activity, User as UserIcon, LogOut, Globe, Shield } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
  activeTab: 'intake' | 'records';
  onTabChange: (tab: 'intake' | 'records') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentLang,
  onLanguageChange,
  onLogout,
  activeTab,
  onTabChange,
}) => {
  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0F4C81 0%, #00A896 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 10px rgba(0, 168, 150, 0.25)'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
                Electropathy<span style={{ color: '#00A896' }}>AI</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: '#EBF3FA',
                color: '#0F4C81',
                padding: '2px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                Portal v1.0
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Clinical Intake & Decision Assistant
            </div>
          </div>
        </div>

        {/* Navigation Tabs (if logged in) */}
        {user && (
          <nav style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onTabChange('intake')}
              className="btn"
              style={{
                backgroundColor: activeTab === 'intake' ? '#EBF3FA' : 'transparent',
                color: activeTab === 'intake' ? '#0F4C81' : '#64748B',
                fontWeight: activeTab === 'intake' ? 700 : 500,
                border: activeTab === 'intake' ? '1px solid #CBD5E1' : '1px solid transparent'
              }}
            >
              + New Patient Intake
            </button>
            <button
              onClick={() => onTabChange('records')}
              className="btn"
              style={{
                backgroundColor: activeTab === 'records' ? '#EBF3FA' : 'transparent',
                color: activeTab === 'records' ? '#0F4C81' : '#64748B',
                fontWeight: activeTab === 'records' ? 700 : 500,
                border: activeTab === 'records' ? '1px solid #CBD5E1' : '1px solid transparent'
              }}
            >
              Patient Case Records
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '8px' }}>
            <Globe size={16} color="#64748B" />
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (HI)</option>
              <option value="mr">मराठी (MR)</option>
            </select>
          </div>

          {/* User profile or Guest badge */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#0F4C81',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}>
                  {user.fullName ? user.fullName[0]?.toUpperCase() : <UserIcon size={16} />}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                    {user.fullName || user.mobileNumber}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#00A896', fontWeight: 700, textTransform: 'capitalize' }}>
                    {user.userType || user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  background: 'none',
                  border: '1px solid #E2E8F0',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#0F4C81',
              backgroundColor: '#EBF3FA',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <Shield size={16} />
              Doctor Secure Access
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
