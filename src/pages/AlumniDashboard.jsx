import React from 'react';

const AlumniDashboard = () => {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-left max-w-4xl mx-auto space-y-4">
      <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Alumni Dashboard</h3>
      <p className="text-sm text-slate-500">Welcome to the Alumni Hub. Post job opportunities, refer students, and manage mentorship requests.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 className="font-bold text-slate-800 text-sm">Mentorship Requests</h4>
          <p className="text-xs text-slate-400 mt-1">Accept or schedule mock interviews.</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 className="font-bold text-slate-800 text-sm">Post a Job</h4>
          <p className="text-xs text-slate-400 mt-1">Share referrals or job openings.</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 className="font-bold text-slate-800 text-sm">Referrals Pending</h4>
          <p className="text-xs text-slate-400 mt-1">Review student applications.</p>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
