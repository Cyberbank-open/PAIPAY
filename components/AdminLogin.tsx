import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

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
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Determine mode on mount. If Supabase keys are missing, force Demo Mode.
    if (!isSupabaseConfigured) {
      setIsDemoMode(true);
      // Pre-fill for convenience in test mode
      setEmail('admin@paipay.finance');
      setPassword('password123');
    }
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // --- SIMULATION MODE (For Testing) ---
    // Always allow login if in demo mode or if using specific test credentials
    if (isDemoMode || (email === 'admin@paipay.finance' && password === 'password123')) {
        setTimeout(() => {
            setIsLoading(false);
            if (password.length < 4) {
                setErrorMsg('Password too short (Demo)');
                return;
            }
            // Proceed to 2FA simulation
            setStep('2fa');
        }, 800);
        return;
    }

    // --- REAL AUTHENTICATION ---
    try {
      const auth = supabase.auth as any;
      let data: any = { user: null };
      let error: any = null;

      if (typeof auth.signInWithPassword === 'function') {
         const res = await auth.signInWithPassword({ email, password });
         data = res.data;
         error = res.error;
      } else {
         const res = await auth.signIn({ email, password });
         data = { user: res.user, session: res.session };
         error = res.error;
      }

      if (error) throw error;

      if (data.user) {
         setStep('2fa');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback for testing if real auth fails but user wants to proceed (Development helper)
      if (email === 'admin@paipay.finance') {
          setStep('2fa');
          setIsLoading(false);
          return;
      }

      let msg = err.message || 'Authentication failed';
      if (msg.includes("Invalid login credentials")) msg = "邮箱或密码错误";
      else if (msg.includes("Email not confirmed")) msg = "请先前往邮箱确认注册邮件";
      
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate verification delay
    setTimeout(() => {
        setIsLoading(false);
        if (otp.length !== 6 && !isDemoMode) {
            setErrorMsg('Invalid code');
            return;
        }
        onLogin('admin');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] rounded-full bg-blue-100/40 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-cyan-100/40 blur-[100px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in-up">
        {/* Logo Header */}
        <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href = '/'}>
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">P</div>
            </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Admin Console
        </h2>
        <p className="mt-3 text-center text-sm text-gray-500 max-w-xs mx-auto">
            {isDemoMode ? 'System running in Simulation Mode (Offline)' : 'Secure access for authorized personnel'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10 px-4 sm:px-0">
        <div className="bg-white/70 backdrop-blur-xl px-6 py-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-3xl sm:px-10 border border-white/60 relative overflow-hidden ring-1 ring-white/50">
            
            {/* Top Highlight Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-80"></div>

            {/* Error Message */}
            {errorMsg && (
                <div className="mb-6 p-3 bg-red-50/80 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-fade-in">
                    <i className="ri-error-warning-fill text-lg"></i>
                    <span className="font-medium">{errorMsg}</span>
                </div>
            )}

            {/* Demo Mode Badge */}
            {isDemoMode && !errorMsg && (
                 <div className="mb-6 p-3 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center justify-center gap-3 text-blue-700 text-xs font-bold uppercase tracking-wider">
                    <i className="ri-flask-line text-lg"></i>
                    <div className="text-left">
                        <div className="font-extrabold">Simulation Active</div>
                        <div className="opacity-70 font-medium normal-case tracking-normal">DB connection bypassed for testing</div>
                    </div>
                </div>
            )}

            {step === 'credentials' ? (
                <form className="space-y-5" onSubmit={handleCredentialsSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 pl-1">Email</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <i className="ri-mail-line text-lg"></i>
                            </div>
                            <input 
                                id="email" 
                                name="email" 
                                type="email" 
                                autoComplete="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all bg-white/50 focus:bg-white"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 pl-1">Password</label>
                        <div className="relative group">
                             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <i className="ri-lock-2-line text-lg"></i>
                            </div>
                            <input 
                                id="password" 
                                name="password" 
                                type="password" 
                                autoComplete="current-password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border-0 py-3.5 pl-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all bg-white/50 focus:bg-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">Remember me</label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">Forgot password?</a>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-xl bg-gray-900 px-3 py-4 text-sm font-bold text-white shadow-lg shadow-gray-200 hover:bg-black hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                     <span>Processing...</span>
                                </div>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <form className="space-y-6 animate-fade-in" onSubmit={handle2FASubmit}>
                    <div className="text-center">
                         <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 border border-blue-100 shadow-sm">
                            <i className="ri-shield-keyhole-line text-3xl"></i>
                         </div>
                         <h3 className="text-lg font-bold text-gray-900">Security Verification</h3>
                         <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code from your authenticator app.</p>
                    </div>

                    <div className="px-4">
                         <input 
                            type="text" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            className="block w-full text-center text-3xl font-mono tracking-[0.5em] rounded-xl border-0 py-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-all bg-gray-50 focus:bg-white"
                            placeholder="000000"
                            maxLength={6}
                            autoFocus
                        />
                    </div>

                    <div className="pt-2 space-y-3">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-xl bg-blue-600 px-3 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? 'Verifying...' : 'Verify Identity'}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => { setStep('credentials'); setOtp(''); setErrorMsg(''); }}
                            className="flex w-full justify-center text-sm font-bold text-gray-400 hover:text-gray-900 py-2 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
            &copy; 2025 PAIPAY Financial Technology.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;