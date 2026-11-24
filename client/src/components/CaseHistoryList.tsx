import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PatientCase, User } from '../types';
import { Search, FileText, Calendar, MapPin, User as UserIcon, ChevronRight, Eye, ShieldCheck, Plus, Edit3, X } from 'lucide-react';
import { formatDisplayPhone } from '../utils/phone';
import { PatientIntakeWizard } from './PatientIntakeWizard';
import { useTranslation } from '../i18n/LanguageContext';

interface CaseHistoryListProps {
  user?: User | null;
}

export const CaseHistoryList: React.FC<CaseHistoryListProps> = ({ user }) => {
  const { t, language } = useTranslation();
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [editingCase, setEditingCase] = useState<PatientCase | null>(null);
  const [showWizardModal, setShowWizardModal] = useState(false);

  const isPractitioner = user?.role === 'practitioner';

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await api.getPatientCases();
      if (res.success && res.cases) {
        setCases(res.cases);
      } else {
        setCases([]);
      }
    } catch (err) {
      console.error('Error fetching cases', err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => 
    c.patientName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactNumber.includes(search) ||
    c.chiefComplaints[0]?.complaint.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1180px', margin: '20px auto', padding: '0 16px 80px' }}>
      {/* Editorial Header & Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 12px',
            backgroundColor: 'rgba(235, 248, 255, 0.9)',
            border: '1px solid rgba(186, 230, 253, 0.8)',
            borderRadius: '999px',
            color: '#0284C7',
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            <span>01</span>
            <span>•</span>
            <ShieldCheck size={12} />
            <span>Isolated & Private Vault</span>
          </div>

          <h2 style={{
            fontSize: '1.85rem',
            fontWeight: 900,
            color: '#090D16',
            letterSpacing: '-0.03em',
            margin: 0,
            lineHeight: 1.15
          }}>
            {isPractitioner ? (language === 'hi' ? 'चिकित्सक रोगी इतिहास' : language === 'mr' ? 'वैद्यकीय रुग्ण इतिहास' : 'RECORDED PATIENT HISTORIES') : t.records.title}
          </h2>

          <p style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '6px' }}>
            {isPractitioner 
              ? `${cases.length} Total Clinical Records Recorded Under Your Practice`
              : user 
                ? `Confidential records registered to ID: ${formatDisplayPhone(user.mobileNumber)}`
                : t.records.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: '1 1 380px', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '280px', maxWidth: '100%', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder={t.records.searchPlaceholder}
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                borderRadius: '999px',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                fontSize: '0.82rem',
                outline: 'none',
                color: '#0F172A',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              setEditingCase(null);
              setShowWizardModal(true);
            }}
            className="medical-pill-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              fontSize: '0.82rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              backgroundColor: '#090D16',
              color: '#FFFFFF',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(9, 13, 22, 0.2)'
            }}
          >
            <Plus size={15} color="#38BDF8" />
            <span>Add Patient Record ↗</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
          Loading clinical records...
        </div>
      ) : filteredCases.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 20px',
          textAlign: 'center',
          border: '1px solid #E2E8F0'
        }}>
          <FileText size={44} style={{ margin: '0 auto 14px', color: '#CBD5E1' }} />
          <h3 style={{ color: '#334155', marginBottom: '8px', fontSize: '1.1rem' }}>
            {isPractitioner ? 'No Patient Records Found' : 'No Health Records Found'}
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.84rem', maxWidth: '460px', margin: '0 auto' }}>
            {isPractitioner 
              ? 'Complete your first patient intake to build the clinical case database.'
              : 'You do not have any saved clinical records under this account yet. Consultation summaries will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCases.map((c, index) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className="medical-glass-card"
              style={{
                borderRadius: '20px',
                padding: '18px 22px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                flexWrap: 'wrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0284C7';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(2, 132, 199, 0.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.03)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 260px', minWidth: 0 }}>
                {/* Numbered Brand Badge */}
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  color: '#94A3B8',
                  letterSpacing: '0.05em',
                  width: '24px'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #090D16 0%, #0F172A 100%)',
                  color: '#38BDF8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                }}>
                  {c.patientName[0]?.toUpperCase()}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#090D16', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.patientName}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                      ({c.age} yrs • {c.gender})
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      color: '#059669',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {c.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', color: '#475569', flexWrap: 'wrap' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px' }}>
                      <strong style={{ color: '#090D16' }}>Chief Complaint:</strong> {c.chiefComplaints[0]?.complaint || 'N/A'}
                    </span>
                    {c.city && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '0.76rem' }}>
                        <MapPin size={13} color="#0284C7" /> {c.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: 'auto' }}>
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94A3B8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', fontWeight: 600, color: '#64748B' }}>
                    <Calendar size={12} color="#94A3B8" />
                    {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div>ID: <code>{c.id.slice(0, 8)}</code></div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCase(c);
                    setShowWizardModal(true);
                  }}
                  className="medical-pill-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: 'rgba(235, 248, 255, 0.9)',
                    border: '1px solid #BAE6FD',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '0.74rem',
                    color: '#0284C7',
                    cursor: 'pointer',
                    fontWeight: 800,
                    transition: 'all 0.15s ease'
                  }}
                  title="Edit Case History"
                >
                  <Edit3 size={13} />
                  <span>Edit ↗</span>
                </button>

                <ChevronRight size={18} color="#94A3B8" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Details Modal */}
      {selectedCase && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '12px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '20px 18px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>{selectedCase.patientName}</h3>
                <p style={{ color: '#64748B', fontSize: '0.78rem' }}>
                  Case ID: {selectedCase.id.slice(0, 8)} • Recorded {new Date(selectedCase.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748B', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px' }}>
                <h4 style={{ color: '#0F4C81', marginBottom: '6px', fontSize: '0.9rem' }}>Demographics & Contact</h4>
                <p><strong>Age / Gender:</strong> {selectedCase.age} years | {selectedCase.gender}</p>
                <p><strong>Mobile Number:</strong> +91 {selectedCase.contactNumber}</p>
                <p><strong>Location:</strong> {selectedCase.city || 'Not provided'} | {selectedCase.occupation || 'N/A'}</p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px' }}>
                <h4 style={{ color: '#0F4C81', marginBottom: '6px', fontSize: '0.9rem' }}>Chief Complaints</h4>
                <p><strong>Complaint:</strong> {selectedCase.chiefComplaints[0]?.complaint}</p>
                <p><strong>Duration:</strong> {selectedCase.chiefComplaints[0]?.duration || 'N/A'}</p>
                <p><strong>Pain Severity:</strong> {selectedCase.chiefComplaints[0]?.severity}/10</p>
                <p><strong>Modality / Factors:</strong> {selectedCase.chiefComplaints[0]?.factors || 'None noted'}</p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px' }}>
                <h4 style={{ color: '#0F4C81', marginBottom: '6px', fontSize: '0.9rem' }}>Electropathy Constitution & Impressions</h4>
                <p><strong>Temperament:</strong> {selectedCase.electropathyDetails?.temperament || 'Not specified'}</p>
                <p><strong>Prior Remedies:</strong> {selectedCase.electropathyDetails?.previousElectropathy || 'None'}</p>
                <p><strong>Clinical Notes:</strong> {selectedCase.electropathyDetails?.notes || 'None'}</p>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setEditingCase(selectedCase);
                  setSelectedCase(null);
                  setShowWizardModal(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit3 size={15} />
                <span>Edit Case</span>
              </button>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                Print Case
              </button>
              <button onClick={() => setSelectedCase(null)} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Modal for Add / Edit Case History */}
      {showWizardModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '920px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <PatientIntakeWizard
                initialCase={editingCase}
                currentUser={user}
                onCancel={() => setShowWizardModal(false)}
                onCaseSubmitted={async () => {
                  setShowWizardModal(false);
                  await loadCases();
                }}
                title={editingCase ? "Edit Patient Case Record" : "Add Patient Case Record"}
                submitButtonText={editingCase ? "Save & Update Record" : "Save Patient Intake Record"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
