"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Users, CreditCard, 
  LogOut, Activity, BarChart3, Bell, Terminal, Wallet
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import DriverVerificationTab from './components/DriverVerificationTab';
import BookingVerificationTab from './components/BookingVerificationTab';
import AdminPayoutDashboard from './components/AdminPayoutDashboard'; // 🎯 IMPORT ADDED

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('drivers'); 
  const [adminData, setAdminData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!token || !user.roles?.includes("ADMIN")) {
      toast.error("Administrative Clearance Required");
      router.push("/login");
    } else {
      setAdminData(user);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Terminal Session Terminated");
    router.push("/login");
  };

  if (!adminData) return null;

  return (
    <div className="min-h-screen bg-[#F9FBFC] text-slate-900 font-sans selection:bg-emerald-100">
      
      {/* --- REFINED TOP NAVIGATION (NO DIVIDERS) --- */}
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 px-4">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          
          {/* Brand Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 active:scale-95 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-950 tracking-tighter uppercase italic leading-none">
                Control<span className="text-emerald-500">Center</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">
                  Node: {adminData.username || 'Root'}
                </p>
              </div>
            </div>
          </div>

          {/* Floating Pill Switcher */}
          <nav className="flex items-center gap-1 bg-slate-900/5 p-1.5 rounded-2xl">
            <TabButton 
              active={activeTab === 'drivers'} 
              onClick={() => setActiveTab('drivers')}
              icon={<Users size={14} />}
              label="Drivers"
            />
            <TabButton 
              active={activeTab === 'bookings'} 
              onClick={() => setActiveTab('bookings')}
              icon={<CreditCard size={14} />}
              label="Payments"
            />
            {/* 🎯 NEW SETTLEMENTS TAB */}
            <TabButton 
              active={activeTab === 'payouts'} 
              onClick={() => setActiveTab('payouts')}
              icon={<Wallet size={14} />}
              label="Settlements"
            />
          </nav>

          {/* Action Cluster */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-400 hover:text-slate-950 transition-all rounded-xl hover:bg-slate-100">
               <Bell size={18} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all group"
              title="Terminate Session"
            >
              <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Dynamic Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600">
               <Terminal size={14} />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Update</span>
            </div>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight uppercase italic">
              {/* 🎯 DYNAMIC TITLE UPDATE */}
              {activeTab === 'drivers' ? 'Identity' : activeTab === 'bookings' ? 'Ledger' : 'Settlement'} <span className="text-slate-400">Audit</span>
            </h2>
          </div>

          {/* Live Stats Dock */}
          <div className="flex items-center gap-3">
             <QuickStat icon={<Activity size={12}/>} label="Status" value="Online" color="emerald" />
             <QuickStat icon={<BarChart3 size={12}/>} label="Traffic" value="Nominal" color="blue" />
          </div>
        </div>

        {/* Component Display */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* 🎯 TAB RENDERING LOGIC */}
           {activeTab === 'drivers' && <DriverVerificationTab />}
           {activeTab === 'bookings' && <BookingVerificationTab />}
           {activeTab === 'payouts' && <AdminPayoutDashboard />}
        </div>
      </main>

      <footer className="py-10 text-center">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">GlaciaGo Administrative Protocol v4.0.2</p>
      </footer>
    </div>
  );
}

// --- Internal Helper Components ---

function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${
        active 
          ? 'bg-white text-slate-950 shadow-sm' 
          : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {icon} <span className="hidden xs:inline">{label}</span>
    </button>
  );
}

function QuickStat({ icon, label, value, color }) {
  const themes = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  };

  return (
    <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 transition-all hover:scale-105 ${themes[color]}`}>
      <div className="opacity-80">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[7px] font-black uppercase opacity-60 tracking-tighter leading-none mb-0.5">{label}</span>
        <span className="text-[10px] font-black uppercase leading-none">{value}</span>
      </div>
    </div>
  );
}