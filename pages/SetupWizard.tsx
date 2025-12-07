import React, { useState } from 'react';
import { apiFetch } from '../lib/api';

interface SetupWizardProps {
  onComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: 'Retail',
    currency: 'KES',
    taxNumber: '',
    phone: '',
    email: '',
    address: '',
    acceptTerms: false
  });

  const totalSteps = 4;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await finishSetup();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishSetup = async () => {
    setLoading(true);
    try {
      await apiFetch('/api/v1/setup/complete', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.businessName,
          industry: formData.industry,
          currency: formData.currency,
          taxNumber: formData.taxNumber
        })
      });
      onComplete();
    } catch (e) {
      console.error("Setup failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            <span>Identity</span>
            <span>Financials</span>
            <span>Review</span>
            <span>Complete</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-900 transition-all duration-500" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to OMMI</h1>
            <p className="text-slate-500">Let's get your business operating system set up in minutes.</p>
          </div>

          {/* Step 1: Business Identity */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input 
                  type="text" 
                  value={formData.businessName}
                  onChange={e => setFormData({...formData, businessName: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-900 outline-none"
                  placeholder="e.g. Acme Traders Ltd"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                  <select 
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-900 outline-none bg-white"
                  >
                    <option>Retail</option>
                    <option>Logistics</option>
                    <option>Services</option>
                    <option>Manufacturing</option>
                    <option>Hospitality</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-900 outline-none"
                    placeholder="help@acme.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Financials */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Operating Currency</label>
                <select 
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-900 outline-none bg-white"
                >
                  <option value="KES">Kenyan Shilling (KES)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="NGN">Nigerian Naira (NGN)</option>
                  <option value="ZAR">South African Rand (ZAR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID / PIN</label>
                <input 
                  type="text" 
                  value={formData.taxNumber}
                  onChange={e => setFormData({...formData, taxNumber: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-900 outline-none"
                  placeholder="e.g. P051XXXXXX"
                />
                <p className="text-xs text-slate-500 mt-2">Required for invoice generation.</p>
              </div>
            </div>
          )}

          {/* Step 3: Modules */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-slate-900">Enable Core Modules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-blue-100 bg-blue-50 rounded-xl cursor-default">
                  <span className="font-bold text-blue-900">Sales & Invoicing</span>
                  <p className="text-xs text-blue-800 mt-1">Core Requirement</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Inventory</span>
                    <p className="text-xs text-slate-500 mt-1">Stock tracking & Warehouses</p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">HR & Payroll</span>
                    <p className="text-xs text-slate-500 mt-1">Employee management</p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Communications</span>
                    <p className="text-xs text-slate-500 mt-1">WhatsApp & Email</p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Finish */}
          {step === 4 && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                🚀
              </div>
              <h3 className="text-xl font-bold text-slate-900">You're all set!</h3>
              <p className="text-slate-500">
                Your workspace for <span className="font-bold text-slate-900">{formData.businessName}</span> is ready.
                You can invite your team and configure specific settings later.
              </p>
              <div className="flex items-center justify-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={formData.acceptTerms}
                  onChange={e => setFormData({...formData, acceptTerms: e.target.checked})}
                  className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                />
                <span className="text-sm text-slate-600">I agree to the Terms of Service</span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-10 flex justify-between pt-6 border-t border-slate-100">
            <button 
              onClick={handleBack}
              disabled={step === 1 || loading}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Back
            </button>
            <button 
              onClick={handleNext}
              disabled={(step === 1 && !formData.businessName) || (step === 4 && !formData.acceptTerms) || loading}
              className={`px-8 py-3 bg-blue-900 text-white font-bold rounded-lg shadow-lg hover:bg-blue-800 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? 'Setting up...' : step === totalSteps ? 'Launch Dashboard' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};