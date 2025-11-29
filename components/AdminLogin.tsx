import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AdminLoginProps {
  onLogin: (role: 'admin' | 'editor') => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [otp, setOtp] = useState('');
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
           <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">系统配置错误</h2>
           <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed">
             Supabase 客户端初始化失败。这通常是因为环境变量缺失或 Key 无效。<br/>
             请检查 <code>lib/supabaseClient.ts</code> 中的配置。
           </p>
           <button 
             onClick={() => window.location.reload()}
             className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
           >
             刷新重试
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
      // 1. Attempt Real Login with Supabase
      // Cast to any to handle potential version mismatch (v1 vs v2)
      const auth = supabase.auth as any;
      let data: any = { user: null };
      let error: any = null;

      if (typeof auth.signInWithPassword === 'function') {
         const res = await auth.signInWithPassword({ email, password });
         data = res.data;
         error = res.error;
      } else if (typeof auth.signIn === 'function') {
         // Fallback for v1
         const res = await auth.signIn({ email, password });
         data = { user: res.user, session: res.session };
         error = res.error;
      } else {
         // This can happen if initialization failed silently in supabaseClient.ts
         throw new Error("Supabase Auth SDK 未正确初始化。可能 Key 无效。");
      }

      if (error) {
        throw error;
      }

      if (data.user) {
        // Login successful
        console.log("Supabase Login Success:", data.user);
        // Skip 2FA simulation for smoother real-world usage unless you implement TOTP
        onLogin('admin');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Authentication failed';
      
      if (msg.includes("Invalid login credentials")) {
        msg = "邮箱或密码错误，请检查 Supabase Authentication 设置。";
      } else if (msg.includes("Email not confirmed")) {
         msg = "请先前往邮箱确认注册链接，或在 Supabase 后台关闭邮箱验证。";
      } else if (msg.includes("Failed to fetch")) {
         msg = "连接失败：请检查网络或 Supabase Key 是否正确。";
      }
      
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulation for 2FA UI flow
    setTimeout(() => {
        setIsLoading(false);
        onLogin('admin');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 animate-fade-in-up">
        <div className="text-center mb-10">
           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 mx-auto mb-4">P</div>
           <h2 className="text-2xl font-bold text-gray-900">Employee Portal</h2>
           <p className="text-sm text-gray-400 mt-2">使用 Supabase 账号登录</p>
        </div>

        {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs font-medium animate-pulse">
                <i className="ri-error-warning-fill flex-shrink-0"></i>
                <span className="leading-tight">{errorMsg}</span>
            </div>
        )}

        {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work Email</label>
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
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Login securely'}
                </button>
                
                <p className="text-center text-[10px] text-gray-400 mt-4">
                  Powered by Supabase Auth
                </p>
            </form>
        ) : (
            <form onSubmit={handle2FASubmit} className="space-y-6">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3">
                        <i className="ri-shield-keyhole-line text-xl"></i>
                    </div>
                    <p className="text-sm text-gray-600">Enter the 6-digit code from your authenticator app.</p>
                </div>
                <div>
                    <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full h-14 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                    />
                </div>
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold tracking-wide hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-blue-200"
                >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Verify & Login'}
                </button>
                <button 
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="w-full text-xs font-bold text-gray-400 hover:text-gray-600"
                >
                    Cancel
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;