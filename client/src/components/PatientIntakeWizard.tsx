import React, { useState } from 'react';
import { api } from '../services/api';
import { PatientCase } from '../types';
import { 
  ClipboardList, 
  User, 
  AlertCircle, 
  Stethoscope, 
  HeartPulse, 
  Activity, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Save,
  Printer
} from 'lucide-react';

interface PatientIntakeWizardProps {
  onCaseSubmitted: (newCase: PatientCase) => void;
}

export const PatientIntakeWizard: React.FC<PatientIntakeWizardProps> = ({ onCaseSubmitted }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successCase, setSuccessCase] = useState<PatientCase | null>(null);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [occupation, setOccupation] = useState('');

  // Chief complaints
  const [complaintText, setComplaintText] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState(5);
  const [factors, setFactors] = useState('');

  // Present Illness
  const [illnessDescription, setIllnessDescription] = useState('');
  const [previousTreatments, setPreviousTreatments] = useState('');
  const [treatmentResponse, setTreatmentResponse] = useState('');

  // Past medical
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [surgeries, setSurgeries] = useState('');
  const [allergies, setAllergies] = useState('');

  // Lifestyle
  const [diet, setDiet] = useState('Vegetarian');
  const [sleep, setSleep] = useState('Normal (6-8 hours)');
  const [appetite, setAppetite] = useState('Good');
  const [stressLevel, setStressLevel] = useState('Moderate');

  // Electropathy specifics
  const [temperament, setTemperament] = useState('Lymphatic (Water/Phlegm)');
  const [previousElectropathy, setPreviousElectropathy] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const conditionOptions = [
    'Diabetes Mellitus', 'Hypertension (BP)', 'Thyroid Disorder', 
    'Bronchial Asthma', 'Arthritis / Joint Pain', 'Gastritis / Acidity', 
    'Kidney Calculus (Stones)', 'Skin Allergies / Eczema', 'Migraine'
  ];

  const toggleCondition = (cond: string) => {
    if (chronicConditions.includes(cond)) {
      setChronicConditions(chronicConditions.filter(c => c !== cond));
    } else {
      setChronicConditions([...chronicConditions, cond]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: Partial<PatientCase> = {
        patientName,
        age: Number(age),
        gender,
        contactNumber,
        city,
        occupation,
        chiefComplaints: [{
          complaint: complaintText,
          duration,
          severity,
          factors
        }],
        presentIllness: {
          description: illnessDescription,
          previousTreatments,
          responseToTreatment: treatmentResponse
        },
        pastMedical: {
          chronicConditions,
          surgeries,
          allergies: allergies.split(',').map(s => s.trim()).filter(Boolean)
        },
        lifestyle: {
          diet,
          sleep,
          appetite,
          stressLevel
        },
        electropathyDetails: {
          temperament,
          previousElectropathy,
          notes: clinicalNotes
        },
        status: 'submitted'
      };

      const res = await api.createPatientCase(payload);
      if (res.success && res.case) {
        setSuccessCase(res.case);
        onCaseSubmitted(res.case);
      } else {
        alert(res.message || 'Error saving case.');
      }
    } catch (err) {
      alert('Network error while saving case.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successCase) {
    return (
      <div style={{
        maxWidth: '720px',
        margin: '40px auto',
        padding: '40px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 20px',
          borderRadius: '50%',
          backgroundColor: '#D1FAE5',
          color: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckCircle size={36} />
        </div>
        
        <h2 style={{ fontSize: '1.75rem', color: '#0F172A', marginBottom: '8px' }}>
          Patient Intake Recorded Successfully!
        </h2>
        <p style={{ color: '#64748B', marginBottom: '28px' }}>
          Case ID: <strong style={{ color: '#0F4C81' }}>{successCase.id.slice(0, 8)}</strong> for <strong>{successCase.patientName}</strong> ({successCase.age} yrs, {successCase.gender}).
        </p>

        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'left',
          marginBottom: '28px'
        }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: '#0F4C81' }}>Summary Details:</h4>
          <p><strong>Chief Complaint:</strong> {successCase.chiefComplaints[0]?.complaint} ({successCase.chiefComplaints[0]?.duration})</p>
          <p><strong>Severity:</strong> {successCase.chiefComplaints[0]?.severity}/10</p>
          <p><strong>Temperament:</strong> {successCase.electropathyDetails?.temperament}</p>
          <p><strong>Contact:</strong> +91 {successCase.contactNumber} | {successCase.city}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary"
          >
            <Printer size={18} />
            Print Case Summary
          </button>
          
          <button
            onClick={() => {
              setSuccessCase(null);
              setCurrentStep(1);
              setPatientName('');
              setAge('');
              setContactNumber('');
              setComplaintText('');
            }}
            className="btn btn-primary"
          >
            + Intake Another Patient
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, title: 'Demographics', icon: User },
    { num: 2, title: 'Chief Complaints', icon: AlertCircle },
    { num: 3, title: 'Present Illness', icon: Stethoscope },
    { num: 4, title: 'Medical History', icon: HeartPulse },
    { num: 5, title: 'Lifestyle & Vitals', icon: Activity },
    { num: 6, title: 'Electropathy Assessment', icon: ClipboardList }
  ];

  return (
    <div style={{
      maxWidth: '860px',
      margin: '30px auto',
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid #E2E8F0',
      overflow: 'hidden'
    }}>
      {/* Wizard Header */}
      <div style={{
        padding: '24px 32px',
        backgroundColor: '#0F4C81',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.35rem', marginBottom: '4px' }}>
            Clinical Patient History Intake
          </h2>
          <p style={{ color: '#93C5FD', fontSize: '0.85rem' }}>
            Standardized Electropathy Case Formulation & Diagnosis Support
          </p>
        </div>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          Step {currentStep} of 6
        </div>
      </div>

      {/* Progress Bar & Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
        overflowX: 'auto'
      }}>
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isPassed = currentStep > s.num;
          return (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              style={{
                flex: 1,
                minWidth: '130px',
                padding: '14px 10px',
                border: 'none',
                background: isActive ? '#FFFFFF' : 'transparent',
                borderBottom: isActive ? '3px solid #00A896' : '3px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: isActive ? '#0F4C81' : isPassed ? '#10B981' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.825rem'
              }}
            >
              <Icon size={16} />
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Body */}
      <div style={{ padding: '36px', minHeight: '380px' }}>
        
        {/* STEP 1: Demographics */}
        {currentStep === 1 && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Patient Full Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter patient full name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="input-label">Age (in years) *</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 42"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="120"
                required
              />
            </div>

            <div>
              <label className="input-label">Gender *</label>
              <select
                className="input-field"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="input-label">Mobile Number *</label>
              <input
                type="tel"
                className="input-field"
                placeholder="10-digit mobile number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>

            <div>
              <label className="input-label">City / Town</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Nagpur, Maharashtra"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Occupation</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Teacher, Farmer, IT Professional"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Chief Complaints */}
        {currentStep === 2 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <label className="input-label">Primary Chief Complaints *</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Describe current primary complaints (e.g., Severe right flank pain, chronic digestive distress, joint swelling)..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="input-label">Duration of Complaint</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., 2 weeks, 6 months, 3 years"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Severity Level: {severity}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  style={{ width: '100%', height: '8px', cursor: 'pointer', accentColor: '#0F4C81' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  <span>Mild (1-3)</span>
                  <span>Moderate (4-6)</span>
                  <span>Severe (7-10)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="input-label">Aggravating & Relieving Factors</label>
              <input
                type="text"
                className="input-field"
                placeholder="What makes symptoms worse or better? (e.g., Worse in cold weather, relieved by rest)"
                value={factors}
                onChange={(e) => setFactors(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Present Illness */}
        {currentStep === 3 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="input-label">Detailed Progression of Illness</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Onset (sudden or gradual), sequence of symptoms, triggers, daily patterns..."
                value={illnessDescription}
                onChange={(e) => setIllnessDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">Previous Treatments Taken</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Allopathic antibiotics, Ayurvedic churnas, Homeopathy"
                value={previousTreatments}
                onChange={(e) => setPreviousTreatments(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">Response to Previous Treatments</label>
              <input
                type="text"
                className="input-field"
                placeholder="Temporary relief, no response, side effects observed..."
                value={treatmentResponse}
                onChange={(e) => setTreatmentResponse(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Medical History */}
        {currentStep === 4 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <label className="input-label">Known Chronic Conditions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {conditionOptions.map((cond) => {
                  const selected = chronicConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: selected ? '1.5px solid #0F4C81' : '1.5px solid #CBD5E1',
                        backgroundColor: selected ? '#EBF3FA' : '#FFFFFF',
                        color: selected ? '#0F4C81' : '#475569',
                        fontWeight: selected ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {selected ? '✓ ' : '+ '} {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="input-label">Past Surgeries or Major Illnesses</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Appendectomy in 2018, Cholecystectomy"
                value={surgeries}
                onChange={(e) => setSurgeries(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">Known Allergies (Medicines, Foods, Dust)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Penicillin, Sulfa drugs, Peanuts, Pollen"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 5: Lifestyle */}
        {currentStep === 5 && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label className="input-label">Dietary Habit</label>
              <select className="input-field" value={diet} onChange={(e) => setDiet(e.target.value)}>
                <option value="Vegetarian">Pure Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Ovo-Vegetarian">Eggetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>

            <div>
              <label className="input-label">Sleep Pattern</label>
              <select className="input-field" value={sleep} onChange={(e) => setSleep(e.target.value)}>
                <option value="Normal (6-8 hours)">Normal (6-8 hours, restful)</option>
                <option value="Disturbed / Insomnia">Disturbed / Insomnia</option>
                <option value="Excessive (>9 hours)">Excessive Sleepiness</option>
              </select>
            </div>

            <div>
              <label className="input-label">Appetite & Digestion</label>
              <select className="input-field" value={appetite} onChange={(e) => setAppetite(e.target.value)}>
                <option value="Good">Normal / Good</option>
                <option value="Poor">Poor / Loss of Appetite</option>
                <option value="Excessive / Variable">Irregular / Bloating</option>
              </select>
            </div>

            <div>
              <label className="input-label">Stress Level</label>
              <select className="input-field" value={stressLevel} onChange={(e) => setStressLevel(e.target.value)}>
                <option value="Low">Low / Relaxed</option>
                <option value="Moderate">Moderate Daily Stress</option>
                <option value="High">Severe / Chronic Anxiety</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 6: Electropathy Assessment */}
        {currentStep === 6 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="input-label">Electropathy Temperament (प्रकृति / Temperament)</label>
              <select
                className="input-field"
                value={temperament}
                onChange={(e) => setTemperament(e.target.value)}
              >
                <option value="Lymphatic (Water/Phlegm)">Lymphatic Temperament (रस प्रधान / Water & Phlegm)</option>
                <option value="Sanguine (Blood/Air)">Sanguine Temperament (रक्त प्रधान / Blood & Circulatory)</option>
                <option value="Bilious (Bile/Fire)">Bilious Temperament (पित्त प्रधान / Bile & Digestive)</option>
                <option value="Nervous (Verve/Energy)">Nervous Temperament (वात प्रधान / Nervous system)</option>
                <option value="Mixed Constitution">Mixed Constitution (मिश्रित प्रकृति)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Previous Electropathy Remedies Used (if any)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., S1, C5, A2, Green Electricity (GE), Ven1"
                value={previousElectropathy}
                onChange={(e) => setPreviousElectropathy(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">Doctor's Clinical Impressions & Notes</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Add special observations, pulse, tongue diagnosis notes..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
              />
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation Buttons */}
      <div style={{
        padding: '20px 32px',
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          type="button"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          className="btn btn-secondary"
          disabled={currentStep === 1}
        >
          <ArrowLeft size={16} />
          Previous Step
        </button>

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={() => {
              if (currentStep === 1 && (!patientName.trim() || !age || !contactNumber)) {
                alert('Please fill patient name, age, and contact number.');
                return;
              }
              setCurrentStep(prev => prev + 1);
            }}
            className="btn btn-primary"
          >
            <span>Next: {steps[currentStep]?.title}</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-accent"
            disabled={submitting}
          >
            <Save size={18} />
            {submitting ? 'Saving Case Record...' : 'Complete & Record Intake'}
          </button>
        )}
      </div>
    </div>
  );
};
