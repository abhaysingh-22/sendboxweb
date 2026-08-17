/**
 * Checks if a given year, month, day form a valid calendar date.
 */
function isValidDate(year, month, day) {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

/**
 * Normalizes any DOB input string into 'YYYY-MM-DD'.
 * Prioritizes DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (days 1-31, months 1-12),
 * as well as YYYY-MM-DD / YYYY/MM/DD formats.
 */
function normalizeDOB(str) {
  if (!str) return null;
  const clean = str.trim();

  // 1. Match YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
  const ymdMatch = clean.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (isValidDate(year, month, day)) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 2. Match DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (e.g. 15/3/1969, 8/6/1970)
  const dmyMatch = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (isValidDate(year, month, day)) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 3. Fallback to native Date parsing (e.g. "15 Mar 1969")
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

/**
 * Parse a CSV file with columns: Full Name, Phone Number, DOB (yyyy-mm-dd or dd/mm/yyyy).
 * Validates:
 *   1. No field may be empty
 *   2. Phone number must be exactly 10 digits
 *   3. No duplicate phone numbers within the CSV
 *
 * @param {string} text - The raw CSV string content.
 * @returns {{ records: Array, successCount: number, errorCount: number, errors: string[] }}
 */
export function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) {
    return { records: [], successCount: 0, errorCount: 0, errors: [] };
  }

  // Parse a single CSV line (handles commas inside quotes)
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const firstRow = parseLine(lines[0]);

  // Detect if first row is a header
  const headerIndicators = ['name', 'phone', 'number', 'dob', 'birth', 'date'];
  const hasHeader = firstRow.some(cell =>
    headerIndicators.some(indicator => cell.toLowerCase().includes(indicator))
  );

  let dataLines = lines;
  let nameIdx = 0;
  let phoneIdx = 1;
  let dobIdx = 2;

  if (hasHeader) {
    dataLines = lines.slice(1);
    const detectedHeaders = firstRow.map(h => h.toLowerCase());

    const foundName = detectedHeaders.findIndex(h => h.includes('name'));
    const foundPhone = detectedHeaders.findIndex(h => h.includes('phone') || h.includes('number'));
    const foundDob = detectedHeaders.findIndex(h => h.includes('dob') || h.includes('birth') || h.includes('date'));

    if (foundName !== -1) nameIdx = foundName;
    if (foundPhone !== -1) phoneIdx = foundPhone;
    if (foundDob !== -1) dobIdx = foundDob;
  }

  const records = [];
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  const seenPhones = new Set();

  dataLines.forEach((line, idx) => {
    const rowNum = hasHeader ? idx + 2 : idx + 1; // 1-based, accounting for header
    const cells = parseLine(line);
    if (cells.length === 0 || (cells.length === 1 && cells[0] === '')) return;

    const fullName = (cells[nameIdx] || '').trim();
    const phoneNumber = (cells[phoneIdx] || '').trim();
    const dob = (cells[dobIdx] || '').trim();

    // ── Validation 1: No field should be empty ──
    if (!fullName) {
      errors.push(`Row ${rowNum}: Full Name is empty`);
      errorCount++;
      return;
    }
    if (!phoneNumber) {
      errors.push(`Row ${rowNum}: Phone Number is empty`);
      errorCount++;
      return;
    }
    if (!dob) {
      errors.push(`Row ${rowNum}: DOB is empty`);
      errorCount++;
      return;
    }

    // ── Validation 2: Phone number must be exactly 10 digits ──
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      errors.push(`Row ${rowNum}: Phone "${phoneNumber}" is not 10 digits`);
      errorCount++;
      return;
    }

    // ── Validation 3: No duplicate phone numbers within CSV ──
    if (seenPhones.has(digitsOnly)) {
      errors.push(`Row ${rowNum}: Duplicate phone "${phoneNumber}" in CSV`);
      errorCount++;
      return;
    }
    seenPhones.add(digitsOnly);

    // Validate/normalize DOB to yyyy-mm-dd
    const normalizedDob = normalizeDOB(dob);
    if (!normalizedDob) {
      errors.push(`Row ${rowNum}: DOB "${dob}" is not a valid date`);
      errorCount++;
      return;
    }

    records.push({
      full_name: fullName,
      phone_number: digitsOnly,
      dob: normalizedDob,
    });
    successCount++;
  });

  return { records, successCount, errorCount, errors };
}
