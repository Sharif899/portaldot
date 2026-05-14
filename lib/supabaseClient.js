import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://owqgfinzprlofvirutom.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWdmaW56cHJsb2Z2aXJ1dG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MTMwNjEsImV4cCI6MjA5NDI4OTA2MX0.oVg101PchX0gVMD2XuknOLXAbDYsVKrZ1rLxJhk1RAI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
