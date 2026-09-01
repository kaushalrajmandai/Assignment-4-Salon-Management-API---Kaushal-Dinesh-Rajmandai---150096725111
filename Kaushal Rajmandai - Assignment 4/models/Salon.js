const { supabase } = require('../config/supabase');
const { unwrap } = require('../utils/dbError');

const TABLE = 'salons';
const COLUMNS = 'id, name, city, address, rating, created_at';

const toApi = (row) =>
  row && {
    id: row.id,
    name: row.name,
    city: row.city,
    address: row.address,
    rating: row.rating,
    createdAt: row.created_at
  };

const findAll = async ({ city, minRating, limit, offset } = {}) => {
  let query = supabase.from(TABLE).select(COLUMNS, { count: 'exact' });

  if (city) query = query.ilike('city', city);
  if (minRating !== undefined) query = query.gte('rating', minRating);

  query = query.order('created_at', { ascending: false });
  if (limit !== undefined) query = query.range(offset || 0, (offset || 0) + limit - 1);

  const { data, error, count } = await query;
  if (error) unwrap({ data, error }, 'Fetching salons');

  return { salons: (data || []).map(toApi), total: count ?? 0 };
};

const findTop = async (limit = 5) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order('rating', { ascending: false })
    .order('name', { ascending: true })
    .limit(limit);

  return (unwrap({ data, error }, 'Fetching top salons') || []).map(toApi);
};

const findByCity = async (city) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .ilike('city', city)
    .order('rating', { ascending: false });

  return (unwrap({ data, error }, 'Fetching salons by city') || []).map(toApi);
};

const findById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select(COLUMNS).eq('id', id).maybeSingle();
  return toApi(unwrap({ data, error }, 'Fetching salon'));
};

const create = async (payload) => {
  const { data, error } = await supabase.from(TABLE).insert(payload).select(COLUMNS).single();
  return toApi(unwrap({ data, error }, 'Creating salon'));
};

const update = async (id, payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle();

  return toApi(unwrap({ data, error }, 'Updating salon'));
};

const remove = async (id) => {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle();

  return toApi(unwrap({ data, error }, 'Deleting salon'));
};

module.exports = { findAll, findTop, findByCity, findById, create, update, remove };