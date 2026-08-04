import React from 'react';
import { Edit, Trash2, AlertCircle } from 'lucide-react';

// Helper to get initials from a name (e.g. James -> JA, John Doe -> JD)
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function DeliveryTable({ records, onEditClick, onDeleteClick }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              <th className="py-4 px-6 font-semibold">Name</th>
              <th className="py-4 px-6 font-semibold">Phone Number</th>
              <th className="py-4 px-6 font-semibold">Date of Birth</th>
              <th className="py-4 px-6 font-semibold text-center">Status</th>
              <th className="py-4 px-6 font-semibold text-center">Update</th>
              <th className="py-4 px-6 font-semibold text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length > 0 ? (
              records.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50/60 transition-colors duration-150 text-sm text-gray-700"
                >
                  {/* Name column with initials avatar */}
                  <td className="py-4 px-6 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold select-none flex-shrink-0">
                      {getInitials(record.name)}
                    </div>
                    <span>{record.name}</span>
                  </td>

                  {/* Phone column */}
                  <td className="py-4 px-6 text-gray-600">
                    {record.phone || '—'}
                  </td>

                  {/* DOB column */}
                  <td className="py-4 px-6 text-gray-600">
                    {record.dob || '—'}
                  </td>

                  {/* Status column with dot and badge */}
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        record.status === 'Sent'
                          ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                          : 'bg-[#fef7e0] text-[#b06000] border-[#fde293]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          record.status === 'Sent' ? 'bg-[#137333]' : 'bg-[#b06000]'
                        }`}
                      />
                      {record.status}
                    </span>
                  </td>

                  {/* Edit Action */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onEditClick(record)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-200 inline-flex cursor-pointer"
                      aria-label="Edit record"
                    >
                      <Edit className="w-4.5 h-4.5" />
                    </button>
                  </td>

                  {/* Delete Action */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onDeleteClick(record)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50/80 transition-all duration-200 inline-flex cursor-pointer"
                      aria-label="Delete record"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-gray-300" />
                    <span>No records found. Click "Add New Record" or upload a CSV to get started!</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
