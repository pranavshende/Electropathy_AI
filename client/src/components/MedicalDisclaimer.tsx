import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ compact = false }) => {
  const { t } = useTranslation();

  if (compact) {
    return (
      <footer style={{
        marginTop: '8px',
        padding: '6px 16px 12px',
        color: '#64748B',
        fontSize: '0.72rem',
        textAlign: 'center'
      }}>
        <div 
          className="medical-glass-card"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(252, 211, 77, 0.5)',
            color: '#78350F',
            padding: '8px 16px',
            borderRadius: '999px',
            textAlign: 'left',
            lineHeight: 1.35,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={14} color="#D97706" />
          </div>
          <div style={{ fontSize: '0.72rem' }}>
            <strong style={{ color: '#92400E' }}>{t.disclaimer.noticeTitle} </strong>{t.disclaimer.compactText}
          </div>
        </div>
        <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#94A3B8', fontWeight: 500 }}>
          {t.disclaimer.copyright}
        </div>
      </footer>
    );
  }

  return (
    <footer className="app-footer-user" style={{
      marginTop: '48px',
      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
      backgroundColor: 'transparent',
      padding: '24px 16px 36px',
      color: '#64748B',
      fontSize: '0.8rem',
      textAlign: 'center'
    }}>
      <div 
        className="medical-glass-card"
        style={{
          maxWidth: '920px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          border: '1px solid rgba(252, 211, 77, 0.4)',
          color: '#78350F',
          padding: '12px 20px',
          borderRadius: '999px',
          textAlign: 'left',
          lineHeight: 1.45,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
        }}
      >
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: '#FEF3C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle size={16} color="#D97706" />
        </div>
        <div style={{ fontSize: '0.78rem' }}>
          <strong style={{ color: '#92400E' }}>{t.disclaimer.fullNoticeTitle} </strong>{t.disclaimer.fullText}
        </div>
      </div>
      <div style={{ marginTop: '14px', fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <ShieldCheck size={14} color="#00F2FE" />
        <span>{t.disclaimer.copyright}</span>
      </div>
    </footer>
  );
};
