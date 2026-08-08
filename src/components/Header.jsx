import React from 'react';
import { Upload, LogOut } from 'lucide-react';

export default function Header({ onAddClick, onDeleteAllClick, onUploadClick, fileInputRef, onFileUpload, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-5 md:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        SendBox
      </h1>
      <div className="flex items-center gap-3 self-end md:self-auto">
        {/* Add New Record Button */}
        <button
          onClick={onAddClick}
          className="px-4 py-2.5 bg-[#f8fafc] border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100 font-semibold rounded-lg text-sm transition-all duration-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          Add New Record
        </button>

        {/* Delete All Records Button */}
        <button
          onClick={onDeleteAllClick}
          className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100/70 active:bg-red-200 font-semibold rounded-lg text-sm transition-all duration-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          Delete All Records
        </button>

        {/* Upload CSV / XLSX Button */}
        <button
          onClick={onUploadClick}
          className="px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#0c47a1] text-white font-semibold rounded-lg text-sm transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload CSV / XLSX
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer inline-flex"
          aria-label="Sign Out"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileUpload}
          accept=".csv"
          className="hidden"
        />
      </div>
    </header>
  );
}
