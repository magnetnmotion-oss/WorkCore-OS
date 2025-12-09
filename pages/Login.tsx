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
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      if (mode === 'login') {
        response = await apiFetch('/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
      } else {
        response = await apiFetch('/api/v1/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ 
            email: formData.email, 
            password: formData.password,
            fullName: formData.fullName
          })
        });
      }
      
      if (response && response.user) {
        onLogin(response.user);
      }
    } catch (error) {
      console.error("Authentication failed", error);
      alert(mode === 'login' ? "Login failed. Try demo@ommi.io / password" : "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-300 to-yellow-300"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-400 rounded-full blur-3xl opacity-50"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="flex justify-center mb-6 transform scale-125">
             <Logo className="h-16 w-auto" variant="light" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to WorkCore</h2>
          <p className="text-white/80 font-medium">Unified Operating System for SMEs</p>
        </div>

        <div className="flex bg-black/20 p-1 rounded-xl mb-8 relative z-10 backdrop-blur-sm">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-orange-600 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-orange-600 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {mode === 'signup' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold uppercase text-white/80 mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/20 text-white placeholder-white/50 focus:bg-white focus:text-slate-900 focus:border-orange-300 outline-none transition-all font-medium"
                placeholder="John Doe"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold uppercase text-white/80 mb-1.5 ml-1">Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/20 text-white placeholder-white/50 focus:bg-white focus:text-slate-900 focus:border-orange-300 outline-none transition-all font-medium"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-white/80 mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-transparent bg-white/20 text-white placeholder-white/50 focus:bg-white focus:text-slate-900 focus:border-orange-300 outline-none transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white hover:bg-orange-50 text-orange-600 font-extrabold py-4 px-4 rounded-xl transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-xl"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Start Free Trial'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/20">
          <p className="text-xs text-white/60 font-medium">
            © 2024 OMMI. Secure & Encrypted.
          </p>
        </div>
      </div>
    </div>
  );
};