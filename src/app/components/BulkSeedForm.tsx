"use client";

import React, { useState } from "react";
import { Plus, Trash2, Calendar, TrendingUp, Loader2, Info } from "lucide-react";

export default function BulkSeedForm() {
  const [formData, setFormData] = useState({
    origin: "islamabad",
    destination: "skardu",
    start_date: new Date().toISOString().split("T")[0],
    days_to_schedule: 14,
    base_price: 5000,
    cost_price: 3800,
    total_seats: 4,
  });
  const [times, setTimes] = useState<string[]>(["07:00", "16:00"]);
  const [newTime, setNewTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const addTimeTag = () => {
    if (newTime && !times.includes(newTime)) {
      setTimes([...times, newTime].sort());
      setNewTime("");
    }
  };

  const removeTimeTag = (timeToRemove: string) => {
    setTimes(times.filter((t) => t !== timeToRemove));
  };

  // Live Math projections for premium operators
  const singleTripMargin = formData.base_price - formData.cost_price;
  const totalProjectedRides = formData.days_to_schedule * times.length;
  const maxPotentialProfit = singleTripMargin * formData.total_seats * totalProjectedRides;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg("");

    const payload = {
      ...formData,
      departure_times: times,
      base_price: Number(formData.base_price),
      cost_price: Number(formData.cost_price),
      days_to_schedule: Number(formData.days_to_schedule),
      total_seats: Number(formData.total_seats),
    };

    try {
        const token = localStorage.getItem("token");
     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/admin/bulk-seed`, {
  method: "POST",
  headers: { "Content-Type": "application/json" ,
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(payload),
});

      if (!response.ok) throw new Error("Seeding operation failed.");
      
      const data = await response.json();
      setStatusMsg(`✅ Successfully generated ${data.total_seeded} operational run slots.`);
    } catch (err: any) {
      setStatusMsg(`❌ Error: ${err.message || "Failed to sync metadata matrix."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white sm:border sm:border-slate-100 rounded-3xl p-4 sm:p-8 sm:shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-2">
          <Calendar className="text-emerald-500 w-5 h-5" />
          Ghost Fleet <span className="text-slate-400 font-normal">Generator</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Inject high-availability calendar slots directly into the timeline</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Route Selectors Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Origin Hub</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition-colors capitalize font-medium"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            >
              <option value="islamabad">Islamabad</option>
              <option value="rawalpindi">Rawalpindi</option>
              <option value="skardu">Skardu</option>
              <option value="gilgit">Gilgit</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Destination Target</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition-colors capitalize font-medium"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            >
              <option value="skardu">Skardu</option>
              <option value="gilgit">Gilgit</option>
              <option value="islamabad">Islamabad</option>
              <option value="rawalpindi">Rawalpindi</option>
            </select>
          </div>
        </div>

        {/* Date Grid Array */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Anchored Start Date</label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-medium"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule Horizon (Days)</label>
            <input
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-medium"
              value={formData.days_to_schedule}
              onChange={(e) => setFormData({ ...formData, days_to_schedule: Number(e.target.value) })}
              placeholder="e.g. 14"
            />
          </div>
        </div>

        {/* Dynamic Tag Injector Tray */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Daily Timeline Dispatch Slots</label>
          <div className="flex gap-2 mb-3">
            <input
              type="time"
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-medium"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <button
              type="button"
              onClick={addTimeTag}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              <Plus size={14} /> Add Slot
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1.5 min-h-[36px] items-center">
            {times.length === 0 ? (
              <p className="text-slate-400 text-xs italic flex items-center gap-1"><Info size={12}/> Attach minimum one timestamp node.</p>
            ) : (
              times.map((time) => (
                <span key={time} className="inline-flex items-center gap-2 bg-white border border-slate-200/80 text-slate-800 text-xs font-bold pl-3 pr-2 py-1.5 rounded-xl shadow-sm/50 animate-in fade-in zoom-in-95 duration-150">
                  {time}
                  <button 
                    type="button" 
                    onClick={() => removeTimeTag(time)} 
                    className="text-slate-300 hover:text-rose-500 p-0.5 rounded-md hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Pricing Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Passenger Ticket Fare (PKR)</label>
            <input
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-semibold text-emerald-600"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Driver Buyout Cost (PKR)</label>
            <input
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-semibold text-slate-600"
              value={formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Live Ledger Projection Summary Card */}
        {times.length > 0 && singleTripMargin > 0 && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in-50 duration-300">
            <div className="min-w-0">
              <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest block mb-0.5">Yield Forecast Matrix</span>
              <p className="text-xs text-emerald-800/80 font-medium">
                Generating <span className="font-bold text-slate-900">{totalProjectedRides} runs</span> over {formData.days_to_schedule} days. Average single seat net margin: {singleTripMargin} PKR.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[7px] font-black uppercase text-slate-400 block tracking-tighter">Max Capacity Gross Profit</span>
              <span className="text-sm font-black text-emerald-700 font-mono tracking-tight">+{maxPotentialProfit.toLocaleString()} PKR</span>
            </div>
          </div>
        )}

        {/* Form Submission Lever */}
        <button
          type="submit"
          disabled={loading || times.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl shadow-md shadow-emerald-600/10 transition-all active:scale-[0.99] flex items-center justify-center gap-2 select-none"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Mapping Route Grid Sequences...
            </>
          ) : (
            <>
              <TrendingUp size={15} />
              Deploy Managed Clusters to Timeline Grid
            </>
          )}
        </button>

        {statusMsg && (
          <div className={`p-4 rounded-xl text-center text-xs font-black uppercase tracking-wider animate-in fade-in duration-200 ${
            statusMsg.includes("❌") 
              ? "bg-rose-50 text-rose-600 border border-rose-100" 
              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          }`}>
            {statusMsg}
          </div>
        )}
      </form>
    </div>
  );
}