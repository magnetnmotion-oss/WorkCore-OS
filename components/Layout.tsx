import React, { useState } from 'react';
import { ViewState, User, Organization } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User;
  org: Organization;
  onLogout: () => void;
}

const NavItem: React.FC<{ 
  label: string; 
  active: boolean; 
  icon: React.ReactNode; 
  onClick: () => void 
}> = ({ label, active, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </button>
);

// SVG Icons
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Sales: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Inventory: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Finance: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  HR: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Operations: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Comms: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
};

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onNavigate, 
  user,
  org,
  onLogout 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: ViewState) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 text-white shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            WorkCore
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{org.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem 
            label="Dashboard" 
            active={currentView === ViewState.DASHBOARD} 
            icon={<Icons.Dashboard />} 
            onClick={() => handleNav(ViewState.DASHBOARD)} 
          />
          <NavItem 
            label="Sales & Invoices" 
            active={currentView === ViewState.SALES} 
            icon={<Icons.Sales />} 
            onClick={() => handleNav(ViewState.SALES)} 
          />
          <NavItem 
            label="Inventory" 
            active={currentView === ViewState.INVENTORY} 
            icon={<Icons.Inventory />} 
            onClick={() => handleNav(ViewState.INVENTORY)} 
          />
          <NavItem 
            label="Finance" 
            active={currentView === ViewState.FINANCE} 
            icon={<Icons.Finance />} 
            onClick={() => handleNav(ViewState.FINANCE)} 
          />
          <NavItem 
            label="HR & Team" 
            active={currentView === ViewState.HR} 
            icon={<Icons.HR />} 
            onClick={() => handleNav(ViewState.HR)} 
          />
          <NavItem 
            label="Operations" 
            active={currentView === ViewState.OPERATIONS} 
            icon={<Icons.Operations />} 
            onClick={() => handleNav(ViewState.OPERATIONS)} 
          />
          <NavItem 
            label="Communications" 
            active={currentView === ViewState.COMMS} 
            icon={<Icons.Comms />} 
            onClick={() => handleNav(ViewState.COMMS)} 
          />
          <div className="pt-4 mt-4 border-t border-slate-800">
            <NavItem 
              label="Settings" 
              active={currentView === ViewState.SETTINGS} 
              icon={<Icons.Settings />} 
              onClick={() => handleNav(ViewState.SETTINGS)} 
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Icons.Logout />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-10">
          <h1 className="text-lg font-bold text-slate-900">WorkCore</h1>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-slate-900 z-50 p-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-white text-xl font-bold">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-4">
              <NavItem label="Dashboard" active={currentView === ViewState.DASHBOARD} icon={<Icons.Dashboard />} onClick={() => handleNav(ViewState.DASHBOARD)} />
              <NavItem label="Sales" active={currentView === ViewState.SALES} icon={<Icons.Sales />} onClick={() => handleNav(ViewState.SALES)} />
              <NavItem label="Inventory" active={currentView === ViewState.INVENTORY} icon={<Icons.Inventory />} onClick={() => handleNav(ViewState.INVENTORY)} />
              <NavItem label="Finance" active={currentView === ViewState.FINANCE} icon={<Icons.Finance />} onClick={() => handleNav(ViewState.FINANCE)} />
              <NavItem label="HR" active={currentView === ViewState.HR} icon={<Icons.HR />} onClick={() => handleNav(ViewState.HR)} />
              <NavItem label="Operations" active={currentView === ViewState.OPERATIONS} icon={<Icons.Operations />} onClick={() => handleNav(ViewState.OPERATIONS)} />
              <NavItem label="Comms" active={currentView === ViewState.COMMS} icon={<Icons.Comms />} onClick={() => handleNav(ViewState.COMMS)} />
              <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 mt-8">
                <Icons.Logout />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           {children}
        </div>
      </main>
    </div>
  );
};