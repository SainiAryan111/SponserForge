import React, { useState } from 'react';
import { Sparkles, Building2, UserCheck, User, Mail, Lock } from 'lucide-react';

export default function AuthGateway({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'brand'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    const endpoint = isSignUp 
      ? 'http://127.0.0.1:8000/api/auth/signup/' 
      : 'http://127.0.0.1:8000/api/auth/login/';

    // Ensure the role payload is always sent
    const payload = isSignUp 
      ? formData 
      : { username: formData.username, password: formData.password, role: formData.role };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // 🛡️ Safe check: Is the response actually JSON?
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Server HTML Error Page:", errorText);
        throw new Error(`Server returned a ${response.status} error instead of JSON. Check your Django terminal!`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Authentication sequence failed.");
      }

      localStorage.setItem('authToken', data.access || data.token);
      
      onAuthSuccess({
        username: data.username || formData.username,
        role: data.role || formData.role
      });

    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 w-full max-w-md space-y-6 shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
        
        <div className="text-center space-y-1">
          <div className="inline-flex bg-indigo-600/10 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/20 mb-1">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">SponsorForge</h1>
          <p className="text-xs text-slate-400">
            {isSignUp ? "Create your account architecture" : "Access your matching console environment"}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-850">
          <button type="button" onClick={() => { setIsSignUp(false); setErrorMessage(""); }} className={`py-2 text-xs font-semibold rounded-lg transition ${!isSignUp ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Sign In</button>
          <button type="button" onClick={() => { setIsSignUp(true); setErrorMessage(""); }} className={`py-2 text-xs font-semibold rounded-lg transition ${isSignUp ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Account Role Architecture</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'brand' })} className={`py-2.5 px-3 rounded-xl border text-left transition flex items-center gap-2 ${formData.role === 'brand' ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400' : 'border-slate-850 bg-slate-900/40 text-slate-500 hover:border-slate-800'}`}>
                <Building2 size={16} /><span className="font-bold text-xs">Brand Entity</span>
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'creator' })} className={`py-2.5 px-3 rounded-xl border text-left transition flex items-center gap-2 ${formData.role === 'creator' ? 'border-cyan-500 bg-cyan-500/5 text-cyan-400' : 'border-slate-850 bg-slate-900/40 text-slate-500 hover:border-slate-800'}`}>
                <UserCheck size={16} /><span className="font-bold text-xs">Creator Node</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-600" size={16} />
                <input type="text" required placeholder="your_dev_handle" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Node</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-600" size={16} />
                  <input type="email" required placeholder="name@domain.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">System Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-600" size={16} />
                <input type="password" required placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/10 mt-2">
            {isSignUp ? "Generate Matrix Access Profile" : "Authenticate Terminal Credentials"}
          </button>
        </form>
      </div>
    </div>
  );
}