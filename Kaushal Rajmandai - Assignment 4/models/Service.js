const { supabase } = require('../config/supabase');
const { unwrap } = require('../utils/dbError');

const TABLE = 'services';
const COLUMNS = 'id, salon_id, service_name, price, duration, is_available, created_at';

const toApi = (row) =>
  row && {
    id: row.id,
    salonId: row.salon_id,
    serviceName: row.service_name,
    price: row.price,
    duration: row.duration,
    isAvailable: row.is_available,
    createdAt: row.created_at
  };

const findBySalon = async (salonId, { isAvailable } = {}) => {
  let query = supabase.from(TABLE).select(COLUMNS).eq('salon_id', salonId);
  if (isAvailable !== undefined) query = query.eq('is_available', isAvailable);

  const { data, error } = await query.order('created_at', { ascending: false });
  return (unwrap({ data, error }, 'Fetching services') || []).map(toApi);
};

const findAvailable = async ({ city, maxPrice } = {}) => {
  let query = supabase
    .from(TABLE)
    .select(`${COLUMNS}, salons!inner (id, name, city, rating)`)
    .eq('is_available', true);

  if (city) query = query.ilike('salons.city', city);
  if (maxPrice !== undefined) query = query.lte('price', maxPrice);

  const { data, error } = await query.order('price', { ascending: true });

  return (unwrap({ data, error }, 'Fetching available services') || []).map((row) => ({
    ...toApi(row),
    salon: row.salons
      ? { id: row.salons.id, name: row.salons.name, city: row.salons.city, rating: row.salons.rating }
      : null
  }));
};

const findById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select(COLUMNS).eq('id', id).maybeSingle();
  return toApi(unwrap({ data, error }, 'Fetching service'));
};

const create = async (payload) => {
  const { data, error } = await supabase.from(TABLE).insert(payload).select(COLUMNS).single();
  return toApi(unwrap({ data, error }, 'Creating service'));
};

const update = async (id, payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle();

  return toApi(unwrap({ data, error }, 'Updating service'));
};

const remove = async (id) => {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle();

  return toApi(unwrap({ data, error }, 'Deleting service'));
};

const countBySalon = async (salonId) => {
  const { count, error } = await supabase
    .from(TABLE)
    .select('id', { head: true, count: 'exact' })
    .eq('salon_id', salonId);

  if (error) unwrap({ data: null, error }, 'Counting services');
  return count ?? 0;
};

module.exports = { findBySalon, findAvailable, findById, create, update, remove, countBySalon };