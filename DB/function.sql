CREATE OR REPLACE FUNCTION get_pending_birthday_records(c_month int, c_day int, c_year int)
RETURNS SETOF records AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM records
  WHERE 
    dob IS NOT NULL
    AND EXTRACT(month FROM dob) = c_month
    AND EXTRACT(day FROM dob) = c_day
    AND (last_year_sent IS NULL OR last_year_sent < c_year);
END;
$$ LANGUAGE plpgsql;

