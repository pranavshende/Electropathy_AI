import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Zap, 
  Stethoscope, 
  Clock 
} from 'lucide-react';

interface ThinkingTimelineProps {
  isGenerating: boolean;
  language?: string;
}

interface StepDef {
  id: number;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  title: Record<string, string>;
  detail: Record<string, string>;
}

const TIMELINE_STEPS: StepDef[] = [
  {
    id: 1,
    icon: Stethoscope,
    title: {
      en: 'Clinical Symptom & Red Flag Screening',
      hi: 'लक्षणों एवं आपातकालीन चेतावनी की जांच',
      mr: 'लक्षणे आणि तातडीच्या इशाऱ्यांची तपासणी'
    },
    detail: {
      en: 'Extracting organ affinities, chronicity stage, and evaluating 7 emergency red flags',
      hi: 'अंग संबंध, रोग की अवधि एवं ७ आपातकालीन रेड फ्लैग का मूल्यांकन',
      mr: 'अवयव संबंध, आजाराचा टप्पा आणि ७ तातडीच्या रेड फ्लॅगचे मूल्यमापन'
    }
  },
  {
    id: 2,
    icon: Database,
    title: {
      en: 'Dual-Table Materia Medica Retrieval',
      hi: 'ड्यूल-टेबल मटेरिया मेडिका की खोज',
      mr: 'ड्यूल-टेबल मटेरिया मेडिका शोध'
    },
    detail: {
      en: 'Cross-referencing 38 Core Remedy-States & 60 SPG Botanical Organ Actions',
      hi: '३८ मुख्य उपाय-अवस्थाओं और ६० एसपीजी वानस्पतिक क्रियाओं का मिलान',
      mr: '३८ मुख्य औषध-अवस्था आणि ६० एसपीजी वनस्पती क्रियांची पडताळणी'
    }
  },
  {
    id: 3,
    icon: Zap,
    title: {
      en: 'Bioelectric Polarity & Dilution Dynamics',
      hi: 'जैव-विद्युत ध्रुवीयता एवं डायल्यूशन निर्धारण',
      mr: 'जैव-विद्युत ध्रुवीयता आणि डायल्यूशन निर्धारण'
    },
    detail: {
      en: 'Balancing Positive, Negative & Neutral polarities with Count Mattei D1–D30 scale',
      hi: 'पॉजिटिव, नेगेटिव और न्यूट्रल पोलारिटी का काउंट मट्टेई पैमाने पर संतुलन',
      mr: 'पॉझिटिव्ह, निगेटिव्ह आणि न्यूट्रल ध्रुवीयतेचे काउंट मट्टेई प्रमाणानुसार संतुलन'
    }
  },
  {
    id: 4,
    icon: Sparkles,
    title: {
      en: 'Synthesizing Individualized Clinical Guidance',
      hi: 'व्यक्तिगत क्लिनिकल प्रोटोकॉल का निर्माण',
      mr: 'वैयक्तिक क्लिनिकल प्रोटोकॉलची मांडणी'
    },
    detail: {
      en: "Grounding formulation in Dr. Ashish Wandhare's verified dataset and self-care",
      hi: 'डॉ. आशीष वांधारे प्रमाणित क्लिनिकल ज्ञान एवं सावधानियों के साथ समन्वय',
      mr: 'डॉ. आशिष वांधारे यांच्या प्रमाणित ज्ञान आणि खबरदारीच्या सूचनांसह समन्वय'
    }
  }
];

export const ThinkingTimeline: React.FC<ThinkingTimelineProps> = ({ isGenerating, language = 'en' }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const langKey = language === 'hi' ? 'hi' : language === 'mr' ? 'mr' : 'en';

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIndex(0);
      setElapsedMs(0);
      return;
    }

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      setElapsedMs(diff);

      if (diff < 900) {
        setCurrentStepIndex(0);
      } else if (diff < 2200) {
        setCurrentStepIndex(1);
      } else if (diff < 3600) {
        setCurrentStepIndex(2);
      } else {
        setCurrentStepIndex(3);
      }
    }, 100);

    return () => clearInterval(timerInterval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  const secondsDisplay = (elapsedMs / 1000).toFixed(1);

  const headerLabel = {
    en: 'Reasoning across Electropathy Knowledge Base',
    hi: 'इलेक्ट्रोपैथी ज्ञान पर विचार हो रहा है',
    mr: 'इलेक्ट्रोपॅथी ज्ञानाचे विश्लेषण सुरू आहे'
  }[langKey];

  return (
    <div 
      className="thinking-timeline-card"
      style={{
        margin: '8px 0 16px 0',
        maxWidth: '680px',
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid rgba(186, 230, 253, 0.7)',
        boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.08), 0 0 16px rgba(56, 189, 248, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Top Header Pill */}
      <div 
        onClick={() => setIsExpanded(prev => !prev)}
        style={{
          padding: '12px 18px',
          backgroundColor: '#090D16',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            position: 'relative',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Loader2 className="animate-spin" size={14} color="#38BDF8" />
          </div>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#F8FAFC' }}>
            {headerLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#38BDF8',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '2px 8px',
            borderRadius: '999px',
            fontVariantNumeric: 'tabular-nums'
          }}>
            <Clock size={11} />
            {secondsDisplay}s
          </span>

          <button 
            type="button" 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#94A3B8', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Timeline Steps */}
      {isExpanded && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'rgba(248, 250, 252, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;
            const IconComp = step.icon;

            return (
              <div 
                key={step.id} 
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                {/* Connecting Line */}
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '13px',
                    top: '26px',
                    bottom: '-14px',
                    width: '2px',
                    backgroundColor: isCompleted ? '#10B981' : isCurrent ? 'rgba(56, 189, 248, 0.4)' : '#E2E8F0',
                    transition: 'background-color 0.4s ease'
                  }} />
                )}

                {/* Node Status Indicator */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 2,
                  transition: 'all 0.3s ease',
                  backgroundColor: isCompleted 
                    ? '#10B981' 
                    : isCurrent 
                      ? '#090D16' 
                      : '#F1F5F9',
                  border: isCompleted 
                    ? '2px solid #10B981' 
                    : isCurrent 
                      ? '2px solid #38BDF8' 
                      : '2px solid #CBD5E1',
                  boxShadow: isCurrent ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'
                }}>
                  {isCompleted ? (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  ) : isCurrent ? (
                    <Loader2 className="animate-spin" size={14} color="#38BDF8" />
                  ) : (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
                  )}
                </div>

                {/* Step Details */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.84rem',
                    fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                    color: isCurrent ? '#090D16' : isCompleted ? '#334155' : '#94A3B8',
                    transition: 'color 0.2s ease'
                  }}>
                    <IconComp 
                      size={14} 
                      style={{ 
                        color: isCurrent ? '#0284C7' : isCompleted ? '#10B981' : '#94A3B8',
                        flexShrink: 0 
                      }} 
                    />
                    <span>{step.title[langKey] || step.title.en}</span>
                    {isCurrent && (
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#0284C7',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        marginLeft: '4px'
                      }}>
                        LIVE
                      </span>
                    )}
                  </div>

                  <p style={{
                    margin: '3px 0 0 0',
                    fontSize: '0.74rem',
                    color: isCurrent ? '#475569' : isCompleted ? '#64748B' : '#94A3B8',
                    lineHeight: 1.35
                  }}>
                    {step.detail[langKey] || step.detail.en}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
