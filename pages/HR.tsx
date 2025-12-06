import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Employee } from '../types';

export const HR: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    apiFetch('/api/v1/employees').then(setEmployees);
  }, []);

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
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
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
        {/* Placeholder for 'Add New' visual */}
        <button className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
          <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="text-sm font-medium">Register New Staff</span>
        </button>
      </div>
    </div>
  );
};