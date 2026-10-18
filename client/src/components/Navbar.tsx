import React from 'react';
import { User } from '../types';
import { Activity, User as UserIcon, LogOut, Globe, FilePlus, FolderOpen, MessageSquare, CheckCircle } from 'lucide-react';
import { formatDisplayPhone } from '../utils/phone';

interface NavbarProps {
  user: User | null;
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
  activeTab: 'records' | 'chat';
  onTabChange: (tab: 'records' | 'chat') => void;
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
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
    }}>
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '0 24px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => onTabChange('chat')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '11px',
            overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(0, 168, 150, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF'
          }}>
            <img src="/favicon.svg" alt="Electropathy AI Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px' }}>
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
                Patient Portal
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Personal Consultation & Health Records
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Strictly Patient: Consultations & My Records) */}
        {user && (
          <nav style={{ display: 'flex', gap: '6px', backgroundColor: '#F8FAFC', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            {/* Consultation History & Chat */}
            <button
              onClick={() => onTabChange('chat')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                fontSize: '0.84rem',
                fontWeight: activeTab === 'chat' ? 700 : 600,
                color: activeTab === 'chat' ? '#00A896' : '#64748B',
                backgroundColor: activeTab === 'chat' ? '#FFFFFF' : 'transparent',
                borderRadius: '7px',
                border: activeTab === 'chat' ? '1px solid #BAE6FD' : '1px solid transparent',
                cursor: 'pointer',
                boxShadow: activeTab === 'chat' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <MessageSquare size={15} color={activeTab === 'chat' ? '#00A896' : '#94A3B8'} />
              <span>Consultations & Chat</span>
            </button>

            {/* My Health Records */}
            <button
              onClick={() => onTabChange('records')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                fontSize: '0.84rem',
                fontWeight: activeTab === 'records' ? 700 : 600,
                color: activeTab === 'records' ? '#0F4C81' : '#64748B',
                backgroundColor: activeTab === 'records' ? '#FFFFFF' : 'transparent',
                borderRadius: '7px',
                border: activeTab === 'records' ? '1px solid #CBD5E1' : '1px solid transparent',
                cursor: 'pointer',
                boxShadow: activeTab === 'records' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <FolderOpen size={15} color={activeTab === 'records' ? '#0F4C81' : '#94A3B8'} />
              <span>My Health Records</span>
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

          {/* User profile with verified phone account identifier */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
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
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                    {user.fullName || formatDisplayPhone(user.mobileNumber)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#00A896', fontWeight: 600 }}>
                    <CheckCircle size={10} color="#00A896" />
                    <span>ID: {formatDisplayPhone(user.mobileNumber)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  background: 'none',
                  border: '1px solid #E2E8F0',
                  padding: '7px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
