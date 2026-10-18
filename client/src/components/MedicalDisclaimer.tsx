import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const MedicalDisclaimer: React.FC = () => {
  return (
    <footer style={{
      marginTop: '60px',
      borderTop: '1px solid #E2E8F0',
      backgroundColor: '#FFFFFF',
      padding: '24px 16px',
      color: '#64748B',
      fontSize: '0.825rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#FEF3C7',
        border: '1px solid #FCD34D',
        color: '#92400E',
        padding: '12px 18px',
        borderRadius: '8px',
        textAlign: 'left',
        lineHeight: 1.4
      }}>
        <AlertTriangle size={24} style={{ flexShrink: 0 }} />
        <div>
          <strong>Medical Notice:</strong> Electropathy AI is an informational and clinical decision-support application built exclusively from verified datasets authorized by Dr. Ashish Wandhare. It does not provide autonomous diagnosis or unsupervised prescription. Final medical judgment resides solely with the licensed practitioner.
        </div>
      </div>
      <div style={{ marginTop: '14px', fontSize: '0.75rem', color: '#94A3B8' }}>
        © 2026 Electropathy AI – Developed by NKSKILLEDGE PRIVATE LIMITED for Dr. Ashish Wandhare. All Rights Reserved.
      </div>
    </footer>
  );
};
