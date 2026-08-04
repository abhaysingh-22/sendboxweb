import React from 'react';

export default function StatsCards({ totalEntries, sentTillNow, pendingCount }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Entries Card */}
      <div className="bg-[#ebf5ff] border border-blue-100 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
        <h2 className="text-sm font-semibold text-blue-600">Total Entries</h2>
        <p className="text-4xl font-bold text-blue-700 mt-2">{totalEntries}</p>
      </div>

      {/* Sent Till Now Card */}
      <div className="bg-[#f0fdf4] border border-green-100 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
        <h2 className="text-sm font-semibold text-green-600">Sent Till Now</h2>
        <p className="text-4xl font-bold text-green-700 mt-2">{sentTillNow}</p>
      </div>

      {/* Pending Card */}
      <div className="bg-[#fffbeb] border border-amber-100 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
        <h2 className="text-sm font-semibold text-amber-700">Pending</h2>
        <p className="text-4xl font-bold text-amber-700 mt-2">{pendingCount}</p>
      </div>
    </section>
  );
}
