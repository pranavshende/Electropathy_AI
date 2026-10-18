import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { PatientIntakeWizard } from './components/PatientIntakeWizard';
import { CaseHistoryList } from './components/CaseHistoryList';
import { ChatHistoryView } from './components/ChatHistoryView';
import { AdminPortal } from './components/AdminPortal';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { api } from './services/api';
import { User, PatientCase } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentLang, setCurrentLang] = useState('en');
  const [activeTab, setActiveTab] = useState<'intake' | 'records' | 'chat' | 'admin'>('intake');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if previously logged in as user
    const checkAuth = async () => {
      const token = localStorage.getItem('electropathy_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setCurrentLang(res.user.preferredLang || 'en');
          } else {
            api.logout();
          }
        } catch {
          api.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentLang(authenticatedUser.preferredLang || 'en');
    setActiveTab('chat'); // Immediately show their saved consultation history upon login!
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setActiveTab('intake');
  };

  const handleCaseSubmitted = (_newCase: PatientCase) => {
    setActiveTab('records');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#0F4C81', fontWeight: 600 }}>Loading Electropathy AI Portal...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        currentLang={currentLang}
        onLanguageChange={(lang) => setCurrentLang(lang)}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      <main style={{ flex: 1, padding: '20px' }}>
        {activeTab === 'admin' ? (
          <AdminPortal onBackToApp={() => setActiveTab('intake')} />
        ) : !user ? (
          <LoginModal onSuccess={handleLoginSuccess} />
        ) : (
          <>
            {activeTab === 'intake' && (
              <PatientIntakeWizard onCaseSubmitted={handleCaseSubmitted} />
            )}
            {activeTab === 'records' && (
              <CaseHistoryList />
            )}
            {activeTab === 'chat' && (
              <ChatHistoryView />
            )}
          </>
        )}
      </main>

      <MedicalDisclaimer />
    </div>
  );
}
