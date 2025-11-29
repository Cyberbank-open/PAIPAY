import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (role: 'admin' | 'editor') => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API Check
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, check Supabase Auth here.
      // If user has 2FA enabled, move to step 2.
      if (email === 'admin@paipay.com') {
        setStep('2fa');
      } else {
        alert('Demo: Use admin@paipay.com to see 2FA flow');
      }
    }, 1000);
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        // Verify TOTP token here
        onLogin('admin');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 animate-fade-in-up">
        <div className="text-center mb-10">
           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 mx-auto mb-4">P</div>
           <h2 className="text-2xl font-bold text-gray-900">Employee Portal</h2>
           <p className="text-sm text-gray-400 mt-2">Secure Access Gateway</p>
        </div>

        {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                        placeholder="name@paipay.finance"
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
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Continue'}
                </button>
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