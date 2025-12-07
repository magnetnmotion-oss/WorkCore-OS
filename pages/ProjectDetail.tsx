import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { Project, Task } from '../types';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    Promise.all([
        apiFetch('/api/v1/projects'),
        apiFetch('/api/v1/tasks')
    ]).then(([pList, tList]) => {
        setProject((pList as Project[]).find(p => p.id === projectId) || null);
        setTasks((tList as Task[]).filter(t => t.projectId === projectId));
    });
  }, [projectId]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
       <div className="flex justify-between items-start">
         <div>
            <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 flex items-center space-x-2 text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span>Back to Operations</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-slate-500">{project.manager} • Due {project.dueDate}</p>
         </div>
         <div className="flex space-x-2">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">+ Add Task</button>
         </div>
       </div>

       {/* Kanban Board Simulation */}
       <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-[500px]">
          {['todo', 'in_progress', 'done'].map(status => (
             <div key={status} className="bg-slate-100 rounded-xl p-4 flex flex-col h-full">
                <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">
                   {status.replace('_', ' ')}
                </h3>
                <div className="space-y-3 overflow-y-auto flex-1">
                   {tasks.filter(t => t.status === status).map(task => (
                      <div key={task.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow">
                         <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-slate-900 text-sm leading-tight">{task.title}</h4>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                         </div>
                         <div className="flex justify-between items-center text-xs text-slate-500">
                             <span>{task.assignedTo}</span>
                             <span>{task.dueDate}</span>
                         </div>
                      </div>
                   ))}
                   {tasks.filter(t => t.status === status).length === 0 && (
                       <div className="text-center py-10 text-slate-400 text-sm italic">No tasks</div>
                   )}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};