"use client";

import React, { useState, useEffect } from 'react';
import { 
  Loader2, Activity, PlayCircle, CheckCircle2, 
  XCircle, Clock, Users, Sparkles, AlertCircle, ChevronDown, ChevronUp, User, Car, Archive
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReferralAuditTab from './ReferralAuditTab';

export default function AdminFleetDashboard() {
    
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [expandedTrips, setExpandedTrips] = useState({}); 
  
  // 🎯 fixed state initialization
  const [viewMode, setViewMode] = useState('active');
  
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setVisibleCount(6);
  }, [viewMode]);

  const formatCustomDate = (dateStr, timeStr = null) => {
    if (!dateStr) return "TBD";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "TBD";
      
      const day = d.getDate();
      const month = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      
      let timeString = "";
      
      if (dateStr.includes('T') && !timeStr) {
         let h = d.getHours();
         const m = d.getMinutes().toString().padStart(2, '0');
         const ampm = h >= 12 ? 'pm' : 'am';
         h = h % 12 || 12;
         timeString = `, ${h}:${m} ${ampm}`;
      } else if (timeStr) {
         timeString = `, ${timeStr.toLowerCase()}`;
      }
      
      return `${day} ${month} ${year}${timeString}`;
    } catch (e) {
      return "TBD";
    }
  };

  const fetchFleet = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/fleet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      toast.error("Failed to sync fleet radar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleOverride = async (tripId, newStatus, actionName) => {
    const confirmAction = window.confirm(`Are you sure you want to FORCE ${actionName} this trip?`);
    if (!confirmAction) return;

    setProcessingId(tripId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/override-trip/${tripId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_status: newStatus })
      });

      if (res.ok) {
        toast.success(`Trip ${actionName} successfully!`);
        fetchFleet();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Failed to update trip.");
      }
    } catch (err) {
      toast.error("Network error during override.");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleManifest = (tripId) => {
    setExpandedTrips(prev => ({
      ...prev,
      [tripId]: !prev[tripId]
    }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Radar...</p>
      </div>
    );
  }

  const activeTrips = trips.filter(t => t.status === 'scheduled' || t.status === 'in-progress');
  const finishedTrips = trips.filter(t => t.status === 'completed' || t.status === 'cancelled');
  
  const currentCategoryTrips = viewMode === 'active' ? activeTrips : finishedTrips;
  const displayedTrips = currentCategoryTrips.slice(0, visibleCount);
  const hasMoreTrips = visibleCount < currentCategoryTrips.length;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
            <Activity className="text-emerald-500" /> Fleet Radar
          </h2>
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">
            Total Monitored Trips: {trips.length}
          </p>
        </div>
        <button 
          onClick={fetchFleet} 
          className="w-full sm:w-auto px-5 py-3 sm:py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
        >
          Refresh Radar
        </button>
      </div>

      {/* 2. SUB-NAVIGATION TOGGLE (Mobile Friendly flex-wrap added) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-full md:w-fit mb-4">
        <button
          onClick={() => setViewMode('active')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            viewMode === 'active' 
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlayCircle size={14} className={viewMode === 'active' ? "text-emerald-500" : ""} />
          Live Ops <span className="hidden sm:inline">({activeTrips.length})</span>
        </button>
        
        <button
          onClick={() => setViewMode('finished')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            viewMode === 'finished' 
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Archive size={14} className={viewMode === 'finished' ? "text-blue-500" : ""} />
          Ledger <span className="hidden sm:inline">({finishedTrips.length})</span>
        </button>

        <button
          onClick={() => setViewMode('audits')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            viewMode === 'audits' 
              ? 'bg-white text-rose-900 shadow-sm border border-rose-200' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle size={14} className={viewMode === 'audits' ? "text-rose-500" : ""} />
          Referrals
        </button>
      </div>

      {/* 3. MAIN RENDER BLOCK (Cleaned up conditional rendering) */}
      {viewMode === 'audits' ? (
        <ReferralAuditTab />
      ) : displayedTrips.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 border border-slate-100 rounded-3xl">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            No {viewMode} trips found.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TRIPS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayedTrips.map((trip) => (
              <div key={trip.id || trip._id} className={`bg-white border ${viewMode === 'finished' ? 'border-slate-100 opacity-90' : 'border-slate-200'} rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden`}>
                
                {/* Header info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                      {trip.is_brokered && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                          <Sparkles size={10} /> Concierge
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-1 flex-wrap">
                      {trip.origin} <span className="text-emerald-500">→</span> {trip.destination}
                    </h3>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-end"><Clock size={12}/> {trip.time}</p>
                    <p className="text-xs font-bold text-slate-600">{formatCustomDate(trip.date)}</p>
                  </div>
                </div>

                {/* Middle Data & Manifest Toggle */}
                <div className="flex items-center justify-between py-3 border-y border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users size={16} className="text-slate-400" />
                    <span className="text-sm font-black">{trip.confirmed_pax_count || 0} / {trip.total_seats}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Pax</span>
                  </div>
                  
                  <button 
                    onClick={() => toggleManifest(trip.id || trip._id)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {expandedTrips[trip.id || trip._id] ? <><ChevronUp size={14}/> Hide Manifest</> : <><ChevronDown size={14}/> View Manifest</>}
                  </button>
                </div>

                {/* PASSENGER MANIFEST DROP-DOWN */}
                {expandedTrips[trip.id || trip._id] && (
                  <div className="mb-5 space-y-2 bg-slate-50 border border-slate-100 p-3 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">
                      Trip Passenger Ledger
                    </h4>
                    
                    {(!trip.manifest || trip.manifest.length === 0) ? (
                      <p className="text-xs font-bold text-slate-400 text-center italic py-2">No bookings recorded yet.</p>
                    ) : (
                      trip.manifest.map((booking) => (
                        <div key={booking.id} className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                          
                          {/* Passenger Details & Dates */}
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                              <User size={14} className="text-emerald-500"/> 
                              {booking.passenger_name}
                            </p>
                            
                            <div className="mt-1.5 space-y-0.5">
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <span className="text-slate-400 w-12">Booked:</span> 
                                {formatCustomDate(booking.created_at)}
                              </p>
                              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                <span className="text-emerald-400 w-12">Depart:</span> 
                                {formatCustomDate(trip.date, trip.time)}
                              </p>
                              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1 mt-1">
                                <span className="text-blue-400 w-12">Seats:</span> 
                                <span className="bg-blue-50 px-1.5 rounded">{booking.seat_layout?.join(', ')}</span>
                              </p>
                            </div>
                          </div>

                          {/* Driver & Car Assigned */}
                          <div className="sm:text-right bg-slate-50 p-2.5 rounded-lg border border-slate-100 min-w-[140px]">
                            <p className="text-[10px] font-black text-slate-700 uppercase flex items-center sm:justify-end gap-1 mb-1">
                               <Car size={12} className="text-amber-500"/>
                               {booking.final_driver_name || "Driver Pending"}
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase">
                              {booking.final_car_details || "Car Details TBD"}
                            </p>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* GOD MODE ACTION BUTTONS */}
                {viewMode === 'active' && (
                  <div className="flex flex-wrap gap-2">
                    {trip.status === 'scheduled' && (
                      <>
                        <button 
                          onClick={() => handleOverride(trip.id || trip._id, 'in-progress', 'START')}
                          disabled={processingId === (trip.id || trip._id)}
                          className="flex-1 min-w-[120px] bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 border border-blue-200 py-3 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                        >
                          <PlayCircle size={14}/> Force Start
                        </button>
                        <button 
                          onClick={() => handleOverride(trip.id || trip._id, 'cancelled', 'CANCEL')}
                          disabled={processingId === (trip.id || trip._id)}
                          className="flex-1 min-w-[120px] bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 border border-rose-200 py-3 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                        >
                          <XCircle size={14}/> Reject
                        </button>
                      </>
                    )}

                    {trip.status === 'in-progress' && (
                      <button 
                        onClick={() => handleOverride(trip.id || trip._id, 'completed', 'COMPLETE')}
                        disabled={processingId === (trip.id || trip._id)}
                        className="w-full bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600 border border-emerald-200 py-3 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={14}/> Force Complete Ride
                      </button>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* LOAD MORE BUTTON */}
          {hasMoreTrips && (
            <div className="flex justify-center pt-4 pb-8">
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-6 py-4 sm:py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <ChevronDown size={14} className="text-emerald-500" />
                Show 10 More Trips
              </button>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}