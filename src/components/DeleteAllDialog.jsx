import React, { useState, useEffect } from 'react';

export default function DeleteAllDialog({ dialogRef, onConfirm, onClose }) {
  const [confirmText, setConfirmText] = useState('');

  // Reset text input when dialog is closed
  useEffect(() => {
    if (!dialogRef.current) return;
    const dialogEl = dialogRef.current;

    const handleClose = () => {
      setConfirmText('');
    };

    dialogEl.addEventListener('close', handleClose);
    return () => {
      dialogEl.removeEventListener('close', handleClose);
    };
  }, [dialogRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (confirmText.trim() === 'confirm') {
      onConfirm();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="delete-all-title"
      className="w-full max-w-sm p-6 bg-white border border-gray-100 rounded-2xl shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm focus:outline-none transition-all duration-300"
    >
      <form onSubmit={handleSubmit}>
        <h3 id="delete-all-title" className="text-lg font-bold text-red-700 mb-2">
          Delete All Records
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          This will permanently delete all records from the database. This action is irreversible.
        </p>
        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          Type <span className="text-red-600 font-bold select-all">confirm</span> to proceed:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type confirm"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm mb-5"
          required
        />

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={confirmText.trim() !== 'confirm'}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Delete All
          </button>
        </div>
      </form>
    </dialog>
  );
}
