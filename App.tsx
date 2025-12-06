import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/Sales';
import { Inventory } from './pages/Inventory';
import { Finance } from './pages/Finance';
import { HR } from './pages/HR';
import { Operations } from './pages/Operations';
import { Communications } from './pages/Communications';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { ViewState } from './types';
import { MOCK_USER, MOCK_ORG } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN);

  const handleLogin = () => {
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentView(ViewState.LOGIN);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.SALES:
        return <Sales />;
      case ViewState.INVENTORY:
        return <Inventory />;
      case ViewState.FINANCE:
        return <Finance />;
      case ViewState.HR:
        return <HR />;
      case ViewState.OPERATIONS:
        return <Operations />;
      case ViewState.COMMS:
        return <Communications />;
      case ViewState.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (currentView === ViewState.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView}
      user={MOCK_USER}
      org={MOCK_ORG}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;