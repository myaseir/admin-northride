"use client";

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Loader2, X, Phone, Car, 
  Clock,Calendar, Hash, ArrowRight, Banknote, Star, AlertCircle, Sparkles, User
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BookingVerificationTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Context states for the admin
  const [passengerThread, setPassengerThread] = useState([]);
  const [hasDuplicates, setHasDuplicates] = useState(false);
  
  const [overwriteForm, setOverwriteForm] = useState({
    name: '', contact_1: '', car_details: ''
  });


  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "TBD";
    const timePart = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr;
    const [hours, minutes] = timePart.split(':');
    
    let h = parseInt(hours);
    if (isNaN(h)) return timeStr; 
    
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

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

 const handleOpenApprove = async (booking) => {
    setSelectedBooking(booking);
    setHasDuplicates(false); 
    setPassengerThread([]); 
    
    // 1. Default clear the form while fetching
    setOverwriteForm({ name: '', contact_1: '', car_details: '' });
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/booking-context/${booking.passenger_id}/${booking.trip_id}`, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (res.ok) {
        const thread = await res.json();
        setPassengerThread(thread); 
        
        const currentId = String(booking._id || booking.id);
        const duplicates = thread.filter(b => String(b.id) !== currentId);
        
        if (duplicates.length > 0) {
          setHasDuplicates(true);
          
          // 🎯 THE NEW LOGIC: Auto-fill immediately if a previous booking exists
          const latest = duplicates[0];
          setOverwriteForm({
            name: latest.final_driver_name || latest.listing_driver_name || "",
            contact_1: latest.final_driver_phone || latest.listing_driver_phone || "",
            car_details: latest.final_car_details || latest.listing_car_details || ""
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch context", err);
    }

    setShowModal(true);
  };

  const submitFinalApproval = async () => {
    const bId = selectedBooking._id || selectedBooking.id;
    setVerifyingId(bId);
    
    const finalPayload = {
      // Use a valid 24-character hex string format for ghost trips
      driver_id: selectedBooking.listing_driver_id || "660000000000000000000001",
      overwrites: {
        name: overwriteForm.name.trim() || selectedBooking.listing_driver_name || "Verified Driver",
        contact_1: overwriteForm.contact_1.trim() || selectedBooking.listing_driver_phone || "No Contact",
        car_details: overwriteForm.car_details.trim() || selectedBooking.listing_car_details || "Vehicle Details Managed"
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
        toast.success("Verified & Dispatched Successfully");
        setShowModal(false);
        fetchBookings();
      } else {
        toast.error("Verification processing failed");
      }
    } catch (err) { 
      toast.error("Connection error"); 
    } finally { 
      setVerifyingId(null); 
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-2 sm:p-6 space-y-6 font-sans">
      {/* CARD LAYOUT HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-950 p-6 sm:p-8 rounded-3xl md:rounded-[2.5rem] text-white shadow-xl border border-white/5 relative overflow-hidden gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic flex items-center gap-2 sm:gap-3">
            <ShieldCheck className="text-emerald-400 shrink-0" size={28}/> Financial Audit
          </h2>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-1 truncate">
            System Ledger: {bookings.length} Pending Deposits
          </p>
        </div>
        <button 
          onClick={fetchBookings} 
          className="w-full sm:w-auto relative z-10 text-[10px] font-black bg-white/5 text-white border border-white/10 px-5 py-3 rounded-xl hover:bg-emerald-500 hover:border-emerald-500 transition-all uppercase tracking-widest active:scale-95 text-center"
        >
          Refresh Database
        </button>
      </div>

      {/* PENDING TRANSACTIONS TRACKER FEED */}
      <div className="space-y-4">
    {bookings.length === 0 ? (
  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 text-sm font-medium italic">
    Zero pending verifications remaining in queue log.
  </div>
) : (
  bookings.map((b) => {
    // Return the JSX block here
    return (
      <div key={b._id || b.id} className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6 hover:border-slate-300 transition-all shadow-sm hover:shadow-md relative overflow-hidden">
        
        {/* SECTION 1: PASSENGER PROFILE METRICS */}
        <div className="flex-1 min-w-0 w-full space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {b.is_brokered ? (
              <span className="bg-slate-900 text-white font-black text-[8px] sm:text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 shrink-0 animate-pulse">
                <Sparkles size={10} className="text-emerald-400 fill-emerald-400"/> Concierge Dispatch Required
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-black text-[8px] sm:text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0">
                ✓ Driver Locked
              </span>
            )}
            <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
              <Hash size={10}/> {(b._id || b.id).slice(-8).toUpperCase()}
            </span>
          </div>
          
          <h4 className="text-lg sm:text-xl font-black text-slate-900 truncate uppercase tracking-tight flex items-center gap-1.5">
            {b.passenger_name || "Unknown Traveler"}
            {b.has_premium_seat && <Star size={15} className="text-amber-400 fill-amber-400 shrink-0" />}
          </h4>
          
          {/* UPDATED TIME DISPLAY */}
         {/* UPDATED: Meta-Data Display */}
<div className="flex flex-col gap-2 mt-2">
   {/* 1. Trip Departure Time */}
   <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit">
      <Clock size={12} className="shrink-0" />
      <p className="text-[10px] font-black uppercase tracking-widest">
        Departure: {formatDisplayTime(b.departure_time || b.trip_departure_time || b.trip?.departure_time)}
      </p>
   </div>


   {/* 3. When the Booking was made */}
   <div className="flex items-center gap-1.5 px-1">
      <Calendar size={10} className="shrink-0" />
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        Booked: {b.created_at ? new Date(b.created_at).toLocaleString() : 'N/A'}
      </p>
   </div>
</div>
        </div>

        {/* SECTION 2 & 3: REMAINDER OF YOUR EXISTING CODE */}
        <div className="w-full lg:max-w-sm bg-slate-50/80 border border-slate-200/60 p-4 sm:p-5 rounded-xl sm:rounded-[2rem]">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
              <Banknote size={12} className="text-emerald-600"/> Payment Verification Source
           </p>
           <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-slate-400 uppercase tracking-tight">Sender Profile:</span>
                <span className="font-black text-slate-800 uppercase truncate max-w-[180px]">{b.sender_name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-slate-400 uppercase tracking-tight">Account/Wallet:</span>
                <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/40 tracking-wider">{b.account_number || b.account_no || 'N/A'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-4">
                <span className="font-black text-emerald-600 uppercase tracking-tight">Transaction TID:</span>
                <span className="font-mono font-black text-emerald-700 select-all bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md tracking-wide">{b.trx_id || b.transactionId || 'N/A'}</span>
              </div>
           </div>
        </div>

        <div className="flex sm:flex-row lg:flex-col items-center sm:justify-between lg:justify-center gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0">
           <div className="text-left sm:text-right lg:text-right min-w-[120px] space-y-0.5">
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Clear Deposit</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-950 leading-none tracking-tighter italic block font-mono">
                Rs.{b.amount_paid}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Total: Rs.{b.total_price || b.amount}</span>
           </div>
           
           <button 
            onClick={() => handleOpenApprove(b)}
            className="flex-1 lg:flex-none bg-slate-950 text-white px-6 sm:px-8 py-4 rounded-xl sm:rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 shrink-0 select-none"
           >
             Verify <ArrowRight size={14} className="text-emerald-400"/>
           </button>
        </div>
      </div>
    );
  })
)}
      </div>

      {/* TACTICAL ASSIGNMENT & APPROVAL DIALOG DRAWER */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 my-auto animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden shrink-0">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full -mr-16 -mt-16" />
               <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md text-slate-900">
                   <ShieldCheck size={20}/>
                </div>
                <div>
                   <h4 className="text-lg font-black uppercase italic tracking-tighter">Confirm Ledger Row</h4>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verify PKR {selectedBooking?.amount_paid} Core Deposit</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2.5 bg-white/10 rounded-xl hover:bg-rose-500/20 hover:text-rose-400 transition-colors relative z-10"><X size={16}/></button>
            </div>
            
            {/* Modal Content Scroll viewport */}
            <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
              
              {/* DUPLICATE WARNING BANNER */}
              {hasDuplicates && (
                <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl animate-pulse">
                  <div className="flex items-center gap-2 text-rose-700">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="font-black text-[11px] uppercase tracking-widest">
                      Critical: Passenger has duplicate confirmed seats on this trip!
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-rose-600 mt-1">
                    Admin, review the seat details in the blue box below before proceeding.
                  </p>
                </div>
              )}

              {/* EXISTING PASSENGER THREAD */}
              {passengerThread.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">
                     Existing Bookings for this Passenger:
                  </h4>
                  {passengerThread.map((b) => (
                    <div key={b.id} className="text-[11px] font-bold text-blue-600 mb-1 border-b border-blue-100 pb-1 last:border-0">
                      • Seat: {b.seat_layout?.join(', ') || "Standard"} | 
                      <span className="ml-2 text-blue-800">{b.final_driver_name || b.listing_driver_name || "Unassigned"}</span>
                    </div>
                  ))}
                  
                  {/* Only show Auto-fill if this is a brokered booking needing driver details */}
                  {selectedBooking?.is_brokered && (
                    <button 
                      type="button"
                      className="mt-2 text-[9px] font-black underline text-blue-800 hover:text-blue-900"
                      onClick={() => {
                        const latest = passengerThread[0];
                        setOverwriteForm({
                          name: latest.final_driver_name || latest.listing_driver_name || "",
                          contact_1: latest.final_driver_phone || latest.listing_driver_phone || "",
                          car_details: latest.final_car_details || latest.listing_car_details || ""
                        });
                        toast.success("Driver details copied!");
                      }}
                    >
                      Auto-fill with existing vehicle details
                    </button>
                  )}
                </div>
              )}

              {/* Financial Margin Overview */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/40">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Advance Received</span>
                    <span className="text-xl font-black text-emerald-600 font-mono">Rs.{selectedBooking?.amount_paid}</span>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/40">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Collect at Vehicle</span>
                    <span className="text-xl font-black text-slate-900 font-mono">
                      Rs.{selectedBooking ? (selectedBooking.total_price - selectedBooking.amount_paid) : 0}
                    </span>
                 </div>
              </div>

              {/* CONCIERGE OPERATION NOTIFICATION TAG */}
              {selectedBooking?.is_brokered && (
                <div className="bg-amber-50 border border-amber-200/70 p-3.5 rounded-xl flex items-start gap-2 text-amber-800 text-[11px]">
                  <AlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-black uppercase tracking-wider block text-[10px] text-amber-700">Brokered Run Modification Enforced</span>
                    Type your manually sourced driver profile credentials below. This dynamically replaces the generic layout codes for the client dashboard manifest.
                  </div>
                </div>
              )}

              {/* ADAPTIVE DISPATCH INPUT MATRIX */}
              <div className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 px-1"><User size={12}/> Carrier Captain</label>
                      <input 
                        type="text"
                        value={overwriteForm.name} 
                        onChange={(e)=>setOverwriteForm({...overwriteForm, name:e.target.value})} 
                        placeholder={selectedBooking?.is_brokered ? "e.g. Captain Raja Khan" : selectedBooking?.listing_driver_name} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all text-slate-900" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 px-1"><Phone size={12}/> Captain Contact</label>
                      <input 
                        type="text"
                        value={overwriteForm.contact_1} 
                        onChange={(e)=>setOverwriteForm({...overwriteForm, contact_1:e.target.value})} 
                        placeholder={selectedBooking?.is_brokered ? "e.g. 03001234567" : selectedBooking?.listing_driver_phone} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all text-slate-900" 
                      />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 px-1"><Car size={12}/> Vehicle Vector Attributes</label>
                    <input 
                      type="text"
                      value={overwriteForm.car_details} 
                      onChange={(e)=>setOverwriteForm({...overwriteForm, car_details:e.target.value})} 
                      placeholder={selectedBooking?.is_brokered ? "e.g. White Corolla (ICT-ABC-123)" : selectedBooking?.listing_car_details} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all text-slate-900" 
                    />
                 </div>
              </div>

              {/* ACTION FOOTER COUPLING */}
              <div className="flex flex-col gap-3 pt-2 shrink-0">
                <button 
                  onClick={submitFinalApproval}
                  disabled={verifyingId}
                  className="w-full bg-slate-950 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold uppercase py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs tracking-widest select-none"
                >
                  {verifyingId ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Clearing Settlement Tokens...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} className="text-emerald-400" /> 
                      Confirm Audit & Release Dispatch
                    </>
                  )}
                </button>
                <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest">
                  Escrow Terms: Traveler holds remaining balance to clear manually at vehicle deck.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}