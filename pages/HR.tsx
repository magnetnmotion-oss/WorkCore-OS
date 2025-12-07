import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Employee, ViewState } from '../types';

interface HRProps {
  onNavigate?: (view: ViewState, data: any) => void;
}

export const HR: React.FC<HRProps> = ({ onNavigate }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    role: '',
    department: '',
    salary: '',
    joinDate: ''
  });

  useEffect(() => {
    apiFetch('/api/v1/employees').then(setEmployees);
  }, []);

  const handleAddEmployee = async () => {
    if (!newEmployee.fullName || !newEmployee.role) return;
    
    try {
      const added = await apiFetch('/api/v1/employees', {
        method: 'POST',
        body: JSON.stringify(newEmployee)
      });
      setEmployees(prev => [...prev, added]);
      setShowAddModal(false);
      setNewEmployee({ fullName: '', role: '', department: '', salary: '', joinDate: '' });
      alert("Employee added successfully!");
    } catch (e) {
      console.error("Failed to add employee", e);
      alert("Failed to add employee.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">HR & Team</h2>
          <p className="text-slate-500">Manage employees and payroll status.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => downloadCSV(employees, 'employees_export')}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp) => (
          <div 
            key={emp.id} 
            onClick={() => onNavigate && onNavigate(ViewState.EMPLOYEE_DETAIL, emp.id)}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
              {emp.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{emp.fullName}</h3>
              <p className="text-sm text-slate-500">{emp.role} • {emp.department}</p>
            </div>
            <div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {emp.status}
              </span>
            </div>
          </div>
        ))}
        {/* 'Add New' Visual Card */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
        >
          <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="text-sm font-medium">Register New Staff</span>
        </button>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in relative">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Register New Employee</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={newEmployee.fullName} 
                      onChange={e => setNewEmployee({...newEmployee, fullName: e.target.value})} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Role / Title</label>
                       <input 
                         type="text" 
                         value={newEmployee.role} 
                         onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} 
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                       <input 
                         type="text" 
                         value={newEmployee.department} 
                         onChange={e => setNewEmployee({...newEmployee, department: e.target.value})} 
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Salary</label>
                       <input 
                         type="number" 
                         value={newEmployee.salary} 
                         onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})} 
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                       <input 
                         type="date" 
                         value={newEmployee.joinDate} 
                         onChange={e => setNewEmployee({...newEmployee, joinDate: e.target.value})} 
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                       />
                    </div>
                 </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                 <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button onClick={handleAddEmployee} className="px-6 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg">Add Employee</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};