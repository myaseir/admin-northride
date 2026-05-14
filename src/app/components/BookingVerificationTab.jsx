"use client";

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Loader2, Landmark, X, Phone, Car, 
  Clock, Hash, User, ArrowRight, Banknote, Star, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BookingVerificationTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const [overwriteForm, setOverwriteForm] = useState({
    name: '', contact_1: '', car_details: ''
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pending-verifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const cleanData = Array.isArray(data) ? data : (data.data || []);
      setBookings(cleanData);
    } catch (err) {
      toast.error("Audit sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApprove = (booking) => {
    setSelectedBooking(booking);
    setOverwriteForm({
      name: booking.listing_driver_name === "fsdfsdf" ? "" : booking.listing_driver_name,
      contact_1: (booking.listing_driver_phone && !["No Phone", "No Contact"].includes(booking.listing_driver_phone)) ? booking.listing_driver_phone : '',
      car_details: (booking.listing_car_details && booking.listing_car_details !== "Vehicle - N/A") ? booking.listing_car_details : '',
    });
    setShowModal(true);
  };

  const submitFinalApproval = async () => {
    const bId = selectedBooking._id || selectedBooking.id;
    setVerifyingId(bId);
    const finalPayload = {
      driver_id: selectedBooking.listing_driver_id,
      overwrites: {
        name: overwriteForm.name.trim() || selectedBooking.listing_driver_name,
        contact_1: overwriteForm.contact_1.trim() || selectedBooking.listing_driver_phone,
        car_details: overwriteForm.car_details.trim() || selectedBooking.listing_car_details
      }
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify-booking/${bId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      });
      if (res.ok) {
        toast.success("Verified & Dispatched");
        setShowModal(false);
        fetchBookings();
      }
    } catch (err) { toast.error("Connection error"); } 
    finally { setVerifyingId(null); }
  };

  useEffect(() => { fetchBookings(); }, []);

  if (loading) return <div className="flex flex-col items-center py-20"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex items-end justify-between bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" size={32}/> Financial Audit
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">
            System Ledger: {bookings.length} Pending Deposits
          </p>
        </div>
        <button onClick={fetchBookings} className="relative z-10 text-[10px] font-black bg-white/5 text-white border border-white/10 px-6 py-3 rounded-2xl hover:bg-emerald-500 hover:border-emerald-500 transition-all uppercase tracking-widest active:scale-95">
          Refresh Database
        </button>
      </div>

      {/* BOOKINGS LIST */}
      <div className="grid grid-cols-1 gap-4">
        {bookings.map((b) => (
          <div key={b._id || b.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 flex flex-col xl:flex-row items-center gap-8 hover:border-emerald-200 transition-all shadow-sm hover:shadow-xl group relative overflow-hidden">
            
            {/* 1. PASSENGER & TRIP INFO */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-emerald-100">
                  {b.status}
                </span>
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                  <Hash size={10}/> {(b._id || b.id).slice(-8).toUpperCase()}
                </span>
              </div>
              <h4 className="text-xl font-black text-slate-900 truncate uppercase tracking-tight mb-1 flex items-center gap-2">
                {b.passenger_name || "Unknown Passenger"}
                {b.has_premium_seat && <Star size={16} className="text-amber-400 fill-amber-400" />}
              </h4>
              <div className="flex items-center gap-2 text-slate-400">
                 <Clock size={12}/>
                 <p className="text-[10px] font-bold uppercase tracking-wider">{b.created_at ? new Date(b.created_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>

            {/* 2. PROOF OF PAYMENT (Verification Focus) */}
            <div className="flex-1 w-full bg-slate-50 border border-slate-200 p-5 rounded-[2rem] relative">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Banknote size={12}/> Easypaisa Proof Details
               </p>
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sender:</span>
                    <span className="text-[10px] font-black text-slate-800 uppercase truncate ml-4">{b.sender_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Last 4/Acct:</span>
                    <span className="text-[11px] font-black text-slate-900 font-mono tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100">{b.account_number || b.account_no || 'N/A'}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Verify TID:</span>
                    <span className="text-[11px] font-black text-emerald-700 select-all bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{b.trx_id || b.transactionId || 'N/A'}</span>
                  </div>
               </div>
            </div>

            {/* 3. SETTLEMENT ANALYSIS (🎯 UPDATED) */}
            <div className="flex items-center gap-6 w-full xl:w-auto border-t xl:border-t-0 pt-6 xl:pt-0">
               <div className="text-right min-w-[140px] space-y-1">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Verify Deposit</p>
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-950 leading-none tracking-tighter italic">
                      Rs.{b.amount_paid}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1">20% Advance Rec.</span>
                  </div>
                  <div className="pt-2 flex flex-col gap-0.5">
                    <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-slate-400 uppercase">
                      Total: <span className="text-slate-600">Rs.{b.total_price || b.amount}</span>
                    </div>
                    {b.has_premium_seat && (
                      <div className="flex items-center justify-end gap-1 text-[8px] font-black text-amber-500 uppercase italic">
                        <Star size={8} className="fill-amber-500"/> Surcharge Included
                      </div>
                    )}
                  </div>
               </div>
               
               <button 
                onClick={() => handleOpenApprove(b)}
                className="flex-1 xl:flex-none bg-slate-950 text-white px-8 py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group-hover:px-10"
               >
                 Verify <ArrowRight size={18} className="text-emerald-400"/>
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* FINAL VERIFICATION MODAL (🎯 UPDATED) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
               <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                   <ShieldCheck size={24}/>
                </div>
                <div>
                   <h4 className="text-xl font-black uppercase italic tracking-tighter">Confirm Audit</h4>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verify PKR {selectedBooking?.amount_paid} in Bank</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-white/10 rounded-2xl hover:bg-rose-500/20 hover:text-rose-400 transition-colors relative z-10"><X size={20}/></button>
            </div>
            
            <div className="p-10 space-y-8">
              {/* FINANCIAL AUDIT BOX */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Advance Received</p>
                    <p className="text-2xl font-black text-emerald-600 tracking-tighter">Rs.{selectedBooking?.amount_paid}</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cash to Collect</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">
                      Rs.{selectedBooking ? (selectedBooking.total_price - selectedBooking.amount_paid) : 0}
                    </p>
                 </div>
              </div>

              {/* OVERWRITE FORM */}
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Dispatch Driver</label>
                      <input value={overwriteForm.name} onChange={(e)=>setOverwriteForm({...overwriteForm, name:e.target.value})} placeholder={selectedBooking?.listing_driver_name} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Driver Phone</label>
                      <input value={overwriteForm.contact_1} onChange={(e)=>setOverwriteForm({...overwriteForm, contact_1:e.target.value})} placeholder={selectedBooking?.listing_driver_phone} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Vehicle Identity</label>
                    <input value={overwriteForm.car_details} onChange={(e)=>setOverwriteForm({...overwriteForm, car_details:e.target.value})} placeholder={selectedBooking?.listing_car_details} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all" />
                 </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={submitFinalApproval}
                  disabled={verifyingId}
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black uppercase py-6 rounded-[2rem] transition-all shadow-2xl flex items-center justify-center gap-4 text-xs tracking-[0.2em] disabled:opacity-50"
                >
                  {verifyingId ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} className="text-emerald-400" /> Confirm Audit & Dispatch</>}
                </button>
                <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest">
                  Confirmed: Passenger owes Rs.{selectedBooking ? (selectedBooking.total_price - selectedBooking.amount_paid) : 0} to driver at car
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}