const ApiError = require('./ApiError');

// Converts a Supabase/Postgres error into the right HTTP status.
const unwrap = ({ data, error }, context = 'Database operation') => {
  if (error) {
    let status = 500;

    if (error.code === '23505') status = 409; // unique violation
    else if (error.code === '23503') status = 400; // foreign key violation
    else if (error.code === '22P02') status = 400; // invalid input syntax (bad type/UUID)
    else if (error.code === 'PGRST116') status = 404; // no rows found (maybeSingle mismatch)

    throw new ApiError(status, `${context} failed: ${error.message}`);
  }

  return data;
};

module.exports = { unwrap };