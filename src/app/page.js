"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Users, CreditCard, 
  LogOut, Activity, BarChart3, Bell, Terminal, Wallet, Rocket, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Component Imports
import DriverVerificationTab from './components/DriverVerificationTab';
import BookingVerificationTab from './components/BookingVerificationTab';
import AdminPayoutDashboard from './components/AdminPayoutDashboard';
import BulkSeedForm from './components/BulkSeedForm'; 
import AdminFleetDashboard from './components/AdminFleetDashboard';
import OneSignalInit from './components/OneSignalInit';
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('drivers'); 
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // SECURITY PROTOCOL: Validate Admin Session
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userStr) {
      router.replace("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (!userData.roles?.includes("ADMIN")) {
        toast.error("Access Denied: Administrative Credentials Required");
        router.replace("/"); // Redirect unauthorized users
      } else {
        setAdminData(userData);
        setLoading(false);
      }
    } catch (err) {
      localStorage.clear();
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Terminal Session Terminated");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F9FBFC] px-4">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] text-center">Initializing Terminal</p>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-[#F9FBFC] text-slate-900 font-sans selection:bg-emerald-100 antialiased">
      <OneSignalInit />
      {/* --- REFINED TOP NAVIGATION --- */}
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 px-4 border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between gap-4">
          
          {/* Brand Section */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 active:scale-95 transition-transform shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-sm font-black text-slate-950 tracking-tighter uppercase italic leading-none truncate">
                Control<span className="text-emerald-500">Center</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase truncate">
                  Node: {adminData?.username || 'Root'}
                </p>
              </div>
            </div>
          </div>

          {/* DESKTOP: Floating Pill Switcher */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/5 p-1.5 rounded-2xl">
            <TabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} icon={<Users size={14} />} label="Drivers" />
            <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<CreditCard size={14} />} label="Payments" />
            <TabButton active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} icon={<Wallet size={14} />} label="Settlements" />
            <TabButton active={activeTab === 'ghost-fleet'} onClick={() => setActiveTab('ghost-fleet')} icon={<Rocket size={14} />} label="Ghost Fleet" />
            {/* 🎯 Added Live Radar Tab Here */}
            <TabButton active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} icon={<Activity size={14} />} label="Live Radar" />
          </nav>

          {/* Action Cluster */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="hidden sm:block p-2.5 text-slate-400 hover:text-slate-950 transition-all rounded-xl hover:bg-slate-100">
               <Bell size={18} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all group flex items-center gap-2"
              title="Terminate Session"
            >
              <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Terminate</span>
            </button>
          </div>
        </div>

        {/* MOBILE: Touch Optimized Scroll Tray */}
        <div className="md:hidden overflow-x-auto border-t border-slate-100 py-2.5 flex items-center gap-2 scrollbar-none">
           <TabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} icon={<Users size={14} />} label="Drivers" />
           <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<CreditCard size={14} />} label="Audit" />
           <TabButton active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} icon={<Wallet size={14} />} label="Settlements" />
           <TabButton active={activeTab === 'ghost-fleet'} onClick={() => setActiveTab('ghost-fleet')} icon={<Rocket size={14} />} label="Ghost Fleet" />
           {/* 🎯 Added Live Radar Tab Here */}
           <TabButton active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} icon={<Activity size={14} />} label="Live Radar" />
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Responsive Matrix Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
            <StatCard icon={<Users className="text-blue-500 w-5 h-5" />} label="Total Users" value="--" />
            <StatCard icon={<Activity className="text-emerald-500 w-5 h-5" />} label="System Status" value="Online" />
            <StatCard icon={<AlertCircle className="text-amber-500 w-5 h-5" />} label="Pending Reviews" value="!" />
            <StatCard icon={<BarChart3 className="text-purple-500 w-5 h-5" />} label="Server Load" value="Normal" />
        </div>

        {/* Dynamic Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600">
               <Terminal size={14} />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Update</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight uppercase italic">
              {activeTab === 'drivers' ? 'Identity' : 
               activeTab === 'bookings' ? 'Ledger' : 
               activeTab === 'payouts' ? 'Settlement' : 
               activeTab === 'fleet' ? 'Operations' : 'Marketplace'} 
              <span className="text-slate-400 ml-2">Audit</span>
            </h2>
          </div>
        </div>

        {/* Component Display Grid */}
        <div className="bg-white rounded-2xl md:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] transition-all duration-500 ease-in-out">
           {activeTab === 'drivers' && <DriverVerificationTab />}
           {activeTab === 'bookings' && <BookingVerificationTab />}
           {activeTab === 'payouts' && <AdminPayoutDashboard />}
           {activeTab === 'ghost-fleet' && (
              <div className="py-6 px-4 sm:p-8 md:p-12 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <BulkSeedForm />
              </div>
           )}
           {/* 🎯 Render Live Radar Component */}
           {activeTab === 'fleet' && <AdminFleetDashboard />}
        </div>
      </main>

      <footer className="py-10 text-center mt-10">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">GlaciaLabs Administrative Protocol v4.1.0</p>
      </footer>
    </div>
  );
}

// --- Internal Helper Components ---

function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 select-none ${
        active 
          ? 'bg-white text-slate-950 shadow-sm border border-slate-200' 
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
      }`}
    >
      <span className="shrink-0">{icon}</span> 
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 flex items-center gap-3 md:gap-4 shadow-sm select-none hover:border-slate-300 transition-colors min-w-0">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
        <p className="text-base md:text-lg font-black text-slate-900 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}