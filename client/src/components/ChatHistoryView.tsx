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
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';

export const ChatHistoryView: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const loadConversations = async () => {
    setLoadingList(true);
    setErrorMsg(null);
    try {
      const res = await api.getConversations();
      if (res.success && res.conversations) {
        setConversations(res.conversations);
        // Automatically select the most recent conversation if none active
        if (res.conversations.length > 0 && !activeConv) {
          selectConversation(res.conversations[0]!.id);
        }
      }
    } catch (err) {
      setErrorMsg('Failed to load conversation history.');
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

  const handleStartNewChat = async () => {
    try {
      const res = await api.createConversation({
        title: 'New Clinical Consultation',
        initialMessage: undefined
      });
      if (res.success && res.conversation) {
        await loadConversations();
        await selectConversation(res.conversation.id);
      }
    } catch (err) {
      alert('Could not start new conversation.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const userText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      let convId = activeConv?.id;

      // If no active conversation, create one first
      if (!convId) {
        const newConvRes = await api.createConversation({
          title: userText.slice(0, 35) + '...',
          initialMessage: userText
        });
        if (newConvRes.success && newConvRes.conversation) {
          await loadConversations();
          await selectConversation(newConvRes.conversation.id);
          convId = newConvRes.conversation.id;
        }
      } else {
        // Send user message
        const msgRes = await api.sendMessage(convId, userText, 'user');
        if (msgRes.success && msgRes.message) {
          // Immediately append message to active conversation state
          setActiveConv(prev => prev ? {
            ...prev,
            messages: [...prev.messages, msgRes.message]
          } : null);

          // Simulated Electropathy AI assistant response
          setTimeout(async () => {
            const reply = await api.sendMessage(
              convId!,
              `Consultation response based on approved Electropathy knowledge for query: "${userText}". Recommended initial remedy assessment: evaluate temperament (Lymphatic/Sanguine) and consider S1 / C1 diluted dosages as supportive protocol.`,
              'assistant'
            );
            if (reply.success && reply.message) {
              setActiveConv(prev => prev ? {
                ...prev,
                messages: [...prev.messages, reply.message]
              } : null);
              loadConversations();
            }
          }, 600);
        }
      }
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
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

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '20px auto',
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid #E2E8F0',
      boxShadow: 'var(--shadow-md)',
      height: 'calc(100vh - 190px)',
      minHeight: '560px',
      display: 'flex',
      overflow: 'hidden'
    }}>
      {/* SIDEBAR: History List */}
      <div style={{
        width: '320px',
        borderRight: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header / New Chat */}
        <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0' }}>
          <button
            onClick={handleStartNewChat}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px 14px', fontSize: '0.9rem' }}
          >
            <Plus size={18} />
            <span>New Consultation</span>
          </button>
        </div>

        {/* History List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {loadingList ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
              <Loader2 className="animate-spin" size={20} style={{ margin: '0 auto 8px' }} />
              Loading saved history...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
              <MessageSquare size={36} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                No saved history
              </p>
              <p style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                No previous conversations yet. Start a new conversation to build your history.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {conversations.map((c) => {
                const isActive = activeConv?.id === c.id;
                const isEditing = editingTitleId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#EBF3FA' : 'transparent',
                      border: isActive ? '1px solid #93C5FD' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '4px', width: '100%' }} onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitleText}
                            onChange={(e) => setEditTitleText(e.target.value)}
                            style={{
                              flex: 1,
                              fontSize: '0.8rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #0F4C81'
                            }}
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleSaveTitle(c.id, e)}
                            style={{ background: '#0F4C81', color: '#FFF', border: 'none', borderRadius: '4px', padding: '2px 6px' }}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#0F4C81' : '#1E293B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px'
                        }}>
                          {c.title}
                        </span>
                      )}

                      {!isEditing && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTitleId(c.id);
                              setEditTitleText(c.title);
                            }}
                            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                            title="Rename"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(c.id, e)}
                            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> {new Date(c.updatedAt).toLocaleDateString()}
                      </span>
                      <span>{c.messageCount} msg{c.messageCount === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MAIN: Active Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
        {/* Chat Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A' }}>
              {activeConv ? activeConv.title : 'Electropathy Clinical Assistant'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#00A896', fontWeight: 600 }}>
              {activeConv ? `Saved in PostgreSQL • ${activeConv.messages.length} Messages` : 'Option A: Grounded Knowledge'}
            </span>
          </div>

          {activeConv && (
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              ID: {activeConv.id.slice(0, 8)}
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loadingChat ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
              <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
              Loading consultation history...
            </div>
          ) : !activeConv || activeConv.messages.length === 0 ? (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              maxWidth: '440px',
              padding: '40px',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: '1px dashed #CBD5E1'
            }}>
              <Bot size={44} style={{ color: '#0F4C81', margin: '0 auto 14px' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#0F172A' }}>
                Electropathy Clinical Consultation
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                Ask questions regarding Electropathy remedies, constitution, dosages, or past clinical cases. All consultation threads are stored permanently in PostgreSQL under your account.
              </p>
            </div>
          ) : (
            activeConv.messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  {!isUser && (
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#0F4C81',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Bot size={18} />
                    </div>
                  )}

                  <div style={{
                    backgroundColor: isUser ? '#0F4C81' : '#F1F5F9',
                    color: isUser ? '#FFFFFF' : '#0F172A',
                    padding: '12px 18px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '0.925rem',
                    lineHeight: 1.5,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div>{m.content}</div>
                    <div style={{
                      fontSize: '0.675rem',
                      color: isUser ? '#93C5FD' : '#94A3B8',
                      marginTop: '6px',
                      textAlign: 'right'
                    }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {isUser && (
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#00A896',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <UserIcon size={18} />
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            gap: '12px'
          }}
        >
          <input
            type="text"
            className="input-field"
            placeholder="Type your Electropathy clinical query or symptom inquiry..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!inputText.trim() || sending}
            style={{ padding: '10px 20px' }}
          >
            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
