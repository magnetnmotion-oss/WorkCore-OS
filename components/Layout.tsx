import React, { useState, useEffect } from 'react';
import { ViewState, User, Organization, NavigationState, Notification } from '../types';
import { apiFetch } from '../lib/api';

interface LayoutProps {
  children: React.ReactNode;
  currentNav: NavigationState;
  onNavigate: (view: ViewState, data?: any) => void;
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
  Marketing: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
};

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentNav, 
  onNavigate, 
  user,
  org,
  onLogout 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Poll for notifications or just fetch once in this mock
    apiFetch('/api/v1/notifications').then(data => setNotifications(data as Notification[]));
  }, []);

  const handleNav = (view: ViewState) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const markAllRead = () => {
    apiFetch('/api/v1/notifications/mark-read/all', { method: 'POST' });
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // RBAC LOGIC
  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager';
  
  const canViewFinance = isAdmin || isManager;
  const canViewHR = isAdmin || isManager;
  const canViewMarketing = isAdmin || isManager;
  const canViewSettings = isAdmin;

  const isSalesActive = currentNav.view === ViewState.SALES || currentNav.view === ViewState.INVOICE_DETAIL;
  const isInventoryActive = currentNav.view === ViewState.INVENTORY || currentNav.view === ViewState.INVENTORY_DETAIL;
  const isHRActive = currentNav.view === ViewState.HR || currentNav.view === ViewState.EMPLOYEE_DETAIL;
  const isOpsActive = currentNav.view === ViewState.OPERATIONS || currentNav.view === ViewState.PROJECT_DETAIL;

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
            active={currentNav.view === ViewState.DASHBOARD} 
            icon={<Icons.Dashboard />} 
            onClick={() => handleNav(ViewState.DASHBOARD)} 
          />
          <NavItem 
            label="Sales & Invoices" 
            active={isSalesActive} 
            icon={<Icons.Sales />} 
            onClick={() => handleNav(ViewState.SALES)} 
          />
          <NavItem 
            label="Inventory" 
            active={isInventoryActive} 
            icon={<Icons.Inventory />} 
            onClick={() => handleNav(ViewState.INVENTORY)} 
          />
          
          {canViewFinance && (
            <NavItem 
              label="Finance" 
              active={currentNav.view === ViewState.FINANCE} 
              icon={<Icons.Finance />} 
              onClick={() => handleNav(ViewState.FINANCE)} 
            />
          )}
          
          {canViewHR && (
            <NavItem 
              label="HR & Team" 
              active={isHRActive} 
              icon={<Icons.HR />} 
              onClick={() => handleNav(ViewState.HR)} 
            />
          )}
          
          <NavItem 
            label="Operations" 
            active={isOpsActive} 
            icon={<Icons.Operations />} 
            onClick={() => handleNav(ViewState.OPERATIONS)} 
          />
          
          {canViewMarketing && (
            <NavItem 
              label="Marketing" 
              active={currentNav.view === ViewState.MARKETING} 
              icon={<Icons.Marketing />} 
              onClick={() => handleNav(ViewState.MARKETING)} 
            />
          )}

          <NavItem 
            label="Communications" 
            active={currentNav.view === ViewState.COMMS} 
            icon={<Icons.Comms />} 
            onClick={() => handleNav(ViewState.COMMS)} 
          />
          
          {canViewSettings && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <NavItem 
                label="Settings" 
                active={currentNav.view === ViewState.SETTINGS} 
                icon={<Icons.Settings />} 
                onClick={() => handleNav(ViewState.SETTINGS)} 
              />
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors w-full"
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

        {/* Desktop Top Bar */}
        <header className="hidden md:flex justify-between items-center p-4 bg-white border-b border-slate-200 z-10">
           <div className="text-sm text-slate-500">
              {org.name} <span className="mx-2">/</span> <span className="font-semibold text-slate-900 capitalize">{currentNav.view.replace('_', ' ').toLowerCase()}</span>
           </div>
           
           <div className="flex items-center space-x-6">
              {/* Notification Center */}
              <div className="relative">
                 <button 
                   onClick={() => setShowNotifications(!showNotifications)}
                   className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
                 >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                 </button>

                 {/* Dropdown */}
                 {showNotifications && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                     <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                           <h3 className="font-bold text-slate-900">Notifications</h3>
                           {unreadCount > 0 && (
                             <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Mark all read</button>
                           )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                           {notifications.length === 0 ? (
                             <div className="p-8 text-center text-slate-400 text-sm">No notifications</div>
                           ) : (
                             notifications.map(notif => (
                               <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-indigo-50/50' : ''}`}>
                                  <div className="flex items-start space-x-3">
                                     <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                        notif.type === 'error' ? 'bg-red-500' : 
                                        notif.type === 'success' ? 'bg-green-500' : 
                                        notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                     }`}></div>
                                     <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-2">{notif.timestamp}</p>
                                     </div>
                                  </div>
                               </div>
                             ))
                           )}
                        </div>
                     </div>
                   </>
                 )}
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
                 <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                    {user.fullName.charAt(0)}
                 </div>
              </div>
           </div>
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
              <NavItem label="Dashboard" active={currentNav.view === ViewState.DASHBOARD} icon={<Icons.Dashboard />} onClick={() => handleNav(ViewState.DASHBOARD)} />
              <NavItem label="Sales" active={isSalesActive} icon={<Icons.Sales />} onClick={() => handleNav(ViewState.SALES)} />
              <NavItem label="Inventory" active={isInventoryActive} icon={<Icons.Inventory />} onClick={() => handleNav(ViewState.INVENTORY)} />
              
              {canViewFinance && <NavItem label="Finance" active={currentNav.view === ViewState.FINANCE} icon={<Icons.Finance />} onClick={() => handleNav(ViewState.FINANCE)} />}
              {canViewHR && <NavItem label="HR" active={isHRActive} icon={<Icons.HR />} onClick={() => handleNav(ViewState.HR)} />}
              
              <NavItem label="Operations" active={isOpsActive} icon={<Icons.Operations />} onClick={() => handleNav(ViewState.OPERATIONS)} />
              
              {canViewMarketing && <NavItem label="Marketing" active={currentNav.view === ViewState.MARKETING} icon={<Icons.Marketing />} onClick={() => handleNav(ViewState.MARKETING)} />}

              <NavItem label="Comms" active={currentNav.view === ViewState.COMMS} icon={<Icons.Comms />} onClick={() => handleNav(ViewState.COMMS)} />
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