
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Employee, ViewState } from '../types';

interface HRProps {
  onNavigate?: (view: ViewState, data: any) => void;
}

export const HR: React.FC<HRProps> = ({ onNavigate }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    role: '',
    department: '',
    salary: '',
    joinDate: ''
  });

  useEffect(() => {
    apiFetch('/api/v1/employees').then(data => {
       setEmployees(data);
       setLoading(false);
    });
  }, []);

  const handleAddEmployee = async () => {
    if (!newEmployee.fullName || !newEmployee.role) return;
    try {
      const added = await apiFetch('/api/v1/employees', {
        method: 'POST',
        body: JSON.stringify(newEmployee)
      });
      setEmployees(prev => [added, ...prev]);
      setShowAddModal(false);
      setNewEmployee({ fullName: '', role: '', department: '', salary: '', joinDate: '' });
    } catch (e) {
      alert("Failed to add employee.");
    }
  };

  const activeCount = employees.filter(e => e.status === 'active').length;
  const leaveCount = employees.filter(e => e.status === 'on_leave').length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Team OS</h2>
          <p className="text-slate-500 text-sm">Staff Attendance & Payroll.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
          >
            + Register Staff
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Active Today</p>
            <h3 className="text-4xl font-bold text-slate-900">{activeCount}</h3>
            <p className="text-xs text-green-600 font-bold mt-2">Checking in via OMMI App</p>
         </div>
         <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">On Leave</p>
            <h3 className="text-4xl font-bold text-slate-900">{leaveCount}</h3>
            <button className="text-xs text-blue-800 font-bold mt-2 hover:underline">Manage Requests &rarr;</button>
         </div>
         <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-3xl"></div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Payroll Cycle</p>
            <h3 className="text-2xl font-bold mb-4">Feb 2025</h3>
            <button className="w-full bg-blue-600 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">Run Payroll</button>
         </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 uppercase font-black text-xs animate-pulse">Syncing Team Records...</div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-slate-200 p-20 text-center flex flex-col items-center shadow-sm">
           <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-8">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
           </div>
           <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Start your team</h3>
           <p className="text-slate-500 mt-2 max-w-sm mx-auto">Build your company directory. Add employees to manage payroll, leave, and system permissions.</p>
           <button onClick={() => setShowAddModal(true)} className="mt-10 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform active:scale-95">Register First Staff</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div 
              key={emp.id} 
              onClick={() => onNavigate && onNavigate(ViewState.EMPLOYEE_DETAIL, emp.id)}
              className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-[18px] bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl shadow-inner group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {emp.fullName.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-800 transition-colors truncate">{emp.fullName}</h3>
                  <p className="text-xs text-slate-400 font-medium tracking-tight truncate">{emp.role} • {emp.department}</p>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${emp.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
              </div>
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                 <div className="text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Monthly Salary</p>
                    <p className="text-sm font-bold text-slate-900">KES {(emp.salary || 0).toLocaleString()}</p>
                 </div>
                 <button className="text-[10px] font-black uppercase text-blue-700 hover:underline">View Profile &rarr;</button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all group"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="font-bold text-sm">Register New Staff</span>
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Register Staff</h3>
                <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-8">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      value={newEmployee.fullName} 
                      onChange={e => setNewEmployee({...newEmployee, fullName: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-800 transition-all" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role / Designation</label>
                       <input 
                         type="text" 
                         value={newEmployee.role} 
                         onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none transition-all" 
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                       <input 
                         type="text" 
                         value={newEmployee.department} 
                         onChange={e => setNewEmployee({...newEmployee, department: e.target.value})} 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none transition-all" 
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Salary</label>
                       <input 
                         type="number" 
                         value={newEmployee.salary} 
                         onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})} 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none transition-all" 
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Date</label>
                       <input 
                         type="date" 
                         value={newEmployee.joinDate} 
                         onChange={e => setNewEmployee({...newEmployee, joinDate: e.target.value})} 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none transition-all" 
                       />
                    </div>
                 </div>
              </div>
              <div className="mt-12 flex justify-end space-x-4 pt-8 border-t border-slate-100">
                 <button onClick={() => setShowAddModal(false)} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Discard</button>
                 <button onClick={handleAddEmployee} className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95">Register Team</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
