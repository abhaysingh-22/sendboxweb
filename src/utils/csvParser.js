/**
 * Parse a CSV file with columns: Full Name, Phone Number, DOB (yyyy-mm-dd).
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
    let normalizedDob = '';
    const parsed = new Date(dob);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      normalizedDob = `${yyyy}-${mm}-${dd}`;
    } else {
      // Accept raw if it matches yyyy-mm-dd pattern
      if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        normalizedDob = dob;
      } else {
        errors.push(`Row ${rowNum}: DOB "${dob}" is not a valid date`);
        errorCount++;
        return;
      }
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
