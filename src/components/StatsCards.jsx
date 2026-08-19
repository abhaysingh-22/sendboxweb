import React from 'react';

export default function StatsCards({
  totalEntries = 0,
  sentTillNow = 0,
  pendingCount = 0,
  activeFilter = 'ALL',
  onFilterChange = () => {},
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Entries Card */}
      <button
        type="button"
        onClick={() => onFilterChange('ALL')}
        className={`text-left rounded-xl p-6 transition-all duration-200 cursor-pointer relative overflow-hidden border ${
          activeFilter === 'ALL'
            ? 'bg-[#e0efff] border-blue-400 ring-2 ring-blue-500/50 shadow-md scale-[1.01]'
            : 'bg-[#ebf5ff] border-blue-100/80 hover:border-blue-300 hover:shadow-md hover:scale-[1.008]'
        }`}
        aria-pressed={activeFilter === 'ALL'}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-blue-600">Total Entries</h2>
          {activeFilter === 'ALL' && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-600 text-white rounded-full">
              Active
            </span>
          )}
        </div>
        <p className="text-4xl font-bold text-blue-700 mt-2">{totalEntries}</p>
        <p className="text-xs text-blue-500/90 mt-2 font-medium">
          {activeFilter === 'ALL' ? '● Showing all records' : 'Click to view all records'}
        </p>
      </button>

      {/* Sent Till Now Card */}
      <button
        type="button"
        onClick={() => onFilterChange('Sent')}
        className={`text-left rounded-xl p-6 transition-all duration-200 cursor-pointer relative overflow-hidden border ${
          activeFilter === 'Sent'
            ? 'bg-[#e3f9eb] border-green-400 ring-2 ring-green-500/50 shadow-md scale-[1.01]'
            : 'bg-[#f0fdf4] border-green-100/80 hover:border-green-300 hover:shadow-md hover:scale-[1.008]'
        }`}
        aria-pressed={activeFilter === 'Sent'}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-green-600">Sent Till Now</h2>
          {activeFilter === 'Sent' && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-green-600 text-white rounded-full">
              Active
            </span>
          )}
        </div>
        <p className="text-4xl font-bold text-green-700 mt-2">{sentTillNow}</p>
        <p className="text-xs text-green-600/90 mt-2 font-medium">
          {activeFilter === 'Sent' ? '● Showing sent records' : 'Click to filter sent records'}
        </p>
      </button>

      {/* Pending Card */}
      <button
        type="button"
        onClick={() => onFilterChange('Pending')}
        className={`text-left rounded-xl p-6 transition-all duration-200 cursor-pointer relative overflow-hidden border ${
          activeFilter === 'Pending'
            ? 'bg-[#fef3c7] border-amber-400 ring-2 ring-amber-500/50 shadow-md scale-[1.01]'
            : 'bg-[#fffbeb] border-amber-100/80 hover:border-amber-300 hover:shadow-md hover:scale-[1.008]'
        }`}
        aria-pressed={activeFilter === 'Pending'}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-amber-700">Pending</h2>
          {activeFilter === 'Pending' && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-600 text-white rounded-full">
              Active
            </span>
          )}
        </div>
        <p className="text-4xl font-bold text-amber-700 mt-2">{pendingCount}</p>
        <p className="text-xs text-amber-600/90 mt-2 font-medium">
          {activeFilter === 'Pending' ? '● Showing pending records' : 'Click to filter pending records'}
        </p>
      </button>
    </section>
  );
}
