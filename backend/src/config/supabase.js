// Cliente do Supabase (SDK), usado para recursos como Storage e
// operações administrativas com a service role key.
//
// Observação: o acesso ao banco de dados em si é feito via Prisma
// (DATABASE_URL / DIRECT_URL). Este client é para a API do Supabase.
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

module.exports = supabase;
