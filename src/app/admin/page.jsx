"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Users, CreditCard, 
  LogOut, Activity, BarChart3, 
  Loader2, AlertCircle, Wallet, Rocket
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Component Imports
import DriverVerificationTab from '../components/DriverVerificationTab';
import BookingVerificationTab from '../components/BookingVerificationTab';
import AdminPayoutDashboard from '../components/AdminPayoutDashboard'; 
import BulkSeedForm from '../components/BulkSeedForm';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('drivers'); 
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 🛡️ SECURITY PROTOCOL: Validate Admin Session
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
        router.replace("/dashboard/passenger"); 
      } else {
        setAdmin(userData);
        if (loading) setLoading(false);
      }
    } catch (err) {
      localStorage.clear();
      router.replace("/auth");
    }
  }, [router, loading]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Terminal Session Terminated");
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A] px-4">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-slate-500 text-[10px] font-black uppercase {tracking-[0.4em]} text-center">Initializing Terminal</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-900 selection:bg-emerald-100 antialiased">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm/50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          
          {/* Brand/Identity Cluster */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg shadow-slate-200 shrink-0">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none truncate">
                Control<span className="text-emerald-600">Center</span>
              </h1>
              <p className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1 truncate">
                Node: {admin?.username || "Master"}
              </p>
            </div>
          </div>

          {/* 💻 DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
            <TabButton 
              active={activeTab === 'drivers'} 
              onClick={() => setActiveTab('drivers')}
              icon={<Users size={15} />}
              label="Driver Approvals"
            />
            <TabButton 
              active={activeTab === 'bookings'} 
              onClick={() => setActiveTab('bookings')}
              icon={<CreditCard size={15} />}
              label="Payment Audit"
            />
            <TabButton 
              active={activeTab === 'payouts'} 
              onClick={() => setActiveTab('payouts')}
              icon={<Wallet size={15} />}
              label="Settlements"
            />
            <TabButton 
              active={activeTab === 'admin-trip'} 
              onClick={() => setActiveTab('admin-trip')}
              icon={<Rocket size={15} />}
              label="Admin Trip"
            />
          </nav>

          {/* Action Hub */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleLogout} className="group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest select-none">
              <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Terminate</span>
            </button>
          </div>
        </div>

        {/* 📱 MOBILE NAVIGATION (Touch Optimized Scroll Tray) */}
        <div className="md:hidden overflow-x-auto bg-slate-50 border-t border-slate-200/60 px-4 py-2.5 flex items-center gap-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
           <TabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} icon={<Users size={14} />} label="Drivers" />
           <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<CreditCard size={14} />} label="Audit" />
           <TabButton active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} icon={<Wallet size={14} />} label="Settlements" />
           <TabButton active={activeTab === 'admin-trip'} onClick={() => setActiveTab('admin-trip')} icon={<Rocket size={14} />} label="Admin Trip" />
        </div>
      </header>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        
        {/* Responsive Matrix Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
            <StatCard icon={<Users className="text-blue-500 w-5 h-5" />} label="Total Users" value="--" />
            <StatCard icon={<Activity className="text-emerald-500 w-5 h-5" />} label="System Status" value="Online" />
            <StatCard icon={<AlertCircle className="text-amber-500 w-5 h-5" />} label="Pending Reviews" value="!" />
            <StatCard icon={<BarChart3 className="text-purple-500 w-5 h-5" />} label="Server Load" value="Normal" />
        </div>

        {/* Dynamic Canvas Workspace Viewport */}
        <div className="bg-white rounded-2xl md:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[450px] md:min-h-[500px] transition-all duration-300">
           {activeTab === 'drivers' && <DriverVerificationTab />}
           {activeTab === 'bookings' && <BookingVerificationTab />}
           {activeTab === 'payouts' && <AdminPayoutDashboard />}
           
           {/* 🎯 CONCIERGE GHOST FLEET MODULE MAP */}
           {activeTab === 'admin-trip' && (
              <div className="py-6 px-4 sm:p-8 md:p-12 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <BulkSeedForm />
              </div>
           )}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS (ENCAPSULATED STYLES) ---

function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap select-none border shrink-0 ${
        active 
          ? 'bg-white text-slate-900 shadow-sm border-slate-200/60' 
          : 'text-slate-400 border-transparent hover:text-slate-600'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-200 flex items-center gap-3 md:gap-4 shadow-sm select-none hover:border-slate-300 transition-colors min-w-0">
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