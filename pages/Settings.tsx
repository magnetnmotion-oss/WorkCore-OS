import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Module, Organization, SubscriptionPlan, AddOn, User } from '../types';
import { SUBSCRIPTION_PLANS, AVAILABLE_ADDONS } from '../constants';

export const Upgrade: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'team'>('billing');
  const [modules, setModules] = useState<Module[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // New User Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'manager' | 'staff'>('staff');

  // Edit Org Modal State
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [editOrgName, setEditOrgName] = useState('');
  const [editOrgPhone, setEditOrgPhone] = useState('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'plan' | 'addon', item: SubscriptionPlan | AddOn } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/orgs/org-1'),
      apiFetch('/api/v1/orgs/org-1/modules'),
      apiFetch('/api/v1/users')
    ]).then(([orgData, modulesData, usersData]) => {
      setOrg(orgData);
      setModules(modulesData);
      setUsers(usersData);
      setLoading(false);
    });
  }, []);

  const handleResetDemo = async () => {
    if (confirm("This will reset the organization status to 'Pending' to demonstrate the First-Time Setup Wizard. Continue?")) {
      await apiFetch('/api/v1/setup/reset', { method: 'POST' });
      window.location.reload();
    }
  };

  const handleInviteUser = async () => {
    if (!newUserEmail) return;
    try {
      const newUser = await apiFetch('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify({
          email: newUserEmail,
          fullName: 'Pending User',
          role: newUserRole
        })
      });
      setUsers([...users, newUser]);
      setShowInviteModal(false);
      setNewUserEmail('');
      alert("Invitation sent!");
    } catch (e) {
      alert("Failed to invite user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to remove this user?")) {
      await apiFetch(`/api/v1/users/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const toggleModule = async (moduleId: string, currentState: boolean) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, enabled: !currentState } : m));
    try {
      if (!currentState) {
         await apiFetch(`/api/v1/orgs/org-1/modules/${moduleId}/enable`, { method: 'POST' });
      } else {
         await new Promise(r => setTimeout(r, 500));
      }
    } catch (e) {
      setModules(prev => prev.map(m => m.id === moduleId ? { ...m, enabled: currentState } : m));
    }
  };

  const openEditOrgModal = () => {
      if (org) {
          setEditOrgName(org.name);
          setEditOrgPhone(org.phone || '');
          setShowEditOrgModal(true);
      }
  };

  const handleSaveOrg = () => {
      if (org) {
          // Optimistic update
          setOrg({ ...org, name: editOrgName, phone: editOrgPhone });
          setShowEditOrgModal(false);
      }
  };

  const initiatePayment = (type: 'plan' | 'addon', item: SubscriptionPlan | AddOn) => {
    setSelectedItem({ type, item });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedItem) return;
    setPaymentProcessing(true);

    try {
      if (selectedItem.type === 'plan') {
        const plan = selectedItem.item as SubscriptionPlan;
        await apiFetch('/api/v1/subscription/upgrade', {
          method: 'POST',
          body: JSON.stringify({ planId: plan.id, paymentMethod, phoneNumber })
        });
        // Optimistic update
        if (org) setOrg({ ...org, plan: plan.id, subscription: { ...org.subscription, planId: plan.id } });
      } else {
        const addon = selectedItem.item as AddOn;
        await apiFetch('/api/v1/addons/purchase', {
           method: 'POST',
           body: JSON.stringify({ addonId: addon.id, paymentMethod, phoneNumber })
        });
        // Optimistic update
        if (org) setOrg({ ...org, unlockedFeatures: [...org.unlockedFeatures, addon.id] });
      }
      
      setShowPaymentModal(false);
      setSelectedItem(null);
      alert("Payment Successful! Feature unlocked.");
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading upgrade options...</div>;

  // SUBSCRIPTION ENFORCEMENT LOGIC
  const staffLimit = org?.limits.staff.max || 1;
  const currentStaff = org?.limits.staff.current || 1;
  const isStaffLimitReached = staffLimit !== -1 && currentStaff >= staffLimit;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Navigation */}
      <div className="flex justify-between items-center border-b border-slate-200">
         <div>
            <h2 className="text-2xl font-bold text-slate-900">Upgrade Plan</h2>
            <p className="text-slate-500 mb-4">Choose a plan that fits your business needs.</p>
         </div>
         <nav className="flex space-x-6">
            <button 
              onClick={() => setActiveTab('billing')}
              className={`pb-4 font-medium text-sm ${activeTab === 'billing' ? 'border-b-2 border-blue-900 text-blue-900' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Plans & Billing
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`pb-4 font-medium text-sm ${activeTab === 'profile' ? 'border-b-2 border-blue-900 text-blue-900' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Modules & Settings
            </button>
            <button 
              onClick={() => setActiveTab('team')}
              className={`pb-4 font-medium text-sm ${activeTab === 'team' ? 'border-b-2 border-blue-900 text-blue-900' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Team & Roles
            </button>
         </nav>
      </div>

      {activeTab === 'profile' && (
        <>
        {/* Demo Reset Button */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex justify-between items-center">
           <div>
             <h4 className="font-bold text-yellow-800">Demo Controls</h4>
             <p className="text-sm text-yellow-700">Simulate a new user signup flow.</p>
           </div>
           <button onClick={handleResetDemo} className="px-4 py-2 bg-yellow-600 text-white text-sm font-bold rounded-lg hover:bg-yellow-700">
             Reset to Setup Wizard
           </button>
        </div>

        {/* Organization Profile */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Organization Profile</h3>
            <button onClick={openEditOrgModal} className="text-blue-900 text-sm font-medium hover:underline">Edit Details</button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Company Name</label>
              <p className="text-slate-900 font-medium">{org?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Industry</label>
              <p className="text-slate-900">{org?.industry || 'Not Set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Currency</label>
              <p className="text-slate-900">{org?.currency}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Tax ID</label>
              <p className="text-slate-900">{org?.taxNumber || 'Not Set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Phone</label>
              <p className="text-slate-900">{org?.phone || 'Not Set'}</p>
            </div>
          </div>
        </section>

        {/* Module Marketplace */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">OMMI Modules</h3>
            <p className="text-sm text-slate-500">Enable or disable microservices for your organization.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(mod => (
              <div key={mod.id} className={`flex flex-col rounded-xl border p-6 transition-all ${
                mod.enabled ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-75 grayscale-[0.5]'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${mod.enabled ? 'bg-blue-50 text-blue-900' : 'bg-slate-200 text-slate-500'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <button 
                        onClick={() => toggleModule(mod.id, mod.enabled)}
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${mod.enabled ? 'bg-blue-900' : 'bg-slate-300'}`}
                      >
                        <span className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${mod.enabled ? 'translate-x-4' : 'translate-x-0'}`}></span>
                      </button>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900">{mod.name}</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4 h-8">{mod.description}</p>
                <span className={`text-xs px-2 py-1 rounded inline-block w-fit ${mod.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {mod.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </section>
        </>
      )}

      {activeTab === 'team' && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">User Management</h3>
                <p className="text-sm text-slate-500">
                   {currentStaff} / {staffLimit === -1 ? '∞' : staffLimit} Licenses Used
                </p>
              </div>
              <div className="relative group">
                <button 
                  onClick={() => setShowInviteModal(true)}
                  disabled={isStaffLimitReached}
                  className={`bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all ${isStaffLimitReached ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'}`}
                >
                  + Invite User
                </button>
                {isStaffLimitReached && (
                   <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Upgrade plan to add more team members.
                   </div>
                )}
              </div>
           </div>
           
           <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                 <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50">
                       <td className="px-6 py-4">
                          <div className="flex items-center">
                             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs mr-3">
                                {user.fullName[0]}
                             </div>
                             <div>
                                <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded border capitalize ${
                             user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                             user.role === 'manager' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                             'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                             {user.role}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`text-xs font-bold ${user.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>
                             {user.status === 'active' ? 'Active' : 'Pending Invite'}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                             Remove
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </section>
      )}

      {activeTab === 'billing' && (
        <>
          {/* Usage Stats (Free Tier Logic) */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Current Usage</h3>
                  <p className="text-sm text-slate-500">Plan: <span className="font-bold uppercase text-blue-900">{org?.plan}</span></p>
                </div>
                {org?.plan === 'free' && (
                  <div className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                     Upgrade to unlock unlimited access
                  </div>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contacts Usage */}
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Contacts</span>
                      <span className="font-medium">{org?.limits.contacts.current} / {org?.limits.contacts.max === -1 ? '∞' : org?.limits.contacts.max}</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${org?.limits.contacts.current! >= org?.limits.contacts.max! ? 'bg-red-500' : 'bg-blue-900'}`} 
                        style={{ width: org?.limits.contacts.max === -1 ? '5%' : `${(org?.limits.contacts.current! / org?.limits.contacts.max!) * 100}%` }}
                      ></div>
                   </div>
                </div>
                
                {/* Invoices Usage */}
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Monthly Invoices</span>
                      <span className="font-medium">{org?.limits.invoices.current} / {org?.limits.invoices.max === -1 ? '∞' : org?.limits.invoices.max}</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${org?.limits.invoices.current! >= org?.limits.invoices.max! ? 'bg-red-500' : 'bg-blue-600'}`} 
                        style={{ width: org?.limits.invoices.max === -1 ? '5%' : `${(org?.limits.invoices.current! / org?.limits.invoices.max!) * 100}%` }}
                      ></div>
                   </div>
                </div>

                {/* Storage Usage */}
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Storage (MB)</span>
                      <span className="font-medium">{org?.limits.storage.current} / {org?.limits.storage.max}</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-slate-500 h-2 rounded-full" 
                        style={{ width: `${(org?.limits.storage.current! / org?.limits.storage.max!) * 100}%` }}
                      ></div>
                   </div>
                </div>
             </div>
          </section>

          {/* Subscription Plans */}
          <section className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Subscription Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {SUBSCRIPTION_PLANS.map(plan => (
                  <div key={plan.id} className={`bg-white rounded-xl p-6 border flex flex-col ${plan.recommended ? 'border-blue-500 shadow-md ring-1 ring-blue-500 relative' : 'border-slate-200'}`}>
                     {plan.recommended && <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Most Popular</span>}
                     <h4 className="font-bold text-slate-900 text-lg">{plan.name}</h4>
                     <div className="my-4">
                        <span className="text-3xl font-bold text-slate-900">{plan.price === 0 ? 'Free' : plan.price.toLocaleString()}</span>
                        {plan.price > 0 && <span className="text-slate-500 text-sm ml-1">{plan.currency} / {plan.period}</span>}
                     </div>
                     <ul className="space-y-3 mb-6 flex-1">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-600">
                             <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             {feat}
                          </li>
                        ))}
                     </ul>
                     <button 
                       onClick={() => plan.price > 0 && initiatePayment('plan', plan)}
                       disabled={org?.plan === plan.id}
                       className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${org?.plan === plan.id ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-blue-900 text-white hover:bg-blue-800'}`}
                     >
                       {org?.plan === plan.id ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                     </button>
                  </div>
               ))}
            </div>
          </section>

          {/* Add-ons Store */}
          <section>
             <h3 className="text-lg font-bold text-slate-900 mb-6">One-Time Purchases (Add-ons)</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AVAILABLE_ADDONS.map(addon => {
                   const isPurchased = org?.unlockedFeatures.includes(addon.id);
                   return (
                    <div key={addon.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                       <h4 className="font-bold text-slate-900">{addon.name}</h4>
                       <p className="text-sm text-slate-500 mt-1 mb-4 flex-1">{addon.description}</p>
                       <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                          <span className="font-bold text-slate-900">{addon.price.toLocaleString()} {addon.currency}</span>
                          {isPurchased ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium flex items-center">
                               <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                               Purchased
                            </span>
                          ) : (
                            <button 
                              onClick={() => initiatePayment('addon', addon)}
                              className="text-xs bg-white border border-blue-900 text-blue-900 px-3 py-1.5 rounded font-medium hover:bg-blue-50"
                            >
                               Buy Now
                            </button>
                          )}
                       </div>
                    </div>
                   );
                })}
             </div>
          </section>
        </>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Invite New User</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={newUserEmail} 
                      onChange={e => setNewUserEmail(e.target.value)} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-900" 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select 
                      value={newUserRole} 
                      onChange={e => setNewUserRole(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none"
                    >
                       <option value="manager">Manager</option>
                       <option value="staff">Staff</option>
                       <option value="admin">Admin</option>
                    </select>
                 </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                 <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button onClick={handleInviteUser} className="px-4 py-2 bg-blue-900 text-white font-medium hover:bg-blue-800 rounded-lg">Send Invitation</button>
              </div>
           </div>
        </div>
      )}

      {/* Edit Org Modal */}
      {showEditOrgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Profile</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={editOrgName} 
                      onChange={e => setEditOrgName(e.target.value)} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-900" 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={editOrgPhone} 
                      onChange={e => setEditOrgPhone(e.target.value)} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-900" 
                    />
                 </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                 <button onClick={() => setShowEditOrgModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button onClick={handleSaveOrg} className="px-4 py-2 bg-blue-900 text-white font-medium hover:bg-blue-800 rounded-lg">Save Changes</button>
              </div>
           </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-900">Confirm Purchase</h3>
                 <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <p className="text-sm text-slate-500">{selectedItem.type === 'plan' ? 'Subscription' : 'One-time Addon'}</p>
                       <h4 className="text-xl font-bold text-slate-900">{selectedItem.item.name}</h4>
                    </div>
                    <div className="text-right">
                       <span className="block text-xl font-bold text-blue-900">{selectedItem.item.price.toLocaleString()}</span>
                       <span className="text-xs text-slate-500 uppercase">{selectedItem.item.currency}</span>
                    </div>
                 </div>

                 {/* Payment Method Selector */}
                 <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-slate-700">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => setPaymentMethod('mpesa')}
                         className={`p-3 rounded-lg border flex flex-col items-center justify-center ${paymentMethod === 'mpesa' ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500' : 'border-slate-200 hover:bg-slate-50'}`}
                       >
                          <span className="font-bold">M-PESA</span>
                          <span className="text-[10px] text-slate-500">Instant Mobile Money</span>
                       </button>
                       <button 
                         onClick={() => setPaymentMethod('card')}
                         className={`p-3 rounded-lg border flex flex-col items-center justify-center ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}
                       >
                          <span className="font-bold">Card</span>
                          <span className="text-[10px] text-slate-500">Visa / Mastercard</span>
                       </button>
                    </div>
                 </div>

                 {/* Payment Details Form */}
                 {paymentMethod === 'mpesa' ? (
                    <div className="mb-6">
                       <label className="block text-sm font-medium text-slate-700 mb-1">M-Pesa Phone Number</label>
                       <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🇰🇪 +254</span>
                          <input 
                            type="tel" 
                            placeholder="712 345 678" 
                            className="w-full pl-16 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                          />
                       </div>
                       <p className="text-xs text-slate-500 mt-2">You will receive an STK push on your phone to complete the payment.</p>
                    </div>
                 ) : (
                    <div className="mb-6 space-y-3">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                          <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Expiry</label>
                             <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                             <input type="text" placeholder="123" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                          </div>
                       </div>
                    </div>
                 )}

                 <button 
                   onClick={handlePaymentSubmit}
                   disabled={paymentProcessing}
                   className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
                      paymentProcessing ? 'bg-slate-400 cursor-wait' : 
                      paymentMethod === 'mpesa' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                   }`}
                 >
                    {paymentProcessing ? 'Processing...' : `Pay ${selectedItem.item.price.toLocaleString()} ${selectedItem.item.currency}`}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};