"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, ShieldAlert, CheckCircle2, XCircle, Users, User, Info } from 'lucide-react';

export default function ReferralAuditTab() {
  const [requests, setRequests] = useState({ suspicious_flagged: [], pending_no_trip: [] });
  const [loading, setLoading] = useState(true);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/referrals/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudits(); }, []);

  const resolveAudit = async (auditId, action) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/referrals/${auditId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action })
    });

    if (res.ok) {
      toast.success(`Referral ${action}ed successfully`);
      setRequests(prev => ({
        suspicious_flagged: prev.suspicious_flagged.filter(r => r._id !== auditId),
        pending_no_trip: prev.pending_no_trip.filter(r => r._id !== auditId)
      }));
    } else {
      toast.error("Resolution failed");
    }
  };

  if (loading) return <Loader2 className="animate-spin mx-auto mt-20 text-emerald-500" />;

  const hasNoData = requests.suspicious_flagged.length === 0 && requests.pending_no_trip.length === 0;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Referral Audits</h2>
        <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500">
          {requests.suspicious_flagged.length + requests.pending_no_trip.length} PENDING
        </div>
      </div>
      
      {hasNoData ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-slate-300" size={32} />
          </div>
          <p className="text-sm font-bold text-slate-400">All clear! No pending audits.</p>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* SECTION: Suspicious Referrals */}
          {requests.suspicious_flagged.length > 0 && (
            <section>
              <h3 className="text-sm font-black text-rose-600 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <ShieldAlert size={16} /> Flagged Fraud
              </h3>
              <div className="grid gap-4">
                {requests.suspicious_flagged.map(req => (
                  <div key={req._id} className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100 hover:border-rose-200 transition-all shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                          <User size={20} className="text-rose-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{req.user_details?.username || "Unknown User"}</p>
                          <p className="text-[10px] text-rose-500 font-medium uppercase mt-0.5">Fingerprint Match Detected</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {req.new_user_id}</p>
                        </div>
                      </div>

                      <div className="md:text-right pl-12 md:pl-0 border-l md:border-l-0 border-rose-200 md:border-none">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Referrer</p>
                        <p className="text-sm font-bold text-slate-900">{req.referrer_details?.username || "Unknown"}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Code: {req.referrer_id}</p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button onClick={() => resolveAudit(req._id, 'approve')} className="p-2.5 text-emerald-600 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl transition-colors"><CheckCircle2 size={20}/></button>
                        <button onClick={() => resolveAudit(req._id, 'reject')} className="p-2.5 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"><XCircle size={20}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION: Pending Activity */}
          {requests.pending_no_trip.length > 0 && (
            <section>
              <h3 className="text-sm font-black text-slate-600 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Users size={16} /> Pending First Trip
              </h3>
              <div className="grid gap-3">
                {requests.pending_no_trip.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-600">{user.username?.charAt(0) || '?'}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{user.username || "Anonymous"}</p>
                        <p className="text-[10px] text-slate-400">Joined via: {user.referred_by || "Organic"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                       <p className="text-[10px] font-bold text-emerald-600">Awaiting Trip</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}