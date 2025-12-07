import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Project, Task, ViewState } from '../types';

interface OperationsProps {
  onNavigate?: (view: ViewState, data: any) => void;
}

export const Operations: React.FC<OperationsProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New Project Modal State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    manager: '',
    budget: '',
    dueDate: '',
    description: ''
  });

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/projects'),
      apiFetch('/api/v1/tasks')
    ]).then(([p, t]) => {
      setProjects(p);
      setTasks(t);
      setLoading(false);
    });
  }, []);

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.manager) return;
    try {
      const created = await apiFetch('/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify(newProject)
      });
      setProjects(prev => [created, ...prev]);
      setShowProjectModal(false);
      setNewProject({ name: '', manager: '', budget: '', dueDate: '', description: '' });
      alert("Project created successfully!");
    } catch (e) {
      alert("Failed to create project");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Operations</h2>
          <p className="text-slate-500">Manage projects, tasks, and deliverables.</p>
        </div>
        <div className="flex space-x-3">
           <button 
             onClick={() => downloadCSV(projects, 'projects_export')}
             className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
           >
             <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             Export Projects
           </button>
           <button 
             onClick={() => setShowProjectModal(true)}
             className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
           >
             + New Project
           </button>
        </div>
      </div>

      {/* Projects Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Active Projects</h3>
        {loading ? (
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
             <p className="text-slate-500 mb-4">No active projects. Start organizing your work.</p>
             <button onClick={() => setShowProjectModal(true)} className="text-blue-800 font-medium hover:underline">Create First Project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div 
                key={proj.id} 
                onClick={() => onNavigate && onNavigate(ViewState.PROJECT_DETAIL, proj.id)}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-48 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{proj.name}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      proj.status === 'active' ? 'bg-green-100 text-green-800' :
                      proj.status === 'delayed' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-1">Mgr: {proj.manager}</p>
                  <p className="text-sm text-slate-500">Due: {proj.dueDate}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-900">KES {proj.budget.toLocaleString()}</span>
                  <span className="text-blue-800 text-sm font-medium">View Details &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tasks Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">All Tasks</h3>
          <div className="flex space-x-3">
            <button 
              onClick={() => downloadCSV(tasks, 'tasks_export')}
              className="text-sm text-slate-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
            <button className="text-sm text-blue-800 font-medium hover:underline">+ New Task</button>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
          {tasks.length === 0 ? (
             <div className="p-8 text-center text-slate-400">
               No tasks found. Create a project to add tasks.
             </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {tasks.map((task) => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <tr 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{task.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{project?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{task.assignedTo}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{task.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          task.priority === 'high' ? 'bg-red-50 text-red-600' :
                          task.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'done' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {task.status === 'in_progress' ? 'In Progress' : task.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Start New Project</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                    <input 
                      type="text" 
                      value={newProject.name} 
                      onChange={e => setNewProject({...newProject, name: e.target.value})} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Manager</label>
                        <input 
                          type="text" 
                          value={newProject.manager} 
                          onChange={e => setNewProject({...newProject, manager: e.target.value})} 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Budget (KES)</label>
                        <input 
                          type="number" 
                          value={newProject.budget} 
                          onChange={e => setNewProject({...newProject, budget: e.target.value})} 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                    <input 
                      type="date" 
                      value={newProject.dueDate} 
                      onChange={e => setNewProject({...newProject, dueDate: e.target.value})} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      value={newProject.description} 
                      onChange={e => setNewProject({...newProject, description: e.target.value})} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800 h-24 resize-none" 
                    />
                 </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                 <button onClick={() => setShowProjectModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button onClick={handleCreateProject} className="px-6 py-2 bg-blue-800 text-white font-medium hover:bg-blue-900 rounded-lg">Create Project</button>
              </div>
           </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in relative">
              <button 
                onClick={() => setSelectedTask(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="mb-6">
                 <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                    selectedTask.priority === 'high' ? 'bg-red-100 text-red-700' :
                    selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-600'
                 }`}>
                    {selectedTask.priority} Priority
                 </span>
                 <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedTask.title}</h3>
                 <p className="text-sm text-slate-500 mt-1">Project: {projects.find(p => p.id === selectedTask.projectId)?.name || 'Unknown'}</p>
              </div>

              <div className="space-y-4">
                 <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                       <span className="text-sm text-slate-500 font-medium">Assignee</span>
                       <span className="text-sm font-bold text-slate-900">{selectedTask.assignedTo}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-sm text-slate-500 font-medium">Due Date</span>
                       <span className="text-sm font-bold text-slate-900">{selectedTask.dueDate}</span>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <div className="flex space-x-2">
                       {['todo', 'in_progress', 'done'].map((status) => (
                          <button
                             key={status}
                             className={`flex-1 py-2 text-sm rounded-lg border capitalize ${
                                selectedTask.status === status 
                                   ? 'bg-blue-800 text-white border-blue-800' 
                                   : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                             }`}
                          >
                             {status.replace('_', ' ')}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                 <button 
                   onClick={() => setSelectedTask(null)}
                   className="text-slate-500 hover:text-blue-800 text-sm font-medium"
                 >
                    Close Details
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};