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
import { Upgrade } from './pages/Settings'; // Renamed import
import { Login } from './pages/Login';
import { SetupWizard } from './pages/SetupWizard';
import { ViewState, NavigationState, Organization } from './types';
import { MOCK_USER } from './constants';
import { apiFetch } from './lib/api';

const App: React.FC = () => {
  const [navState, setNavState] = useState<NavigationState>({ view: ViewState.LOGIN });
  const [org, setOrg] = useState<Organization | null>(null);

  const fetchOrg = async () => {
    try {
      const data = await apiFetch('/api/v1/orgs/org-1');
      setOrg(data as Organization);
      return data as Organization;
    } catch (e) {
      console.error("Failed to fetch org", e);
      return null;
    }
  };

  const handleLogin = async () => {
    const fetchedOrg = await fetchOrg();
    if (fetchedOrg && fetchedOrg.setupStatus === 'pending') {
      setNavState({ view: ViewState.SETUP_WIZARD });
    } else {
      setNavState({ view: ViewState.DASHBOARD });
    }
  };

  const handleLogout = () => {
    setNavState({ view: ViewState.LOGIN });
  };

  const handleNavigate = (view: ViewState, data?: any) => {
    setNavState({ view, data });
  };

  // Re-check org status if needed (e.g. after setup completion)
  const completeSetup = async () => {
    await fetchOrg();
    setNavState({ view: ViewState.DASHBOARD });
  };

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

  if (navState.view === ViewState.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  if (org?.setupStatus === 'pending' && navState.view !== ViewState.SETUP_WIZARD) {
    setNavState({ view: ViewState.SETUP_WIZARD });
  }

  return (
    <Layout 
      currentNav={navState} 
      onNavigate={handleNavigate}
      user={MOCK_USER}
      org={org!} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
