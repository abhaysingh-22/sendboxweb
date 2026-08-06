import React from 'react';
import { X } from 'lucide-react';

export default function RecordDialog({
  dialogRef,
  title,
  formData,
  onChange,
  onSubmit,
  onClose,
  submitText
}) {
  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="record-dialog-title"
      className="w-full max-w-md p-6 bg-white border border-gray-100 rounded-2xl shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm focus:outline-none transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 id="record-dialog-title" className="text-lg font-bold text-gray-900">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            placeholder="e.g. James Smith"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            placeholder="e.g. 9878765676"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.dob}
            onChange={(e) => onChange({ ...formData, dob: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => onChange({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white cursor-pointer"
          >
            <option value="Sent">Sent</option>
            <option value="Pending">Pending</option>
          </select>
        </div> */}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#0c47a1] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            {submitText}
          </button>
        </div>
      </form>
    </dialog>
  );
}
