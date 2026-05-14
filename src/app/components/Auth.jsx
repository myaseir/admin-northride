"use client";
import { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminAuth({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Optional: playPopSound() -> Ensure this utility is imported if used
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
      
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        })
      });

      const data = await res.json();

      if (res.ok) {
        // 🛡️ THE CRITICAL CHECK: Check the role returned by the DB
        // This allows 'muhd.yaseir@gmail.com' to log in as long as the DB says he's an ADMIN
        const roles = data.user?.roles || [];
        
        if (!roles.includes("ADMIN")) {
          setError("Access Denied: Administrative Clearance Required.");
          setLoading(false);
          return;
        }

        toast.success(`Welcome, Commander ${data.user.username}`);
        onLoginSuccess(data); 
      } else {
        // Specifically handle 401/403 vs 500
        setError(data.detail || "Authentication Failed: Invalid Credentials.");
      }
    } catch (err) {
      setError("Terminal Link Failure. Backend Offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="w-full max-w-[420px] z-10">
        
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[120px] pointer-events-none" />

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] shadow-2xl border border-slate-800 overflow-hidden relative">
          
          <div className="pt-12 pb-8 px-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[30px] flex items-center justify-center mb-6 border border-emerald-500/20 shadow-inner group transition-all">
              <ShieldCheck className="text-emerald-500 group-hover:scale-110 transition-transform" size={40} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
              Admin<span className="text-emerald-500">Terminal</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-black mt-2 tracking-[0.4em] uppercase">
              Secure Auth Protocol v4.0
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-6">
            {error && (
              <div className="animate-in fade-in zoom-in-95 duration-200 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3">
                <ShieldAlert className="text-rose-500 shrink-0" size={18} />
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-tight">{error}</p>
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Access Identity</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="name@domain.com" 
                  required 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-emerald-500/50 text-white text-sm font-bold transition-all focus:ring-1 focus:ring-emerald-500/20" 
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Master Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-emerald-500/50 text-white text-sm font-bold transition-all focus:ring-1 focus:ring-emerald-500/20" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 rounded-2xl font-black text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-900/20 transition-all uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Initialize Session <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="bg-slate-900 py-6 px-10 border-t border-slate-800 text-center">
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              Authorized Personnel Only. Logged access is monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}