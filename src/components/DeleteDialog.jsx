import React from 'react';

export default function DeleteDialog({ dialogRef, onConfirm, onClose }) {
  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="delete-dialog-title"
      className="w-full max-w-sm p-6 bg-white border border-gray-100 rounded-2xl shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm focus:outline-none transition-all duration-300"
    >
      <h3 id="delete-dialog-title" className="text-lg font-bold text-gray-900 mb-2">
        Delete Record
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Are you sure you want to delete this record? This action cannot be undone.
      </p>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>
    </dialog>
  );
}
