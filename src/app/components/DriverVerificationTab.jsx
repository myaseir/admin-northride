// src/app/admin/components/DriverVerificationTab.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, User, Loader2, ShieldAlert, Car, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
// import { playPopSound } from '../../../utils/sounds';

export default function DriverVerificationTab() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Drivers Logic ---
 const fetchDrivers = useCallback(async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");

    const res = await fetch(`${apiUrl}/api/admin/pending-drivers`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    // The backend now returns the list directly: [ {...}, {...} ]
    if (Array.isArray(data)) {
      setDrivers(data);
    } else if (data && Array.isArray(data.data)) {
      // This handles cases where the API might wrap it in a 'data' key
      setDrivers(data.data);
    } else {
      console.error("API returned unexpected format:", data);
      setDrivers([]);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    toast.error("Failed to sync with terminal.");
    setDrivers([]);
  } finally {
    setLoading(false);
  }
}, []);

  // --- 2. Action Logic (Approve/Reject) ---
  const handleVerification = async (userId, approveStatus) => {
    playPopSound();
    const actionText = approveStatus ? "approving" : "rejecting";
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify-driver/${userId}?approve=${approveStatus}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        toast.success(`Driver ${approveStatus ? 'Approved' : 'Rejected'} successfully`);
        // Refresh the list to remove the processed driver
        fetchDrivers();
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || `Error ${actionText} driver`);
      }
    } catch (err) {
      toast.error(`Terminal failed to process ${actionText} request`);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Encrypted Data...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      {drivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div 
              key={driver.id || driver._id} 
              className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group relative overflow-hidden"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-transform">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-[1000] text-slate-900 uppercase tracking-tighter text-lg leading-tight">
                    {driver.username}
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    Pending Pilot
                  </p>
                </div>
              </div>

              {/* Data Points */}
              <div className="space-y-4 mb-10">
                <InfoRow label="ID" value={driver.id?.slice(-6).toUpperCase() || "N/A"} />
                <InfoRow label="Email" value={driver.email} />
                <InfoRow 
                  label="Vehicle" 
                  value={driver.driver_profile?.vehicle_model || "Not Uploaded"} 
                  icon={<Car size={12} />}
                />
              </div>

              {/* Status Bar */}
              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <span>KYC Progress</span>
                  <span className="text-amber-500 animate-pulse">Awaiting Approval</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[70%] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleVerification(driver.id || driver._id, false)}
                  className="py-4 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-100 hover:border-rose-200"
                >
                  <XCircle size={14} /> Reject
                </button>
                <button 
                  onClick={() => handleVerification(driver.id || driver._id, true)}
                  className="py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-200 active:scale-95"
                >
                  <CheckCircle size={14} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
          <ShieldAlert size={48} className="text-slate-300 mb-4" />
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">Queue is Clear</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">No pilots currently awaiting verification</p>
          <button 
             onClick={fetchDrivers} 
             className="mt-6 px-8 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
          >
            Force Refresh
          </button>
        </div>
      )}
    </div>
  );
}

// Small helper component for the card rows
function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {icon} {label}
      </span>
      <span className="text-[10px] font-bold text-slate-800 truncate max-w-[150px]">{value}</span>
    </div>
  );
}