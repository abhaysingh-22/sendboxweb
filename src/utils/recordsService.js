import { supabase } from './supabaseClient';

/**
 * Fetch records from the Supabase `records` table with server-side pagination.
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Number of records per page (default 15)
 * @returns {Promise<{ data: Array|null, error: object|null, count: number|null }>}
 */
export async function fetchRecordsPaginated(page = 1, limit = 15) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('records')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data, error, count };
}

/**
 * Fetch all statuses of records from the database to compute global stats.
 * @returns {Promise<{ data: Array|null, error: object|null }>}
 */
export async function fetchStats() {
  const { data, error } = await supabase
    .from('records')
    .select('status');

  return { data, error };
}

/**
 * Check if a phone number already exists in the database.
 * @param {string} phone - The 10-digit phone number.
 * @param {string|null} excludeId - Record ID to exclude (used during editing).
 * @returns {Promise<{ exists: boolean, error: object|null }>}
 */
export async function checkPhoneExists(phone, excludeId = null) {
  let query = supabase
    .from('records')
    .select('id')
    .eq('phone_number', phone);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.maybeSingle();
  return { exists: !!data, error };
}


/**
 * Insert a single record into the Supabase `records` table.
 * @param {{ full_name: string, phone_number?: string, dob?: string }} record
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function insertRecord(record) {
  const { data, error } = await supabase
    .from('records')
    .insert([{
      full_name: record.full_name,
      phone_number: record.phone_number || '',
      dob: record.dob || null,
      status: 'Pending',
    }])
    .select()
    .single();

  return { data, error };
}

/**
 * Bulk insert records (used for CSV upload).
 * @param {Array<{ full_name: string, phone_number?: string, dob?: string }>} records
 * @returns {Promise<{ data: Array|null, error: object|null, count: number }>}
 */
export async function bulkInsertRecords(records) {
  const rows = records.map(r => ({
    full_name: r.full_name,
    phone_number: r.phone_number || '',
    dob: r.dob || null,
    status: 'Pending',
  }));

  const { data, error } = await supabase
    .from('records')
    .insert(rows)
    .select();

  return { data, error, count: data ? data.length : 0 };
}

/**
 * Update an existing record by its UUID.
 * @param {string} id - The UUID of the record to update.
 * @param {{ full_name?: string, phone_number?: string, dob?: string }} updates
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateRecord(id, updates) {
  const payload = {};
  if (updates.full_name !== undefined) payload.full_name = updates.full_name;
  if (updates.phone_number !== undefined) payload.phone_number = updates.phone_number;
  if (updates.dob !== undefined) payload.dob = updates.dob || null;

  const { data, error } = await supabase
    .from('records')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

/**
 * Hard-delete a record by its UUID.
 * @param {string} id - The UUID of the record to delete.
 * @returns {Promise<{ error: object|null }>}
 */
export async function deleteRecord(id) {
  const { error } = await supabase
    .from('records')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * Hard-delete all records from the Supabase `records` table.
 * @returns {Promise<{ error: object|null }>}
 */
export async function deleteAllRecords() {
  const { error } = await supabase
    .from('records')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // match all valid rows

  return { error };
}

