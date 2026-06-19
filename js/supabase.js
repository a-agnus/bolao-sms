const SUPABASE_URL = "https://kphqncfrzmyxdzqqsqrq.supabase.co/";
const SUPABASE_KEY = "sb_publishable_PY-nXEB-kiInL1yl47GpQA_Fegk9zNt";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Coloque aqui o e-mail da pessoa administradora do bolão
const ADMIN_EMAILS = [
  "eusou.agnus@gmail.com"
];

function ehAdmin(email) {
  return ADMIN_EMAILS.includes(email);
}