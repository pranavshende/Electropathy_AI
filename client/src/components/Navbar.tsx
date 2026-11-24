import React from 'react';
import { User } from '../types';
import { Activity, User as UserIcon, LogOut, FolderOpen, MessageSquare, Sparkles, Shield, ArrowUpRight } from 'lucide-react';
import { formatDisplayPhone } from '../utils/phone';
import { useTranslation } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';

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
  const { t, language, setLanguage } = useTranslation();

  const handleLangSelect = (lang: Language) => {
    setLanguage(lang);
    onLanguageChange(lang);
  };

  const activeLanguage = (language || currentLang || 'en') as Language;

  return (
    <>
      <header className="nav-header">
        <div className="nav-capsule">
          {/* 1. Brand Logo & Clinical Engine Badge (Left) */}
          <div 
            onClick={() => onTabChange('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              flexShrink: 0,
              userSelect: 'none'
            }}
          >
            <div className="nav-logo-icon">
              <Activity size={18} />
              <span style={{
                position: 'absolute',
                bottom: '-1px',
                right: '-1px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                border: '1.5px solid #FFFFFF'
              }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="nav-logo-text">
                {activeLanguage === 'hi' ? 'इलेक्ट्रोपैथी' : activeLanguage === 'mr' ? 'इलेक्ट्रोपॅथी' : 'Electropathy'}<span style={{
                  background: 'linear-gradient(135deg, #0284C7 0%, #00A896 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{activeLanguage === 'en' ? 'AI' : ' एआई'}</span>
              </span>

              <span className="nav-badge-pill">
                {t.common.engineBadge}
              </span>
            </div>
          </div>

          {/* 2. Center Navigation Pills (Desktop only) */}
          {user ? (
            <nav className="hide-on-mobile" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(241, 245, 249, 0.9)',
              padding: '3px',
              borderRadius: '999px',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}>
              <button
                type="button"
                onClick={() => onTabChange('chat')}
                className="medical-pill-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'chat' ? '#090D16' : 'transparent',
                  color: activeTab === 'chat' ? '#FFFFFF' : '#475569',
                  boxShadow: activeTab === 'chat' ? '0 2px 8px rgba(9, 13, 22, 0.2)' : 'none',
                  transition: 'all 0.18s ease'
                }}
              >
                <MessageSquare size={14} color={activeTab === 'chat' ? '#38BDF8' : '#64748B'} />
                <span>{t.navbar.consultations}</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('records')}
                className="medical-pill-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'records' ? '#090D16' : 'transparent',
                  color: activeTab === 'records' ? '#FFFFFF' : '#475569',
                  boxShadow: activeTab === 'records' ? '0 2px 8px rgba(9, 13, 22, 0.2)' : 'none',
                  transition: 'all 0.18s ease'
                }}
              >
                <FolderOpen size={14} color={activeTab === 'records' ? '#38BDF8' : '#64748B'} />
                <span>{t.navbar.records}</span>
              </button>
            </nav>
          ) : (
            <div 
              className="hide-on-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '999px',
                backgroundColor: 'rgba(240, 249, 255, 0.9)',
                border: '1px solid #BAE6FD',
                padding: '5px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#0369A1'
              }}>
                <Sparkles size={12} color="#0284C7" />
                <span>{t.navbar.dualTable}</span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '999px',
                backgroundColor: 'rgba(236, 253, 245, 0.9)',
                border: '1px solid #A7F3D0',
                padding: '5px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#065F46'
              }}>
                <Shield size={12} color="#059669" />
                <span>{t.navbar.optimizer}</span>
              </div>
            </div>
          )}

          {/* 3. Right Action Elements: Language Selector & User Profile / Access */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Language Switcher Capsule */}
            <div className="nav-lang-switcher">
              {(['en', 'hi', 'mr'] as const).map(lang => {
                const isSelected = activeLanguage === lang;
                const label = lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मरा';
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLangSelect(lang)}
                    className={`nav-lang-btn ${isSelected ? 'active' : ''}`}
                    title={lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी (Hindi)' : 'मराठी (Marathi)'}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* User Profile Pill or Access Portal Button */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '999px',
                  border: '1px solid rgba(203, 213, 225, 0.8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '3px 10px 3px 4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284C7 0%, #00F2FE 100%)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {user.fullName ? user.fullName[0]?.toUpperCase() : <UserIcon size={14} />}
                  </div>
                  <div className="hide-on-mobile" style={{ textAlign: 'left', lineHeight: 1.15 }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#090D16' }}>
                      {user.fullName || formatDisplayPhone(user.mobileNumber)}
                    </div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#059669' }}>
                      {t.common.verifiedPatient}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  title={t.common.signOut}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid rgba(203, 213, 225, 0.8)',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                    e.currentTarget.style.color = '#EF4444';
                    e.currentTarget.style.borderColor = '#FCA5A5';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = '#64748B';
                    e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)';
                  }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <a
                href="#login"
                className="nav-access-portal-btn"
              >
                <span className="full-text">{t.navbar.accessPortal}</span>
                <span className="short-text">{t.navbar.portalShort}</span>
                <ArrowUpRight size={13} color="#00F2FE" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Dynamic Mobile Bottom Floating Capsule Dock (Visible on mobile when logged in) */}
      {user && (
        <nav className="hide-on-desktop mobile-bottom-dock">
          <button
            type="button"
            onClick={() => onTabChange('chat')}
            className={`mobile-bottom-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          >
            <MessageSquare size={16} color={activeTab === 'chat' ? '#38BDF8' : '#64748B'} />
            <span>{t.navbar.consultations}</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('records')}
            className={`mobile-bottom-tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          >
            <FolderOpen size={16} color={activeTab === 'records' ? '#38BDF8' : '#64748B'} />
            <span>{t.navbar.records}</span>
          </button>
        </nav>
      )}
    </>
  );
};
