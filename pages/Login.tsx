import React, { useState } from 'react';
import { apiFetch } from '../lib/api';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await apiFetch('/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
      } else {
        await apiFetch('/api/v1/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ 
            email: formData.email, 
            password: formData.password,
            fullName: formData.fullName
          })
        });
      }
      // In a real app, store token here
      onLogin();
    } catch (error) {
      console.error("Authentication failed", error);
      alert(mode === 'login' ? "Login failed. Try demo@ommi.io / password" : "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-500 bg-clip-text text-transparent">OMMI</h1>
          <p className="text-slate-500 mt-2">Unified Operating System for SMEs</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-white shadow text-blue-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'signup' ? 'bg-white shadow text-blue-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                placeholder="John Doe"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Start Free Trial'}
          </button>
        </form>

        {mode === 'signup' && (
           <p className="text-xs text-center text-slate-400 mt-4">
             By signing up, you agree to our Terms of Service and Privacy Policy.
             <br/> You will be assigned as the <strong>Admin</strong> for your workspace.
           </p>
        )}

        <div className="mt-6 text-center pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            © 2024 OMMI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};