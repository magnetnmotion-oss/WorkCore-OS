
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
      try {
        const savedUserStr = localStorage.getItem('ommi_user');
        let foundUser = null;
        let foundOrg = null;

        if (savedUserStr) {
          try {
            foundUser = JSON.parse(savedUserStr);
            foundOrg = await apiFetch('/api/v1/orgs/org-1');
          } catch (e) {
            console.error("Session restore failed", e);
            localStorage.removeItem('ommi_user');
          }
        }

        // Mandatory splash delay for aesthetics
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (foundUser && foundOrg) {
          setUser(foundUser);
          setOrg(foundOrg);
          setNavState({ view: foundOrg.setupStatus === 'pending' ? ViewState.SETUP_WIZARD : ViewState.DASHBOARD });
        } else {
          setNavState({ view: ViewState.LOGIN });
        }
      } catch (err) {
        console.error("Critical app init error:", err);
        setNavState({ view: ViewState.LOGIN });
      } finally {
        setShowSplash(false);
      }
    };

    initApp();
  }, []);

  const handleLogin = async (loggedInUser: User) => {
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
      setNavState({ view: ViewState.DASHBOARD });
    }
  };

  const handleLogout = () => {
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

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 animate-fade-in">
        <div className="animate-pulse scale-150">
           <Logo className="h-16 w-auto" variant="light" />
        </div>
        <div className="mt-12 flex flex-col items-center">
           <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 w-1/2 animate-shimmer"></div>
           </div>
           <p className="text-slate-500 text-[10px] mt-6 font-black tracking-[0.4em] uppercase">Booting OMMI OS</p>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          .animate-shimmer {
            animation: shimmer 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  const renderContent = () => {
    if (!user) return null;
    
    switch (navState.view) {
      case ViewState.SETUP_WIZARD:
        return <SetupWizard onComplete={completeSetup} />;
      case ViewState.DASHBOARD:
        return <Dashboard onNavigate={handleNavigate} user={user} />;
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
        return <Dashboard onNavigate={handleNavigate} user={user} />;
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
