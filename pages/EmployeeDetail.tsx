import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { Employee } from '../types';

interface EmployeeDetailProps {
  employeeId: string;
  onBack: () => void;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employeeId, onBack }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  
  useEffect(() => {
    apiFetch('/api/v1/employees').then((list: Employee[]) => {
      const found = list.find(e => e.id === employeeId);
      if (found) {
          found.salary = found.salary || 45000; 
          found.joinDate = found.joinDate || '2023-01-15';
      }
      setEmployee(found || null);
    });
  }, [employeeId]);

  if (!employee) return <div>Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="text-slate-500 hover:text-blue-800 flex items-center space-x-2 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        <span>Back to Team</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-700 to-blue-900"></div>
        
        <div className="px-8 pb-8">
           <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="flex items-end">
                  <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                      <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-600">
                          {employee.fullName.charAt(0)}
                      </div>
                  </div>
                  <div className="ml-4 mb-2">
                      <h1 className="text-2xl font-bold text-slate-900">{employee.fullName}</h1>
                      <p className="text-slate-500">{employee.role} • {employee.department}</p>
                  </div>
              </div>
              <div className="mb-2 space-x-3">
                 <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Edit Profile</button>
                 <button className="px-4 py-2 bg-blue-800 text-white rounded-lg text-sm font-medium hover:bg-blue-900">Run Payroll</button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="space-y-4">
                 <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Employment Details</h3>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                       <p className="text-slate-500">Status</p>
                       <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{employee.status}</span>
                    </div>
                    <div>
                       <p className="text-slate-500">Joined</p>
                       <p className="font-medium">{employee.joinDate}</p>
                    </div>
                    <div>
                       <p className="text-slate-500">Salary</p>
                       <p className="font-medium">KES {employee.salary?.toLocaleString()}/mo</p>
                    </div>
                 </div>
              </div>

              {/* Leave Balance */}
              <div className="space-y-4">
                 <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Leave Balance</h3>
                 <div className="flex space-x-4">
                    <div className="bg-slate-50 p-3 rounded-lg flex-1 text-center">
                       <p className="text-2xl font-bold text-blue-800">12</p>
                       <p className="text-xs text-slate-500 uppercase font-bold">Annual</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg flex-1 text-center">
                       <p className="text-2xl font-bold text-slate-600">5</p>
                       <p className="text-xs text-slate-500 uppercase font-bold">Sick</p>
                    </div>
                 </div>
                 <button className="text-blue-800 text-sm font-medium hover:underline block text-center w-full">Request Leave</button>
              </div>

              {/* Attendance */}
              <div className="space-y-4">
                 <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Activity Log</h3>
                 <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                       <span className="text-slate-600">Checked In</span>
                       <span className="font-mono text-slate-900">08:58 AM</span>
                    </li>
                    <li className="flex justify-between">
                       <span className="text-slate-600">Yesterday</span>
                       <span className="font-mono text-slate-900">09:02 AM - 05:00 PM</span>
                    </li>
                 </ul>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};