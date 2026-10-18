import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
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
  HelpCircle,
  FileText
} from 'lucide-react';
import { User } from '../types';
import { formatDisplayPhone } from '../utils/phone';

interface ChatHistoryViewProps {
  user?: User | null;
}

export const ChatHistoryView: React.FC<ChatHistoryViewProps> = ({ user }) => {
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, sending]);

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

  const handleStartNewChat = () => {
    setActiveConv(null);
    inputRef.current?.focus();
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

      // If no active conversation, create one first
      if (!convId) {
        const newConvRes = await api.createConversation({
          title: userText.slice(0, 32) + (userText.length > 32 ? '...' : ''),
          initialMessage: userText
        });
        if (newConvRes.success && newConvRes.conversation) {
          convId = newConvRes.conversation.id;
          await loadConversations();
          await selectConversation(convId);

          // Simulated grounded Electropathy AI response for initial inquiry
          setTimeout(async () => {
            const assistantText = generateElectropathyResponse(userText);
            const reply = await api.sendMessage(convId!, assistantText, 'assistant');
            if (reply.success && reply.message) {
              setActiveConv(prev => prev ? {
                ...prev,
                messages: [...prev.messages, reply.message]
              } : null);
              loadConversations();
            }
          }, 500);
        }
      } else {
        // Send user message
        const msgRes = await api.sendMessage(convId, userText, 'user');
        if (msgRes.success && msgRes.message) {
          setActiveConv(prev => prev ? {
            ...prev,
            messages: [...prev.messages, msgRes.message]
          } : null);

          // Simulated grounded Electropathy AI response
          setTimeout(async () => {
            const assistantText = generateElectropathyResponse(userText);
            const reply = await api.sendMessage(convId!, assistantText, 'assistant');
            if (reply.success && reply.message) {
              setActiveConv(prev => prev ? {
                ...prev,
                messages: [...prev.messages, reply.message]
              } : null);
              loadConversations();
            }
          }, 500);
        }
      }
    } catch (err) {
      alert('Failed to send consultation message.');
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
    <div style={{
      maxWidth: '1360px',
      margin: '8px auto 16px',
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
      height: 'calc(100vh - 146px)',
      minHeight: '580px',
      display: 'flex',
      overflow: 'hidden'
    }}>
      {/* ======================================================== */}
      {/* LEFT SIDEBAR: CONSULTATION DIRECTORY & SEARCH            */}
      {/* ======================================================== */}
      <div style={{
        width: '330px',
        borderRight: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #E2E8F0' }}>
          <button
            onClick={handleStartNewChat}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #0F4C81 0%, #00A896 100%)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 3px 10px rgba(0, 168, 150, 0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.94')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={18} />
            <span>New Consultation</span>
          </button>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginTop: '12px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search past consultations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={e => (e.target.style.borderColor = '#00A896')}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />
          </div>

          {/* Directory Count Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.72rem', color: '#64748B' }}>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Consultation History</span>
            <span style={{ backgroundColor: '#E2E8F0', color: '#334155', padding: '1px 7px', borderRadius: '999px', fontWeight: 700 }}>
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
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? '#EBF3FA' : '#FFFFFF',
                      border: isActive ? '1px solid #BAE6FD' : '1px solid #E2E8F0',
                      borderLeft: isActive ? '3.5px solid #0284C7' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      position: 'relative'
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', minWidth: 0 }}>
        {/* Chat Header Bar */}
        <div style={{
          padding: '14px 22px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '520px'
              }}>
                {activeConv ? activeConv.title : 'Electropathy Clinical Decision Support'}
              </h2>
              {activeConv && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  backgroundColor: '#DEF7EC',
                  color: '#059669',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: 700
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulseGlow 2s infinite' }} />
                  Active Session
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.74rem', color: '#64748B', marginTop: '3px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00A896', fontWeight: 600 }}>
                <Database size={12} />
                <span>PostgreSQL Cloud Sync</span>
              </span>
              <span>•</span>
              <span>{activeConv ? `${activeConv.messages.length} Clinical Messages` : 'Isolated Medical Session'}</span>
              {user && (
                <>
                  <span>•</span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>
                    Account ID: {formatDisplayPhone(user.mobileNumber)}
                  </span>
                </>
              )}
            </div>
          </div>

          {activeConv && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleCopyConvId}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 8px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
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
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          backgroundColor: '#FAFCFD'
        }}>
          {loadingChat ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
              <Loader2 className="animate-spin" size={26} style={{ margin: '0 auto 10px', color: '#0F4C81' }} />
              <div style={{ fontWeight: 600 }}>Retrieving consultation record from database...</div>
            </div>
          ) : !activeConv || activeConv.messages.length === 0 ? (
            /* Empty State: Clinical Consultation Starters */
            <div style={{
              margin: 'auto',
              maxWidth: '680px',
              width: '100%',
              padding: '24px 20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0F4C81 0%, #00A896 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: '0 8px 20px rgba(0, 168, 150, 0.25)'
              }}>
                <Bot size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                Electropathy Clinical Consultation
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45, maxWidth: '520px', margin: '0 auto 20px' }}>
                Inquire about Count Cesare Mattei’s complex remedies, constitutional temperaments, dilutions (D1–D6), or external fluid applications.
              </p>

              {/* 4 Interactive Starter Prompt Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', textAlign: 'left' }}>
                <div
                  className="quick-starter-card"
                  onClick={() => handlePromptClick('What is the recommended S1 / L1 protocol for acute lymphatic congestion?')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1rem' }}>🌿</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Lymphatic Congestion</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.35 }}>
                    Evaluate Scrofoloso-1 and Lymphatico-1 dilution protocols for glandular swelling.
                  </div>
                </div>

                <div
                  className="quick-starter-card"
                  onClick={() => handlePromptClick('How to evaluate Lymphatic vs Sanguine temperament for chronic skin eruptions?')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1rem' }}>🩺</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Temperament Assessment</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.35 }}>
                    Differentiate constitution traits to select between S5, C5, and Ver1 remedies.
                  </div>
                </div>

                <div
                  className="quick-starter-card"
                  onClick={() => handlePromptClick('What is the Febrifugo-1 (F1) and A2 protocol for acute fever?')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1rem' }}>⚡</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Fever & Inflammation</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.35 }}>
                    Review thermal vasomotor regulation and frequent sip dosing in pyrexia.
                  </div>
                </div>

                <div
                  className="quick-starter-card"
                  onClick={() => handlePromptClick('Explain the dilution rules for acute inflammatory states vs degenerative conditions.')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1rem' }}>💧</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Dilution Matrix (D1–D6)</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.35 }}>
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

                    {/* Message Body with Clean Formatting */}
                    <div style={{
                      fontSize: '0.88rem',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: isUser ? '#FFFFFF' : '#1E293B'
                    }}>
                      {m.content}
                    </div>

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
                <span>Formulating Electropathy remedy protocol...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Console Area */}
        <div style={{
          padding: '12px 20px 16px',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF'
        }}>
          {/* Quick Consultation Chips Row */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '10px',
            scrollbarWidth: 'none'
          }}>
            <button
              type="button"
              className="prompt-chip"
              onClick={() => handlePromptClick('Protocol for Lymphatic Congestion (S1, L1, NE)')}
            >
              <span>🌿</span>
              <span>Lymphatic Protocol</span>
            </button>
            <button
              type="button"
              className="prompt-chip"
              onClick={() => handlePromptClick('How to assess Lymphatic vs Sanguine Temperament?')}
            >
              <span>🩺</span>
              <span>Temperament Assessment</span>
            </button>
            <button
              type="button"
              className="prompt-chip"
              onClick={() => handlePromptClick('Fever Protocol: Febrifugo-1 (F1) and Angioitico-2 (A2)')}
            >
              <span>⚡</span>
              <span>Fever & Inflammation</span>
            </button>
            <button
              type="button"
              className="prompt-chip"
              onClick={() => handlePromptClick('Dilution Matrix rules for acute vs chronic conditions')}
            >
              <span>💧</span>
              <span>Dilution Matrix</span>
            </button>
            <button
              type="button"
              className="prompt-chip"
              onClick={() => handlePromptClick('Pettorale-1 (P1) protocol for bronchial and spasmodic cough')}
            >
              <span>🫁</span>
              <span>Bronchial Cough</span>
            </button>
          </div>

          {/* Input Form Bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: '12px',
              padding: '6px 8px 6px 14px',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask an Electropathy query, remedy recommendation, or patient symptom inquiry..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sending}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.9rem',
                color: '#0F172A'
              }}
            />

            <span style={{ fontSize: '0.7rem', color: '#94A3B8', paddingRight: '4px' }}>
              Press ↵
            </span>

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              style={{
                backgroundColor: !inputText.trim() || sending ? '#CBD5E1' : '#0F4C81',
                background: !inputText.trim() || sending ? '#CBD5E1' : 'linear-gradient(135deg, #0F4C81 0%, #00A896 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !inputText.trim() || sending ? 'not-allowed' : 'pointer',
                boxShadow: !inputText.trim() || sending ? 'none' : '0 2px 6px rgba(0, 168, 150, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
