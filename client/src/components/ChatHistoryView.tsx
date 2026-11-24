import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { MarkdownMessage } from './MarkdownMessage';
import { ConversationSummary, ConversationDetail } from '../types';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Send, 
  Bot, 
  User as UserIcon, 
  Clock, 
  Loader2, 
  Check,
  Search,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Database,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  FileText,
  X
} from 'lucide-react';
import { User, PatientCase } from '../types';
import { PatientIntakeWizard } from './PatientIntakeWizard';
import { formatDisplayPhone } from '../utils/phone';
import { useTranslation } from '../i18n/LanguageContext';

interface ChatHistoryViewProps {
  user?: User | null;
}

export const ChatHistoryView: React.FC<ChatHistoryViewProps> = ({ user }) => {
  const { t, language } = useTranslation();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedConvId, setCopiedConvId] = useState(false);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down'>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [mobileScreen, setMobileScreen] = useState<'list' | 'chat'>('list');
  const [patientCases, setPatientCases] = useState<PatientCase[]>([]);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeCase, setIntakeCase] = useState<PatientCase | null>(null);
  const [intakeStep, setIntakeStep] = useState<'prompt' | 'form'>('prompt');
  const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevConvIdRef = useRef<string | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!messagesContainerRef.current) return;
    const el = messagesContainerRef.current;
    el.scrollTo({
      top: el.scrollHeight,
      behavior
    });
  };

  const scrollToTop = () => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTo({
      top: 0,
      behavior: 'auto'
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileScreen('chat');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadConversations();
    loadPatientCases();
  }, []);

  const loadPatientCases = async () => {
    try {
      const res = await api.getPatientCases();
      if (res.success && res.cases) {
        setPatientCases(res.cases);
      } else {
        setPatientCases([]);
      }
    } catch (err) {
      console.error('Failed to load patient cases', err);
      setPatientCases([]);
    }
  };

  useEffect(() => {
    if (!activeConv) return;
    const isNewConversation = prevConvIdRef.current !== activeConv.id;
    prevConvIdRef.current = activeConv.id;

    if (isNewConversation) {
      // When opening or switching to a consultation:
      // If the consultation is newly created or has <= 2 messages (e.g. intake profile),
      // scroll to TOP so the patient clinical intake profile is completely readable without being cut off!
      if (activeConv.messages.length <= 2) {
        scrollToTop();
      } else {
        // Multi-turn consultation: scroll cleanly to latest messages without jarring animation
        scrollToBottom('auto');
      }
    } else {
      // Same consultation: a message was added or bot is responding
      const el = messagesContainerRef.current;
      if (el) {
        // Only auto-scroll if user is already near bottom (within 160px) or while sending
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
        if (isNearBottom || sending) {
          scrollToBottom('smooth');
        }
      }
    }
  }, [activeConv?.id, activeConv?.messages.length, sending]);

  const loadConversations = async () => {
    setLoadingList(true);
    try {
      const res = await api.getConversations();
      if (res.success && res.conversations) {
        setConversations(res.conversations);
        if (res.conversations.length > 0 && !activeConv) {
          selectConversation(res.conversations[0]!.id);
        } else if (res.conversations.length === 0) {
          setActiveConv(null);
        }
      } else {
        setConversations([]);
        setActiveConv(null);
      }
    } catch (err) {
      console.error('Failed to load conversation history', err);
      setConversations([]);
      setActiveConv(null);
    } finally {
      setLoadingList(false);
    }
  };

  const selectConversation = async (id: string) => {
    setLoadingChat(true);
    setMobileScreen('chat');
    try {
      const res = await api.getConversation(id);
      if (res.success && res.conversation) {
        setActiveConv(res.conversation);
      }
    } catch (err) {
      console.error('Error loading conversation', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleStartNewConsultation = async () => {
    try {
      const res = await api.getPatientCases();
      const cases = res.success && res.cases ? res.cases : [];
      setPatientCases(cases);
      if (cases.length > 0) {
        setIntakeCase(cases[0]);
        setIntakeStep('prompt');
      } else {
        setIntakeCase(null);
        setIntakeStep('form');
      }
      setShowIntakeModal(true);
    } catch (err) {
      setIntakeCase(null);
      setIntakeStep('form');
      setShowIntakeModal(true);
    }
  };

  const handleEditPatientHistory = () => {
    if (patientCases.length > 0) {
      setIntakeCase(patientCases[0]);
    } else {
      setIntakeCase(null);
    }
    setIntakeStep('form');
    setShowIntakeModal(true);
  };

  const startConsultationWithCase = async (pCase: PatientCase) => {
    setIsCreatingConsultation(true);
    try {
      const complaint = pCase.chiefComplaints?.[0]?.complaint || 'Electropathy Inquiry';
      const duration = pCase.chiefComplaints?.[0]?.duration ? ` (${pCase.chiefComplaints[0].duration})` : '';
      const title = `Consultation: ${pCase.patientName} - ${complaint}`;

      const initialMsg = `🩺 **Patient Clinical Intake Profile**:
• **Patient**: ${pCase.patientName} (${pCase.age} yrs, ${pCase.gender})
• **Contact**: +91 ${pCase.contactNumber} ${pCase.city ? `| City: ${pCase.city}` : ''}
• **Primary Chief Complaint**: ${complaint}${duration} (Severity: ${pCase.chiefComplaints?.[0]?.severity ?? 5}/10)
• **Aggravating/Relieving Factors**: ${pCase.chiefComplaints?.[0]?.factors || 'None noted'}
• **Present Illness Details**: ${pCase.presentIllness?.description || 'Initial clinical consultation'}
• **Previous Treatments**: ${pCase.presentIllness?.previousTreatments || 'None'}
• **Chronic Conditions / Medical History**: ${pCase.pastMedical?.chronicConditions?.join(', ') || 'None reported'}
• **Allergies**: ${pCase.pastMedical?.allergies?.join(', ') || 'No known drug allergies'}
• **Lifestyle & Vitals**: Diet: ${pCase.lifestyle?.diet || 'Vegetarian'}, Sleep: ${pCase.lifestyle?.sleep || 'Normal'}, Appetite: ${pCase.lifestyle?.appetite || 'Good'}
• **Constitutional Temperament**: ${pCase.electropathyDetails?.temperament || 'Lymphatic'}
${pCase.electropathyDetails?.notes ? `• **Clinical Impressions**: ${pCase.electropathyDetails.notes}` : ''}

*Please analyze this clinical presentation according to Count Cesare Mattei's principles of Electropathy and formulate an individualized remedy, dilution, and dosage protocol.*`;

      const res = await api.createConversation({
        title: title.slice(0, 50),
        initialMessage: initialMsg
      });

      if (res.success && res.conversation) {
        const newId = res.conversation.id;
        setShowIntakeModal(false);
        await loadConversations();
        await selectConversation(newId);
        setMobileScreen('chat');

        // Query real backend AI consultation grounded with Gemini & Doctor's dataset
        try {
          const chatRes = await api.sendPatientChatMessage(newId, initialMsg, language || user?.preferredLang || 'en');
          if (chatRes.success && chatRes.assistantMessage) {
            setActiveConv(prev => prev && prev.id === newId ? {
              ...prev,
              messages: [...prev.messages, chatRes.assistantMessage]
            } : null);
            loadConversations();
          }
        } catch (chatErr) {
          console.error('Failed to get consultation reply from backend AI', chatErr);
        }
      } else {
        alert(res.message || 'Error creating consultation.');
      }
    } catch (err) {
      alert('Error starting new consultation.');
    } finally {
      setIsCreatingConsultation(false);
    }
  };

  const generateElectropathyResponse = (query: string): string => {
    const lower = query.toLowerCase();
    
    if (lower.includes('lymph') || lower.includes('gland') || lower.includes('tonsil') || lower.includes('adenoid')) {
      return `### 🌿 Electropathy Clinical Protocol: Lymphatic System Regulation

**Primary Complex Prescribed**:
• **Scrofoloso-1 (S1)**: Acts systematically on the entire lymphatic matrix and glandular tissues.
• **Lymphatico-1 (L1)**: Specific for lymphatic stasis, swollen lymph nodes, and venous congestion.

**Recommended Dilution & Dosing**:
• **Acute Congestion**: 2nd Dilution (D2), 5 drops in 1/2 cup warm water every 2 hours.
• **Sub-acute / Maintenance**: 3rd Dilution (D3), 10 drops before meals (3 times daily).

**External Polarity Applications**:
• **Negative Electricity (NE)**: Light compress applied over swollen cervical or axillary nodal points for 10 minutes.
• **Temperament Precaution**: If patient exhibits Lymphatic-Sanguine temperament, combine with **Angioitico-1 (A1)** to regulate capillary circulation.`;
    }

    if (lower.includes('skin') || lower.includes('eczema') || lower.includes('psoriasis') || lower.includes('itch') || lower.includes('allergy')) {
      return `### 🩺 Electropathy Clinical Protocol: Dermatological & Blood Purification

**Primary Complex Prescribed**:
• **Scrofoloso-5 (S5)**: Specific tissue affinity for epithelial, epidermal, and deeper cutaneous layers.
• **Canceroso-5 (C5)**: Indicated for cellular degeneration, crusting, and chronic dermatological eruptions.
• **Vermifugo-1 (Ver1)**: Administer if intestinal dysbiosis or parasitic irritation contributes to skin reactivity.

**Recommended Dilution & Dosing**:
• **1st Dilution (D1) or 2nd Dilution (D2)**: 8 drops taken 4 times daily in sip doses.
• **Constitutional Balance**: 1 dose of **S1** at sunrise to activate lymphatic drainage.

**External Compress Protocol**:
• Mild dilution of **Green Electricity (GE)** or **A2 lotion** locally over unbroken lesions to soothe inflammation.`;
    }

    if (lower.includes('fever') || lower.includes('temperature') || lower.includes('chill') || lower.includes('inflammation')) {
      return `### ⚡ Electropathy Clinical Protocol: Pyrexia & Thermal Regulation

**Primary Complex Prescribed**:
• **Febrifugo-1 (F1)**: Directly regulates the sympathetic vasomotor centers controlling body temperature.
• **Angioitico-2 (A2)**: Controls arterial congestion and high pulse rate associated with inflammatory fever.

**Recommended Dilution & Dosing**:
• **Hyperpyrexia Phase**: 3rd Dilution (D3) to 4th Dilution (D4), 5 drops administered every 15–30 minutes until sweating occurs.
• **Post-Febrile Convalescence**: Transition to **S1** + **A1** in 2nd dilution twice daily.

**Point Stimulation**:
• Apply **Red Electricity (RE)** or warm compress to forehead and nape of the neck (atlas point) to induce defervescence.`;
    }

    if (lower.includes('cough') || lower.includes('breath') || lower.includes('bronch') || lower.includes('lung') || lower.includes('asthma')) {
      return `### 🫁 Electropathy Clinical Protocol: Respiratory & Bronchial Support

**Primary Complex Prescribed**:
• **Pettorale-1 (P1)**: Specific for broncho-pulmonary mucous membranes, spasmodic cough, and airway irritation.
• **Scrofoloso-1 (S1)**: Glandular cleanser to clear mucus accumulation.
• **Canceroso-1 (C1)**: Restores tissue tone in chronic catarrhal states.

**Recommended Dilution & Dosing**:
• **Dry / Spasmodic Cough**: 2nd Dilution (D2), 5 drops in warm water sipped slowly every hour.
• **Loose Productive Cough**: 1st Dilution (D1) to facilitate expectoration.

**External Compress Protocol**:
• Apply warm compress soaked in **P1** + **Blue Electricity (BE)** across the sternum and interscapular region.`;
    }

    if (lower.includes('digest') || lower.includes('liver') || lower.includes('gastric') || lower.includes('acid') || lower.includes('constipation')) {
      return `### 🍃 Electropathy Clinical Protocol: Hepato-Gastric & Metabolic Balance

**Primary Complex Prescribed**:
• **Scrofoloso-2 (S2)**: Primary remedy for gastric acidity, pyloric spasm, and dyspepsia.
• **Febrifugo-2 (F2)** or **S5**: Potent regulator of hepatic parenchyma and bile secretion.
• **Lassativo (SL)**: Gentle electropathic bowel peristalsis promoter.

**Recommended Dilution & Dosing**:
• Take **S2** in 2nd Dilution immediately after meals.
• Administer **F2** 15 minutes before lunch and dinner.
• Evening dose: 10 drops of **SL** in lukewarm water before bedtime.`;
    }

    return `### 📋 Electropathy Clinical Evaluation & Decision Support

**Query Analyzed**: "${query}"

**1. Constitutional Temperament Assessment**:
• Assess the patient's dominant constitution: **Lymphatic** (pale, sluggish, glandular), **Sanguine** (plethoric, flushed, active vascular), or **Mixed/Bilious**.
• Mattei's First Principle: Equalize the two vital fluids (**Blood** via *Angioitico* and **Lymph** via *Scrofoloso*).

**2. Core Remedy Recommendation**:
• **Base Tonic**: **Scrofoloso-1 (S1)** to initiate general lymph clearing and metabolic receptivity.
• **Organ-Specific Synergist**: Pair with **Canceroso (C1/C5)** for cellular regeneration or **Febrifugo (F1)** for autonomic regulation.

**3. Dilution Strategy**:
• **Acute / Sthenic Manifestations**: Negative potency (3rd Dilution / D3) in frequent sip intervals.
• **Chronic / Asthenic States**: Positive potency (1st or 2nd Dilution / D1-D2) to stimulate organ reaction.

**4. External Fluid Point Application**:
• Determine polarity (Positive vs Negative) along spinal nerve exits corresponding to the affected organ dermatome.`;
  };

  const executeSend = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;

    const userText = textToSend.trim();
    setInputText('');
    setSending(true);

    try {
      let convId = activeConv?.id;

      // If no active conversation, initialize consultation atomically with backend AI
      if (!convId) {
        const initRes = await api.initPatientChat(userText, language || user?.preferredLang || 'en');
        if (initRes.success && initRes.conversation) {
          await loadConversations();
          await selectConversation(initRes.conversation.id);
        } else {
          alert(initRes.message || 'Failed to initialize consultation.');
        }
      } else {
        // Optimistically render user message while AI processes
        const tempMsg = {
          id: `temp-${Date.now()}`,
          conversationId: convId,
          role: 'user',
          content: userText,
          createdAt: new Date().toISOString()
        };
        setActiveConv(prev => prev ? {
          ...prev,
          messages: [...prev.messages, tempMsg as any]
        } : null);

        // Call backend patient consultation endpoint (Gemini + Doctor Dataset + PostgreSQL live facts)
        const chatRes = await api.sendPatientChatMessage(convId, userText, language || user?.preferredLang || 'en');
        if (chatRes.success) {
          await selectConversation(convId);
          loadConversations();
        } else {
          alert(chatRes.message || 'Failed to get clinical response.');
        }
      }
    } catch (err: any) {
      console.error('[CHAT ERROR]', err);
      alert('Failed to send consultation message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    executeSend(inputText);
  };

  const handlePromptClick = (promptText: string) => {
    setInputText(promptText);
    executeSend(promptText);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this consultation history?')) return;

    try {
      const res = await api.deleteConversation(id);
      if (res.success) {
        if (activeConv?.id === id) {
          setActiveConv(null);
        }
        await loadConversations();
      }
    } catch (err) {
      alert('Failed to delete conversation.');
    }
  };

  const handleSaveTitle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitleText.trim()) return;

    try {
      const res = await api.updateConversationTitle(id, editTitleText.trim());
      if (res.success) {
        setEditingTitleId(null);
        if (activeConv?.id === id) {
          setActiveConv(prev => prev ? { ...prev, title: editTitleText.trim() } : null);
        }
        await loadConversations();
      }
    } catch (err) {
      alert('Could not update title.');
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyConvId = () => {
    if (!activeConv) return;
    navigator.clipboard.writeText(activeConv.id);
    setCopiedConvId(true);
    setTimeout(() => setCopiedConvId(false), 2000);
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="chat-view-container medical-glass-card"
      style={{
        width: '100%',
        maxWidth: '1360px',
        margin: '0 auto',
        borderRadius: '24px',
        border: '1px solid rgba(186, 230, 253, 0.5)',
        boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.08), 0 0 25px rgba(56, 189, 248, 0.1)',
        height: '100%',
        minHeight: 0,
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}
    >
      {/* ======================================================== */}
      {/* LEFT SIDEBAR: CONSULTATION DIRECTORY & SEARCH            */}
      {/* ======================================================== */}
      <div style={{
        width: isMobile ? '100%' : '330px',
        borderRight: isMobile ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
        backgroundColor: 'rgba(248, 250, 252, 0.7)',
        backdropFilter: 'blur(16px)',
        display: (!isMobile || mobileScreen === 'list') ? 'flex' : 'none',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Sidebar Header */}
        <div style={{ flexShrink: 0, padding: '16px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <button
            onClick={handleStartNewConsultation}
            className="medical-pill-btn"
            style={{
              width: '100%',
              padding: '11px 18px',
              fontSize: '0.86rem',
              fontWeight: 800,
              color: '#FFFFFF',
              backgroundColor: '#090D16',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(9, 13, 22, 0.25)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#0F172A';
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(2, 132, 199, 0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#090D16';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(9, 13, 22, 0.25)';
            }}
          >
            <Plus size={16} color="#38BDF8" />
            <span>New Consultation ↗</span>
          </button>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginTop: '12px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search past consultations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: '0.8rem',
                borderRadius: '999px',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: '#0F172A',
                outline: 'none',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(8px)'
              }}
              onFocus={e => {
                e.target.style.borderColor = '#0284C7';
                e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(203, 213, 225, 0.8)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Directory Count Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.7rem', color: '#64748B' }}>
            <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Consultation History</span>
            <span style={{ backgroundColor: 'rgba(226, 232, 240, 0.7)', color: '#334155', padding: '1px 8px', borderRadius: '999px', fontWeight: 700 }}>
              {conversations.length}
            </span>
          </div>
        </div>

        {/* Consultation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
          {loadingList ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
              <Loader2 className="animate-spin" size={20} style={{ margin: '0 auto 8px', color: '#00A896' }} />
              <div>Querying saved clinical chats...</div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748B' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 10px', color: '#CBD5E1' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                {searchQuery ? 'No matching consultations' : 'No history yet'}
              </div>
              <div style={{ fontSize: '0.74rem', marginTop: '4px', lineHeight: 1.4 }}>
                {searchQuery ? 'Try another keyword or remedy name' : 'Start your first consultation to build your record'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredConversations.map((c) => {
                const isActive = activeConv?.id === c.id;
                const isEditing = editingTitleId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className="consultation-card"
                    style={{
                      padding: '12px 14px',
                      borderRadius: '14px',
                      backgroundColor: isActive ? 'rgba(235, 248, 255, 0.95)' : 'rgba(255, 255, 255, 0.75)',
                      border: isActive ? '1.5px solid #0284C7' : '1px solid rgba(226, 232, 240, 0.8)',
                      boxShadow: isActive ? '0 4px 12px rgba(2, 132, 199, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      position: 'relative',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '4px', width: '100%' }} onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitleText}
                            onChange={(e) => setEditTitleText(e.target.value)}
                            style={{
                              flex: 1,
                              fontSize: '0.8rem',
                              padding: '3px 6px',
                              borderRadius: '4px',
                              border: '1px solid #0F4C81',
                              outline: 'none'
                            }}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(c.id, e as any)}
                          />
                          <button
                            onClick={(e) => handleSaveTitle(c.id, e)}
                            style={{ background: '#0F4C81', color: '#FFF', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
                          >
                            <Check size={13} />
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '0.84rem',
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? '#0369A1' : '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1
                        }}>
                          {c.title}
                        </div>
                      )}

                      {!isEditing && (
                        <div style={{ display: 'flex', gap: '2px', opacity: isActive ? 1 : 0.7 }} className="card-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTitleId(c.id);
                              setEditTitleText(c.title);
                            }}
                            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '3px', borderRadius: '4px' }}
                            title="Rename topic"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(c.id, e)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '3px', borderRadius: '4px' }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} color="#94A3B8" /> {new Date(c.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '999px',
                        backgroundColor: isActive ? '#BAE6FD' : '#F1F5F9',
                        color: isActive ? '#0369A1' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.66rem'
                      }}>
                        {c.messageCount} msg{c.messageCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer: Cloud Sync Status */}
        <div style={{
          flexShrink: 0,
          padding: '10px 14px',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#64748B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <span>PostgreSQL Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00A896', fontWeight: 600 }}>
            <ShieldCheck size={13} />
            <span>Encrypted</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT MAIN PANEL: ACTIVE CONSULTATION WORKSPACE          */}
      {/* ======================================================== */}
      <div style={{ 
        flex: 1, 
        minHeight: 0,
        height: '100%',
        display: (!isMobile || mobileScreen === 'chat') ? 'flex' : 'none', 
        flexDirection: 'column', 
        backgroundColor: '#FFFFFF', 
        minWidth: 0,
        overflow: 'hidden'
      }}>
        {/* Chat Header Bar */}
        <div style={{
          flexShrink: 0,
          padding: isMobile ? '12px 14px' : '14px 24px',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileScreen('list')}
                className="medical-pill-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #CBD5E1',
                  borderRadius: '999px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <ArrowLeft size={14} />
                <span>List</span>
              </button>
            )}

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isMobile ? '200px' : '520px',
                  letterSpacing: '-0.02em'
                }}>
                  {activeConv ? activeConv.title : 'Electropathy AI Consultation'}
                </h2>
                {activeConv && (
                  <span style={{
                    display: isMobile ? 'none' : 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#059669',
                    borderRadius: '999px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulseGlow 2s infinite' }} />
                    Active Session
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                <span className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284C7', fontWeight: 700 }}>
                  <Database size={12} />
                  <span>PostgreSQL Cloud Sync</span>
                </span>
                <span className="hide-on-mobile">•</span>
                <span>{activeConv ? `${activeConv.messages.length} Messages` : 'Private Session'}</span>
                {user && (
                  <>
                    <span className="hide-on-mobile">•</span>
                    <span className="hide-on-mobile" style={{ color: '#0F172A', fontWeight: 600 }}>
                      ID: {formatDisplayPhone(user.mobileNumber)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {activeConv && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleEditPatientHistory}
                className="medical-pill-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  backgroundColor: '#090D16',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '999px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
                title="View / Edit Clinical History"
              >
                <FileText size={13} color="#38BDF8" />
                <span>Patient History ↗</span>
              </button>
              <button
                onClick={handleCopyConvId}
                className="medical-pill-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #CBD5E1',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                title="Copy Consultation ID"
              >
                {copiedConvId ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                <span>ID: {activeConv.id.slice(0, 8)}</span>
              </button>
            </div>
          )}
        </div>

        {/* Message Thread Container */}
        <div 
          ref={messagesContainerRef}
          className="custom-scrollbar"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: isMobile ? '12px 12px 20px' : '18px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#FAFCFD'
          }}
        >
          {loadingChat ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
              <Loader2 className="animate-spin" size={26} style={{ margin: '0 auto 10px', color: '#0F4C81' }} />
              <div style={{ fontWeight: 600 }}>Retrieving consultation record from database...</div>
            </div>
          ) : !activeConv || activeConv.messages.length === 0 ? (
            /* Empty State: Inspired by High-Tech Medical Editorial UI */
            <div style={{
              margin: 'auto',
              maxWidth: '780px',
              width: '100%',
              padding: '24px 16px',
              textAlign: 'center'
            }}>
              {/* Top Editorial Eyebrow */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 14px',
                backgroundColor: 'rgba(235, 248, 255, 0.9)',
                border: '1px solid rgba(186, 230, 253, 0.8)',
                borderRadius: '999px',
                color: '#0284C7',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '14px'
              }}>
                <Sparkles size={13} color="#0284C7" />
                <span>Next Era Of Medical Advancements</span>
              </div>

              <h2 style={{
                fontSize: isMobile ? '1.5rem' : '2.1rem',
                fontWeight: 900,
                color: '#090D16',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '10px'
              }}>
                PRECISION TAILORING FOR <br />
                <span style={{ color: '#0284C7' }}>OPTIMAL HEALING</span>
              </h2>

              <p style={{
                fontSize: '0.86rem',
                color: '#475569',
                lineHeight: 1.5,
                maxWidth: '560px',
                margin: '0 auto 20px'
              }}>
                Explore Count Cesare Mattei’s complex pharmacopoeia, constitutional temperaments (Lymphatic, Sanguine, Mixed), and verified State–Organ convergence protocols.
              </p>

              {/* Signature Obsidian Feature Card with Action Badges */}
              <div
                className="medical-dark-feature-card"
                style={{
                  padding: '24px 22px',
                  borderRadius: '20px',
                  textAlign: 'left',
                  marginBottom: '22px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Activity size={18} color="#00F2FE" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Clinical Intelligence System
                    </span>
                  </div>
                  <h3 style={{
                    color: '#FFFFFF',
                    fontSize: isMobile ? '1.15rem' : '1.35rem',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    marginBottom: '8px',
                    lineHeight: 1.2
                  }}>
                    ARE YOU READY TO EXPLORE CLINICAL ELECTROPATHY?
                  </h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.8rem', lineHeight: 1.45, maxWidth: '580px', marginBottom: '16px' }}>
                    Access 98 documented remedies across 12 Mattei groups, D1–D3 vs D6–D30 dilution selection, and real-time contraindication screening.
                  </p>

                  {/* Action Badges with ↗ */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleStartNewConsultation}
                      className="medical-pill-cyan"
                      style={{
                        padding: '8px 18px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={14} />
                      <span>Start New Case Intake ↗</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromptClick('What is the recommended S1 / L1 protocol for acute lymphatic congestion?')}
                      style={{
                        padding: '7px 14px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#F8FAFC',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Lymphatic S1/L1 Protocol ↗</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromptClick('Explain the dilution rules for acute inflammatory states vs degenerative conditions.')}
                      style={{
                        padding: '7px 14px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#F8FAFC',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Dilution Rules (D1–D30) ↗</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Interactive Starter Prompt Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
                gap: '12px', 
                textAlign: 'left' 
              }}>
                <div
                  className="quick-starter-card"
                  onClick={() => handlePromptClick('What is the recommended S1 / L1 protocol for acute lymphatic congestion?')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>🌿</span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#090D16' }}>Lymphatic Congestion</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 700 }}>↗</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>
                    Evaluate Scrofoloso-1 and Lymphatico-1 dilution protocols for glandular swelling.
                  </div>
                </div>

                <div
                  className="quick-starter-card"
                  onClick={() => handlePromptClick('How to evaluate Lymphatic vs Sanguine temperament for chronic skin eruptions?')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>🩺</span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#090D16' }}>Temperament Assessment</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 700 }}>↗</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>
                    Differentiate constitution traits to select between S5, C5, and Ver1 remedies.
                  </div>
                </div>

                <div
                  className="quick-starter-card"
                  onClick={() => handlePromptClick('What is the Febrifugo-1 (F1) and A2 protocol for acute fever?')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>⚡</span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#090D16' }}>Fever & Inflammation</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 700 }}>↗</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>
                    Review thermal vasomotor regulation and frequent sip dosing in pyrexia.
                  </div>
                </div>

                <div
                  className="quick-starter-card"
                  onClick={() => handlePromptClick('Explain the dilution rules for acute inflammatory states vs degenerative conditions.')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>💧</span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#090D16' }}>Dilution Matrix (D1–D6)</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 700 }}>↗</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>
                    Negative potency guidelines for hyper-reactivity vs positive stimulating doses.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Render Message List */
            activeConv.messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: isUser ? '75%' : '84%'
                  }}
                >
                  {/* Bot Avatar */}
                  {!isUser && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0F4C81 0%, #00A896 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 3px 8px rgba(0, 168, 150, 0.2)',
                      marginTop: '2px'
                    }}>
                      <Bot size={20} />
                    </div>
                  )}

                  {/* Message Bubble Card */}
                  <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-bot'} style={{ padding: '14px 18px', width: '100%' }}>
                    {/* Bot Message Header */}
                    {!isUser && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '8px',
                        marginBottom: '10px',
                        borderBottom: '1px solid #F1F5F9'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0F172A' }}>
                            Electropathy AI Assistant
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: '#EBF3FA',
                            color: '#0284C7',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 700
                          }}>
                            <ShieldCheck size={11} />
                            Dr. Wandhare Dataset
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {/* Message Body with Clean Markdown Formatting */}
                    <MarkdownMessage content={m.content} isUser={isUser} />

                    {/* Footer for User Message */}
                    {isUser && (
                      <div style={{
                        fontSize: '0.68rem',
                        color: 'rgba(255, 255, 255, 0.75)',
                        marginTop: '6px',
                        textAlign: 'right'
                      }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}

                    {/* Bot Message Actions (Copy, Helpful Feedback, Verified Tag) */}
                    {!isUser && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '12px',
                        paddingTop: '8px',
                        borderTop: '1px solid #F8FAFC'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleCopyText(m.id, m.content)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              color: '#64748B',
                              cursor: 'pointer'
                            }}
                          >
                            {copiedId === m.id ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                            <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={() => setFeedbackState(prev => ({ ...prev, [m.id]: 'up' }))}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '3px 6px',
                              backgroundColor: feedbackState[m.id] === 'up' ? '#DEF7EC' : '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              color: feedbackState[m.id] === 'up' ? '#059669' : '#64748B',
                              cursor: 'pointer'
                            }}
                            title="Helpful"
                          >
                            <ThumbsUp size={12} />
                          </button>

                          <button
                            onClick={() => setFeedbackState(prev => ({ ...prev, [m.id]: 'down' }))}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '3px 6px',
                              backgroundColor: feedbackState[m.id] === 'down' ? '#FEE2E2' : '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              color: feedbackState[m.id] === 'down' ? '#DC2626' : '#64748B',
                              cursor: 'pointer'
                            }}
                            title="Not helpful"
                          >
                            <ThumbsDown size={12} />
                          </button>
                        </div>

                        <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                          Mattei Polarity Verified
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#0F4C81',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 3px 8px rgba(15, 76, 129, 0.2)',
                      marginTop: '2px'
                    }}>
                      <UserIcon size={18} />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Sending Indicator */}
          {sending && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', maxWidth: '80%' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0F4C81 0%, #00A896 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={20} />
              </div>
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '12px 18px',
                borderRadius: '16px 16px 16px 4px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#64748B',
                fontSize: '0.84rem'
              }}>
                <Loader2 className="animate-spin" size={16} color="#00A896" />
                <span>{language === 'hi' ? 'इलेक्ट्रोपैथी उपाय प्रोटोकॉल तैयार किया जा रहा है...' : language === 'mr' ? 'इलेक्ट्रोपॅथी औषध योजना तयार करत आहे...' : 'Formulating Electropathy remedy protocol...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} style={{ height: '4px', flexShrink: 0 }} />
        </div>

        {/* Input Console Area */}
        <div style={{
          flexShrink: 0,
          padding: isMobile ? '10px 12px 14px' : '14px 24px 18px',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)'
        }}>
          {/* Quick Consultation Chips Row */}
          <div 
            className="hide-scrollbar"
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '10px',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {(language === 'hi' ? [
              { icon: '🌿', title: 'लसीका S1/L1', query: 'लसीका संकुलन के लिए प्रोटोकॉल (S1, L1, NE)' },
              { icon: '⚡', title: 'बुखार (F1 + A2)', query: 'बुखार प्रोटोकॉल: फेब्रिफ्यूगो-1 (F1) और एंजियोइटिको-2 (A2)' },
              { icon: '💧', title: 'डायल्यूशन मैट्रिक्स D1-D30', query: 'तीव्र बनाम पुरानी स्थितियों के लिए डायल्यूशन नियम' },
              { icon: '🫁', title: 'खांसी प्रोटोकॉल (P1)', query: 'ब्रोंकियल और ऐंठन वाली खांसी के लिए पेटोरेल-1 (P1) प्रोटोकॉल' }
            ] : language === 'mr' ? [
              { icon: '🌿', title: 'लसिका S1/L1', query: 'लसिका संकुलनासाठी प्रोटोकॉल (S1, L1, NE)' },
              { icon: '⚡', title: 'ताप (F1 + A2)', query: 'ताप प्रोटोकॉल: फेब्रिफ्युगो-१ (F1) आणि अँजियोइटिको-२ (A2)' },
              { icon: '💧', title: 'डायल्यूशन मॅट्रिक्स D1-D30', query: 'तीव्र विरूद्ध जुनाट आजारांसाठी डायल्यूशन नियम' },
              { icon: '🫁', title: 'खोकला (P1)', query: 'खोकल्यासाठी पेटोरेल-१ (P1) प्रोटोकॉल' }
            ] : [
              { icon: '🌿', title: 'Lymphatic S1/L1', query: 'Protocol for Lymphatic Congestion (S1, L1, NE)' },
              { icon: '🩺', title: 'Temperament Assessment', query: 'How to assess Lymphatic vs Sanguine Temperament?' },
              { icon: '⚡', title: 'Fever (F1 + A2)', query: 'Fever Protocol: Febrifugo-1 (F1) and Angioitico-2 (A2)' },
              { icon: '💧', title: 'Dilution Matrix D1-D30', query: 'Dilution Matrix rules for acute vs chronic conditions' },
              { icon: '🫁', title: 'Bronchial Cough (P1)', query: 'Pettorale-1 (P1) protocol for bronchial and spasmodic cough' }
            ]).map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="medical-pill-btn"
                onClick={() => handlePromptClick(chip.query)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  backgroundColor: 'rgba(248, 250, 252, 0.95)',
                  border: '1px solid rgba(203, 213, 225, 0.8)',
                  borderRadius: '999px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#090D16';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#090D16';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.95)';
                  e.currentTarget.style.color = '#334155';
                  e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)';
                }}
              >
                <span>{chip.icon}</span>
                <span>{chip.title}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>↗</span>
              </button>
            ))}
          </div>

          {/* Input Form Bar (Floating Capsule) */}
          <form
            onSubmit={handleSendMessage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1.5px solid rgba(186, 230, 253, 0.8)',
              borderRadius: '999px',
              padding: '6px 8px 6px 18px',
              boxShadow: '0 4px 16px rgba(14, 165, 233, 0.08)',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={t.chat.placeholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sending}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.9rem',
                color: '#0F172A',
                fontWeight: 500
              }}
            />

            <span style={{ fontSize: '0.7rem', color: '#94A3B8', paddingRight: '4px', fontWeight: 600 }}>
              ↵ Enter
            </span>

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="medical-pill-cyan"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !inputText.trim() || sending ? 'not-allowed' : 'pointer',
                opacity: !inputText.trim() || sending ? 0.5 : 1,
                border: 'none',
                flexShrink: 0,
                boxShadow: !inputText.trim() || sending ? 'none' : '0 2px 10px rgba(0, 242, 254, 0.3)'
              }}
            >
              {sending ? <Loader2 className="animate-spin" size={17} color="#090D16" /> : <Send size={16} color="#090D16" />}
            </button>
          </form>

          {/* Integrated Slim Medical Disclaimer */}
          <div style={{
            marginTop: '6px',
            textAlign: 'center',
            fontSize: '0.68rem',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={12} color="#00A896" />
            <span>Electropathy AI Clinical Decision Support grounded in Dr. Ashish Wandhare's dataset • Final medical judgment resides with licensed practitioners</span>
          </div>
        </div>
      </div>

      {/* Consultation Intake / Patient History Modal */}
      {showIntakeModal && (
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
            maxWidth: intakeStep === 'prompt' ? '580px' : '900px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            border: '1px solid #E2E8F0'
          }}>
            {intakeStep === 'prompt' ? (
              <div>
                {/* Header */}
                <div style={{
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, #0F4C81 0%, #00A896 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Sparkles size={22} color="#FFFFFF" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                        Start New Consultation
                      </h3>
                      <p style={{ fontSize: '0.82rem', margin: '2px 0 0', color: '#E0F2FE' }}>
                        Select patient case grounding for decision support
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowIntakeModal(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: 'none',
                      color: '#FFFFFF',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {intakeCase && (
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '16px 18px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0F4C81' }}>
                            Existing Patient History
                          </span>
                          <span style={{ backgroundColor: '#DEF7EC', color: '#059669', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                            On File
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {new Date(intakeCase.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                        {intakeCase.patientName} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>({intakeCase.age} yrs, {intakeCase.gender})</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#334155', marginTop: '4px' }}>
                        <strong>Chief Complaint:</strong> {intakeCase.chiefComplaints?.[0]?.complaint || 'General Checkup'}
                        {intakeCase.chiefComplaints?.[0]?.duration ? ` (${intakeCase.chiefComplaints[0].duration})` : ''}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '3px' }}>
                        <strong>Constitution:</strong> {intakeCase.electropathyDetails?.temperament || 'Lymphatic'}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {intakeCase && (
                      <button
                        onClick={() => setIntakeStep('form')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          border: '1.5px solid #00A896',
                          backgroundColor: '#F0FDFA',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: '#00A896',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Edit3 size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                              Edit & Update Patient History
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#0F766E', marginTop: '2px' }}>
                              Update symptoms, illness duration, severity, or remedies before consulting
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={18} color="#00A896" />
                      </button>
                    )}

                    {intakeCase && (
                      <button
                        onClick={() => startConsultationWithCase(intakeCase)}
                        disabled={isCreatingConsultation}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          border: '1.5px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: '#0F4C81',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Zap size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                              Consult with Current History Directly
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                              Start new session immediately using saved profile without modifications
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={18} color="#0F4C81" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIntakeCase(null);
                        setIntakeStep('form');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1.5px dashed #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: '#F1F5F9',
                          color: '#0F4C81',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Plus size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                            Add New / Different Patient Record
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                            Record a fresh clinical intake for a new symptom episode or family member
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={18} color="#64748B" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <PatientIntakeWizard
                  initialCase={intakeCase}
                  currentUser={user}
                  onCancel={() => setShowIntakeModal(false)}
                  onCaseSubmitted={async (savedCase) => {
                    await loadPatientCases();
                    await startConsultationWithCase(savedCase);
                  }}
                  title={intakeCase ? "Edit Patient Clinical History" : "New Patient Clinical Intake"}
                  submitButtonText={intakeCase ? "Save & Start Consultation" : "Record Intake & Start Consultation"}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
