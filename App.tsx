import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/Sales';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Inventory } from './pages/Inventory';
import { InventoryDetail } from './pages/InventoryDetail';
import { Finance } from './pages/Finance';
import { HR } from './pages/HR';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { Operations } from './pages/Operations';
import { ProjectDetail } from './pages/ProjectDetail';
import { Communications } from './pages/Communications';
import { Marketing } from './pages/Marketing'; 
import { Upgrade } from './pages/Settings'; 
import { Login } from './pages/Login';
import { SetupWizard } from './pages/SetupWizard';
import { ViewState, NavigationState, Organization, User } from './types';
import { MOCK_USER } from './constants';
import { apiFetch } from './lib/api';
import { Logo } from './components/Logo';

const App: React.FC = () => {
  const [navState, setNavState] = useState<NavigationState>({ view: ViewState.LOGIN });
  const [org, setOrg] = useState<Organization | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Initialize App & Check for Session
  useEffect(() => {
    const initApp = async () => {
      // 1. Check for saved user session in localStorage
      const savedUserStr = localStorage.getItem('ommi_user');
      let foundUser = null;
      let foundOrg = null;

      if (savedUserStr) {
        try {
          foundUser = JSON.parse(savedUserStr);
          // In a real app, verify token validity here
          foundOrg = await apiFetch('/api/v1/orgs/org-1'); // Fetch org data for the saved user
        } catch (e) {
          console.error("Session restore failed", e);
          localStorage.removeItem('ommi_user');
        }
      }

      // 2. Enforce minimum splash screen duration for branding
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Navigate based on session
      if (foundUser && foundOrg) {
        setUser(foundUser);
        setOrg(foundOrg);
        setNavState({ view: ViewState.DASHBOARD });
      } else {
        setNavState({ view: ViewState.LOGIN });
      }

      setShowSplash(false);
    };

    initApp();
  }, []);

  const handleLogin = async (loggedInUser: User) => {
    // Save user session to localStorage
    localStorage.setItem('ommi_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    try {
      const fetchedOrg = await apiFetch('/api/v1/orgs/org-1');
      setOrg(fetchedOrg as Organization);
      
      if (fetchedOrg && fetchedOrg.setupStatus === 'pending') {
        setNavState({ view: ViewState.SETUP_WIZARD });
      } else {
        setNavState({ view: ViewState.DASHBOARD });
      }
    } catch (e) {
      console.error("Failed to fetch org details", e);
    }
  };

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem('ommi_user');
    setUser(null);
    setOrg(null);
    setNavState({ view: ViewState.LOGIN });
  };

  const handleNavigate = (view: ViewState, data?: any) => {
    setNavState({ view, data });
  };

  const completeSetup = async () => {
    const fetchedOrg = await apiFetch('/api/v1/orgs/org-1');
    setOrg(fetchedOrg as Organization);
    setNavState({ view: ViewState.DASHBOARD });
  };

  // --- SPLASH SCREEN ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50 animate-fade-in">
        <div className="animate-bounce-slight scale-150">
           <Logo className="h-16 w-auto" variant="light" />
        </div>
        <div className="mt-8 flex flex-col items-center">
           <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-orange-500 w-1/2 animate-[loading_1s_ease-in-out_infinite]"></div>
           </div>
           <p className="text-slate-500 text-xs mt-4 font-medium tracking-widest uppercase">Loading WorkCore OS</p>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          .animate-bounce-slight {
            animation: bounce-slight 2s infinite;
          }
          @keyframes bounce-slight {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        `}</style>
      </div>
    );
  }

  // --- MAIN APP CONTENT ---
  
  const renderContent = () => {
    switch (navState.view) {
      case ViewState.SETUP_WIZARD:
        return <SetupWizard onComplete={completeSetup} />;
      case ViewState.DASHBOARD:
        return <Dashboard onNavigate={handleNavigate} />;
      case ViewState.SALES:
        return <Sales onNavigate={handleNavigate} />;
      case ViewState.INVOICE_DETAIL:
        return <InvoiceDetail invoiceId={navState.data} onBack={() => handleNavigate(ViewState.SALES)} />;
      case ViewState.INVENTORY:
        return <Inventory onNavigate={handleNavigate} />;
      case ViewState.INVENTORY_DETAIL:
        return <InventoryDetail itemId={navState.data} onBack={() => handleNavigate(ViewState.INVENTORY)} />;
      case ViewState.FINANCE:
        return <Finance />;
      case ViewState.HR:
        return <HR onNavigate={handleNavigate} />;
      case ViewState.EMPLOYEE_DETAIL:
        return <EmployeeDetail employeeId={navState.data} onBack={() => handleNavigate(ViewState.HR)} />;
      case ViewState.OPERATIONS:
        return <Operations onNavigate={handleNavigate} />;
      case ViewState.PROJECT_DETAIL:
        return <ProjectDetail projectId={navState.data} onBack={() => handleNavigate(ViewState.OPERATIONS)} />;
      case ViewState.MARKETING:
        return <Marketing />;
      case ViewState.COMMS:
        return <Communications />;
      case ViewState.UPGRADE:
        return <Upgrade />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (navState.view === ViewState.LOGIN || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentNav={navState} 
      onNavigate={handleNavigate}
      user={user}
      org={org!} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;