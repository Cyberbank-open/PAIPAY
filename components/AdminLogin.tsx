import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AdminLoginProps {
  onLogin: (role: 'admin' | 'editor') => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Setup Guide State
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 md:p-10 animate-fade-in-up">
           <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
               <i className="ri-settings-4-line text-3xl"></i>
           </div>
           <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Configuration Error</h2>
           <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed">
             Supabase client failed to initialize. Missing environment variables.<br/>
             Please check <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
           </p>
           <button 
             onClick={() => window.location.reload()}
             className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
           >
             Retry
           </button>
        </div>
      </div>
    );
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        onLogin('admin');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Authentication failed';
      if (msg.includes("Invalid login credentials")) {
        msg = "Invalid email or password.";
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 animate-fade-in-up">
        <div className="text-center mb-10">
           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 mx-auto mb-4">P</div>
           <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
           <p className="text-sm text-gray-400 mt-2">Sign in with Supabase</p>
        </div>

        {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs font-medium animate-pulse">
                <i className="ri-error-warning-fill flex-shrink-0"></i>
                <span className="leading-tight">{errorMsg}</span>
            </div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                    placeholder="admin@paipay.com"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                    required
                />
            </div>
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gray-900 text-white font-bold tracking-wide hover:bg-black active:scale-95 transition-all flex items-center justify-center"
            >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Login'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;