import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AdminOverview, AuditLogItem } from '../types';
import { 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  FileText, 
  History, 
  Lock, 
  Mail, 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye, 
  LogOut,
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface AdminPortalProps {
  onBackToApp: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToApp }) => {
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'conversations' | 'cases' | 'audit'>('overview');
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Overview State
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userTotal, setUserTotal] = useState(0);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);

  // Conversations State
  const [conversations, setConversations] = useState<any[]>([]);
  const [convSearch, setConvSearch] = useState('');
  const [selectedConvDetail, setSelectedConvDetail] = useState<any | null>(null);

  // Patient Cases State
  const [patientCases, setPatientCases] = useState<any[]>([]);
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<any | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    const adminToken = localStorage.getItem('electropathy_admin_token');
    if (adminToken) {
      loadOverview();
      setAdminUser({ role: 'admin', email: 'admin@electropathy.ai' });
    }
  }, []);

  useEffect(() => {
    if (adminUser) {
      if (activeTab === 'overview') loadOverview();
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'conversations') loadConversations();
      if (activeTab === 'cases') loadCases();
      if (activeTab === 'audit') loadAuditLogs();
    }
  }, [activeTab, adminUser]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await api.adminLogin(email, password);
      if (res.success && res.admin) {
        setAdminUser(res.admin);
        loadOverview();
      } else {
        setLoginError(res.message || 'Invalid administrator credentials');
      }
    } catch (err) {
      setLoginError('Unable to connect to administration server.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('electropathy_admin_token');
    setAdminUser(null);
  };

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await api.adminGetOverview();
      if (res.success) setOverview(res.overview);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.adminGetUsers({ search: userSearch });
      if (res.success) {
        setUsers(res.users);
        setUserTotal(res.total);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await api.adminGetConversations({ search: convSearch });
      if (res.success) setConversations(res.conversations);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCases = async () => {
    try {
      const res = await api.adminGetPatientCases({});
      if (res.success) setPatientCases(res.cases);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await api.adminGetAuditLogs();
      if (res.success) setAuditLogs(res.logs);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this account?`)) return;

    try {
      const res = await api.adminUpdateUserStatus(userId, !currentStatus);
      if (res.success) {
        loadUsers();
        if (selectedUserDetail?.id === userId) {
          setSelectedUserDetail((prev: any) => ({ ...prev, isActive: !currentStatus }));
        }
      }
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  // 1. ADMIN LOGIN VIEW
  if (!adminUser) {
    return (
      <div style={{
        maxWidth: '440px',
        margin: '60px auto',
        padding: '36px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid #E2E8F0',
        textAlign: 'left'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            backgroundColor: '#0F172A',
            color: '#38BDF8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(15, 23, 42, 0.2)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '6px' }}>Administrator Portal</h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            Authorized personnel only. Protected by RBAC & Audit Trails.
          </p>
        </div>

        {loginError && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={18} />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="input-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
              <input
                type="email"
                className="input-field"
                placeholder="admin@electropathy.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
              <input
                type="password"
                className="input-field"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
            <span style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '6px', display: 'block' }}>
              Default credential seeded via <code>npm run seed:admin</code>
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', backgroundColor: '#0F172A' }}
            disabled={loginLoading}
          >
            {loginLoading ? <Loader2 className="animate-spin" size={18} /> : 'Secure Admin Login'}
          </button>

          <button
            type="button"
            onClick={onBackToApp}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'center', marginTop: '6px' }}
          >
            ← Return to Main Portal
          </button>
        </form>
      </div>
    );
  }

  // 2. ADMIN DASHBOARD VIEW
  return (
    <div style={{ maxWidth: '1320px', margin: '20px auto', padding: '0 20px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 24px',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#1E293B',
            color: '#38BDF8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF', letterSpacing: '-0.3px' }}>
              Administration & Governance Console
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Electropathy AI • Logged in as: <strong>{adminUser.email || 'System Admin'}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBackToApp} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            User Portal
          </button>
          <button onClick={handleAdminLogout} className="btn" style={{ backgroundColor: '#EF4444', color: '#FFF', padding: '8px 14px', fontSize: '0.85rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: '24px'
      }}>
        {[
          { key: 'overview', label: 'System Overview', icon: Layers },
          { key: 'users', label: 'User Management', icon: Users },
          { key: 'conversations', label: 'Conversations', icon: MessageSquare },
          { key: 'cases', label: 'Patient Cases', icon: FileText },
          { key: 'audit', label: 'Audit Trail', icon: History }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className="btn"
              style={{
                backgroundColor: isActive ? '#0F172A' : '#F8FAFC',
                color: isActive ? '#FFFFFF' : '#475569',
                border: '1px solid #CBD5E1',
                borderBottom: isActive ? '1px solid #0F172A' : '1px solid #CBD5E1',
                borderRadius: '8px 8px 0 0',
                padding: '10px 18px',
                fontSize: '0.875rem'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          {loadingOverview || !overview ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
              <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
              Querying database statistics...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>Total Registered Users</span>
                  <Users size={20} color="#0F4C81" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>{overview.users.total}</div>
                <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '6px' }}>
                  {overview.users.active} Active • {overview.users.inactive} Inactive
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>Conversations & Chats</span>
                  <MessageSquare size={20} color="#00A896" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>{overview.conversations.totalConversations}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
                  {overview.conversations.totalMessages} Messages in PostgreSQL
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>Clinical Patient Cases</span>
                  <FileText size={20} color="#F59E0B" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>{overview.patientCases.total}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
                  Recorded via Practitioner Intake Wizard
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>Knowledge Base (RAG)</span>
                  <Layers size={20} color="#8B5CF6" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>{overview.knowledgeBase.totalDocuments} Docs</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
                  {overview.knowledgeBase.totalChunks} Indexed Text Chunks
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. USERS TAB */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Registered Users ({userTotal})</h3>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search name, phone, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '12px 14px' }}>User / Mobile</th>
                <th style={{ padding: '12px 14px' }}>Role / Type</th>
                <th style={{ padding: '12px 14px' }}>Language</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Joined Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{u.fullName || 'No Name Provided'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>+91 {u.mobileNumber}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      backgroundColor: u.role === 'admin' ? '#FEE2E2' : '#EBF3FA',
                      color: u.role === 'admin' ? '#991B1B' : '#0F4C81',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'capitalize'
                    }}>
                      {u.role}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '6px' }}>
                      ({u.userType || 'patient'})
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textTransform: 'uppercase' }}>{u.preferredLang}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {u.isActive ? (
                      <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <CheckCircle size={14} /> Active
                      </span>
                    ) : (
                      <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <XCircle size={14} /> Deactivated
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '0.8rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={async () => {
                          const res = await api.adminGetUserDetails(u.id);
                          if (res.success) setSelectedUserDetail(res.user);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} /> View
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(u.id, u.isActive)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            backgroundColor: u.isActive ? '#FEE2E2' : '#D1FAE5',
                            color: u.isActive ? '#991B1B' : '#065F46',
                            fontWeight: 600
                          }}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. CONVERSATIONS TAB */}
      {activeTab === 'conversations' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>All User Conversations ({conversations.length})</h3>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search title, user name..."
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadConversations()}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={async () => {
                  const res = await api.adminGetConversationDetails(c.id);
                  if (res.success) setSelectedConvDetail(res.conversation);
                }}
                style={{
                  padding: '16px 20px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#F8FAFC'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{c.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '3px' }}>
                    User: {c.user?.fullName || c.user?.mobileNumber || 'Anonymous'} • {c._count?.messages || 0} messages
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(c.updatedAt).toLocaleString()}</span>
                  <ChevronRight size={18} color="#94A3B8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PATIENT CASES TAB */}
      {activeTab === 'cases' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Submitted Clinical Case Records ({patientCases.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {patientCases.map((cs) => (
              <div
                key={cs.id}
                onClick={async () => {
                  const res = await api.adminGetPatientCaseDetails(cs.id);
                  if (res.success) setSelectedCaseDetail(res.case);
                }}
                style={{
                  padding: '16px 20px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>
                    {cs.patientName} <span style={{ fontSize: '0.8rem', color: '#64748B' }}>({cs.age} yrs, {cs.gender})</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                    Chief Complaint: {cs.chiefComplaints[0]?.complaint || 'N/A'} • Practitioner: {cs.practitioner?.fullName || cs.practitioner?.mobileNumber}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    backgroundColor: '#E0F5F2',
                    color: '#00A896',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {cs.status}
                  </span>
                  <ChevronRight size={18} color="#94A3B8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Administrative Audit Trail</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '10px' }}>Action</th>
                <th style={{ padding: '10px' }}>Admin</th>
                <th style={{ padding: '10px' }}>Target ID</th>
                <th style={{ padding: '10px' }}>IP Address</th>
                <th style={{ padding: '10px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px' }}>
                    <code style={{ backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {log.action}
                    </code>
                  </td>
                  <td style={{ padding: '10px' }}>{log.admin?.email || log.adminId}</td>
                  <td style={{ padding: '10px', color: '#64748B' }}>{log.targetId ? log.targetId.slice(0, 8) + '...' : '—'}</td>
                  <td style={{ padding: '10px', color: '#64748B' }}>{log.ipAddress || 'localhost'}</td>
                  <td style={{ padding: '10px', color: '#64748B' }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: User Details */}
      {selectedUserDetail && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px'
        }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '640px', width: '100%', padding: '30px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3>User Profile Details</h3>
              <button onClick={() => setSelectedUserDetail(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>
            <p><strong>Full Name:</strong> {selectedUserDetail.fullName || 'Not provided'}</p>
            <p><strong>Mobile Number:</strong> +91 {selectedUserDetail.mobileNumber}</p>
            <p><strong>Email:</strong> {selectedUserDetail.email || 'None'}</p>
            <p><strong>Role / Type:</strong> {selectedUserDetail.role} ({selectedUserDetail.userType || 'patient'})</p>
            <p><strong>Account Status:</strong> {selectedUserDetail.isActive ? 'Active' : 'Deactivated'}</p>
            <p><strong>Joined:</strong> {new Date(selectedUserDetail.createdAt).toLocaleString()}</p>
            
            <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#0F4C81' }}>Associated Conversations:</h4>
            {selectedUserDetail.conversations?.length === 0 ? <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No conversations recorded.</p> : (
              selectedUserDetail.conversations.map((c: any) => (
                <div key={c.id} style={{ padding: '6px 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.85rem' }}>
                  • {c.title} ({new Date(c.updatedAt).toLocaleDateString()})
                </div>
              ))
            )}
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setSelectedUserDetail(null)} className="btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Conversation Messages Inspection */}
      {selectedConvDetail && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px'
        }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '680px', width: '100%', padding: '30px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3>{selectedConvDetail.title}</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  User: {selectedConvDetail.user?.fullName || selectedConvDetail.user?.mobileNumber}
                </span>
              </div>
              <button onClick={() => setSelectedConvDetail(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedConvDetail.messages?.map((m: any) => (
                <div key={m.id} style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: m.role === 'user' ? '#EBF3FA' : '#F1F5F9',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: m.role === 'user' ? '#0F4C81' : '#00A896', marginBottom: '4px' }}>
                    {m.role === 'user' ? 'User' : 'Assistant'} • {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#0F172A' }}>{m.content}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setSelectedConvDetail(null)} className="btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Patient Case Inspection */}
      {selectedCaseDetail && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px'
        }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '640px', width: '100%', padding: '30px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3>Patient Clinical Case: {selectedCaseDetail.patientName}</h3>
              <button onClick={() => setSelectedCaseDetail(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p><strong>Age / Gender:</strong> {selectedCaseDetail.age} yrs | {selectedCaseDetail.gender}</p>
              <p><strong>Contact:</strong> +91 {selectedCaseDetail.contactNumber} | {selectedCaseDetail.city}</p>
              <p><strong>Practitioner:</strong> {selectedCaseDetail.practitioner?.fullName || selectedCaseDetail.practitioner?.mobileNumber}</p>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                <p><strong>Chief Complaints:</strong> {selectedCaseDetail.chiefComplaints[0]?.complaint} ({selectedCaseDetail.chiefComplaints[0]?.duration})</p>
                <p><strong>Severity:</strong> {selectedCaseDetail.chiefComplaints[0]?.severity}/10</p>
                <p><strong>Temperament:</strong> {selectedCaseDetail.electropathyDetails?.temperament}</p>
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setSelectedCaseDetail(null)} className="btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
