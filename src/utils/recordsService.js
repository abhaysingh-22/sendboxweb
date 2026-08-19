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
 * Fetch all stats of records from the database to compute global stats accurately.
 * Uses PostgREST exact counts (head: true) to avoid row-fetching limits (default 1000 limit).
 * @returns {Promise<{ data: { total: number, sent: number, pending: number }|null, error: object|null }>}
 */
export async function fetchStats() {
  try {
    const [totalRes, sentRes, pendingRes] = await Promise.all([
      supabase.from('records').select('*', { count: 'exact', head: true }),
      supabase.from('records').select('*', { count: 'exact', head: true }).eq('status', 'Sent'),
      supabase.from('records').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    ]);

    if (totalRes.error) {
      return { data: null, error: totalRes.error };
    }

    const total = totalRes.count ?? 0;
    const sent = sentRes.count ?? 0;
    const pending = pendingRes.count ?? (total - sent);

    return {
      data: {
        total,
        sent,
        pending,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Fetch all existing phone numbers across all pages to bypass the 1000-row PostgREST limit.
 * @returns {Promise<{ data: string[]|null, error: object|null }>}
 */
export async function fetchAllPhoneNumbers() {
  let allPhones = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('records')
      .select('phone_number')
      .range(from, from + step - 1);

    if (error) {
      return { data: null, error };
    }

    if (data && data.length > 0) {
      for (const r of data) {
        if (r.phone_number) allPhones.push(r.phone_number);
      }
      if (data.length < step) {
        hasMore = false;
      } else {
        from += step;
      }
    } else {
      hasMore = false;
    }
  }

  return { data: allPhones, error: null };
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
 * Bulk insert records (used for CSV upload) in batches to avoid payload and response limits.
 * @param {Array<{ full_name: string, phone_number?: string, dob?: string }>} records
 * @param {number} [batchSize=500]
 * @returns {Promise<{ data: Array|null, error: object|null, count: number }>}
 */
export async function bulkInsertRecords(records, batchSize = 500) {
  const rows = records.map(r => ({
    full_name: r.full_name,
    phone_number: r.phone_number || '',
    dob: r.dob || null,
    status: 'Pending',
  }));

  let insertedCount = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from('records')
      .insert(batch);

    if (error) {
      return { data: null, error, count: insertedCount };
    }
    insertedCount += batch.length;
  }

  return { data: null, error: null, count: insertedCount };
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

