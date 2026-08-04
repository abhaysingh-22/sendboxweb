-- 1. Add delivery columns and yearly recurrence column
ALTER TABLE records
ADD COLUMN whatsapp_message_id TEXT,
ADD COLUMN sent_at TIMESTAMPTZ,
ADD COLUMN error_message TEXT,
ADD COLUMN last_year_sent INTEGER DEFAULT NULL;

-- 2. Add description comment (optional)
COMMENT ON COLUMN records.last_year_sent IS 'Stores the year (e.g. 2026) the yearly message was last sent, initialized as NULL';

-- 3. Create PL/pgSQL function to fetch birthday / pending records cleanly without casting issues
CREATE OR REPLACE FUNCTION get_pending_birthday_records(c_month int, c_day int, c_year int)
RETURNS SETOF records AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM records
  WHERE 
    status = 'Pending'
    OR (
      EXTRACT(month FROM dob) = c_month
      AND EXTRACT(day FROM dob) = c_day
      AND (last_year_sent IS NULL OR last_year_sent < c_year)
    );
END;
$$ LANGUAGE plpgsql;

