import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PatientCase } from '../types';
import { Search, FileText, Calendar, MapPin, User, ChevronRight, Eye } from 'lucide-react';

export const CaseHistoryList: React.FC = () => {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await api.getPatientCases();
      if (res.success && res.cases) {
        setCases(res.cases);
      }
    } catch (err) {
      console.error('Error fetching cases', err);
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
    <div style={{ maxWidth: '1080px', margin: '30px auto', padding: '0 16px' }}>
      {/* Header & Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A' }}>Recorded Patient Histories</h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            {cases.length} Total Clinical Records in Database
          </p>
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search patient, complaint, phone..."
            style={{ paddingLeft: '38px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
          Loading patient records...
        </div>
      ) : filteredCases.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '60px',
          textAlign: 'center',
          border: '1px solid #E2E8F0'
        }}>
          <FileText size={48} style={{ margin: '0 auto 16px', color: '#CBD5E1' }} />
          <h3 style={{ color: '#334155', marginBottom: '8px' }}>No Patient Records Found</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Complete your first patient intake to build the clinical case database.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00A896';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#EBF3FA',
                  color: '#0F4C81',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  {c.patientName[0]?.toUpperCase()}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                      {c.patientName}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      ({c.age} yrs, {c.gender})
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: '#E0F5F2',
                      color: '#00A896',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      textTransform: 'uppercase'
                    }}>
                      {c.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#475569' }}>
                    <span>
                      <strong>Chief Complaint:</strong> {c.chiefComplaints[0]?.complaint || 'N/A'}
                    </span>
                    {c.city && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
                        <MapPin size={14} /> {c.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94A3B8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                  <div>ID: {c.id.slice(0, 8)}</div>
                </div>
                <ChevronRight size={20} color="#CBD5E1" />
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
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: '#0F172A' }}>{selectedCase.patientName}</h3>
                <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
                  Case ID: {selectedCase.id} | Recorded on {new Date(selectedCase.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.925rem' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ color: '#0F4C81', marginBottom: '8px' }}>Demographics & Contact</h4>
                <p><strong>Age / Gender:</strong> {selectedCase.age} years | {selectedCase.gender}</p>
                <p><strong>Mobile Number:</strong> +91 {selectedCase.contactNumber}</p>
                <p><strong>Location:</strong> {selectedCase.city || 'Not provided'} | {selectedCase.occupation || 'N/A'}</p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ color: '#0F4C81', marginBottom: '8px' }}>Chief Complaints</h4>
                <p><strong>Complaint:</strong> {selectedCase.chiefComplaints[0]?.complaint}</p>
                <p><strong>Duration:</strong> {selectedCase.chiefComplaints[0]?.duration || 'N/A'}</p>
                <p><strong>Pain Severity:</strong> {selectedCase.chiefComplaints[0]?.severity}/10</p>
                <p><strong>Modality / Factors:</strong> {selectedCase.chiefComplaints[0]?.factors || 'None noted'}</p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ color: '#0F4C81', marginBottom: '8px' }}>Electropathy Constitution & Impressions</h4>
                <p><strong>Temperament:</strong> {selectedCase.electropathyDetails?.temperament || 'Not specified'}</p>
                <p><strong>Prior Remedies:</strong> {selectedCase.electropathyDetails?.previousElectropathy || 'None'}</p>
                <p><strong>Clinical Notes:</strong> {selectedCase.electropathyDetails?.notes || 'None'}</p>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => window.print()} className="btn btn-secondary">
                Print Case
              </button>
              <button onClick={() => setSelectedCase(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
