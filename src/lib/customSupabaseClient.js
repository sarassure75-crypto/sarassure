import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vkvreculoijplklylpsz.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdnJlY3Vsb2lqcGxrbHlscHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTk2NzMsImV4cCI6MjA2NTIzNTY3M30.YZcVOv9Rt_6nm8wvn3xvfRANyhXFCR0x-ivd-Y1i7Ys';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
