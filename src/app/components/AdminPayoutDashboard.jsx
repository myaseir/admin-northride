"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Loader2, Banknote, User, Phone, 
  CreditCard, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminPayoutDashboard() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(7);
  
  // Track transfer reference inputs for each row
  const [transferRefs, setTransferRefs] = useState({});

  const fetchPayouts = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/admin/payouts/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        // We just save the raw data to state. 
        // The actual sorting happens down in the return statement now.
        setPayouts(data);
      } else {
        toast.error("Failed to load pending payouts.");
      }
    } catch (err) {
      toast.error("Network error while fetching payouts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleProcessPayout = async (bookingId, action) => {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
    const refId = transferRefs[bookingId] || "";

    if (action === 'credit' && !refId.trim()) {
      const confirmNoRef = window.confirm("Are you sure you want to mark this as paid without a Bank Transfer Reference ID?");
      if (!confirmNoRef) return;
    }

    if (action === 'reject') {
      const confirmReject = window.confirm("Are you sure you want to REJECT this payout? This will flag it in the driver's ledger.");
      if (!confirmReject) return;
    }

    setProcessingId(bookingId);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/admin/payouts/${bookingId}/process`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          action: action, 
          transfer_ref: refId 
        })
      });

      if (res.ok) {
        toast.success(action === 'credit' ? "Payout marked as successful!" : "Payout rejected.");
        // Remove the processed item from the list instantly
        setPayouts(prev => prev.filter(p => p.id !== bookingId));
        // Clear the ref input
        setTransferRefs(prev => {
          const newState = { ...prev };
          delete newState[bookingId];
          return newState;
        });
      } else {
        const err = await res.json();
        toast.error(err.detail || "Failed to process payout.");
      }
    } catch (err) {
      toast.error("Network error during processing.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefChange = (id, value) => {
    setTransferRefs(prev => ({ ...prev, [id]: value }));
  };

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Pending Payouts</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">
            {payouts.length} transfers waiting for bank deposit.
          </p>
        </div>
        <div className="bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} className="text-amber-600" />
          <span className="text-xs font-black text-amber-800 uppercase tracking-wider">
            Action Required
          </span>
        </div>
      </div>

      {/* LIST OF PAYOUTS */}
      {payouts.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center shadow-sm">
          <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">All Caught Up!</h3>
          <p className="text-sm font-medium text-slate-500 mt-2">There are no pending driver payouts at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* 🎯 FORCE SORT HERE: Always newest first by ID */}
          {[...payouts]
            .sort((a, b) => {
              if (a.id && b.id) return b.id.localeCompare(a.id);
              return 0;
            })
            .slice(0, visibleCount)
            .map((payout) => (
              <div key={payout.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-md">
                
                {/* LEFT: Driver & Account Details */}
                <div className="p-6 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <User size={16} className="text-slate-400" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{payout.driver_name}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-slate-400" />
                      <span className="font-bold text-slate-600">{payout.driver_phone}</span>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl border border-slate-200 mt-2">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <CreditCard size={12} /> Transfer Destination
                      </p>
                      <p className="text-sm font-black text-slate-900">
                        {payout.payout_method || "Bank Transfer"}
                      </p>
                      <p className="text-xs font-bold text-slate-500 font-mono mt-0.5">
                        {payout.payout_account || "No Account Provided"}
                      </p>
                    </div>
                    
                    <p className="text-[10px] font-bold text-slate-400 uppercase pt-2">
                      Trip Ref: {payout.trip_id?.slice(-6).toUpperCase() || "N/A"} • Passenger: {payout.passenger_name}
                    </p>
                  </div>
                </div>

                {/* MIDDLE: Financial Math */}
                <div className="p-6 flex-1 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-500">Collected Advance</span>
                      <span className="font-black text-slate-900">
                        PKR {(payout.advance_paid || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-rose-500 flex items-center gap-1">
                        Platform Fee (5%)
                      </span>
                      <span className="font-black text-rose-600">
                        - PKR {(payout.commission_fee || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="h-px w-full bg-slate-200 my-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                        <Banknote size={14} /> Net Payout
                      </span>
                      <span className="text-2xl font-black text-emerald-600 tracking-tighter">
                        <span className="text-[10px] font-sans text-emerald-500 mr-1 uppercase">PKR</span>
                        {(payout.net_payout || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Action Panel */}
                <div className="p-6 bg-slate-900 flex-1 flex flex-col justify-center">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                        Bank Transfer Reference ID
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. TRX-998234"
                        value={transferRefs[payout.id] || ""}
                        onChange={(e) => handleRefChange(payout.id, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleProcessPayout(payout.id, 'credit')}
                        disabled={processingId === payout.id}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingId === payout.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleProcessPayout(payout.id, 'reject')}
                        disabled={processingId === payout.id}
                        className="px-4 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 font-black rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
                        title="Reject Payout"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}

          {/* 🎯 Load More Button */}
          {visibleCount < payouts.length && (
            <button 
              onClick={() => setVisibleCount(prev => prev + 7)}
              className="w-full py-4 border-2 border-dashed border-slate-300 rounded-[2rem] text-slate-500 font-black text-xs uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-95"
            >
              Load More Payouts ({payouts.length - visibleCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}