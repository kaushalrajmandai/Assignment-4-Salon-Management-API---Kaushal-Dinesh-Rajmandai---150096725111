const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: ws
    }
  }
);

const checkConnection = async () => {
  const { error } = await supabase.from('salons').select('id').limit(1);
  if (error) throw new Error(error.message);
};

module.exports = { supabase, checkConnection };