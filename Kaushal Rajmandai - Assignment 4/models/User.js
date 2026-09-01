const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');
const { unwrap } = require('../utils/dbError');

const TABLE = 'users';
const SAFE_COLUMNS = 'id, username, email, created_at';
const SALT_ROUNDS = 10;

const toPublic = (row) =>
  row && {
    id: row.id,
    username: row.username,
    email: row.email,
    createdAt: row.created_at
  };

const findByEmail = async (email) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, username, email, password, created_at')
    .eq('email', email)
    .maybeSingle();

  return unwrap({ data, error }, 'Fetching user by email');
};

const findById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select(SAFE_COLUMNS).eq('id', id).maybeSingle();
  return toPublic(unwrap({ data, error }, 'Fetching user by id'));
};

const findByEmailOrUsername = async (email, username) => {
  const [byEmail, byUsername] = await Promise.all([
    supabase.from(TABLE).select('id, username, email').eq('email', email).maybeSingle(),
    supabase.from(TABLE).select('id, username, email').ilike('username', username).maybeSingle()
  ]);

  return (
    unwrap(byEmail, 'Checking for an existing email') ||
    unwrap(byUsername, 'Checking for an existing username')
  );
};

const create = async ({ username, email, password }) => {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ username, email, password: hashed })
    .select(SAFE_COLUMNS)
    .single();

  return toPublic(unwrap({ data, error }, 'Creating user'));
};

const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);

module.exports = { findByEmail, findById, findByEmailOrUsername, create, comparePassword, toPublic };