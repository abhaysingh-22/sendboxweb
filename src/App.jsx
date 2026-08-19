import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import DeliveryTable from './components/DeliveryTable';
import RecordDialog from './components/RecordDialog';
import DeleteDialog from './components/DeleteDialog';
import DeleteAllDialog from './components/DeleteAllDialog';
import Login from './components/Login';
import Toast from './components/Toast';
import { parseCSV } from './utils/csvParser';
import {
  fetchRecordsPaginated,
  fetchStats,
  fetchAllPhoneNumbers,
  checkPhoneExists,
  insertRecord,
  bulkInsertRecords,
  updateRecord,
  deleteRecord,
  deleteAllRecords,
} from './utils/recordsService';
import { supabase } from './utils/supabaseClient';

// Helper to format a yyyy-mm-dd date string to "MMM DD, YYYY" for display
function formatDateForDisplay(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Helper to convert a Supabase row to the shape our components expect
function mapRow(row) {
  return {
    id: row.id,
    name: row.full_name,
    phone: row.phone_number || '',
    dob: formatDateForDisplay(row.dob),
    dobRaw: row.dob || '', // keep raw yyyy-mm-dd for edit form
    status: row.status || 'Pending',
  };
}

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Records state — populated from Supabase on mount
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const LIMIT = 15;

  // Filter state for status ('ALL' | 'Sent' | 'Pending')
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Stats state
  const [stats, setStats] = useState({ total: 0, sent: 0, pending: 0 });

  // Modal and toast states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [toast, setToast] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    status: 'Pending'
  });

  // Refs for dialog elements
  const addDialogRef = useRef(null);
  const editDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const deleteAllDialogRef = useRef(null);
  const fileInputRef = useRef(null);

  // Refresh records and stats from Supabase
  const refreshData = async (page = currentPage, filter = statusFilter) => {
    setLoading(true);

    // 1. Fetch paginated records with filter
    const { data: recs, error: recsError, count } = await fetchRecordsPaginated(page, LIMIT, filter);
    if (recsError) {
      console.error('Failed to fetch records:', recsError);
      showToast('error', `Failed to load records: ${recsError.message}`);
    } else {
      setRecords((recs || []).map(mapRow));
      setTotalRecords(count || 0);
    }

    // 2. Fetch stats globally
    const { data: statsData, error: statsError } = await fetchStats();
    if (statsError) {
      console.error('Failed to fetch stats:', statsError);
    } else if (statsData) {
      setStats({
        total: statsData.total ?? 0,
        sent: statsData.sent ?? 0,
        pending: statsData.pending ?? 0,
      });
    }

    setLoading(false);
  };

  // Check active session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch when page or status filter changes and user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      refreshData(currentPage, statusFilter);
    }
  }, [currentPage, statusFilter, isLoggedIn]);

  // Handler to filter records by clicking stats cards
  const handleFilterChange = (filter) => {
    if (statusFilter === filter && filter !== 'ALL') {
      setStatusFilter('ALL');
    } else {
      setStatusFilter(filter);
    }
    setCurrentPage(1);
  };

  // Show Toast Helper
  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // Close modals helpers
  const closeAddModal = () => {
    setIsAddOpen(false);
    setFormData({ name: '', phone: '', dob: '', status: 'Pending' });
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setCurrentRecord(null);
    setFormData({ name: '', phone: '', dob: '', status: 'Pending' });
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setCurrentRecord(null);
  };

  const closeDeleteAllModal = () => {
    setIsDeleteAllOpen(false);
  };

  // Open modals helpers
  const openEditModal = (record) => {
    setCurrentRecord(record);
    setFormData({
      name: record.name,
      phone: record.phone,
      dob: record.dobRaw || '',
      status: record.status
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (record) => {
    setCurrentRecord(record);
    setIsDeleteOpen(true);
  };

  // Handle outside clicks for dialogs (Safari light-dismiss fallback)
  useEffect(() => {
    const handleOutsideClick = (event, ref, closeFn) => {
      if (!ref.current || !ref.current.open) return;
      if (event.target === ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const isInDialog = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          closeFn();
        }
      }
    };

    const onAddClick = (e) => handleOutsideClick(e, addDialogRef, closeAddModal);
    const onEditClick = (e) => handleOutsideClick(e, editDialogRef, closeEditModal);
    const onDeleteClick = (e) => handleOutsideClick(e, deleteDialogRef, closeDeleteModal);
    const onDeleteAllClick = (e) => handleOutsideClick(e, deleteAllDialogRef, closeDeleteAllModal);

    window.addEventListener('click', onAddClick);
    window.addEventListener('click', onEditClick);
    window.addEventListener('click', onDeleteClick);
    window.addEventListener('click', onDeleteAllClick);

    return () => {
      window.removeEventListener('click', onAddClick);
      window.removeEventListener('click', onEditClick);
      window.removeEventListener('click', onDeleteClick);
      window.removeEventListener('click', onDeleteAllClick);
    };
  }, []);

  // Sync open states with native dialog showModal
  useEffect(() => {
    if (isAddOpen) addDialogRef.current?.showModal();
    else addDialogRef.current?.close();
  }, [isAddOpen]);

  useEffect(() => {
    if (isEditOpen) editDialogRef.current?.showModal();
    else editDialogRef.current?.close();
  }, [isEditOpen]);

  useEffect(() => {
    if (isDeleteOpen) deleteDialogRef.current?.showModal();
    else deleteDialogRef.current?.close();
  }, [isDeleteOpen]);

  useEffect(() => {
    if (isDeleteAllOpen) deleteAllDialogRef.current?.showModal();
    else deleteAllDialogRef.current?.close();
  }, [isDeleteAllOpen]);

  // ─── Form Submissions (async → Supabase with validations) ───

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const dob = formData.dob.trim();

    // 1. Validation: Field emptiness
    if (!name || !phone || !dob) {
      showToast('error', 'All fields (Name, Phone, DOB) are required!');
      return;
    }

    // 2. Validation: Phone number exact 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      showToast('error', 'Phone number must be exactly 10 digits!');
      return;
    }

    // 3. Validation: Duplicate phone check in query
    const { exists, error: checkError } = await checkPhoneExists(digitsOnly);
    if (checkError) {
      showToast('error', `Verification failed: ${checkError.message}`);
      return;
    }
    if (exists) {
      showToast('error', 'A record with this phone number already exists!');
      return;
    }

    const { error } = await insertRecord({
      full_name: name,
      phone_number: digitsOnly,
      dob: dob,
    });

    if (error) {
      showToast('error', `Failed to add record: ${error.message}`);
      return;
    }

    closeAddModal();
    showToast('success', 'Record added successfully!');
    // Reload page 1 to show the new record
    setCurrentPage(1);
    refreshData(1);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const dob = formData.dob.trim();

    // 1. Validation: Field emptiness
    if (!name || !phone || !dob) {
      showToast('error', 'All fields (Name, Phone, DOB) are required!');
      return;
    }

    // 2. Validation: Phone number exact 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      showToast('error', 'Phone number must be exactly 10 digits!');
      return;
    }

    // 3. Validation: Duplicate phone check in query (excluding current record ID)
    const { exists, error: checkError } = await checkPhoneExists(digitsOnly, currentRecord.id);
    if (checkError) {
      showToast('error', `Verification failed: ${checkError.message}`);
      return;
    }
    if (exists) {
      showToast('error', 'Another record with this phone number already exists!');
      return;
    }

    const { error } = await updateRecord(currentRecord.id, {
      full_name: name,
      phone_number: digitsOnly,
      dob: dob,
    });

    if (error) {
      showToast('error', `Failed to update record: ${error.message}`);
      return;
    }

    closeEditModal();
    showToast('success', 'Record updated successfully!');
    refreshData(currentPage);
  };

  const handleDeleteConfirm = async () => {
    if (!currentRecord) return;

    const { error } = await deleteRecord(currentRecord.id);
    if (error) {
      showToast('error', `Failed to delete record: ${error.message}`);
      return;
    }

    closeDeleteModal();
    showToast('success', 'Record deleted successfully!');

    // Handle case where we delete the last item on the page
    const remainingItemsOnPage = records.length - 1;
    if (remainingItemsOnPage === 0 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    } else {
      refreshData(currentPage);
    }
  };

  const handleDeleteAllConfirm = async () => {
    const { error } = await deleteAllRecords();
    if (error) {
      showToast('error', `Failed to delete all records: ${error.message}`);
      return;
    }

    closeDeleteAllModal();
    showToast('success', 'All records have been successfully deleted!');
    setCurrentPage(1);
    refreshData(1);
  };

  // ─── CSV File Upload → Validation & Supabase bulk insert ───

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'csv') {
      showToast('error', 'Only CSV files are supported!');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const { records: parsedRecords, successCount, errorCount, errors } = parseCSV(text);

      // Report any parse/validation errors in the console
      if (errors && errors.length > 0) {
        console.warn('CSV Validation skipped lines:', errors);
      }

      if (parsedRecords.length === 0) {
        showToast('error', 'No valid records found in the CSV file. Check formatting & check console for errors.');
        e.target.value = '';
        return;
      }

      // Fetch all existing phone numbers to check for duplicate phone numbers in DB (paginated to support >1000 rows)
      const { data: existingPhonesList, error: fetchErr } = await fetchAllPhoneNumbers();

      if (fetchErr) {
        showToast('error', `Failed to verify existing records: ${fetchErr.message}`);
        e.target.value = '';
        return;
      }

      const existingPhones = new Set(existingPhonesList || []);

      // Separate new records into to-insert and duplicates
      const toInsert = [];
      let dbDuplicateCount = 0;

      parsedRecords.forEach(r => {
        if (existingPhones.has(r.phone_number)) {
          dbDuplicateCount++;
        } else {
          toInsert.push(r);
        }
      });

      if (toInsert.length === 0) {
        showToast('error', `All ${parsedRecords.length} records already exist in the database!`);
        e.target.value = '';
        return;
      }

      // Bulk insert into Supabase
      const { error, count } = await bulkInsertRecords(toInsert);

      if (error) {
        showToast('error', `CSV upload failed: ${error.message}`);
      } else {
        const skippedMsg = [
          errorCount > 0 ? `${errorCount} corrupt rows` : '',
          dbDuplicateCount > 0 ? `${dbDuplicateCount} duplicate phones` : ''
        ].filter(Boolean).join(' and ');

        showToast(
          'success',
          `Successfully imported ${count} records!${skippedMsg ? ` (Skipped ${skippedMsg})` : ''}`
        );

        setCurrentPage(1);
        refreshData(1);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#090b11] font-sans antialiased">
        <Login onLoginSuccess={() => setIsLoggedIn(true)} showToast={showToast} />
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-800 font-sans antialiased">
      {/* Header Container */}
      <Header
        onAddClick={() => setIsAddOpen(true)}
        onDeleteAllClick={() => setIsDeleteAllOpen(true)}
        onUploadClick={triggerFileInput}
        fileInputRef={fileInputRef}
        onFileUpload={handleFileUpload}
        onLogout={async () => {
          await supabase.auth.signOut();
          setIsLoggedIn(false);
          showToast('info', 'Logged out successfully.');
        }}
      />

      {/* Main Section */}
      <main className="max-w-7xl mx-auto px-6 py-8 md:px-12">
        {/* Stats Cards Section */}
        <StatsCards
          totalEntries={stats.total}
          sentTillNow={stats.sent}
          pendingCount={stats.pending}
          activeFilter={statusFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Detailed Status Table Section */}
        <section className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">
                Detailed Delivery Status
              </h2>
              {statusFilter !== 'ALL' && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    statusFilter === 'Sent'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span>
                    Filtered: <strong className="font-bold">{statusFilter}</strong> ({totalRecords})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleFilterChange('ALL')}
                    className="hover:opacity-75 cursor-pointer ml-1 font-bold text-xs p-0.5 rounded-full hover:bg-black/5 leading-none inline-flex items-center justify-center"
                    title="Clear filter and show all"
                    aria-label="Clear filter"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            {statusFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => handleFilterChange('ALL')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
              >
                ← View All Records ({stats.total})
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading records…
            </div>
          ) : (
            <>
              <DeliveryTable
                records={records}
                onEditClick={openEditModal}
                onDeleteClick={openDeleteModal}
                statusFilter={statusFilter}
              />

              {/* Pagination Controls */}
              {totalRecords > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Showing <span className="font-semibold text-gray-700">{Math.min((currentPage - 1) * LIMIT + 1, totalRecords)}</span> to{' '}
                    <span className="font-semibold text-gray-700">{Math.min(currentPage * LIMIT, totalRecords)}</span> of{' '}
                    <span className="font-semibold text-gray-700">{totalRecords}</span> entries
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(totalRecords / LIMIT) }).map((_, i) => {
                        const pageNum = i + 1;
                        const shouldRender =
                          pageNum === 1 ||
                          pageNum === Math.ceil(totalRecords / LIMIT) ||
                          Math.abs(pageNum - currentPage) <= 1;

                        if (!shouldRender) {
                          if (pageNum === 2 || pageNum === Math.ceil(totalRecords / LIMIT) - 1) {
                            return <span key={pageNum} className="text-gray-400 px-1 font-semibold">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-[#1a73e8] text-white'
                                : 'border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      disabled={currentPage === Math.ceil(totalRecords / LIMIT)}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalRecords / LIMIT)))}
                      className="px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Dialog overlays */}
      <RecordDialog
        dialogRef={addDialogRef}
        title="Add New Record"
        formData={formData}
        onChange={setFormData}
        onSubmit={handleAddSubmit}
        onClose={closeAddModal}
        submitText="Add Record"
      />

      <RecordDialog
        dialogRef={editDialogRef}
        title="Edit Record"
        formData={formData}
        onChange={setFormData}
        onSubmit={handleEditSubmit}
        onClose={closeEditModal}
        submitText="Save Changes"
      />

      <DeleteDialog
        dialogRef={deleteDialogRef}
        onConfirm={handleDeleteConfirm}
        onClose={closeDeleteModal}
      />

      <DeleteAllDialog
        dialogRef={deleteAllDialogRef}
        onConfirm={handleDeleteAllConfirm}
        onClose={closeDeleteAllModal}
      />

      {/* Centered Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}