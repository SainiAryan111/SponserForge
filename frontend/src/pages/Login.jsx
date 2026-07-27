import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, UserCheck, Sparkles } from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState('brand');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password, role);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.error || 'Invalid username or password. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-indigo-400 font-extrabold text-2xl">
            <Sparkles className="w-6 h-6" />
            <span>SponsorForge</span>
          </div>
          <p className="text-slate-400 text-sm">AI-Powered Creator & Brand Matching Engine</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => setRole('brand')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition ${
              role === 'brand'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Brand Login</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('creator')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition ${
              role === 'creator'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Creator Login</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder={role === 'brand' ? 'global_brand_agency' : 'tech_coder_dev'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition duration-200 text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : `Sign In as ${role === 'brand' ? 'Brand' : 'Creator'}`}
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center pt-2 text-xs text-slate-400 border-t border-slate-700/50">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:underline font-semibold">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}