import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { PatientIntakeWizard } from './components/PatientIntakeWizard';
import { CaseHistoryList } from './components/CaseHistoryList';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { api } from './services/api';
import { User, PatientCase } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentLang, setCurrentLang] = useState('en');
  const [activeTab, setActiveTab] = useState<'intake' | 'records'>('intake');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if previously logged in
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
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  const handleCaseSubmitted = (_newCase: PatientCase) => {
    // Optionally trigger tab or toast
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
        {!user ? (
          <LoginModal onSuccess={handleLoginSuccess} />
        ) : (
          <>
            {activeTab === 'intake' && (
              <PatientIntakeWizard onCaseSubmitted={handleCaseSubmitted} />
            )}
            {activeTab === 'records' && (
              <CaseHistoryList />
            )}
          </>
        )}
      </main>

      <MedicalDisclaimer />
    </div>
  );
}
