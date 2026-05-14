"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Users, CreditCard, 
  LogOut, Activity, BarChart3, Bell,
  Loader2, AlertCircle, Wallet
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import your sub-components (ensure paths are correct)
import DriverVerificationTab from '../components/DriverVerificationTab';
import BookingVerificationTab from '../components/BookingVerificationTab';
import AdminPayoutDashboard from '../components/AdminPayoutDashboard'; // 🎯 NEW IMPORT

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
        router.replace("/dashboard/passenger"); // Send them back to safety
      } else {
        setAdmin(userData);
        setLoading(false);
      }
    } catch (err) {
      localStorage.clear();
      router.replace("/auth");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Terminal Session Terminated");
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A]">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Initializing Terminal</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-900">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl shadow-slate-200">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                Control<span className="text-emerald-600">Center</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">
                Node: {admin?.username || "Master"}
              </p>
            </div>
          </div>

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
            {/* 🎯 NEW TAB FOR SETTLEMENTS */}
            <TabButton 
              active={activeTab === 'payouts'} 
              onClick={() => setActiveTab('payouts')}
              icon={<Wallet size={15} />}
              label="Settlements"
            />
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="group flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest">
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Terminate</span>
            </button>
          </div>
        </div>

        {/* 📱 MOBILE NAVIGATION (Scrollable) */}
        <div className="md:hidden overflow-x-auto bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center gap-2">
           <TabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} icon={<Users size={14} />} label="Drivers" />
           <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<CreditCard size={14} />} label="Audit" />
           <TabButton active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} icon={<Wallet size={14} />} label="Settlements" />
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        
        {/* Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard icon={<Users className="text-blue-500"/>} label="Total Users" value="--" />
            <StatCard icon={<Activity className="text-emerald-500"/>} label="System Status" value="Online" />
            <StatCard icon={<AlertCircle className="text-amber-500"/>} label="Pending Reviews" value="!" />
            <StatCard icon={<BarChart3 className="text-purple-500"/>} label="Server Load" value="Normal" />
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
           {/* 🎯 CONDITIONAL RENDERING FOR TABS */}
           {activeTab === 'drivers' && <DriverVerificationTab />}
           {activeTab === 'bookings' && <BookingVerificationTab />}
           {activeTab === 'payouts' && <AdminPayoutDashboard />}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
        active 
          ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
          : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-lg font-black text-slate-900">{value}</p>
            </div>
        </div>
    )
}