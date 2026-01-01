
import React, { useState, useEffect } from 'react';
import { ViewState, User, Organization, NavigationState, Notification, BusinessMetrics } from '../types';
import { apiFetch } from '../lib/api';
import { Logo } from './Logo';
import { AIAssistant } from './AIAssistant';

interface LayoutProps {
  children: React.ReactNode;
  currentNav: NavigationState;
  onNavigate: (view: ViewState, data?: any) => void;
  user: User;
  org: Organization;
  onLogout: () => void;
}

const NavLink: React.FC<{ 
  label: string; 
  active: boolean; 
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`px-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${
      active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    <span>{label}</span>
    {active && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] rounded-full" aria-hidden="true"></span>
    )}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentNav, 
  onNavigate, 
  user,
  org,
  onLogout 
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);

  useEffect(() => {
    apiFetch('/api/v1/notifications').then(data => setNotifications(data as Notification[]));
    apiFetch('/api/v1/metrics').then(m => setMetrics(m as BusinessMetrics));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col pb-24 lg:pb-0 text-slate-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/5 px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Logo className="h-7" variant="light" />
          </div>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <NavLink label="Dashboard" active={currentNav.view === ViewState.DASHBOARD} onClick={() => onNavigate(ViewState.DASHBOARD)} />
            <NavLink label="Inbox" active={currentNav.view === ViewState.COMMS} onClick={() => onNavigate(ViewState.COMMS)} />
            <NavLink label="Finance" active={currentNav.view === ViewState.FINANCE} onClick={() => onNavigate(ViewState.FINANCE)} />
            <NavLink label="Marketing" active={currentNav.view === ViewState.MARKETING} onClick={() => onNavigate(ViewState.MARKETING)} />
            <NavLink label="Inventory" active={currentNav.view === ViewState.INVENTORY} onClick={() => onNavigate(ViewState.INVENTORY)} />
            <NavLink label="Sales" active={currentNav.view === ViewState.SALES} onClick={() => onNavigate(ViewState.SALES)} />
            <NavLink label="Team" active={currentNav.view === ViewState.HR} onClick={() => onNavigate(ViewState.HR)} />
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0f1e]"></span>}
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center font-bold text-white shadow-lg"
              >
                {user.fullName.charAt(0)}
              </button>
              
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 mt-3 w-64 bg-[#151b2d] border border-white/10 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-fade-in">
                    <div className="px-5 py-4 border-b border-white/5">
                      <p className="text-sm font-bold text-white">{user.fullName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => { onNavigate(ViewState.UPGRADE); setShowProfileMenu(false); }} 
                      className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Workspace Settings
                    </button>
                    <button 
                      onClick={onLogout} 
                      className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full h-20 bg-[#151b2d] border-t border-white/5 flex items-center justify-around px-2 z-50">
          {[
            { view: ViewState.DASHBOARD, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: 'Home' },
            { view: ViewState.FINANCE, icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', label: 'Money' },
            { view: ViewState.COMMS, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'Inbox', center: true },
            { view: ViewState.INVENTORY, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Stock' },
            { view: ViewState.SALES, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', label: 'Sales' }
          ].map(item => (
            <button 
              key={item.view} 
              onClick={() => onNavigate(item.view)} 
              className={`flex flex-col items-center space-y-1 ${item.center ? '-mt-10 w-14 h-14 bg-blue-600 rounded-full shadow-2xl border-4 border-[#0a0f1e] text-white' : (currentNav.view === item.view ? 'text-blue-500' : 'text-slate-500')}`}
            >
              <svg className={`${item.center ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} /></svg>
              {!item.center && <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>}
            </button>
          ))}
      </nav>

      <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 lg:p-10 animate-fade-in">
        {children}
      </main>

      {metrics && <AIAssistant metrics={metrics} />}
    </div>
  );
};
