
import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { User } from '../types';
import { Logo } from '../components/Logo';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = mode === 'login' 
        ? await apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        : await apiFetch('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, fullName }) });
      
      if (response?.user) {
        onLogin(response.user);
      }
    } catch (error) {
      alert("Authentication failed. Use demo@ommi.io / password for testing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="dark-glass w-full max-w-[440px] p-10 lg:p-12 rounded-[48px] shadow-2xl relative z-10 animate-fade-in border border-white/5">
        <div className="text-center mb-10">
          <Logo className="h-10 mb-10 mx-auto" variant="light" />
          <h2 className="text-4xl font-bold text-white tracking-tight mb-3">
            {mode === 'login' ? 'Welcome back' : 'Start Growing'}<span className="text-orange-500">.</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            {mode === 'login' ? 'Sign in to OMMI OS' : 'Create your SME command center'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="Alex Kamau"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
             <div className="relative group flex items-center">
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
             </div>
          </div>

          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
             <div className="relative group flex items-center">
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
             </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all shadow-xl shadow-white/5 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Enter Workspace' : 'Create Account'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-slate-400 text-sm font-medium hover:text-white transition-colors"
          >
            {mode === 'login' ? "Don't have an account? " : "Already using OMMI? "}
            <span className="text-orange-500 font-bold ml-1">{mode === 'login' ? 'Sign Up' : 'Sign In'}</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 w-full flex justify-center space-x-8 opacity-20 pointer-events-none">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Encrypted</span>
        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Global Sync</span>
        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">AI Native</span>
      </div>
    </div>
  );
};
